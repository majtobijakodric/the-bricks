import rockBlue1Url from '../assets/rocks/blue/rock_1.png'
import rockBlue2Url from '../assets/rocks/blue/rock_2.png'
import rockBlue3Url from '../assets/rocks/blue/rock_3.png'

import rockGray1Url from '../assets/rocks/gray/rock_1.png'
import rockGray2Url from '../assets/rocks/gray/rock_2.png'
import rockGray3Url from '../assets/rocks/gray/rock_3.png'

import rockNormal1Url from '../assets/rocks/normal/rock_1.png'
import rockNormal2Url from '../assets/rocks/normal/rock_2.png'
import rockNormal3Url from '../assets/rocks/normal/rock_3.png'

import rockRed1Url from '../assets/rocks/red/rock_1.png'
import rockRed2Url from '../assets/rocks/red/rock_2.png'
import rockRed3Url from '../assets/rocks/red/rock_3.png'

import { featureConfig, rockSpriteConfig } from './config.js'
import { ASTEROID_AREA_OFFSET_X, ASTEROID_AREA_OFFSET_Y, addFuel, addScore, canvasHeight, canvasWidth, cell, columns, fuel, hasHandledBottomMiss, isRocketLaunched, loseFuel, markBottomMissHandled, pad, resetBottomMissState, rocket, rows, setBasePadSpeed, setBaseRocketSpeed, setGameOver, setRocketLaunched } from './game.js'
import { chargeAbility } from './abilities.js'
import { openGameOverSweet, openWinSweet, updateFuelTankLevel } from './ui.js'

const rockSpriteSources = {
  normal: [rockNormal1Url, rockNormal2Url, rockNormal3Url],
  gray: [rockGray1Url, rockGray2Url, rockGray3Url],
  blue: [rockBlue1Url, rockBlue2Url, rockBlue3Url],
  red: [rockRed1Url, rockRed2Url, rockRed3Url],
}

const asteroidScoreValues = {
  normal: 1,
  gray: 3,
  blue: 5,
  red: 10,
}

function loadSprite(src) {
  const sprite = new Image()
  sprite.src = src
  return sprite
}

function pickAsteroidColor() {
  const grayWeight = rockSpriteConfig.weights.gray
  const normalWeight = rockSpriteConfig.weights.normal
  const blueWeight = rockSpriteConfig.weights.blue
  const redWeight = rockSpriteConfig.weights.red
  const totalWeight = grayWeight + normalWeight + blueWeight + redWeight

  if (totalWeight <= 0) {
    return 'normal'
  }

  const x = Math.floor(Math.random() * 100) + 1

  if (x > 100 - grayWeight) {
    return 'gray'
  }

  if (x > 100 - (grayWeight + normalWeight)) {
    return 'normal'
  }

  if (x > 100 - (grayWeight + normalWeight + blueWeight)) {
    return 'blue'
  }

  return 'red'
}

function pickRandomAsteroid(color) {
  const sources = rockSpriteSources[color]
  const source = sources[Math.floor(Math.random() * sources.length)] ?? sources[0]
  return loadSprite(source)
}

export function drawAsteroidSprite(ctx, sprite, x, y, width, height) {
  ctx.save()
  ctx.drawImage(sprite, Math.round(x), Math.round(y), Math.round(width), Math.round(height))
  ctx.restore()
}

export let asteroids = []

export function resetRocketLaunchState() {
  setRocketLaunched(false)
  resetRocketPosition()
}

export function launchRocketFromPad() {
  if (isRocketLaunched) {
    return
  }

  setRocketLaunched(true)

  // Chooses a random angle between 45° and 90°
  const launchAngle = (Math.random() * Math.PI) / 2 + Math.PI / 4
  rocket.x = pad.x + pad.width / 2
  rocket.y = pad.y - rocket.radius - 5
  rocket.dx = Math.cos(launchAngle) * rocket.speed
  rocket.dy = -Math.sin(launchAngle) * rocket.speed
}

export function setRocketSpeed(speed) {
  setBaseRocketSpeed(speed)
}

export function updateRocketPosition() {
  if (!isRocketLaunched) {
    return
  }

  rocket.x += rocket.dx
  rocket.y += rocket.dy
}

export function movePad(x) {
  pad.x = Math.max(0, Math.min(canvasWidth - pad.width, x))
}

export function movePadBy(x) {
  movePad(pad.x + x)
}

export function setPadSpeed(speed) {
  setBasePadSpeed(speed)
}

export function resetPadPosition() {
  pad.x = canvasWidth / 2 - pad.width / 2
  pad.y = canvasHeight - pad.height - 10
}

export function resetRocketPosition() {
  rocket.x = pad.x + pad.width / 2
  rocket.y = pad.y - rocket.radius - 5
  rocket.dx = 0
  rocket.dy = -rocket.speed
}

export function initializeAsteroids() {
  asteroids = []

  const startX = ASTEROID_AREA_OFFSET_X
  const startY = ASTEROID_AREA_OFFSET_Y
  const availableWidth = canvasWidth - ASTEROID_AREA_OFFSET_X * 2
  const totalHorizontalSpacing = cell.marginLeftRight * (columns - 1)
  const cellWidth = (availableWidth - totalHorizontalSpacing) / columns

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const spriteColor = pickAsteroidColor()

      asteroids.push({
        x: startX + (column * (cellWidth + cell.marginLeftRight)),
        y: startY + (row * (cell.height + cell.marginTop)),
        width: cellWidth,
        height: cell.height,
        sprite: pickRandomAsteroid(spriteColor),
        spriteColor,
      })
    }
  }
}

