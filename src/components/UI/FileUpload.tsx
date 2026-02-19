'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generate3DFromImage } from '@/lib/api';
import { clsx } from 'clsx';

export default function FileUpload() {
    const [isDragOver, setIsDragOver] = useState(false);
    const { isGenerating, setIsGenerating, setModelPath } = useStore();

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (isGenerating) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            console.log("File dropped:", file.name, file.type, file.size);

            // Check extension if type is empty (common on Windows)
            const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
            const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
            const isModel = file.name.endsWith('.glb') || file.name.endsWith('.gltf');

            if (isModel) {
                console.log("Processing as Model");
                const url = URL.createObjectURL(file);
                setModelPath(url);
            } else if (isImage || isVideo) {
                console.log("Processing as Image/Video");
                await processFile(file);
            } else {
                console.warn("File type not recognized:", file.type);
                // Try processing anyway as fallback
                await processFile(file);
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setIsGenerating(true);
        try {
            const modelUrl = await generate3DFromImage(file);
            setModelPath(modelUrl);
        } catch (error) {
            console.error("Upload generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={clsx(
                "relative rounded-xl border-2 border-dashed transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group",
                isDragOver ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                isGenerating && "opacity-50 cursor-not-allowed"
            )}
        >
            <input
                type="file"
                accept="image/*,video/*,.glb,.gltf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                disabled={isGenerating}
            />

            {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-medium">Processing...</span>
                </div>
            ) : (
                <>
                    <div className="p-3 rounded-full bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white transition-colors">
                        <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-neutral-300">Drop model, image or video</p>
                        <p className="text-xs text-neutral-500 mt-1">Supports GLB, JPG, MP4</p>
                    </div>
                </>
            )}
        </div>
    );
}
