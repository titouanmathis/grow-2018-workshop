import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
import palettes from 'nice-color-palettes';
import { lerp } from 'canvas-sketch-util/math';

/**
 * Set the random's method seed
 */
random.setSeed(random.getRandomSeed());

/**
 * Canvas sketch settings
 * @see https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#settings
 * @type {Object}
 */
const settings = {
  suffix: random.getSeed(),
  animate: true,
  dimensions: [512, 512],
};

const sketch = () => {
  const palette = random.pick(palettes);
  const background = palette.shift();
  /**
   * Create a grid of points
   * @param  {Number} count The number of columns and rows
   * @return {Array}        A list of points
   */
  const createGrid = (count = 20) => {
    const points = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        points.push({
          position: [u, v],
          radius: random.range(1, 20),
          color: random.pick(palette),
        });
      }
    }

    return points;
  };

  const grid = createGrid().filter(() => random.chance(0.5));

  return ({ context, width, height, time }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const wave = Math.sin(time);
    const margin = 0.15 * width;

    grid.forEach(({ position, color, radius }, index) => {
      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
