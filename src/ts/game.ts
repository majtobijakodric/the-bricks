import { featureConfig, canvasConfig, asteroidLayoutConfig } from './config.ts';
import { gameCanvas } from './canvas.ts';
import {
  handleAsteroidCollisions,
  handlePadCollision,
  handleWallCollisions,
  initializeAsteroids,
  movePadBy,
  resetPadPosition,
  resetRocketLaunchState,
  resetRocketPosition,
  updateRocketPosition,
} from './entities.ts';
import { renderScene } from './render.ts';
import { resetGameOverModalState, showGameOverModal, updateFuelTankLevel } from './ui.ts';

export let canvasHeight = canvasConfig.height;
export let canvasWidth = canvasConfig.width;

export const rocketColor = 'red';
export const padColor = 'blue';
export const backgroundColor = 'lightgray';
export const asteroidColor = 'green';

export const ASTEROID_AREA_OFFSET_X = asteroidLayoutConfig.offsetX;
export const ASTEROID_AREA_OFFSET_Y = asteroidLayoutConfig.offsetY;

export let isPaused = false;
export let isGameOver = false;
export let isRocketLaunched = false;
export let fuel = featureConfig.maxFuel;
export let hasHandledBottomMiss = false;

export const pad = {
  x: canvasWidth / 2 - 25,
  y: canvasHeight - 50,
  width: 100,
  height: 20,
  speed: 4,
};

export const rocket = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  radius: 10,
  speed: 5,
  dx: 0,
  dy: 0,
};

export const input = {
  left: false,
  right: false,
};

export const cell = {
  width: asteroidLayoutConfig.cell.width,
  height: asteroidLayoutConfig.cell.height,
  marginLeftRight: asteroidLayoutConfig.cell.marginLeftRight,
  marginTop: asteroidLayoutConfig.cell.marginTop,
  padding: asteroidLayoutConfig.cell.padding,
};

export const rows = asteroidLayoutConfig.rows;
export const columns = asteroidLayoutConfig.columns;

export function resetCanvasSize() {
  canvasWidth = canvasConfig.width;
  canvasHeight = canvasConfig.height;
}

export function setPaused(value: boolean) {
  isPaused = value;
}

export function setGameOver(value: boolean) {
  isGameOver = value;
}

export function loseFuel(amount = 1) {
  fuel = Math.max(0, fuel - amount);
}

export function resetFuel() {
  fuel = featureConfig.maxFuel;
}

export function resetBottomMissState() {
  hasHandledBottomMiss = false;
}

export function setRocketLaunched(value: boolean) {
  isRocketLaunched = value;
}

export function markBottomMissHandled() {
  hasHandledBottomMiss = true;
}

export function pauseGame() {
  setPaused(true);
  input.left = false;
  input.right = false;
}

export function resumeGame() {
  setPaused(false);
}

export function restartGame() {
  setGameOver(false);
  setPaused(false);
  setRocketLaunched(false);
  input.left = false;
  input.right = false;

  resetFuel();
  resetBottomMissState();
  resetPadPosition();
  initializeAsteroids();
  resetRocketLaunchState();
  resetGameOverModalState();
  updateFuelTankLevel(1);

  renderScene();
  startGameLoop();
}

let lastActiveTimestamp: number | null = null;

function animateFrame(timestamp: number) {
  if (!gameCanvas) {
    return;
  }

  if (isPaused) {
    lastActiveTimestamp = null;
    renderScene();
    requestAnimationFrame(animateFrame);
    return;
  }

  if (isGameOver) {
    lastActiveTimestamp = null;
    renderScene();
    return;
  }

  if (!isRocketLaunched) {
    lastActiveTimestamp = timestamp;

    if (input.left) {
      movePadBy(-pad.speed);
    }

    if (input.right) {
      movePadBy(pad.speed);
    }

    resetRocketPosition();
    updateFuelTankLevel(fuel / featureConfig.maxFuel);
    renderScene();
    requestAnimationFrame(animateFrame);
    return;
  }

  const deltaMs = lastActiveTimestamp === null ? 0 : Math.min(timestamp - lastActiveTimestamp, 100);
  lastActiveTimestamp = timestamp;

  if (deltaMs > 0) {
    loseFuel((deltaMs / 1000) * featureConfig.fuelBurnPerSecond);
  }

  if (input.left) {
    movePadBy(-pad.speed);
  }

  if (input.right) {
    movePadBy(pad.speed);
  }

  updateRocketPosition();
  handleWallCollisions();

  updateFuelTankLevel(fuel / featureConfig.maxFuel);

  if (fuel === 0) {
    setGameOver(true);
    renderScene();
    void showGameOverModal();
    return;
  }

  if (isGameOver) {
    renderScene();
    return;
  }

  handlePadCollision();
  handleAsteroidCollisions();

  renderScene();
  requestAnimationFrame(animateFrame);
}

export function startGameLoop() {
  requestAnimationFrame(animateFrame);
}
