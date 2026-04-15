import Swal from 'sweetalert2'
import { CircleHelp, createElement, Info, Pause, Play } from 'lucide'
import { activateAbility, getAbilityIconSource, getAbilityState, subscribeToAbilityState } from './abilities.js'
import { abilityMessage, aboutButton, blueAbilityButton, blueAbilityCount, blueAbilityIcon, currentScoreButton, howToPlayButton, modeButton, padSpeedButton, pauseButton, redAbilityButton, redAbilityCount, redAbilityIcon, rocketSpeedButton } from './canvas.js'
import { featureConfig, modeConfig } from './config.js'
import { launchRocketFromPad, movePadBy, setPadSpeed, setRocketSpeed } from './entities.js'
import { currentScore, fuel, input, isGameOver, isPaused, isRocketLaunched, pad, pauseGame, restartGame, resumeGame, rocket } from './game.js'
import { renderScene } from './render.js'

const swalTheme = {
  background: '#111827',
  color: '#ffffff',
  confirmButtonColor: '#334155',
}

const fuelTankFill = document.querySelector('#fuelTankFill')
const scoreHistoryStorageKey = 'the-bricks-score-history'

let gameOverShown = false
let listenersBound = false
let currentMode = modeConfig.defaultMode

function getStoredScores() {
  const rawScores = localStorage.getItem(scoreHistoryStorageKey)

  if (!rawScores) {
    return []
  }

  try {
    const parsedScores = JSON.parse(rawScores)
    return Array.isArray(parsedScores)
      ? parsedScores.filter((score) => Number.isFinite(score)).map((score) => Number(score))
      : []
  } catch {
    return []
  }
}

function saveScore(score) {
  const scores = getStoredScores()
  scores.unshift(score)
  localStorage.setItem(scoreHistoryStorageKey, JSON.stringify(scores))
}

function renderScoreHistoryMarkup() {
  const previousScores = getStoredScores()

  if (previousScores.length === 0) {
    return `
      <div class="score-history-panel text-left text-sm leading-6">
        <p class="mb-3">Current score: <strong>${currentScore}</strong></p>
        <p>You haven't played this game yet.</p>
      </div>
    `
  }

  const scoreItems = previousScores
    .map((score, index) => `
      <li class="score-history-item">
        <span>Run ${index + 1}</span>
        <strong>${score}</strong>
      </li>
    `)
    .join('')

  return `
    <div class="score-history-panel text-left text-sm leading-6">
      <p class="mb-3">Current score: <strong>${currentScore}</strong></p>
      <div class="score-history-list" role="region" aria-label="Previous scores">
        <ol>${scoreItems}</ol>
      </div>
    </div>
  `
}

async function openScoreMenu() {
  const wasPaused = isPaused
  pauseGame()
  syncPauseButtonUi(true)

  await Swal.fire({
    title: 'Current Score',
    html: renderScoreHistoryMarkup(),
    confirmButtonText: 'Close',
    ...swalTheme,
  })

  if (!wasPaused) {
    resumeGame()
    syncPauseButtonUi(false)
  }
}

function updateExperimentalControls() {
  const isExperimental = currentMode === 'experimental'

  if (rocketSpeedButton) {
    rocketSpeedButton.hidden = !isExperimental
  }

  if (padSpeedButton) {
    padSpeedButton.hidden = !isExperimental
  }
}

function updateAbilityUi() {
  const state = getAbilityState()

  if (abilityMessage) {
    abilityMessage.textContent = state.message
    abilityMessage.classList.toggle('is-visible', state.message.length > 0)
  }

  const slots = [
    { button: redAbilityButton, count: redAbilityCount, icon: redAbilityIcon, color: 'red' },
    { button: blueAbilityButton, count: blueAbilityCount, icon: blueAbilityIcon, color: 'blue' },
  ]

  slots.forEach(({ button, count, icon, color }) => {
    const slot = state.slots[color]
    const hasCharges = slot.charges > 0

    if (icon) {
      icon.src = getAbilityIconSource(color)
    }

    if (count) {
      count.textContent = String(slot.charges)
      count.classList.toggle('is-visible', hasCharges)
    }

    if (!button) {
      return
    }

    button.disabled = !hasCharges
    button.classList.toggle('is-charged', hasCharges)
    button.classList.toggle('is-clickable', hasCharges)
    button.classList.toggle('is-pulsing', slot.pulsing)
  })
}

