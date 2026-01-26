# Dharma Invaders â€” Session Handoff

**Last Updated:** 2026-01-26 (Session 12)
**Status:** Phase 9.8 COMPLETE — Cutscene toggle fix, ready for Phase 10
**Codebase Audit:** A (2026-01-23) — player.ts split, hardcoded timers fixed

---

## Quick Start for New Sessions

```
READ THIS FILE FIRST. It supersedes conflicting information in other docs.

Current task: Phase 10 — Boss tweaks & polish OR Music Selection feature
Completed: Phase 9.8 — Cutscene toggle fix (Session 12)

Source of truth hierarchy:
1. SESSION_HANDOFF.md (this file) â€” Implementation details
2. VISION.md â€” Design philosophy only
3. FUTURE_IDEAS.md â€” Post-V1 features
4. CLAUDE.md â€” Architecture rules (backup reference)

DO NOT USE: CONTINUE.md (superseded), DAY_TWO_HANDOFF.md (historical)
```

---

## Part 1: Project Overview

**Dharma Invaders** is a Buddhist-themed arena shooter built with Kaplay. Player shoots virtue projectiles at enemies from the Six Realms of Samsara, defeats Mara boss, achieves Nirvana. The roguelike expansion adds a rebirth cycle where death grants buffs/debuffs based on karma earned.

### Tech Stack (LOCKED â€” Do Not Substitute)

| Layer | Technology | Notes |
|-------|------------|-------|
| Game Engine | **Kaplay** | NOT Phaser, NOT PixiJS |
| Language | **TypeScript** | Strict mode enabled |
| State | **Module singleton** | NOT Zustand (removed â€” requires React) |
| Audio | **Howler.js** | Music + SFX |
| Build | **Vite** | Default config |

### Game Style

**Arena shooter**, NOT classic shmup:
- Player rotates to face mouse cursor
- Shoot toward cursor (click or spacebar)
- Right-click to push enemies (Paá¹­ighÄta, 5s cooldown)
- Enemies spawn from ALL screen edges
- Screen: 800x650 with 50px HUD border at top and bottom

---

## Part 2: Architecture Rules â€” FOLLOW STRICTLY

These rules prevent spaghetti code and keep AI assistance accurate.

### Rule 1: Event Bus Pattern

Systems communicate via events, NEVER direct imports between entities.

```typescript
// âœ… CORRECT â€” Decoupled communication
events.emit('enemy:killed', { id, karmaValue });

// âŒ WRONG â€” Creates circular dependencies
import { karma } from './karma';
karma.add(enemy.value);
```

### Rule 2: Module Singleton for State

All persistent game state lives in `src/stores/gameStore.ts`.

### Rule 3: File Size Limit

**No file over 150 lines.** If a file is growing, split it.

### Rule 4: Data-Driven Config

ALL magic numbers go in `src/data/config.json`.

### Rule 5: Delta Time

EVERY movement calculation must use delta time.

### Rule 6: Event Listener Cleanup

Call `events.clear()` at the start of `createGameScene()`.

### Rule 7: Git Commits

Commit after every working feature with a descriptive message.

---

## Part 3: Current Implementation Status

### What Exists âœ…

| System | Status | Notes |
|--------|--------|-------|
| Core gameplay | âœ… Complete | 8 waves, 6 enemy types |
| Mara boss | âœ… Complete | 3 phases, figure-8 movement |
| 7 powerups | âœ… Complete | Compassion, Wisdom, Patience, Diligence, Meditation, Paduma, Vajra |
| Audio system | âœ… Complete | Menu, gameplay, kalpa-based boss, victory, game over |
| Cutscene system | âœ… Complete | 10 narrative moments |
| Pause menu | âœ… Complete | With confirmations |
| Title screen | âœ… Complete | Geometric lotus with quote |
| Mercy rule | âœ… Complete | 3 deaths without kill = game over |
| Debug tools | âœ… Complete | F1-F7, parami/klesha keys, R/P cutscene keys |
| Difficulty system | âœ… Complete | 4 levels (SotÄpannaâ†’NOAH) |
| Rebirth HUD | âœ… Complete | Bottom bar shows paramis/kleshas |
| New enemies | âœ… Complete | NerayikÄ, TiracchÄnÄ, ManussÄ |

### Phase Progress

| Phase | Focus | Status |
|-------|-------|--------|
| **1-8** | Core roguelike systems | âœ… Complete |
| **9** | Cutscenes | âœ… Complete |
| **9.5** | Architecture audit fixes | âœ… Complete |
| **9.6** | Cutscene visual overhaul | ✅ Complete |
| **9.7** | Cutscene animations + toggle | ✅ Complete |
| **9.8** | Cutscene toggle fix + boss3 music | ✅ Complete |
| **10** | Boss tweaks & polish | ⏳ Next |
| **—** | Music Selection feature | ⏳ Ready (see MUSIC_SELECT.md) |

