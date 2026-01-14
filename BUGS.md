# Dharma Invaders — Bug Tracking

---

## Bug 1: Enemies Don't Flee When Boss Dies — FIXED ✅

**Problem:** `boss:defeated` event was emitted after 2s death animation, but enemies needed to flee immediately.

**Fix:** Moved `events.emit('boss:defeated', {})` from `updateDefeated()` to `damageMara()` when HP hits 0.

---

## Bug 2: Swarm Instakill — FIXED ✅

### Symptom
When swarmed by many enemies, player could die multiple times before respawn completes.

### Root Cause
Enemies continued moving during player invincibility, allowing instant re-swarm after respawn.

### Fix Applied (Simplified Approach)

1. **Enemies freeze while player is invincible** (all enemy files)
   ```typescript
   // In each enemy's onUpdate:
   if (enemy.stunned || player.invincible) return;
   ```
   - All enemies (hungryGhost, asura, deva) auto-freeze when player.invincible is true
   - Boss (Mara) is NOT affected - continues attacking

2. **Player cannot shoot while invincible** (player.ts:37)
   ```typescript
   if (player.invincible) return;
   ```
   - Prevents exploiting invincibility for free kills

3. **Immediate invincibility on death** (player.ts:72-73)
   ```typescript
   player.invincible = true; // Synchronous, before any callbacks
   ```

4. **Push enemies on respawn** (enemyHelpers.ts)
   - Push enemies 250px from arena center
   - No manual stun needed - they auto-freeze from invincibility

5. **Extended spawner pause** (spawner.ts:43-47)
   - Pause spawner for 3.5s during respawn

### Result
- All enemies freeze the instant player becomes invincible
- No edge cases (killing blow enemy, newly spawned enemies)
- Player respawns safely, enemies resume when invincibility ends
- 3 consecutive deaths without a kill still triggers game over

---

## Testing Commands

- **F3** — Skip to boss (for testing flee)
- **F5** — Toggle invincibility (for testing without dying)
- **Let swarm kill you** — Watch console for debug output
