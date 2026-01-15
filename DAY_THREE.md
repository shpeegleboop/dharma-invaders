# Day 3 — Roguelike Rebirth System Complete

**Date:** 2026-01-15
**Focus:** Phases 0-4 of roguelike expansion

---

## What We Built

### Phase 0: Title Screen ✅
- Created `src/scenes/titleScreen.ts` with scaled suffer_sharp.jpg
- Clickable "Join" button and "X" close button overlaid on image
- Config-driven positioning in `config.json`

### Phase 1: Karma Split + Rebirth Overlay ✅
- Created `src/stores/gameStore.ts` with vanilla TypeScript state (NOT Zustand—requires React)
- Split karma tracking: `karmaTotal` (persists) + `karmaThisLife` (resets on death)
- Created `src/systems/rebirthTiers.ts` for tier calculation based on karma thresholds
- Created `src/ui/rebirthOverlay.ts` showing tier, karma earned, and granted buffs/debuffs
- Press SPACE to continue after death

### Phase 2: Parami (Buff) Effects ✅
- Created `src/systems/rebirthEffects.ts` with multiplier functions
- **Dana** → +25% powerup drop rate per stack
- **Viriya** → -15% shoot cooldown per stack
- **Metta** → +1 max health per stack
- **Upekkha** → -10% enemy speed per stack

### Phase 3: Klesha (Debuff) Effects ✅
- **Lobha** → -25% powerup drop rate per stack
- **Vicikiccha** → +15% shoot cooldown per stack
- **Mana** → -1 max health per stack
- **Dosa** → +10% enemy speed per stack

### Phase 4: Bottom HUD ✅
- Expanded canvas from 800x600 to 800x650
- Created `src/ui/rebirthHud.ts` showing active buffs/debuffs
- Paramis shown in green (left side), kleshas in red (right side)
- Stack counts displayed (e.g., "Dana x2")

### About Screen Update ✅
- Added Rebirth tab (press 4) explaining all paramis and kleshas
- Increased font sizes for readability

---

## Bug Fixes

| Bug | Cause | Fix |
|-----|-------|-----|
| Enemies spawn during rebirth overlay | Spawner didn't check overlay state | Added `isRebirthOverlayActive()` check |
| Mercy rule broken (infinite deaths) | `resetLife()` was resetting counter | Changed to "3 deaths with 0 karma this life = game over" |
| Swarms during respawn invincibility | Spawner didn't check player.invincible | Added `player?.invincible` check |
| Zustand "Could not resolve react" | Zustand requires React | Replaced with vanilla module-level state |

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/stores/gameStore.ts` | ~65 | Roguelike state management |
| `src/systems/rebirthTiers.ts` | ~35 | Karma tier calculation |
| `src/systems/rebirthEffects.ts` | ~65 | Buff/debuff multiplier functions |
| `src/ui/rebirthOverlay.ts` | 147 | Death screen with tier/buffs |
| `src/ui/rebirthHud.ts` | 83 | Bottom bar buff/debuff display |
| `src/scenes/titleScreen.ts` | ~75 | Title screen with suffer image |

---

## Updated Line Count Audit

Files over 150-line limit:

| File | Lines | Change | Action |
|------|-------|--------|--------|
| `src/scenes/about.ts` | **196** | +56 (Rebirth tab) | Consider splitting tabs into separate files |
| `src/entities/player.ts` | **168** | +18 (rebirth integration) | Could extract death handling |
| `src/entities/mara.ts` | 164 | unchanged | Skip (only 14 over) |
| `src/scenes/nirvana.ts` | 155 | unchanged | Skip (only 5 over) |

### Recommendation
- **about.ts** is the main concern at 196 lines
- Could extract each tab's content into `src/ui/aboutTabs/controls.ts`, `rebirth.ts`, etc.
- Not urgent—file is purely UI text, no complex logic

---

## Dependency Status

| Package | Status | Notes |
|---------|--------|-------|
| kaplay | ✅ Used | Game engine |
| howler | ✅ Used | Audio system |
| zustand | ❌ Removed | Replaced with vanilla state |

---

## Config Changes

```json
{
  "screen": { "height": 650 },  // Was 600
  "bottomHud": { "height": 50, "offsetY": 600 },  // NEW
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
}
```

---

## Remaining Cleanup (Low Priority)

1. **Console.logs in audio.ts** — Still deferred, useful for debugging
2. **about.ts at 196 lines** — Could split if adding more content
3. **player.ts at 168 lines** — Could extract death/respawn logic

---

## What's Next: Phase 5+

The roguelike core is complete. Future work could include:

- [ ] Balance tuning (karma thresholds, buff/debuff strengths)
- [ ] Additional paramis/kleshas (Sīla, Nekkhamma, Paññā, etc.)
- [ ] Visual polish (parami/klesha icons, particle effects)
- [ ] Persistent progression (save best karma across sessions)
- [ ] Meta-upgrades (spend accumulated karma for permanent bonuses)

---

*Roguelike rebirth system is fully functional. The game loop is: play → die → see tier → get buffs/debuffs → respawn → repeat until victory or mercy rule.*
