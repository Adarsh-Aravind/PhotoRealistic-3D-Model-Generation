'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function ExternalModel({ url, textureUrl, materialProps }: { url: string, textureUrl: string | null, materialProps: any }) {
    const { scene } = useGLTF(url);

    // Clone the scene so we can modify it without affecting the cached original if needed
    const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);

    useEffect(() => {
        if (scene) {
            const clone = scene.clone();
            setClonedScene(clone);
        }
    }, [scene]);

    // Apply material properties and texture
    useEffect(() => {
        if (!clonedScene) return;

        const textureLoader = new THREE.TextureLoader();
        let map: THREE.Texture | null = null;

        if (textureUrl) {
            map = textureLoader.load(textureUrl);
            map.colorSpace = THREE.SRGBColorSpace;
            map.flipY = false; // often needed for GLB exports
        }

        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                // If the mesh already has a material, we modify it or replace it
                // For "Live Editing", we usually want to override the material properties
                if (mesh.material) {
                    // We cast to MeshStandardMaterial to access properties safely
                    // In a robust app, we'd check the type specifically
                    const mat = mesh.material as THREE.MeshStandardMaterial; // simplified

                    mat.color.set(materialProps.color);
                    mat.roughness = materialProps.roughness;
                    mat.metalness = materialProps.metalness;

                    if (map) {
                        mat.map = map;
                        mat.needsUpdate = true;
                    }
                }
            }
        });
    }, [clonedScene, materialProps, textureUrl]);

    if (!clonedScene) return null;
    return <primitive object={clonedScene} />;
}

function CurrentModel() {
    const { modelPath, materialProps, textureUrl } = useStore();

    // In a real app, we would use useGLTF(modelPath) here to load the generated model.
    // For this prototype, we change the geometry based on the "path" text to simulate different models,
    // and apply the material props.

    // Check if the path is a Blob URL (uploaded file) or external link
    // Check if the path is a Blob URL (uploaded file) or external link
    // We include a check to ignore 'placeholder' strings which are used for mock generation
    const isExternal = (modelPath?.startsWith('blob:') || modelPath?.endsWith('.glb') || modelPath?.endsWith('.gltf')) && !modelPath?.includes('placeholder');

    if (isExternal && modelPath) {
        return <ExternalModel url={modelPath} textureUrl={textureUrl} materialProps={materialProps} />;
    }

    // Default primitive handling (Mock Generation Results)
    return (
        <mesh>
            {/* Visual feedback based on generation source */}
            {modelPath?.includes('video') ? (
                <capsuleGeometry args={[0.5, 1, 4, 8]} />
            ) : modelPath?.includes('image') ? (
                <sphereGeometry args={[0.7, 64, 64]} />
            ) : modelPath ? (
                <torusKnotGeometry args={[0.5, 0.2, 100, 16]} />
            ) : (
                <boxGeometry args={[1, 1, 1]} />
            )}

            <meshStandardMaterial
                color={materialProps.color}
                metalness={materialProps.metalness}
                roughness={materialProps.roughness}
                map={textureUrl ? new THREE.TextureLoader().load(textureUrl) : null}
            />
        </mesh>
    );
}

export default function Scene() {
    return (
        <div className="w-full h-full bg-neutral-900">
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-bias={-0.0001} />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <CurrentModel />
                    <ContactShadows resolution={1024} scale={10} blur={10} opacity={0.8} far={10} color="#000000" />
                </Suspense>

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}
