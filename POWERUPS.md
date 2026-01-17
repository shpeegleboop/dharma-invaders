# Dharma Invaders — Powerup Stacking System

*Spec for Phase 6 Step 4. Source of truth for powerup behavior.*

---

## Overview

Powerups can run simultaneously with independent timers. Each powerup tracks its own stack count and remaining time. Meditation (shield) operates on a separate charge-based system.

---

## Data Structure

```typescript
// OLD (single powerup)
type PowerupState = {
  active: VirtueType | null;
  timeRemaining: number;
};

// NEW (multiple simultaneous)
type PowerupStack = {
  stacks: number;
  timeRemaining: number;
};

type PowerupState = {
  active: Map<VirtueType, PowerupStack>;
  // Meditation handled separately in existing shield system
};
```

---

## Powerup Types

### Timed Powerups (use stacking system)

| Powerup | Max Stacks | Effect Scaling | Max Time | Notes |
|---------|------------|----------------|----------|-------|
| **Diligence** | 5 | Additive (faster per stack) | 40s | Fire rate increases with each stack |
| **Patience** | 5 | Additive (slower per stack) | 40s | Enemy slow increases with each stack |
| **Compassion** | 1 | Binary (on/off) | 40s | Spread shot active or not |
| **Wisdom** | 1 | Binary (on/off) | 40s | Piercing active or not |

### Special Powerups (separate systems)

| Powerup | System | Notes |
|---------|--------|-------|
| **Meditation** | Shield charges | Not timer-based. Lost only by taking hits. Stacks with Sila/Adhitthana. |
| **Paduma** | Instant effect | Heal 1 HP on pickup. No duration, no stacking. Kalpa 2+ only. |

---

## Pickup Behavior

### Same Powerup Pickup

1. If stacks < maxStacks: increment stacks
2. Add base duration to timeRemaining
3. Cap timeRemaining at maxTime (maxStacks × baseDuration)

**Example — Diligence (8s base):**
```
State: 0 stacks, 0s
Pick up Diligence → 1 stack, 8s
Pick up Diligence → 2 stacks, 16s
Pick up Diligence → 3 stacks, 24s
Pick up Diligence → 4 stacks, 32s
Pick up Diligence → 5 stacks, 40s (max stacks reached)
Pick up Diligence → 5 stacks, 40s (time capped, stacks capped)
```

**Example — Compassion (8s base):**
```
State: 0 stacks, 0s
Pick up Compassion → 1 stack, 8s (max effect stacks)
Pick up Compassion → 1 stack, 16s (time added, stacks capped)
Pick up Compassion → 1 stack, 24s
...up to 40s max
```

### Different Powerup Pickup

Add new entry to map with 1 stack and base duration. Does NOT affect other active powerups.

**Example:**
```
State: Diligence 3 stacks 20s, Compassion 1 stack 5s
Pick up Wisdom → Diligence 3/20s, Compassion 1/5s, Wisdom 1/8s
Pick up Diligence → Diligence 4/28s, Compassion 1/5s, Wisdom 1/8s
```

### Meditation Pickup

Adds shield charge via existing system. Does not interact with timed powerups.

### Paduma Pickup

Instant +1 HP (if below max). No state change to powerup system.

---

## Timer Behavior

- Each powerup timer decrements independently
- When timer reaches 0, that powerup is removed entirely (all stacks gone)
- Other active powerups unaffected

**Example:**
```
Frame 0: Diligence 3/10s, Compassion 1/5s
Frame 5s: Diligence 3/5s, Compassion 1/0s → Compassion removed
Frame 5s: Diligence 3/5s (still active)
Frame 10s: Diligence 0s → removed
```

---

## Effect Calculations

### Diligence (Fire Rate)

```typescript
function getFireRateMultiplier(): number {
  const stacks = getStacks('diligence');
  if (stacks === 0) return 1.0;
  
  // Each stack = 20% faster, up to 2x at 5 stacks
  // Combined with Viriya/Vicikiccha rebirth effects
  const powerupBonus = stacks * 0.20;
  return 1.0 + powerupBonus; // 1.2x, 1.4x, 1.6x, 1.8x, 2.0x
}
```

