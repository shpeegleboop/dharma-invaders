# Dharma Invaders — Phase 7: New Enemy Types

*Spec for implementing Nerayika, Tiracchana, and Manussa enemies.*

---

## Overview

Three new enemies that unlock in later kalpas. They **replace** a portion of base enemy spawns (variety, not volume). Spawn counts are config-driven for easy balancing.

---

## 1. Nerayika (Hell Being)

### Stats
| Property | Value |
|----------|-------|
| Shape | Orange hexagon |
| Size | Slightly larger than Asura (~32x32) |
| HP | 4 |
| Karma | 50 |
| Speed | Faster than Asura (200+) |
| Damage | 2 |

### Behavior
1. Spawns from screen edge
2. Turns to face player
3. **Hesitates for 1 second** (telegraph)
4. Charges in straight line toward player's position at spawn
5. If misses, exits screen (doesn't loop back)

### On Hit
- Deals 2 damage (shield absorbs normally: 2 charges if available, else 1 charge + 1 HP, else 2 HP)
- **Applies random Klesha regardless of shield** — the spiritual corruption bypasses physical protection

### Spawn Rules
| Kalpa | Wave | Count |
|-------|------|-------|
| 2+ | 4-6 | 1 |
| 2+ | 7 | 2 |
| 2+ | 8 | 3 |

---

## 2. Tiracchana (Animal)

### Stats
| Property | Value |
|----------|-------|
| Shape | Blue triangle |
| Size | Slightly smaller than Hungry Ghost (~20x20) |
| HP | 1 |
| Karma | 20 |
| Speed | Same as Asura (150) |
| Damage | 1 |

### Behavior
1. Spawns in **packs of 6** from same screen edge
2. Moves toward player with **exaggerated wobble** (more erratic than Hungry Ghost)
3. Pack maintains loose formation due to individual wobble variance
4. Standard tracking, no charge mechanic

### On Hit
- Deals 1 damage
- **Removes 1 stack of a random Parami** from player (if player has any)
  - Example: Metta 3 → Metta 2, or if only 1 stack, removes it entirely
- If no Paramis, just damage

### Spawn Rules
| Kalpa | Wave | Packs | Total |
|-------|------|-------|-------|
| 3+ | 3-5 | 1 | 6 |
| 3+ | 6-7 | 2 | 12 |
| 3+ | 8 | 3 | 18 |

---

## 3. Manussa (Human)

### Stats
| Property | Value |
|----------|-------|
| Shape | Bright green rectangle |
| Size | Taller than Deva, thinner than Asura (~20x40) |
| HP | 3 |
| Karma | -1000 (kill) / +1000 (escape) |
| Speed | Slow (60) |
| Damage | 0 (non-hostile) |

### Behavior
1. Spawns at **wave 1** of Kalpa 4+
2. Wanders slowly in erratic patterns
3. **Stays within play area bounds** — bounces off edges, doesn't exit
4. Persists through waves 1-8
5. At **end of wave 8** (before boss):
   - Emits chat bubble: "Bhavatu Sabba Mangalam" (May all beings be happy)
     - Style: Big white text with shadow, above entity, ~2 seconds
   - Despawns
   - Grants player **+1000 karma**

### On Collision (Player)
- **No damage**
- Bumps slightly away from player (gentle push)

### If Killed
All of these happen:
1. `karmaThisLife` set to **0**
2. **Remove 1 random Parami** (if any)
3. **Add 1 random Klesha**
4. **All active timed powerups reduced to 1 second** (effectively ends them)
   - Shield charges are NOT affected

### Spawn Rules
| Kalpa | Wave | Count |
|-------|------|-------|
| 4+ | 1 | 1 |

One at a time. Same Human persists until wave 8 escape or death.
**Persists across player death/respawn** — if player dies, same Manussa continues wandering.

---

## Config Structure

Add to `config.json`:

```json
"newEnemies": {
  "nerayika": {
    "size": { "width": 32, "height": 32 },
    "color": "#FF4500",
    "health": 4,
    "speed": 200,
    "chargeSpeed": 350,
    "hesitateTime": 1000,
    "karmaValue": 50,
    "damage": 2,
    "spawns": {
      "minKalpa": 2,
      "waves": {
        "4": 1, "5": 1, "6": 1,
        "7": 2,
        "8": 3
      }
    }
  },
  "tiracchana": {
    "size": { "width": 20, "height": 20 },
    "color": "#4169E1",
    "health": 1,
    "speed": 150,
    "wobbleIntensity": 2.0,
    "karmaValue": 20,
    "damage": 1,
    "packSize": 6,
    "spawns": {
      "minKalpa": 3,
      "waves": {
        "3": 1, "4": 1, "5": 1,
        "6": 2, "7": 2,
        "8": 3
      }
    }
  },
  "manussa": {
    "size": { "width": 20, "height": 40 },
    "color": "#00FF00",
    "health": 3,
    "speed": 60,
    "karmaValue": -1000,
    "escapeKarma": 1000,
    "damage": 0,
    "escapeMessage": "Bhavatu Sabba Mangalam",
    "spawns": {
      "minKalpa": 4,
      "wave": 1,
      "count": 1
    }
  }
}
```

---

## Implementation Steps

### Step 1: Add Config
- Add `newEnemies` section to `config.json`
- All stats, spawn rules in one place for easy tuning

### Step 2: Create Entity Files

**`src/entities/enemies/nerayika.ts`**
```typescript
// Hexagon shape using Kaplay polygon or custom draw
// State machine: spawning → hesitating → charging → exiting
// On spawn: face player, start hesitate timer
// After hesitate: lock direction, charge at chargeSpeed
// On hit: emit 'player:hit' with damage 2, emit 'player:applyKlesha'
```

**`src/entities/enemies/tiracchana.ts`**
```typescript
// Triangle shape
// Movement: toward player + sine wave wobble (intensity from config)
// Spawner calls this 6 times per pack from same edge
// On hit: emit 'player:hit', emit 'player:removeParami'
```

**`src/entities/enemies/manussa.ts`**
```typescript
// Rectangle shape (tall/thin)
// Movement: random wander, clamp to arena bounds
// On collision with player: gentle push, no damage
// Track spawn wave, listen for 'wave:complete' to check wave 8
// On wave 8 complete: show chat bubble, despawn, emit karma grant
// On death: emit 'human:killed' event with all penalties
```

### Step 3: New Events

Add to event types:
```typescript
'player:applyKlesha'     // Nerayika hit effect
'player:removeParami'    // Tiracchana hit effect  
'human:killed'           // Triggers karma wipe + penalties
'human:escaped'          // Triggers +1000 karma
```

### Step 4: Update Spawner

**`src/systems/spawner.ts`**
```typescript
function spawnWaveEnemies(wave: number) {
  const kalpa = getCycle();
  
  // Existing base spawns...
  
  // New enemy spawns (replacement approach - reduce base counts elsewhere if needed)
  if (kalpa >= 2) {
    const nerayikaCount = config.newEnemies.nerayika.spawns.waves[wave] || 0;
    for (let i = 0; i < nerayikaCount; i++) {
      spawnNerayika();
    }
  }
  
  if (kalpa >= 3) {
    const tiracchanaPackCount = config.newEnemies.tiracchana.spawns.waves[wave] || 0;
    for (let i = 0; i < tiracchanaPackCount; i++) {
      spawnTiracchanapack(); // Spawns 6 from same edge
    }
  }
  
  if (kalpa >= 4 && wave === 1) {
    spawnManussa();
  }
}
```

### Step 5: Handle Special Mechanics

**In `src/systems/collision.ts` or new `src/systems/enemyEffects.ts`:**

```typescript
events.on('player:applyKlesha', () => {
  const randomKlesha = getRandomKlesha();
  addKlesha(randomKlesha);
  // Visual feedback
});

events.on('player:removeParami', () => {
  const paramis = getParamis();
  if (paramis.length > 0) {
    const randomIndex = Math.floor(Math.random() * paramis.length);
    removeParami(paramis[randomIndex]);
    // Visual feedback
  }
});

events.on('human:killed', () => {
  setKarmaThisLife(0);
  // Remove 1 parami
  // Add 1 klesha
  // Reduce all timed powerups to 1s
});

events.on('human:escaped', () => {
  addKarma(config.newEnemies.manussa.escapeKarma);
  // Show "Bhavatu Sabba Mangalam" chat bubble
});
```

### Step 6: Update gameStore

Add functions:
```typescript
export function removeParami(type: string): void
export function setKarmaThisLife(amount: number): void
```

### Step 7: Update About/Bestiary

Add new enemies to the About screen bestiary tab.

---

## Testing Checklist

### Nerayika
- [ ] Spawns only Kalpa 2+
- [ ] Correct count per wave (1/1/1/2/3)
- [ ] Hesitates 1s before charging
- [ ] Charges in straight line (doesn't track)
- [ ] Deals 2 damage
- [ ] Applies Klesha even through shield
- [ ] Gives 50 karma on death

### Tiracchana
- [ ] Spawns only Kalpa 3+
- [ ] Correct pack count per wave
- [ ] 6 per pack from same edge
- [ ] Wobble is more intense than Hungry Ghost
- [ ] Removes Parami on hit (if player has any)
- [ ] Gives 20 karma each

### Manussa
- [ ] Spawns wave 1 of Kalpa 4+
- [ ] Wanders without leaving arena
- [ ] Persists through waves 1-8
- [ ] Collision bumps, no damage
- [ ] On kill: karma=0, -1 parami, +1 klesha, powerups end
- [ ] On wave 8 end: chat bubble, +1000 karma, despawn
- [ ] Does NOT spawn during boss fight

---

## Debug Keys

Consider adding:
- `Z`: Spawn Nerayika (for testing)
- `X`: Spawn Tiracchana pack
- `C`: Spawn Manussa

---

## Visual Reference

```
Nerayika (Hell)     Tiracchana (Animal)     Manussa (Human)
    ⬡                     ▲                      ▮
 Orange               Blue                   Green
 32x32               20x20                  20x40
```

---

## Thematic Notes

- **Nerayika** — Hell beings suffer and cause suffering. The Klesha they inflict represents spiritual contamination from violence.
- **Tiracchana** — Animals act on instinct, not malice. They strip away your cultivated virtues (Paramis) through ignorant contact.
- **Manussa** — Humans are precious. The Buddhist precept against killing is strongest here. Murdering an innocent human destroys your spiritual progress entirely.

---

*Feed this to Claude Code for implementation.* 🪷
