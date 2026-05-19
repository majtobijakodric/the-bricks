export function movePad(state, pad, rocket, width) {
  if (state.leftDown) pad.x -= pad.speed
  if (state.rightDown) pad.x += pad.speed
  if (pad.x < 0) pad.x = 0
  if (pad.x + pad.width > width) pad.x = width - pad.width
  if (!state.rocketStarted) putRocketOnPad(pad, rocket)
}

export function launchRocket(state, pad, rocket) {
  if (state.rocketStarted) return
  state.rocketStarted = true
  rocket.x = pad.x + pad.width / 2
  rocket.y = pad.y - rocket.radius - 5
  rocket.dy = -rocket.speed

  // choose one of two simple starting directions.
  if (Math.random() < 0.5) rocket.dx = -rocket.speed
  else rocket.dx = rocket.speed
}

export function moveRocket(state, pad, rocket) {
  if (!state.rocketStarted) {
    putRocketOnPad(pad, rocket)
    return
  }

  rocket.x += rocket.dx
  rocket.y += rocket.dy
}

export function checkWalls(state, rocket, width, height) {
  const bottomBounceFuelCost = 0.5
  const bottomBounceDepth = 80

  if (!state.rocketStarted) return
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
  if (rocket.dy > 0 && rocket.y - rocket.radius > height + bottomBounceDepth) {
    rocket.y = height + bottomBounceDepth + rocket.radius
    rocket.dy = -Math.abs(rocket.dy)
    state.fuel -= bottomBounceFuelCost
    if (state.fuel < 0) state.fuel = 0
  }
}

export function checkPad(state, pad, rocket) {
  if (!state.rocketStarted || rocket.dy <= 0) return
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

export function putRocketOnPad(pad, rocket) {
  rocket.x = pad.x + pad.width / 2
  rocket.y = pad.y - rocket.radius - 5
  rocket.dx = 0
  rocket.dy = -rocket.speed
}

export function updateSpeeds(state, pad, rocket) {
  pad.speed = state.basePadSpeed * state.padBoost
  rocket.speed = state.baseRocketSpeed * state.rocketBoost
  if (pad.speed < 1) pad.speed = 1
  if (rocket.speed < 1) rocket.speed = 1
  if (!state.rocketStarted) return
  if (rocket.dx < 0) rocket.dx = -rocket.speed
  if (rocket.dx > 0) rocket.dx = rocket.speed
  if (rocket.dy < 0) rocket.dy = -rocket.speed
  if (rocket.dy > 0) rocket.dy = rocket.speed
}
