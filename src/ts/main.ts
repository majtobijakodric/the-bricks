import '../style/style.css';
import { initializeBackground } from './background.ts';
import { initializeAsteroids, initializeRocketVelocity } from './entities.ts';
import { gameCanvas, setupCanvasSize } from './canvas.ts';
import { resetPadPosition, resetRocketPosition } from './entities.ts';
import { startGameLoop } from './game.ts';
import { renderScene } from './render.ts';
import { initializeUi } from './ui.ts';

initializeRocketVelocity();
initializeUi();

if (gameCanvas) {
  setupCanvasSize();
  resetPadPosition();
  resetRocketPosition();
  initializeBackground();
  initializeAsteroids();
  renderScene();
  startGameLoop();
}
