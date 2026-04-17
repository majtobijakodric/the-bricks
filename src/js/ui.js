import { CircleHelp, createElement, Info, Pause, Play } from 'lucide'
import { activateAbility, getAbilityIconSource, getAbilityState, subscribeToAbilityState } from './abilities.js'
import { abilityMessage, aboutButton, blueAbilityButton, blueAbilityCount, blueAbilityIcon, currentScoreButton, howToPlayButton, modeButton, padSpeedButton, pauseButton, redAbilityButton, redAbilityCount, redAbilityIcon, rocketSpeedButton } from './canvas.js'
import { featureConfig, modeConfig } from './config.js'
import { launchRocketFromPad, movePadBy, setPadSpeed, setRocketSpeed } from './entities.js'
import { currentScore, fuel, input, isGameOver, isPaused, isRocketLaunched, pad, pauseGame, restartGame, resumeGame, rocket } from './game.js'
import { renderScoreHistoryMarkup, saveScore } from './score-history.js'
import { showAboutSweet, showGameOverSweet, showHowToPlaySweet, showModeSweet, showPadSpeedSweet, showRocketSpeedSweet, showScoreSweet, showWinSweet } from './sweet.js'
import { renderScene } from './render.js'

const fuelTankFill = document.querySelector('#fuelTankFill')

let endSweetShown = false
let listenersBound = false
let currentMode = modeConfig.defaultMode

async function runPausedSweet(openSweet) {
  const wasPaused = isPaused
  pauseGame()
  syncPauseButtonUi(true)

  const result = await openSweet()

  if (!wasPaused) {
    resumeGame()
    syncPauseButtonUi(false)
  }

  return result
}

async function openScoreMenu() {
  await runPausedSweet(() => showScoreSweet(renderScoreHistoryMarkup(currentScore)))
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

function bindAbilityButton(button, icon, color) {
  if (!button || !icon) {
    return
  }

  icon.src = getAbilityIconSource(color)
  button.addEventListener('click', () => {
    handleAbilityActivation(color)
  })
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
  const selectedMode = await showModeSweet(currentMode)

  if (!selectedMode) {
    return
  }

  applyMode(selectedMode)
  restartGame()
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
  syncCurrentScoreButton()
  syncPauseButtonUi(false)
  updateFuelTankLevel(1)
  updateAbilityUi()

  if (modeButton) {
    modeButton.addEventListener('click', () => {
      void openModeMenu()
    })
  }

  bindAbilityButton(redAbilityButton, redAbilityIcon, 'red')
  bindAbilityButton(blueAbilityButton, blueAbilityIcon, 'blue')

  subscribeToAbilityState(updateAbilityUi)

  if (aboutButton) {
    renderAboutButtonIcon(aboutButton)

    aboutButton.addEventListener('click', async () => {
      await runPausedSweet(showAboutSweet)
    })
  }

  if (howToPlayButton) {
    renderHowToPlayButtonIcon(howToPlayButton)

    howToPlayButton.addEventListener('click', async () => {
      await runPausedSweet(showHowToPlaySweet)
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
      showRocketSpeedSweet(rocket.speed).then((result) => {
        if (result.isConfirmed) {
          const value = Number(result.value)
          setRocketSpeed(value)
        }
      })
    })
  }

  if (padSpeedButton) {
    padSpeedButton.addEventListener('click', () => {
      showPadSpeedSweet(pad.speed).then((result) => {
        if (result.isConfirmed) {
          const value = Number(result.value)
          setPadSpeed(value)
        }
      })
    })
  }

  if (!listenersBound) {
    bindKeyboardListeners()
    listenersBound = true
  }
}

export async function openGameOverSweet() {
  if (endSweetShown) {
    return
  }

  endSweetShown = true
  saveScore(currentScore, false, currentMode)

  await showGameOverSweet()

  restartGame()
}

export async function openWinSweet() {
  if (endSweetShown) {
    return
  } 

  endSweetShown = true
  saveScore(currentScore, true, currentMode)

  await showWinSweet()

  restartGame()
}

export function resetEndSweetState() {
  endSweetShown = false
}
