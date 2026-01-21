# Dharma Invaders — Session Handoff

**Last Updated:** 2026-01-20 (Session 6)
**Status:** Phase 8.5 COMPLETE — Difficulty system + balance tuning
**Codebase Audit:** A (2026-01-17) — Split large files, centralized magic numbers

---

## Quick Start for New Sessions

```
READ THIS FILE FIRST. It supersedes conflicting information in other docs.

Current task: Phase 9 — Cutscenes (NEXT)
Completed: Phase 8 — Boss Evolution

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

**Event bus is for notifications, NOT state storage.**

### Rule 2: Module Singleton for State

All persistent game state lives in `src/stores/gameStore.ts`:

```typescript
// src/stores/gameStore.ts structure
interface GameState {
  karmaTotal: number;      // Lifetime karma (never resets mid-run)
  karmaThisLife: number;   // Resets on death
  deaths: number;          // Deaths this cycle
  deathsWithoutKarma: number;  // For mercy rule
  cycle: number;           // Current cycle (starts at 1)
  paramis: string[];       // Accumulated buffs
  kleshas: string[];       // Accumulated debuffs
}
```

### Rule 3: File Size Limit

**No file over 150 lines.** If a file is growing, split it.

### Rule 4: Data-Driven Config

ALL magic numbers go in `src/data/config.json`. Never hardcode speeds, health values, timings, or dimensions in logic files.

### Rule 5: Delta Time

EVERY movement calculation must use delta time for framerate independence.

### Rule 6: Event Listener Cleanup

Call `events.clear()` at the start of `createGameScene()` to prevent duplicate listeners stacking on scene restart.

### Rule 7: Git Commits

Commit after every working feature with a descriptive message. This is non-negotiable.

---

## Part 3: Current Implementation Status

### What Exists ✅

| System | Status | Notes |
|--------|--------|-------|
| Core gameplay | ✅ Complete | 8 waves, 6 enemy types |
| Mara boss | ✅ Complete | 3 phases, figure-8 movement |
| 7 powerups | ✅ Complete | Compassion, Wisdom, Patience, Diligence, Meditation, Paduma, Vajra |
| Audio system | ✅ Complete | Menu, gameplay, kalpa-based boss (1-4), victory, game over |
| Pause menu | ✅ Complete | With confirmations |
| Title screen | ✅ Complete | Geometric lotus with quote |
| Mercy rule | ✅ Complete | 3 deaths without kill = game over |
| Debug tools | ✅ Complete | F1-F7, parami/klesha keys, enemy spawn keys, N=Vajra |
| Difficulty system | ✅ Complete | 4 levels (Sotāpanna→NOAH), localStorage persistence |
| Rebirth HUD | ✅ Complete | Bottom bar shows paramis (green) / kleshas (red) |
| Pause About | ✅ Complete | (B) opens help overlay mid-game |
| New enemies | ✅ Complete | Nerayikā, Tiracchānā, Manussā with kalpa gates |
| Hit particles | ✅ Complete | Purple burst on projectile hits |

### Phase Progress

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Karma split + rebirth overlay | ✅ Complete |
| **2** | 4 basic Pāramīs (buffs) | ✅ Complete |
| **3** | 4 basic Kleshas (debuffs) | ✅ Complete |
| **4** | HUD icons for buffs/debuffs | ✅ Complete |
| **5** | Kalpa system + difficulty scaling | ✅ Complete |
| **6** | Balance + remaining buffs/debuffs | ✅ Complete |
| **7** | New enemy types | ✅ Complete |
| **8** | Boss evolution | ✅ Complete |
| **9** | Cutscenes | ⏳ Next |

---

## Part 4: Phase 7 Summary — COMPLETE ✅

### New Enemies Implemented

| Enemy | Kalpa | Shape | HP | Karma | Special |
|-------|-------|-------|-----|-------|---------|
| **Nerayikā** | 2+ | Orange hexagon | 4 | 50 | 2 damage + random Klesha (bypasses shield), pursues at half speed if missed, freezes during player i-frames |
| **Tiracchānā** | 3+ | Blue triangle | 1 | 20 | Pack of 6 (pack 1 grouped, packs 2+ from all edges), removes 1 Pāramī stack, shows `-[Pāramī]` feedback |
| **Manussā** | 4+ | Green rectangle | 7 | ±1000 | Non-hostile, karma test, says "Ouch!" when hit |

### Manussā Mechanics

**Normal behavior:**
- Kill = severe penalty (karma→0, -1 pāramī, +1 klesha, powerups→1s)
- Escape (wave 8) = +1000 karma + "Bhavatu Sabba Mangalam" bubble

**With Ahirika klesha:**
- Kill = +1000 karma (flipped!)
- Escape = severe penalty (flipped!)

### New Klesha: Ahirika

| Klesha | Effect | Max |
|--------|--------|-----|
| **Ahirika** (Shamelessness) | Flips Manussā karma mechanics | 1 |

### Files Created/Modified

**New files:**
- `src/entities/enemies/nerayika.ts` — Hexagon, hesitate→charge behavior
- `src/entities/enemies/tiracchana.ts` — Triangle, wobble, pack spawning
- `src/entities/enemies/manussa.ts` — Wander, persist, escape/kill mechanics
- `src/systems/particles.ts` — Hit particle effects

**Modified:**
- `config.json` — Added `newEnemies` section
- `gameStore.ts` — Added `removeParami`, `removeRandomParami`, `setKarmaThisLife`, `hasKlesha`, Ahirika cap
- `shieldSystem.ts` — Added `absorbDamage()` for multi-hit
- `powerupEffects.ts` — Added `reduceAllTimers()`
- `collision.ts` — Special handlers for each new enemy
- `spawner.ts` — Kalpa-gated parallel spawning, Manussa excluded from wave completion
- `karma.ts` — Handles `human:escaped` and `human:killed:ahirika` events
- `events.ts` — New event types
- `debug.ts` — Z/X/C spawn enemies, - adds Ahirika

### UI Updates

- Bestiary shows proper shapes (hexagon, triangle, rectangle)
- All Pali terms use proper diacritics (ā, ī, ñ, ṭ, ṭṭ)
- Lore updated with Six Realms, Pāramī/Klesha explanation
- Subtitle: `"Escape" from Samsara`
- Larger fonts and better spacing throughout

---

## Part 5: Terminology Convention

**Pali with diacritics** for all Buddhist terms EXCEPT:
- **Karma** (Sanskrit, not Kamma)
- **Klesha** (Sanskrit, not Kilesa)
- **Nirvana** (Sanskrit, not Nibbāna)

Examples:
- Pāramī (not Parami)
- Mettā (not Metta)
- Nerayikā (not Nerayika)
- Manussā (not Manussa)

---

## Part 6: Implemented Pāramīs (10 total)

| Pāramī | Effect | Max |
|--------|--------|-----|
| **Dāna** (Generosity) | 1.25x powerup drop rate | 1 |
| **Viriya** (Energy) | +10% fire rate per stack | 5 |
| **Mettā** (Loving-kindness) | +1 max health per stack | 7 |
| **Upekkhā** (Equanimity) | -10% enemy speed per stack | 5 |
| **Sīla** (Morality) | Auto-shield on spawn | 1 |
| **Khantī** (Patience) | +20% powerup duration per stack | 5 |
| **Paññā** (Wisdom) | +1 projectile damage per stack | 2 |
| **Adhiṭṭhāna** (Determination) | +1 shield charge per stack | 1 |
| **Nekkhamma** (Renunciation) | +50% karma gain per stack | 2 |
| **Sacca** (Truthfulness) | +5% Paduma drop rate | 1 |

---

## Part 7: Implemented Kleshas (9 total)

| Klesha | Effect | Max |
|--------|--------|-----|
| **Lobha** (Greed) | -25% drop rate per stack | 2 |
| **Dosa** (Aversion) | +10% enemy speed per stack | 3 |
| **Māna** (Conceit) | -1 max health per stack | 5 |
| **Vicikicchā** (Doubt) | -10% fire rate per stack | 3 |
| **Moha** (Delusion) | -20% powerup duration per stack | 2 |
| **Thīna** (Sloth) | -10% player speed per stack | 2 |
| **Anottappa** (Recklessness) | -1 damage per stack (min 1) | 1 |
| **Micchādiṭṭhi** (Wrong View) | -25% karma gain per stack | 2 |
| **Ahirika** (Shamelessness) | Flips Manussā karma | 1 |

---

## Part 8: Debug Tools

| Key | Action |
|-----|--------|
| F1 | Toggle hitbox visibility |
| F2 | Skip to wave 8 |
| F3 | Skip directly to boss |
| F4 | Cycle through powerups |
| F6 | Toggle invincibility |
| F7 | Cycle difficulty (bypasses menu restriction) |
| V | Heal player (+1 HP) |
| T/Y/U/I | Add Dāna/Viriya/Mettā/Upekkhā |
| 1/2/3/4/5 | Add Sīla/Khantī/Paññā/Adhiṭṭhāna/Nekkhamma |
| 0 | Add Sacca |
| G/H/J/K | Add Lobha/Dosa/Māna/Vicikicchā |
| 6/7/8/9 | Add Moha/Thīna/Anottappa/Micchādiṭṭhi |
| - | Add Ahirika |
| M | Clear all pāramīs and kleshas |
| Z | Spawn Nerayikā |
| X | Spawn Tiracchānā pack (6) |
| C | Spawn Manussā |
| N | Spawn Vajra |

---

## Part 9: Project Structure

```
src/
├── main.ts                    # Entry point
├── scenes/
│   ├── menu.ts                # Main menu
│   ├── titleScreen.ts         # Title with lotus art
│   ├── game.ts                # Main gameplay
│   ├── nirvana.ts             # Victory screen
│   ├── credits.ts             # Parinirvana ending
│   ├── about.ts               # Controls, bestiary, lore
│   ├── aboutTabs.ts           # About scene content
│   └── gameOver.ts            # Death screen
├── entities/
│   ├── player.ts
│   ├── projectile.ts
│   ├── powerup.ts
│   ├── mara.ts
│   ├── maraCombat.ts
│   ├── bossProjectile.ts
│   └── enemies/
│       ├── hungryGhost.ts     # Petā (1 HP)
│       ├── asura.ts           # Asurā (2 HP)
│       ├── deva.ts            # Devā (3 HP)
│       ├── nerayika.ts        # Nerayikā (4 HP, Kalpa 2+)
│       ├── tiracchana.ts      # Tiracchānā (1 HP, Kalpa 3+)
│       └── manussa.ts         # Manussā (7 HP, Kalpa 4+)
├── systems/
│   ├── collision.ts           # Main collision orchestration (155 lines)
│   ├── specialEnemyCollisions.ts  # Nerayikā/Tiracchānā/Manussā handlers
│   ├── bossCollisions.ts      # Boss collision logic
│   ├── spawner.ts             # Wave spawning (140 lines)
│   ├── spawnPositions.ts      # Position helpers
│   ├── newEnemySpawner.ts     # Kalpa-gated enemy spawning
│   ├── waveManager.ts
│   ├── karma.ts
│   ├── powerupEffects.ts
│   ├── shieldSystem.ts
│   ├── particles.ts           # Hit particle effects + push ring
│   ├── cycleScaling.ts        # Kalpa + difficulty scaling
│   ├── difficulty.ts          # Difficulty multiplier helpers
│   ├── persistence.ts         # Unified localStorage wrapper (SaveData)
│   ├── rebirthEffects.ts
│   └── audio.ts
├── stores/
│   └── gameStore.ts           # Module singleton
├── ui/
│   ├── pauseMenu.ts
│   ├── rebirthOverlay.ts
│   ├── rebirthHud.ts
│   ├── aboutOverlay.ts
│   └── aboutOverlayTabs.ts
├── data/
│   └── config.json            # All game constants
└── utils/
    ├── events.ts              # Type-safe event bus
    └── debug.ts               # Debug tools
