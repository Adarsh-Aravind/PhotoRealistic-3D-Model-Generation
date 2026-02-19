# 🎓 AI 3D Generation Project - Team Guide

**Project Name:** Vibecode (Photorealistic 3D Model Generation & Editing)
**Overview:** A web application that uses Artificial Intelligence to generate 3D models from text prompts, images, or video frames, and allows real-time material editing.

---

## 🛑 System Requirements (CRITICAL)

To run this project, **you need a powerful computer**:
*   **GPU (Graphics Card)**: NVIDIA RTX 3060 or better recommended (Min 6GB VRAM). 
    *   *Note: Without an NVIDIA GPU, the AI generation will be extremely slow or might crash.*
*   **RAM**: 16GB minimum.
*   **OS**: Windows 10/11 (Preferred for CUDA support).
*   **Software**: 
    *   [Node.js (v18+)](https://nodejs.org/)
    *   [Python (v3.10)](https://www.python.org/downloads/release/python-31011/) - **Must be 3.10** for compatibility.
    *   [Git](https://git-scm.com/)

---

## 🛠️ Installation Guide

Follow these steps exactly to set up the project on a new machine.

### 1. Clone the Project
```bash
git clone <your-repo-url>
cd MainProject-vibecode
```

### 2. Backend Setup (The AI Part)
The backend runs the Python AI models.

1.  Open a terminal in the `backend/` folder:
    ```powershell
    cd backend
    ```

2.  **Create a Virtual Environment** (Keeps dependencies isolated):
    ```powershell
    py -3.10 -m venv venv
    ```

3.  **Activate the Environment**:
    ```powershell
    # Windows PowerShell
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass  # (Only if permission error)
    .\venv\Scripts\activate
    ```
    *(You should see `(venv)` at the start of your terminal line)*

4.  **Install Dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```

5.  **Install PyTorch with CUDA Support** (Crucial for GPU):
    *   **For RTX 30xx/40xx (CUDA 11.8)**:
        ```powershell
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
        ```
    *   **For RTX 50xx (CUDA 12.4 - New Cards)**:
        ```powershell
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
        ```

### 3. Frontend Setup (The Website)
The frontend is the user interface.

1.  Open a **new terminal** in the main project folder (where `package.json` is).
2.  Install libraries:
    ```bash
    npm install
    ```

---

## 🚀 How to Run the Project

You need **TWO** terminals open at the same time.

### Terminal 1: Backend Server (Python)
```powershell
cd backend
.\venv\Scripts\activate
python server.py
```
*Wait until you see:* `INFO: Uvicorn running on http://127.0.0.1:8000` and `GPU Available: True`.

### Terminal 2: Frontend Website (Next.js)
```powershell
npm run dev
```
*Wait until you see:* `Ready in ... ms`.

**Now open your browser to:** [http://localhost:3000](http://localhost:3000)

---

## ✨ Features & How to Demonstrate

### 1. Text-to-3D
*   **Tab**: "Generation"
*   **Action**: Type a prompt like "A wooden chair" and click Generate.
*   **Wait**: ~15-30 seconds.
*   **Result**: A 3D model appears.

### 2. Image-to-3D
*   **Tab**: "Generation"
*   **Action**: Drag & drop an image (JPG/PNG) into the upload box.
*   **Result**: The AI converts the image into a 3D mesh.

### 3. Video-to-3D (Smart Feature) 🎥
*   **Tab**: "Generation"
*   **Action**: Drag a video file (`.mp4`) into the box.
*   **Magic**: The app automatically extracts a clear frame from the video and turns it into 3D.

### 4. AI Texture Editing
*   **Tab**: "Material" (Sidebar)
*   **Action**: Type a texture prompt like "Rusty metal" or "Blue neon scales".
*   **Result**: The texture is generated and wrapped around the model.

### 5. Manual Material Tweaks
*   Use the sliders (Roughness, Metalness) and Color Picker to adjust the look instantly.

---

## ⚠️ Troubleshooting

**"Failed to fetch" Error:**
*   The Backend is not running! checking if Terminal 1 is active.

**"CUDA not available" / Slow generation:**
*   You installed the CPU version of PyTorch. Re-run the CUDA installation command in Section 2.5.

**"Out of Memory" (OOM):**
*   Your GPU ran out of VRAM. Restart `python server.py` to clear memory.

---

**Good Luck with the Presentation!** 🎓
