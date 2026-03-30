import Swal from 'sweetalert2';

import { setBallSpeed } from './ball.ts';
import { aboutButton, ballSpeedButton, padSpeedButton, pauseButton } from './canvas.ts';
import { pauseGame, resumeGame } from './gameControls.ts';
import { ball, isPaused, pad } from './gameState.ts';
import { setPadSpeed } from './pad.ts';

if (aboutButton) {
  aboutButton.addEventListener('click', async () => {
    const wasPaused = isPaused;
    pauseGame();

    await Swal.fire({
      title: 'About',
      html: `
      <p>Author: Maj Tobija Kodrič</p>
      <a href="https://github.com/majtobijakodric/the-bricks" target="_blank" class="text-blue-500 hover:underline">GitHub</a>
    `,
      icon: 'info',
      confirmButtonText: 'Close',
    });

    if (!wasPaused) {
      resumeGame();
    }
  });
}

if (pauseButton) {
  pauseButton.addEventListener('click', () => {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  });
}

if (ballSpeedButton) {
  ballSpeedButton.addEventListener('click', () => {
    Swal.fire({
      title: 'Set Ball Speed',
      input: 'range',
      inputLabel: 'Ball Speed',
      inputAttributes: {
        min: '1',
        max: '100',
        step: '1',
      },
      inputValue: ball.speed,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setBallSpeed(Number(result.value));
      }
    });
  });
}

if (padSpeedButton) {
  padSpeedButton.addEventListener('click', () => {
    Swal.fire({
      title: 'Set Pad Speed',
      input: 'range',
      inputLabel: 'Pad Speed',
      inputAttributes: {
        min: '1',
        max: '40',
        step: '1',
      },
      inputValue: pad.speed,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setPadSpeed(Number(result.value));
      }
    });
  });
}
