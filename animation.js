import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
import { vec2 } from 'gl-matrix';
import { expoInOut } from 'eases';
import bezierEasing from 'bezier-easing';

random.setSeed(random.getRandomSeed());

const settings = {
  suffix: random.getSeed(),
  animate: true,
  duration: 6,
  dimensions: [2048, 2048],
};

const sketch = ({ width, height }) => {
  const createGrid = (count = 40) => {
    const points = [];
    const frequency = random.range(0.5, 2.5);

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        let u = count <= 1 ? 0.5 : x / (count - 1);
        let v = count <= 1 ? 0.5 : y / (count - 1);
        points.push([u, v]);
      }
    }

    return points;
  };

  const loopNoise = (x, y, t, scale = 1) => {
    const duration = scale;
    const current = t * scale;
    return (
      ((duration - current) * random.noise3D(x, y, current) +
        current * random.noise3D(x, y, current - duration)) /
      duration
    );
  };

  const grid = createGrid();
  const ease = bezierEasing(0.5, 0.75, 0.75, 0.5);
  const frequency = 0.24;

  return ({ context, width, height, playhead }) => {
    const v = Math.sin(playhead) * 0.5 + 0.5;

    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    grid.forEach((point, index) => {
      const [u, v] = point;
      const x = u * width;
      const y = v * height;

      const noise = loopNoise(
        u * frequency,
        v * frequency,
        ease(playhead),
        0.5
      );
      const angle = noise * Math.PI * 40;
      const normal = [Math.cos(angle), Math.sin(angle)];
      const r = 4;
      const a = vec2.scaleAndAdd([0, 0], [x, y], normal, r);
      const b = vec2.scaleAndAdd([0, 0], [x, y], normal, r * 4);

      context.beginPath();
      [a, b].forEach(point => {
        context.lineTo(point[0], point[1]);
      });
      context.strokeStyle = '#fff';
      context.lineWidth = 4;
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