---

## Part 4: Session 8 Summary â€” COMPLETE âœ…

### Stuck Key Bug Fix

Improved key tracking with multiple blur handlers:
- Window blur (alt-tab, click outside browser)
- Document visibility change (tab switch)
- Canvas blur/focus (click outside game area)
- Canvas made focusable with `tabIndex = 0`

### Cutscene System (10 cutscenes)

| ID | Trigger | Flag |
|----|---------|------|
| `intro` | First game start | `hasSeenIntro` |
| `firstDeath` | First death | `hasSeenFirstDeath` |
| `bossIntro` | First wave 8 complete | `hasSeenBossIntro` |
| `maraReturns` | Kalpa 2+ wave 8 | (no flag, plays each time) |
| `victory` | First Mara defeat | `hasSeenVictory` |
| `bodhisattva` | First Continue choice | `hasSeenBodhisattva` |
| `kalpa2` | Kalpa 2 start | `hasSeenKalpa2` |
| `kalpa3` | Kalpa 3 start | `hasSeenKalpa3` |
| `kalpa4` | Kalpa 4 start | `hasSeenKalpa4` |
| `rafLinens` | After kalpa 4 boss only | (no flag, easter egg) |

**Files created:**
- `src/data/cutscenes.json` â€” All cutscene content
- `src/systems/cutscene.ts` â€” Core system (~140 lines)

**Files modified:**
- `persistence.ts` â€” Added kalpa flags, `resetAllCutsceneFlags()`
- `game.ts` â€” Intro + kalpa cutscenes at scene start, boss cutscenes on wave 8
- `rebirthOverlay.ts` â€” firstDeath before rebirth UI
- `nirvana.ts` â€” victory, bodhisattva, rafLinens triggers
- `debug.ts` â€” R = reset flags, P = cycle cutscenes

### Push Ability Visual Overhaul

Replaced gold ring with orbiting sparkle particles:
- 6 gold particles orbit player when push ready
- Wobble and pulse with varying brightness
- Disappear completely during cooldown
- File: `playerIndicators.ts`

### Push Ability Radius Limit

Paá¹­ighÄta now only affects enemies within `pushDistance * 1.5` radius (225px default).
- File: `enemyHelpers.ts`

### Menu Arrow Fix

Clicking difficulty arrows no longer starts the game.
- File: `menu.ts`

### Kalpa 4 Boss Death Sound

Unique `4thbossdeath.mp3` plays when defeating kalpa 4 boss.
- Files: `sfx.ts`, `gameAudio.ts`

### rafLinens Easter Egg

- Shows `raflinens.jpg` sprite (place in `public/sprites/`)
- Displays `@raflinens` handle below image
- Only plays after kalpa 4 boss (not 5+)

---

## Part 4.5: Session 9 Summary â€” COMPLETE âœ…

### Architecture Audit (JAN23AUDIT.md)

Full codebase audit performed. See `JAN23AUDIT.md` for remaining items.

### Quick Wins Fixed

**Hardcoded timers moved to config:**
- `manussa.ts:62` â€” Now uses `cfg.chatBubbleDuration / 1000`
- `collision.ts:141` â€” Now uses `config.powerups.vajra.clearDelay / 1000`
- `specialEnemyCollisions.ts:64` â€” Now uses `config.collision.manussaPushDistance`

**Config additions:**
- `powerups.vajra.clearDelay: 1000` (ms)
- `collision.manussaPushDistance: 30`

### Player.ts Split

Split 288-line `player.ts` into three modules under 150 lines each:

| File | Lines | Responsibility |
|------|-------|----------------|
| `player.ts` | 136 | Entity creation, death/respawn, coordination |
| `playerMovement.ts` | 112 | Key tracking, movement update, bounds |
| `playerCombat.ts` | 90 | Shooting, push ability |

---

## Part 4.6: Session 10 Summary — COMPLETE ✅

### Cutscene Visual Overhaul

Completely rewrote `cutscene.ts` (~265 lines) to support:
- **Images**: JPG/PNG backgrounds (sting.jpg, deathrebirth.jpg, hemad.jpg, etc.)
- **Multi-sprite displays**: `sprites[]` array for showing multiple entities
- **Overlay text**: Floating labels like "+1000 karma" or "-Parami"
- **Layered compositions**: Background image + foreground sprite combo
- **Rotation animation**: Slowly spinning bhavachakra wheel

