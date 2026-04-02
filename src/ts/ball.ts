import { bricks, removeBrickAtIndex, type Brick } from './bricks.ts';
import { featureConfig } from './config.ts';
import {
  ball,
  canvasHeight,
  canvasWidth,
  hasHandledBottomMiss,
  loseLife,
  markBottomMissHandled,
  resetBottomMissState,
  setGameOver,
  lives,
} from './gameState.ts';
import { playBrickHitSound, playHeartLoseSound } from './sound.ts';
import { updateScore } from './scoring.ts';
import { showGameOverModal, updateLivesText } from './ui.ts';
import { pad } from './gameState.ts';

export function initializeBallVelocity() {
  const launchAngle = (Math.random() * Math.PI) / 2 + Math.PI / 4;
  const horizontalDirection = Math.random() < 0.5 ? -1 : 1;

  ball.dx = Math.cos(launchAngle) * ball.speed * horizontalDirection;
  ball.dy = -Math.sin(launchAngle) * ball.speed;
}

export function setBallSpeed(speed: number) {
  ball.speed = speed;
  const angle = Math.atan2(ball.dy, ball.dx);
  ball.dx = Math.cos(angle) * ball.speed;
  ball.dy = Math.sin(angle) * ball.speed;
}

export function updateBallPosition() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

export function handleWallCollisions() {
  if (ball.x + ball.radius >= canvasWidth || ball.x - ball.radius <= 0) {
    ball.dx *= -1;
    ball.x = Math.max(ball.radius, Math.min(canvasWidth - ball.radius, ball.x));
  }

  if (ball.y - ball.radius <= 0) {
    ball.dy *= -1;
    ball.y = ball.radius;
  }

  const bottomLimit = canvasHeight + (featureConfig.enableDeath ? featureConfig.deathBoundaryOffset : 0);
  const ballBottom = ball.y + ball.radius;

  if (featureConfig.enableDeath) {
    if (hasHandledBottomMiss && ballBottom < canvasHeight) {
      resetBottomMissState();
    }

    if (ball.dy > 0 && ballBottom >= bottomLimit) {
      if (!hasHandledBottomMiss) {
        loseLife();
        updateLivesText(lives);
        playHeartLoseSound();
        markBottomMissHandled();
      }

      ball.dy = -Math.abs(ball.dy);
      ball.y = bottomLimit - ball.radius;

      if (lives === 0) {
        setGameOver(true);
        void showGameOverModal();
      }
    }
    return;
  }

  if (ballBottom >= bottomLimit) {
    ball.dy *= -1;
    ball.y = bottomLimit - ball.radius;
  }
}

export function handlePadCollision() {
  const hitsPadHorizontally = ball.x + ball.radius >= pad.x && ball.x - ball.radius <= pad.width + pad.x;
  const hitsPadVertically = ball.y + ball.radius >= pad.y && ball.y - ball.radius <= pad.y + pad.height;

  if (ball.dy > 0 && hitsPadHorizontally && hitsPadVertically) {
    const relativeHit = (ball.x - (pad.x + pad.width / 2)) / pad.width;

    ball.dx = 8 * relativeHit;
    ball.dy = -Math.abs(ball.dy);
    ball.y = pad.y - ball.radius;
  }
}

function isBallTouchingBrick(brick: Brick) {

  // Get the edges of the ball and the brick to check for overlap.
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  // Get the edges of the brick.
  const brickLeft = brick.x;
  const brickRight = brick.x + brick.width;
  const brickTop = brick.y;
  const brickBottom = brick.y + brick.height;

  // Check if the ball overlaps with the brick horizontally and vertically.
  const overlapsHorizontally = ballRight >= brickLeft && ballLeft <= brickRight;
  const overlapsVertically = ballBottom >= brickTop && ballTop <= brickBottom;

  return overlapsHorizontally && overlapsVertically;
}

function bounceBallOffBrick(brick: Brick) {
  const overlapFromLeft = ball.x + ball.radius - brick.x;
  const overlapFromRight = brick.x + brick.width - (ball.x - ball.radius);
  const overlapFromTop = ball.y + ball.radius - brick.y;
  const overlapFromBottom = brick.y + brick.height - (ball.y - ball.radius);

  const horizontalOverlap = Math.min(overlapFromLeft, overlapFromRight);
  const verticalOverlap = Math.min(overlapFromTop, overlapFromBottom);

  if (horizontalOverlap < verticalOverlap) {
    ball.dx *= -1;

    // Move the ball outside the brick so it does not collide again immediately.
    if (overlapFromLeft < overlapFromRight) {
      ball.x = brick.x - ball.radius;
      return;
    }

    ball.x = brick.x + brick.width + ball.radius;
    return;
  }

  ball.dy *= -1;

  // Move the ball outside the brick so it does not collide again immediately.
  if (overlapFromTop < overlapFromBottom) {
    ball.y = brick.y - ball.radius;
    return;
  }

  ball.y = brick.y + brick.height + ball.radius;
}

export function handleBrickCollisions() {
  for (let index = 0; index < bricks.length; index += 1) {
    const brick = bricks[index];

    if (!isBallTouchingBrick(brick)) {
      continue;
    }

    bounceBallOffBrick(brick);
    playBrickHitSound();
    removeBrickAtIndex(index);
    updateScore(brick.points);
    return;
  }
}
