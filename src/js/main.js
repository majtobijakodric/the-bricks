import '../style/style.css'
import Swal from 'sweetalert2'
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
const normalRocks = [normalRock1, normalRock2, normalRock3]
const grayRocks = [grayRock1, grayRock2, grayRock3]
const blueRocks = [blueRock1, blueRock2, blueRock3]
const redRocks = [redRock1, redRock2, redRock3]

const padImage = new Image()
const rocketImage = new Image()
padImage.src = padSource
rocketImage.src = rocketSource

const pad = { x: 350, y: 570, width: 100, height: 20, speed: 4 }
const rocket = { x: 400, y: 550, radius: 10, speed: 5, dx: 0, dy: -5 }

let asteroids = []
let paused = false
let gameOver = false
let rocketStarted = false
let leftDown = false
let rightDown = false
let score = 0
let fuel = maxFuel
let mode = 'medium'
let basePadSpeed = 4
let baseRocketSpeed = 5
let redCharges = 0
let blueCharges = 0
let redPulse = 0
let bluePulse = 0
let messageFrames = 0
let fuelPause = 0
let fuelDrainFrames = 0
let padSpeedFrames = 0
let rocketSpeedFrames = 0
let fuelDrain = 1
let padBoost = 1
let rocketBoost = 1
let endWindowOpen = false
let pausedBeforePopup = false

canvas.width = width
canvas.height = height
canvas.style.width = width + 'px'
canvas.style.height = height + 'px'

async function start() {
  makePlanets()
  setIcons()
  setButtons()
  setKeyboard()
  setMode('medium')
  resetGame()
  await askNameFirstTime()
  requestAnimationFrame(gameLoop)
}

function makePlanets() {
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

function setIcons() {
  redIcon.src = redRock2
  blueIcon.src = blueRock2
  aboutButton.replaceChildren(createElement(Info, { width: 18, height: 18 }))
  helpButton.replaceChildren(createElement(CircleHelp, { width: 18, height: 18 }))
  nameButton.replaceChildren(createElement(User, { width: 18, height: 18 }))
  aboutButton.title = 'About'
  helpButton.title = 'How to play'
  nameButton.title = 'Change player name'
  aboutButton.setAttribute('aria-label', 'About')
  helpButton.setAttribute('aria-label', 'How to play')
  nameButton.setAttribute('aria-label', 'Change player name')
  setPauseIcon()
}

function setButtons() {
  redButton.addEventListener('click', () => { useRedAbility() })
  blueButton.addEventListener('click', () => { useBlueAbility() })
  scoreButton.addEventListener('click', () => { showScores() })
  modeButton.addEventListener('click', () => { showModes() })
  pauseButton.addEventListener('click', () => { togglePause() })
  nameButton.addEventListener('click', () => { changeName() })
  helpButton.addEventListener('click', () => { showHelp() })
  aboutButton.addEventListener('click', () => { showAbout() })
  rocketSpeedButton.addEventListener('click', () => { changeRocketSpeed() })
  padSpeedButton.addEventListener('click', () => { changePadSpeed() })
}

function setKeyboard() {
  addEventListener('keydown', (event) => {
    if (paused || gameOver) return
    if (event.code === 'Space') {
      event.preventDefault()
      launchRocket()
    }
    if (event.key === 'ArrowLeft') leftDown = true
    if (event.key === 'ArrowRight') rightDown = true
  })

  addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') leftDown = false
    if (event.key === 'ArrowRight') rightDown = false
  })
}

function gameLoop() {
  if (!paused && !gameOver) {
    movePad()
    moveRocket()
    countEffectFrames()
    burnFuel()
    checkWalls()
    checkPad()
    checkAsteroids()
    checkEnd()
  }

  drawGame()
  requestAnimationFrame(gameLoop)
}

function movePad() {
  if (leftDown) pad.x -= pad.speed
  if (rightDown) pad.x += pad.speed
  if (pad.x < 0) pad.x = 0
  if (pad.x + pad.width > width) pad.x = width - pad.width
  if (!rocketStarted) putRocketOnPad()
}

function launchRocket() {
  if (rocketStarted) return
  rocketStarted = true
  rocket.x = pad.x + pad.width / 2
  rocket.y = pad.y - rocket.radius - 5
  rocket.dy = -rocket.speed

  // choose one of two simple starting directions.
  if (Math.random() < 0.5) rocket.dx = -rocket.speed
  else rocket.dx = rocket.speed
}

function moveRocket() {
  if (!rocketStarted) {
    putRocketOnPad()
    return
  }

  rocket.x += rocket.dx
  rocket.y += rocket.dy
}

