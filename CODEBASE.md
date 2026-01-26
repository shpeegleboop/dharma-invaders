# CODEBASE.md - Dharma Invaders Architecture Documentation

> This document provides a comprehensive overview of the Dharma Invaders codebase for onboarding and project management.

## Project Overview

**Dharma Invaders** is a Buddhist-themed roguelike arena shooter built with:
- **Engine:** Kaplay (kaboom.js successor)
- **Language:** TypeScript (strict mode)
- **Audio:** Howler.js
- **Build:** Vite
- **State:** Module singleton pattern

**Core Gameplay:** Player (Buddha figure) shoots virtue projectiles at enemies spawning from screen edges, defeats Mara boss, achieves nirvana. Features roguelike rebirth system with persistent paramis (virtues) and kleshas (afflictions).

**Screen:** 800x650 (HUD bars + 800x550 gameplay arena)

---

## Directory Structure

```
src/
â”œâ”€â”€ main.ts                  # Entry point, Kaplay init, scene registration
â”œâ”€â”€ stores/
â”‚   â””â”€â”€ gameStore.ts         # Global state singleton (karma, paramis, kleshas, cycles)
â”œâ”€â”€ utils/
â”‚   â”œâ”€â”€ events.ts            # Type-safe event bus
â”‚   â””â”€â”€ debug.ts             # Debug hotkeys (F1-F7, parami/klesha keys)
â”œâ”€â”€ scenes/                  # Game scenes (menu, game, boss, nirvana, etc.)
â”œâ”€â”€ entities/                # Game objects (player, projectile, powerup)
â”‚   â””â”€â”€ enemies/             # Enemy variants (6 types)
â”œâ”€â”€ systems/                 # Game systems (collision, spawner, karma, audio)
â”œâ”€â”€ ui/                      # UI components (HUD, pause menu, overlays)
â””â”€â”€ data/                    # JSON configs (config, waves, quotes, cutscenes)
```

---

## Core Architecture Patterns

### 1. Event Bus Pattern
All systems communicate via events - **never** direct imports between entities/systems.

```typescript
// Correct - emit events
events.emit('enemy:killed', { id, karmaValue });

// Wrong - never do this
import { karma } from './karma';
karma.add(enemy.value);
```

### 2. Module Singletons
- `gameStore.ts` - Global game state
- `events.ts` - Global event bus
- Music/SFX/Shield systems use module-level state

### 3. Scene Lifecycle
1. `events.clear()` - Clear all listeners at scene start
2. Setup systems in order
3. Create entities
4. Listen for scene transitions

### 4. Data-Driven Config
All magic numbers in `config.json` - never hardcode values.

---

## Entry Point

### `/src/main.ts` (~67 lines)
- Initializes Kaplay with 800x650 resolution
- Registers all scenes (menu, game, gameOver, nirvana, credits, about, titleScreen)
- Loads sprites and audio
- Handles click-to-start for audio autoplay policy

---

## State Management

### `/src/stores/gameStore.ts` (~239 lines)
Module-level singleton for roguelike progression state.

**State Structure:**
```typescript
interface GameState {
  karmaTotal: number;         // Persistent across all lives
  karmaThisLife: number;      // Resets on respawn
  deaths: number;
  deathsWithZeroKarma: number; // Mercy rule at 3
  cycle: number;              // Current kalpa (1, 2, 3...)
  paramis: string[];          // Virtue stacks
  kleshas: string[];          // Affliction stacks
  savedHealth: number | null;
  savedShieldCharges: number | null;
}
```

**Key Exports:**
- `getGameState()` - Full state
- `getKarmaTotal()`, `addKarma()` - Karma tracking
- `getCycle()`, `incrementCycle()` - Kalpa management
- `addParami()`, `removeParami()` - Virtue management with stack caps
- `addKlesha()` - Affliction management with stack caps
- `recordDeath()` - Returns true if mercy rule triggered
- `resetLife()`, `resetAll()` - State resets

---