**New sprite loads added to main.ts:**
- bhavachakra, sting, deathrebirth, hemad, headback, bodhisattva

**texFilter fix**: Changed Kaplay config to `texFilter: "linear"` for smooth photo scaling (was "nearest" causing pixelation).

### Cutscene Beats Updated

All beats in `cutscenes.json` updated per CUTSCENE_TRANSCRIPT.md:
- Added rotating bhavachakra to kalpa intro scenes
- Added multi-sprite displays (6 tiracchana, enemy lineups)
- Added overlay texts for karma/parami/klesha indicators
- Fixed rafLinens (removed incorrect `image` field that broke display)
- Moved "+1000 karma" text up (y: 190 → 170) in kalpa4

### Terminology Standardization

| Location | Before | After |
|----------|--------|-------|
| index.html (pause menu) | "Virtues" / "Afflictions" | "Perfections" / "Defilements" |
| aboutTabs.ts (main menu) | "Kleshas (Afflictions)" | "Kleshas (Defilements)" |
| aboutTabs.ts | "Hungry spirits" | "Hungry ghosts" |
| aboutTabs.ts | Manussa "+1000 if spared" | "Peaceful (K4+)" |
| aboutOverlayTabs.ts | Manussa desc | "Peaceful (K4+)" |
| cutscenes.json | "mental afflictions" | "Defilements" |

### Files Created

- `karma.md` — Karma threshold table for rebirth (gitignored, for stylizing later)
- `MUSIC_SELECT.md` — Audio overlay planning doc for future session

### Bug Fixes

- **raflinens.jpg not showing**: Had incorrect `image: "/sprites/raflinens.jpg"` field (path vs sprite name conflict)
- **"Deep fried" photos**: texFilter was "nearest" (pixel art mode), changed to "linear"
- **Gray screen after kalpa 4**: Caused by raflinens cutscene failure (same bug)

---

## Part 4.7: Session 11 Summary — COMPLETE ✅

### Cutscene Animations

Added meditative animations to all cutscene visuals:
- **Breathing**: 0.3Hz (~3.3 sec), 3% scale oscillation
- **Rocking**: 0.15Hz (~6.7 sec), ±3° tilt for non-rotating images
- Desynchronized phases when multiple sprites on screen
- Rotating images (bhavachakra) only breathe, no rock

### "Show All Cutscenes" Toggle

New menu feature for players who've seen all cutscenes:
- Checkbox appears after all 8 flagged cutscenes have been seen
- When enabled, cutscenes replay even if previously viewed
- Persisted to localStorage (`showAllCutscenes`)
- Files: `persistence.ts`, `cutscene.ts`, `menu.ts`

### Sound Effects

- Added `manussa_death.mp3` for Manussa kills

### SVG Edge Artifact Fixes

Fixed visible lines at sprite edges caused by linear texture filtering:
- **Player**: Shrunk mandorla rx 14→12, adjusted gradient stops
- **Paduma**: Shrunk lily pad rx 10→9, reduced blur 0.5→0.3
- Reverted viewBox changes that caused in-game sprite box

### Cutscene Content Updates

- deathrebirth.jpg text: "Just as death is inevitable for the living, so birth is inevitable for the dead."
- Added karma.jpg to karma threshold slide
- New sprite loads: karma.jpg

---

## Part 4.8: Session 12 Summary — COMPLETE ✅

### Gameplay Pause During Cutscenes

Fixed critical bug where player could die during cutscenes:
- Modified `getIsPaused()` in `pauseMenu.ts` to also check `isCutscenePlaying()`
- All entities (player, enemies, projectiles, boss, powerups) now freeze during cutscenes
- No changes needed to individual entity files since they all use `getIsPaused()`

### Cutscene Trigger Logic Fixes

Fixed bugs where cutscenes played at wrong times:
- Changed `showAllCutscenes` default from `true` to `false` in persistence.ts
- Added kalpa-specific conditions to `shouldPlayCutscene()`:
  - `intro`: Only plays in Kalpa 1
  - `kalpa2`: Only plays in Kalpa 2
  - `kalpa3`: Only plays in Kalpa 3
  - `kalpa4`: Plays in Kalpa 4+

### SVG ViewBox Fixes

Reverted peta.svg and manussa.svg viewBox changes that caused "line at top" artifacts:
- peta.svg: viewBox back to "0 0 24 24" (was "-1 -1 26 26")
- manussa.svg: viewBox back to "0 0 20 40" (was "-2 -2 24 44")

### Boss Music per Kalpa

Added boss3.wav for kalpa 3 boss fight:
- Added `boss3` to MusicTrack type and music record
- Updated boss music selection logic:
  - Kalpa 1: boss.wav
  - Kalpa 2: boss2.wav
  - Kalpa 3: boss3.wav
  - Kalpa 4+: boss4.wav

