import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
import { lerp, mapRange, dampArray } from 'canvas-sketch-util/math';

const settings = {
  animate: true,
  scaleToView: true,
  dimensions: [2048, 2048],
};

const pointer = {
  x: 0,
  y: 0,
};
window.addEventListener('mousemove', ({ clientX, clientY }) => {
  pointer.x = clientX;
  pointer.y = clientY;
});

const sketch = ({ render, width, height }) => {
  document.addEventListener('keyup', ({ which }) => {
    if (which === 32) render();
  });
  const createGrid = (count = 10) => {
    const points = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        let u = count <= 1 ? 0.5 : x / (count - 1);
        let v = count <= 1 ? 0.5 : y / (count - 1);

        points.push({
          position: [u, v],
        });
      }
    }

    return points;
  };

  const grid = createGrid(10);
  const margin = 0.1 * width;
  const pointA = random.pick(grid);
  const pointB = random.pick(grid);

  const getPositionFromUv = ([u, v]) => {
    return {
      x: lerp(margin, width - margin, u),
      y: lerp(margin, height - margin, v),
    };
  };

  const drawTriangle = (time, ctx, a, b, c = { position: [0.5, 0.5] }) => {
    ctx.beginPath();

    const uA = mapRange(pointer.x, 0, innerWidth, 0, 1, true);
    const vA = mapRange(pointer.y, 0, innerHeight, 0, 1, true);
    a.position = dampArray(a.position, [uA, vA], 0.0005, time);

    // const uB = mapRange(pointer.x, 0, innerWidth, 0.4, 0.6, true);
    // const vB = mapRange(pointer.y, 0, innerHeight, 0.4, 0.6, true);
    // pointB.position = dampArray(pointB.position, [uB, vB], 0.0005, time);

    [a, b, c].forEach(({ position }, index) => {
      let { x, y } = getPositionFromUv(position);
      const method = index === 0 ? 'moveTo' : 'lineTo';

      ctx[method](x, y);
    });

    ctx.closePath();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    // ctx.fillStyle = 'red';
    // ctx.fill();
  };

  return ({ context, width, height, time }) => {
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 0.1;
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    grid.forEach(point => {
      // const [u, v] = position;
      // const x = lerp(margin, width - margin, u);
      // const y = lerp(margin, height - margin, v);

      // context.globalCompositeOperation = 'xor';
      drawTriangle(time, context, point, pointA, pointB);

      // context.beginPath();
      // context.arc(x, y, 5, 0, Math.PI * 2);
      // context.fillStyle = 'red';
      // context.fill();
      // context.closePath();
    });

    // drawTriangle(context, random.pick(grid), random.pick(grid));
    // drawTriangle(context, random.pick(grid), random.pick(grid));
    // drawTriangle(context, random.pick(grid), random.pick(grid));
    // drawTriangle(context, random.pick(grid), random.pick(grid));
    // drawTriangle(context, random.pick(grid), random.pick(grid));
  };
};

canvasSketch(sketch, settings);
