import {
  BRICK_AREA_OFFSET_X,
  BRICK_AREA_OFFSET_Y,
  cell,
  columns,
  rows,
  canvasWidth,
} from './gameState.ts';
import { asteroidShapes } from './asteroidShapes.ts';

export type AsteroidMaterial = 'red' | 'silver' | 'iron' | 'rock';

export type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  shapeIndex: number;
  material: AsteroidMaterial;
  textureVariant: number;
  points: number;
};

export let bricks: Brick[] = [];

const MATERIAL_RARITIES: Array<{ material: AsteroidMaterial; weight: number; points: number }> = [
  { material: 'red', weight: 4, points: 5 },
  { material: 'silver', weight: 8, points: 3 },
  { material: 'iron', weight: 18, points: 2 },
  { material: 'rock', weight: 70, points: 1 },
];

function randomShapeIndex() {
  return Math.floor(Math.random() * asteroidShapes.length);
}

function randomTextureVariant() {
  return Math.floor(Math.random() * 3);
}

function pickMaterial() {
  const totalWeight = MATERIAL_RARITIES.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const entry of MATERIAL_RARITIES) {
    threshold -= entry.weight;

    if (threshold <= 0) {
      return entry;
    }
  }

  return MATERIAL_RARITIES[MATERIAL_RARITIES.length - 1];
}

export function initializeBricks() {
  bricks = [];

  const startX = BRICK_AREA_OFFSET_X;
  const startY = BRICK_AREA_OFFSET_Y;
  const availableWidth = canvasWidth - BRICK_AREA_OFFSET_X * 2;
  const totalHorizontalSpacing = cell.marginLeftRight * (columns - 1);
  const cellWidth = (availableWidth - totalHorizontalSpacing) / columns;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const material = pickMaterial();

      bricks.push({
        x: startX + (j * (cellWidth + cell.marginLeftRight)),
        y: startY + (i * (cell.height + cell.marginTop)),
        width: cellWidth,
        height: cell.height,
        shapeIndex: randomShapeIndex(),
        material: material.material,
        textureVariant: randomTextureVariant(),
        points: material.points,
      });
    }
  }
}

export function removeBrickAtIndex(index: number) {
  bricks.splice(index, 1);
}
