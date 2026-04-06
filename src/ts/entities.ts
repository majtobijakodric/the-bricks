import { ASTEROID_AREA_OFFSET_X, ASTEROID_AREA_OFFSET_Y, cell, columns, rows, canvasHeight, canvasWidth, fuel, hasHandledBottomMiss, isRocketLaunched, loseFuel, markBottomMissHandled, pad, rocket, resetBottomMissState, setGameOver, setRocketLaunched } from './game.ts';
import { featureConfig } from './config.ts';
import { showGameOverModal, updateFuelTankLevel } from './ui.ts';

export type AsteroidMaterial = 'red' | 'silver' | 'iron' | 'rock';

export type Asteroid = {
  x: number;
  y: number;
  width: number;
  height: number;
  shapeIndex: number;
  material: AsteroidMaterial;
  textureVariant: number;
};

export type AsteroidPoint = readonly [number, number];

export type AsteroidShape = {
  points: readonly AsteroidPoint[];
};

export const asteroidShapes: readonly AsteroidShape[] = [
  { points: [[0.10, 0.22], [0.28, 0.06], [0.62, 0.10], [0.88, 0.28], [0.80, 0.62], [0.56, 0.90], [0.22, 0.84], [0.06, 0.52]] },
  { points: [[0.16, 0.10], [0.46, 0.04], [0.78, 0.16], [0.92, 0.42], [0.74, 0.80], [0.40, 0.94], [0.14, 0.70], [0.04, 0.36]] },
  { points: [[0.08, 0.34], [0.18, 0.12], [0.50, 0.08], [0.82, 0.18], [0.94, 0.50], [0.74, 0.86], [0.42, 0.92], [0.12, 0.68]] },
  { points: [[0.12, 0.18], [0.36, 0.08], [0.68, 0.12], [0.90, 0.34], [0.86, 0.62], [0.62, 0.88], [0.30, 0.92], [0.06, 0.58]] },
  { points: [[0.10, 0.14], [0.30, 0.06], [0.56, 0.08], [0.82, 0.20], [0.94, 0.44], [0.86, 0.74], [0.54, 0.92], [0.20, 0.82], [0.04, 0.50]] },
  { points: [[0.14, 0.08], [0.42, 0.06], [0.70, 0.12], [0.90, 0.30], [0.88, 0.60], [0.66, 0.88], [0.34, 0.92], [0.10, 0.68], [0.06, 0.34]] },
  { points: [[0.08, 0.20], [0.24, 0.06], [0.54, 0.04], [0.82, 0.14], [0.96, 0.38], [0.90, 0.70], [0.62, 0.92], [0.26, 0.88], [0.06, 0.56]] },
  { points: [[0.10, 0.30], [0.22, 0.12], [0.44, 0.04], [0.74, 0.08], [0.92, 0.26], [0.92, 0.56], [0.70, 0.88], [0.38, 0.94], [0.12, 0.72], [0.04, 0.44]] },
  { points: [[0.12, 0.12], [0.32, 0.04], [0.58, 0.06], [0.80, 0.18], [0.94, 0.40], [0.84, 0.66], [0.64, 0.90], [0.34, 0.92], [0.10, 0.64], [0.04, 0.32]] },
  { points: [[0.16, 0.20], [0.34, 0.08], [0.60, 0.04], [0.84, 0.12], [0.94, 0.34], [0.90, 0.62], [0.68, 0.88], [0.38, 0.94], [0.16, 0.78], [0.06, 0.48]] },
  { points: [[0.08, 0.16], [0.26, 0.06], [0.52, 0.04], [0.76, 0.12], [0.92, 0.32], [0.88, 0.58], [0.72, 0.84], [0.46, 0.94], [0.18, 0.86], [0.04, 0.54]] },
  { points: [[0.10, 0.08], [0.28, 0.04], [0.54, 0.08], [0.76, 0.18], [0.92, 0.38], [0.88, 0.68], [0.64, 0.92], [0.32, 0.90], [0.10, 0.70], [0.04, 0.36]] },
  { points: [[0.14, 0.16], [0.38, 0.06], [0.62, 0.08], [0.86, 0.20], [0.96, 0.46], [0.86, 0.76], [0.56, 0.92], [0.22, 0.88], [0.06, 0.58]] },
  { points: [[0.08, 0.26], [0.20, 0.10], [0.46, 0.04], [0.72, 0.08], [0.90, 0.24], [0.96, 0.50], [0.82, 0.82], [0.50, 0.94], [0.18, 0.82], [0.04, 0.46]] },
  { points: [[0.12, 0.22], [0.30, 0.08], [0.56, 0.06], [0.78, 0.14], [0.94, 0.30], [0.92, 0.60], [0.72, 0.86], [0.44, 0.94], [0.16, 0.76], [0.06, 0.44]] },
] as const;

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

