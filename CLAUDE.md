# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlanetComparison is a browser-based astronomy education game built with vanilla JavaScript and Three.js. Players compare the sizes of celestial objects (planets, moons, nebulae, galaxies, star clusters) by clicking on the larger object in 3D rendered pairs.

## Key Architecture

### Core Files
- `index.html` - Main HTML entry point, loads Three.js CDN and game script
- `game.js` - Main game logic with Three.js 3D rendering, interaction handling, and game state management
- `objects.json` - JSON data file containing celestial objects with their sizes, colors, textures, and types
- `style.css` - Responsive CSS with viewport handling and 3D scene styling
- `textures/` - Directory containing texture images for 3D objects
- `sounds/` - Audio files for success/failure feedback
- `images/` - Background images

### Game Architecture
- **Data-driven design**: All celestial objects loaded from `objects.json` with size comparisons
- **3D Rendering**: Uses Three.js for sphere geometry with texture mapping and lighting
- **Special rendering**: Saturn has procedural ring geometry with custom UV mapping
- **Input handling**: Unified pointer events (mouse/touch) with raycasting for 3D object selection
- **Audio system**: Success/failure sounds with Safari compatibility handling
- **Responsive design**: Mobile-first with viewport meta tags and touch event handling

### Object Data Structure
Each object in `objects.json` contains:
- `name`: Display name
- `size`: Real-world diameter in kilometers
- `color`: Fallback color (hexadecimal)
- `texture`: Filename in textures/ directory
- `type`: Optional category (planet, nebula, galaxy, star cluster)

## Development Commands

This is a static web project with no build process. Development workflow:

```bash
# Serve locally (any HTTP server)
python3 -m http.server 8000
# or
npx serve .

# Open index.html in browser for local testing
open index.html
```

## Maintenance Scripts

Two Python utility scripts for managing game data:

```bash
# Add new stellar objects with texture downloads
python3 add_stellar_objects.py

# Clean objects.json to remove entries with missing textures
python3 clean_missing_textures.py
```

## Game Logic Flow

1. Load `objects.json` via fetch API
2. Pick two random objects and display as 3D spheres
3. Handle click/touch input via Three.js raycasting
4. Compare sizes and provide feedback (confetti for success)
5. Track success counter and advance to next round

## Key Implementation Details

- **Saturn rendering**: Custom ring geometry with texture UV remapping at `game.js:110-141`
- **Cross-platform input**: Unified pointer events with mouse/touch/keyboard support at `game.js:263-299`
- **Audio unlocking**: Safari requires user interaction before audio playback at `game.js:42-58`
- **Responsive 3D**: Dynamic canvas sizing and label positioning for mobile/desktop
- **Performance**: Mesh reuse and proper cleanup between rounds

## Deployment

Static site deployment ready for GitHub Pages, Netlify, Vercel, or any static hosting service. No build step required.