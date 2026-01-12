# Dharma Invaders - Day One Handoff

Development summary for resuming work.

## What's Implemented

### Core Gameplay (100% Complete)
- Player movement (WASD) with mouse aiming
- Shooting with auto-fire (hold Space or LMB)
- Three enemy types: Hungry Ghost, Asura, Deva
- Wave-based spawning system (8 waves)
- Karma scoring system
- Player health (3 HP) with invincibility frames
- Collision detection for all entity interactions

### Power-up System (100% Complete)
- 5 virtue power-ups with distinct effects:
  - Compassion (pink): Spread shot
  - Wisdom (blue): Piercing projectiles
  - Patience (green): Slows enemies
  - Diligence (gold): Rapid fire
  - Meditation (purple): Shield (breaks on hit)
- Power-up timers pause when game is paused
- HUD display with countdown

### Boss Fight (100% Complete)
- Mara boss with 3 phases
- Phase transitions with visual feedback
- Aimed projectiles, minion spawns in phase 2
- Enraged mode in phase 3 (2x projectile speed)
- Boss health bar UI

### Audio System (100% Complete)
- Music tracks: menu, gameplay, boss, nirvana, gameover (.wav)
- 15 SFX sounds (.mp3)
- Volume controls with localStorage persistence
- Howler.js integration

### UI/UX (100% Complete)
- Main menu with keyboard navigation
- Pause menu (ESC) with resume/audio/quit options
- Audio settings panel (arrow keys to adjust)
- Game over screen with karma display
- Nirvana victory screen
- HUD: health, karma, wave counter, powerup status

### Debug Tools
- F1: Toggle hitbox visibility
- F2: Skip to wave 8
- F3: Skip to boss
- F4: Give all powerups
- F5: Toggle invincibility

## What's Working

Everything listed above is functional and tested:
- Menu → Game → Pause → Resume flow
- Full game loop: waves → boss → victory/death
- Pause system freezes ALL game logic (enemies, projectiles, spawner, powerups)
- Audio plays correctly with volume persistence

## File Structure (After Day One Splits)

```
src/
├── main.ts                    # Entry point
├── entities/
│   ├── bossProjectile.ts      # Boss projectile entity
│   ├── mara.ts                # Mara boss (state machine)
│   ├── maraCombat.ts          # Boss combat logic
│   ├── player.ts              # Player entity
│   ├── powerup.ts             # Power-up drops
│   ├── projectile.ts          # Player projectiles
│   └── enemies/
│       ├── hungryGhost.ts     # Erratic movement, 1 HP
│       ├── asura.ts           # Direct movement, 2 HP
│       └── deva.ts            # Graceful movement, 3 HP
├── scenes/
│   ├── game.ts                # Main gameplay scene
│   ├── gameOver.ts            # Death screen
│   ├── menu.ts                # Main menu
│   └── nirvana.ts             # Victory screen
├── systems/
│   ├── audio.ts               # Music system (Howler.js)
│   ├── sfx.ts                 # SFX system (split from audio.ts)
│   ├── bossHealthBar.ts       # Boss HP display
│   ├── collision.ts           # Collision handlers
│   ├── collisionHelpers.ts    # Bounce/flash helpers (split)
│   ├── gameAudio.ts           # Scene audio triggers
│   ├── health.ts              # Player health display
│   ├── karma.ts               # Karma scoring
│   ├── mercyRule.ts           # Retry logic on death
│   ├── powerupEffects.ts      # Active powerup state
│   ├── spawner.ts             # Enemy spawning
│   ├── waveManager.ts         # Wave state (split from spawner.ts)
│   └── waveDisplay.ts         # Wave announcements
├── ui/
│   ├── audioSettings.ts       # Audio settings logic
│   ├── audioSettingsUI.ts     # Audio UI elements (split)
│   └── pauseMenu.ts           # Pause system + global isPaused
├── utils/
│   ├── debug.ts               # Debug key bindings
│   └── events.ts              # Event bus
└── data/
    ├── config.json            # All game constants
    ├── waves.json             # Wave definitions
    ├── enemies.json           # Enemy stats
    ├── powerups.json          # Powerup definitions
    └── quotes.json            # Buddhist quotes
```

## Git Commit History

```
6b45767 Pause powerup timers when game is paused
27e6b39 Split large files to comply with 150-line limit
a9a66fc Pause menu, audio settings UI, and global pause system
447440d Audio system with Howler.js - music and SFX
f5f89fe Add DAY_ZERO_PROGRESS.md - comprehensive development summary
8c6c3f5 Phase 4: Mara boss, debug tools, menu/game over/nirvana scenes, mercy rule
cf9296f Phase 2: powerup system with all 5 virtue effects
332ef64 Phase 2: Asura/Deva enemies, wave-based spawning system, HUD wave counter
4550cb7 Phase 2 partial: enemy spawner, Hungry Ghost, collision, health, event cleanup
1d8f78f Phase 1 complete: arena shooter controls, mouse aiming, HUD border
6f2f0a1 Phase 1: game shell + player movement
21df869 Phase 0: project setup complete
```

## Next Steps

### Immediate (Day Two)

1. **Confirmation Dialogs**
   - "Quit to Menu?" confirmation in pause menu
   - "Play Again?" on game over screen
   - Prevent accidental exits

2. **Credits Scene**
   - Accessible from main menu
   - Buddhist-themed acknowledgments
   - Music/art credits placeholder

### Polish Backlog

- Screen shake on player hit/boss phase change
- Particle effects (enemy death, powerup pickup)
- Sprite art replacement (currently colored rectangles)
- Samsara wheel background visual
- Quote display between waves
- Save system (high score persistence)
- Sound design pass (current SFX are placeholder)

## Technical Notes

### Pause System
The global `isPaused` flag is exported from `src/ui/pauseMenu.ts`. Every `onUpdate()` callback that should freeze during pause must check:
```typescript
import { isPaused } from '../ui/pauseMenu';

k.onUpdate(() => {
  if (isPaused) return;
  // ... game logic
});
```

### Event Bus
Systems communicate via events (never direct imports between entities):
```typescript
events.emit('enemy:killed', { id, type, position, karmaValue });
events.on('player:powerup', (data) => { ... });
```

### File Size Limit
Keep files under 150 lines. Split when growing:
- Logic → separate helper file
- UI creation → separate UI file
- State management → separate state file

## Running the Game

```bash
npm run dev    # Dev server (hot reload)
npm run build  # Production build
```

Dev server typically runs on http://localhost:5173/ (or next available port).
