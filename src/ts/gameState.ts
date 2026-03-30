import { brickLayoutConfig, canvasConfig, colorConfig } from './config.ts';

export let canvasHeight = canvasConfig.height;
export let canvasWidth = canvasConfig.width;

export const ballColor = colorConfig.ball;
export const padColor = colorConfig.pad;
export const backgroundColor = colorConfig.background;
export const brickColor = colorConfig.brick;

export const CELL_SIDE_MARGIN_RATIO = brickLayoutConfig.sideMarginRatio;
export const CELL_TOP_MARGIN_RATIO = brickLayoutConfig.topMarginRatio;

export let isPaused = false;

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

// Centers the ball on the canvas.
export function resetBallPosition() {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
}

// Puts the paddle back at the bottom center.
export function resetPadPosition() {
  pad.x = canvasWidth / 2 - pad.width / 2;
  pad.y = canvasHeight - pad.height - 10;
}

export function setPaused(value: boolean) {
  isPaused = value;
}
