# Dharma Invaders — Session Handoff

**Last Updated:** 2026-01-15
**Status:** Phases 1-3 complete, ready for Phase 4
**Codebase Audit:** A- (2026-01-14) — Clean architecture, minor housekeeping done

---

## Quick Start for New Sessions

```
READ THIS FILE FIRST. It supersedes conflicting information in other docs.

Current task: Phase 4 — HUD icons + victory updates
Key files: src/ui/rebirthHud.ts, src/scenes/nirvana.ts

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
- Enemies spawn from ALL screen edges
- Screen: 800x600 with 50px HUD border at top

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

// Exported getters
export function getGameState(): GameState
export function getKarmaTotal(): number
export function getKarmaThisLife(): number
export function getCycle(): number

// Exported actions
export function addKarma(amount: number): void
export function recordDeath(): boolean  // Returns true if mercy rule triggered
export function resetLife(): void       // Called on rebirth
export function resetAll(): void        // Called on new game
export function addParami(type: string): void
export function addKlesha(type: string): void
```

**How systems integrate:**
- `karma.ts` calls `addKarma()` when enemies die
- `mercyRule.ts` calls `recordDeath()` on player death
- `rebirthOverlay.ts` reads state to display tier and grant buffs/debuffs
- `rebirthEffects.ts` reads paramis/kleshas to calculate multipliers
- `game.ts` calls `resetAll()` on new game start

### Rule 3: File Size Limit

**No file over 150 lines.** If a file is growing, split it.

This keeps context clean and AI suggestions accurate. Current exceptions (allowed):
- `mara.ts` (164 lines) — Only 14 over, not worth churn
- `nirvana.ts` (155 lines) — Only 5 over, trivial

### Rule 4: Data-Driven Config

ALL magic numbers go in `src/data/config.json`. Never hardcode speeds, health values, timings, or dimensions in logic files.

```typescript
// ✅ CORRECT
import config from '../data/config.json';
player.speed = config.player.speed;

// ❌ WRONG
player.speed = 300;
```

### Rule 5: Delta Time

EVERY movement calculation must use delta time for framerate independence.

```typescript
// ✅ CORRECT — Works at 60fps and 144fps
pos.x += speed * k.dt();

// ❌ WRONG — Breaks on high refresh rate monitors
pos.x += speed;
```

### Rule 6: Event Listener Cleanup

Call `events.clear()` at the start of `createGameScene()` to prevent duplicate listeners stacking on scene restart.

### Rule 7: Git Commits

Commit after every working feature with a descriptive message. This is non-negotiable.

---

## Part 3: Current Implementation Status

### What Exists ✅

| System | Status | Notes |
|--------|--------|-------|
| Core gameplay | ✅ Complete | 8 waves, 3 enemy types |
| Mara boss | ✅ Complete | 3 phases, figure-8 movement |
| 5 virtue powerups | ✅ Complete | Compassion, Wisdom, Patience, Diligence, Meditation |
| Audio system | ✅ Complete | Menu, gameplay, boss, victory, game over tracks |
| Pause menu | ✅ Complete | With confirmations |
| Title screen | ✅ Complete | Suffer image with clickable buttons |
| Mercy rule | ✅ Complete | 3 deaths without kill = game over |
| Debug tools | ✅ Complete | F1-F6 |
| Bug fixes | ✅ Complete | Enemy flee, swarm instakill |

### What's Next 🔄

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Karma split + rebirth overlay | ✅ Complete |
| **2** | 4 basic Pāramīs (buffs) | ✅ Complete |
| **3** | 4 basic Kleshas (debuffs) | ✅ Complete |
| **4** | HUD icons + victory updates | **NEXT** |
| **5** | Cycle system (Bodhisattva mode) | Pending |
| **6** | Balance + remaining buffs/debuffs | Pending |

---

## Part 4: Roguelike Expansion Spec (Authoritative)

**VISION.md supersedes CONTINUE.md for these decisions:**

### Scaling Approach: Logarithmic with Caps

```typescript
// src/systems/cycleScaling.ts
const CAPS = {
  enemySpeed: 1.5,      // Max 1.5x base speed
  enemyCount: 1.3,      // Max 1.3x enemy count
  spawnRate: 1.4,       // Max 1.4x spawn rate
  bossHP: 2.0,          // Max 2x boss HP
};

export function getCycleMultiplier(stat: keyof typeof CAPS): number {
  const cycle = getCycle();
  const cap = CAPS[stat];
  // Logarithmic: fast early gains, diminishing returns
  const rawMultiplier = 1 + (Math.log(cycle) * 0.2);
  return Math.min(rawMultiplier, cap);
}
```

