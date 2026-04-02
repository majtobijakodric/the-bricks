import { input, isGameOver, pad } from './gameState.ts';
import { movePad } from './pad.ts';
import { renderScene } from './render.ts';
import { prepareAudio } from './sound.ts';

export function setupEventListeners() {
  addEventListener('pointerdown', () => {
    void prepareAudio();
  });

  addEventListener('keydown', (event) => {
    void prepareAudio();

    if (isGameOver) {
      return;
    }

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
    if (isGameOver) {
      return;
    }

    if (event.key === 'ArrowLeft') input.left = false;
    if (event.key === 'ArrowRight') input.right = false;
  });
}
