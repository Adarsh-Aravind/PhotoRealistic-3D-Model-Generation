# 🎨 Photorealistic 3D Model Generation

![Project Banner](https://img.shields.io/badge/Status-Complete-green) ![Tech](https://img.shields.io/badge/Tech-Next.js%20%7C%20Three.js%20%7C%20Python%20%7C%20PyTorch-blue)

AI-powered web application that generates 3D models and textures from text prompts or video inputs. It brings the power of generative AI (OpenAI Shap-E & Stable Diffusion) directly to your browser for real-time interaction.

## ✨ Key Features

*   **📝 Text-to-3D**: Type a prompt (e.g., "A golden trophy") and generate a 3D mesh in seconds.
*   **📹 Video-to-3D**: Upload a video file to extract an object and convert it into a 3D model.
*   **🎨 AI Texturing**: Apply realistic PBR materials to any model using Stable Diffusion (Text-to-Texture).
*   **⚡ Real-Time Editor**: Adjust material properties (Roughness, Metalness) instantly in the 3D viewer.
*   **🏠 Local Execution**: Runs entirely on your machine using your GPU (No cloud API costs!).

## 🚀 Quick Start

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

2.  **Frontend (Next.js)**
    ```bash
    npm install
    npm run dev
    ```

3.  **Open App**: Go to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Zustand.
*   **3D Engine**: Three.js, React Three Fiber.
*   **Backend**: FastAPI, Uvicorn.
*   **AI Models**:
    *   **Shap-E** (OpneAI): For 3D Mesh Generation.
    *   **Stable Diffusion v1.5**: For Texture Generation.
    *   **OpenCV**: For Video Frame Extraction.

## 📄 Documentation
For a deep dive into the architecture and design decisions (Speed vs. Quality), check out [PROJECT_DETAILS.md](./PROJECT_DETAILS.md).

---
*Created by Adarsh Aravind*