function countEffectFrames() {
  // ability effects use frame counters instead of timeout ids.
  if (redPulse > 0) redPulse -= 1
  if (bluePulse > 0) bluePulse -= 1
  if (messageFrames > 0) messageFrames -= 1
  if (fuelPause > 0) fuelPause -= 1

  if (fuelDrainFrames > 0) fuelDrainFrames -= 1
  else fuelDrain = 1

  if (padSpeedFrames > 0) padSpeedFrames -= 1
  else padBoost = 1

  if (rocketSpeedFrames > 0) rocketSpeedFrames -= 1
  else rocketBoost = 1

  updateSpeeds()
  updateAbilities()
}

function burnFuel() {
  if (rocketStarted && fuelPause === 0) fuel -= 0.0017 * fuelDrain
  if (fuel < 0) fuel = 0
  fuelFill.style.transform = 'scaleY(' + fuel / maxFuel + ')'
}

function checkWalls() {
  if (!rocketStarted) return
  if (rocket.x - rocket.radius <= 0) {
    rocket.x = rocket.radius
    rocket.dx = Math.abs(rocket.dx)
  }
  if (rocket.x + rocket.radius >= width) {
    rocket.x = width - rocket.radius
    rocket.dx = -Math.abs(rocket.dx)
  }
  if (rocket.y - rocket.radius <= 0) {
    rocket.y = rocket.radius
    rocket.dy = Math.abs(rocket.dy)
  }
  if (rocket.y - rocket.radius > height + 80) finishGame(false)
}

function checkPad() {
  if (!rocketStarted || rocket.dy <= 0) return
  if (rocket.x + rocket.radius < pad.x) return
  if (rocket.x - rocket.radius > pad.x + pad.width) return
  if (rocket.y + rocket.radius < pad.y) return
  if (rocket.y - rocket.radius > pad.y + pad.height) return

  rocket.y = pad.y - rocket.radius
  rocket.dy = -Math.abs(rocket.dy)

  // the side of the pad decides the horizontal direction.
  if (rocket.x < pad.x + pad.width / 2) rocket.dx = -rocket.speed
  else rocket.dx = rocket.speed
}

function checkAsteroids() {
  for (let i = 0; i < asteroids.length; i += 1) {
    if (rocketTouches(asteroids[i])) {
      bounceFromAsteroid(asteroids[i])
      collectReward(asteroids[i])
      asteroids.splice(i, 1)
      updateScore()
      updateAbilities()
      return
    }
  }
}

function rocketTouches(asteroid) {
  if (!rocketStarted) return false
  if (rocket.x + rocket.radius < asteroid.x) return false
  if (rocket.x - rocket.radius > asteroid.x + asteroid.width) return false
  if (rocket.y + rocket.radius < asteroid.y) return false
  if (rocket.y - rocket.radius > asteroid.y + asteroid.height) return false
  return true
}

function bounceFromAsteroid(asteroid) {
  const middleX = asteroid.x + asteroid.width / 2
  const middleY = asteroid.y + asteroid.height / 2
  const distanceX = Math.abs(rocket.x - middleX)
  const distanceY = Math.abs(rocket.y - middleY)

  if (distanceX > distanceY) {
    if (rocket.x < middleX) {
      rocket.dx = -Math.abs(rocket.dx)
      rocket.x = asteroid.x - rocket.radius
    } else {
      rocket.dx = Math.abs(rocket.dx)
      rocket.x = asteroid.x + asteroid.width + rocket.radius
    }
  } else {
    if (rocket.y < middleY) {
      rocket.dy = -Math.abs(rocket.dy)
      rocket.y = asteroid.y - rocket.radius
    } else {
      rocket.dy = Math.abs(rocket.dy)
      rocket.y = asteroid.y + asteroid.height + rocket.radius
    }
  }
}

function collectReward(asteroid) {
  if (asteroid.color === 'normal') score += 1
  if (asteroid.color === 'gray') {
    score += 3
    fuel += 1
  }
  if (asteroid.color === 'blue') {
    score += 5
    blueCharges += 1
    bluePulse = 45
  }
  if (asteroid.color === 'red') {
    score += 10
    redCharges += 1
    redPulse = 45
  }
  if (fuel > maxFuel) fuel = maxFuel
}

function checkEnd() {
  if (fuel <= 0) finishGame(false)
  if (asteroids.length === 0) finishGame(true)
}

function finishGame(won) {
  if (endWindowOpen) return
  gameOver = true
  endWindowOpen = true
  leftDown = false
  rightDown = false
  saveScore(won)
  showEnd(won)
}

