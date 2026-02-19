import { create } from 'zustand';

interface MaterialProps {
    color: string;
    metalness: number;
    roughness: number;
}

interface AppState {
    modelPath: string | null;
    textureUrl: string | null;
    generatedImage: string | null;
    isGenerating: boolean;
    materialProps: MaterialProps;

    setModelPath: (path: string | null) => void;
    setTextureUrl: (url: string | null) => void;
    setGeneratedImage: (url: string) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    updateMaterial: (props: Partial<MaterialProps>) => void;
}

export const useStore = create<AppState>((set) => ({
    modelPath: null, // Start with no model, or a default one
    textureUrl: null,
    generatedImage: null,
    isGenerating: false,
    materialProps: {
        color: '#ffffff',
        metalness: 0.5,
        roughness: 0.5,
    },

    setModelPath: (path) => set({ modelPath: path }),
    setTextureUrl: (url) => set({ textureUrl: url }),
    setGeneratedImage: (url) => set({ generatedImage: url }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    updateMaterial: (props) =>
        set((state) => ({
            materialProps: { ...state.materialProps, ...props },
        })),
}));
