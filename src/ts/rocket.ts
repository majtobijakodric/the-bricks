import { asteroids, removeAsteroidAtIndex, type Asteroid } from './asteroids.ts';
import { featureConfig } from './config.ts';
import { fuel, hasHandledBottomMiss, loseFuel, markBottomMissHandled, pad, canvasHeight, canvasWidth, resetBottomMissState, rocket, setGameOver } from './gameState.ts';
import { showGameOverModal, updateFuelTankLevel } from './ui.ts';

export function initializeRocketVelocity() {
  const launchAngle = (Math.random() * Math.PI) / 2 + Math.PI / 4;
  const horizontalDirection = Math.random() < 0.5 ? -1 : 1;

  rocket.dx = Math.cos(launchAngle) * rocket.speed * horizontalDirection;
  rocket.dy = -Math.sin(launchAngle) * rocket.speed;
}

export function setRocketSpeed(speed: number) {
  rocket.speed = speed;
  const angle = Math.atan2(rocket.dy, rocket.dx);
  rocket.dx = Math.cos(angle) * rocket.speed;
  rocket.dy = Math.sin(angle) * rocket.speed;
}

export function updateRocketPosition() {
  rocket.x += rocket.dx;
  rocket.y += rocket.dy;
}

export function handleWallCollisions() {
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

  // Get the edges of the rocket and the asteroid to check for overlap.
  const rocketLeft = rocket.x - rocket.radius;
  const rocketRight = rocket.x + rocket.radius;
  const rocketTop = rocket.y - rocket.radius;
  const rocketBottom = rocket.y + rocket.radius;

  // Get the edges of the asteroid.
  const asteroidLeft = asteroid.x;
  const asteroidRight = asteroid.x + asteroid.width;
  const asteroidTop = asteroid.y;
  const asteroidBottom = asteroid.y + asteroid.height;

  // Check if the rocket overlaps with the asteroid horizontally and vertically.
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

    // Move the rocket outside the asteroid so it does not collide again immediately.
    if (overlapFromLeft < overlapFromRight) {
      rocket.x = asteroid.x - rocket.radius;
      return;
    }

    rocket.x = asteroid.x + asteroid.width + rocket.radius;
    return;
  }

  rocket.dy *= -1;

  // Move the rocket outside the asteroid so it does not collide again immediately.
  if (overlapFromTop < overlapFromBottom) {
    rocket.y = asteroid.y - rocket.radius;
    return;
  }

  rocket.y = asteroid.y + asteroid.height + rocket.radius;
}

export function handleAsteroidCollisions() {
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