async function showEnd(won) {
  if (won) {
    await showPopup({ title: 'All asteroids cleared!', confirmButtonText: 'Play again', allowOutsideClick: false, allowEscapeKey: false })
  } else {
    await showPopup({ title: 'You are out of fuel.', text: 'Play again to restart.', confirmButtonText: 'Play again', allowOutsideClick: false, allowEscapeKey: false })
  }

  resetGame()
}

function resetGame() {
  paused = false
  gameOver = false
  rocketStarted = false
  leftDown = false
  rightDown = false
  score = 0
  fuel = maxFuel
  redCharges = 0
  blueCharges = 0
  redPulse = 0
  bluePulse = 0
  messageFrames = 0
  fuelPause = 0
  fuelDrainFrames = 0
  padSpeedFrames = 0
  rocketSpeedFrames = 0
  fuelDrain = 1
  padBoost = 1
  rocketBoost = 1
  endWindowOpen = false
  pad.x = width / 2 - pad.width / 2
  pad.y = height - pad.height - 10
  makeAsteroids()
  updateSpeeds()
  putRocketOnPad()
  updateScore()
  updateAbilities()
  setPauseIcon()
  burnFuel()
}

function putRocketOnPad() {
  rocket.x = pad.x + pad.width / 2
  rocket.y = pad.y - rocket.radius - 5
  rocket.dx = 0
  rocket.dy = -rocket.speed
}

function makeAsteroids() {
  asteroids = []

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 12; column += 1) {
      const color = randomColor()
      asteroids.push({ x: 18 + column * 64, y: 15 + row * 48, width: 61, height: 45, color, image: rockImage(color) })
    }
  }
}

function randomColor() {
  const number = Math.floor(Math.random() * 100) + 1
  if (number <= 8) return 'red'
  if (number <= 22) return 'blue'
  if (number <= 40) return 'gray'
  return 'normal'
}

function rockImage(color) {
  const image = new Image()
  const index = Math.floor(Math.random() * 3)
  if (color === 'red') image.src = redRocks[index]
  if (color === 'blue') image.src = blueRocks[index]
  if (color === 'gray') image.src = grayRocks[index]
  if (color === 'normal') image.src = normalRocks[index]
  return image
}

function updateSpeeds() {
  pad.speed = basePadSpeed * padBoost
  rocket.speed = baseRocketSpeed * rocketBoost
  if (pad.speed < 1) pad.speed = 1
  if (rocket.speed < 1) rocket.speed = 1
  if (!rocketStarted) return
  if (rocket.dx < 0) rocket.dx = -rocket.speed
  if (rocket.dx > 0) rocket.dx = rocket.speed
  if (rocket.dy < 0) rocket.dy = -rocket.speed
  if (rocket.dy > 0) rocket.dy = rocket.speed
}

