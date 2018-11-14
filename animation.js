const canvasSketch = require('canvas-sketch');

const settings = {
  animate: true,
  dimensions: [2048, 2048],
};

const sketch = () => {
  return ({ context, width, height, time }) => {
    const v = Math.sin(time);

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'orange';
    context.fillRect(0, 0, v * width, height);
  };
};

canvasSketch(sketch, settings);
