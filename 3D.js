import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
import palettes from 'nice-color-palettes';
import { expoInOut } from 'eases';

/**
 * Set the random's method seed
 */
random.setSeed(random.getRandomSeed());

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  dimensions: [2048, 2048],
  scaleToView: true,
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
  const palette = random.pick(palettes);

  // WebGL background color
  renderer.setClearColor(palette.shift(), 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const meshes = [];

  for (let i = 0; i < 50; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: random.pick(palette),
      metalness: 0,
      roughness: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position
      .set(random.range(-1, 1), random.range(-10, 10), random.range(-1, 1))
      .multiplyScalar(1);
    mesh.scale.set(
      random.range(0.1, 0.5),
      random.range(0.1, 10),
      random.range(0.1, 0.5)
    );
    meshes.push(mesh);
  }

  const light = new THREE.DirectionalLight('#fff', 1);
  const light2 = new THREE.DirectionalLight('#fff', 0.5);
  light.position.set(5, 5, 5);
  light2.position.set(-5, -5, -5);
  scene.add(light);
  scene.add(light2);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 2;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      const eased = expoInOut(time);
      meshes.forEach((mesh, index) => {
        // mesh.rotation.y = Math.sin(eased + mesh.position.y);
        mesh.position.y += 0.0005 * index;

        if (mesh.position.y > 10) {
          mesh.position.y = -10;
        }

        mesh.scale.y = Math.cos(eased * index) * 0.5 + 1;
        mesh.scale.x = Math.sin((eased * index) / 2) * 0.5 + 0.5;
      });
      // scene.rotation.z = Math.sin(time) * 10;
      scene.rotation.y = time;
      // controls.update();
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
