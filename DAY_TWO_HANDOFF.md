# Dharma Invaders — Day Two Handoff

**Status:** Core game complete, bug-free, ready for roguelike expansion
**Next Session:** Title screen with clickable image (image not yet uploaded)

---

## Executive Summary

Dharma Invaders is a Buddhist-themed arena shooter where the player (a meditating figure) shoots virtue projectiles at enemies from the Six Realms of Samsara, ultimately defeating Mara (the demon of illusion) to achieve Nirvana.

### What Exists Now
- **Complete 8-wave game** with 3 enemy types scaling in difficulty
- **Mara boss fight** with 3 phases, figure-8 movement, minion spawns
- **5 virtue powerups** (Compassion, Wisdom, Patience, Diligence, Meditation)
- **Full UI:** Main menu, pause menu with confirmations, about section, credits
- **Audio system:** Music tracks for menu, gameplay, boss, victory, game over
- **Mercy rule:** 3 deaths without a kill = game over
- **Debug tools:** F1-F5 for testing

### What We Fixed Today (Bug Session)
1. **Enemy flee bug** — Enemies now flee immediately when Mara HP hits 0
2. **Swarm instakill bug** — Enemies freeze while player is invincible
3. **Player exploit prevention** — Cannot shoot during invincibility

### What's Next
Transform the single-run game into a **roguelike rebirth cycle** where deaths grant buffs/debuffs based on karma earned, creating emergent difficulty and thematic resonance with Buddhist concepts.

---

## Today's Bug Fixes — Detailed Breakdown

### Bug 1: Enemies Don't Flee When Boss Dies

**Problem:** When Mara was defeated, the `boss:defeated` event fired after a 2-second death animation, but enemies needed to flee immediately.

**Solution:** Moved event emission from `updateDefeated()` to `damageMara()`:

```typescript
// src/entities/mara.ts
if (mara.hp() <= 0) {
  currentPhase = 'defeated';
  mara.phase = 'defeated';
  deathAnimTimer = 0;
  events.emit('boss:defeated', {});  // Emit IMMEDIATELY
}
```

**Architecture:** Uses event-driven flee system (`src/systems/enemyFlee.ts`) to avoid circular imports:

```typescript
let enemiesShouldFlee = false;

events.on('boss:defeated', () => {
  enemiesShouldFlee = true;
});

export function shouldEnemiesFlee(): boolean {
  return enemiesShouldFlee;
}
```

### Bug 2: Swarm Instakill

**Problem:** When swarmed by enemies, player could die multiple times before respawn completed.

**Root Cause:** Enemies continued moving during invincibility, causing instant re-swarm.

**Solution:** Simplified freeze mechanic — enemies check player invincibility every frame:

```typescript
// In each enemy's onUpdate (hungryGhost.ts, asura.ts, deva.ts)
ghost.onUpdate(() => {
  if (isPaused) return;

  const player = k.get('player')[0];
  if (!player) return;

  // Freeze while player is invincible or enemy is stunned
  if (ghost.stunned || player.invincible) return;

  // ... movement logic
});
```

**Additional Fixes:**
- Player cannot shoot while invincible (prevents exploitation)
- Spawner pauses 3.5s during respawn
- Enemies pushed 250px from center on respawn

### Files Modified/Created

| File | Changes |
|------|---------|
| `src/entities/enemies/hungryGhost.ts` | Added `player.invincible` check |
| `src/entities/enemies/asura.ts` | Added `player.invincible` check |
| `src/entities/enemies/deva.ts` | Added `player.invincible` check |
| `src/entities/player.ts` | Block shooting during invincibility |
| `src/entities/mara.ts` | Emit `boss:defeated` immediately |
| `src/systems/spawner.ts` | Extended pause to 3.5s |
| `src/systems/enemyHelpers.ts` | NEW: Push utilities |
| `src/systems/enemyFlee.ts` | NEW: Event-driven flee |
| `src/systems/playerDamage.ts` | NEW: Centralized damage |
| `BUGS.md` | Bug tracking documentation |
| `FIXED.md` | Detailed fix documentation |

---

## Current Codebase Architecture

