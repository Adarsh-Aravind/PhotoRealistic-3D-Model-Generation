'use client';

import Scene from '@/components/Canvas/Scene';
import PromptInput from '@/components/UI/PromptInput';
import MaterialEditor from '@/components/UI/MaterialEditor';
import FileUpload from '@/components/UI/FileUpload';
import { Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <main className="flex h-screen w-full">
            {/* 3D Viewport - Takes up remaining space */}
            <section className="flex-1 relative h-full">
                <Scene />

                {/* Floating Overlay Controls can go here */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h1 className="text-2xl font-bold tracking-tight text-white/90 drop-shadow-md">
                        VibeCode 3D
                    </h1>
                </div>
            </section>

            {/* Sidebar - Fixed width */}
            <aside className="w-80 h-full border-l border-white/10 bg-neutral-900/50 backdrop-blur-xl p-4 flex flex-col gap-6">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="font-semibold tracking-wide uppercase text-xs">AI Generation</h2>
                </div>

                {/* Tools Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Generate</label>
                        <PromptInput />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Image / Video to 3D</label>
                        <FileUpload />
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Sparkles className="w-4 h-4" />
                            <h2 className="font-semibold tracking-wide uppercase text-xs">Material</h2>
                        </div>
                        <MaterialEditor />
                    </div>
                </div>
            </aside>
        </main>
    );
}
