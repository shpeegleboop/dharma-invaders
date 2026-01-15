# Dharma Invaders — Day Two Handoff

**Status:** Core game complete, bug-free, ready for roguelike expansion
**Next Session:** Title screen with clickable image

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
- **Debug tools:** F1-F6 for testing

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

## Phase 0: Title Screen (IMPLEMENT NOW)

**Goal:** Add an intermediate "suffer" screen between main menu and game start.

**Image file:** `public/sprites/suffer_sharp.jpg` (already in place)

### Scene Flow

```
menu.ts ──(SPACE/click)──► titleScreen.ts ──(Join click)──► game.ts
                               │
                               ├──(X click)──► menu.ts
                               └──(ESC key)──► menu.ts
```

### Button Coordinates (from image)

**IMPORTANT:** Image may be larger than 800x600 game canvas. Verify dimensions and scale coordinates if needed.

Raw pixel coordinates from source image:

| Button | Top-Left (x, y) | Bottom-Right (x, y) | Width | Height |
|--------|-----------------|---------------------|-------|--------|
| **Join** | 397, 740 | 548, 795 | 151 | 55 |
| **X** | 635, 543 | 671, 574 | 36 | 31 |

### Implementation

#### Step 1: Check Image Dimensions
First, verify the image size. If larger than 800x600, either:
- Scale the image to fit (and adjust button coords proportionally)
- Or load at native size with `k.scale()` component

#### Step 2: Load Image in boot.ts
```typescript
// src/scenes/boot.ts - add to asset loading
k.loadSprite("sufferScreen", "/sprites/suffer_sharp.jpg");
```

#### Step 3: Create titleScreen.ts
```typescript
// src/scenes/titleScreen.ts (NEW)
import { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';

export function createTitleScreen(k: KAPLAYCtx) {
  // Add the suffer image
  k.add([
    k.sprite("sufferScreen"),
    k.pos(0, 0),
    // k.scale(0.75),  // Uncomment and adjust if image needs scaling
  ]);

  const buttons = config.titleScreen.buttons;

  // "Join" button - starts the game
  const joinButton = k.add([
    k.rect(buttons.join.width, buttons.join.height),
    k.pos(buttons.join.x, buttons.join.y),
    k.area(),
    k.opacity(0),  // Invisible
    "joinButton"
  ]);

  joinButton.onClick(() => {
    k.go("game");
  });

  // "X" button - returns to menu
  const closeButton = k.add([
    k.rect(buttons.close.width, buttons.close.height),
    k.pos(buttons.close.x, buttons.close.y),
    k.area(),
    k.opacity(0),  // Invisible
    "closeButton"
  ]);

  closeButton.onClick(() => {
    k.go("menu");
  });

  // ESC also returns to menu
  k.onKeyPress("escape", () => {
    k.go("menu");
  });
}
```

#### Step 4: Config Addition
```json
"titleScreen": {
  "imagePath": "/sprites/suffer_sharp.jpg",
  "buttons": {
    "join": { "x": 397, "y": 740, "width": 151, "height": 55 },
    "close": { "x": 635, "y": 543, "width": 36, "height": 31 }
  }
}
```

**Note:** These are raw image coordinates. If the image is scaled to fit 800x600, multiply all values by the scale factor.

#### Step 5: Register Scene in main.ts
```typescript
import { createTitleScreen } from './scenes/titleScreen';

// In scene registration section:
k.scene("titleScreen", () => createTitleScreen(k));
```

#### Step 6: Modify menu.ts
Change the SPACE/click handler to go to titleScreen instead of game:
```typescript
// Before:
k.onKeyPress("space", () => k.go("game"));

// After:
k.onKeyPress("space", () => k.go("titleScreen"));

// Same for click handler
```

### Audio Handling
- Menu music should CONTINUE playing on titleScreen (same track)
- Don't call `playMusic('menu')` again in titleScreen — let it persist
- Game music starts when `k.go("game")` is called (handled in game.ts)

### Checklist: Phase 0
- [ ] Verify image dimensions (check if scaling needed)
- [ ] Add sprite loading in boot.ts
- [ ] Create `src/scenes/titleScreen.ts`
- [ ] Add button positions to config.json
- [ ] Register scene in main.ts
- [ ] Modify menu.ts to go to titleScreen
- [ ] Test: SPACE on menu → suffer screen appears
- [ ] Test: Click "Join" → game starts
- [ ] Test: Click "X" → returns to menu
- [ ] Test: ESC → returns to menu
- [ ] Test: Menu music continues throughout
- [ ] Adjust button coordinates if needed
- [ ] Commit: "Add suffer title screen with clickable buttons"

### Troubleshooting

