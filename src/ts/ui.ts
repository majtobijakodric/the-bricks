import { modeConfig } from './config.ts';

const scoreText = document.querySelector<HTMLParagraphElement>('#scoreText');
const timerText = document.querySelector<HTMLParagraphElement>('#timerText');
const modeText = document.querySelector<HTMLParagraphElement>('#modeText');
const pauseButton = document.querySelector<HTMLButtonElement>('#pauseButton');

// Updates the score text.
export function updateScoreText(score: number) {
  if (!scoreText) {
    return;
  }

  scoreText.textContent = `Score: ${score}`;
}

// Updates the timer text.
export function updateTimerText(time: string) {
  if (!timerText) {
    return;
  }

  timerText.textContent = `Time: ${time}`;
}

// Updates the mode text.
export function updateModeText(mode: string) {
  if (!modeText) {
    return;
  }

  const label = mode.charAt(0).toUpperCase() + mode.slice(1);
  modeText.textContent = `Mode: ${label}`;
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
  updateTimerText('00:00');
  updateModeText(modeConfig.defaultMode);
  updatePauseButtonText(false);
}