```

---

## Part 10: Event Types

```typescript
// Combat
'enemy:spawned' | 'enemy:killed' | 'enemy:escaped' | 'projectile:fired'

// Player
'player:hit' | 'player:died' | 'player:powerup' | 'player:healed'
'player:applyKlesha' | 'player:removeParami'

// Manussa (Human) special events
'human:killed' | 'human:killed:ahirika' | 'human:escaped'

// Game Flow
'wave:started' | 'wave:complete' | 'boss:started' | 'boss:phaseChange'
'boss:spawnMinion' | 'boss:defeated' | 'game:victory' | 'game:over'

// Powerups
'powerup:activated' | 'powerup:deactivated' | 'powerup:shieldBroken'

// Systems
'karma:changed' | 'audio:play' | 'debug:toggle'
```

---

## Part 11: Recent Session Bug Fixes & Changes

### Bug Fixes

**1. Particle lifespan requires opacity component**
```typescript
// particles.ts - lifespan fade needs opacity to work
const particle = k.add([
  k.rect(size, size),
  k.color(k.Color.fromHex('#9966FF')),
  k.opacity(1),  // ← REQUIRED for lifespan fade
  k.lifespan(0.25, { fade: 0.15 }),
]);
```

**2. Manussa karma double-firing fix**
```typescript
// karma.ts - skip generic enemy:killed for Manussa (handled specially)
events.on('enemy:killed', (data) => {
  if (data.type === 'manussa') return;  // ← Skip, handled by human:killed events
  // ... normal karma logic
});
```

**3. Health clamping for Paduma healing**
```typescript
// collision.ts - clamp heal to actual max health
const maxHealth = Math.max(1, config.player.health + getMaxHealthModifier());
const newHealth = Math.min(player.hp() + healAmount, maxHealth);
player.setHP(newHealth);
```

**4. Saved HP clamping on kalpa start**
```typescript
// game.ts - clamp saved HP to current max (Metta/Mana may have changed)
const savedHP = consumeSavedHealth();
if (savedHP !== null) {
  const maxHealth = Math.max(1, config.player.health + getMaxHealthModifier());
  const clampedHP = Math.min(savedHP, maxHealth);
  player.setHP(clampedHP);
}
```

**5. Rebirth skips capped paramis/kleshas**
```typescript
// rebirthOverlay.ts - filter out effects at max stacks
const availableParamis = PARAMI_POOL.filter(p => !isParamiCapped(p));
const availableKleshas = KLESHA_POOL.filter(k => !isKleshaCapped(k));
const grantedParamis = pickRandom(availableParamis, Math.min(tier.paramis, availableParamis.length));
```

### Session 3 Additions

**1. Paṭighāta Push Ability**
```typescript
// player.ts - right-click to push all enemies 150px away
k.onMousePress('right', push);

