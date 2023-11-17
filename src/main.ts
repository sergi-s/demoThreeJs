import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import './style.css';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';


// -------------------------------------------------------
let scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  model: THREE.Mesh | undefined;
const objectTypes = ['default', 'box', 'ball'];
let currentObjectType = 0;
let scrollCount = 0;
let isAnimationDone = false;

const sections = document.querySelectorAll('[id^="section"]') as NodeListOf<HTMLElement>;
const doughnut = (() => {
  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  return createMaterial({ shape: geometry, color: 0xFF6347 });
})()

const earth = (() => {
  const geometry = new THREE.SphereGeometry(8, 32, 32);
  const earthText = new THREE.TextureLoader().load('59-earth/textures/earth albedo.jpg');
  return createMaterial({ shape: geometry, texture: earthText });
})()

const box = (() => {
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  return createMaterial({ shape: geometry, color: 0x0000ff });
})()


// -------------------------------------------------------

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25;

  const ambienLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambienLight);

  const background = new THREE.TextureLoader().load('Belka_Main_BG_4.jpg');
  scene.background = background;

  renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') as HTMLCanvasElement });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // model = doughnut
  // scene.add(doughnut);
  loadModel('eagle/source/Where is this eagle landing_.glb')
  animate();
}


// -------------------------------------------------------

function loadModel(modelPath: string, scale: number = 8) {
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      //@ts-ignore
      model = gltf.scene;

      // Set the scale of the model

      //@ts-ignore
      model.scale.set(scale, scale, scale);

      //@ts-ignore
      scene.add(model);
    },
    (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
    (error) => console.error('Error loading GLTF model:', error)
  );
}


// -------------------------------------------------------


function createMaterial({ shape, color, texture }: { shape: THREE.BufferGeometry; color?: number; texture?: THREE.Texture }) {
  const material = color ? new THREE.MeshStandardMaterial({ color }) : new THREE.MeshStandardMaterial();
  if (texture) material.map = texture;
  return new THREE.Mesh(shape, material);
}

// -------------------------------------------------------

function updateDummyObject() {
  if (model) {
    // new TWEEN.Tween(model.scale).to({ x: 1, y: 1, z: 1 }, 900).start();
    scene.remove(model);
  }

  switch (objectTypes[currentObjectType]) {
    case 'default':
      model = doughnut
      scene.add(doughnut);
      break;
    case 'ball':
      model = earth
      scene.add(earth);
      break;
    case 'box':
      model = box
      scene.add(box);
      break;
    default:
      model = doughnut
      scene.add(doughnut);
  }
  new TWEEN.Tween(model.scale).to({ x: 1.25, y: 1.25, z: 1.25 }, 900).start();

}


// -------------------------------------------------------

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  if (model) {
    // model.rotation.x += 0.01;
    model.rotation.y += 0.005;
    // model.rotation.z += 0.01;
    renderer.render(scene, camera);
  }
}

// -------------------------------------------------------


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('wheel', startScroll, { passive: false });

// -------------------------------------------------------


function handleScrollChange(event: WheelEvent) {
  if (scrollCount - 1 >= sections.length) {
    scrollCount = sections.length;
  }

  if (event.deltaY <= 0) {
    if (!isAnimationDone) return;
    scrollCount -= 1;
    moveNextSection(scrollCount);
    return;
  }

  scrollCount++;

  if (scrollCount > 2) {
    moveNextSection(scrollCount - 2);
    if (scrollCount >= 3) isAnimationDone = true;
  } else if (!isAnimationDone) {
    currentObjectType = (currentObjectType + 1) % objectTypes.length;
    updateDummyObject();
  }
}

init();


// -------------------------------------------------------

function moveNextSection(index: number) {
  if (index >= 0 && index < sections.length) {
    sections[index].scrollIntoView({ behavior: 'smooth' });
  }
}


// -------------------------------------------------------

let scrollTimer: number;
const body = document.body;

function startScroll(event: WheelEvent) {
  event.preventDefault();
  clearTimeout(scrollTimer);
  body.scrollTop += 10;
  scrollTimer = setTimeout(() => handleScrollChange(event), 100);
}


// -------------------------------------------------------
