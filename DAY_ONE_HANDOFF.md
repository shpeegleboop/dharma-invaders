# Dharma Invaders - Development Handoff

Current state: **Demo Ready, Polish Phase Next**

## Session Summary

### Today's Work
1. **Confirmation Dialogs** - Prevent accidental exits
   - Pause menu: "Return to the cycle of rebirth?" (Y/Q confirms, N/ESC cancels)
   - Nirvana screen: Choice between parinirvana (credits) or returning to menu

2. **Credits Scene** - Parinirvana ending
   - Looping Buddhist quotes with fade transitions
   - Plays nirvana.wav continuously
   - Only ESC exits

3. **About Section** - Press B from main menu
   - Tab 1: Controls reference
   - Tab 2: Enemy bestiary with colors and descriptions
   - Tab 3: Game lore (Samsara, Six Realms, Mara)

4. **Demo Difficulty Tuning** - Challenging but fun
   - 3x enemy counts with 3x spawn rate (same wave duration, higher intensity)
   - 1.5s between waves (was 3s)
   - Enemies gain +10% speed per wave (wave 8 = 1.8x base speed)
   - Mara: 400 HP, 1s minion spawns, figure-8 movement pattern

## Current Demo Settings

**These values are tuned for intense but beatable gameplay:**

```json
// waves.json
- Enemy counts: 3x original (wave 8: 30 ghosts, 24 asuras, 15 devas)
- Spawn intervals: 0.67s → 0.33s (3x faster spawning)
- Between waves: 1.5s

// config.json
- Boss HP: 400
- Minion spawn: every 1s
- All other values: original

// Enemy speed scaling (in enemy .ts files)
- waveMultiplier = 1 + 0.1 * waveNumber
- Wave 1: 1.1x, Wave 8: 1.8x base speed

// Mara movement (in mara.ts)
- Figure-8 pattern using sin(t) for X, sin(2t) for Y
- Amplitude: 200px horizontal, 60px vertical
- Speed increases 1.5x in phase 3
```

## To Revert Demo Changes

If you need original difficulty:
```bash
git revert HEAD~1  # Reverts demo difficulty commit
```

Or manually restore in config.json/waves.json:
- Boss HP: 100, minion interval: 5000ms
- Wave spawn intervals: 2.0s → 1.0s
- Enemy counts: original (wave 8: 10/8/5)
- Remove wave speed multiplier from enemy files

## What's Implemented

### Core Gameplay (100% Complete)
- Player movement (WASD) with mouse aiming
- Shooting with auto-fire (hold Space or LMB)
- Three enemy types: Hungry Ghost, Asura, Deva
- Wave-based spawning system (8 waves)
- Karma scoring system
- Player health (3 HP) with invincibility frames

### Power-up System (100% Complete)
- Compassion (pink): Spread shot
- Wisdom (blue): Piercing projectiles
- Patience (green): Slows enemies
- Diligence (gold): Rapid fire
- Meditation (purple): Shield

### Boss Fight (100% Complete)
- Mara with 3 phases + figure-8 movement
- Phase 2: minion spawns every 1s
- Phase 3: faster movement, 2x projectile speed

### UI/UX (100% Complete)
- Main menu: SPACE to start, A for audio, B for about
- Pause menu with quit confirmation
- Nirvana screen with exit confirmation
- Credits/parinirvana scene
- About section (controls, bestiary, lore)

### Debug Tools
- F1: Toggle hitboxes
- F2: Skip to wave 8
- F3: Skip to boss
- F4: Give all powerups
- F5: Toggle invincibility

## File Structure

```
src/
├── main.ts                    # Entry point, scene registration
├── entities/
│   ├── mara.ts                # Boss with figure-8 movement
│   ├── maraCombat.ts          # Boss projectiles and minions
│   └── enemies/
│       ├── hungryGhost.ts     # +wave speed scaling
│       ├── asura.ts           # +wave speed scaling
│       └── deva.ts            # +wave speed scaling
├── scenes/
│   ├── game.ts                # Main gameplay
│   ├── menu.ts                # Main menu (SPACE/A/B)
│   ├── nirvana.ts             # Victory + exit confirmation
│   ├── credits.ts             # Parinirvana with looping quotes
│   └── about.ts               # Bestiary, lore, controls
├── systems/
│   ├── waveManager.ts         # Wave state + getCurrentWaveNumber()
│   └── spawner.ts             # Calls setCurrentWaveNumber()
├── ui/
│   ├── pauseMenu.ts           # Pause states including quitConfirm
│   └── pauseMenuUI.ts         # UI rendering for pause/confirm
└── data/
    ├── config.json            # Boss HP, minion interval, etc.
    ├── waves.json             # Enemy counts, spawn intervals
    └── quotes.json            # Buddhist quotes for credits
```

## Technical Notes

### Wave-Based Speed Scaling
Enemies now scale speed based on wave number:
```typescript
import { getCurrentWaveNumber } from '../../systems/waveManager';

const waveMultiplier = 1 + 0.1 * getCurrentWaveNumber();
const speed = cfg.speed * getEnemySpeedMultiplier() * waveMultiplier;
```

The spawner calls `setCurrentWaveNumber()` when each wave starts.

### Mara Figure-8 Movement
```typescript
// In updateCombat()
movementTimer += k.dt();
const speed = currentPhase === 'phase3' ? 1.5 : 1.0;
mara.pos.x = baseX + Math.sin(movementTimer * speed) * 200;
mara.pos.y = baseY + Math.sin(movementTimer * speed * 2) * 60;
```

### Pause Menu State Machine
`playing` → `paused` → `audioSettings` | `quitConfirm`

## Next Steps: Polish

### Visual Juice
- Screen shake on player hit / boss phase change
- Particle effects (enemy death puffs, powerup sparkles)
- Hit flash on enemies when damaged

### Audio Polish
- Review SFX timing and volume balance
- Add variety (multiple hurt sounds, etc.)

### Gameplay Feel
- Fine-tune enemy movement patterns
- Adjust powerup drop rates based on playtesting
- Consider adding score multipliers

### Art Pass (When Ready)
- Replace colored rectangles with sprites
- Add Samsara wheel background
- Animate boss phase transitions

## Running the Game

```bash
npm run dev    # Dev server with hot reload
npm run build  # Production build
```

## Git History

```
2f9b230 Demo difficulty: harder gameplay for recording
f5019bd Update handoff doc - feature complete, ready for balancing
cf3a09f Confirmation dialogs, credits scene, and about section
7f6f1c8 Add DAY_ONE_HANDOFF.md - development summary for day two
6b45767 Pause powerup timers when game is paused
```
