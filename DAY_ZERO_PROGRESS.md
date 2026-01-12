# Dharma Invaders — Day Zero Progress Report

*Complete summary of initial development session. Feed this to Claude Code to resume development with full context.*

---

## Project Overview

**Dharma Invaders** is a Buddhist-themed arena shooter built with Kaplay (kaboom.js successor). The player (representing a meditating Buddha figure) shoots virtue projectiles at enemies spawned from the Six Realms of Samsara, collects powerups representing Buddhist virtues, and ultimately defeats Mara (the demon of illusion) to achieve Nirvana.

### Tech Stack
- **Engine:** Kaplay (NOT Phaser, NOT PixiJS)
- **Language:** TypeScript (strict mode)
- **State Management:** Zustand (installed, not yet used)
- **Audio:** Howler.js (installed, not yet implemented)
- **Build:** Vite
- **Desktop (optional):** Tauri

---

## Architecture — CRITICAL RULES

### 1. Event Bus Pattern
All cross-system communication happens via events. **NEVER** import entities directly into other entities.

```typescript
// ✅ CORRECT
events.emit('enemy:killed', { id, karmaValue });

// ❌ WRONG
import { karma } from './karma';
karma.add(enemy.value);
```

### 2. File Size Limit
**No file over 150 lines.** Split files when they grow. This was enforced when `mara.ts` hit 195 lines and was split into `mara.ts` + `maraCombat.ts`.

### 3. Data-Driven Config
ALL magic numbers live in `src/data/config.json`. Never hardcode values in logic files.

### 4. Delta Time
EVERY movement calculation uses `k.dt()` for framerate independence.

### 5. Event Cleanup
`events.clear()` is called at the start of `createGameScene()` to prevent listener accumulation on scene restart.

---

## Project Structure

```
src/
├── main.ts                    # Entry point, scene registration
├── scenes/
│   ├── menu.ts               # Title screen
│   ├── game.ts               # Main gameplay orchestration
│   ├── gameOver.ts           # Mercy rule death screen
│   └── nirvana.ts            # Victory screen
├── entities/
│   ├── player.ts             # Player movement, shooting, respawn
│   ├── projectile.ts         # Player projectiles
│   ├── powerup.ts            # Virtue orb drops
│   ├── mara.ts               # Boss state machine
│   ├── maraCombat.ts         # Boss combat helpers
│   ├── bossProjectile.ts     # Boss projectiles
│   └── enemies/
│       ├── hungryGhost.ts    # Erratic movement, 1 HP
│       ├── asura.ts          # Aggressive direct movement, 2 HP
│       └── deva.ts           # Graceful sinusoidal movement, 3 HP
├── systems/
│   ├── collision.ts          # All collision handlers
│   ├── spawner.ts            # Wave-based enemy spawning
│   ├── karma.ts              # Score tracking + HUD
│   ├── health.ts             # Player health HUD
│   ├── waveDisplay.ts        # Wave counter HUD
│   ├── powerupEffects.ts     # Active powerup state + timer
│   ├── bossHealthBar.ts      # Boss HP bar (phase-colored)
│   └── mercyRule.ts          # Consecutive death tracking
├── stores/                    # Zustand (not yet used)
├── data/
│   ├── config.json           # All game constants
│   └── waves.json            # 8 wave definitions
└── utils/
    ├── events.ts             # Type-safe event bus
    └── debug.ts              # F-key debug tools
```

---

## What's Implemented (Day Zero)

### Core Gameplay
- [x] Arena shooter controls (WASD movement, mouse aim, click/space to shoot)
- [x] Player rotates to face cursor
- [x] Enemies spawn from all screen edges
- [x] 8 waves of increasing difficulty
- [x] 3 enemy types with distinct movement patterns
- [x] Karma scoring system
- [x] Player health (3 HP) with respawn

### Powerup System (5 Virtues)
| Virtue | Color | Effect | Duration |
|--------|-------|--------|----------|
| Compassion | Pink | 3-way spread shot | 8s |
| Wisdom | Blue | Piercing projectiles | 8s |
| Patience | Green | 50% enemy slowdown | 8s |
| Diligence | Gold | 2x fire rate | 8s |
| Meditation | Purple | Shield (absorbs 1 hit) | Until hit |

- 15% drop chance on enemy death
- Collecting new powerup replaces current one
- Timer displayed in HUD

### Mara Boss Fight
- Spawns after wave 8 completes
- State machine: `entering` → `phase1` → `phase2` → `phase3` → `defeated`
- **Phase 1:** Aimed projectiles every 2s
- **Phase 2 (70% HP):** Adds Hungry Ghost minion spawns every 5s
- **Phase 3 (30% HP):** 2x projectile speed, boss flashes red
- Health bar changes color: green → yellow → red
- Victory triggers Nirvana scene

### Scenes
- **Menu:** Title, controls hint, press space/click to start
- **Game:** Main gameplay with HUD (title, karma, health, wave, powerup)
- **Game Over:** "You have not reached Nirvana in this lifetime" — triggered by mercy rule
- **Nirvana:** Victory screen with glowing circle, final karma display

### Mercy Rule (Death/Rebirth)
- **3 consecutive deaths without killing an enemy = Game Over**
- Enemies persist when player dies (no wave restart)
- Player respawns at center with brief invincibility
- Counter resets when player kills any enemy
- Enemy collision bounces + stuns enemy for 0.5s (enemy survives)

