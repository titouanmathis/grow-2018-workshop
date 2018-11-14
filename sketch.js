import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
import palettes from 'nice-color-palettes';
import { lerp, clamp01 } from 'canvas-sketch-util/math';

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
  // animate: true,
  dimensions: 'A4',
  pixelsPerInch: 300,
  units: 'cm',
};

const sketch = ({ width, height }) => {
  const palette = random.pick(palettes);
  const background = '#000';
  const aspect = width / height;
  const texts = ['|', '—', '•'];

  /**
   * Create a grid of points
   * @param  {Number} count The number of columns and rows
   * @return {Array}        A list of points
   */
  const createGrid = (count = 100) => {
    const points = [];
    const frequency = random.range(0.5, 2.5);

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        let u = count <= 1 ? 0.5 : x / (count - 1);
        let v = count <= 1 ? 0.5 : y / (count - 1);

        const offset = random.insideCircle(0.001 * width);
        u += offset[0];
        v += offset[1];

        const noise = random.noise2D(u * aspect * frequency, v * frequency);

        points.push({
          position: [u, v],
          radius: Math.abs(10 + noise * 10) * width * 0.005,
          rotation: noise * Math.PI * 0.5,
          alpha: 0.5,
          color: random.pick(palette),
          text: random.pick(texts),
        });
      }
    }

    return points;
  };

  const grid = createGrid().filter(() => random.chance(0.5));

  return ({ context, width, height, time }) => {
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const margin = 0.2 * width;

    grid.forEach(
      ({ rotation, position, color, radius, text, alpha }, index) => {
        const [u, v] = position;
        const x = lerp(margin, width - margin, u);
        const y = lerp(margin, height - margin, v);

        // context.beginPath();
        // context.arc(x, y, radius, 0, Math.PI * 2);
        // context.fillStyle = color;
        // context.fill();

        context.save();
        context.fillStyle = color;
        context.fillStyle = `#fff`;
        context.font = `${radius}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.globalAlpha = alpha;
        context.translate(x, y);
        context.rotate(rotation);
        context.fillText(text, 0, 0);
        context.restore();
      }
    );
  };
};

canvasSketch(sketch, settings);

document.addEventListener('keydown', ({ which }) => {
  if (which === 32) {
    location.reload();
  }
});
