import Swal from 'sweetalert2';
import { createElement, Heart } from 'lucide';

import { featureConfig, modeConfig } from './config.ts';
import { lives } from './gameState.ts';
import { restartGame } from './gameControls.ts';

const swalTheme = {
  background: '#111827',
  color: '#ffffff',
  confirmButtonColor: '#334155',
};

const livesText = document.querySelector<HTMLDivElement>('#livesText');
const scoreText = document.querySelector<HTMLParagraphElement>('#scoreText');
const modeText = document.querySelector<HTMLParagraphElement>('#modeText');
const pauseButton = document.querySelector<HTMLButtonElement>('#pauseButton');
let gameOverShown = false;

function createHeart(active: boolean) {
  const wrapper = document.createElement('span');
  wrapper.className = active ? 'text-rose-400' : 'text-slate-500/40';
  wrapper.append(createElement(Heart, { width: 18, height: 18, fill: 'currentColor', strokeWidth: 1.75 }));
  return wrapper;
}

// Updates the score text.
export function updateScoreText(score: number) {
  if (!scoreText) {
    return;
  }

  scoreText.textContent = `Score: ${score}`;
}

// Updates the mode text.
export function updateModeText(mode: string) {
  if (!modeText) {
    return;
  }

  const label = mode.charAt(0).toUpperCase() + mode.slice(1);
  modeText.textContent = `Mode: ${label}`;
}

// Updates the lives hearts.
export function updateLivesText(value: number) {
  if (!livesText) {
    return;
  }

  const hearts = Array.from({ length: featureConfig.maxLives }, (_, index) => createHeart(index < value));
  livesText.replaceChildren(...hearts);
}

// Updates the pause button text.
export function updatePauseButtonText(isPaused: boolean) {
  if (!pauseButton) {
    return;
  }

  pauseButton.title = isPaused ? 'Resume' : 'Pause';
  pauseButton.setAttribute('aria-label', pauseButton.title);
}

// Sets the first UI values.
export function initializeUi() {
  updateScoreText(0);
  updateModeText(modeConfig.defaultMode);
  updatePauseButtonText(false);
  updateLivesText(lives);
}

export async function showGameOverModal() {
  if (gameOverShown) {
    return;
  }

  gameOverShown = true;

  await Swal.fire({
    title: 'You lost',
    text: 'Out of hearts.',
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
