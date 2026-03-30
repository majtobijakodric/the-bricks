import bg1Url from '../assets/background/bg1.png';
import bg2Url from '../assets/background/bg2.png';
import bg3Url from '../assets/background/bg3.png';
import bg4Url from '../assets/background/bg4.png';
import bg5Url from '../assets/background/bg5.png';
import galaxy1Url from '../assets/background/galaxy1.gif';
import galaxy2Url from '../assets/background/galaxy2.gif';
import gasGiant1Url from '../assets/background/gas-giant1.gif';
import islands1Url from '../assets/background/islands1.gif';
import lavaWorld1Url from '../assets/background/lava-world1.gif';
import star1Url from '../assets/background/star1.gif';
import terranDryUrl from '../assets/background/terran-dry.gif';
import terranWet1Url from '../assets/background/terran-wet1.gif';
import { gameCanvas } from './canvas.ts';

type PlanetPlacement = {
  src: string;
  x: number;
  y: number;
  size: number;
};

const BACKGROUND_IMAGE_URLS = [bg1Url, bg2Url, bg3Url, bg4Url, bg5Url];
const PLANET_IMAGE_URLS = [
  galaxy1Url,
  galaxy2Url,
  gasGiant1Url,
  islands1Url,
  lavaWorld1Url,
  star1Url,
  terranDryUrl,
  terranWet1Url,
];

const PLANET_COUNT = 4;
const PLANET_MIN_SIZE = 88;
const PLANET_MAX_SIZE = 140;
const PLANET_MARGIN = 24;
const CANVAS_SAFE_GAP = 18;
const PLANET_CONTAINER_ID = 'backgroundPlanets';

let activeBackgroundUrl = '';
let selectedPlanetUrls: string[] = [];
let resizeListenerBound = false;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function shuffle<T>(values: T[]) {
  const nextValues = [...values];

  for (let index = nextValues.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextValues[index], nextValues[swapIndex]] = [nextValues[swapIndex], nextValues[index]];
  }

  return nextValues;
}

function getPlanetContainer() {
  let container = document.getElementById(PLANET_CONTAINER_ID);

  if (!container) {
    container = document.createElement('div');
    container.id = PLANET_CONTAINER_ID;
    container.setAttribute('aria-hidden', 'true');
    document.body.append(container);
  }

  return container;
}

function getCanvasRect() {
  if (!gameCanvas) {
    return null;
  }

  return gameCanvas.getBoundingClientRect();
}

function rectanglesOverlap(
  first: { left: number; top: number; right: number; bottom: number },
  second: { left: number; top: number; right: number; bottom: number },
) {
  return !(
    first.right <= second.left
    || first.left >= second.right
    || first.bottom <= second.top
    || first.top >= second.bottom
  );
}

function overlapsCanvas(x: number, y: number, size: number, canvasRect: DOMRect | null) {
  if (!canvasRect) {
    return false;
  }

  return rectanglesOverlap(
    {
      left: x,
      top: y,
      right: x + size,
      bottom: y + size,
    },
    {
      left: canvasRect.left - CANVAS_SAFE_GAP,
      top: canvasRect.top - CANVAS_SAFE_GAP,
      right: canvasRect.right + CANVAS_SAFE_GAP,
      bottom: canvasRect.bottom + CANVAS_SAFE_GAP,
    },
  );
}

function overlapsPlacedPlanets(x: number, y: number, size: number, placements: PlanetPlacement[]) {
  return placements.some((planet) => rectanglesOverlap(
    {
      left: x - PLANET_MARGIN,
      top: y - PLANET_MARGIN,
      right: x + size + PLANET_MARGIN,
      bottom: y + size + PLANET_MARGIN,
    },
    {
      left: planet.x,
      top: planet.y,
      right: planet.x + planet.size,
      bottom: planet.y + planet.size,
    },
  ));
}

function canPlacePlanet(
  x: number,
  y: number,
  size: number,
  placements: PlanetPlacement[],
  canvasRect: DOMRect | null,
) {
  return !overlapsCanvas(x, y, size, canvasRect) && !overlapsPlacedPlanets(x, y, size, placements);
}

