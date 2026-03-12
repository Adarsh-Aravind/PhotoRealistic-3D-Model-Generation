import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Will use if needed, else construct geometry
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

document.addEventListener('DOMContentLoaded', () => {

    // UI Elements
    const promptInput = document.getElementById('prompt-input');
    const btnGenerate = document.getElementById('btn-generate');
    const btnDownload = document.getElementById('btn-download');
    const emptyState = document.getElementById('empty-state');
    const viewerContainer = document.getElementById('viewer-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const colorControls = document.getElementById('color-controls');
    const generatedPrompt = document.getElementById('generated-prompt');
    const swatches = document.querySelectorAll('.color-swatch');
    const customColorInput = document.getElementById('custom-color');

    // State
    let mainModelMaterial = null; // Hold reference to material to change color
    let scene, camera, renderer, controls, currentMesh;

    function evaluateButtonState() {
        const hasText = promptInput && promptInput.value.trim().length > 0;
        if (hasText) {
            btnGenerate.disabled = false;
            btnGenerate.innerText = "Start Generation";
        } else {
            btnGenerate.disabled = true;
            btnGenerate.innerText = "START GENERATION";
        }
    }

    // Handle Prompt Generation Input
    if (promptInput) {
        promptInput.addEventListener('input', (e) => {
            evaluateButtonState();
        });
    }

    // Handle Generation click
    btnGenerate.addEventListener('click', async () => {
        if (!promptInput || promptInput.value.trim().length === 0) return;

        // UI transitions
        emptyState.style.display = 'none';
        viewerContainer.style.display = 'block';
        loadingOverlay.style.display = 'flex';
        btnGenerate.disabled = true;
        if (btnDownload) {
            btnDownload.disabled = true;
            btnDownload.style.background = "transparent";
            btnDownload.style.color = "var(--secondary)";
            btnDownload.style.boxShadow = "none";
            btnDownload.style.borderColor = "var(--secondary)";
            btnDownload.innerHTML = `<i data-lucide="download" style="width: 18px; height: 18px;"></i><span style="font-family: 'Syncopate', sans-serif; font-size: 0.8rem; letter-spacing: 1px; margin-left: 0.5rem;">DOWNLOAD .GLB</span>`;
            if (window.lucide) window.lucide.createIcons();
        }
        colorControls.style.display = 'none';

        loadingText.innerText = "Synthesizing 3D Geometry (Shap-E)... This may take up to 20 seconds.";
        if (window.showToast) window.showToast("Initiating neural network generation...", "info");

        try {
            const promptText = promptInput.value.trim();
            const response = await fetch('http://127.0.0.1:8000/generate/text-to-3d', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: promptText })
            });

            if (!response.ok) {
                throw new Error("Backend generation failed");
            }

            const blob = await response.blob();
            const modelUrl = URL.createObjectURL(blob);
            finishGeneration(modelUrl, promptText);
        } catch (err) {
            console.error(err);
            loadingText.innerText = "ERROR IN GENERATION (Backend Down?)";
            if (window.showToast) window.showToast("Model generation failed: " + err.message, "error");
            loadingOverlay.style.background = 'rgba(255, 0, 0, 0.2)';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                loadingOverlay.style.background = 'rgba(10, 10, 10, 0.8)';
                emptyState.style.display = 'flex';
                viewerContainer.style.display = 'none';
                evaluateButtonState();
            }, 4000);
        }
    });

    function finishGeneration(modelUrl, promptText) {
        if (window.showToast) window.showToast("3D structure synthesis complete!", "success");
        loadingOverlay.style.display = 'none';
        colorControls.style.display = 'block';

        generatedPrompt.style.display = "block";
        generatedPrompt.innerHTML = `> PROMPT SUCCEEDED:<br><br>"${promptText}"`;

        btnGenerate.innerText = "Model Generated";

        if (btnDownload) {
            btnDownload.disabled = false;
            btnDownload.style.background = "var(--secondary)";
            btnDownload.style.color = "#000";
            btnDownload.style.boxShadow = "0 0 15px rgba(0, 243, 255, 0.3)";
            btnDownload.style.borderColor = "transparent";
        }

        initThreeJSViewer(modelUrl);
    }

    // Main Three.js setup for the Viewer
    function initThreeJSViewer(modelUrl) {
        const container = document.getElementById('model-canvas');

        // Clear previous if any
        while (container.firstChild) { container.removeChild(container.firstChild); }

        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 2, 5);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xbc13fe, 0.8);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0x00f3ff, 1);
        rimLight.position.set(0, -5, 5);
        scene.add(rimLight);

        // The material we want the user to change colors of
        mainModelMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Default color
            roughness: 0.15,
            metalness: 0.8,
            envMapIntensity: 1.0
        });

        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            currentMesh = gltf.scene;

            // Apply material to all meshes inside
            currentMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = mainModelMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(currentMesh);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim; // scale to fit nicely

            currentMesh.scale.set(scale, scale, scale);
            currentMesh.position.sub(center.multiplyScalar(scale));

            scene.add(currentMesh);
        }, undefined, (error) => {
            console.error("Error loading GLTF:", error);
        });

        // Animate
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle Viewer Resize
        const resizeObserver = new ResizeObserver(() => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
        resizeObserver.observe(container);
    }

    // Color controls logic
    function changeModelColor(hexStr) {
        if (mainModelMaterial) {
            // Smooth color transition could be done via GSAP, but setting is fine
            mainModelMaterial.color.set(hexStr);
        }
    }

    swatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            // Update active state
            swatches.forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');

            // Apply color
            const color = e.target.getAttribute('data-color');
            changeModelColor(color);

            // Sync custom input
            customColorInput.value = color;
        });
    });

    customColorInput.addEventListener('input', (e) => {
        // Deselect swatches
        swatches.forEach(s => s.classList.remove('active'));
        changeModelColor(e.target.value);
    });

    // GLTF Export Logic
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            if (!currentMesh) return;
            // Provide feedback
            btnDownload.innerText = "EXPORTING...";
            const exporter = new GLTFExporter();
            exporter.parse(
                currentMesh,
                function (gltf) {
                    const blob = new Blob([gltf], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = 'neuromesh_generated_model.glb';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    btnDownload.innerText = "DOWNLOAD .GLB";
                },
                function (error) {
                    console.error('An error happened during parsing', error);
                    btnDownload.innerText = "ERROR EXPORTING";
                },
                { binary: true }
            );
        });
    }

});