### Project Structure
```
src/
├── main.ts                      # Entry point, scene registration
├── scenes/
│   ├── boot.ts                  # Asset loading
│   ├── menu.ts                  # Main menu (SPACE/A/B)
│   ├── game.ts                  # Main gameplay loop
│   ├── nirvana.ts               # Victory screen
│   ├── credits.ts               # Parinirvana ending
│   ├── about.ts                 # Controls, bestiary, lore
│   └── gameOver.ts              # Death screen
├── entities/
│   ├── player.ts                # Movement, shooting, respawn
│   ├── projectile.ts            # Virtue projectiles
│   ├── powerup.ts               # Power-up drops
│   ├── mara.ts                  # Boss state machine
│   ├── maraCombat.ts            # Boss attacks and minions
│   └── enemies/
│       ├── hungryGhost.ts       # Erratic movement, 1 HP
│       ├── asura.ts             # Direct aggressive, 2 HP
│       └── deva.ts              # Graceful sinusoidal, 3 HP
├── systems/
│   ├── collision.ts             # All collision handlers
│   ├── collisionHelpers.ts      # Bounce, push utilities
│   ├── spawner.ts               # Wave-based enemy spawning
│   ├── waveManager.ts           # Wave state and progression
│   ├── karma.ts                 # Score tracking
│   ├── powerupEffects.ts        # Active powerup tracking
│   ├── mercyRule.ts             # 3 deaths = game over
│   ├── enemyHelpers.ts          # Stun, push utilities
│   ├── enemyFlee.ts             # Event-driven flee behavior
│   └── playerDamage.ts          # Centralized damage logic
├── ui/
│   ├── hud.ts                   # Health, karma, wave display
│   ├── pauseMenu.ts             # Pause state machine
│   └── pauseMenuUI.ts           # Pause UI rendering
├── stores/
│   └── gameStore.ts             # Zustand state
├── data/
│   ├── config.json              # All game constants
│   ├── waves.json               # Wave definitions
│   ├── quotes.json              # Buddhist quotes
│   └── powerups.json            # Powerup definitions
└── utils/
    ├── events.ts                # Event bus
    └── debug.ts                 # Debug tools (F1-F5)
```

### Tech Stack
- **Engine:** Kaplay (kaboom.js successor)
- **Language:** TypeScript (strict mode)
- **State:** Zustand
- **Audio:** Howler.js
- **Build:** Vite

### Architecture Rules (from CLAUDE.md)
1. **Event Bus Pattern** — Systems communicate via events, never direct imports
2. **File Size Limit** — No file over 150 lines
3. **Data-Driven Config** — All magic numbers in config.json
4. **Delta Time** — Every movement uses `k.dt()`
5. **Git Commits** — Commit after every working feature

---

## Roguelike Expansion — Master Roadmap

### Vision
Transform death from failure into progression. Each death triggers a "rebirth" where karma earned determines buffs (Pāramīs) and debuffs (Kleshas) for the next life. This creates:
- Emergent difficulty scaling
- Thematic resonance with Buddhist rebirth cycle
- Replayability through build variety

### Phase Overview

| Phase | Focus | Complexity | Sessions |
|-------|-------|------------|----------|
| **0** | Title screen image + clickable buttons | Easy | 1 |
| **1** | Karma split + rebirth overlay | Medium | 1-2 |
| **2** | 4 basic Pāramīs (buffs) | Medium | 1 |
| **3** | 4 basic Kleshas (debuffs) | Medium | 1 |
| **4** | HUD icons + victory updates | Easy | 1 |
| **5** | Balance + remaining buffs/debuffs | Ongoing | 2+ |

---

## Phase 0: Title Screen (NEXT SESSION)

**Goal:** Replace text menu with image-based title screen with clickable regions.

**Prerequisite:** User will upload title screen image before session.

### Implementation Plan

#### Step 1: Load Title Image
```typescript
// src/scenes/boot.ts - add to asset loading
k.loadSprite("titleScreen", "/sprites/title.png");
```

#### Step 2: Create Title Screen Scene
```typescript
// src/scenes/titleScreen.ts (NEW)
export function createTitleScreen(k: KAPLAYCtx) {
  const title = k.add([
    k.sprite("titleScreen"),
    k.pos(0, 0),
  ]);

  // Invisible clickable regions (coords from config)
  const cfg = config.titleScreen.buttons;

  const startButton = k.add([
    k.rect(cfg.start.width, cfg.start.height),
    k.pos(cfg.start.x, cfg.start.y),
    k.area(),
    k.opacity(0),
    "startButton"
  ]);

  startButton.onClick(() => k.go("game"));
  // ... similar for about, audio buttons

  k.onKeyPress("escape", () => k.go("menu"));
}
```

