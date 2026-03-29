export let viewHeight = window.innerHeight;
export let viewWidth = window.innerWidth;

export const ballColor = 'red';
export const padColor = 'blue';
export const backgroundColor = 'lightgray';
export const brickColor = 'green';

export const CELL_SIDE_MARGIN_RATIO = 0.2;
export const CELL_TOP_MARGIN_RATIO = 0.1;

export let isPaused = false;

export const pad = {
  x: viewWidth / 2 - 25,
  y: viewHeight - 50,
  width: 100,
  height: 20,
  speed: 4,
};

export const ball = {
  x: viewWidth / 2,
  y: viewHeight / 2,
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
  width: 15,
  height: 22,
  marginLeftRight: 10,
  marginTop: 10,
  padding: 5,
};

export const rows = 15;
export const columns = 20;

export function setViewportSize(width: number, height: number) {
  viewWidth = width;
  viewHeight = height;
}

export function setPaused(value: boolean) {
  isPaused = value;
}