function getFallbackPlacement(size: number, placements: PlanetPlacement[], canvasRect: DOMRect | null) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const canvasLeft = canvasRect?.left ?? viewportWidth / 2;
  const canvasRight = canvasRect?.right ?? viewportWidth / 2;
  const canvasTop = canvasRect?.top ?? viewportHeight / 2;
  const canvasBottom = canvasRect?.bottom ?? viewportHeight / 2;

  const candidates = [
    { x: PLANET_MARGIN, y: PLANET_MARGIN },
    { x: viewportWidth - size - PLANET_MARGIN, y: PLANET_MARGIN },
    { x: PLANET_MARGIN, y: viewportHeight - size - PLANET_MARGIN },
    { x: viewportWidth - size - PLANET_MARGIN, y: viewportHeight - size - PLANET_MARGIN },
    { x: PLANET_MARGIN, y: Math.max(PLANET_MARGIN, canvasTop - size - PLANET_MARGIN) },
    { x: viewportWidth - size - PLANET_MARGIN, y: Math.max(PLANET_MARGIN, canvasTop - size - PLANET_MARGIN) },
    { x: PLANET_MARGIN, y: Math.min(viewportHeight - size - PLANET_MARGIN, canvasBottom + PLANET_MARGIN) },
    { x: viewportWidth - size - PLANET_MARGIN, y: Math.min(viewportHeight - size - PLANET_MARGIN, canvasBottom + PLANET_MARGIN) },
    { x: Math.max(PLANET_MARGIN, canvasLeft - size - PLANET_MARGIN), y: PLANET_MARGIN },
    { x: Math.min(viewportWidth - size - PLANET_MARGIN, canvasRight + PLANET_MARGIN), y: PLANET_MARGIN },
  ];

  return candidates.find((candidate) => canPlacePlanet(
    candidate.x,
    candidate.y,
    size,
    placements,
    canvasRect,
  ));
}

function createPlanetPlacements() {
  const placements: PlanetPlacement[] = [];
  const canvasRect = getCanvasRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  for (const src of selectedPlanetUrls) {
    let placementFound = false;

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const size = randomBetween(PLANET_MIN_SIZE, PLANET_MAX_SIZE);
      const maxX = viewportWidth - size - PLANET_MARGIN;
      const maxY = viewportHeight - size - PLANET_MARGIN;

      if (maxX <= PLANET_MARGIN || maxY <= PLANET_MARGIN) {
        break;
      }

      const x = randomBetween(PLANET_MARGIN, maxX);
      const y = randomBetween(PLANET_MARGIN, maxY);

      if (!canPlacePlanet(x, y, size, placements, canvasRect)) {
        continue;
      }

      placements.push({ src, x, y, size });
      placementFound = true;
      break;
    }

    if (!placementFound) {
      const size = PLANET_MIN_SIZE;
      const fallbackPlacement = getFallbackPlacement(size, placements, canvasRect);

      if (fallbackPlacement) {
        placements.push({
          src,
          x: fallbackPlacement.x,
          y: fallbackPlacement.y,
          size,
        });
      }
    }
  }

  return placements;
}

function renderPlanets() {
  const container = getPlanetContainer();
  const placements = createPlanetPlacements();

  container.replaceChildren(
    ...placements.map((planet) => {
      const image = document.createElement('img');
      image.src = planet.src;
      image.alt = '';
      image.className = 'background-planet';
      image.style.left = `${planet.x}px`;
      image.style.top = `${planet.y}px`;
      image.style.width = `${planet.size}px`;
      image.style.height = `${planet.size}px`;
      return image;
    }),
  );
}

export function initializeBackground() {
  activeBackgroundUrl = BACKGROUND_IMAGE_URLS[Math.floor(Math.random() * BACKGROUND_IMAGE_URLS.length)];
  selectedPlanetUrls = shuffle(PLANET_IMAGE_URLS).slice(0, PLANET_COUNT);

  document.body.style.backgroundImage = `url("${activeBackgroundUrl}")`;
  document.body.classList.add('has-game-background');

  renderPlanets();

  if (!resizeListenerBound) {
    window.addEventListener('resize', renderPlanets);
    resizeListenerBound = true;
  }
}
