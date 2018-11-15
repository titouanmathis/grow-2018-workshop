const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
  context: 'webgl',
  animate: true,
};

const pointer = [];
document.addEventListener('mousemove', ({ clientX, clientY }) => {
  pointer[0] = clientX / window.innerWidth;
  pointer[1] = clientY / window.innerHeight;
});

// Your glsl code
const frag = require('./shader.frag');

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      time: ({ time }) => time,
      pointer: () => pointer,
      aspect: ({ width, height }) => width / height,
    },
  });
};

canvasSketch(sketch, settings);