#### Step 3: Config Addition
```json
"titleScreen": {
  "imagePath": "/sprites/title.png",
  "buttons": {
    "start": { "x": 300, "y": 350, "width": 200, "height": 60 },
    "about": { "x": 300, "y": 420, "width": 200, "height": 60 },
    "audio": { "x": 300, "y": 490, "width": 200, "height": 60 }
  }
}
```

#### Step 4: Wire Up Navigation
- menu.ts: SPACE/click → titleScreen (not game)
- titleScreen: Start button → game
- titleScreen: ESC → menu (fallback)

### Checklist: Phase 0
- [ ] User uploads title screen image
- [ ] Add image to `public/sprites/title.png`
- [ ] Add sprite loading in boot.ts
- [ ] Create `src/scenes/titleScreen.ts`
- [ ] Add button positions to config.json
- [ ] Modify menu.ts to go to titleScreen
- [ ] Register scene in main.ts
- [ ] Test: SPACE on menu → title screen
- [ ] Test: Click Start → game begins
- [ ] Test: Click About → about section
- [ ] Test: Click Audio → audio settings
- [ ] Test: ESC → returns to text menu
- [ ] Commit: "Add image-based title screen"

---

## Phase 1: Core Rebirth Loop

**Goal:** Split karma tracking, show rebirth overlay on death.

### Step 1.1: Karma Split

```typescript
// src/stores/gameStore.ts
interface GameState {
  karmaTotal: number;      // Lifetime (never resets)
  karmaThisLife: number;   // Resets on death
  deaths: number;          // Total deaths this run
  deathsWithoutKill: number;  // For mercy rule
}
```

**Events to modify:**
- `enemy:killed` → add to both karmaTotal and karmaThisLife
- `player:died` → reset karmaThisLife to 0

### Step 1.2: Rebirth Overlay

```typescript
// src/ui/rebirthOverlay.ts (NEW)
export function showRebirthOverlay(k: KAPLAYCtx, karmaThisLife: number) {
  // Dim overlay
  const overlay = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.z(100),
  ]);

  // "The wheel turns..."
  k.add([
    k.text("The wheel turns...", { size: 32 }),
    k.pos(config.screen.width / 2, 200),
    k.anchor("center"),
    k.z(101),
  ]);

  // Show karma tier
  const tier = getRebirthTier(karmaThisLife);
  // ... display tier name, buffs/debuffs earned

  // "Press SPACE to continue"
  k.onKeyPress("space", () => {
    applyRebirthEffects(tier);
    overlay.destroy();
    // Resume gameplay
  });
}
```

### Step 1.3: Config Addition

```json
"roguelike": {
  "enabled": true,
  "respawnInvincibility": 3000,
  "mercyRuleDeaths": 3,
  "karmaThresholds": {
    "wretched": { "max": 99, "paramis": 0, "kleshas": 3 },
    "poor": { "max": 299, "paramis": 0, "kleshas": 2 },
    "humble": { "max": 499, "paramis": 1, "kleshas": 1 },
    "balanced": { "max": 799, "paramis": 1, "kleshas": 0 },
    "virtuous": { "max": 1199, "paramis": 2, "kleshas": 0 },
    "enlightened": { "max": 999999, "paramis": 3, "kleshas": 0 }
  }
}
```

### Checklist: Phase 1
- [ ] Add karma split to gameStore.ts
- [ ] Modify karma.ts to track both values
- [ ] Create `src/ui/rebirthOverlay.ts`
- [ ] Add `getRebirthTier()` function
- [ ] Add config.roguelike section
- [ ] Hook overlay to player:died event
- [ ] Test: Die with low karma → see "Wretched" tier
- [ ] Test: Die with high karma → see "Enlightened" tier
- [ ] Test: SPACE continues game
- [ ] Commit: "Add rebirth overlay and karma split"

---

## Phase 2: Pāramīs (Buffs)

**Goal:** Implement 4 basic buffs that persist across deaths.

### Buff Definitions

| Pāramī | Effect | Implementation |
|--------|--------|----------------|
| **Dāna** (Generosity) | +25% powerup drop rate | Multiply `dropChance` |
| **Viriya** (Diligence) | +15% fire rate | Reduce `shootCooldown` |
| **Mettā** (Loving-kindness) | +1 max health | Increase `config.player.health` |
| **Upekkhā** (Equanimity) | Enemies 10% slower | Modify `getEnemySpeedMultiplier()` |

### Implementation