function push() {
  if (!canPush) return;
  canPush = false;
  spawnPushRing(player.pos.x, player.pos.y, pushCfg.ringColor);
  playSFX('patighata');
  pushEnemiesFromPoint(k, player.pos.x, player.pos.y, pushCfg.pushDistance);
  k.wait(pushCfg.cooldown / 1000, () => { canPush = true; });
}
```
Config: `config.player.pushAbility` (cooldown: 5000ms, pushDistance: 150px, ringColor: #FFD700)

**2. Kalpa-Based Boss Music**
```typescript
// gameAudio.ts - different boss track per kalpa
events.on('boss:started', () => {
  const kalpa = getCycle();
  if (kalpa >= 4) playMusic('boss4');
  else if (kalpa >= 3) playMusic('boss3');
  else if (kalpa >= 2) playMusic('boss2');
  else playMusic('boss');
});
```
Tracks: boss.wav (K1), boss2.wav (K2), boss3.wav (K3), boss4.wav (K4+)

**3. Visual Feedback for Enemy Collisions**
- Nerayikā collision shows `+[Klesha]` floating text (red)
- Tiracchānā collision shows `-[Pāramī]` floating text (green)
- Same pattern as Manussā death feedback

**4. Spawn Config Improvements**
- Spawn staggers moved to config.json (nerayika.spawns.stagger, tiracchana.spawns.packStagger/individualStagger)
- Updated spawn counts: Nerayikā 1→1→2→2→2→3→3→4, Tiracchānā packs -→1→1→1→1→2→2→3
- Tiracchānā packs 2+ now spawn from random edges (surrounds player)

### Session 4: Architecture Refactoring

**See SPAGHETTI.md for full details.**

**1. Split collision.ts (371 → 155 lines)**
- Created `specialEnemyCollisions.ts` — Nerayikā/Tiracchānā/Manussā handlers
- Created `bossCollisions.ts` — Boss collision logic
- Main file now orchestrates and delegates

**2. Split spawner.ts (250 → 140 lines)**
- Created `spawnPositions.ts` — Edge position helpers
- Created `newEnemySpawner.ts` — Kalpa-gated enemy spawning
- Main file handles core wave logic

**3. Centralized magic numbers to config.json**
```json
"effects": {
  "textRiseSpeed": 20,
  "fastTextRiseSpeed": 40,
  "deathTextRiseSpeed": 25,
  "packSpread": 15,
  "packVariance": 5,
  "wobbleFrequency": 8,
  "waveSpeedMultiplier": 0.025
}
```
- Updated all enemy files to use `config.effects.waveSpeedMultiplier`
- Updated manussa.ts to use `cfg.wanderInterval`, `cfg.bounceMargin`

**4. Temporary boss music mapping**
- Kalpa 1: boss.wav
- Kalpa 2: boss2.wav
- Kalpa 3: boss.wav (until boss3.wav ready)
- Kalpa 4+: boss2.wav (until boss4.wav ready)

---

### Previous Session Features

**1. Nerayikā pursuit behavior**
```typescript
// nerayika.ts - if charge misses, pursue at half speed
case 'pursuing':
  const target = k.get('player')[0];
  if (target) {
    const pursuitSpeed = cfg.chargeSpeed * 0.5;
    // Track player continuously
    nerayika.pos.x += (pdx / pdist) * pursuitSpeed * k.dt();
    nerayika.pos.y += (pdy / pdist) * pursuitSpeed * k.dt();
    nerayika.angle = k.rad2deg(Math.atan2(pdy, pdx)) + 90;
  }
  break;
