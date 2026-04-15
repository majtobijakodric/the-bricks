# The Bricks

A space-themed brick breaker where you pilot a rocket through asteroid fields. Destroy asteroids, collect abilities, and manage your fuel reserves to survive.

## Features

- **Asteroid Field Gameplay** - Blast through procedurally-arranged asteroids with a rocket that bounces and ricochets
- **Fuel System** - Your fuel depletes over time and when the rocket escapes into space; gray asteroids restore fuel
- **Ability System** - Blue and red asteroids charge abilities that trigger random effects (pad speed boosts, fuel pauses, rocket stabilization)
- **Difficulty Modes** - Easy, Medium, Hard, and Experimental presets control rocket/pad speed and fuel drain rate
- **Sprite-Based Visuals** - Asteroids rendered from pixel art sprite sheets with weighted color distribution
- **Space Aesthetic** - Custom fonts (Orbitron, Oxanium, JetBrains Mono) and space background

## Tech Stack

- **Build**: Vite
- **Styling**: Tailwind CSS v4, custom CSS
- **UI**: Lucide icons, SweetAlert2
- **Fonts**: Orbitron, Oxanium, JetBrains Mono
- **Deployment**: GitHub Pages

## Project Structure

```
src/
  js/
    main.js         # App bootstrap
    game.js         # Game state, loop, and effect system
    entities.js     # Rocket, pad, asteroid entities and collisions
    abilities.js    # Ability charging and effect application
    config.js       # Game settings, modes, and feature flags
    canvas.js       # Canvas and button element wiring
    ui.js           # HUD, modals, and UI updates
    render.js       # Canvas drawing
  assets/
    background/     # Space background image
    rocks/          # Asteroid sprite sheets (blue, gray, normal, red)
    rockets/        # Rocket sprites
    sound/          # Audio assets
  style/
    style.css       # Global styling and Tailwind
index.html          # Game shell and HUD layout
vite.config.js      # Vite config and GitHub Pages base path
package.json        # Scripts and dependencies
```

## Controls

| Input | Action |
|-------|--------|
| Left / Right Arrow | Move pad |
| Space | Launch rocket (before launch) |
| Blue ability button | Activate blue ability |
| Red ability button | Activate red ability |
| Pause button | Pause / resume game |

## Ability Effects

**Red Ability (offense/defense)**:
- Pause fuel drain for 5 seconds
- Restore 1 fuel unit
- Expand pad width for 8 seconds
- Slow fuel drain for 8 seconds

**Blue Ability (mobility/chaos)**:
- Boost pad speed for 8 seconds
- Stabilize rocket (reduce speed) for 8 seconds
- Slow pad speed for 8 seconds
- Overdrive rocket for 8 seconds
- Spike fuel drain for 5 seconds

## Asteroids

| Type | Chance | Effect |
|------|--------|--------|
| Normal | 70% | Destroys asteroid |
| Gray | 18% | Destroys asteroid, restores fuel |
| Blue | 8% | Destroys asteroid, charges blue ability |
| Red | 4% | Destroys asteroid, charges red ability |

## Setup

```bash
git clone https://github.com/majtobijakodric/the-bricks.git
cd the-bricks
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

## Deploy

```bash
npm run deploy
```

## Credits

Asteroid sprites: [Pixel Art Top Down Rocks Pack](https://dustdfg.itch.io/pixel-art-top-down-rocks-pack) by dustdfg

Space background: [Space Background Generator](https://deep-fold.itch.io/space-background-generator) by deep-fold

## License

Not specified
