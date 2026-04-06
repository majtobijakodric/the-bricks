import { drawAsteroidSprite } from './entities.ts';
import { gameCanvas } from './canvas.ts';
import { asteroids } from './entities.ts';
import rocketSrc from '../assets/rockets/rocketBlue.png';
import { rocketSpriteConfig } from './config.ts';
import { pad, padColor, rocket } from './game.ts';

const rocketImage = new Image();
rocketImage.src = rocketSrc;

// The sprite points upward by default, then gets flipped 180 degrees.
const rocketRotationOffset = Math.PI / 2;

export function renderScene() {
  if (!gameCanvas) {
    return;
  }

  const ctx = gameCanvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  renderAsteroids(ctx);

  // Pad
  ctx.fillStyle = padColor;
  ctx.fillRect(pad.x, pad.y, pad.width, pad.height);

  // Rocket
  const size = rocket.radius * rocketSpriteConfig.sizeMultiplier;
  const angle = Math.atan2(rocket.dy, rocket.dx) + rocketRotationOffset;

  ctx.save();
  ctx.translate(rocket.x, rocket.y);
  ctx.rotate(angle);

  if (rocketImage.complete && rocketImage.naturalWidth > 0) {
    const fitScale = size / Math.max(rocketImage.naturalWidth, rocketImage.naturalHeight);
    const drawWidth = rocketImage.naturalWidth * fitScale;
    const drawHeight = rocketImage.naturalHeight * fitScale;

    ctx.drawImage(rocketImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, rocket.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  }

  ctx.restore();
}

function renderAsteroids(ctx: CanvasRenderingContext2D) {
  asteroids.forEach((asteroid) => {
    drawAsteroidSprite(
      ctx,
      asteroid.sprite,
      asteroid.x,
      asteroid.y,
      asteroid.width,
      asteroid.height,
    );
  });
}
