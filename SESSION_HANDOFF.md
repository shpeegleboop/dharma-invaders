# Dharma Invaders — Session Handoff

**Last Updated:** 2026-01-23 (Session 9 continued)
**Status:** Phase 10 IN PROGRESS — Boss tweaks & polish
**Codebase Audit:** A (2026-01-23) — player.ts split, hardcoded timers fixed

---

## Quick Start for New Sessions

```
READ THIS FILE FIRST. It supersedes conflicting information in other docs.

Current task: Phase 10 — Boss Tweaks & Polish (IN PROGRESS)
Completed: Boss HP overhaul, Kalpa 4 enhancements, rebirth screen polish

Source of truth hierarchy:
1. SESSION_HANDOFF.md (this file) — Implementation details
2. VISION.md — Design philosophy only
3. FUTURE_IDEAS.md — Post-V1 features
4. CLAUDE.md — Architecture rules (backup reference)

DO NOT USE: CONTINUE.md (superseded), DAY_TWO_HANDOFF.md (historical)
```

---

## Part 1: Project Overview

**Dharma Invaders** is a Buddhist-themed arena shooter built with Kaplay. Player shoots virtue projectiles at enemies from the Six Realms of Samsara, defeats Mara boss, achieves Nirvana. The roguelike expansion adds a rebirth cycle where death grants buffs/debuffs based on karma earned.

### Tech Stack (LOCKED — Do Not Substitute)

| Layer | Technology | Notes |
|-------|------------|-------|
| Game Engine | **Kaplay** | NOT Phaser, NOT PixiJS |
| Language | **TypeScript** | Strict mode enabled |
| State | **Module singleton** | NOT Zustand (removed — requires React) |
| Audio | **Howler.js** | Music + SFX |
| Build | **Vite** | Default config |

### Game Style

**Arena shooter**, NOT classic shmup:
- Player rotates to face mouse cursor
- Shoot toward cursor (click or spacebar)
- Right-click to push enemies (Paṭighāta, 5s cooldown)
- Enemies spawn from ALL screen edges
- Screen: 800x650 with 50px HUD border at top and bottom

---

## Part 2: Architecture Rules — FOLLOW STRICTLY

These rules prevent spaghetti code and keep AI assistance accurate.

### Rule 1: Event Bus Pattern

Systems communicate via events, NEVER direct imports between entities.

