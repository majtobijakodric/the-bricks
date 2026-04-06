import Swal from 'sweetalert2';
import { createElement, Info, Pause, Play } from 'lucide';

import { aboutButton, padSpeedButton, pauseButton, rocketSpeedButton } from './canvas.ts';
import { modeConfig } from './config.ts';
import { launchRocketFromPad, movePadBy, setPadSpeed, setRocketSpeed } from './entities.ts';
import { input, isGameOver, isPaused, pad, pauseGame, restartGame, resumeGame, rocket, isRocketLaunched } from './game.ts';
import { renderScene } from './render.ts';

const swalTheme = {
  background: '#111827',
  color: '#ffffff',
  confirmButtonColor: '#334155',
};

const modeText = document.querySelector<HTMLParagraphElement>('#modeText');
const fuelTankFill = document.querySelector<HTMLDivElement>('#fuelTankFill');

let gameOverShown = false;
let listenersBound = false;

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

export function updateModeText(mode: string) {
  if (!modeText) {
    return;
  }

  const label = mode.charAt(0).toUpperCase() + mode.slice(1);
  modeText.textContent = `Mode: ${label}`;
}

export function updatePauseButtonText(isPausedValue: boolean) {
  if (!pauseButton) {
    return;
  }

  pauseButton.title = isPausedValue ? 'Resume' : 'Pause';
  pauseButton.setAttribute('aria-label', pauseButton.title);
}

export function updateFuelTankLevel(remainingRatio: number) {
  if (!fuelTankFill) {
    return;
  }

  const clampedRatio = Math.max(0, Math.min(1, remainingRatio));
  fuelTankFill.style.transform = `scaleY(${clampedRatio})`;
}

function bindKeyboardListeners() {
  addEventListener('keydown', (event) => {
    if (isGameOver) {
      return;
    }

    const step = pad.speed;

    if (event.code === 'Space') {
      event.preventDefault();

      if (!isRocketLaunched) {
        launchRocketFromPad();
        renderScene();
      }

      return;
    }

    switch (event.key) {
      case 'ArrowLeft': {
        movePadBy(-step);
        input.left = true;
        renderScene();
        break;
      }
      case 'ArrowRight': {
        movePadBy(step);
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

export function initializeUi() {
  updateModeText(modeConfig.defaultMode);
  updatePauseButtonText(false);
  updateFuelTankLevel(1);

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

    button.addEventListener('click', () => {
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
    rocketSpeedButton.addEventListener('click', () => {
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
        ...swalTheme,
      }).then((result) => {
        if (result.isConfirmed) {
          setPadSpeed(Number(result.value));
        }
      });
    });
  }

  if (!listenersBound) {
    bindKeyboardListeners();
    listenersBound = true;
  }
}

export async function showGameOverModal() {
  if (gameOverShown) {
    return;
  }

  gameOverShown = true;

  await Swal.fire({
    title: 'You are out of fuel.',
    text: 'Play again to restart.',
    icon: 'error',
    confirmButtonText: 'Play again',
    allowOutsideClick: false,
    allowEscapeKey: false,
    ...swalTheme,
  });

  restartGame();
}

export function resetGameOverModalState() {
  gameOverShown = false;
}