function drawGame() {
  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < asteroids.length; i += 1) {
    ctx.drawImage(asteroids[i].image, Math.round(asteroids[i].x), Math.round(asteroids[i].y), asteroids[i].width, asteroids[i].height)
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

function useRedAbility() {
  if (redCharges <= 0 || paused || gameOver) return
  redCharges -= 1
  const number = Math.floor(Math.random() * 3) + 1

  // red abilities change fuel.
  if (number === 1) {
    fuelPause = 300
    showMessage('Fuel paused.')
  }
  if (number === 2) {
    fuel += 1
    showMessage('Fuel restored.')
  }
  if (number === 3) {
    fuelDrain = 0.45
    fuelDrainFrames = 480
    showMessage('Fuel drain slowed.')
  }

  if (fuel > maxFuel) fuel = maxFuel
  updateAbilities()
  burnFuel()
}

function useBlueAbility() {
  if (blueCharges <= 0 || paused || gameOver) return
  blueCharges -= 1
  const number = Math.floor(Math.random() * 5) + 1

  // blue abilities change movement.
  if (number === 1) {
    padBoost = 1.75
    padSpeedFrames = 480
    showMessage('Pad speed boosted.')
  }
  if (number === 2) {
    rocketBoost = 0.72
    rocketSpeedFrames = 480
    showMessage('Rocket slowed.')
  }
  if (number === 3) {
    padBoost = 0.55
    padSpeedFrames = 480
    showMessage('Pad controls slowed.')
  }
  if (number === 4) {
    rocketBoost = 1.45
    rocketSpeedFrames = 480
    showMessage('Rocket overdrive.')
  }
  if (number === 5) {
    fuelDrain = 2.2
    fuelDrainFrames = 300
    showMessage('Fuel drain spiked.')
  }

  updateSpeeds()
  updateAbilities()
}

function showMessage(text) {
  messageBox.textContent = text
  messageBox.classList.add('is-visible')
  messageFrames = 190
}

function updateAbilities() {
  redCount.textContent = redCharges
  blueCount.textContent = blueCharges
  redButton.disabled = redCharges === 0
  blueButton.disabled = blueCharges === 0
  setAbilityStyle(redButton, redCount, redCharges, redPulse)
  setAbilityStyle(blueButton, blueCount, blueCharges, bluePulse)

  if (messageFrames === 0) {
    messageBox.textContent = ''
    messageBox.classList.remove('is-visible')
  }
}

function setAbilityStyle(button, count, charges, pulse) {
  if (charges > 0) {
    button.classList.add('is-charged', 'is-clickable')
    count.classList.add('is-visible')
  } else {
    button.classList.remove('is-charged', 'is-clickable')
    count.classList.remove('is-visible')
  }

  if (pulse > 0) button.classList.add('is-pulsing')
  else button.classList.remove('is-pulsing')
}

function updateScore() {
  scoreButton.textContent = 'Score: ' + score
  scoreButton.setAttribute('aria-label', 'Current score ' + score)
}

function togglePause() {
  if (gameOver) return
  paused = !paused
  if (paused) {
    leftDown = false
    rightDown = false
  }
  setPauseIcon()
}

function setPauseIcon() {
  if (paused) {
    pauseButton.replaceChildren(createElement(Play, { width: 18, height: 18 }))
    pauseButton.title = 'Resume'
    pauseButton.setAttribute('aria-label', 'Resume')
  } else {
    pauseButton.replaceChildren(createElement(Pause, { width: 18, height: 18 }))
    pauseButton.title = 'Pause'
    pauseButton.setAttribute('aria-label', 'Pause')
  }
}

function setMode(newMode) {
  mode = newMode
  if (mode === 'easy') {
    baseRocketSpeed = 4
    basePadSpeed = 3
  }
  if (mode === 'medium') {
    baseRocketSpeed = 5
    basePadSpeed = 4
  }
  if (mode === 'hard') {
    baseRocketSpeed = 7
    basePadSpeed = 6
  }
  if (mode === 'experimental') {
    baseRocketSpeed = 5
    basePadSpeed = 4
    rocketSpeedButton.hidden = false
    padSpeedButton.hidden = false
  } else {
    rocketSpeedButton.hidden = true
    padSpeedButton.hidden = true
  }
  updateSpeeds()
}

async function showModes() {
  pauseForPopup()
  const result = await showPopup({
    title: 'Select Mode',
    input: 'select',
    inputValue: mode,
    inputOptions: { easy: 'Easy', medium: 'Medium', hard: 'Hard', experimental: 'Experimental' },
    showCancelButton: true,
  })
  resumeAfterPopup()
  if (result.isConfirmed) {
    setMode(result.value)
    resetGame()
  }
}

async function changeRocketSpeed() {
  pauseForPopup()
  const result = await showPopup({ title: 'Set Rocket Speed', input: 'range', inputValue: baseRocketSpeed, inputAttributes: { min: '1', max: '100', step: '1' }, showCancelButton: true })
  resumeAfterPopup()
  if (result.isConfirmed) {
    baseRocketSpeed = Number(result.value)
    updateSpeeds()
  }
}

async function changePadSpeed() {
  pauseForPopup()
  const result = await showPopup({ title: 'Set Pad Speed', input: 'range', inputValue: basePadSpeed, inputAttributes: { min: '1', max: '40', step: '1' }, showCancelButton: true })
  resumeAfterPopup()
  if (result.isConfirmed) {
    basePadSpeed = Number(result.value)
    updateSpeeds()
  }
}

async function showScores() {
  pauseForPopup()
  await showPopup({ title: 'Current Score', html: scoreHtml(), confirmButtonText: 'Close' })
  resumeAfterPopup()
}

async function showHelp() {
  pauseForPopup()
  await showPopup({
    title: 'How to Play',
    html: '<div class="space-y-3 text-left text-sm leading-6"><p>Move with the left and right arrow keys.</p><p>Press space to launch the rocket.</p><p>Break asteroids, use ability charges, and keep fuel above zero.</p></div>',
    confirmButtonText: 'Close',
  })
  resumeAfterPopup()
}

async function showAbout() {
  pauseForPopup()
  await showPopup({
    title: 'About',
    html: '<p>Author: Maj Tobija Kodric</p><a href="https://github.com/majtobijakodric/space-bricks" target="_blank" class="text-blue-500 hover:underline">GitHub</a>',
    confirmButtonText: 'Close',
  })
  resumeAfterPopup()
}

function pauseForPopup() {
  pausedBeforePopup = paused
  paused = true
  leftDown = false
  rightDown = false
  setPauseIcon()
}

function resumeAfterPopup() {
  if (!gameOver && !pausedBeforePopup) paused = false
  setPauseIcon()
}

function showPopup(options) {
  options.background = '#111827'
  options.color = '#ffffff'
  options.confirmButtonColor = '#334155'
  return Swal.fire(options)
}

async function askNameFirstTime() {
  if (playerName() !== '') return
  const result = await showPopup({
    title: 'Welcome! Enter your name',
    input: 'text',
    inputPlaceholder: 'Type your name',
    confirmButtonText: 'Save',
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: checkName,
  })
  setPlayerName(result.value)
}

async function changeName() {
  pauseForPopup()
  const result = await showPopup({
    title: 'Change player name',
    input: 'text',
    inputValue: playerName(),
    inputPlaceholder: 'Type your name',
    confirmButtonText: 'Save',
    showCancelButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    inputValidator: checkName,
  })
  resumeAfterPopup()
  if (result.isConfirmed) setPlayerName(result.value)
}

function checkName(value) {
  if (value.trim() === '') return 'Please type your name'
  return undefined
}

function playerName() {
  const name = localStorage.getItem('spaceBricksPlayerName')
  if (name === null) return ''
  return name.trim()
}

function setPlayerName(name) {
  localStorage.setItem('spaceBricksPlayerName', name.trim())
}

function saveScore(won) {
  let count = Number(localStorage.getItem('spaceBricksScoreCount'))
  if (Number.isNaN(count)) count = 0
  count += 1
  localStorage.setItem('spaceBricksScoreCount', count)
  localStorage.setItem('spaceBricksScore' + count + 'Player', playerName())
  localStorage.setItem('spaceBricksScore' + count + 'Score', score)
  localStorage.setItem('spaceBricksScore' + count + 'Mode', mode)
  localStorage.setItem('spaceBricksScore' + count + 'Time', Date.now())
  if (won) localStorage.setItem('spaceBricksScore' + count + 'Won', 'yes')
  else localStorage.setItem('spaceBricksScore' + count + 'Won', 'no')
}

function scoreHtml() {
  let count = Number(localStorage.getItem('spaceBricksScoreCount'))
  let html = '<div class="score-history-panel text-left text-sm leading-6"><p>Current score: <strong>' + score + '</strong></p>'
  if (Number.isNaN(count) || count === 0) return html + '<p>You have not played this game yet.</p></div>'

  html += '<div class="score-history-list"><ol>'
  // scores are stored with separate localStorage keys.
  for (let i = count; i >= 1; i -= 1) {
    html += '<li class="score-history-item"><div class="score-history-copy"><span>Run ' + i + '</span><div class="score-history-meta">'
    html += '<span class="score-history-player">Player: ' + clean(localStorage.getItem('spaceBricksScore' + i + 'Player')) + '</span>'
    html += '<span class="score-history-date">' + timeText(localStorage.getItem('spaceBricksScore' + i + 'Time')) + '</span>'
    if (localStorage.getItem('spaceBricksScore' + i + 'Won') === 'yes') html += '<span class="score-history-status is-finished">Finished</span>'
    else html += '<span class="score-history-status">Did not finish</span>'
    html += '<span class="score-history-mode">' + clean(localStorage.getItem('spaceBricksScore' + i + 'Mode')) + '</span></div></div>'
    html += '<strong>' + clean(localStorage.getItem('spaceBricksScore' + i + 'Score')) + '</strong></li>'
  }
  return html + '</ol></div></div>'
}

function clean(value) {
  let text = ''
  if (value === null) return ''

  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '&') text += '&amp;'
    else if (value[i] === '<') text += '&lt;'
    else if (value[i] === '>') text += '&gt;'
    else if (value[i] === '"') text += '&quot;'
    else if (value[i] === "'") text += '&#39;'
    else text += value[i]
  }

  return text
}

function timeText(value) {
  const date = new Date(Number(value))
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return zero(date.getHours()) + ':' + zero(date.getMinutes()) + ' ' + zero(date.getDate()) + '.' + zero(date.getMonth() + 1) + '.' + date.getFullYear()
}

function zero(number) {
  if (number < 10) return '0' + number
  return number
}

start()
