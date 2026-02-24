# 📚 Project: Technical Documentation

## 1. Project Overview
**What is this?**
A web-based platform that allows users to generate 3D models from **Text** or **Images/Videos** using AI. It runs locally on your machine (GPU powered) to provide near-instant feedback, suitable for live demonstrations.

**Key Features:**
*   **Text-to-3D**: Type "A futuristic spaceship" -> Get a 3D model.
*   **Video-to-3D**: Upload a video of an object -> Get a 3D representation.
*   **AI Texturing**: Apply realistic textures using "Stable Diffusion" onto imported models.
*   **Real-time Editor**: Change materials (Roughness, Metalness) instantly.

---

## 2. Technical Architecture

The project follows a **Client-Server** architecture:

### A. Frontend (The Website)
*   **Framework**: Next.js 15 (React 19) + TypeScript.
*   **Styling**: Tailwind CSS v4 (Modern, utility-first).
*   **3D Engine**: Three.js + React Three Fiber (`@react-three/fiber`).
    *   This allows us to render 3D models directly in the browser using WebGL.
*   **State Management**: Zustand (Lightweight store for managing UI state).

### B. Backend (The Brain)
*   **Framework**: FastAPI (Python).
    *   Chosen for its speed and native async support.
*   **AI Models**:
    *   **Shap-E (OpenAI)**: Generates 3D meshes (implicit functions) from text or images.
        *   *Why Shap-E?* It's fast (10-15s) compared to other methods (DreamFusion takes 45m).
    *   **Stable Diffusion (v1.5)**: Generates seamless textures for materials.
*   **GPU Setup**: Uses PyTorch with CUDA acceleration (optimized for RTX 5070).

---

## 3. How "Video-to-3D" Works (The Magic) ✨

You might wonder: *"How does it turn a video into a 3D model in 10 seconds?"*

1.  **Frame Extraction**:
    - The browser (Frontend) loads your video file locally.
    - It seeks to a timestamp (0.5s) where the object is likely visible.
    - It grabs a high-quality **Screenshot (Frame)** of that moment.

2.  **Hardware Acceleration**:
    - We use the browser's GPU decoder to render the video frame instantly.
    - This is why enabling "Hardware Acceleration" in Chrome/Edge is crucial.

3.  **AI Inference**:
    - The extracted image is sent to the Python Backend (`/generate/image-to-3d`).
    - **Shap-E** analyzes the 2D image and "hallucinates" the 3D geometry (depth, volume) based on millions of training examples.
    - It outputs a `.glb` (3D file) which is sent back to the browser.

---

## 4. Design Decisions (Speed vs Quality)

**Why does the model sometimes look "low poly" or "blobby"?**

We made a conscious engineering trade-off: **Latency > Fidelity**.

*   **Option A (High Quality)**: Use NeRF (Neural Radiance Fields).
    *   *Pros*: Photo-realistic.
    *   *Cons*: Takes 45+ minutes per object. Impossible for a live demo.
    *   *Requires*: Server farm or multi-GPU setup.

*   **Option B (Our Choice)**: Use Shap-E (Implicit Functions).
    *   *Pros*: Generates in **10-15 seconds**. Runs on a single consumer GPU (RTX 5070).
    *   *Cons*: Lower polygon count; struggles with complex organic shapes.
    *   *Verdict*: Perfect for a college presentation where "dead air" (waiting) is bad.

---

## 5. Technology Stack Summary

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js, React, TypeScript | User Interface & State |
| **Styling** | Tailwind CSS | Visual Design |
| **3D Rendering** | Three.js, React Three Fiber | Displaying Models |
| **Backend API** | FastAPI | Python Server |
| **AI (3D)** | OpenAI Shap-E | Generating Meshes |
| **AI (Texture)** | Stable Diffusion | Generating Materials |
| **Compute** | PyTorch + CUDA | GPU Acceleration |

---

## 6. Future Improvements

If we had more time/resources, we would:
1.  **Implement Gaussian Splatting**: A newer technique that offers real-time rendering of high-quality scenes (best of both worlds).
2.  **Cloud Deployment**: Host the heavy backend on AWS/GCP with A100 GPUs so the user doesn't need a powerful laptop.
3.  **Multi-View Refinement**: Use 4-5 frames from the video instead of 1 to improve the 3D accuracy.