```

**2. Manussā visual feedback**
- "Ouch!" (yellow) when hit but survives
- "bruh, why?" (red) on death
- Shows `-[Parami]` (green) and `+[Klesha]` (red) floating text on normal kill
- Shows `+1000 karma` (gold) on Ahirika kill
- Ahirika escape: "You let me go... fool!" + "Karma wiped!"

**3. Missing rebirth pool entries**
- Added **Sacca** to PARAMI_POOL
- Added **Ahirika** to KLESHA_POOL

---

## Part 12: Phase 8 Summary — Boss Evolution ✅

**Goal:** Mara gains new attacks per kalpa, keeping boss fights fresh.

### Kalpa-Based Attacks

| Kalpa | New Attack | Description |
|-------|------------|-------------|
| 1 | (Base) | Aimed projectiles, minion spawns in phase 2+, phase 3 speed |
| 2+ | **Spread Shot** | 5 projectiles in 90° arc toward player (4s cooldown) |
| 3+ | **Sweep Beam** | Horizontal line of 10 projectiles downward (5s cooldown) |
| 4+ | **Rage Mode** | Phase 3 speed/flash from start, spawn Asurā minions instead of Petā |

### Config Added

```json
"boss.evolution": {
  "spreadShot": { "minKalpa": 2, "projectileCount": 5, "arcAngle": 1.57, "cooldown": 4000 },
  "sweepBeam": { "minKalpa": 3, "projectileCount": 10, "width": 600, "cooldown": 5000 },
  "rageMode": { "minKalpa": 4, "useAsuraMinions": true }
}
```

### Files Modified

- `config.json` — Added `boss.evolution` section
- `mara.ts` — Rage mode flag, delegates attacks to maraCombat
- `maraCombat.ts` — Added `updateMaraAttacks()`, `fireSpreadShot()`, `fireSweepBeam()`, minion type selection
- `spawner.ts` — Handle minion type in `boss:spawnMinion` event
- `events.ts` — Added optional `type` field to `boss:spawnMinion`

---

## Part 12.5: Vajra Powerup — COMPLETE ✅

**Rare 1.5% drop that clears all enemies on screen.**

| Property | Value |
|----------|-------|
| Drop Rate | 1.5% (replaces normal powerup roll) |
| Karma | +500 flat (not per-enemy) |
| Visual | Golden rotating rectangle with sparkle particles |
| Sound | `vajra.mp3` (plays immediately, effect delayed 1s) |
| Affected by | Difficulty drop rate multiplier |

**Kills:** All enemies except Manussā (innocents) and Māra (boss immune)
**Does NOT:** Grant individual karma per kill, drop powerups from killed enemies, play enemy death sounds

**Files:** `config.json`, `powerup.ts`, `particles.ts`, `collision.ts`, `sfx.ts`, `debug.ts`

**Added to About menus:** Both pause overlay and main menu show Vajra with icon and description.

---

## Part 12.6: Session 6 — Difficulty System + Balance ✅

### Difficulty System

**4 difficulty levels** named after Buddhist stages of awakening (plus NOAH for masochists):

| Difficulty | Spawn | Speed | Boss HP | Drops | Color |
|------------|-------|-------|---------|-------|-------|
| **Sotāpanna** (Stream-enterer) | 0.75x | 0.85x | 0.75x | 1.25x | Green |
| **Sakadāgāmī** (Once-returner) | 1.0x | 1.0x | 1.0x | 1.0x | Orange |
| **Anāgāmī** (Non-returner) | 1.3x | 1.15x | 1.25x | 0.8x | Light red |
| **NOAH** | 1.5x | 1.2x | 1.5x | 0.75x | Dark red |

**Multiplier stacking:** Difficulty × Kalpa scaling (multiplicative)

### Config Structure

```json
"difficulty": {
  "sotapanna": {
    "displayName": "Sotāpanna",
    "subtitle": "Stream-enterer",
    "spawnMultiplier": 0.75,
    "enemySpeedMultiplier": 0.85,
    "bossHealthMultiplier": 0.75,
    "dropRateMultiplier": 1.25
  },
  // ... sakadagami, anagami, noah
}
```

### Implementation

```typescript
// src/systems/difficulty.ts — Get multipliers
export function getDifficultyMultiplier(stat: DifficultyMultiplier): number {
  const diff = getDifficulty();
  return config.difficulty[diff][stat] ?? 1;
}

