import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Will use if needed, else construct geometry

document.addEventListener('DOMContentLoaded', () => {

    // UI Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const promptInput = document.getElementById('prompt-input');
    const btnGenerate = document.getElementById('btn-generate');
    const emptyState = document.getElementById('empty-state');
    const viewerContainer = document.getElementById('viewer-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const colorControls = document.getElementById('color-controls');
    const generatedPrompt = document.getElementById('generated-prompt');

    // Tab Elements
    const modeTabs = document.querySelectorAll('.mode-tab');
    const inputModes = document.querySelectorAll('.input-mode');

    // Color controls
    const swatches = document.querySelectorAll('.color-swatch');
    const customColorInput = document.getElementById('custom-color');

    // State
    let currentMode = 'mode-image'; // 'mode-image' or 'mode-text'
    let selectedFile = null;
    let mainModelMaterial = null; // Hold reference to material to change color
    let scene, camera, renderer, controls, currentMesh;

    // --- TAB SWITCHING LOGIC ---
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update Active Tab
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update Active Area
            const targetId = tab.getAttribute('data-target');
            currentMode = targetId;

            inputModes.forEach(mode => {
                if (mode.id === targetId) {
                    mode.style.display = 'block';
                    // GSAP simple fade-in
                    if (window.gsap) gsap.fromTo(mode, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
                } else {
                    mode.style.display = 'none';
                }
            });

            // Re-evaluate button state
            evaluateButtonState();
        });
    });

    function evaluateButtonState() {
        if (currentMode === 'mode-image') {
            if (selectedFile) {
                btnGenerate.disabled = false;
                btnGenerate.innerText = "Start Generation";
            } else {
                btnGenerate.disabled = true;
                btnGenerate.innerText = "START GENERATION";
            }
        } else if (currentMode === 'mode-text') {
            const hasText = promptInput && promptInput.value.trim().length > 0;
            if (hasText) {
                btnGenerate.disabled = false;
                btnGenerate.innerText = "Start Generation";
            } else {
                btnGenerate.disabled = true;
                btnGenerate.innerText = "START GENERATION";
            }
        }
    }

    // Setup Drag & Drop
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        selectedFile = file;
        dropZone.innerHTML = `
            <i data-lucide="check-circle" style="width: 48px; height: 48px; color: var(--accent-cyan); margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem; color: #fff;">${file.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Ready to process</p>
        `;
        // Re-init icons dynamically
        if (window.lucide) lucide.createIcons();
        btnGenerate.disabled = false;
        btnGenerate.innerText = "Start Generation";
    }

    // Handle Prompt Generation Input
    if (promptInput) {
        promptInput.addEventListener('input', (e) => {
            evaluateButtonState();
        });
    }

    // Handle Generation Mock
    btnGenerate.addEventListener('click', () => {
        if (currentMode === 'mode-image' && !selectedFile) return;
        if (currentMode === 'mode-text' && (!promptInput || promptInput.value.trim().length === 0)) return;

        // UI transitions
        emptyState.style.display = 'none';
        viewerContainer.style.display = 'block';
        loadingOverlay.style.display = 'flex';
        btnGenerate.disabled = true;
        colorControls.style.display = 'none';

        // Mocking the generation phases
        const phrases = [
            "Extracting point cloud data...",
            "Running surface reconstruction...",
            "Applying mesh optimization...",
            "Deriving semantic prompts...",
            "Finalizing topology..."
        ];

        let phase = 0;
        const interval = setInterval(() => {
            if (phase < phrases.length) {
                loadingText.innerText = phrases[phase];
                phase++;
            }
        }, 800);

        setTimeout(() => {
            clearInterval(interval);
            finishGeneration();
        }, 4500); // 4.5 second mock delay
    });

    function finishGeneration() {
        loadingOverlay.style.display = 'none';
        colorControls.style.display = 'block';

        // Mock prompt generation based on filename to simulate backend AI
        const baseName = selectedFile ? (selectedFile.name.split('.')[0] || "object") : "Generated Object";
        generatedPrompt.style.display = "block";
        generatedPrompt.innerHTML = `> PROMPT GENERATED:<br><br>"Photorealistic highly detailed 3D model of ${baseName}, studio lighting, highly polished."`;

        btnGenerate.innerText = "Model Generated";
        initThreeJSViewer();
    }

    // Main Three.js setup for the Viewer
    function initThreeJSViewer() {
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

        // Generate geometry (Mocking what a backend returns)
        // We will create a complex knot to look impressive
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 200, 32);

        // The material we want the user to change colors of
        mainModelMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Default color
            roughness: 0.15,
            metalness: 0.8,
            envMapIntensity: 1.0
        });

        currentMesh = new THREE.Mesh(geometry, mainModelMaterial);
        scene.add(currentMesh);

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

});
