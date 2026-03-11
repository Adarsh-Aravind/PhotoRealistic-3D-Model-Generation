@echo off
echo Starting GPU Setup for VibeCode (CUDA 12.8 / RTX 5070 Blackwell + Python 3.10 Auto-Detect)
echo Warning: This will comprehensively download ~2.8GB of PyTorch libraries. Please be patient.

if exist venv310 rmdir /s /q venv310
py -3.10 -m venv venv310
call venv310\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing other requirements...
pip install -r requirements.txt

echo ----------------------------------------------------
echo Downloading and Installing PyTorch Nightly build for RTX 5070...
echo ----------------------------------------------------
python install_pytorch.py

pause
