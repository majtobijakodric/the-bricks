import '../style/style.css'
// icons
import { CircleHelp, createElement, Info, Pause, Play, User } from 'lucide'

import planet1 from '../assets/background/1.gif'
import planet2 from '../assets/background/2.gif'
import planet3 from '../assets/background/3.gif'
import padSource from '../assets/pad/pad1.png'
import rocketSource from '../assets/rockets/rocketBlue.png'
import blueRock1 from '../assets/rocks/blue/rock_1.png'
import blueRock2 from '../assets/rocks/blue/rock_2.png'
import blueRock3 from '../assets/rocks/blue/rock_3.png'
import grayRock1 from '../assets/rocks/gray/rock_1.png'
import grayRock2 from '../assets/rocks/gray/rock_2.png'
import grayRock3 from '../assets/rocks/gray/rock_3.png'
import normalRock1 from '../assets/rocks/normal/rock_1.png'
import normalRock2 from '../assets/rocks/normal/rock_2.png'
import normalRock3 from '../assets/rocks/normal/rock_3.png'
import redRock1 from '../assets/rocks/red/rock_1.png'
import redRock2 from '../assets/rocks/red/rock_2.png'
import redRock3 from '../assets/rocks/red/rock_3.png'

import { burnFuel, checkAsteroids, checkEnd, countEffectFrames, finishGame, resetGame, setMode, useBlueAbility, useRedAbility } from './gameLogic.js'
import { playerName, saveScore, scoreHtml, setPlayerName } from './localStorage.js'
import { checkPad, checkWalls, launchRocket, movePad, moveRocket, putRocketOnPad, updateSpeeds } from './rocketAndPad.js'
import { showAboutMenu, showChangeNameMenu, showEndMenu, showHelpMenu, showModeMenu, showPadSpeedMenu, showRocketSpeedMenu, showScoreMenu, showWelcomeNameMenu } from './swalMenus.js'

const canvas = document.querySelector('#gameCanvas')
const fuelFill = document.querySelector('#fuelTankFill')
const redButton = document.querySelector('#redAbilityButton')
const redIcon = document.querySelector('#redAbilityIcon')
const redCount = document.querySelector('#redAbilityCount')
const blueButton = document.querySelector('#blueAbilityButton')
const blueIcon = document.querySelector('#blueAbilityIcon')
const blueCount = document.querySelector('#blueAbilityCount')
const messageBox = document.querySelector('#abilityMessage')
const scoreButton = document.querySelector('#currentScoreButton')
const rocketSpeedButton = document.querySelector('#rocketSpeedButton')
const padSpeedButton = document.querySelector('#padSpeedButton')
const modeButton = document.querySelector('#modeButton')
const pauseButton = document.querySelector('#pauseButton')
const nameButton = document.querySelector('#playerNameButton')
const helpButton = document.querySelector('#howToPlayButton')
const aboutButton = document.querySelector('#aboutButton')
const ctx = canvas.getContext('2d')

const width = 800
const height = 600
const maxFuel = 5
const planets = [planet1, planet2, planet3]
const rocks = {
  normal: [normalRock1, normalRock2, normalRock3],
  gray: [grayRock1, grayRock2, grayRock3],
  blue: [blueRock1, blueRock2, blueRock3],
  red: [redRock1, redRock2, redRock3],
}

const padImage = new Image()
const rocketImage = new Image()
padImage.src = padSource
rocketImage.src = rocketSource

const pad = { x: 350, y: 570, width: 100, height: 20, speed: 4 }
const rocket = { x: 400, y: 550, radius: 10, speed: 5, dx: 0, dy: -5 }
const ui = { redButton, redCount, blueButton, blueCount, messageBox, scoreButton }
const speedButtons = { rocketSpeedButton, padSpeedButton }

