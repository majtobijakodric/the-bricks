# The Bricks

Space-themed Breakout built with Vite, TypeScript, and Tailwind CSS.
It is for players who want a fast arcade game with randomized asteroid visuals and a polished sci-fi presentation.

## Table of Contents

- Features
- Screenshots
- Tech Stack
- Project Structure
- Notes
- How to Use
- Author
- License

## Core Story

### Features

- Classic brick-breaking gameplay with paddle, ball, score, and timer.
- Randomized asteroid bricks with multiple shapes, materials, and textures.
- Space background system with layered planets and randomized backdrops.
- Pause and about controls with icon-based UI.
- Keyboard paddle controls using the left and right arrow keys.

### Screenshots

- Overview: `assets/screenshots/overview.png`
- In action: `assets/screenshots/in-action.png`
- Result state: `assets/screenshots/result-state.png`
- Settings/modal: `assets/screenshots/about-modal.png`

### Tech Stack

- Frontend: TypeScript, Vite
- Styling: Tailwind CSS v4, custom CSS
- UI/icons: Lucide, SweetAlert2
- Fonts: Orbitron, JetBrains Mono, Space Nova
- Deployment: GitHub Pages via `gh-pages`

## How It Is Built

### Project Structure

```text
src/
  ts/
    main.ts              # App bootstrap and startup flow
    canvas.ts            # Canvas and button element wiring
    gameLoop.ts          # Animation loop and per-frame updates
    gameState.ts         # Shared game state and reset helpers
    config.ts            # Game settings, colors, modes, and feature flags
    ball.ts              # Ball movement and collision logic
    pad.ts               # Paddle movement helpers
    bricks.ts            # Brick generation and removal
    asteroidShapes.ts    # Base shapes used for asteroid bricks
    asteroidTextures.ts  # Procedural asteroid texture rendering
    render.ts            # Canvas drawing for the scene
    background.ts        # Random space backdrop and planet placement
    buttons.ts           # Pause and About button behavior
    events.ts            # Keyboard input listeners
    scoring.ts           # Score tracking and UI updates
    ui.ts                # Score, timer, mode, and pause label updates
    refreshRate.ts       # Refresh-rate estimation utility
   assets/                # Backgrounds, fonts, and images
  style/style.css        # Global styling and Tailwind import
index.html               # Game shell and HUD layout
vite.config.ts           # Vite config and GitHub Pages base path
package.json             # Scripts and dependencies
```

### Notes

- The game boots from `src/ts/main.ts`, which initializes the background, bricks, UI, and loop.
- Brick visuals are generated procedurally from shape data and seeded textures, so the board feels varied each run.
- The background system picks a random space image and places decorative planets around the canvas.
- The pause button clears held input so the paddle does not keep moving after resume.
- The repository is configured for GitHub Pages with the `/the-bricks/` base path in `vite.config.ts`.
- Difficulty presets exist in `src/ts/config.ts`, but the current UI only displays the default mode.

## How To Use It

### Clone / Install

```bash
git clone https://github.com/majtobijakodric/the-bricks.git
cd the-bricks
npm install
```

### Run Locally

```bash
npm run dev
```

### Build For Production

```bash
npm run build
```

### Preview The Production Build

```bash
npm run preview
```

### Usage

1. Open the app in a browser.
2. Move the paddle with the left and right arrow keys.
3. Use Pause to stop and resume the game.
4. Use About to view project details.

## Closing

- Author: Maj Tobija Kodrič
- License: Not specified
