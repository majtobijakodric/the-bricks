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
import { updateRefreshRateEstimate } from './refreshRate.ts';
import { initializeUi } from './ui.ts';

export let refreshRateEstimate = await updateRefreshRateEstimate();


// For fps estimation
/*
setInterval(() => {
  void updateRefreshRateEstimate().then((refreshRate) => {
    console.log(refreshRate);
    refreshRateEstimate = refreshRate;
  });
}, 1000);
*/

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
