# Tank Destroyer - Game Design Document

## Game Overview
**Genre**: Arcade Action/Shooter  
**Platform**: PC/Web (retro-styled)  
**Target Audience**: Retro gaming enthusiasts, casual players  
**Art Style**: 8-bit pixel art, limited color palette (Atari 2600 inspired)

## Core Gameplay

### Objective
Destroy enemy tanks while avoiding their fire and obstacles. Survive waves of increasingly difficult enemies.

### Player Controls
- **Movement**: Arrow keys or WASD (8-directional movement)
- **Fire**: Spacebar or mouse click
- **Rotate turret**: Mouse movement or Q/E keys

### Game Mechanics
- **Tank Movement**: Grid-based or smooth movement at fixed speed
- **Projectile System**: Single shot on screen at a time (authentic Atari limitation)
- **Collision Detection**: Simple rectangular hit boxes
- **Lives System**: 3 lives, extra life every 10,000 points

## Visual Design

### Screen Resolution
- 160x192 pixels (scaled up for modern displays)
- 4:3 aspect ratio

### Color Palette
- Background: Black (#000000)
- Player tank: Green (#00FF00)
- Enemy tanks: Red (#FF0000), Yellow (#FFFF00)
- Projectiles: White (#FFFFFF)
- Obstacles: Brown (#8B4513)
- UI text: White (#FFFFFF)

### Sprites
- Player tank: 8x8 pixels
- Enemy tanks: 8x8 pixels (different colors for types)
- Projectiles: 2x2 pixels
- Obstacles: 16x16 pixel blocks

## Audio Design

### Sound Effects
- Tank movement: Low-pitched beeping
- Shooting: Sharp "pew" sound
- Explosion: Crash/static burst
- Enemy destroyed: Higher-pitched explosion
- Game over: Descending tone sequence

### Music
- Simple 4-note background loop
- Victory fanfare for level completion

## Level Design

### Playfield
- Single screen battlefield
- Static obstacles (walls, barriers)
- No scrolling (true to Atari limitations)

### Enemy Types
1. **Basic Tank**: Moves in straight lines, fires randomly
2. **Smart Tank**: Aims at player position
3. **Fast Tank**: Moves quickly but fires less accurately
4. **Heavy Tank**: Takes 2 hits, moves slowly

### Wave Progression
- Wave 1: 2 basic tanks
- Wave 2: 3 basic tanks
- Wave 3: 2 basic + 1 smart tank
- Continue increasing difficulty with mixed enemy types

## Technical Specifications

### Performance Targets
- 60 FPS gameplay
- Minimal memory usage
- Instant response to input

### File Structure
```
/src
  /sprites
  /sounds
  /levels
  main.js
  game.js
  player.js
  enemy.js
  collision.js
```

## User Interface

### HUD Elements
- Score (top left)
- Lives remaining (top right)
- Wave number (top center)
- High score display

### Screens
- Title screen with simple animation
- Game over screen with score
- High score entry (3 characters, arcade style)

## Scoring System
- Enemy tank destroyed: 100 points
- Smart tank destroyed: 200 points
- Fast tank destroyed: 150 points
- Heavy tank destroyed: 300 points
- Wave completion bonus: 500 points
- Perfect wave (no damage): 1000 bonus points
