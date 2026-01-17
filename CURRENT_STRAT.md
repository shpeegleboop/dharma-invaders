# Current Strategy — Phase 6+ Implementation

**Created:** 2026-01-16
**Updated:** 2026-01-16
**Goal:** Complete remaining buffs/debuffs, then add powerup stacking and health persistence

---

## Step 1: Phase 6 Pāramīs/Kleshas ✅ COMPLETE

Implemented 9 effects that work with current systems:

### Pāramīs (5)
| Pāramī | Effect | Integration |
|--------|--------|-------------|
| Sīla (Virtue) | Start each life with Meditation shield | `player.ts` respawn |
| Khanti (Patience) | +20% powerup duration per stack | `powerupEffects.ts` |
| Paññā (Wisdom) | +1 projectile damage per stack | `projectile.ts` |
| Adhiṭṭhāna (Determination) | +1 shield charge per stack | `powerupEffects.ts` |
| Nekkhamma (Renunciation) | +0.5x karma multiplier per stack | `karma.ts` |

### Kleshas (4)
| Klesha | Effect | Integration |
|--------|--------|-------------|
| Moha (Delusion) | -20% powerup duration per stack | `powerupEffects.ts` |
| Thīna (Torpor) | -10% player speed per stack | `player.ts` |
| Anottappa (Recklessness) | -1 projectile damage per stack (min 1) | `projectile.ts` |
| Micchādiṭṭhi (Wrong View) | -0.25x karma multiplier per stack | `karma.ts` |

### Deferred Effects
- **Sacca** (enemy health bars) → Phase 7 (new enemies)
- **Ahirika** (TBD) → Phase 7 (new enemies)
- **Uddhacca** (screenshake) → Phase 10 (polish)

### Test Criteria
- [x] Debug keys grant effects (1-5 paramis, 6-9 kleshas)
- [x] Effects stack correctly (multiple of same type)
- [x] Rebirth HUD displays new effects (two-line wrapping)
- [x] Multipliers apply in gameplay

---

## Step 2: Health Persistence Across Kalpas ✅ COMPLETE

**Goal:** Player does NOT return to full health when continuing to next kalpa.

### Implementation
- `gameStore.ts`: Added `savedHealth` field, `saveHealth()`, `consumeSavedHealth()`
- `game.ts`: Saves health on boss defeat, restores on new kalpa
- Health display syncs correctly via `setHealthDisplay()`

### Test Criteria
- [x] Beat Mara at 1 HP
- [x] Choose Continue (Bodhisattva mode)
- [x] Verify player starts Kalpa 2 at 1 HP

---

## Step 3: Add Paduma (Lotus) Healing Powerup ✅ COMPLETE

**Goal:** New powerup that restores health, only available Kalpa 2+.

### Implementation
- Separate drop system: `shouldDropPaduma()` + `createPaduma()`
- 5% drop chance (independent of regular 15% powerup drops)
- Floats upward with sinusoidal sway (unique visual)
- Heals instantly without replacing active powerup
- Debug key: V to heal

### Test Criteria
- [x] Kalpa 1: No Paduma drops
- [x] Kalpa 2+: Paduma drops at 5% rate
- [x] Collecting Paduma restores 1 HP (capped at max)
- [x] Does NOT replace current powerup

---

## Step 4: Powerup Stacking Foundation ← NEXT

**Goal:** Multiple powerups can be active simultaneously with stacking rules.

### Current State
```typescript
// powerupEffects.ts
type PowerupState = {
  active: VirtueType | null;  // Only ONE active
  timeRemaining: number;
};
```

### Target State
```typescript
type PowerupState = {
  active: Map<VirtueType, { stacks: number; timeRemaining: number }>;
};
```

### Stacking Rules (config.json)
```json
"stackRules": {
  "meditation": { "maxStacks": 1, "stacksWith": [] },
  "diligence": { "maxStacks": 3, "stacksWith": ["compassion", "wisdom", "patience"] },
  "compassion": { "maxStacks": 2, "stacksWith": ["diligence", "wisdom"] },
  "wisdom": { "maxStacks": 3, "stacksWith": ["diligence", "compassion"] },
  "patience": { "maxStacks": 2, "stacksWith": ["diligence"] },
  "paduma": { "maxStacks": 1, "stacksWith": ["all"] }
}
```

### Behavior
- Picking up same powerup: Add stack (up to max), refresh duration
- Picking up compatible powerup: Add to active set
- Picking up incompatible powerup: Replace (or reject?)
- Meditation: Always exclusive (shield mechanic)

### Test Criteria
- [ ] Pick up Diligence, then Compassion → both active
- [ ] Pick up Diligence ×3 → 3 stacks, rapid fire intensifies
- [ ] Pick up Meditation → clears other powerups
- [ ] HUD shows all active powerups with stack counts

---

## Step 5: Parami/Klesha Stack Caps

**Goal:** Limit how many of each buff/debuff can accumulate.

### Config Addition
```json
"rebirthEffects": {
  "maxParamiStacks": 5,
  "maxKleshaStacks": 5,
  "perEffectCaps": {
    "Metta": 3,
    "Mana": 2
  }
}
```

### Changes
- `addParami()` checks cap before adding
- `addKlesha()` checks cap before adding
- Per-effect caps override global cap

### Test Criteria
- [ ] Spam debug key for Mettā → caps at configured max
- [ ] Different effects can have different caps
- [ ] UI shows "(MAX)" indicator when capped

---

## Step 6: Balance Pass

**Goal:** Playtest and tune all numbers.

### Areas to Tune
- Karma thresholds for rebirth tiers
- Effect strength per stack (10%? 15%? 20%?)
- Powerup drop rates
- Paduma rarity
- Stack caps
- Fire rate floor (currently 0.2x)
- Kalpa scaling curves

### Method
- Play through Kalpas 1-5
- Note difficulty spikes
- Verify game is winnable with bad RNG (max debuffs)
- Verify game isn't trivial with good RNG (max buffs)

---

## Implementation Order Rationale

1. **Step 1 first** — Completes the parami/klesha system
2. **Step 2 before Step 3** — Creates the *need* for healing
3. **Step 3 after Step 2** — Provides the *solution* to health persistence
4. **Step 4 after Step 3** — Paduma needs stacking to work properly anyway
5. **Step 5 after Step 4** — Can't cap stacks until stacking works
6. **Step 6 last** — Balance requires all systems in place

---

*One step at a time. Test before proceeding.* 🪷
