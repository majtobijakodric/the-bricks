import planet1 from '../assets/background/1.gif'
import planet2 from '../assets/background/2.gif'
import planet3 from '../assets/background/3.gif'

const PLANETS = [planet1, planet2, planet3]
const MIN_SIZE = 96
const MAX_SIZE = 180

let layer
let planets = []

export function setupPlanetBackground() {
  if (layer) return

  layer = document.createElement('div')
  layer.className = 'planet-background'
  layer.setAttribute('aria-hidden', 'true')

  planets = []

  for (let index = 0; index < PLANETS.length; index += 1) {
    const src = PLANETS[index]
    const img = document.createElement('img')
    img.className = 'planet-background__planet'
    img.src = src
    img.alt = ''
    img.draggable = false
    img.decoding = 'async'
    layer.append(img)
    planets.push(img)
  }

  document.body.append(layer)

  window.addEventListener('resize', positionPlanets)
  positionPlanets()
}

function positionPlanets() {
  const size = getPlanetSize()

  planets.forEach((img, index) => {
    const planetSize = Math.max(MIN_SIZE - index * 10, size - index * 12)
    const position = placePlanetAtRandomSpot(planetSize)

    if (!position) {
      img.style.display = 'none'
      return
    }

    img.style.display = 'block'
    img.style.width = `${planetSize}px`
    img.style.height = `${planetSize}px`
    img.style.left = `${position.left}px`
    img.style.top = `${position.top}px`
  })
}

function getPlanetSize() {
  const baseSize = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.16)
  return Math.min(Math.max(baseSize, MIN_SIZE), MAX_SIZE)
}

function placePlanetAtRandomSpot(size) {
  const maxX = window.innerWidth - size
  const maxY = window.innerHeight - size

  if (maxX < 0 || maxY < 0) {
    return null
  }

  const left = Math.floor(Math.random() * (maxX + 1))
  const top = Math.floor(Math.random() * (maxY + 1))
  return { left, top }
}

