import os
import requests
import sys

URL = "https://download.pytorch.org/whl/nightly/cu128/torch-2.12.0.dev20260302%2Bcu128-cp310-cp310-win_amd64.whl"
FILENAME = "torch-nightly-cu128.whl"

def download_file_with_resume(url, filename):
    headers = {}
    if os.path.exists(filename):
        downloaded = os.path.getsize(filename)
        headers["Range"] = f"bytes={downloaded}-"
        print(f"Resuming download from byte {downloaded}...")
    else:
        downloaded = 0
        print("Starting new download...")

    try:
        response = requests.get(url, headers=headers, stream=True, timeout=60)
        
        if response.status_code == 416:
            print("Download already complete!")
            return True
            
        if response.status_code not in [200, 206]:
            print(f"Error: Server returned status code {response.status_code}")
            return False

        mode = "ab" if downloaded > 0 else "wb"
        total_size = int(response.headers.get('content-length', 0)) + downloaded
        print(f"Total file size: {total_size / (1024*1024):.2f} MB")

        with open(filename, mode) as f:
            for chunk in response.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    print(f"\rProgress: {downloaded / (1024*1024):.2f} MB / {total_size / (1024*1024):.2f} MB ({(downloaded/total_size)*100:.1f}%)", end="")
        
        print("\nDownload finished successfully!")
        return True
    except Exception as e:
        print(f"\nDownload interrupted: {e}")
        return False

if __name__ == "__main__":
    success = False
    while not success:
        success = download_file_with_resume(URL, FILENAME)
        if not success:
            print("Retrying in 5 seconds...")
            import time
            time.sleep(5)
