# Dharma Invaders — Roguelike Expansion Spec

*Transform the single-run game into a roguelike rebirth cycle.*

---

## Current State (Post-Bug Fixes)

The core game is complete and stable:
- ✅ 8 waves + Mara boss fight
- ✅ 5 virtue powerups
- ✅ Mercy rule (3 deaths without kills = game over)
- ✅ Enemy freeze during player invincibility
- ✅ Clean respawn: push enemies, 3s invincibility
- ✅ Pause menu, audio settings, about section, credits

**One config fix needed:** Move `3000ms` respawn invincibility from player.ts to config.json.

---

## Implementation Phases

### Phase 0: Title Screen Polish (Do First — Simple Win)

Replace the text-based menu with an image-based title screen with clickable regions.

#### Requirements
1. Press SPACE/click on current menu → loads title image
2. Title image displays with invisible clickable buttons over regions
3. ESC returns to text menu (fallback)
4. Clickable regions:
   - "Start" → begins game
   - "About" → about section
   - "Audio" → audio settings

#### Implementation

```typescript
// src/scenes/titleScreen.ts (NEW)
export function createTitleScreen(k: KAPLAYCtx) {
  // Load title image in boot.ts
  // k.loadSprite("titleScreen", "/sprites/title.png");

  const title = k.add([
    k.sprite("titleScreen"),
    k.pos(0, 0),
  ]);

  // Invisible clickable regions (adjust coords to match your image)
  const startButton = k.add([
    k.rect(200, 60),
    k.pos(300, 350),      // Position over "Start" in image
    k.area(),
    k.opacity(0),
    "startButton"
  ]);

  const aboutButton = k.add([
    k.rect(200, 60),
    k.pos(300, 420),      // Position over "About" in image
    k.area(),
    k.opacity(0),
    "aboutButton"
  ]);

  const audioButton = k.add([
    k.rect(200, 60),
    k.pos(300, 490),      // Position over "Audio" in image
    k.area(),
    k.opacity(0),
    "audioButton"
  ]);

  startButton.onClick(() => k.go("game"));
  aboutButton.onClick(() => k.go("about"));
  audioButton.onClick(() => showAudioSettings(k));

  // ESC returns to text menu (fallback)
  k.onKeyPress("escape", () => k.go("menu"));
}
```

#### Config Addition

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

#### Files to Create/Modify
| File | Action |
|------|--------|
| `src/scenes/titleScreen.ts` | NEW — image display + clickable regions |
| `src/scenes/menu.ts` | Modify — SPACE/click goes to titleScreen, not game |
| `src/scenes/boot.ts` | Add — load title image sprite |
| `src/data/config.json` | Add — button positions (data-driven) |
| `public/sprites/title.png` | ADD — your title screen image |

#### Testing
- [ ] SPACE/click on menu → title screen appears
- [ ] Click "Start" region → game begins
- [ ] Click "About" region → about section
- [ ] Click "Audio" region → audio settings
- [ ] ESC → returns to text menu
- [ ] Hover effects (optional polish)

---

### Phase 1: Core Rebirth Loop

#### 1.1 Karma Split
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

#### 1.2 Rebirth Screen Overlay
On death (after respawn protection kicks in):
1. Dim screen overlay
2. Display: "The wheel turns..."
3. Show karma tier earned
4. Animate buff/debuff selection
5. "Press SPACE to continue"

```typescript
// src/ui/rebirthOverlay.ts (NEW)
export function showRebirthOverlay(k: KAPLAYCtx, karmaThisLife: number) {
  const tier = getRebirthTier(karmaThisLife);
  // ... overlay UI
}
```

#### 1.3 Config Addition

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

