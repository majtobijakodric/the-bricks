import { brickLayoutConfig, canvasConfig, colorConfig, featureConfig } from './config.ts';

export let canvasHeight = canvasConfig.height;
export let canvasWidth = canvasConfig.width;

export const ballColor = colorConfig.ball;
export const padColor = colorConfig.pad;
export const backgroundColor = colorConfig.background;
export const brickColor = colorConfig.brick;

export const BRICK_AREA_OFFSET_X = brickLayoutConfig.offsetX;
export const BRICK_AREA_OFFSET_Y = brickLayoutConfig.offsetY;

export let isPaused = false;
export let isGameOver = false;
export let lives = featureConfig.maxLives;
export let hasHandledBottomMiss = false;

export const pad = {
  x: canvasWidth / 2 - 25,
  y: canvasHeight - 50,
  width: 100,
  height: 20,
  speed: 4,
};

export const ball = {
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
  width: brickLayoutConfig.cell.width,
  height: brickLayoutConfig.cell.height,
  marginLeftRight: brickLayoutConfig.cell.marginLeftRight,
  marginTop: brickLayoutConfig.cell.marginTop,
  padding: brickLayoutConfig.cell.padding,
};

export const rows = brickLayoutConfig.rows;
export const columns = brickLayoutConfig.columns;

// Resets the fixed canvas size.
export function resetCanvasSize() {
  canvasWidth = canvasConfig.width;
  canvasHeight = canvasConfig.height;
}

// Places the ball just above the paddle.
export function resetBallPosition() {
  ball.x = pad.x + pad.width / 2;
  ball.y = pad.y - ball.radius - 5;
}

// Puts the paddle back at the bottom center.
export function resetPadPosition() {
  pad.x = canvasWidth / 2 - pad.width / 2;
  pad.y = canvasHeight - pad.height - 10;
}

export function setPaused(value: boolean) {
  isPaused = value;
}

export function setGameOver(value: boolean) {
  isGameOver = value;
}

export function loseLife() {
  lives = Math.max(0, lives - 1);
}

export function resetLives() {
  lives = featureConfig.maxLives;
}

export function resetBottomMissState() {
  hasHandledBottomMiss = false;
}

export function markBottomMissHandled() {
  hasHandledBottomMiss = true;
}

export function setBallVelocity(x: number, y: number) {
  ball.dx = x;
  ball.dy = y;
}
