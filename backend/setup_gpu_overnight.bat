@echo off
echo Starting GPU Setup for VibeCode (CUDA 12.8 / RTX 5070 Blackwell + Python 3.10)
echo Warning: This will comprehensively download ~2.8GB of PyTorch libraries. Please be patient.

C:\Users\adars\AppData\Local\Microsoft\WindowsApps\python.exe -m venv venv310
call venv310\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing other requirements...
pip install -r requirements.txt

echo ----------------------------------------------------
echo Downloading PyTorch Nightly build for RTX 5070...
echo ----------------------------------------------------
python download_pytorch_nightly.py

echo Installing the massive PyTorch wheel...
pip install torch-nightly-cu128.whl torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128
echo Done! Please remember to change "device = torch.device('cpu')" to "device = torch.device('cuda')" in server.py!

pause
