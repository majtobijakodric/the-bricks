# Space Bricks

A space-themed brick breaker where you guide a rocket through an asteroid field, manage limited fuel, collect charged abilities, and clear the entire sector to win.

## Features

- **Asteroid Field Gameplay** - Bounce the rocket off the pad and clear a 4 x 12 asteroid layout.
- **Fuel System** - Fuel drains during flight; when the rocket drops below the play area, it bounces back and loses 0.5 fuel. Gray asteroids restore fuel.
- **Ability System** - Blue and red asteroids charge abilities that apply random temporary gameplay effects.
- **Difficulty Modes** - Easy, Medium, Hard, and Experimental presets change rocket and pad speed through a SweetAlert2 mode picker.
- **Experimental Controls** - Experimental mode also exposes SweetAlert sliders for manual rocket and pad speed tuning.
- **Score History** - Runs are saved in local storage with score, timestamp, finish status, and difficulty.
- **Win and Loss Modals** - SweetAlert2 is used for score history, settings, game over, and victory screens.
- **Sprite-Based Visuals** - Pixel-art asteroid, rocket, and pad sprites sit on top of a space background with floating planets.

## Tech Stack

- **Build**: Vite
- **Styling**: Tailwind CSS v4, custom CSS
- **UI**: SweetAlert2, Lucide icons
- **Fonts**: Stepalange, JetBrains Mono
- **Deployment**: GitHub Pages

## Project Structure

```text
src/
  js/
    main.js           # App bootstrap, game loop, input, rendering
    gameLogic.js      # Score, fuel, asteroids, abilities, reset/end logic
    rocketAndPad.js   # Rocket, pad, wall, and pad movement/collision
    localStorage.js   # Player name and score history persistence
    swalMenus.js      # SweetAlert2 menus and dialogs
  assets/
    background/       # Space background images
    rocks/            # Asteroid sprites
    rockets/          # Rocket sprites
    sound/            # Audio assets
  style/
    style.css         # Global styling and Tailwind
index.html            # Game shell and HUD layout
vite.config.js        # Vite config and GitHub Pages base path
```

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
- If the rocket misses the pad and drops below the play area, it bounces back and loses 0.5 fuel.
- The game ends when fuel reaches zero.
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

## Credits

Asteroid sprites: [Pixel Art Top Down Rocks Pack](https://dustdfg.itch.io/pixel-art-top-down-rocks-pack) by dustdfg

Space background: [Space Background Generator](https://deep-fold.itch.io/space-background-generator) by deep-fold

## License

MIT License. See [LICENSE](LICENSE) for the full text.
