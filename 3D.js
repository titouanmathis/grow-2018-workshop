const canvasSketch = require('canvas-sketch');

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
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
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(20, 20, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhysicalMaterial({
    color: '#fff',
    roughness: 0.75,
    flatShading: true,
  });
  const grid = createGrid();
  const meshes = [];

  grid.forEach(point => {
    const [u, v, w] = point;
    const x = u * 3;
    const y = v * 3;
    const z = w * 3;
    const mesh = new THREE.Mesh(geometry, material);
    const position = new THREE.Vector3(x, y, z);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    meshes.push(mesh);
    scene.add(mesh);
  });

  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#fff'));

  // Add some light
  const light = new THREE.PointLight('#fff', 1, 15.5);
  light.position.set(2, 2, -4).multiplyScalar(1.5);
  scene.add(light);

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
      meshes.forEach(mesh => {
        mesh.rotation.y = time * ((10 * Math.PI) / 90);
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
};

canvasSketch(sketch, settings);
