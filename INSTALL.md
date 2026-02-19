# 🚀 Project Installation Guide

## Prerequisites

Before starting, ensure you have the following installed:
1.  **Python 3.10+**: [Download Here](https://www.python.org/downloads/)
    *   *Important*: Check "Add Python to PATH" during installation.
2.  **Node.js (LTS Version)**: [Download Here](https://nodejs.org/)
3.  **Git**: [Download Here](https://git-scm.com/downloads)
4.  **NVIDIA Drivers**: Latest drivers for your RTX 5070.

---

## 1. Backend Setup (The "Brain") 🧠

The backend runs the AI models (Shap-E & Stable Diffusion). It requires a specific PyTorch version for your RTX 5070.

### A. Create Environment
Open a terminal (Command Prompt or PowerShell) in the `backend` folder:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```
*(You should see `(venv)` at the start of your line)*.

### B. Install Dependencies (Crucial Step!) ⚠️
Since you have an **RTX 5070**, standard PyTorch might fail. You must install the **Nightly** build:

1.  **Install PyTorch Nightly**:
    ```powershell
    pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
    ```
    *(Note: If `cu128` fails, try `cu126` or check PyTorch website for the latest nightly cuda version).*

2.  **Install Other Libraries**:
    ```powershell
    pip install fastapi "uvicorn[standard]" python-multipart numpy pillow trimesh diffusers transformers accelerate scipy opencv-python-headless
    ```

3.  **Verify Setup**:
    Run the server to check if GPU is detected:
    ```powershell
    python server.py
    ```
    *   **Success**: You see `Running on http://127.0.0.1:8000` and `GPU Available: True`.
    *   **Wait**: The first run will download ~5GB of models. This takes time!

---

## 2. Frontend Setup (The Website) 🌐

The frontend provides the user interface to interact with the AI.

### A. Install Packages
Open a **new** terminal in the main project folder (where `package.json` is):
```powershell
cd D:\Programming\Projects\MainProject-vibecode
npm install
```

### B. Start the Server
```powershell
npm run dev
```
*   **Success**: You see `Ready in ... ms`.
*   **Access**: Open your browser to `http://localhost:3000`.

---

## 3. How to Run (Daily Usage)

You need **two terminals** open side-by-side:

**Terminal 1 (Backend):**
```powershell
cd backend
.\venv\Scripts\activate
python server.py
```

**Terminal 2 (Frontend):**
```powershell
npm run dev
```

---

## Troubleshooting

### "Address already in use" Error
If the server says Port 8000 or 3000 is busy:
1.  Open cmd as Admin.
2.  Run: `taskkill /F /IM python.exe` (kills backend).
3.  Run: `taskkill /F /IM node.exe` (kills frontend).

### "Video Extraction Failed"
If uploading a video fails:
1.  Ensure your browser has **Hardware Acceleration** enabled.
2.  Try dragging a **Screenshot** of the video instead (Reliability: 100%).

### "Model looks like a blob/cube"
1.  The AI (Shap-E) prioritizes speed (10s generation) over high fidelity.
2.  Use simple, clear prompts ("A red chair") and high-contrast videos for best results.