```typescript
// ✅ CORRECT — Decoupled communication
events.emit('enemy:killed', { id, karmaValue });

// ❌ WRONG — Creates circular dependencies
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

### What Exists ✅

| System | Status | Notes |
|--------|--------|-------|
| Core gameplay | ✅ Complete | 8 waves, 6 enemy types |
| Mara boss | ✅ Complete | 3 phases, figure-8 (K1-3), rose curve (K4+) |
| 7 powerups | ✅ Complete | Compassion, Wisdom, Patience, Diligence, Meditation, Paduma, Vajra |
| Audio system | ✅ Complete | Menu, gameplay, kalpa-based boss, victory, game over |
| Cutscene system | ✅ Complete | 10 narrative moments |
| Pause menu | ✅ Complete | With confirmations |
| Title screen | ✅ Complete | Geometric lotus with quote |
| Mercy rule | ✅ Complete | 3 deaths without kill = game over |
| Debug tools | ✅ Complete | F1-F7, parami/klesha keys, R/P cutscene keys |
| Difficulty system | ✅ Complete | 4 levels (Sotāpanna→NOAH) |
| Rebirth HUD | ✅ Complete | Bottom bar shows paramis/kleshas |
| New enemies | ✅ Complete | Nerayikā, Tiracchānā, Manussā |

### Phase Progress

| Phase | Focus | Status |
|-------|-------|--------|
| **1-8** | Core roguelike systems | ✅ Complete |
| **9** | Cutscenes | ✅ Complete |
| **9.5** | Architecture audit fixes | ✅ Complete |
| **10** | Boss tweaks & polish | 🔄 In Progress |

---

## Part 4: Session 8 Summary — COMPLETE ✅

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
- `src/data/cutscenes.json` — All cutscene content
- `src/systems/cutscene.ts` — Core system (~140 lines)

**Files modified:**
- `persistence.ts` — Added kalpa flags, `resetAllCutsceneFlags()`
- `game.ts` — Intro + kalpa cutscenes at scene start, boss cutscenes on wave 8
- `rebirthOverlay.ts` — firstDeath before rebirth UI
- `nirvana.ts` — victory, bodhisattva, rafLinens triggers
- `debug.ts` — R = reset flags, P = cycle cutscenes

### Push Ability Visual Overhaul

Replaced gold ring with orbiting sparkle particles:
- 6 gold particles orbit player when push ready
- Wobble and pulse with varying brightness
- Disappear completely during cooldown
- File: `playerIndicators.ts`

### Push Ability Radius Limit

Paṭighāta now only affects enemies within `pushDistance * 1.5` radius (225px default).
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

## Part 4.5: Session 9 Summary — COMPLETE ✅

### Architecture Audit (JAN23AUDIT.md)

Full codebase audit performed. See `JAN23AUDIT.md` for remaining items.

### Quick Wins Fixed

**Hardcoded timers moved to config:**
- `manussa.ts:62` — Now uses `cfg.chatBubbleDuration / 1000`
- `collision.ts:141` — Now uses `config.powerups.vajra.clearDelay / 1000`
- `specialEnemyCollisions.ts:64` — Now uses `config.collision.manussaPushDistance`

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

## Part 4.6: Session 9 Continued — Phase 10 Progress

### Boss HP Overhaul

**Fixed HP per kalpa** (replaces logarithmic scaling):
- Kalpa 1: 80 HP
- Kalpa 2: 120 HP
- Kalpa 3: 180 HP
- Kalpa 4: 250 HP
- Kalpa 5+: Kalpa 4 base + 10% per extra kalpa

**Config addition:** `boss.healthByKalpa: [80, 120, 180, 250]`

**Paññā scaling (NOAH only):** +85% boss HP per Panna stack

### Kalpa 4 Boss Enhancements

**Rose curve movement pattern:**
- 4-petal rose: `r = cos(2θ)` creates sweeping pattern
- Covers full arena (not just upper half)
- Config: `boss.movement.rageMode.amplitudeX/Y`, `speedMultiplier`

**Nerayika swarm attack (Phase 3 only):**
- 6 Nerayikas spawn equidistant around screen edges
- 15s cooldown, only triggers when HP < 30%
- Config: `boss.evolution.nerayikaSwarm`

**Boss HP display:** Shows `current / max` inside health bar

### Bug Fixes

- Minions no longer spawn during rebirth screen
- Fixed Panna spelling (`'Panna'` not `'Paññā'`) for HP scaling
- Kalpa 4+ uses `boss4.wav` for boss music

### Rebirth Screen Polish

- **Manussa HP:** 7 → 21 (harder to accidentally kill)
- **English descriptions with effects:** Each parami/klesha on own line
  - Example: `+ Metta (Loving-kindness (+1 HP))`
  - Example: `- Lobha (Greed (-25% drops))`

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
| T/Y/U/I | Add Dāna/Viriya/Mettā/Upekkhā |
| 1-5 | Add Sīla/Khantī/Paññā/Adhiṭṭhāna/Nekkhamma |
| 0 | Add Sacca |
| G/H/J/K | Add Lobha/Dosa/Māna/Vicikicchā |
| 6-9 | Add Moha/Thīna/Anottappa/Micchādiṭṭhi |
| - | Add Ahirika |
| M | Clear all pāramīs and kleshas |
| Z | Spawn Nerayikā |
| X | Spawn Tiracchānā pack (6) |
| C | Spawn Manussā |
| N | Spawn Vajra |
| **R** | Reset all cutscene flags |
| **P** | Play next cutscene (cycles through all) |

---

## Part 6: Next Session — Phase 10 Remaining

### ✅ DONE: Boss HP Scales with Paññā (NOAH only)

Implemented in `cycleScaling.ts` — +85% per Panna stack.

### ✅ DONE: Boss HP Per Kalpa

Fixed values: 80/120/180/250 for K1-4, +10% per kalpa beyond.

### ✅ DONE: Kalpa 4 Boss Enhancements

Rose curve movement, nerayika swarm attack.

### Priority 1: Mine Scatter Attack (Kalpa 5+) — OPTIONAL

Lower priority, implement if time allows.

### Priority 2: Save System

Persist game progress across sessions.

### Priority 3: Polish

Screenshake, particles, juice.

---

## Part 7: Git Commit History (Recent)

```
ea8ae57 Polish: push particles, radius limit, menu fix, k4 boss sound
d0e9c23 Add cutscene system with 10 narrative moments
64215c1 Fix stuck keys with canvas focus + multiple blur handlers
062532b Update SESSION_HANDOFF.md with all Session 7 fixes
4374e56 Update vajra.mp3 sound effect
6f0ab6f Fix stuck keys with custom key tracking that clears on blur
```

---

*The path to Nirvana is paved with clean architecture and frequent commits. 🪷*