**NOT linear scaling** — avoids gigaswarms that overshadow new content.

### Extended Duration Instead of Enemy Spam

```typescript
export function getWaveDuration(cycle: number): number {
  const baseDuration = 60; // seconds
  return baseDuration + (15 * (cycle - 1));
  // Cycle 1: 60s, Cycle 2: 75s, Cycle 3: 90s, etc.
}
```

### Parinirvana Always Available

**Liberation is never gated.** After defeating Mara in ANY cycle, player can choose:
1. **Parinirvana** → Credits (true ending)
2. **Bodhisattva Mode** → Continue to next cycle
3. **Return to Menu**

Special endings (deathless, high karma, etc.) are achievements/variant text, not gates.

### Karma Thresholds for Rebirth Quality

| Karma This Life | Tier | Pāramīs | Kleshas |
|-----------------|------|---------|---------|
| 0-99 | Wretched | 0 | 3 |
| 100-299 | Poor | 0 | 2 |
| 300-499 | Humble | 1 | 1 |
| 500-799 | Balanced | 1 | 0 |
| 800-1199 | Virtuous | 2 | 0 |
| 1200+ | Enlightened | 3 | 0 |

Karma resets to 0 on rebirth. Accumulated buffs/debuffs persist until Nirvana or menu.

### Enemy Unlock System (Per Cycle)

Instead of "more of same," each cycle introduces new enemy types:

| Cycle | Duration | New Enemy | Appears After |
|-------|----------|-----------|---------------|
| 1 | 60s | Hungry Ghost, Asura, Deva | Immediate |
| 2 | 75s | + Naraka (fast chargers) | 45s |
| 3 | 90s | + Animal (swarms) | 60s |
| 4 | 105s | + Human (non-hostile, high karma) | 90s |
| 5+ | 120s+ | All enemies, boss gains new attacks | — |

**Design principle:** Intensity stays manageable, but *variety* and *duration* increase.

### Phase 1 Pāramīs (Buffs)

| Pāramī | Effect | Implementation |
|--------|--------|----------------|
| **Dāna** (Generosity) | +25% powerup drop rate | Multiply `dropChance` |
| **Viriya** (Diligence) | +15% fire rate | Reduce `shootCooldown` |
| **Mettā** (Loving-kindness) | +1 max health | Add to `config.player.health` |
| **Upekkhā** (Equanimity) | Enemies 10% slower | Multiply enemy speed |

### Phase 1 Kleshas (Debuffs)

| Klesha | Effect | Implementation |
|--------|--------|----------------|
| **Lobha** (Greed) | -25% powerup drop rate | Reduce `dropChance` |
| **Dosa** (Hatred) | Enemies 10% faster | Multiply enemy speed |
| **Māna** (Conceit) | -1 max health (min 1) | Subtract from health |
| **Vicikicchā** (Doubt) | -15% fire rate | Increase `shootCooldown` |

---

## Part 5: Project Structure

