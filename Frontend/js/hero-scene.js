import * as THREE from 'three';

// Hero Scene Setup
const initHeroScene = () => {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();

    // Camera settings
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.x = 2; // Offset to the right so it balances with text

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create a visually interesting object (e.g., a twisted knot or icosphere)
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);

    // Wireframe material for the techy "mesh" look
    const wireMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // Solid material mixed in
    const solidMaterial = new THREE.MeshStandardMaterial({
        color: 0x111116,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true
    });

    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);

    // Group them
    const group = new THREE.Group();
    group.add(solidMesh);
    group.add(wireMesh);

    // Add particle nodes
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 100;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        // distribute them in a sphere
        posArray[i] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xbc13fe,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);

    scene.add(group);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f3ff, 50, 20);
    pointLight1.position.set(2, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xbc13fe, 50, 20);
    pointLight2.position.set(-2, -3, 2);
    scene.add(pointLight2);

    // Mouse Interaction for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Parallax easing
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Auto rotate group
        group.rotation.x += 0.002;
        group.rotation.y += 0.003;

        // Interactive follow
        group.rotation.y += 0.02 * (targetX - group.rotation.y);
        group.rotation.x += 0.02 * (targetY - group.rotation.x);

        // Float effect on mesh
        group.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

        // Slowly rotate particles
        particles.rotation.y = elapsedTime * 0.05;

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initHeroScene);
