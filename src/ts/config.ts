// Main game settings.
// Keep easy-to-edit values here.

export const canvasConfig = {
  width: 800,
  height: 600,
};

export const colorConfig = {
  rocket: 'red',
  pad: 'blue',
  background: 'lightgray',
  asteroid: 'green',
};

export const asteroidLayoutConfig = {
  offsetX: 18,
  offsetY: 15,
  rows: 4,
  columns: 12,
  cell: {
    width: 15,
    height: 45,
    marginLeftRight: 3,
    marginTop: 3,
    padding: 1,
  },
};

export const modeConfig = {
  defaultMode: 'medium',
  values: {
    easy: {
      rocketSpeed: 4,
      padSpeed: 3,
      speedMultiplier: 0,
    },
    medium: {
      rocketSpeed: 5,
      padSpeed: 4,
      speedMultiplier: 0.02,
    },
    hard: {
      rocketSpeed: 7,
      padSpeed: 6,
      speedMultiplier: 0.05,
    },
    experimental: {
      rocketSpeed: 5,
      padSpeed: 4,
      speedMultiplier: 0,
    },
  },
} as const;

export const featureConfig = {
  useBonusAsteroids: true,
  enableDeath: true,
  maxFuel: 5,
  fuelBurnPerSecond: 0.1,
  deathBoundaryOffset: 80,
};

export const rockSpriteConfig = {
  weights: {
    normal: 70,
    gray: 18,
    blue: 8,
    red: 4,
  },
} as const;

export const rocketSpriteConfig = {
  sizeMultiplier: 6,
} as const;
