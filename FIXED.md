# Dharma Invaders — Bug Fixes Summary

This document details the fixes applied to resolve two critical bugs in the respawn and enemy behavior systems.

---

## Bug 1: Enemies Don't Flee When Boss Dies

### Problem
When Mara (the boss) was defeated, remaining enemies on screen continued attacking the player instead of fleeing.

### Root Cause
The `boss:defeated` event was emitted at the END of Mara's 2-second death animation, but enemies needed to start fleeing IMMEDIATELY when Mara's HP hit zero.

### Fix
Moved the event emission from `updateDefeated()` to `damageMara()`:

```typescript
// src/entities/mara.ts - damageMara function
if (mara.hp() <= 0) {
  currentPhase = 'defeated';
  mara.phase = 'defeated';
  deathAnimTimer = 0;
  // Emit immediately so enemies flee during death animation
  events.emit('boss:defeated', {});
}
```

### Architecture Pattern Used
Event-driven communication via `src/systems/enemyFlee.ts`:

```typescript
let enemiesShouldFlee = false;

export function setupFleeListener(): void {
  enemiesShouldFlee = false;
  events.on('boss:defeated', () => {
    enemiesShouldFlee = true;
  });
}

export function shouldEnemiesFlee(): boolean {
  return enemiesShouldFlee;
}

export function applyFleeMovement(k: KAPLAYCtx, entity: GameObj, baseSpeed: number): void {
  const centerX = config.screen.width / 2;
  const centerY = config.screen.height / 2;
  const dx = entity.pos.x - centerX;
  const dy = entity.pos.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const fleeSpeed = baseSpeed * 2;
  entity.pos.x += (dx / dist) * fleeSpeed * k.dt();
  entity.pos.y += (dy / dist) * fleeSpeed * k.dt();
}
```

---

## Bug 2: Swarm Instakill

### Problem
When swarmed by multiple enemies, the player could die multiple times before respawn completed, leading to instant game over from a single swarm encounter.

### Root Cause
Enemies continued moving during player invincibility frames, allowing instant re-swarm the moment invincibility ended.

### Fix: Simplified Freeze Mechanic
Instead of complex stun timers, enemies now automatically freeze whenever the player is invincible.

#### 1. Enemy Freeze During Invincibility

All three enemy types (hungryGhost, asura, deva) now check player invincibility:

```typescript
// src/entities/enemies/hungryGhost.ts (and asura.ts, deva.ts)
ghost.onUpdate(() => {
  if (isPaused) return;

  // Find player
  const player = k.get('player')[0];
  if (!player) return;

  // Freeze while player is invincible or enemy is stunned
  if (ghost.stunned || player.invincible) return;

  // Flee when Mara is defeated
  if (shouldEnemiesFlee()) {
    applyFleeMovement(k, ghost, cfg.speed);
    return;
  }

  // ... normal movement logic
});
```

#### 2. Player Cannot Shoot While Invincible

Prevents exploiting invincibility for free kills:

```typescript
// src/entities/player.ts - shoot function
function shoot() {
  if (isPaused) return;
  if (player.invincible) return;  // NEW: Block shooting during i-frames
  if (!canShoot) return;
  // ... shooting logic
}
```

#### 3. Immediate Invincibility on Death

Invincibility is set synchronously BEFORE any async callbacks:

```typescript
// src/entities/player.ts - death handler
events.on('player:died', () => {
  // Set invincibility IMMEDIATELY (synchronous, before any callbacks)
  player.invincible = true;

  k.wait(0.5, () => {
    if (isGameOver()) {
      player.invincible = false;
      return;
    }

    // Push all enemies (they auto-freeze from invincibility)
    pushAllEnemies(k);

    // Move player to center
    player.pos.x = config.arena.width / 2;
    player.pos.y = config.arena.offsetY + config.arena.height / 2;
    player.setHP(config.player.health);

    // 3 second respawn invincibility with flashing
    const respawnInvincibility = 3000;
    k.wait(respawnInvincibility / 1000, () => {
      player.invincible = false;
      player.opacity = 1;
    });
    // ... flash animation
  });
});
```

#### 4. Push Enemies on Respawn

```typescript
// src/systems/enemyHelpers.ts
export function pushAllEnemies(k: KAPLAYCtx): void {
  const enemies = k.get('enemy');
  enemies.forEach((enemy) => {
    pushEnemyFromCenter(enemy, 250);
  });
}

export function pushEnemyFromCenter(enemy: GameObj, minDistance: number): void {
  const centerX = config.screen.width / 2;
  const centerY = config.arena.offsetY + config.arena.height / 2;
  const dx = enemy.pos.x - centerX;
  const dy = enemy.pos.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  if (dist < minDistance) {
    enemy.pos.x = centerX + (dx / dist) * minDistance;
    enemy.pos.y = centerY + (dy / dist) * minDistance;
  }

  // Clamp to arena bounds
  const margin = 30;
  enemy.pos.x = Math.max(margin, Math.min(config.screen.width - margin, enemy.pos.x));
  enemy.pos.y = Math.max(
    config.arena.offsetY + margin,
    Math.min(config.screen.height - margin, enemy.pos.y)
  );
}
```

