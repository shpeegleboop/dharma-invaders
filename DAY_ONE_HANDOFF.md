# Dharma Invaders - Development Handoff

Current state: **Feature Complete, Ready for Balancing**

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
- Main menu with keyboard navigation (SPACE to start, A for audio, B for about)
- Pause menu (ESC) with resume/audio/quit options
- **Quit confirmation dialog**: "Return to the cycle of rebirth?" (Y/Q confirms, N/ESC cancels)
- Audio settings panel (arrow keys to adjust)
- Game over screen with karma display
- Nirvana victory screen with exit confirmation
- Credits/parinirvana scene with looping Buddhist quotes
- About section with controls, bestiary, and lore
- HUD: health, karma, wave counter, powerup status

### Debug Tools
- F1: Toggle hitbox visibility
- F2: Skip to wave 8
- F3: Skip to boss
- F4: Give all powerups
- F5: Toggle invincibility

## File Structure

```
src/
├── main.ts                    # Entry point, scene registration
├── entities/
│   ├── bossProjectile.ts      # Boss projectile entity
│   ├── mara.ts                # Mara boss (state machine)
│   ├── maraCombat.ts          # Boss combat logic
│   ├── player.ts              # Player entity
│   ├── powerup.ts             # Power-up drops
│   ├── projectile.ts          # Player projectiles
│   └── enemies/
│       ├── hungryGhost.ts     # Erratic movement, 1 HP, 10 karma
│       ├── asura.ts           # Direct movement, 2 HP, 25 karma
│       └── deva.ts            # Graceful movement, 3 HP, 50 karma
├── scenes/
│   ├── game.ts                # Main gameplay scene
│   ├── gameOver.ts            # Death screen
│   ├── menu.ts                # Main menu (SPACE/A/B keys)
│   ├── nirvana.ts             # Victory screen + exit confirmation
│   ├── credits.ts             # Parinirvana ending with looping quotes
│   └── about.ts               # Bestiary, lore, controls reference
├── systems/
│   ├── audio.ts               # Music system (Howler.js)
│   ├── sfx.ts                 # SFX system
│   ├── bossHealthBar.ts       # Boss HP display
│   ├── collision.ts           # Collision handlers
│   ├── collisionHelpers.ts    # Bounce/flash helpers
│   ├── gameAudio.ts           # Scene audio triggers
│   ├── health.ts              # Player health display
│   ├── karma.ts               # Karma scoring
│   ├── mercyRule.ts           # Retry logic on death
│   ├── powerupEffects.ts      # Active powerup state
│   ├── spawner.ts             # Enemy spawning
│   ├── waveManager.ts         # Wave state
│   └── waveDisplay.ts         # Wave announcements
├── ui/
│   ├── audioSettings.ts       # Audio settings logic
│   ├── audioSettingsUI.ts     # Audio UI elements
│   ├── pauseMenu.ts           # Pause system + global isPaused + quit confirm
│   └── pauseMenuUI.ts         # Pause menu UI rendering
├── utils/
│   ├── debug.ts               # Debug key bindings
│   └── events.ts              # Event bus
└── data/
    ├── config.json            # All game constants (speeds, HP, sizes, etc.)
    ├── waves.json             # Wave definitions
    └── quotes.json            # Buddhist quotes for credits scene
```

## Scene Flow

```
menu ─────────────────────────────────────────┐
  │                                           │
  ├─(SPACE)──→ game ──→ gameOver ──(SPACE)───┤
  │              │                            │
  │              └──→ nirvana ────────────────┤
  │                      │                    │
  │                      └─(N)──→ credits ────┤
  │                                    │      │
  ├─(B)──→ about ──(ESC)───────────────┼──────┘
  │                                    │
  └─(A)──→ [audio overlay] ────────────┘
```

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

### Pause Menu States
The pause menu uses a state machine: `playing` → `paused` → `audioSettings` or `quitConfirm`
- ESC cycles between playing/paused, or returns from sub-states
- Q from paused → quitConfirm (shows confirmation dialog)
- Y/Q from quitConfirm → quit to menu
- N/ESC from quitConfirm → back to paused

### Event Bus
Systems communicate via events (never direct imports between entities):
```typescript
events.emit('enemy:killed', { id, type, position, karmaValue });
events.on('player:powerup', (data) => { ... });
```

### File Size Limit
Keep files under 150 lines. When a file grows, split it:
- Logic → separate helper file (e.g., `pauseMenu.ts` → `pauseMenuUI.ts`)
- UI creation → separate UI file
- State management → separate state file

### Data-Driven Config
All magic numbers live in `src/data/config.json`. To adjust difficulty, modify:
- `player.speed`, `player.health`, `player.shootCooldown`
- `enemies.hungryGhost/asura/deva.speed`, `.health`, `.karmaValue`
- `boss.health`, `.phase2Threshold`, `.phase3Threshold`
- `boss.projectile.speed`, `.speedPhase3`, `.cooldown`
- `waves.timeBetweenWaves`, `.timeBetweenSpawns`
- `powerups.dropChance`, `.duration`

## Next Steps: Difficulty Balancing

The game is feature-complete. Next session focuses on gameplay feel:

### Enemy Behavior Tuning
- Hungry Ghost: Currently erratic. Could adjust jitter amount, base speed
- Asura: Direct chase. Could add prediction, charge attacks
- Deva: Graceful float. Could add dive-bomb or area denial

### Boss Balance
- Phase thresholds (currently 70% → phase2, 30% → phase3)
- Projectile speed and cooldown per phase
- Minion spawn rate in phase 2
- Consider adding attack patterns (spread shots, spiral patterns)

### Wave Pacing
- Enemy counts per wave (defined in `waves.json`)
- Time between spawns
- Mix of enemy types per wave
- Consider adding mini-boss waves

### Power-up Tuning
- Drop chance (currently 15%)
- Duration (currently 8 seconds)
- Individual effect strengths (spread angle, pierce count, slow %, fire rate)

## Running the Game

```bash
npm run dev    # Dev server (hot reload)
npm run build  # Production build
```

Dev server runs on http://localhost:5173/ (or next available port).

## Git History (Recent)

```
cf3a09f Confirmation dialogs, credits scene, and about section
7f6f1c8 Add DAY_ONE_HANDOFF.md - development summary for day two
6b45767 Pause powerup timers when game is paused
27e6b39 Split large files to comply with 150-line limit
a9a66fc Pause menu, audio settings UI, and global pause system
447440d Audio system with Howler.js - music and SFX
```