```
src/
├── main.ts                    # Entry point, scene registration (37 lines)
├── scenes/
│   ├── boot.ts                # Asset loading
│   ├── menu.ts                # Main menu (SPACE/A/B)
│   ├── titleScreen.ts         # Suffer image with buttons
│   ├── game.ts                # Main gameplay loop
│   ├── nirvana.ts             # Victory screen
│   ├── credits.ts             # Parinirvana ending
│   ├── about.ts               # Controls, bestiary, lore
│   └── gameOver.ts            # Death screen
├── entities/
│   ├── player.ts              # Movement, shooting, respawn
│   ├── projectile.ts          # Virtue projectiles
│   ├── powerup.ts             # Power-up drops
│   ├── mara.ts                # Boss state machine
│   ├── maraCombat.ts          # Boss attacks and minions
│   ├── bossProjectile.ts      # Boss projectiles
│   └── enemies/
│       ├── hungryGhost.ts     # Erratic movement, 1 HP
│       ├── asura.ts           # Direct aggressive, 2 HP
│       └── deva.ts            # Graceful sinusoidal, 3 HP
├── systems/
│   ├── collision.ts           # All collision handlers
│   ├── collisionHelpers.ts    # Bounce, push utilities
│   ├── spawner.ts             # Wave-based enemy spawning
│   ├── waveManager.ts         # Wave state and progression
│   ├── karma.ts               # Score tracking (calls gameStore)
│   ├── powerupEffects.ts      # Active powerup tracking
│   ├── mercyRule.ts           # 3 deaths = game over
│   ├── enemyHelpers.ts        # Stun, push utilities
│   ├── enemyFlee.ts           # Event-driven flee behavior
│   ├── playerDamage.ts        # Centralized damage logic
│   └── audio.ts               # Music + SFX manager
├── stores/
│   └── gameStore.ts           # Module singleton state
├── ui/
│   ├── hud.ts                 # Health, karma, wave display
│   ├── pauseMenu.ts           # Pause state machine
│   └── pauseMenuUI.ts         # Pause UI rendering
├── data/
│   ├── config.json            # All game constants
│   ├── waves.json             # Wave definitions
│   ├── quotes.json            # Buddhist quotes
│   └── powerups.json          # Powerup definitions
└── utils/
    ├── events.ts              # Type-safe event bus
    └── debug.ts               # Debug tools (F1-F6)
```

---

## Part 5.5: Config.json Key Values

Quick reference for current game constants:

```json
{
  "screen": { "width": 800, "height": 600 },
  "hud": { "height": 50 },
  "player": {
    "health": 3,
    "speed": 300,
    "shootCooldown": 150,
    "respawnInvincibility": 3000
  },
  "projectile": {
    "speed": 500,
    "damage": 1
  },
  "enemies": {
    "hungryGhost": { "speed": 100, "health": 1, "karmaValue": 10 },
    "asura": { "speed": 150, "health": 2, "karmaValue": 25 },
    "deva": { "speed": 80, "health": 3, "karmaValue": 50 }
  },
  "boss": {
    "health": 50,
    "minionSpawnInterval": 2000,
    "phase1Threshold": 70,
    "phase2Threshold": 30
  },
  "powerup": {
    "dropChance": 0.15,
    "duration": 8000,
    "fallSpeed": 100
  },
  "roguelike": {
    "mercyRuleDeaths": 3,
    "karmaThresholds": {
      "wretched": { "max": 99, "paramis": 0, "kleshas": 3 },
      "poor": { "max": 299, "paramis": 0, "kleshas": 2 },
      "humble": { "max": 499, "paramis": 1, "kleshas": 1 },
      "balanced": { "max": 799, "paramis": 1, "kleshas": 0 },
      "virtuous": { "max": 1199, "paramis": 2, "kleshas": 0 },
      "enlightened": { "max": 999999, "paramis": 3, "kleshas": 0 }
    },
    "scaling": {
      "method": "logarithmic",
      "caps": {
        "enemySpeed": 1.5,
        "enemyCount": 1.3,
        "spawnRate": 1.4,
        "bossHP": 2.0
      }
    },
    "waveDuration": {
      "base": 60,
      "perCycleBonus": 15
    }
  }
}
```

---

## Part 6: Event Types Reference

```typescript
// Combat
'enemy:spawned' | 'enemy:killed' | 'enemy:escaped' | 'projectile:fired'

// Player
'player:hit' | 'player:died' | 'player:powerup' | 'player:reborn'

// Game Flow
'wave:started' | 'wave:complete' | 'boss:started' | 'boss:phaseChange' | 
'boss:defeated' | 'game:victory' | 'game:over'

// Powerups
'powerup:activated' | 'powerup:deactivated' | 'powerup:shieldBroken'

// Roguelike (NEW)
'rebirth:started' | 'rebirth:complete' | 'parami:gained' | 'klesha:gained' |
'cycle:started' | 'cycle:complete'

// Systems
'karma:changed' | 'audio:play' | 'debug:toggle'
```

---

## Part 7: Debug Tools

| Key | Action |
|-----|--------|
| F1 | Toggle hitbox visibility |
| F2 | Skip to wave 8 |
| F3 | Skip directly to boss |
| F4 | Cycle through powerups |
| F6 | Toggle invincibility |

"DEBUG" indicator appears when any debug mode is active.

---

## Part 8: Claude Code Prompts

### Phase 1-3: COMPLETE ✅

