'use client';

import { useState } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generate3DModel, generateTexture } from '@/lib/api';

export default function PromptInput() {
    const [prompt, setPrompt] = useState('');
    const { isGenerating, setIsGenerating, setModelPath, modelPath, setTextureUrl } = useStore();

    const handleReset = () => {
        setModelPath(null);
        setTextureUrl(null);
        setPrompt('');
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            if (modelPath) {
                // If a model exists, generate a texture for it
                console.log("Generating texture...");
                const texture = await generateTexture(prompt);
                setTextureUrl(texture);
            } else {
                // If no model, generate a model
                const modelUrl = await generate3DModel(prompt);
                setModelPath(modelUrl);
            }
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full relative">
            <div className="relative flex items-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-2 shadow-lg hover:border-white/20 transition-all duration-300 ring-offset-2 focus-within:ring-2 ring-indigo-500/50">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={modelPath ? "Describe a material/texture..." : "Describe a 3D object..."}
                    className="w-full bg-transparent border-none text-white pl-4 pr-12 py-3 focus:outline-none placeholder:text-neutral-500 text-sm font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />

                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </div>

            {modelPath && (
                <button
                    onClick={handleReset}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
                    title="Start New Generation"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
