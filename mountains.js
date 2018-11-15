import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
random.setSeed(random.getRandomSeed());

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  suffix: random.getSeed(),
  // Make the loop animated
  animate: true,
  duration: 8,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  /**
   * Create a grid of points
   * @param  {Number} count The number of columns and rows
   * @return {Array}        A list of points
   */
  const createGrid = (count = 4) => {
    const points = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        let u = count <= 1 ? 0.5 : x / (count - 1);
        let v = count <= 1 ? 0.5 : y / (count - 1);

        points.push([u, v]);
      }
    }

    return points;
  };

  const count = 30;
  const grid = createGrid(count);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  // WebGL background color
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const material = new THREE.LineBasicMaterial({ color: '#fff' });
  const frequency = count * 0.05;
  const amplitude = frequency / 0.1;

  const meshes = [];

  grid.forEach(([u, v], index) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhysicalMaterial({
        color: '#fff',
        roughness: 0.75,
        flatShading: true,
      })
    );
    mesh.position.x = (u * -grid.length) / 100;
    mesh.position.z = (v * -grid.length) / 100;
    const noise = random.noise2D(u, v, frequency, amplitude);
    mesh.position.y = noise;
    mesh.scale.multiplyScalar(0.05);
    mesh.__original = mesh.clone();
    mesh.__original.u = u;
    mesh.__original.v = v;
    // scene.add(mesh);
    meshes.push(mesh);
  });

  const rows = chunkArray(grid, count);
  const lines = [];
  rows.forEach((points, index) => {
    const geometry = new THREE.Geometry();

    points.forEach(([u, v]) => {
      const noise = random.noise2D(u, v, frequency, amplitude);
      const x = (u * -rows.length * count) / 100;
      const y = noise;
      const z = (v * -rows.length * count) / 100;
      const vector = new THREE.Vector3(x, y, z);
      vector.__original = new THREE.Vector3(x, y, z);
      geometry.vertices.push(vector);
    });

    const line = new THREE.Line(geometry, material);
    line.needsUpdate = true;
    scene.add(line);
    lines.push(line);
  });

  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#fff'));
  scene.position.y = -5;

  // Add some light
  const light = new THREE.PointLight('#fff', 1, 150.5);
  light.position.set(2, 2, -4).multiplyScalar(1.5);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 10;

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
      camera.lookAt(new THREE.Vector3(100, 100, 100));

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead }) {
      const eased = Math.sin(playhead * Math.PI * 2);

      meshes.forEach(point => {
        const noise = random.noise2D(
          point.__original.u,
          point.__original.v,
          frequency,
          amplitude
        );
        point.position.y = noise;
      });

      lines.forEach(({ geometry }, i) => {
        geometry.vertices.forEach((vector, j) => {
          const noise = random.noise2D(
            vector.__original.x,
            vector.__original.y,
            frequency,
            amplitude
          );
          const y = (vector.__original.y * eased) / amplitude;
          vector.setY(y);
        });
        geometry.verticesNeedUpdate = true;
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
   * Returns an array with arrays of the given size.
   *
   * @param myArray {Array} Array to split
   * @param chunkSize {Integer} Size of every group
   */
  function chunkArray(myArray, chunkSize) {
    var results = [];

    while (myArray.length) {
      results.push(myArray.splice(0, chunkSize));
    }

    return results;
  }
};

canvasSketch(sketch, settings);
