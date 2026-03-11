import os
import io
import uuid
import torch
import trimesh
import numpy as np
from typing import List, Optional
from PIL import Image
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rembg import remove, new_session

# Shap-E imports
from shap_e.diffusion.sample import sample_latents
from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
from shap_e.models.download import load_model, load_config
from shap_e.util.notebooks import decode_latent_mesh

# Diffusers imports for stable diffusion
from diffusers import AutoPipelineForText2Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = "generated_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Set PyTorch to utilize the RTX 5070 Blackwell via nightly wheel
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

rembg_session = new_session("u2net")

# ===============================
# LAZY LOAD MODELS TO SAVE MEMORY
# ===============================
models = {}

def get_shap_e_models():
    if "shap_e_text" not in models:
        print("Loading Shap-E models...")
        models["shap_e_xm"] = load_model('transmitter', device=device)
        models["shap_e_text"] = load_model('text300M', device=device)
        models["shap_e_image"] = load_model('image300M', device=device)
        models["shap_e_diffusion"] = diffusion_from_config(load_config('diffusion'))
        print("Shap-E models loaded.")
    return models["shap_e_xm"], models["shap_e_text"], models["shap_e_image"], models["shap_e_diffusion"]

def get_sd_pipeline():
    if "sd_pipe" not in models:
        print("Loading Stable Diffusion...")
        # using a fast small model or standard 1.5
        pipe = AutoPipelineForText2Image.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
        pipe = pipe.to(device)
        models["sd_pipe"] = pipe
        print("Stable Diffusion loaded.")
    return models["sd_pipe"]


def export_to_glb(shap_mesh, path):
    verts = shap_mesh.verts
    faces = shap_mesh.faces
    
    colors = None
    if "R" in shap_mesh.vertex_channels and "G" in shap_mesh.vertex_channels and "B" in shap_mesh.vertex_channels:
        r = np.array(shap_mesh.vertex_channels["R"])
        g = np.array(shap_mesh.vertex_channels["G"])
        b = np.array(shap_mesh.vertex_channels["B"])
        colors = np.stack([r, g, b], axis=1)
        colors = np.clip(colors * 255.0, 0, 255).astype(np.uint8)

    t_mesh = trimesh.Trimesh(
        vertices=verts,
        faces=faces,
        vertex_colors=colors
    )
    t_mesh.export(path, file_type="glb")

class TextPrompt(BaseModel):
    prompt: str

@app.get("/")
def health():
    return {"status": "running", "gpu": torch.cuda.is_available()}

@app.post("/generate/text-to-3d")
async def generate_text_to_3d(data: TextPrompt):
    prompt = data.prompt
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    try:
        xm, text_model, _, diffusion = get_shap_e_models()
        
        print(f"Generating 3D for text: {prompt}")
        batch_size = 1
        guidance_scale = 15.0
        
        latents = sample_latents(
            batch_size=batch_size,
            model=text_model,
            diffusion=diffusion,
            guidance_scale=guidance_scale,
            model_kwargs=dict(texts=[prompt] * batch_size),
            progress=True,
            clip_denoised=True,
            use_fp16=True,
            use_karras=True,
            karras_steps=64,
            sigma_min=1e-3,
            sigma_max=160,
            s_churn=0,
        )
        
        mesh = decode_latent_mesh(xm, latents[0]).tri_mesh()
        
        filename = f"{uuid.uuid4()}.glb"
        filepath = os.path.join(OUTPUT_DIR, filename)
        export_to_glb(mesh, filepath)
        
        return FileResponse(filepath, media_type="model/gltf-binary", filename=filename)
        
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/image-to-3d")
async def generate_image_to_3d(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
            
        img = Image.open(io.BytesIO(contents)).convert("RGBA")
        img = remove(img, session=rembg_session)
        img = img.convert("RGB")
        
        xm, _, image_model, diffusion = get_shap_e_models()
        
        print(f"Generating 3D from image...")
        batch_size = 1
        guidance_scale = 3.0
        
        latents = sample_latents(
            batch_size=batch_size,
            model=image_model,
            diffusion=diffusion,
            guidance_scale=guidance_scale,
            model_kwargs=dict(images=[img] * batch_size),
            progress=True,
            clip_denoised=True,
            use_fp16=True,
            use_karras=True,
            karras_steps=64,
            sigma_min=1e-3,
            sigma_max=160,
            s_churn=0,
        )
        
        mesh = decode_latent_mesh(xm, latents[0]).tri_mesh()
        
        filename = f"{uuid.uuid4()}.glb"
        filepath = os.path.join(OUTPUT_DIR, filename)
        export_to_glb(mesh, filepath)
        
        return FileResponse(filepath, media_type="model/gltf-binary", filename=filename)
        
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/texture")
async def generate_texture(data: TextPrompt):
    prompt = data.prompt
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
        
    try:
        pipe = get_sd_pipeline()
        print(f"Generating texture for: {prompt}")
        
        image = pipe(
            prompt=f"seamless texture, {prompt}, highly detailed, 4k",
            negative_prompt="blurry, lowres, ugly",
            num_inference_steps=20,
            guidance_scale=7.5
        ).images[0]
        
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        
        return Response(content=buf.getvalue(), media_type="image/png")
        
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting server... GPU Available:", torch.cuda.is_available())
    uvicorn.run(app, host="127.0.0.1", port=8000)