## Event System

### `/src/utils/events.ts` (~84 lines)
Type-safe event bus for game-wide communication.

**Event Categories:**
- **Combat:** `enemy:spawned`, `enemy:killed`, `enemy:escaped`, `projectile:fired`
- **Player:** `player:hit`, `player:died`, `player:powerup`, `player:healed`, `player:applyKlesha`, `player:removeParami`
- **Special:** `human:killed`, `human:killed:ahirika`, `human:escaped`
- **Game Flow:** `wave:started`, `wave:complete`, `boss:started`, `boss:phaseChange`, `boss:defeated`, `game:victory`, `game:over`
- **Powerups:** `powerup:activated`, `powerup:deactivated`, `powerup:shieldBroken`
- **Systems:** `karma:changed`, `audio:play`, `debug:toggle`

**Key Exports:**
- `events.emit(event, data)` - Emit typed event
- `events.on(event, callback)` - Subscribe (returns unsubscribe)
- `events.once(event, callback)` - One-time subscription
- `events.clear()` - Clear all listeners

---

## Scenes

| File | Lines | Purpose |
|------|-------|---------|
| `menu.ts` | ~169 | Main menu with difficulty selector, audio settings |
| `titleScreen.ts` | ~55 | Suffer image screen with Join/Close buttons |
| `game.ts` | ~197 | Main gameplay - orchestrates all systems |
| `gameOver.ts` | ~80 | Mercy rule death screen (3+ deaths with 0 karma) |
| `nirvana.ts` | ~148 | Victory screen with cycle choice (Parinirvana/Continue) |
| `credits.ts` | ~103 | Parinirvana ending with cycling Buddhist quotes |
| `about.ts` | ~100 | Enemy bestiary and game info |

### Scene Flow
```
titleScreen â†’ menu â†’ game â†â†’ (death/rebirth)
                â†“
         boss fight
                â†“
         nirvana â†’ (continue: game) OR (parinirvana: credits) OR (menu)
                â†“
         gameOver (mercy rule only)
```

---

## Entities

### Player System

| File | Lines | Purpose |
|------|-------|---------|
| `player.ts` | ~137 | Player entity, lifecycle, health, respawn |
| `playerMovement.ts` | ~113 | WASD/arrows, mouse rotation, bounds |
| `playerCombat.ts` | ~91 | Shooting (space/click) and push (right-click) |

**Player Stats:**
- Speed: 300 px/s (modified by Thina klesha)
- Base Health: 3 (modified by Metta/Mana)
- Shoot Cooldown: 200ms (modified by Viriya/Vicikiccha)
- Projectile Damage: 1 (modified by Panna/Anottappa)

### Projectiles & Powerups

| File | Lines | Purpose |
|------|-------|---------|
| `projectile.ts` | ~47 | Yellow 8x16 virtue projectiles, 500 px/s |
| `powerup.ts` | ~172 | Virtue drops, Paduma heal, Vajra nuke |

**Powerup Types:**
- **Compassion (pink):** 3-way spread shot
- **Wisdom (blue):** Piercing projectiles
- **Patience (green):** 0.5x enemy speed
- **Diligence (gold):** 0.5x shoot cooldown
- **Meditation (purple):** Shield charges
- **Paduma (light pink):** +1 HP (Kalpa 2+ only)
- **Vajra (gold):** Clears all enemies (1.5% drop, rare)

### Enemies

| File | Type | HP | Karma | Unlock | Behavior |
|------|------|-----|-------|--------|----------|
| `hungryGhost.ts` | PetÄ | 1 | 10 | Kalpa 1 | Wispy erratic movement |
| `asura.ts` | AsurÄ | 2 | 25 | Kalpa 1 | Aggressive direct path |
| `deva.ts` | DevÄ | 3 | 50 | Kalpa 1 | Graceful floating |
| `nerayika.ts` | NerayikÄ | 4 | 100 | Kalpa 2 | Hesitateâ†’charge, applies Klesha |
| `tiracchana.ts` | TiracchÄnÄ | 1 | 30 | Kalpa 3 | Pack of 6, removes Parami |
| `manussa.ts` | ManussÄ | 3 | 1000 | Kalpa 4 | Non-hostile, karma test |

