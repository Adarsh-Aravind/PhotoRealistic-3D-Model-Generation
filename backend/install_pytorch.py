import os
import sys
import re
import urllib.request
import subprocess

def get_python_tag():
    return f"cp{sys.version_info.major}{sys.version_info.minor}"

def get_latest_torch_nightly_url(python_tag):
    url = 'https://download.pytorch.org/whl/nightly/cu128/torch/'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching torch links: {e}")
        return None, None
        
    links = re.findall(r'href=[\'\"]?([^\'\" >]+)', html)
    # Filter for the appropriate python tag and windows
    compatible_links = [l for l in links if python_tag in l and 'win_amd64' in l and 'cp314t' not in l] # Avoid free-threaded 't' variant if possible
    
    if not compatible_links:
        print(f"Could not find a PyTorch nightly wheel for {python_tag} on Windows.")
        return None, None
        
    # Get the latest one
    latest_link = compatible_links[-1]
    
    # Handle relative or absolute URLs
    if not latest_link.startswith('http'):
        if latest_link.startswith('/'):
            # It's an absolute path on a different domain? Usually not the case
            latest_url = f"https://download.pytorch.org{latest_link}"
        else:
            # It's relative
            latest_url = f"https://download.pytorch.org/whl/nightly/cu128/torch/{latest_link}"
    else:
        latest_url = latest_link
        
    # the unquoted filename
    filename = latest_url.split('/')[-1]
    filename = urllib.parse.unquote(filename)
    
    return latest_url, filename

def download_file_with_resume(url, filename):
    headers = {'User-Agent': 'Mozilla/5.0'}
    if os.path.exists(filename):
        downloaded = os.path.getsize(filename)
        headers["Range"] = f"bytes={downloaded}-"
        print(f"Resuming download from byte {downloaded}...")
    else:
        downloaded = 0
        print("Starting new download...")

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as response:
            total_size = int(response.headers.get('content-length', 0)) + downloaded
            print(f"Total file size: {total_size / (1024*1024):.2f} MB")
            
            mode = "ab" if downloaded > 0 else "wb"
            with open(filename, mode) as f:
                while True:
                    chunk = response.read(1024*1024)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    print(f"\rProgress: {downloaded / (1024*1024):.2f} MB / {total_size / (1024*1024):.2f} MB ({(downloaded/total_size)*100:.1f}%)", end="")
            
        print("\nDownload finished successfully!")
        return True
    except urllib.error.HTTPError as e:
        if e.code == 416:
            print("Download already complete!")
            return True
        print(f"\nHTTP Error: {e.code}")
        return False
    except Exception as e:
        print(f"\nDownload interrupted: {e}")
        return False

if __name__ == "__main__":
    print(f"Detected Python {sys.version_info.major}.{sys.version_info.minor}")
    python_tag = get_python_tag()
    
    print(f"Looking for latest PyTorch nightly for {python_tag}...")
    url, filename = get_latest_torch_nightly_url(python_tag)
    
    if not url:
        sys.exit(1)
        
    print(f"Found: {filename}")
    
    success = False
    while not success:
        success = download_file_with_resume(url, filename)
        if not success:
            print("Retrying download in 5 seconds...")
            import time
            time.sleep(5)
            
    print("\nInstalling PyTorch wheel...")
    
    # We explicitly use sys.executable to ensure we install into the current environment
    cmd = [
        sys.executable, "-m", "pip", "install", filename, 
        "torchvision", "torchaudio", 
        "--index-url", "https://download.pytorch.org/whl/nightly/cu128"
    ]
    
    print(f"Running: {' '.join(cmd)}")
    
    result = subprocess.run(cmd)
    if result.returncode == 0:
        print("\nPyTorch installed successfully!")
        print("Please remember to change 'device = torch.device(\"cpu\")' to 'device = torch.device(\"cuda\")' in server.py!")
    else:
        print("\nInstallation failed. Please check the logs.")
        sys.exit(1)