// game state object
const state = {
  asteroids: [],
  paused: false,
  gameOver: false,
  rocketStarted: false,
  leftDown: false,
  rightDown: false,
  score: 0,
  fuel: maxFuel,
  mode: 'medium',
  basePadSpeed: 4,
  baseRocketSpeed: 5,
  redCharges: 0,
  blueCharges: 0,
  redPulse: 0,
  bluePulse: 0,
  messageFrames: 0,
  fuelPause: 0,
  fuelDrainFrames: 0,
  padSpeedFrames: 0,
  rocketSpeedFrames: 0,
  fuelDrain: 1,
  padBoost: 1,
  rocketBoost: 1,
  endWindowOpen: false,
  pausedBeforePopup: false,
}

canvas.width = width
canvas.height = height

async function start() {
  addBgPlanets()
  setIcons()

  redButton.addEventListener('click', () => {
    if (state.redCharges <= 0 || state.paused || state.gameOver) return
    useRedAbility(state, ui, maxFuel)
    burnFuel(state, fuelFill, maxFuel)
  })

  blueButton.addEventListener('click', () => {
    if (state.blueCharges <= 0 || state.paused || state.gameOver) return
    useBlueAbility(state, ui, () => { updateSpeeds(state, pad, rocket) })
  })

  scoreButton.addEventListener('click', async () => {
    pauseForPopup()
    await showScoreMenu(scoreHtml(state.score))
    resumeAfterPopup()
  })

  modeButton.addEventListener('click', async () => {
    pauseForPopup()
    const result = await showModeMenu(state.mode)
    resumeAfterPopup()
    if (result.isConfirmed) {
      setMode(state, result.value, speedButtons, () => { updateSpeeds(state, pad, rocket) })
      resetGameState()
    }
  })

  pauseButton.addEventListener('click', () => {
    if (state.gameOver) return
    state.paused = !state.paused
    if (state.paused) {
      state.leftDown = false
      state.rightDown = false
    }
    setPauseIcon()
  })

  nameButton.addEventListener('click', async () => {
    pauseForPopup()
    const result = await showChangeNameMenu(playerName())
    resumeAfterPopup()
    if (result.isConfirmed) setPlayerName(result.value)
  })

  helpButton.addEventListener('click', async () => {
    pauseForPopup()
    await showHelpMenu()
    resumeAfterPopup()
  })

  aboutButton.addEventListener('click', async () => {
    pauseForPopup()
    await showAboutMenu()
    resumeAfterPopup()
  })

  rocketSpeedButton.addEventListener('click', async () => {
    pauseForPopup()
    const result = await showRocketSpeedMenu(state.baseRocketSpeed)
    resumeAfterPopup()
    if (result.isConfirmed) {
      state.baseRocketSpeed = Number(result.value)
      updateSpeeds(state, pad, rocket)
    }
  })

  padSpeedButton.addEventListener('click', async () => {
    pauseForPopup()
    const result = await showPadSpeedMenu(state.basePadSpeed)
    resumeAfterPopup()
    if (result.isConfirmed) {
      state.basePadSpeed = Number(result.value)
      updateSpeeds(state, pad, rocket)
    }
  })

  addEventListener('keydown', (event) => {
    if (state.paused || state.gameOver) return
    if (event.code === 'Space') {
      event.preventDefault()
      launchRocket(state, pad, rocket)
    }
    if (event.key === 'ArrowLeft') state.leftDown = true
    if (event.key === 'ArrowRight') state.rightDown = true
  })

  addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') state.leftDown = false
    if (event.key === 'ArrowRight') state.rightDown = false
  })

  setMode(state, 'medium', speedButtons, () => { updateSpeeds(state, pad, rocket) })
  resetGameState()
  if (playerName() === '') {
    const result = await showWelcomeNameMenu()
    setPlayerName(result.value)
  }
  requestAnimationFrame(gameLoop)
}