### Boss

| File | Lines | Purpose |
|------|-------|---------|
| `mara.ts` | ~120+ | Mara state machine, 3-4 phases |
| `maraCombat.ts` | ~100 | Boss attack patterns |
| `bossProjectile.ts` | ~50 | Boss projectiles |

**Boss Phases:**
1. **Entering:** Descend to position
2. **Phase 1 (>66% HP):** Slow aimed projectiles, figure-8 movement
3. **Phase 2 (>33% HP):** Adds minion spawns
4. **Phase 3 (â‰¤33% HP):** Enraged, 2x speed
5. **Rage Mode (Kalpa 4+):** Starts in phase 3, rose curve movement

---

## Systems

### Combat & Collision

| File | Lines | Purpose |
|------|-------|---------|
| `collision.ts` | ~140+ | All collision orchestration |
| `collisionHelpers.ts` | ~50 | Bounce and stun utilities |
| `specialEnemyCollisions.ts` | ~116 | Nerayika/Tiracchana/Manussa handlers |
| `bossCollisions.ts` | ~80 | Boss hit detection |

### Spawning & Waves

| File | Lines | Purpose |
|------|-------|---------|
| `waveManager.ts` | ~95 | Wave progression, enemy queue |
| `spawner.ts` | ~147 | Main spawner, wave timing |
| `spawnPositions.ts` | ~45 | Random edge positions |
| `newEnemySpawner.ts` | ~100 | Special enemy spawning |

**Wave Structure:** 8 waves before boss, escalating enemy counts.

### Effects & Powerups

| File | Lines | Purpose |
|------|-------|---------|
| `powerupEffects.ts` | ~214 | Timed powerup management with stacking |
| `shieldSystem.ts` | ~84 | Meditation shield (charge-based) |

### Scoring & Scaling

| File | Lines | Purpose |
|------|-------|---------|
| `karma.ts` | ~124 | Karma display and event handling |
| `rebirthEffects.ts` | ~102 | Parami/Klesha multipliers |
| `rebirthTiers.ts` | ~42 | Death tier rewards |
| `cycleScaling.ts` | ~67 | Kalpa difficulty scaling (logarithmic) |
| `difficulty.ts` | ~36 | Difficulty mode multipliers |

### Health & Damage

| File | Lines | Purpose |
|------|-------|---------|
| `health.ts` | ~58 | Health HUD display |
| `playerDamage.ts` | ~62 | Centralized damage handling |

### Audio

| File | Lines | Purpose |
|------|-------|---------|
| `audio.ts` | ~150 | Music system (Howler.js), track unlocking |
| `sfx.ts` | ~77 | Sound effects |
| `gameAudio.ts` | ~90 | In-game audio event handlers, selected track logic |

**Music Tracks:** menu, gameplay, boss, boss2, boss3, boss4, nirvana, gameover

**Track Selection:** Players can select gameplay/boss music in Audio Settings. Tracks unlock when first played. "Default" option uses original behavior (gameplay track for waves, kalpa-based for boss).

### Visual Effects

| File | Lines | Purpose |
|------|-------|---------|
| `particles.ts` | ~80+ | Hit particles, push ring, sparkles |
| `waveDisplay.ts` | ~33 | Wave number HUD |
| `bossHealthBar.ts` | ~60 | Boss health display |
| `playerIndicators.ts` | ~80 | Shield/push cooldown indicators |

### Persistence & Cutscenes

| File | Lines | Purpose |
|------|-------|---------|
| `persistence.ts` | ~140 | localStorage wrapper, music unlocks/selection |
| `cutscene.ts` | ~80+ | Narrative cutscene system |
| `mercyRule.ts` | ~40 | Game-over mercy rule logic |

