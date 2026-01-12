// Collision detection system
import type { KAPLAYCtx } from 'kaplay';
import { events } from '../utils/events';
import { createPowerup, shouldDropPowerup } from '../entities/powerup';
import { getActivePowerup } from './powerupEffects';

export function setupCollisions(k: KAPLAYCtx): void {
  // Projectile hits enemy
  k.onCollide('projectile', 'enemy', (projectile, enemy) => {
    // Check if projectile should pierce (wisdom powerup)
    const activePowerup = getActivePowerup();
    const shouldPierce = activePowerup === 'wisdom';

    if (!shouldPierce) {
      projectile.destroy();
    }

    enemy.hurt(1);

    if (enemy.hp() <= 0) {
      const pos = { x: enemy.pos.x, y: enemy.pos.y };

      events.emit('enemy:killed', {
        id: enemy.enemyId,
        type: enemy.type,
        position: pos,
        karmaValue: enemy.karmaValue,
      });

      // Chance to drop powerup
      if (shouldDropPowerup(k)) {
        createPowerup(k, pos.x, pos.y);
      }

      enemy.destroy();
    }
  });

  // Player collects powerup
  k.onCollide('player', 'powerup', (_player, powerup) => {
    events.emit('player:powerup', { type: powerup.virtueType });
    powerup.destroy();
  });

  // Enemy touches player
  k.onCollide('player', 'enemy', (player, enemy) => {
    // Check if player is invincible
    if (player.invincible) return;

    // Check for meditation shield
    const activePowerup = getActivePowerup();
    if (activePowerup === 'meditation') {
      events.emit('powerup:shieldBroken', {});
      enemy.destroy();
      return;
    }

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
      karmaValue: 0,
    });
    enemy.destroy();

    // Check for death
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
    }
  });
}