Phases 1-3 are fully implemented:
- `src/stores/gameStore.ts` — Module singleton with karmaTotal/karmaThisLife/paramis/kleshas
- `src/ui/rebirthOverlay.ts` — Tier display + buff/debuff grants on death
- `src/systems/rebirthEffects.ts` — All 4 multiplier functions
- `src/systems/rebirthTiers.ts` — Tier calculation
- `src/ui/rebirthHud.ts` — Bottom HUD showing active effects (basic version)

Stacking is correctly implemented:
- `powerupEffects.ts` imports rebirth multipliers and combines them with powerup multipliers
- Fire rate = base × Diligence powerup × Viriya/Vicikiccha rebirth
- Enemy speed = base × Patience powerup × Upekkha/Dosa rebirth

### Phase 4: HUD Icons + Victory Updates (NEXT)

```
Read SESSION_HANDOFF.md for architecture rules.

Implement Phase 4 — HUD polish and victory updates:

1. Enhance src/ui/rebirthHud.ts:
   - Display Pāramī icons (green/gold colored indicators)
   - Display Klesha icons (red/dark colored indicators)
   - Show count for each type (e.g., "Dana ×2")
   - Position at bottom of screen, non-intrusive

2. Update src/scenes/nirvana.ts:
   - Show accumulated buff/debuff counts
   - Display cycle-specific victory text (Four Noble Truths rotation)
   - Show death counter for this run
   - Add "Parinirvana" vs "Continue" choice (Phase 5 prep)

3. Add victory quotes to src/data/quotes.json:
   "victoryQuotes": [
     "Life is suffering. You have witnessed this truth.",
     "Suffering arises from attachment. You have released your grip.",
     "Suffering can end. You have glimpsed the cessation.",
     "The path exists. You have walked it."
   ]

4. Update HUD to show death counter during gameplay

Follow architecture rules: max 150 lines per file, config-driven values.
```

---

## Part 9: Source of Truth

| Topic | Authoritative Doc | Notes |
|-------|-------------------|-------|
| Implementation details | **SESSION_HANDOFF.md** | Code patterns, current state, prompts |
| Design philosophy | **VISION.md** | Why decisions were made |
| Future features | **FUTURE_IDEAS.md** | V1.5, V2, post-ship ideas |
| Architecture rules | **CLAUDE.md** | Backup reference |
| Buddhist concepts | **LORE.md** | Pāramīs, Kleshas, realms |
| Tech stack | **CLAUDE.md** | Kaplay, TypeScript, Howler |

**Superseded documents (DO NOT USE for current implementation):**
- `CONTINUE.md` — Outdated scaling approach
- `DAY_TWO_HANDOFF.md` — Historical only
- `ROGUELIKE_EXPANSION.md` — Merged into this file

**When in doubt, this file wins.**

---

## Part 10: Common Mistakes to Avoid

| Don't | Do Instead |
|-------|------------|
| One giant file | Split at 150 lines |
| Hardcode numbers | Put in config.json |
| Direct object references | Use event bus |
| Skip delta time | Always multiply by `k.dt()` |
| Art before gameplay | Colored rectangles first |
| Forget event cleanup | `events.clear()` on scene start |
| Work without commits | Commit every working feature |
| Use Zustand | Use module singleton in gameStore.ts |
| Linear difficulty scaling | Logarithmic with caps |
| Gate Parinirvana | Always available after boss |

---

## Part 11: Testing Checklist

Before moving to next feature, verify:
- [ ] Works in happy path
- [ ] Works at screen edges
- [ ] Works with rapid input
- [ ] Cleans up on entity destruction
- [ ] Works after death/restart
- [ ] Works at both 60fps and 144fps
- [ ] State persists correctly across scenes
- [ ] Events fire and clean up properly

---

## Part 12: Git Commit History (Recent)

```
69aa625 Polish title screen with geometric background and quote
83dcfbe Add DAY_THREE.md - roguelike rebirth system complete
8a2ff08 Phase 2-3: Implement parami/klesha effects + bottom HUD
971ee28 Rework mercy rule + pause spawner during invincibility
250d213 Fix: Pause spawner during rebirth overlay
4405343 Fix: Replace Zustand with simple module state
4f4b99b Phase 1: Karma split + rebirth overlay
```

---

*The path to Nirvana is paved with clean architecture and frequent commits. 🪷*