function handleAbilityActivation(color) {
  if (isPaused || isGameOver) {
    return
  }

  if (!activateAbility(color)) {
    return
  }

  updateFuelTankLevel(fuel / featureConfig.maxFuel)
  renderScene()
}

function renderAboutButtonIcon(button) {
  button.replaceChildren(createElement(Info, { width: 18, height: 18 }))
  button.title = 'About'
  button.setAttribute('aria-label', 'About')
}

function renderHowToPlayButtonIcon(button) {
  button.replaceChildren(createElement(CircleHelp, { width: 18, height: 18 }))
  button.title = 'How to play'
  button.setAttribute('aria-label', 'How to play')
}

function renderPauseButtonIcon(button, paused) {
  button.replaceChildren(createElement(paused ? Play : Pause, { width: 18, height: 18 }))
  button.title = paused ? 'Resume' : 'Pause'
  button.setAttribute('aria-label', button.title)
}

export function syncCurrentScoreButton() {
  if (!currentScoreButton) {
    return
  }

  currentScoreButton.textContent = `Score: ${currentScore}`
  currentScoreButton.setAttribute('aria-label', `Current score ${currentScore}`)
}

export function syncPauseButtonUi(paused = isPaused) {
  if (!pauseButton) {
    return
  }

  renderPauseButtonIcon(pauseButton, paused)
}

function applyMode(mode) {
  const settings = modeConfig.values[mode]
  currentMode = mode
  setPadSpeed(settings.padSpeed)
  setRocketSpeed(settings.rocketSpeed)
  updateExperimentalControls()
}

async function openModeMenu() {
  const options = ['easy', 'medium', 'hard', 'experimental']
  const optionButtons = options.map((mode) => {
    const label = mode.charAt(0).toUpperCase() + mode.slice(1)
    const isSelected = currentMode === mode
    const experimentalClass = mode === 'experimental' ? ' is-experimental' : ''

    return `
      <button
        type="button"
        class="swal2-styled mode-option${isSelected ? ' is-selected' : ''}${experimentalClass}"
        data-mode="${mode}"
      >
        ${label}
      </button>
    `
  }).join('')

  const result = await Swal.fire({
    title: 'Select Mode',
    html: `<div class="mode-option-list">${optionButtons}</div>`,
    showConfirmButton: false,
    showCloseButton: true,
    ...swalTheme,
    didOpen: (popup) => {
      const buttons = popup.querySelectorAll('[data-mode]')

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const mode = button.dataset.mode

          if (!mode) {
            return
          }

          applyMode(mode)
          restartGame()
          Swal.close()
        })
      })
    },
  })

  return result
}

export function updatePauseButtonText(isPausedValue) {
  if (!pauseButton) {
    return
  }

  pauseButton.title = isPausedValue ? 'Resume' : 'Pause'
  pauseButton.setAttribute('aria-label', pauseButton.title)
}

export function updateFuelTankLevel(remainingRatio) {
  if (!fuelTankFill) {
    return
  }

  const clampedRatio = Math.max(0, Math.min(1, remainingRatio))
  fuelTankFill.style.transform = `scaleY(${clampedRatio})`
}

function bindKeyboardListeners() {
  addEventListener('keydown', (event) => {
    if (isGameOver) {
      return
    }

    if (isPaused) {
      return
    }

    const step = pad.speed

    if (event.code === 'Space') {
      event.preventDefault()

      if (!isRocketLaunched) {
        launchRocketFromPad()
        renderScene()
      }

      return
    }

    switch (event.key) {
      case 'ArrowLeft': {
        movePadBy(-step)
        input.left = true
        renderScene()
        break
      }
      case 'ArrowRight': {
        movePadBy(step)
        input.right = true
        renderScene()
        break
      }
    }
  })

  addEventListener('keyup', (event) => {
    if (isGameOver) {
      return
    }

    if (event.key === 'ArrowLeft') input.left = false
    if (event.key === 'ArrowRight') input.right = false
  })
}