function randomShapeIndex() {
  return Math.floor(Math.random() * asteroidShapes.length);
}

function randomTextureVariant() {
  return Math.floor(Math.random() * 3);
}

function pickMaterial() {
  const materials: Array<{ material: AsteroidMaterial; weight: number }> = [
    { material: 'red', weight: 4 },
    { material: 'silver', weight: 8 },
    { material: 'iron', weight: 18 },
    { material: 'rock', weight: 70 },
  ];

  const totalWeight = materials.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const entry of materials) {
    threshold -= entry.weight;

    if (threshold <= 0) {
      return entry;
    }
  }

  return materials[materials.length - 1];
}

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

export let asteroids: Asteroid[] = [];

export function resetRocketLaunchState() {
  setRocketLaunched(false);
  resetRocketPosition();
}

export function launchRocketFromPad() {
  if (isRocketLaunched) {
    return;
  }

  setRocketLaunched(true);

  const launchAngle = (Math.random() * Math.PI) / 2 + Math.PI / 4;
  rocket.x = pad.x + pad.width / 2;
  rocket.y = pad.y - rocket.radius - 5;
  rocket.dx = Math.cos(launchAngle) * rocket.speed;
  rocket.dy = -Math.sin(launchAngle) * rocket.speed;
}

export function setRocketSpeed(speed: number) {
  rocket.speed = speed;
  if (!isRocketLaunched) {
    rocket.dx = 0;
    rocket.dy = -rocket.speed;
    return;
  }

  const angle = Math.atan2(rocket.dy, rocket.dx);
  rocket.dx = Math.cos(angle) * rocket.speed;
  rocket.dy = Math.sin(angle) * rocket.speed;
}

export function updateRocketPosition() {
  if (!isRocketLaunched) {
    return;
  }

  rocket.x += rocket.dx;
  rocket.y += rocket.dy;
}

export function movePad(x: number) {
  pad.x = Math.max(0, Math.min(canvasWidth - pad.width, x));
}

export function movePadBy(x: number) {
  movePad(pad.x + x);
}

export function setPadSpeed(speed: number) {
  pad.speed = speed;
}

export function resetPadPosition() {
  pad.x = canvasWidth / 2 - pad.width / 2;
  pad.y = canvasHeight - pad.height - 10;
}

export function resetRocketPosition() {
  rocket.x = pad.x + pad.width / 2;
  rocket.y = pad.y - rocket.radius - 5;
  rocket.dx = 0;
  rocket.dy = -rocket.speed;
}

export function initializeAsteroids() {
  asteroids = [];

  const startX = ASTEROID_AREA_OFFSET_X;
  const startY = ASTEROID_AREA_OFFSET_Y;
  const availableWidth = canvasWidth - ASTEROID_AREA_OFFSET_X * 2;
  const totalHorizontalSpacing = cell.marginLeftRight * (columns - 1);
  const cellWidth = (availableWidth - totalHorizontalSpacing) / columns;

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < columns; j += 1) {
      const material = pickMaterial();

      asteroids.push({
        x: startX + (j * (cellWidth + cell.marginLeftRight)),
        y: startY + (i * (cell.height + cell.marginTop)),
        width: cellWidth,
        height: cell.height,
        shapeIndex: randomShapeIndex(),
        material: material.material,
        textureVariant: randomTextureVariant(),
      });
    }
  }
}

export function removeAsteroidAtIndex(index: number) {
  asteroids.splice(index, 1);
}

