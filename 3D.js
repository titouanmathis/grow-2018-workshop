import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';

/**
 * Set the random's method seed
 */
random.setSeed(random.getRandomSeed());

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  suffix: random.getSeed(),
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  const createGrid = (count = 3) => {
    const points = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        for (let z = 0; z < count; z++) {
          let u = count <= 1 ? 0.5 : x / (count - 1);
          let v = count <= 1 ? 0.5 : y / (count - 1);
          let w = count <= 1 ? 0.5 : z / (count - 1);
          points.push([u, v, w]);
        }
      }
    }

    return points;
  };

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  // WebGL background color
  renderer.setClearColor('#fff', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(4, 4, 6);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();

  for (let i = 0; i < 20; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position
      .set(random.range(-1, 1), random.range(-1, 1), random.range(-1, 1))
      .multiplyScalar(1.2);
    mesh.scale.set(
      random.range(0.1, 1) * random.gaussian(),
      random.range(0.1, 1) * random.gaussian(),
      random.range(0.1, 1) * random.gaussian()
    );
  }

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