---

## UI Components

| File | Lines | Purpose |
|------|-------|---------|
| `rebirthOverlay.ts` | ~193 | Death tier overlay (paramis/kleshas granted) |
| `rebirthHud.ts` | ~104 | Bottom HUD effect display |
| `pauseMenu.ts` | ~153 | Pause menu handler |
| `pauseMenuUI.ts` | ~222 | Pause UI rendering |
| `audioSettings.ts` | ~180 | Audio settings menu + track selection logic |
| `audioSettingsUI.ts` | ~177 | Audio UI rendering + track selection rows |
| `aboutOverlay.ts` | ~93 | Bestiary overlay |
| `aboutOverlayTabs.ts` | ~165 | Bestiary tabs |
| `titleScreenArt.ts` | ~211 | Procedural geometric background |

---

## Data Files

### `/src/data/config.json`
All game parameters and constants:
- `screen` - Dimensions (800x650, HUD heights)
- `arena` - Gameplay area (800x550 at y=50)
- `player` - Speed, health, cooldown, size, push ability
- `projectile` - Speed, damage, size
- `enemies` - Base types with speed/health/karma/colors
- `waves` - Timing between spawns/waves
- `powerups` - Drop chance, duration, colors
- `boss` - Health by kalpa, phases, movement
- `newEnemies` - Nerayika, Tiracchana, Manussa configs
- `difficulty` - Multipliers per mode
- `roguelike` - Scaling caps, rebirth settings

### `/src/data/waves.json`
Wave definitions (8 waves before boss):
```json
{
  "waves": [
    { "number": 1, "spawnInterval": 0.67, "enemies": [{ "type": "hungryGhost", "count": 10 }] },
    ...
  ]
}
```

### `/src/data/quotes.json`
Buddhist wisdom quotes for credits/victory screens.

### `/src/data/cutscenes.json`
Narrative cutscene data with beats (background, character, text, image).

**Cutscene IDs:** intro, firstDeath, bossIntro, victory, bodhisattva, kalpa2, kalpa3, kalpa4, maraReturns, rafLinens

---

## Roguelike Systems

### Paramis (Virtues) - Stack Caps
| Parami | Cap | Effect |
|--------|-----|--------|
| Dana | 1 | +25% drop rate |
| Viriya | 5 | -10% shoot cooldown per stack |
| Metta | 7 | +1 max health per stack |
| Upekkha | 5 | -10% enemy speed per stack |
| Sila | 1 | Auto-grants shield on respawn |
| Khanti | 5 | +20% powerup duration per stack |
| Panna | 2 | +1 projectile damage per stack |
| Adhitthana | 1 | +1 shield charge on first pickup |
| Nekkhamma | 2 | +50% karma multiplier per stack |
| Sacca | 1 | +5% Paduma drop chance |

### Kleshas (Afflictions) - Stack Caps
| Klesha | Cap | Effect |
|--------|-----|--------|
| Lobha | 2 | -25% drop rate per stack |
| Dosa | 3 | +10% enemy speed per stack |
| Mana | 5 | -1 max health per stack |
| Vicikiccha | 3 | +10% shoot cooldown per stack |
| Moha | 2 | -20% powerup duration per stack |
| Thina | 2 | -10% player speed per stack |
| Anottappa | 1 | -1 projectile damage |
| Micchaditthi | 2 | -25% karma multiplier per stack |
| Ahirika | 1 | Inverts Manussa morality test |

### Kalpa (Cycle) Progression
- **Kalpa 1:** Base difficulty, 3 enemy types
- **Kalpa 2:** +Nerayika, boss HP 150
- **Kalpa 3:** +Tiracchana packs, boss HP 200
- **Kalpa 4:** +Manussa, rage-mode boss, HP 250
- **Kalpa 5+:** Logarithmic scaling (+10% boss HP per cycle)