export function handleWallCollisions() {
  if (!isRocketLaunched) {
    return;
  }

  if (rocket.x + rocket.radius >= canvasWidth || rocket.x - rocket.radius <= 0) {
    rocket.dx *= -1;
    rocket.x = Math.max(rocket.radius, Math.min(canvasWidth - rocket.radius, rocket.x));
  }

  if (rocket.y - rocket.radius <= 0) {
    rocket.dy *= -1;
    rocket.y = rocket.radius;
  }

  const bottomLimit = canvasHeight + (featureConfig.enableDeath ? featureConfig.deathBoundaryOffset : 0);
  const rocketBottom = rocket.y + rocket.radius;

  if (featureConfig.enableDeath) {
    if (hasHandledBottomMiss && rocketBottom < canvasHeight) {
      resetBottomMissState();
    }

    if (rocket.dy > 0 && rocketBottom >= bottomLimit) {
      if (!hasHandledBottomMiss) {
        loseFuel();
        updateFuelTankLevel(fuel / featureConfig.maxFuel);
        markBottomMissHandled();
      }

      rocket.dy = -Math.abs(rocket.dy);
      rocket.y = bottomLimit - rocket.radius;

      if (fuel === 0) {
        setGameOver(true);
        void showGameOverModal();
      }
    }

    return;
  }

  if (rocketBottom >= bottomLimit) {
    rocket.dy *= -1;
    rocket.y = bottomLimit - rocket.radius;
  }
}

export function handlePadCollision() {
  if (!isRocketLaunched) {
    return;
  }

  const hitsPadHorizontally = rocket.x + rocket.radius >= pad.x && rocket.x - rocket.radius <= pad.width + pad.x;
  const hitsPadVertically = rocket.y + rocket.radius >= pad.y && rocket.y - rocket.radius <= pad.y + pad.height;

  if (rocket.dy > 0 && hitsPadHorizontally && hitsPadVertically) {
    const relativeHit = (rocket.x - (pad.x + pad.width / 2)) / pad.width;

    rocket.dx = 8 * relativeHit;
    rocket.dy = -Math.abs(rocket.dy);
    rocket.y = pad.y - rocket.radius;
  }
}

function isRocketTouchingAsteroid(asteroid: Asteroid) {
  const rocketLeft = rocket.x - rocket.radius;
  const rocketRight = rocket.x + rocket.radius;
  const rocketTop = rocket.y - rocket.radius;
  const rocketBottom = rocket.y + rocket.radius;

  const asteroidLeft = asteroid.x;
  const asteroidRight = asteroid.x + asteroid.width;
  const asteroidTop = asteroid.y;
  const asteroidBottom = asteroid.y + asteroid.height;

  const overlapsHorizontally = rocketRight >= asteroidLeft && rocketLeft <= asteroidRight;
  const overlapsVertically = rocketBottom >= asteroidTop && rocketTop <= asteroidBottom;

  return overlapsHorizontally && overlapsVertically;
}

function bounceRocketOffAsteroid(asteroid: Asteroid) {
  const overlapFromLeft = rocket.x + rocket.radius - asteroid.x;
  const overlapFromRight = asteroid.x + asteroid.width - (rocket.x - rocket.radius);
  const overlapFromTop = rocket.y + rocket.radius - asteroid.y;
  const overlapFromBottom = asteroid.y + asteroid.height - (rocket.y - rocket.radius);

  const horizontalOverlap = Math.min(overlapFromLeft, overlapFromRight);
  const verticalOverlap = Math.min(overlapFromTop, overlapFromBottom);

  if (horizontalOverlap < verticalOverlap) {
    rocket.dx *= -1;

    if (overlapFromLeft < overlapFromRight) {
      rocket.x = asteroid.x - rocket.radius;
      return;
    }

    rocket.x = asteroid.x + asteroid.width + rocket.radius;
    return;
  }

  rocket.dy *= -1;

  if (overlapFromTop < overlapFromBottom) {
    rocket.y = asteroid.y - rocket.radius;
    return;
  }

  rocket.y = asteroid.y + asteroid.height + rocket.radius;
}

export function handleAsteroidCollisions() {
  if (!isRocketLaunched) {
    return;
  }

  for (let index = 0; index < asteroids.length; index += 1) {
    const asteroid = asteroids[index];

    if (!isRocketTouchingAsteroid(asteroid)) {
      continue;
    }

    bounceRocketOffAsteroid(asteroid);
    removeAsteroidAtIndex(index);
    return;
  }
}
