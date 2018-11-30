const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');
const loadAsset = require('load-asset');
const dat = require('dat.gui');

// Setup our sketch
const settings = {
  context: 'webgl',
  animate: true,
  gui: true,
  // dimensions: [1024, 1024],
};

// Your glsl code
const frag = require('./shader.frag');
const vert = require('./shader.vert');

// Your sketch, which simply returns the shader
const sketch = async ({ gl, context }) => {
  const image = await loadAsset('./assets/bg.jpg');
  const pointer = [
    window.innerWidth / 2 / window.innerWidth,
    (window.innerHeight - window.innerHeight / 2 - 1) / window.innerHeight,
  ];
  const mousemoveHandler = ({ clientY, clientX }) => {
    pointer[0] = clientX / window.innerWidth;
    pointer[1] = (window.innerHeight - clientY - 1) / window.innerHeight;
  };
  document.addEventListener('mousemove', mousemoveHandler);

  const gui = new dat.GUI();

  const params = {
    mask: 0.25,
    innerScale: 0,
    x: 0,
    y: 0,
  };

  gui.add(params, 'mask', -1.75, 2.5).step(0.01);
  gui.add(params, 'innerScale', 0, 1).step(0.01);
  gui.add(params, 'x', 0, window.innerWidth).step(1);
  gui.add(params, 'y', 0, window.innerHeight).step(1);

  Object.keys(params).forEach((key, index) => {});

  // Create the shader and return it
  const shader = createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    vert,
    clearColor: false,
    controls: {},
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      texture: image,
      time: ({ time }) => time,
      pointer: () => {
        const p = [0, 0];
        p[0] = params.x / window.innerWidth;
        p[1] = (window.innerHeight - params.y - 1) / window.innerHeight;
        return p;
      },
      aspect: ({ width, height }) => width / height,
      maskSize: () => params.mask,
      innerScale: () => params.innerScale,
    },
  });

  const head = document.querySelector('head');
  const style = document.createElement('style');
  style.innerHTML = /* syntax:css */ `
    html {
      font-family: serif;
      background-color: red;
    }

    h1 {
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      margin: 0;
      font-weight: 400;
      color: #222;
      background: #fff;
    }

    h1::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(transparent, #fff);
    }

    h1::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(/assets/bg.jpg);
      background-size: 100% 100%;
      opacity: 0.1;
      transform: scale(-1, 1);
    }

    canvas {
      z-index: 11111;
      position: relative;
    }

    .dg.ac {
      z-index: 999999;
    }
  `;
  head.appendChild(style);

  const text = document.createElement('h1');
  text.innerHTML = '';

  document.body.appendChild(text);

  return {
    render(props) {
      shader.render(props);
    },
    unload() {
      shader.unload();
      document.removeEventListener('mousemose', mousemoveHandler);
      head.removeChild(style);
      document.body.removeChild(text);
      gui.destroy();
    },
  };
};

async function start() {
  const cvs = await canvasSketch(sketch, settings);
  return cvs;
}

start().then(cvs => {
  console.log(cvs);
});
