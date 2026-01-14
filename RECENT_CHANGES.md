# Dharma Invaders - Recent Changes

*Session: January 2026*

---

## Summary

This session focused on **balance tuning** and **Mara boss polish**. The game is now more forgiving with proper invincibility frames, boss collision mechanics, and cinematic enemy flee behavior when Mara is defeated.

---

## Changes Made

### 1. Difficulty Rebalancing

**Enemy counts reduced to 2x original** (was 3x):
```json
// waves.json - Wave 8 example
{ "type": "hungryGhost", "count": 20 },  // was 30
{ "type": "asura", "count": 16 },        // was 24
{ "type": "deva", "count": 10 }          // was 15
```

**Mara boss tuning:**
```json
// config.json
"boss": {
  "health": 50,              // was 400 → 200 → 50
  "minionSpawnInterval": 2000 // was 1000 (2s instead of 1s)
}
```

---

### 2. Player-Boss Collision

Player can no longer phase through Mara. Contact deals 2 damage and pushes player away.

**collision.ts** - New collision handler:
```typescript
k.onCollide('player', 'boss', (player, boss) => {
  if (getMaraPhase() === 'entering' || getMaraPhase() === 'defeated') {
    pushPlayerAwayFromBoss(player, boss);
    return;
  }

  if (player.invincible) {
    pushPlayerAwayFromBoss(player, boss);
    return;
  }

  // Meditation shield check...

  player.hurt(2);  // Boss contact = 2 damage
  flashPlayerRed(k, player);
  pushPlayerAwayFromBoss(player, boss);

  if (remainingHealth <= 0) {
    events.emit('player:died', {});
  } else {
    grantIFrames(k, player);
  }
});
```

**collisionHelpers.ts** - Push function:
```typescript
export function pushPlayerAwayFromBoss(player: GameObj, boss: GameObj): void {
  const dx = player.pos.x - boss.pos.x;
  const dy = player.pos.y - boss.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const pushDistance = 100;
  player.pos.x += (dx / dist) * pushDistance;
  player.pos.y += (dy / dist) * pushDistance;
}
```

---

### 3. Invincibility Frames (I-Frames)

Previously, multiple enemies hitting in the same frame could instakill. Now 0.5s of invincibility is granted after any damage.

**collisionHelpers.ts:**
```typescript
export function grantIFrames(k: KAPLAYCtx, player: GameObj): void {
  player.invincible = true;
  player.opacity = 0.5;  // Visual feedback

  k.wait(0.5, () => {
    if (player.exists()) {
      player.invincible = false;
      player.opacity = 1;
    }
  });
}
```

Applied in all three damage handlers:
- Enemy collision
- Boss collision
- Boss projectile hit

---

### 4. Fixed Player Stuck-Red Bug

Race condition: if hit twice quickly, the "original color" captured was already red.

**Before (buggy):**
```typescript
const originalColor = player.color.clone();  // Could be red!
player.color = k.rgb(255, 0, 0);
k.wait(0.15, () => player.color = originalColor);
```

**After (fixed):**
```typescript
player.color = k.rgb(255, 0, 0);
k.wait(0.15, () => {
  player.color = k.rgb(0, 128, 255);  // Always restore to blue
});
```

---

### 5. Enemies Flee When Mara Defeated

When Mara hits 0 HP, all remaining enemies flee from screen center at 2x speed.

**hungryGhost.ts / asura.ts / deva.ts:**
```typescript
ghost.onUpdate(() => {
  // Check boss object directly (avoids circular import)
  const boss = k.get('boss')[0];
  if (boss && boss.phase === 'defeated') {
    const centerX = config.screen.width / 2;
    const centerY = config.screen.height / 2;
    const dx = ghost.pos.x - centerX;
    const dy = ghost.pos.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const fleeSpeed = cfg.speed * 2;
    ghost.pos.x += (dx / dist) * fleeSpeed * k.dt();
    ghost.pos.y += (dy / dist) * fleeSpeed * k.dt();
    return;
  }
  // ... normal movement logic
});
```

**Why not import `getMaraPhase()`?**
Circular dependency: `mara → maraCombat → hungryGhost → mara`
Solution: Check `k.get('boss')[0].phase` directly.

---

## Current Game State

### Config Values (config.json)
| Setting | Value |
|---------|-------|
| Player HP | 3 |
| Player speed | 300 |
| Mara HP | 50 |
| Mara phase 2 | 70% HP |
| Mara phase 3 | 30% HP |
| Minion spawn | every 2s |
| I-frame duration | 0.5s |

### Wave Scaling
- Enemy counts: 2x original
- Speed: +10% per wave (wave 8 = 1.8x base speed)
- Time between waves: 1.5s

### Debug Keys
- **F1:** Toggle hitboxes
- **F2:** Skip to wave 8
- **F3:** Skip to boss
- **F4:** Give all powerups
- **F5:** Toggle invincibility

---

## Git History (Recent)

```
fec05c2 Mara collision, i-frames, enemy flee on boss defeat
2669b5c Balance: reduce difficulty for smoother gameplay
7b7b3ac Update handoff doc - demo ready, polish phase next
2f9b230 Demo difficulty: harder gameplay for recording
```

---

## Architecture Notes

### Event Bus Pattern
All cross-system communication uses events:
```typescript
events.emit('player:hit', { damage: 2, remainingHealth });
events.emit('boss:defeated', {});
```

### Delta Time
All movement uses `k.dt()`:
```typescript
ghost.pos.x += dirX * speed * k.dt();
```

### File Size Limit
No file exceeds 150 lines. Split when growing.

---

## Next Steps

- Screen shake on damage/phase change
- Particle effects (death puffs, powerup sparkles)
- Hit flash on enemies
- Audio polish
- Art replacement (sprites for rectangles)