```typescript
// src/systems/paramis.ts (NEW)
interface ParamiState {
  dana: number;
  viriya: number;
  metta: number;
  upekkha: number;
}

let state: ParamiState = { dana: 0, viriya: 0, metta: 0, upekkha: 0 };

export function addParami(type: keyof ParamiState): void {
  state[type]++;
  events.emit('parami:gained', { type });
}

export function getDropRateMultiplier(): number {
  return 1 + (state.dana * 0.25);
}

export function getFireRateMultiplier(): number {
  return 1 - (state.viriya * 0.15);  // Lower cooldown = faster
}

export function getMaxHealthBonus(): number {
  return state.metta;
}

export function getEnemySlowdown(): number {
  return 1 - (state.upekkha * 0.10);
}
```

### Checklist: Phase 2
- [ ] Create `src/systems/paramis.ts`
- [ ] Add parami definitions to config.json
- [ ] Modify powerup.ts to use `getDropRateMultiplier()`
- [ ] Modify player.ts to use `getFireRateMultiplier()`
- [ ] Modify player.ts to use `getMaxHealthBonus()`
- [ ] Modify enemy files to use `getEnemySlowdown()`
- [ ] Add selection UI to rebirth overlay
- [ ] Test: Gain Dāna → more powerup drops
- [ ] Test: Gain Viriya → faster shooting
- [ ] Test: Gain Mettā → 4 HP instead of 3
- [ ] Test: Gain Upekkhā → enemies noticeably slower
- [ ] Commit: "Add Pāramī buff system"

---

## Phase 3: Kleshas (Debuffs)

**Goal:** Implement 4 basic debuffs for low-karma rebirths.

### Debuff Definitions

| Klesha | Effect | Implementation |
|--------|--------|----------------|
| **Lobha** (Greed) | -25% powerup drop rate | Reduce `dropChance` |
| **Dosa** (Hatred) | Enemies 10% faster | Increase enemy speed |
| **Māna** (Conceit) | -1 max health (min 1) | Reduce `config.player.health` |
| **Vicikicchā** (Doubt) | -15% fire rate | Increase `shootCooldown` |

### Implementation

```typescript
// src/systems/kleshas.ts (NEW)
interface KleshaState {
  lobha: number;
  dosa: number;
  mana: number;
  vicikiccha: number;
}

let state: KleshaState = { lobha: 0, dosa: 0, mana: 0, vicikiccha: 0 };

export function addKlesha(type: keyof KleshaState): void {
  state[type]++;
  events.emit('klesha:gained', { type });
}

export function getDropRatePenalty(): number {
  return Math.max(0.1, 1 - (state.lobha * 0.25));  // Min 10% drop rate
}

export function getEnemySpeedup(): number {
  return 1 + (state.dosa * 0.10);
}

export function getMaxHealthPenalty(): number {
  return state.mana;
}

export function getFireRatePenalty(): number {
  return 1 + (state.vicikiccha * 0.15);  // Higher cooldown = slower
}
```

### Checklist: Phase 3
- [ ] Create `src/systems/kleshas.ts`
- [ ] Add klesha definitions to config.json
- [ ] Modify drop rate calculation to include penalty
- [ ] Modify enemy speed calculation to include speedup
- [ ] Modify player health to include penalty
- [ ] Modify fire rate to include penalty
- [ ] Add random selection for debuffs on low-karma rebirth
- [ ] Test: Gain Lobha → fewer powerup drops
- [ ] Test: Gain Dosa → enemies faster
- [ ] Test: Gain Māna → 2 HP instead of 3
- [ ] Test: Gain Vicikicchā → slower shooting
- [ ] Test: Can't go below 1 HP
- [ ] Commit: "Add Klesha debuff system"

---

## Phase 4: HUD & Victory Updates

**Goal:** Visual feedback for accumulated buffs/debuffs.

### HUD Additions
- Pāramī icons (bottom left, green/gold glow)
- Klesha icons (bottom right, red/dark glow)
- Death counter (optional, top right)

### Victory Screen Updates
- Show total deaths
- Show Pāramī/Klesha counts
- Different ending text:
  - 0 deaths: "Perfect liberation"
  - 5+ Kleshas: "You have escaped... but at what cost?"

### Checklist: Phase 4
- [ ] Add Pāramī icons to HUD
- [ ] Add Klesha icons to HUD
- [ ] Update nirvana.ts victory screen
- [ ] Add death counter display
- [ ] Add conditional ending text
- [ ] Test: Icons appear when buffs/debuffs gained
- [ ] Test: Victory shows correct counts
- [ ] Commit: "Add roguelike HUD elements and victory updates"

