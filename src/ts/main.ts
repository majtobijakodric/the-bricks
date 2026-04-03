import '../style/style.css';
import { initializeBackground } from './background.ts';
import './buttons.ts';
import { initializeBallVelocity } from './ball.ts';
import { gameCanvas, setupCanvasSize } from './canvas.ts';
import { initializeBricks } from './bricks.ts';
import { setupEventListeners } from './events.ts';
import { startGameLoop } from './gameLoop.ts';
import { resetBallPosition, resetPadPosition } from './gameState.ts';
import { renderScene } from './render.ts';
import { initializeUi } from './ui.ts';

initializeBallVelocity();
initializeUi();

if (gameCanvas) {
  setupCanvasSize();
  resetPadPosition();
  resetBallPosition();
  initializeBackground();
  initializeBricks();
  renderScene();
  startGameLoop();
}

setupEventListeners();
