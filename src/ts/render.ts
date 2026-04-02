import { drawAsteroidTexture } from './asteroidTextures.ts';
import { gameCanvas } from './canvas.ts';
import { bricks } from './bricks.ts';
import { ball, ballColor, pad, padColor } from './gameState.ts';

export function renderScene() {
  if (!gameCanvas) {
    return;
  }

  const ctx = gameCanvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  renderBricks(ctx);

  // Pad
  ctx.fillStyle = padColor;
  ctx.fillRect(pad.x, pad.y, pad.width, pad.height);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

function renderBricks(ctx: CanvasRenderingContext2D) {
  bricks.forEach((brick) => {
    drawAsteroidTexture(
      ctx,
      brick.shapeIndex,
      brick.material,
      brick.textureVariant,
      brick.x,
      brick.y,
      brick.width,
      brick.height,
    );
  });
}
