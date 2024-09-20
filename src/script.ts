import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Disable color management
THREE.ColorManagement.enabled = false;

// Check WebGL support
function checkWebGLSupport(): boolean {
  const canvas = document.createElement('canvas');
  return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
}

// Create environment map
function createEnvironmentMap(path: string): THREE.CubeTexture {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    `${path}/px.jpg`, `${path}/nx.jpg`,
    `${path}/py.jpg`, `${path}/ny.jpg`,
    `${path}/pz.jpg`, `${path}/nz.jpg`
  ]);
  return texture;
}

// Create lights
function createLights(): [THREE.AmbientLight, THREE.PointLight] {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 0);
  return [ambientLight, pointLight];
}

// Create a planet
function createPlanet(name: string, radius: number, texture: string, position: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(texture)
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = name;
  const labelObject = new CSS2DObject(label);
  labelObject.position.set(0, radius + 0.5, 0);
  mesh.add(labelObject);

  return mesh;
}

// Create solar system
function createSolarSystem(scene: THREE.Scene): void {
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  const planets = [
    { name: "Mercury", radius: 0.5, texture: "/REAAAL/textures/mercury.jpg", position: new THREE.Vector3(10, 0, 0) },
    { name: "Venus", radius: 0.8, texture: "/REAAAL/textures/venus.jpg", position: new THREE.Vector3(15, 0, 0) },
    { name: "Earth", radius: 1, texture: "/REAAAL/textures/earth.jpg", position: new THREE.Vector3(20, 0, 0) },
    { name: "Mars", radius: 0.7, texture: "/REAAAL/textures/mars.jpg", position: new THREE.Vector3(25, 0, 0) }
  ];

  planets.forEach(planet => {
    const mesh = createPlanet(planet.name, planet.radius, planet.texture, planet.position);
    scene.add(mesh);
  });
}

// Main function
function init() {
  console.log('Initializing solar system...');

  if (!checkWebGLSupport()) {
    console.error('WebGL is not supported in this browser.');
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'WebGL is not supported in this browser. Please try a different browser or device.';
    document.body.appendChild(errorMessage);
    return;
  }

  // Canvas
  const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  if (!canvas) {
    console.error('Cannot find canvas element');
    return;
  }

  // Scene
  const scene = new THREE.Scene();
  console.log('Scene created');

  // Environment map
  scene.background = createEnvironmentMap("/REAAAL/textures/environment");
  console.log('Environment map created');

  // Lights
  const [ambientLight, pointLight] = createLights();
  scene.add(ambientLight, pointLight);
  console.log('Lights added');

  // Solar system
  createSolarSystem(scene);
  console.log('Solar system created');

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
  camera.position.set(0, 20, 30);
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Label renderer
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(sizes.width, sizes.height);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);

  // Bloom effect
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1.5, 0.4, 0.85);
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  // Resize handler
  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    bloomComposer.setSize(sizes.width, sizes.height);
    labelRenderer.setSize(sizes.width, sizes.height);
  });

  // Animation
  const clock = new THREE.Clock();

  const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    bloomComposer.render();
    labelRenderer.render(scene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
  };

  animate();
  console.log('Animation started');
}

// Start the application
init();