### Patience (Enemy Slow)

```typescript
function getEnemySlowMultiplier(): number {
  const stacks = getStacks('patience');
  if (stacks === 0) return 1.0;
  
  // Each stack = 10% slower, up to 50% at 5 stacks
  // Combined with Upekkha/Dosa rebirth effects
  const slowAmount = stacks * 0.10;
  return 1.0 - slowAmount; // 0.9x, 0.8x, 0.7x, 0.6x, 0.5x
}
```

### Compassion (Spread Shot)

```typescript
function hasSpreadShot(): boolean {
  return getStacks('compassion') > 0;
}
```

### Wisdom (Piercing)

```typescript
function hasPiercing(): boolean {
  return getStacks('wisdom') > 0;
}
```

---

## Config Values

Add to `config.json`:

```json
"powerupStacking": {
  "diligence": {
    "maxStacks": 5,
    "baseDuration": 8,
    "effectType": "additive"
  },
  "patience": {
    "maxStacks": 5,
    "baseDuration": 8,
    "effectType": "additive"
  },
  "compassion": {
    "maxStacks": 1,
    "maxTimeStacks": 5,
    "baseDuration": 8,
    "effectType": "binary"
  },
  "wisdom": {
    "maxStacks": 1,
    "maxTimeStacks": 5,
    "baseDuration": 8,
    "effectType": "binary"
  }
}
```

---

## HUD Display

Show active powerups in HUD area with:
- Icon (colored dot for now, proper icons later)
- Timer (seconds remaining)
- Stack count (for Diligence/Patience only, shown as ×N)

**Layout:**
```
[●] 12s        ← Compassion (no stack count, binary)
[●] 8s ×3      ← Diligence (show stacks)
[●] 5s ×2      ← Patience (show stacks)
[●] 15s        ← Wisdom (no stack count, binary)
[🛡] ×2        ← Shield (charges, no timer)
```

Space for up to 4 timed powerups + shield. Compact horizontal or vertical layout based on HUD design.

---

## Implementation Steps

### Step 4a: Data Structure Refactor
- Change `PowerupState` to Map-based structure
- Update `getActivePowerup()` → `getActivePowerups()` / `getStacks(type)`
- Update `hasActivePowerup(type)` to check map
- Ensure single-powerup behavior still works
- **Commit**

### Step 4b: Stacking Logic
- `activatePowerup(type)`: add to map or increment existing
- Implement time addition (same type)
- Implement fresh entry (different type)
- Respect max stacks and max time per type
- **Commit**

### Step 4c: Effect Multipliers
- `getFireRateMultiplier()`: scale with Diligence stacks
- `getEnemySlowMultiplier()`: scale with Patience stacks
- `hasSpreadShot()`: check Compassion > 0
- `hasPiercing()`: check Wisdom > 0
- Integrate with existing Parami/Klesha multipliers
- **Commit**

### Step 4d: HUD Update
- Render all active powerups from map
- Show timer for each
- Show stack count for Diligence/Patience
- Shield charges shown separately (existing)
- **Commit**

### Step 4e: Integration Test
- Debug keys to grant specific powerups
- Verify timer addition works
- Verify stack caps enforced
- Verify time caps enforced
- Verify independent expiration
- **Commit**

---

## Debug Keys

Extend existing debug system:

| Key | Action |
|-----|--------|
| F4 | Cycle through powerups (existing) |
| (new) | Grant specific powerup for testing stacks |

Or use F4 multiple times to stack same powerup.

---

## Edge Cases

1. **Max stacks + max time**: Pickup does nothing (no feedback needed, player is maxed)
2. **Pickup during invincibility**: Should still work (powerups aren't damage)
3. **Death with active powerups**: All timed powerups cleared on death (shield handled separately via Sila)
4. **Pause**: Timers should pause when game is paused

---

*Feed this to Claude Code for implementation.* 🪷
