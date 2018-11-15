const canvasSketch = require('canvas-sketch');
const glsl = require('glslify');

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  dimensions: [512, 512],
  // Turn on MSAA
  attributes: { antialias: true },
};

const sketch = ({ context, canvas }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  canvas.style.borderRadius = '50%';

  // WebGL background color
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        aspect: { value: 0 },
      },
      vertexShader: glsl(/* syntax: glsl */ `
        #pragma glslify: noise = require('glsl-noise/simplex/4d');
        uniform float time;
        varying vec2 vUv;
        void main () {
          vec3 transformed = position.xyz + normal * noise(vec4(position.xyz, time * 2.0)) / 10.0;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.0);
        }
      `),
      fragmentShader: glsl(/* syntax: glsl */ `
        uniform float time;
        uniform float aspect;
        uniform vec2 pointer;
        varying vec2 vUv;

        #pragma glslify: noise = require('glsl-noise/simplex/3d');
        #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

        void main () {
          float d = 0.0;
          d += 0.15 * noise(vec3(vUv * 1.5, time * 0.5));
          d += 0.5 * noise(vec3(vUv * 0.51, time * 0.5));

          float hue = d * 0.25;
          hue = mod(hue + time * 0.05, 1.0);

          vec3 color = hsl2rgb(hue, 0.5, 0.5);
          gl_FragColor = vec4(vec3(color), 1.0);
        }
      `),
    })
  );
  scene.add(mesh);

  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#59314f'));

  // Add some light
  const light = new THREE.PointLight('#45caf7', 1, 15.5);
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
    render({ time, width, height }) {
      mesh.material.uniforms.time.value = time;
      mesh.material.uniforms.aspect.value = width / height;
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

document.body.style.background = '#000';
