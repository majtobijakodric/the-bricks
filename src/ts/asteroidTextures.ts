import { asteroidShapes } from './asteroidShapes.ts';
import type { AsteroidMaterial } from './bricks.ts';

type Palette = {
  base: string;
  highlight: string;
  shadow: string;
  outline: string;
  crater: string;
  speck: string;
  band: string;
};

const textureCache = new Map<string, HTMLCanvasElement>();

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const expanded = value.length === 3
    ? value.split('').map((part) => part + part).join('')
    : value;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getPalette(material: AsteroidMaterial): Palette {
  switch (material) {
    case 'red':
      return {
        base: '#7b2321',
        highlight: '#ca6b63',
        shadow: '#27100f',
        outline: 'rgba(255, 211, 205, 0.22)',
        crater: 'rgba(39, 8, 8, 0.36)',
        speck: 'rgba(255, 232, 229, 0.11)',
        band: 'rgba(255, 140, 128, 0.12)',
      };
    case 'silver':
      return {
        base: '#8b929a',
        highlight: '#e9eff3',
        shadow: '#30343a',
        outline: 'rgba(246, 249, 251, 0.24)',
        crater: 'rgba(22, 24, 28, 0.32)',
        speck: 'rgba(255, 255, 255, 0.16)',
        band: 'rgba(255, 255, 255, 0.1)',
      };
    case 'iron':
      return {
        base: '#646c74',
        highlight: '#b0bac4',
        shadow: '#1f2429',
        outline: 'rgba(208, 217, 226, 0.18)',
        crater: 'rgba(8, 10, 12, 0.32)',
        speck: 'rgba(255, 255, 255, 0.09)',
        band: 'rgba(188, 198, 208, 0.1)',
      };
    case 'rock':
    default:
      return {
        base: '#61574e',
        highlight: '#a39686',
        shadow: '#221d19',
        outline: 'rgba(255, 237, 214, 0.16)',
        crater: 'rgba(0, 0, 0, 0.22)',
        speck: 'rgba(255, 255, 255, 0.08)',
        band: 'rgba(255, 239, 214, 0.08)',
      };
  }
}

function buildPath(
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  width: number,
  height: number,
) {
  ctx.beginPath();

  points.forEach(([px, py], index) => {
    const sx = px * width;
    const sy = py * height;

    if (index === 0) {
      ctx.moveTo(sx, sy);
      return;
    }

    ctx.lineTo(sx, sy);
  });

  ctx.closePath();
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  width: number,
  height: number,
  palette: Palette,
) {
  const noiseCount = Math.max(10, Math.round((width * height) / 14));

  for (let index = 0; index < noiseCount; index += 1) {
    const size = 1 + Math.floor(rand() * 3);
    const x = Math.floor(rand() * Math.max(1, width - size));
    const y = Math.floor(rand() * Math.max(1, height - size));
    const alpha = 0.04 + rand() * 0.14;
    const tint = rand() < 0.6 ? palette.band : palette.speck;

    ctx.fillStyle = hexToRgba(tint, alpha);
    ctx.fillRect(x, y, size, size);
  }
}

function drawBands(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  width: number,
  height: number,
  palette: Palette,
) {
  ctx.fillStyle = palette.band;
  const bandCount = 2 + Math.floor(rand() * 2);

  for (let index = 0; index < bandCount; index += 1) {
    const bandY = Math.floor(height * (0.22 + rand() * 0.58));
    const bandHeight = 1 + Math.floor(rand() * 2);
    const bandInset = Math.floor(width * (0.08 + rand() * 0.08));
    ctx.fillRect(bandInset, bandY, width - bandInset * 2, bandHeight);
  }
}

function drawCraters(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  width: number,
  height: number,
  palette: Palette,
) {
  const craterCount = 2 + Math.floor(rand() * 3);

  for (let index = 0; index < craterCount; index += 1) {
    const radius = Math.max(1.5, Math.min(width, height) * (0.05 + rand() * 0.04));
    const cx = width * (0.24 + rand() * 0.52);
    const cy = height * (0.22 + rand() * 0.46);

    ctx.beginPath();
    ctx.fillStyle = palette.crater;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 1;
    ctx.arc(cx - radius * 0.15, cy - radius * 0.15, radius * 0.82, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function generateTexture(
  shapeIndex: number,
  material: AsteroidMaterial,
  variant: number,
  targetWidth: number,
  targetHeight: number,
) {
  const textureWidth = Math.max(18, Math.round(targetWidth));
  const textureHeight = Math.max(14, Math.round(targetHeight));
  const key = `${shapeIndex}:${material}:${variant}:${textureWidth}x${textureHeight}`;
  const cached = textureCache.get(key);

  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  const rand = mulberry32(hashString(key));
  const palette = getPalette(material);
  const shape = asteroidShapes[shapeIndex] ?? asteroidShapes[0];

  ctx.imageSmoothingEnabled = true;

  buildPath(ctx, shape.points, textureWidth, textureHeight);
  ctx.clip();

  const baseGradient = ctx.createLinearGradient(0, 0, textureWidth, textureHeight);
  baseGradient.addColorStop(0, palette.highlight);
  baseGradient.addColorStop(0.42, palette.base);
  baseGradient.addColorStop(1, palette.shadow);

  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, textureWidth, textureHeight);

  drawBands(ctx, rand, textureWidth, textureHeight, palette);
  drawNoise(ctx, rand, textureWidth, textureHeight, palette);
  drawCraters(ctx, rand, textureWidth, textureHeight, palette);

  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 1;
  buildPath(ctx, shape.points, textureWidth, textureHeight);
  ctx.stroke();

  textureCache.set(key, canvas);
  return canvas;
}

export function drawAsteroidTexture(
  ctx: CanvasRenderingContext2D,
  shapeIndex: number,
  material: AsteroidMaterial,
  variant: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const texture = generateTexture(shapeIndex, material, variant, width, height);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(texture, x, y, width, height);
  ctx.restore();
}
