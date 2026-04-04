import Swal from 'sweetalert2';
import { createElement, Info, Pause, Play } from 'lucide';

import { setRocketSpeed } from './rocket.ts';
import { aboutButton, padSpeedButton, pauseButton, rocketSpeedButton } from './canvas.ts';
import { pauseGame, resumeGame } from './gameControls.ts';
import { isPaused, pad, rocket } from './gameState.ts';
import { setPadSpeed } from './pad.ts';

const swalTheme = {
  background: '#111827',
  color: '#ffffff',
  confirmButtonColor: '#334155',
};

function renderAboutButtonIcon(button: HTMLButtonElement) {
  button.replaceChildren(createElement(Info, { width: 18, height: 18 }));
  button.title = 'About';
  button.setAttribute('aria-label', 'About');
}

function renderPauseButtonIcon(button: HTMLButtonElement, paused: boolean) {
  button.replaceChildren(createElement(paused ? Play : Pause, { width: 18, height: 18 }));
  button.title = paused ? 'Resume' : 'Pause';
  button.setAttribute('aria-label', button.title);
}

if (aboutButton) {
  renderAboutButtonIcon(aboutButton);

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
      ...swalTheme,
    });

    if (!wasPaused) {
      resumeGame();
    }
  });
}

if (pauseButton) {
  const button = pauseButton;

  renderPauseButtonIcon(button, isPaused);

  button.addEventListener('click', async () => {
    if (isPaused) {
      resumeGame();
      renderPauseButtonIcon(button, false);
    } else {
      pauseGame();
      renderPauseButtonIcon(button, true);
    }
  });
}

if (rocketSpeedButton) {
  rocketSpeedButton.addEventListener('click', async () => {
    Swal.fire({
      title: 'Set Rocket Speed',
      input: 'range',
      inputLabel: 'Rocket Speed',
      inputAttributes: {
        min: '1',
        max: '100',
        step: '1',
      },
      inputValue: rocket.speed,
      showCancelButton: true,
      ...swalTheme,
    }).then((result) => {
      if (result.isConfirmed) {
        setRocketSpeed(Number(result.value));
      }
    });
  });
}

if (padSpeedButton) {
  padSpeedButton.addEventListener('click', async () => {
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
      ...swalTheme,
    }).then((result) => {
      if (result.isConfirmed) {
        setPadSpeed(Number(result.value));
      }
    });
  });
}
