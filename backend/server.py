import os
import torch
import numpy as np
import trimesh
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from diffusers import ShapEPipeline, ShapEImg2ImgPipeline, StableDiffusionPipeline
import uuid
from PIL import Image
import io

def export_to_glb(mesh, path):
    try:
        # Shap-E mesh output usually has .verts and .faces
        # depending on version it might be different, but typically:
        if hasattr(mesh, 'verts') and hasattr(mesh, 'faces'):
            # It's a Shap-E mesh object
            t_mesh = trimesh.Trimesh(vertices=mesh.verts.cpu().numpy(), faces=mesh.faces.cpu().numpy())
            t_mesh.export(path, file_type='glb')
        else:
            # Fallback or strict check
            raise ValueError("Unknown mesh format")
    except Exception as e:
        print(f"Export failed: {e}")
        raise e

app = FastAPI()

# CORS settings to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Output directory
OUTPUT_DIR = "generated_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Global model placeholders
shape_pipeline = None
shape_img_pipeline = None
texture_pipeline = None

def get_shape_pipeline():
    global shape_pipeline
    if shape_pipeline is None:
        print("Loading Shap-E Text-to-3D Pipeline...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        shape_pipeline = ShapEPipeline.from_pretrained(
            "openai/shap-e", 
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            # variant="fp16" is not available for shap-e
        ).to(device)
    return shape_pipeline

def get_shape_img_pipeline():
    global shape_img_pipeline
    if shape_img_pipeline is None:
        print("Loading Shap-E Image-to-3D Pipeline...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        shape_img_pipeline = ShapEImg2ImgPipeline.from_pretrained(
            "openai/shap-e-img2img", 
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            # variant="fp16" is not available usually
        ).to(device)
    return shape_img_pipeline

def get_texture_pipeline():
    global texture_pipeline
    if texture_pipeline is None:
        print("Loading Texture Pipeline (Stable Diffusion)...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        # Switching to v1-5 as it is often more reliable installation-wise
        texture_pipeline = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            variant="fp16" if device == "cuda" else None
        ).to(device)
    return texture_pipeline

class PromptRequest(BaseModel):
    prompt: str

@app.get("/")
def health_check():
    return {"status": "running", "gpu": torch.cuda.is_available()}

@app.post("/generate/text-to-3d")
async def generate_3d(request: PromptRequest):
    try:
        pipe = get_shape_pipeline()
        
        print(f"Generating 3D model for: {request.prompt}")
        images = pipe(
            request.prompt, 
            num_inference_steps=64, 
            frame_size=256, 
            output_type="mesh"
        ).images
        
        filename = f"{uuid.uuid4()}.glb"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        export_to_glb(images[0], filepath)
        return FileResponse(filepath, media_type="model/gltf-binary", filename=filename)
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/image-to-3d")
async def generate_3d_from_image(file: UploadFile = File(...)):
    try:
        pipe = get_shape_img_pipeline()
        
        print(f"Generating 3D model from image: {file.filename}")
        
        # Read image
        contents = await file.read()
        print(f"Received file size: {len(contents)} bytes")
        
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception as img_err:
            print(f"PIL Error: {img_err}")
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(img_err)}")
        
        # Resize to standard size for Shap-E usually good practice
        image = image.resize((256, 256))

        images = pipe(
            image, 
            num_inference_steps=64, 
            frame_size=256, 
            output_type="mesh"
        ).images
        
        filename = f"{uuid.uuid4()}.glb"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        export_to_glb(images[0], filepath)
        return FileResponse(filepath, media_type="model/gltf-binary", filename=filename)
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/texture")
async def generate_texture(request: PromptRequest):
    try:
        pipe = get_texture_pipeline()
        
        print(f"Generating texture for: {request.prompt}")
        prompt = f"seamless texture of {request.prompt}, high resolution, detailed, flat lighting"
        
        image = pipe(prompt, num_inference_steps=25).images[0]
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        image.save(filepath)
        
        return FileResponse(filepath, media_type="image/png")
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting server... GPU Available:", torch.cuda.is_available())
    uvicorn.run(app, host="127.0.0.1", port=8000)
