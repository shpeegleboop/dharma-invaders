// Collision detection system
import type { KAPLAYCtx } from 'kaplay';
import { events } from '../utils/events';

export function setupCollisions(k: KAPLAYCtx): void {
  // Projectile hits enemy
  k.onCollide('projectile', 'enemy', (projectile, enemy) => {
    projectile.destroy();
    enemy.hurt(1);

    if (enemy.hp() <= 0) {
      events.emit('enemy:killed', {
        id: enemy.enemyId,
        type: enemy.type,
        position: { x: enemy.pos.x, y: enemy.pos.y },
        karmaValue: enemy.karmaValue,
      });
      enemy.destroy();
    }
  });

  // Enemy touches player
  k.onCollide('player', 'enemy', (player, enemy) => {
    // Check if player is invincible
    if (player.invincible) return;

    // Damage player
    player.hurt(1);
    const remainingHealth = player.hp();

    events.emit('player:hit', {
      damage: 1,
      remainingHealth,
    });

    // Destroy the enemy that hit player
    events.emit('enemy:killed', {
      id: enemy.enemyId,
      type: enemy.type,
      position: { x: enemy.pos.x, y: enemy.pos.y },
      karmaValue: 0, // No karma for collision kills
    });
    enemy.destroy();

    // Check for death
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
    }
  });
}
