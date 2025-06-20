# Tank Destroyer - Retro Game

A retro-style tank destroyer game inspired by classic Atari games.

## How to Play

1. Open `index.html` in a web browser
2. Press any key to start the game
3. Use WASD or Arrow Keys to move your tank
4. Press SPACEBAR to fire (only one bullet on screen at a time)
5. Use Q/E to rotate your turret
6. Destroy all enemy tanks to advance to the next wave
7. Avoid enemy fire and survive as long as possible

## Game Features

- **Retro 8-bit graphics** with authentic pixel art style
- **Multiple enemy types**:
  - Red tanks (Basic): Move randomly, fire occasionally
  - Yellow tanks (Smart): Aim at player, more aggressive
  - Orange tanks (Fast): Move quickly but less accurate
  - Purple tanks (Heavy): Take 2 hits to destroy
- **Wave-based gameplay** with increasing difficulty
- **Obstacle-based levels** with destructible cover
- **Classic arcade scoring system**

## Controls

- **Movement**: WASD or Arrow Keys
- **Fire**: SPACEBAR
- **Rotate Turret**: Q (counter-clockwise) / E (clockwise)
- **Restart**: SPACE (on game over screen)

## Scoring

- Basic Tank: 100 points
- Smart Tank: 200 points
- Fast Tank: 150 points
- Heavy Tank: 300 points
- Wave Completion Bonus: 500 points

## Technical Details

- Built with vanilla JavaScript and HTML5 Canvas
- 160x192 pixel resolution (scaled 3x for modern displays)
- 60 FPS gameplay
- Authentic retro color palette
- No external dependencies

## File Structure

```
/src
  ├── main.js       - Game initialization and main loop
  ├── game.js       - Core game logic and state management
  ├── player.js     - Player tank and bullet classes
  ├── enemy.js      - Enemy tank AI and behavior
  └── collision.js  - Collision detection utilities
```

## Development

To modify the game:

1. Edit the JavaScript files in the `/src` directory
2. Refresh the browser to see changes
3. Check the browser console for any errors

## Future Enhancements

- Sound effects and background music
- Power-ups and special weapons
- More enemy types and behaviors
- Level editor
- High score persistence
- Multiplayer support

Enjoy the retro gaming experience!
