@echo off
echo Starting VibeCode AI Backend Server (Enforced Python 3.10)
echo ========================================================

if not exist venv310 (
    echo [ERROR] Virtual environment venv310 not found! Please run setup_gpu_overnight.bat first.
    pause
    exit /b 1
)

call venv310\Scripts\activate.bat
echo Starting FastAPI server with Uvicorn...
venv310\Scripts\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8000
pause
