# Space Bricks

Space Bricks is a small canvas game inspired by brick breaker games. The player moves the pad with the keyboard, launches a rocket, breaks asteroids, collects ability charges, and tries to keep enough fuel until all asteroids are gone.

## Controls

- `ArrowLeft` moves the pad left.
- `ArrowRight` moves the pad right.
- `Space` launches the rocket.
- The pause button pauses and resumes the game.

## Game Rules

- Normal asteroids give 1 point.
- Gray asteroids give 3 points and restore fuel.
- Blue asteroids give 5 points and one blue ability charge.
- Red asteroids give 10 points and one red ability charge.
- The game ends when fuel reaches zero or the rocket falls below the screen.
- The player wins after clearing all asteroids.

## Abilities

Red abilities are mostly connected to fuel. They can pause fuel drain, restore fuel, or slow fuel drain for a short time.

Blue abilities change movement. They can boost or slow the pad, slow or speed up the rocket, or increase fuel drain for a short time.

The temporary ability effects use simple frame counters in the JavaScript code. There are no timeout ids for these effects.

## Storage

The game stores values separately in `localStorage`.

- `spaceBricksPlayerName` stores the player name.
- `spaceBricksScoreCount` stores how many scores were saved.
- Each score stores separate values for player, score, mode, time, and win state.

## Development

Install dependencies:

```bash
npm install
```

Run the project locally:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Deploy to GitHub Pages:

```bash
npm run deploy
```

The GitHub Pages base path is set to `/space-bricks/` in `vite.config.js`.