**Buttons not clickable in right place:**
- Image might be scaled — adjust coordinates proportionally
- Check browser console for errors
- Temporarily set button opacity to 0.5 to see where they are

**Music stops on scene change:**
- Verify game.ts/menu.ts aren't calling `stopMusic()` on scene exit
- Audio manager should only change tracks when explicitly told

**Image doesn't appear:**
- Check file path spelling (case-sensitive on some systems)
- Verify sprite loaded in boot.ts
- Check browser console for 404 errors

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

## Phase 1: Core Rebirth Loop

**Goal:** Split karma tracking and show rebirth overlay on death.

### Karma Split
Track karma separately:
- `karmaTotal` — lifetime score (display, bragging rights)
- `karmaThisLife` — resets on death, determines rebirth quality

```typescript
// src/stores/gameStore.ts
interface GameState {
  karmaTotal: number;
  karmaThisLife: number;
  deaths: number;
  deathsWithoutKill: number;
}
```

### Rebirth Overlay
On death (after respawn protection kicks in):
1. Dim screen overlay
2. Display: "The wheel turns..."
3. Show karma tier earned
4. Animate buff/debuff selection
5. "Press SPACE to continue"

### Config Addition

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

---

## Phase 2: Pāramīs (Buffs)

Implement 4 simple buffs first, expand later.

| Pāramī | Effect | Implementation |
|--------|--------|----------------|
| **Dāna** (Generosity) | +25% powerup drop rate | Modify `dropChance` in powerup.ts |
| **Viriya** (Diligence) | +15% fire rate | Modify `shootCooldown` in player.ts |
| **Mettā** (Loving-kindness) | +1 max health | Modify `config.player.health` |
| **Upekkhā** (Equanimity) | Enemies 10% slower | Modify `getEnemySpeedMultiplier()` |

```typescript
// src/systems/paramis.ts (NEW)
interface ParamiState {
  dana: number;
  viriya: number;
  metta: number;
  upekkha: number;
}

export function getDropRateMultiplier(): number {
  return 1 + (paramiState.dana * 0.25);
}

export function getFireRateMultiplier(): number {
  return 1 + (paramiState.viriya * 0.15);
}

export function getMaxHealthBonus(): number {
  return paramiState.metta;
}

export function getEnemySlowdown(): number {
  return 1 - (paramiState.upekkha * 0.10);
}
```

---

## Phase 3: Kleshas (Debuffs)

Implement 4 simple debuffs first.

| Klesha | Effect | Implementation |
|--------|--------|----------------|
| **Lobha** (Greed) | -25% powerup drop rate | Reduce `dropChance` |
| **Dosa** (Hatred) | Enemies 10% faster | Increase enemy speed |
| **Māna** (Conceit) | -1 max health (min 1) | Reduce `config.player.health` |
| **Vicikicchā** (Doubt) | -15% fire rate | Increase `shootCooldown` |

```typescript
// src/systems/kleshas.ts (NEW)
interface KleshaState {
  lobha: number;
  dosa: number;
  mana: number;
  vicikiccha: number;
}
```

---

## Phase 4: HUD & Victory Updates

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

---

## Phase 5: Balance & Polish

### Balance Tasks
- Playtest karma thresholds
- Tune buff/debuff strength percentages
- Test stacking limits (cap at 5 each?)
- Verify game is still winnable with max debuffs

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

1. **Image dimensions** — Check if suffer_sharp.jpg is larger than 800x600. If so, scale or adjust coordinates.
2. **Button positions are data-driven** — Adjust config.json to match actual clickable areas
3. **Keep text menu as fallback** — ESC from title screen returns to it
4. **Move hardcoded value to config** — `3000ms` respawn invincibility in player.ts should go to `config.roguelike.respawnInvincibility`

---

## Claude Code Prompt (Copy This)

```
Read DAY_TWO_HANDOFF.md and implement Phase 0 (title screen):

1. Image file: `public/sprites/suffer_sharp.jpg` (verify dimensions first)
2. Scene flow: menu.ts (SPACE/click) → titleScreen.ts → game.ts
3. Two clickable regions (coordinates may need adjustment based on image scaling):
   - "Join" button at x:397, y:740, width:151, height:55 → starts game
   - "X" button at x:635, y:543, width:36, height:31 → returns to menu  
4. ESC key also returns to menu
5. Menu music should continue playing (don't restart or stop)
6. Register new scene in main.ts

Create `src/scenes/titleScreen.ts`. Modify menu.ts to go to titleScreen instead of game. Add sprite loading in boot.ts. Add button positions to config.json.

Check image dimensions first — if larger than 800x600, either scale the sprite or adjust button coordinates proportionally.
```

---

*Document updated: Ready for Phase 0 implementation*
*Next milestone: Suffer title screen with Join/X buttons*