---

## Phase 5: Balance & Polish

**Goal:** Tune numbers, add remaining buffs/debuffs, polish animations.

### Balance Tasks
- [ ] Playtest karma thresholds
- [ ] Tune buff/debuff strength percentages
- [ ] Test stacking limits (cap at 5 each?)
- [ ] Verify game is still winnable with max debuffs

### Remaining Pāramīs (6 more)
| Pāramī | Effect |
|--------|--------|
| Sīla (Virtue) | Start with Meditation shield |
| Khanti (Patience) | +20% powerup duration |
| Paññā (Wisdom) | +1 projectile damage |
| Sacca (Truthfulness) | See enemy health bars |
| Adhiṭṭhāna (Determination) | +1s respawn invincibility |
| Nekkhamma (Renunciation) | +0.5x karma multiplier |

### Remaining Kleshas (6 more)
| Klesha | Effect |
|--------|--------|
| Moha (Delusion) | -20% powerup duration |
| Thīna (Torpor) | -10% player speed |
| Uddhacca (Restlessness) | Longer screen shake |
| Ahirika (Shamelessness) | No respawn invincibility |
| Anottappa (Recklessness) | -1 projectile damage |
| Micchādiṭṭhi (Wrong View) | -0.25x karma multiplier |

### Polish Tasks
- [ ] Rebirth overlay animation (wheel spinning?)
- [ ] Sound effects for buff/debuff acquisition
- [ ] Visual feedback when buff/debuff activates
- [ ] Screen flash colors based on rebirth quality

---

## Session Planning

### Session 3: Title Screen
**Time estimate:** 30-60 min
**Prerequisites:** Title screen image uploaded
**Deliverable:** Clickable image-based title screen

### Session 4: Rebirth Loop
**Time estimate:** 60-90 min
**Prerequisites:** Phase 0 complete
**Deliverable:** Karma split, rebirth overlay, tier display

### Session 5: Buffs
**Time estimate:** 60-90 min
**Prerequisites:** Phase 1 complete
**Deliverable:** 4 working Pāramīs with selection UI

### Session 6: Debuffs
**Time estimate:** 60-90 min
**Prerequisites:** Phase 2 complete
**Deliverable:** 4 working Kleshas with random assignment

### Session 7: HUD & Victory
**Time estimate:** 30-60 min
**Prerequisites:** Phases 2-3 complete
**Deliverable:** Visual feedback, updated victory screen

### Session 8+: Balance & Expand
**Time estimate:** Ongoing
**Deliverable:** Remaining buffs/debuffs, polish

---

## Quick Reference: Current Game Values

```json
// config.json (key values)
{
  "player": {
    "health": 3,
    "speed": 300,
    "shootCooldown": 150
  },
  "boss": {
    "health": 50,
    "minionSpawnInterval": 2000
  },
  "powerup": {
    "dropChance": 0.15,
    "duration": 8000
  }
}
```

```json
// waves.json structure
{
  "waves": [
    {
      "enemies": { "hungryGhost": 6, "asura": 0, "deva": 0 },
      "spawnInterval": 0.67
    },
    // ... 8 waves total
  ],
  "timeBetweenWaves": 1.5
}
```

---

## Git History (Recent)

```
78114a6 Fix swarm instakill and enemy flee bugs
1c93150 Refactor: event-driven flee, centralized damage, shared helpers
fec05c2 Mara collision, i-frames, enemy flee on boss defeat
2669b5c Balance: reduce difficulty for smoother gameplay
7b7b3ac Update handoff doc - demo ready, polish phase next
2f9b230 Demo difficulty: harder gameplay for recording
```

---

## Notes for Next Session

1. **User will upload title screen image** — wait for this before starting Phase 0
2. **Button positions are data-driven** — adjust config.json to match image layout
3. **Keep text menu as fallback** — ESC from title screen returns to it
4. **Test on different screen sizes** — clickable regions need to align properly

---

## Questions to Resolve Later

- Cap on total buffs/debuffs? (Suggest 5 each)
- Does Mara scale with deaths? (Interesting but complex)
- New Game+ with carried buffs? (Scope creep — defer)
- Should buffs/debuffs be visible during gameplay? (Yes, HUD icons)
- Random selection or player choice for buffs? (Player choice feels better)

---

*Document created: End of Day Two bug fix session*
*Next milestone: Image-based title screen (Phase 0)*