### Cutscene Toggle Fix

Fixed "Show all cutscenes" toggle not appearing after seeing all cutscenes:
- **Root cause**: Debug P key used `playCutscene()` which doesn't set flags
- **Fix**: Exported `markCutsceneSeen()` from cutscene.ts, debug P key now marks cutscenes as seen
- **UI fix**: Moved toggle from `height * 0.88` to `height - 25` (below menu hints)
- **Debug logging**: `hasSeenAllCutscenes()` now logs which flags are missing to console
- **Missing sprite**: Added `karma.jpg` sprite load to main.ts

### Files Modified
- `src/systems/cutscene.ts` — Export `markCutsceneSeen()`
- `src/systems/persistence.ts` — Debug logging for missing cutscene flags
- `src/utils/debug.ts` — P key now calls `markCutsceneSeen()` before playing
- `src/scenes/menu.ts` — Toggle positioned below menu hints
- `src/main.ts` — Added karma.jpg sprite load

---

## Part 5: Debug Tools

| Key | Action |
|-----|--------|
| F1 | Toggle hitbox visibility |
| F2 | Skip to wave 8 |
| F3 | Skip directly to boss |
| F4 | Cycle through powerups |
| F6 | Toggle invincibility |
| F7 | Cycle difficulty |
| V | Heal player (+1 HP) |
| T/Y/U/I | Add DÄna/Viriya/MettÄ/UpekkhÄ |
| 1-5 | Add SÄ«la/KhantÄ«/PaÃ±Ã±Ä/Adhiá¹­á¹­hÄna/Nekkhamma |
| 0 | Add Sacca |
| G/H/J/K | Add Lobha/Dosa/MÄna/VicikicchÄ |
| 6-9 | Add Moha/ThÄ«na/Anottappa/MicchÄdiá¹­á¹­hi |
| - | Add Ahirika |
| M | Clear all pÄramÄ«s and kleshas |
| Z | Spawn NerayikÄ |
| X | Spawn TiracchÄnÄ pack (6) |
| C | Spawn ManussÄ |
| N | Spawn Vajra |
| **R** | Reset all cutscene flags |
| **P** | Play next cutscene (cycles through all) |

---

## Part 6: Next Session â€” Phase 10 (Boss Tweaks & Polish)

### Priority 1: Boss HP Scales with PaÃ±Ã±Ä (NOAH only)

```typescript
if (getDifficulty() === 'noah') {
  const pannaStacks = getParamis().filter(p => p === 'panna').length;
  const pannaBonus = pannaStacks * 0.15;  // +15% per stack
  bossHP *= (1 + pannaBonus);
}
```

### Priority 2: Boss Infinite Scaling (Kalpa 5+)

```json
"boss.infiniteScaling": {
  "startKalpa": 5,
  "hpPerKalpa": 0.1,
  "speedPerKalpa": 0.05
}
```

```typescript
if (kalpa > 4) {
  const extraKalpas = kalpa - 4;
  hp *= 1 + (extraKalpas * 0.1);   // +10% HP per kalpa
  speed *= 1 + (extraKalpas * 0.05); // +5% speed per kalpa
}
```

### Priority 3: Mine Scatter Attack (Kalpa 5+) â€” OPTIONAL

Lower priority, implement if time allows.

### Priority 4: Save System

Persist game progress across sessions.

### Priority 5: Polish

Screenshake, particles, juice.

---

## Part 7: Git Commit History (Recent)

```
1690c10 Fix cutscene toggle and debug tools
2fa2b05 Simplify player gradient (fixes player, breaks peta) + document futility
a728e0f Add WHAT_NOT_TO_DO.md documenting failed sprite artifact fixes
e1559b8 Revert sprite rendering experiments, fix player.svg viewBox
9dc91a0 Convert game sprites from SVG to PNG with transparent padding
fbaeb1c Add boss3.wav for kalpa 3 boss music
307f78f Fix gameplay pause during cutscenes and cutscene trigger logic
3ae4e7c Add karma.jpg to karma cutscene slide
ce551ea Fix sprite edge artifacts, update cutscene text, reduce rocking
141a273 Add "Show all cutscenes" toggle + fix player sprite edge artifact
6e781e0 Slow rocking animation to 0.15Hz, ±6 degrees
0ca7315 Add manussa_death sound effect
339ac04 Add viewBox padding to problem sprites + rocking animation
70ac30f Increase player.svg padding to 3px, breathing at 0.3Hz on all visuals
```

---

*The path to Nirvana is paved with clean architecture and frequent commits. ðŸª·*