function addBgPlanets() {
  const layer = document.createElement('div')
  layer.className = 'planet-background'
  layer.setAttribute('aria-hidden', 'true')

  for (let i = 0; i < planets.length; i += 1) {
    const image = document.createElement('img')
    image.className = 'planet-background__planet'
    image.src = planets[i]
    image.alt = ''
    image.draggable = false
    image.style.width = 150 - i * 18 + 'px'
    image.style.height = 150 - i * 18 + 'px'
    image.style.left = 40 + i * 260 + 'px'
    image.style.top = 30 + i * 120 + 'px'
    layer.append(image)
  }

  document.body.append(layer)
}

// These stay in JS because the image and icon assets are imported from packages.
function setIcons() {
  redIcon.src = redRock2
  blueIcon.src = blueRock2
  aboutButton.replaceChildren(createElement(Info, { width: 18, height: 18 }))
  helpButton.replaceChildren(createElement(CircleHelp, { width: 18, height: 18 }))
  nameButton.replaceChildren(createElement(User, { width: 18, height: 18 }))
  setPauseIcon()
}

function gameLoop() {
  if (!state.paused && !state.gameOver) {
    movePad(state, pad, rocket, width)
    moveRocket(state, pad, rocket)

    countEffectFrames(state, ui, () => { updateSpeeds(state, pad, rocket) })
    checkWalls(state, rocket, width, height)
    burnFuel(state, fuelFill, maxFuel)

    checkPad(state, pad, rocket)
    checkAsteroids(state, rocket, maxFuel, ui)
    const result = checkEnd(state)

    if (result !== null) {
      finishGame(state, result, saveScore, showEndMenu, resetGameState)
    }
  }

  drawGame()
  requestAnimationFrame(gameLoop)
}

function drawGame() {
  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < state.asteroids.length; i += 1) {
    ctx.drawImage(state.asteroids[i].image, Math.round(state.asteroids[i].x), Math.round(state.asteroids[i].y), state.asteroids[i].width, state.asteroids[i].height)
  }

  if (padImage.complete && padImage.naturalWidth > 0) ctx.drawImage(padImage, Math.round(pad.x), Math.round(pad.y), pad.width, pad.height)
  else {
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(pad.x, pad.y, pad.width, pad.height)
  }

  drawRocket()
}

function drawRocket() {
  const size = rocket.radius * 6
  const angle = Math.atan2(rocket.dy, rocket.dx) + Math.PI / 2
  ctx.save()
  ctx.translate(rocket.x, rocket.y)
  ctx.rotate(angle)

  if (rocketImage.complete && rocketImage.naturalWidth > 0) {
    const imageSize = Math.max(rocketImage.naturalWidth, rocketImage.naturalHeight)
    const drawWidth = rocketImage.naturalWidth * (size / imageSize)
    const drawHeight = rocketImage.naturalHeight * (size / imageSize)
    ctx.drawImage(rocketImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  } else {
    ctx.beginPath()
    ctx.arc(0, 0, rocket.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'
    ctx.fill()
  }

  ctx.restore()
}

function resetGameState() {
  resetGame(state, pad, width, height, maxFuel, rocks, {
    updateSpeeds: () => { updateSpeeds(state, pad, rocket) },
    putRocketOnPad: () => { putRocketOnPad(pad, rocket) },
    setPauseIcon,
    burnFuel: () => { burnFuel(state, fuelFill, maxFuel) },
    ui,
  })
}

function pauseForPopup() {
  state.pausedBeforePopup = state.paused
  state.paused = true
  state.leftDown = false
  state.rightDown = false
  setPauseIcon()
}

function resumeAfterPopup() {
  if (!state.gameOver && !state.pausedBeforePopup) state.paused = false
  setPauseIcon()
}

function setPauseIcon() {
  if (state.paused) {
    pauseButton.replaceChildren(createElement(Play, { width: 18, height: 18 }))
    pauseButton.title = 'Resume'
    pauseButton.setAttribute('aria-label', 'Resume')
  } else {
    pauseButton.replaceChildren(createElement(Pause, { width: 18, height: 18 }))
    pauseButton.title = 'Pause'
    pauseButton.setAttribute('aria-label', 'Pause')
  }
}

start()