export function removeAsteroidAtIndex(index) {
  asteroids.splice(index, 1)
}

export function handleWallCollisions() {
  if (!isRocketLaunched) {
    return
  }

  if (rocket.x + rocket.radius >= canvasWidth || rocket.x - rocket.radius <= 0) {
    rocket.dx *= -1
    rocket.x = Math.max(rocket.radius, Math.min(canvasWidth - rocket.radius, rocket.x))
  }

  if (rocket.y - rocket.radius <= 0) {
    rocket.dy *= -1
    rocket.y = rocket.radius
  }

  const bottomLimit = canvasHeight + (featureConfig.enableDeath ? featureConfig.deathBoundaryOffset : 0)
  const rocketBottom = rocket.y + rocket.radius

  if (featureConfig.enableDeath) {
    if (hasHandledBottomMiss && rocketBottom < canvasHeight) {
      resetBottomMissState()
    }

    if (rocket.dy > 0 && rocketBottom >= bottomLimit) {
      if (!hasHandledBottomMiss) {
        loseFuel()
        updateFuelTankLevel(fuel / featureConfig.maxFuel)
        markBottomMissHandled()
      }

      rocket.dy = -Math.abs(rocket.dy)
      rocket.y = bottomLimit - rocket.radius

      if (fuel === 0) {
        setGameOver(true)
        void openGameOverSweet()
      }
    }

    return
  }

  if (rocketBottom >= bottomLimit) {
    rocket.dy *= -1
    rocket.y = bottomLimit - rocket.radius
  }
}

export function handlePadCollision() {
  if (!isRocketLaunched) {
    return
  }

  const hitsPadHorizontally = rocket.x + rocket.radius >= pad.x && rocket.x - rocket.radius <= pad.width + pad.x
  const hitsPadVertically = rocket.y + rocket.radius >= pad.y && rocket.y - rocket.radius <= pad.y + pad.height

  if (rocket.dy > 0 && hitsPadHorizontally && hitsPadVertically) {
    const relativeHit = (rocket.x - (pad.x + pad.width / 2)) / pad.width

    rocket.dx = 8 * relativeHit
    rocket.dy = -Math.abs(rocket.dy)
    rocket.y = pad.y - rocket.radius
  }
}

function isRocketTouchingAsteroid(asteroid) {
  const rocketLeft = rocket.x - rocket.radius
  const rocketRight = rocket.x + rocket.radius
  const rocketTop = rocket.y - rocket.radius
  const rocketBottom = rocket.y + rocket.radius

  const asteroidLeft = asteroid.x
  const asteroidRight = asteroid.x + asteroid.width
  const asteroidTop = asteroid.y
  const asteroidBottom = asteroid.y + asteroid.height

  const overlapsHorizontally = rocketRight >= asteroidLeft && rocketLeft <= asteroidRight
  const overlapsVertically = rocketBottom >= asteroidTop && rocketTop <= asteroidBottom

  return overlapsHorizontally && overlapsVertically
}

function bounceRocketOffAsteroid(asteroid) {
  const overlapFromLeft = rocket.x + rocket.radius - asteroid.x
  const overlapFromRight = asteroid.x + asteroid.width - (rocket.x - rocket.radius)
  const overlapFromTop = rocket.y + rocket.radius - asteroid.y
  const overlapFromBottom = asteroid.y + asteroid.height - (rocket.y - rocket.radius)

  const horizontalOverlap = Math.min(overlapFromLeft, overlapFromRight)
  const verticalOverlap = Math.min(overlapFromTop, overlapFromBottom)

  if (horizontalOverlap < verticalOverlap) {
    rocket.dx *= -1

    if (overlapFromLeft < overlapFromRight) {
      rocket.x = asteroid.x - rocket.radius
      return
    }

    rocket.x = asteroid.x + asteroid.width + rocket.radius
    return
  }

  rocket.dy *= -1

  if (overlapFromTop < overlapFromBottom) {
    rocket.y = asteroid.y - rocket.radius
    return
  }

  rocket.y = asteroid.y + asteroid.height + rocket.radius
}

export function handleAsteroidCollisions() {
  if (!isRocketLaunched) {
    return
  }

  for (let index = 0; index < asteroids.length; index += 1) {
    const asteroid = asteroids[index]

    if (!isRocketTouchingAsteroid(asteroid)) {
      continue
    }

    bounceRocketOffAsteroid(asteroid)
    addScore(asteroidScoreValues[asteroid.spriteColor] ?? asteroidScoreValues.normal)

    if (asteroid.spriteColor === 'red' || asteroid.spriteColor === 'blue') {
      chargeAbility(asteroid.spriteColor)
    }

    if (asteroid.spriteColor === 'gray') {
      addFuel(1)
      updateFuelTankLevel(fuel / featureConfig.maxFuel)
    }

    removeAsteroidAtIndex(index)

    if (asteroids.length === 0) {
      setGameOver(true)
      void openWinSweet()
    }

    return
  }
}