export function initializeUi() {
  applyMode(modeConfig.defaultMode)
  updatePauseButtonText(false)
  syncCurrentScoreButton()
  syncPauseButtonUi(false)
  updateFuelTankLevel(1)
  updateAbilityUi()

  if (modeButton) {
    modeButton.addEventListener('click', () => {
      void openModeMenu()
    })
  }

  if (redAbilityButton && redAbilityIcon) {
    redAbilityIcon.src = getAbilityIconSource('red')
    redAbilityButton.addEventListener('click', () => {
      handleAbilityActivation('red')
    })
  }

  if (blueAbilityButton && blueAbilityIcon) {
    blueAbilityIcon.src = getAbilityIconSource('blue')
    blueAbilityButton.addEventListener('click', () => {
      handleAbilityActivation('blue')
    })
  }

  subscribeToAbilityState(updateAbilityUi)

  if (aboutButton) {
    renderAboutButtonIcon(aboutButton)

    aboutButton.addEventListener('click', async () => {
      const wasPaused = isPaused
      pauseGame()
      syncPauseButtonUi(true)

      await Swal.fire({
        title: 'About',
        html: `
      <p>Author: Maj Tobija Kodrič</p>
      <a href="https://github.com/majtobijakodric/the-bricks" target="_blank" class="text-blue-500 hover:underline">GitHub</a>
    `,
        confirmButtonText: 'Close',
        ...swalTheme,
      })

      if (!wasPaused) {
        resumeGame()
        syncPauseButtonUi(false)
      }
    })
  }

  if (howToPlayButton) {
    renderHowToPlayButtonIcon(howToPlayButton)

    howToPlayButton.addEventListener('click', async () => {
      const wasPaused = isPaused
      pauseGame()
      syncPauseButtonUi(true)

      await Swal.fire({
        title: 'How to Play',
        html: `
      <div class="space-y-3 text-left text-sm leading-6">
        <p>Move the pad to keep the rocket in play and clear the asteroid field.</p>
        <p><strong>Controls:</strong> use the left and right arrow keys to move.</p>
        <p>Collect red and blue rock charges, then use the ability buttons on the left when they light up.</p>
        <p>Watch the fuel tank. If fuel hits zero or the rocket slips past the pad, the run ends.</p>
      </div>
    `,
        confirmButtonText: 'Close',
        ...swalTheme,
      })

      if (!wasPaused) {
        resumeGame()
        syncPauseButtonUi(false)
      }
    })
  }

  if (currentScoreButton) {
    currentScoreButton.addEventListener('click', () => {
      void openScoreMenu()
    })
  }

  if (pauseButton) {
    const button = pauseButton

    renderPauseButtonIcon(button, isPaused)

    button.addEventListener('click', () => {
      if (isPaused) {
        resumeGame()
        syncPauseButtonUi(false)
      } else {
        pauseGame()
        syncPauseButtonUi(true)
      }
    })
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
          setRocketSpeed(Number(result.value))
        }
      })
    })
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
          setPadSpeed(Number(result.value))
        }
      })
    })
  }

  if (!listenersBound) {
    bindKeyboardListeners()
    listenersBound = true
  }
}

export async function showGameOverModal() {
  if (gameOverShown) {
    return
  }

  gameOverShown = true
  saveScore(currentScore)

  await Swal.fire({
    title: 'You are out of fuel.',
    text: 'Play again to restart.',
    icon: 'error',
    confirmButtonText: 'Play again',
    allowOutsideClick: false,
    allowEscapeKey: false,
    ...swalTheme,
  })

  restartGame()
}

export function resetGameOverModalState() {
  gameOverShown = false
}
