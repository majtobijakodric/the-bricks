import { canvasConfig } from './config.ts';

export const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas');
export const aboutButton = document.querySelector<HTMLButtonElement>('#aboutButton');
export const pauseButton = document.querySelector<HTMLButtonElement>('#pauseButton');
export const rocketSpeedButton = document.querySelector<HTMLButtonElement>('#rocketSpeedButton');
export const padSpeedButton = document.querySelector<HTMLButtonElement>('#padSpeedButton');

export function setupCanvasSize() {
  if (!gameCanvas) return;

  gameCanvas.width = canvasConfig.width;
  gameCanvas.height = canvasConfig.height;
  gameCanvas.style.width = `${canvasConfig.width}px`;
  gameCanvas.style.height = `${canvasConfig.height}px`;
  gameCanvas.style.backgroundColor = 'transparent';
}
