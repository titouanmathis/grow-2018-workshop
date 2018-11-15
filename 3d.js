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
  dimensions: [1024, 1024],
  scaleToView: true,
  suffix: random.getSeed(),
  // Make the loop animated
  animate: true,
  duration: 10,
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

    randomizeMesh(mesh);
    mesh.time = random.range(0, mesh.duration);

    scene.add(mesh);
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
    render({ deltaTime }) {
      meshes.forEach(mesh => {
        mesh.time += deltaTime;
        if (mesh.time > mesh.duration) {
          randomizeMesh(mesh);
        }

        const v = mesh.time / mesh.duration;
        const s = Math.max(0.0001, Math.sin(v * Math.PI));
        const frequency = 105;
        const noise = random.noise4D(
          mesh.originalPosition.x * frequency,
          mesh.originalPosition.y * frequency,
          mesh.originalPosition.z * frequency,
          mesh.time * 0.5
        );
        mesh.scale.copy(mesh.originalScale).multiplyScalar(s);
        mesh.scale.x *= noise;

        mesh.position.y += deltaTime;
      });
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };

  /**
   * Randomize mesh position and sizes
   * @param  {MeshStandardMaterial} mesh
   * @return {MeshStandardMaterial}
   */
  function randomizeMesh(mesh) {
    mesh.position
      .set(random.range(-1, 1), random.range(-1, 1), random.range(-1, 1))
      .multiplyScalar(2);

    mesh.position.y -= 1.5;

    const squeeze = 0.4;
    mesh.position.x *= squeeze;
    mesh.position.z *= squeeze;

    mesh.scale.set(
      random.range(0.1, 1),
      random.range(0.1, 2),
      random.range(0.1, 1)
    );
    mesh.duration = random.range(1, 4);
    mesh.time = 0;
    mesh.originalScale = mesh.scale.clone();
    mesh.originalPosition = mesh.position.clone();

    mesh.material.color.setStyle(random.pick(palette));

    return mesh;
  }
};

canvasSketch(sketch, settings);