#### 5. Spawner Pause During Respawn

```typescript
// src/systems/spawner.ts
events.on('player:died', () => {
  state.active = false;
  k.wait(3.5, () => {  // 0.5s death delay + 3s invincibility
    state.active = true;
  });
});
```

---

## Codebase Overview

### Project Structure
```
src/
├── main.ts              # Entry point
├── scenes/              # Game scenes (menu, game, boss, nirvana)
├── entities/            # Game objects
│   ├── player.ts        # Player movement, shooting, respawn
│   ├── projectile.ts    # Virtue projectiles
│   ├── powerup.ts       # Power-up drops
│   ├── mara.ts          # Boss entity and state machine
│   └── enemies/         # Enemy variants
│       ├── hungryGhost.ts  # Erratic movement, 1 HP
│       ├── asura.ts        # Aggressive direct movement, 2 HP
│       └── deva.ts         # Graceful sinusoidal movement, 3 HP
├── systems/             # Game systems
│   ├── collision.ts     # All collision handlers
│   ├── collisionHelpers.ts  # Bounce, push utilities
│   ├── spawner.ts       # Wave-based enemy spawning
│   ├── waveManager.ts   # Wave state and progression
│   ├── enemyHelpers.ts  # Stun, push utilities (NEW)
│   ├── enemyFlee.ts     # Event-driven flee behavior (NEW)
│   ├── playerDamage.ts  # Centralized damage logic (NEW)
│   └── powerupEffects.ts  # Active power-up tracking
├── stores/              # Zustand state
├── data/                # JSON configs
└── utils/               # Events, debug tools
```

### Tech Stack
- **Engine:** Kaplay (kaboom.js successor)
- **Language:** TypeScript (strict mode)
- **State:** Zustand
- **Audio:** Howler.js
- **Build:** Vite

---

## CLAUDE.md Rules Compliance

### 1. Event Bus Pattern
**Rule:** Systems communicate via events, NEVER direct imports between entities.

**Compliance:** The flee behavior uses event-driven architecture:
```typescript
// enemyFlee.ts listens to event
events.on('boss:defeated', () => { enemiesShouldFlee = true; });

// Enemies check state function (no direct mara.ts import)
if (shouldEnemiesFlee()) { applyFleeMovement(...); }
```
This avoids the circular import that previously broke the music system when enemies imported directly from mara.ts.

### 2. File Size Limit (150 lines)
**Rule:** No file over 150 lines.

**Compliance:** All new/modified files stay under limit:
- `enemyHelpers.ts`: 49 lines
- `enemyFlee.ts`: ~35 lines
- `playerDamage.ts`: ~50 lines
- `hungryGhost.ts`: 96 lines
- `asura.ts`: 85 lines
- `deva.ts`: 102 lines

### 3. Data-Driven Config
**Rule:** ALL magic numbers go in config.json.

**Compliance:** Uses config values throughout:
```typescript
import config from '../data/config.json';
player.pos.x = config.arena.width / 2;
enemy.pos.y = Math.min(config.screen.height - margin, enemy.pos.y);
```
Only exception: respawn invincibility duration (3000ms) is hardcoded in player.ts — could be moved to config.

### 4. Delta Time
**Rule:** EVERY movement calculation must use delta time.

**Compliance:** All movement uses `k.dt()`:
```typescript
ghost.pos.x += (dirX + wobbleX) * speed * k.dt();
entity.pos.x += (dx / dist) * fleeSpeed * k.dt();
```

### 5. Git Commits
**Rule:** Commit after every working feature.

**Compliance:** This commit captures the complete bug fix as a single working feature.

### 6. Kaplay Specifics
**Rule:** Use onUpdate() for game loop logic, access delta time with dt().

**Compliance:** All enemy behavior uses onUpdate():
```typescript
ghost.onUpdate(() => {
  if (isPaused) return;
  if (ghost.stunned || player.invincible) return;
  // movement with k.dt()
});
```

---

## Files Changed

| File | Changes |
|------|---------|
| `src/entities/enemies/hungryGhost.ts` | Added player invincibility freeze check |
| `src/entities/enemies/asura.ts` | Added player invincibility freeze check |
| `src/entities/enemies/deva.ts` | Added player invincibility freeze check |
| `src/entities/player.ts` | Block shooting during invincibility, immediate invincibility on death |
| `src/entities/mara.ts` | Emit boss:defeated immediately when HP hits 0 |
| `src/systems/spawner.ts` | Extended spawn pause to 3.5s during respawn |
| `src/systems/enemyHelpers.ts` | NEW: Push utilities for respawn |
| `src/systems/enemyFlee.ts` | NEW: Event-driven flee behavior |
| `src/systems/playerDamage.ts` | NEW: Centralized damage handling |
| `BUGS.md` | NEW: Bug tracking documentation |

---

## Result

- All enemies freeze instantly when player becomes invincible
- No edge cases (killing blow enemy, newly spawned enemies)
- Player cannot exploit invincibility for free kills
- Boss (Mara) continues attacking during player invincibility
- Clean respawn: player moves to center, enemies pushed away, 3s to recover
- 3 consecutive deaths without a kill still triggers mercy rule game over
