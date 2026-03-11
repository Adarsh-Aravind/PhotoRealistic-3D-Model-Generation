# Photorealistic 3D Model Generation

![Project Banner](https://img.shields.io/badge/Status-Complete-green) ![Tech](https://img.shields.io/badge/Tech-Next.js%20%7C%20Three.js%20%7C%20Python%20%7C%20PyTorch-blue)

An AI-powered web application that generates 3D models and textures from text prompts or video inputs. It integrates generative AI models (OpenAI Shap-E and Stable Diffusion) directly into a browser-based interface for real-time interaction and editing.

## Key Features

*   **Text-to-3D Integration**: Rapidly generate a 3D mesh from descriptive text prompts (e.g., "A golden trophy").
*   **Video-to-3D Extraction**: Upload a video file to autonomously extract an object and convert it into a 3D model.
*   **AI-Driven Texturing**: Apply realistic PBR (Physically Based Rendering) materials to any model using a Text-to-Texture Stable Diffusion pipeline.
*   **Real-Time Material Editor**: Adjust physical material properties such as Roughness and Metalness instantly within the WebGL 3D viewer.
*   **Local GPU Execution**: Designed to run entirely on local consumer hardware, eliminating cloud API dependencies and latency.

## Quick Start

### Prerequisites
*   **NVIDIA GPU** (RTX 3060 or higher recommended, optimized for RTX 5070).
*   **Python 3.10+** & **Node.js 18+**.

### Installation
> **Detailed Instructions**: See [INSTALL.md](./INSTALL.md) for step-by-step setup.

1.  **Backend (Python)**
    ```bash
    cd backend
    
    # Option 1: Automated Setup (for Windows / RTX GPUs)
    setup_gpu_overnight.bat
    
    # Option 2: Manual Setup
    # python -m venv venv310
    # .\venv310\Scripts\activate
    # pip install -r requirements.txt
    # (See INSTALL.md for PyTorch Nightly command)
    
    .\venv310\Scripts\activate
    python server.py
    ```

2.  **Frontend (Web Portal)**
    ```bash
    cd Frontend
    
    # Run the dedicated cache-busting web server
    run_frontend.bat
    ```

3.  **Open App**: Go to [http://localhost:3000](http://localhost:3000)

## Process Management

If the application fails to bind to the required ports (e.g., "Address already in use"), or if the AI models hang during background processing, you may need to force-stop the Python processes. Execute the following command in an Administrator Command Prompt or PowerShell session:

```powershell
taskkill /F /IM python.exe /T
```

*   `/F`: Forcefully terminates the process.
*   `/IM python.exe`: Targets any process named `python.exe` (like the FastAPI backend server).
*   `/T`: Terminates all child processes spawned by the main script (kills PyTorch workers and subprocesses).

Run this command when a clean state is required before restarting the backend server.

## Technology Stack

*   **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Zustand.
*   **3D Engine**: Three.js, React Three Fiber.
*   **Backend**: FastAPI, Uvicorn.
*   **AI Models**:
    *   **Shap-E** (OpneAI): For 3D Mesh Generation.
    *   **Stable Diffusion v1.5**: For Texture Generation.
    *   **OpenCV**: For Video Frame Extraction.

## Documentation
For a detailed analysis of the system architecture, performance trade-offs, and rendering pipelines, please refer to [PROJECT_DETAILS.md](./PROJECT_DETAILS.md).

---
*Developed by Adarsh Aravind*