### Phase 2: Pāramīs (Buffs)

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
  dana: number;      // Stack count
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
```

---

### Phase 3: Kleshas (Debuffs)

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

### Phase 4: HUD & Victory Updates

#### HUD Additions
- Pāramī icons (bottom left, green/gold)
- Klesha icons (bottom left, red/dark)
- Death counter (optional)

#### Victory Screen Updates
- Show Pāramī/Klesha counts
- Show death count
- Different text based on performance:
  - 0 deaths: "Perfect liberation"
  - 5+ Kleshas: "You have escaped... but at what cost?"

---

### Phase 5: Balance & Polish

1. Playtest karma thresholds
2. Tune buff/debuff strengths
3. Add remaining Pāramīs/Kleshas
4. Rebirth animation polish
5. Sound effects for buff/debuff acquisition

---

## Karma Thresholds (Tunable)

| Karma This Life | Rebirth Quality | Pāramīs | Kleshas |
|-----------------|-----------------|---------|---------|
| 0-99 | Wretched | 0 | 3 |
| 100-299 | Poor | 0 | 2 |
| 300-499 | Humble | 1 | 1 |
| 500-799 | Balanced | 1 | 0 |
| 800-1199 | Virtuous | 2 | 0 |
| 1200+ | Enlightened | 3 | 0 |

---

## Full Pāramī Pool (For Later)

| Pāramī | Effect | Stack |
|--------|--------|-------|
| **Dāna** (Generosity) | +25% powerup drop rate | Additive |
| **Sīla** (Virtue) | Start with Meditation shield | Refreshes |
| **Viriya** (Diligence) | +15% fire rate | Multiplicative |
| **Khanti** (Patience) | +20% powerup duration | Additive |
| **Paññā** (Wisdom) | +1 projectile damage | Additive |
| **Mettā** (Loving-kindness) | +1 max health | Additive |
| **Upekkhā** (Equanimity) | Enemies 10% slower | Multiplicative |
| **Sacca** (Truthfulness) | See enemy health bars | Binary |
| **Adhiṭṭhāna** (Determination) | +1s respawn invincibility | Additive |
| **Nekkhamma** (Renunciation) | +0.5x karma multiplier | Additive |

---

## Full Klesha Pool (For Later)

| Klesha | Effect | Stack |
|--------|--------|-------|
| **Lobha** (Greed) | -25% powerup drop rate | Additive |
| **Dosa** (Hatred) | Enemies 10% faster | Multiplicative |
| **Moha** (Delusion) | -20% powerup duration | Additive |
| **Māna** (Conceit) | -1 max health (min 1) | Additive |
| **Vicikicchā** (Doubt) | -15% fire rate | Multiplicative |
| **Thīna** (Torpor) | -10% player speed | Multiplicative |
| **Uddhacca** (Restlessness) | Longer screen shake | N/A |
| **Ahirika** (Shamelessness) | No respawn invincibility | Binary |
| **Anottappa** (Recklessness) | -1 projectile damage (min 1) | Additive |
| **Micchādiṭṭhi** (Wrong View) | -0.25x karma multiplier | Additive |

---

## Victory Conditions

### Standard Nirvana
- Defeat Mara
- "You have escaped the cycle of rebirth"
- Show: total karma, deaths, buffs/debuffs

### True Nirvana (Achievement)
- Defeat Mara with 0 deaths
- "Perfect liberation — no karma, no rebirth, no suffering"
- Special visual/audio

### Suffering Ending (Dark Achievement)
- Defeat Mara with 5+ Kleshas
- "You have escaped... but at what cost?"

---

## Questions to Resolve

- Cap on total buffs/debuffs? (Maybe 5 each)
- Does Mara scale with deaths? (Interesting but complex)
- New Game+ with carried buffs? (Scope creep — later)

---

## Thematic Notes

The roguelike system reinforces Buddhist themes:
- **Karma matters** — actions determine rebirth
- **Suffering is optional** — skillful play avoids Kleshas
- **Liberation is possible** — Nirvana ends the cycle
- **The middle way** — moderate karma = balanced rebirth

---

## Quick Reference: Implementation Order

| Phase | Focus | Complexity |
|-------|-------|------------|
| **0** | Title screen image + clickable buttons | Easy |
| **1** | Karma split, rebirth overlay | Medium |
| **2** | 4 basic Pāramīs | Medium |
| **3** | 4 basic Kleshas | Medium |
| **4** | HUD icons, victory updates | Easy |
| **5** | Balance, remaining buffs/debuffs | Ongoing |

**Start with Phase 0** — it's a quick visual win that makes the game feel more polished before diving into mechanics.