### Difficulty Modes
| Mode | Multiplier | Notes |
|------|------------|-------|
| Sotapanna | 1.0x | Easy (green) |
| Sakadagami | 1.25x | Default (orange) |
| Anagami | 1.75x | Hard (light red) |
| Noah | 2.5x | Hardest, blocks multiple powerups |

---

## Debug Tools

**Hotkeys (development only):**
- `F1` - Toggle hitbox visibility
- `F2` - Skip to wave 8
- `F3` - Skip to boss
- `F4` - Cycle through powerups
- `F6` - Toggle invincibility
- `F7` - Cycle difficulty
- `T/Y/U/I` - Add Dana/Viriya/Metta/Upekkha
- `1-5` - Add Sila/Khanti/Panna/Adhitthana/Nekkhamma
- `0` - Add Sacca
- `G/H/J/K` - Add Lobha/Dosa/Mana/Vicikiccha
- `6-9` - Add Moha/Thina/Anottappa/Micchaditthi
- `-` - Add Ahirika
- `M` - Clear all paramis/kleshas
- `V` - Heal player +1 HP
- `Z/X/C` - Spawn Nerayika/Tiracchana pack/Manussa
- `N` - Spawn Vajra
- `R` - Reset cutscene flags
- `P` - Cycle cutscenes

---

## Build Status

Current milestone: **Step 20 - Cutscenes** (see BUILD ORDER in CLAUDE.md)

**Completed:**
- [x] Game shell and Kaplay setup
- [x] Player movement and shooting
- [x] Enemy spawning and variants (6 types)
- [x] Collision detection
- [x] Karma counter
- [x] Wave spawner (data-driven)
- [x] Player health and death
- [x] Power-up drops and effects
- [x] Audio foundation
- [x] Menu scene
- [x] Mara boss fight
- [x] Nirvana victory scene
- [x] Roguelike rebirth system
- [x] Kalpa cycle system
- [x] Balance and buffs/debuffs
- [x] New enemy types (Nerayika, Tiracchana, Manussa)
- [x] Boss evolution (kalpa-based attacks)
- [x] Cutscenes (in progress)

**Remaining:**
- [ ] Save system
- [ ] Polish (screenshake, particles, juice)
- [ ] Art and audio replacement

---

## File Size Summary

| Directory | Files | ~Total Lines |
|-----------|-------|--------------|
| scenes/ | 7 | ~750 |
| entities/ | 10 | ~1,100 |
| systems/ | 25+ | ~2,000 |
| ui/ | 10 | ~1,600 |
| stores/ | 1 | ~240 |
| utils/ | 2 | ~320 |
| **Total** | **55+** | **~6,000** |

All files follow the 150-line limit guideline (with a few exceptions for complex systems).

---

## Key Design Decisions

1. **Event-driven architecture** prevents tight coupling
2. **Data-driven config** enables easy balancing
3. **Delta time always** ensures frame-rate independence
4. **Roguelike persistence** creates meaningful progression
5. **Logarithmic kalpa scaling** prevents infinite difficulty spikes
6. **Moral testing (Manussa)** adds thematic depth
7. **Modular stacking effects** allow complex build variety
8. **Scene-level event cleanup** prevents memory leaks

---

## Common Patterns

### Creating a New Enemy
1. Add to `/src/entities/enemies/`
2. Add config to `config.json` under `newEnemies`
3. Add to wave spawner or special spawner
4. Add collision handling if special behavior needed
5. Add debug hotkey if needed

### Adding a New Parami/Klesha
1. Add to `gameStore.ts` (type + cap)
2. Add effect calculation in `rebirthEffects.ts`
3. Apply effect in relevant system
4. Update debug keys in `debug.ts`

### Adding a New Scene
1. Create in `/src/scenes/`
2. Register in `main.ts`
3. Add transitions from other scenes

---

## External References

- **CLAUDE.md** - Development instructions and build order
- **VISION.md** - Design philosophy and thematic goals
- **SESSION_HANDOFF.md** - Current development status
- **FUTURE_IDEAS.md** - Post-V1 feature ideas
