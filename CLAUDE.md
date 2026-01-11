# Dharma Invaders

A Buddhist-themed Space Invaders/Galaga-style shmup. Player (Buddha/meditating figure) shoots virtue projectiles at enemies spawning from a samsara wheel, defeats Mara boss, achieves nirvana.

## Game Style

Arena shooter, NOT classic shmup:
- Player rotates to face mouse cursor
- Shoot toward cursor (click or spacebar)
- Enemies spawn from all screen edges



## Tech Stack (DO NOT SUBSTITUTE)

- **Game Engine:** Kaplay (kaboom.js successor) — NOT Phaser, NOT PixiJS
- **Language:** TypeScript (strict mode)
- **State Management:** Zustand
- **Audio:** Howler.js
- **Build:** Vite
- **Desktop (optional):** Tauri

## Architecture Rules — FOLLOW STRICTLY

### Event Bus Pattern
Systems communicate via events, NEVER direct imports between entities.

```typescript
// ✅ CORRECT
events.emit('enemy:killed', { id, karmaValue });

// ❌ WRONG — never do this
import { karma } from './karma';
karma.add(enemy.value);
```

### File Size Limit
No file over 150 lines. If a file is growing, split it. This keeps context clean and Claude's suggestions accurate.

### Data-Driven Config
ALL magic numbers go in `src/data/config.json`. Never hardcode speeds, health values, timings, or dimensions in logic files.

```typescript
// ✅ CORRECT
import config from '../data/config.json';
player.speed = config.player.speed;

// ❌ WRONG
player.speed = 300;
```

### Delta Time
EVERY movement calculation must use delta time for framerate independence.

```typescript
// ✅ CORRECT
pos.x += speed * dt();

// ❌ WRONG — breaks on high refresh rate monitors
pos.x += speed;
```

### Git Commits
Commit after every working feature with a descriptive message. This is non-negotiable.

## Project Structure

```
src/
├── main.ts              # Entry point only
├── scenes/              # Game scenes (menu, game, boss, nirvana, quote)
├── entities/            # Game objects (player, enemy, projectile, powerup, mara)
│   └── enemies/         # Enemy variants (hungryGhost, asura, deva)
├── systems/             # Game systems (collision, spawner, karma, audio)
├── stores/              # Zustand state (gameStore.ts)
├── data/                # JSON configs (config, waves, quotes, powerups, enemies)
└── utils/               # Helpers (events.ts, debug.ts)
```

## Entity Types

### Enemies (from Six Realms of Samsara)
- **Hungry Ghost:** Wispy, erratic movement, 1 HP, 10 karma
- **Asura:** Aggressive, direct movement, 2 HP, 25 karma  
- **Deva:** Floaty, graceful movement, 3 HP, 50 karma

### Virtue Projectiles (Power-ups)
- **Compassion:** Spread shot (pink)
- **Wisdom:** Piercing shot (blue)
- **Patience:** Slow motion effect (green)
- **Diligence:** Rapid fire (gold)
- **Meditation:** Shield (purple)

### Mara Boss
State machine with phases: entering → phase1 → phase2 → phase3 → defeated
- Phase 1: Slow aimed projectiles
- Phase 2: Adds minion spawns
- Phase 3: Enraged, 2x projectile speed

## Event Types

```typescript
// Combat
'enemy:spawned' | 'enemy:killed' | 'enemy:escaped' | 'projectile:fired'

// Player
'player:hit' | 'player:died' | 'player:powerup'

// Game Flow
'wave:started' | 'wave:complete' | 'boss:started' | 'boss:phaseChange' | 'boss:defeated' | 'game:victory' | 'game:over'

// Systems
'karma:changed' | 'audio:play' | 'debug:toggle'
```

## Build Order

Follow this sequence. Each step must be testable before moving on:

1. Game shell (empty canvas, Kaplay running)
2. Player rectangle movement
3. Basic shooting
4. Single enemy spawning
5. Collision detection
6. Karma counter
7. Wave spawner
8. Enemy variants
9. Player health + death
10. Power-up drops + effects
11. Samsara wheel visual
12. Quote system
13. Audio foundation
14. Menu scene
15. Mara boss fight
16. Nirvana victory scene
17. Save system
18. Polish (screenshake, particles, juice)
19. Art + audio replacement

## Debug Tools (Build on Day 1)

- F1: Toggle hitbox visibility
- F2: Skip to wave 8
- F3: Skip to boss
- F4: Give all powerups
- F5: Toggle invincibility

## Common Mistakes to Avoid

| Don't | Do Instead |
|-------|------------|
| One giant game.ts file | Split into scenes/entities/systems |
| Hardcode numbers | Put in config.json |
| Direct object references | Use event bus |
| Skip delta time | Always multiply by dt() |
| Art before gameplay | Colored rectangles first |
| Forget cleanup on destroy | Unsubscribe listeners |
| Work without commits | Commit every working feature |

## Placeholder Art Convention

Until real art is added:
- Player: Blue 32x32 rectangle
- Hungry Ghost: Red 24x24 rectangle
- Asura: Orange 28x28 rectangle
- Deva: Purple 32x32 rectangle
- Projectile: Yellow 8x16 rectangle
- Powerup: Colored 16x16 circle (color matches virtue)
- Mara: Dark red 64x64 rectangle

## Kaplay Specifics

- Use `onUpdate()` for game loop logic
- Use `onKeyDown()` for held keys, `onKeyPress()` for single press
- Use `add()` to create game objects with components
- Use `destroy()` to remove objects
- Access delta time with `dt()`
- Screen dimensions: 800x600

## Testing Each Feature

Before moving to next feature, verify:
- Works in happy path
- Works at screen edges
- Works with rapid input
- Cleans up on entity destruction
- Works after death/restart
- Works at both 60fps and 144fps