### Debug Tools
| Key | Action |
|-----|--------|
| F1 | Toggle hitbox visibility |
| F2 | Skip to wave 8 |
| F3 | Skip directly to boss |
| F4 | Cycle through powerups (one per press) |
| F6 | Toggle invincibility |

"DEBUG" indicator appears when any debug mode is active.

---

## Bugs Fixed During Development

1. **Duplicate component property 'angle'** — Kaplay's `rotate()` component uses `angle`. Custom properties renamed to `moveAngle`.

2. **Event listener memory leak** — Listeners accumulated on scene restart. Fixed with `events.clear()` at scene start.

3. **Mercy rule not triggering** — Enemies dying on player collision emitted `enemy:killed`, resetting the death counter. Fixed by making enemies bounce + stun instead of die.

4. **Invincibility on every hit** — Was too forgiving. Changed to invincibility only on respawn.

5. **F5 conflicts with browser refresh** — Rebind to F6 for invincibility toggle.

6. **Files exceeding 150 lines** — `mara.ts` split into `mara.ts` + `maraCombat.ts`.

---

## Design Decisions

### Arena Shooter (Not Classic Shmup)
Original concept was top-down Space Invaders style. Pivoted to arena shooter for more dynamic gameplay:
- Player rotates 360° to face mouse
- Enemies spawn from all edges
- More frantic, skill-based combat

### HUD Layout
- 50px bar at top, OUTSIDE gameplay area
- Contains: title (center), karma (right), health (left), wave counter, powerup timer
- Boss health bar appears during boss fight only

### Enemy Collision Behavior
Enemies bounce off player and stun for 0.5s rather than dying. This:
- Makes combat feel more physical
- Prevents accidental mercy rule resets
- Allows enemies to be threats multiple times

### Placeholder Art
All entities are colored rectangles until art assets are ready:
- Player: Blue 32x32
- Hungry Ghost: Red 24x24
- Asura: Orange 28x28
- Deva: Purple 32x32
- Mara: Dark red 64x64
- Powerups: Colored 16x16 circles

---

## What's NOT Implemented Yet

### From CLAUDE.md Roadmap
- [ ] Samsara wheel visual (cosmetic)
- [ ] Quote system (Buddhist quotes between waves?)
- [ ] Audio foundation (Howler.js is installed)
- [ ] Save system (high scores, progress)
- [ ] Polish (screenshake, particles, juice)
- [ ] Art + audio replacement

### From NOTES.md Future Ideas
- [ ] Rebirth system with Pāramīs (buffs) and Kleshas (debuffs) based on karma
- [ ] No permanent death — dying triggers rebirth with accumulated effects
- [ ] Multiple boss attack patterns (spread shots, beams, arena hazards)
- [ ] Boss taunts/dialogue
- [ ] Different music for boss phase
- [ ] Level progression with story beats

### From LORE.md
- [ ] Additional enemy types from Six Realms (Naraka, Animals)
- [ ] Noble Eightfold Path as progression system?
- [ ] Full Pāramī/Kilesa buff/debuff system for rebirth

---

## Event Types Reference

```typescript
// Combat
'enemy:spawned' | 'enemy:killed' | 'enemy:escaped' | 'projectile:fired'

// Player
'player:hit' | 'player:died' | 'player:powerup'

// Game Flow
'wave:started' | 'wave:complete' | 'boss:started' | 'boss:phaseChange' | 'boss:defeated' | 'game:victory' | 'game:over'

// Powerups
'powerup:activated' | 'powerup:deactivated' | 'powerup:shieldBroken'

// Systems
'karma:changed' | 'audio:play' | 'debug:toggle' | 'debug:skipToWave' | 'debug:skipToBoss'
```

---

## Config.json Structure

Key sections:
- `screen` — 800x600 dimensions
- `hud` — 50px height
- `arena` — Playable area below HUD
- `player` — Speed, health, invincibility duration, shoot cooldown
- `projectile` — Speed, damage, size
- `enemies` — Per-type: speed, health, karma value, size, color
- `waves` — Timing between waves/spawns
- `powerups` — Drop chance, fall speed, duration, virtue definitions
- `boss` — Health (100), phase thresholds, projectile speeds, minion interval

---

## Git Commit History

```
8c6c3f5 Phase 4: Mara boss, debug tools, menu/game over/nirvana scenes, mercy rule
cf9296f Phase 2: powerup system with all 5 virtue effects
332ef64 Phase 2: Asura/Deva enemies, wave-based spawning system, HUD wave counter
4550cb7 Phase 2 partial: enemy spawner, Hungry Ghost, collision, health, event cleanup
1d8f78f Phase 1 complete: arena shooter controls, mouse aiming, HUD border
[earlier commits for Phase 0 setup]
```

---

## How to Resume Development

1. Read `CLAUDE.md` for architecture rules and build order
2. Read `NOTES.md` for design ideas and future plans
3. Read `LORE.md` for Buddhist theming reference
4. Run `npm run dev` to start development server
5. Use F3 to skip to boss for quick testing
6. Continue with next item in CLAUDE.md roadmap (Samsara wheel, quotes, or audio)

**The game is fully playable from menu → 8 waves → boss → victory/game over.**

---

## Session Notes

- TypeScript strict mode catches many bugs early
- Kaplay's component system is clean but watch for property name collisions
- Event bus pattern keeps code modular and testable
- 150-line file limit forces good separation of concerns
- Delta time is essential — game was tested on 60fps and 144fps monitors

*End of Day Zero Progress Report*
