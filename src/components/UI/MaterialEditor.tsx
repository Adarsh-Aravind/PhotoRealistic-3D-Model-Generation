'use client';

import { useStore } from '@/store/useStore';


export default function MaterialEditor() {
    const { materialProps, updateMaterial } = useStore();

    return (
        <div className="flex flex-col gap-6 w-full">

            {/* Color Picker */}
            <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    Base Color
                    <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded font-mono">{materialProps.color}</span>
                </label>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={materialProps.color}
                        onChange={(e) => updateMaterial({ color: e.target.value })}
                        className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none p-0 overflow-hidden ring-1 ring-white/10"
                    />
                    <div className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3 text-xs text-neutral-300 font-mono">
                        {materialProps.color}
                    </div>
                </div>
            </div>

            {/* Roughness Slider */}
            <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    Roughness
                    <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded font-mono">{materialProps.roughness.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={materialProps.roughness}
                    onChange={(e) => updateMaterial({ roughness: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
            </div>

            {/* Metalness Slider */}
            <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    Metalness
                    <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded font-mono">{materialProps.metalness.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={materialProps.metalness}
                    onChange={(e) => updateMaterial({ metalness: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
            </div>

        </div>
    );
}
