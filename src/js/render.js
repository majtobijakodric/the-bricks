import rocketSrc from '../assets/rockets/rocketBlue.png'
import padSrc from '../assets/pad/pad1.png'

import { gameCanvas } from './canvas.js'
import { rocketSpriteConfig } from './config.js'
import { asteroids, drawAsteroidSprite } from './entities.js'
import { pad, rocket } from './game.js'

const rocketImage = new Image()
rocketImage.src = rocketSrc

const padImage = new Image()
padImage.src = padSrc

// The sprite points upward by default, then gets flipped 180 degrees.
const rocketRotationOffset = Math.PI / 2

export function renderScene() {
  if (!gameCanvas) {
    return
  }

  const ctx = gameCanvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height)
  renderAsteroids(ctx)

  if (padImage.complete && padImage.naturalWidth > 0) {
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(padImage, Math.round(pad.x), Math.round(pad.y), Math.round(pad.width), Math.round(pad.height))
    ctx.restore()
  } else {
    ctx.fillStyle = 'blue'
    ctx.fillRect(pad.x, pad.y, pad.width, pad.height)
  }

  const size = rocket.radius * rocketSpriteConfig.sizeMultiplier
  const angle = Math.atan2(rocket.dy, rocket.dx) + rocketRotationOffset

  ctx.save()
  ctx.translate(rocket.x, rocket.y)
  ctx.rotate(angle)

  if (rocketImage.complete && rocketImage.naturalWidth > 0) {
    const fitScale = size / Math.max(rocketImage.naturalWidth, rocketImage.naturalHeight)
    const drawWidth = rocketImage.naturalWidth * fitScale
    const drawHeight = rocketImage.naturalHeight * fitScale

    ctx.drawImage(rocketImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  } else {
    ctx.beginPath()
    ctx.arc(0, 0, rocket.radius, 0, Math.PI * 2)
    ctx.fillStyle = 'red'
    ctx.fill()
    ctx.closePath()
  }

  ctx.restore()
}

function renderAsteroids(ctx) {
  asteroids.forEach((asteroid) => {
    drawAsteroidSprite(
      ctx,
      asteroid.sprite,
      asteroid.x,
      asteroid.y,
      asteroid.width,
      asteroid.height,
    )
  })
}
