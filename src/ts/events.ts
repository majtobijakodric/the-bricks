import { input, pad } from './gameState.ts';
import { movePad } from './pad.ts';
import { renderScene } from './render.ts';

export function setupEventListeners() {
  addEventListener('keydown', (event) => {
    const step = pad.speed;

    switch (event.key) {
      case 'ArrowLeft': {
        movePad(pad.x - step);
        input.left = true;
        renderScene();
        break;
      }
      case 'ArrowRight': {
        movePad(pad.x + step);
        input.right = true;
        renderScene();
        break;
      }
    }
  });

  addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') input.left = false;
    if (event.key === 'ArrowRight') input.right = false;
  });
}