// src/systems/cycleScaling.ts — Apply to existing scaling
export function getEnemySpeedScaling(): number {
  return getScalingMultiplier(caps.enemySpeed) * getDifficultyMultiplier('enemySpeedMultiplier');
}

// src/systems/persistence.ts — Unified localStorage wrapper
interface SaveData {
  difficulty: string;
  cutsceneFlags: { hasSeenIntro: boolean; /* ... */ };
  musicUnlocks: string[];
}
export function getPersistedDifficulty(): string { return loadSave().difficulty; }
export function setPersistedDifficulty(d: string): void { updateSave({ difficulty: d }); }

// src/stores/gameStore.ts — Delegates to persistence
export function getDifficulty(): Difficulty { return getPersistedDifficulty() as Difficulty; }
export function setDifficulty(d: Difficulty): void { setPersistedDifficulty(d); }
```

### UI

- **Menu:** (D) key or click arrows to cycle, color-coded text
- **HUD:** Tiny text under "Dharma Invaders" title (non-default only)
- **Debug:** F7 cycles difficulty mid-game

### Files Created/Modified

**New:**
- `src/systems/difficulty.ts` — Multiplier helpers
- `src/systems/persistence.ts` — Unified localStorage wrapper for SaveData (difficulty, cutscene flags, music unlocks)

**Modified:**
- `config.json` — Added `difficulty` section
- `gameStore.ts` — Difficulty delegates to persistence.ts
- `main.ts` — Imports gameStore to trigger persistence init
- `cycleScaling.ts` — Apply difficulty to spawn/speed/bossHP
- `powerup.ts` — Apply difficulty to drop rates
- `menu.ts` — Difficulty selector UI
- `game.ts` — HUD indicator
- `debug.ts` — F7 key

### Balance Changes (Session 6)

| Change | Before | After | Reason |
|--------|--------|-------|--------|
| Diligence stacking | 0.5^stacks | 0.75^stacks | Max 2.4x fire rate (was 8x) |
| Asura speed | 150 | 125 | Less aggressive early game |
| Tiracchana speed | 150 | 125 | Packs less overwhelming |
| Vajra drop rate | 2% | 1.5% | Slightly rarer screen clear |

**Diligence formula change:**
```typescript
// Before: 0.5^3 = 0.125x cooldown = 8x fire rate
// After:  0.75^3 = 0.422x cooldown = 2.4x fire rate
const powerupMultiplier = stacks > 0 ? Math.pow(0.75, stacks) : 1;
```

---

## Part 13: Next Phase — Cutscenes (Phase 9)

**Goal:** Add intro cutscene and ending cutscenes for narrative.

---

## Part 14: Git Commit History (Recent)

```
19da941 Add unified persistence layer for localStorage
9b2e45c Update vajra.mp3 sound effect
c9446aa Add difficulty system with 4 levels
349b3e1 Balance: nerf Diligence and enemy speeds
300c125 Reduce Vajra drop rate from 2% to 1.5%
62a5d8e Silence enemy death sounds on Vajra kill, reduce Vajra volume 40%
88651ae Play Vajra sound immediately, delay screen clear effect
39a2e09 Add 1s delay before Vajra effect triggers
fb8bb77 Add Vajra powerup: rare screen-clear with golden particles
80a121d Add boss evolution: kalpa-based attacks and rage mode (Phase 8)
8464a70 Add SPAGHETTI.md architecture report, update SESSION_HANDOFF
1595657 Refactor: split large files and centralize magic numbers
9f54f53 Simplify boss music mapping for kalpas 3-4
1408773 Add paduma powerup sound effect
0ead5cb Add Paṭighāta push ability and kalpa-based boss music
eb5cd97 Add visual feedback for Manussa parami/klesha changes
```

---

*The path to Nirvana is paved with clean architecture and frequent commits. 🪷*
