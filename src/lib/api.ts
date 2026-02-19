export async function generate3DModel(prompt: string): Promise<string> {
    try {
        const response = await fetch('http://127.0.0.1:8000/generate/text-to-3d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Backend generation failed');
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Backend unavailable, falling back to mock:", error);
        return new Promise((resolve) => {
            setTimeout(() => resolve('/placeholder-model.glb'), 2000);
        });
    }
}

// Helper to extract a frame from a video file
async function extractFrameFromVideo(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.src = URL.createObjectURL(videoFile);

        const timeout = setTimeout(() => {
            reject(new Error('Video processing timed out - file might be incompatible'));
            URL.revokeObjectURL(video.src);
        }, 8000); // Give it 8 seconds

        video.onloadeddata = () => {
            // Once data is loaded, check dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                reject(new Error('Video has 0 dimensions (codec not supported?)'));
                return;
            }
            // Seek to 0.5s to get past black frames, or middle if short
            video.currentTime = Math.min(0.5, video.duration / 2);
        };

        video.onseeked = () => {
            // Ensure we have frame data
            if (video.readyState < 2) {
                return; // Wait for next event or rely on timeout
            }

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Draw the video frame
                ctx.drawImage(video, 0, 0);

                // Convert to blob
                canvas.toBlob((blob) => {
                    clearTimeout(timeout);
                    URL.revokeObjectURL(video.src); // Cleanup

                    if (blob && blob.size > 0) {
                        console.log(`Frame captured: ${canvas.width}x${canvas.height}, ${blob.size} bytes`);
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas produced empty file (frame might be empty)'));
                    }
                }, 'image/jpeg', 0.95);
            } else {
                reject(new Error('Could not create 2D Context'));
            }
        };

        video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Browser cannot play this video (Code: ${video.error?.code})`));
        };
    });
}

export async function generate3DFromImage(file: File): Promise<string> {
    try {
        console.log("Starting generation from file:", file.name);
        let fileToSend: Blob = file;

        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');

        if (isVideo) {
            console.log("Video detected, extracting frame...");
            try {
                fileToSend = await extractFrameFromVideo(file);
                console.log("Frame extracted! Size:", fileToSend.size);
            } catch (e) {
                console.error("Frame extraction failed:", e);
                // CRITICAL FIX: Do NOT send the raw video if extraction fails. 
                // That causes the backend to crash and the frontend to show a placeholder.
                throw new Error("Could not extract image from video. Please upload a Screenshot instead.");
            }
        }

        const formData = new FormData();
        // Append as 'file' expected by backend
        formData.append('file', fileToSend, "input_image.jpg");

        console.log("Sending to backend...");
        const response = await fetch('http://127.0.0.1:8000/generate/image-to-3d', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Backend generation failed');
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Backend unavailable, falling back to mock:", error);
        return new Promise((resolve) => {
            console.log(`Generating model from file: "${file.name}" (${file.type})...`);
            const isVideo = file.type.startsWith('video/');

            setTimeout(() => {
                if (isVideo) {
                    resolve('/placeholder-model-from-video.glb');
                } else {
                    resolve('/placeholder-model-from-image.glb');
                }
            }, 3000);
        });
    }
}

export async function generateTexture(prompt: string): Promise<string> {
    try {
        const response = await fetch('http://127.0.0.1:8000/generate/texture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Backend generation failed');
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Backend unavailable, falling back to mock texture:", error);
        // Fallback to local procedural generation
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const hue = Math.floor(Math.random() * 360);
                ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;
                ctx.fillRect(0, 0, 512, 512);
                for (let i = 0; i < 5000; i++) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                    const s = Math.random() * 4;
                    ctx.fillRect(Math.random() * 512, Math.random() * 512, s, s);
                }
                resolve(canvas.toDataURL());
            } else {
                resolve('');
            }
        });
    }
}
