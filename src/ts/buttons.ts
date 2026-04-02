import Swal from 'sweetalert2';
import { createElement, Info, Pause, Play, Volume2, VolumeX } from 'lucide';

import { setBallSpeed } from './ball.ts';
import { aboutButton, ballSpeedButton, muteButton, padSpeedButton, pauseButton } from './canvas.ts';
import { pauseGame, resumeGame } from './gameControls.ts';
import { ball, isPaused, pad } from './gameState.ts';
import { setPadSpeed } from './pad.ts';
import { prepareAudio, playButtonClickSound, toggleSoundMuted } from './sound.ts';

const swalTheme = {
  background: '#111827',
  color: '#ffffff',
  confirmButtonColor: '#334155',
};

function renderMuteButtonIcon(button: HTMLButtonElement, muted: boolean) {
  button.replaceChildren(createElement(muted ? VolumeX : Volume2, { width: 18, height: 18 }));
  button.title = muted ? 'Unmute sounds' : 'Mute sounds';
  button.setAttribute('aria-label', button.title);
}

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
    await prepareAudio();
    playButtonClickSound();

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
    await prepareAudio();
    playButtonClickSound();

    if (isPaused) {
      resumeGame();
      renderPauseButtonIcon(button, false);
    } else {
      pauseGame();
      renderPauseButtonIcon(button, true);
    }
  });
}

if (muteButton) {
  const button = muteButton;

  renderMuteButtonIcon(button, false);

  button.addEventListener('click', async () => {
    await prepareAudio();
    playButtonClickSound();

    const muted = toggleSoundMuted();
    renderMuteButtonIcon(button, muted);
  });
}

if (ballSpeedButton) {
  ballSpeedButton.addEventListener('click', async () => {
    await prepareAudio();
    playButtonClickSound();

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
      ...swalTheme,
    }).then((result) => {
      if (result.isConfirmed) {
        setBallSpeed(Number(result.value));
      }
    });
  });
}

if (padSpeedButton) {
  padSpeedButton.addEventListener('click', async () => {
    await prepareAudio();
    playButtonClickSound();

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
