// Enemy helper functions for stun and push effects
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

// Stun an enemy for a duration
export function stunEnemy(k: KAPLAYCtx, enemy: GameObj, duration: number): void {
  enemy.stunned = true;
  enemy.opacity = 0.5;

  k.wait(duration, () => {
    if (enemy.exists()) {
      enemy.stunned = false;
      enemy.opacity = 1;
    }
  });
}

// Push enemy away from arena center to minimum distance
export function pushEnemyFromCenter(enemy: GameObj, minDistance: number): void {
  const centerX = config.screen.width / 2;
  const centerY = config.arena.offsetY + config.arena.height / 2;

  const dx = enemy.pos.x - centerX;
  const dy = enemy.pos.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  if (dist < minDistance) {
    // Push to minimum distance
    enemy.pos.x = centerX + (dx / dist) * minDistance;
    enemy.pos.y = centerY + (dy / dist) * minDistance;
  }

  // Clamp to arena bounds
  const margin = config.enemies.spawnMargin;
  enemy.pos.x = Math.max(margin, Math.min(config.screen.width - margin, enemy.pos.x));
  enemy.pos.y = Math.max(
    config.arena.offsetY + margin,
    Math.min(config.screen.height - margin, enemy.pos.y)
  );
}

// Push all enemies away from center (used on player respawn)
// Note: Enemies auto-freeze while player is invincible, no manual stun needed
export function pushAllEnemies(k: KAPLAYCtx): void {
  const enemies = k.get('enemy');
  enemies.forEach((enemy) => {
    pushEnemyFromCenter(enemy, config.enemies.respawnPushDistance);
  });
}

// Push enemies within radius away from a specific position
export function pushEnemiesFromPoint(
  k: KAPLAYCtx,
  x: number,
  y: number,
  pushDistance: number,
  radius?: number
): void {
  const effectRadius = radius ?? pushDistance * 1.5; // Default radius slightly larger than push
  const enemies = k.get('enemy');

  enemies.forEach((enemy) => {
    const dx = enemy.pos.x - x;
    const dy = enemy.pos.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Only push enemies within radius
    if (dist > effectRadius) return;

    // Push away from point
    enemy.pos.x += (dx / dist) * pushDistance;
    enemy.pos.y += (dy / dist) * pushDistance;

    // Clamp to arena bounds
    const margin = config.enemies.spawnMargin;
    enemy.pos.x = Math.max(margin, Math.min(config.screen.width - margin, enemy.pos.x));
    enemy.pos.y = Math.max(
      config.arena.offsetY + margin,
      Math.min(config.screen.height - margin, enemy.pos.y)
    );
  });
}
