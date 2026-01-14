// Collision detection system
import type { KAPLAYCtx } from 'kaplay';
import { events } from '../utils/events';
import { createPowerup, shouldDropPowerup } from '../entities/powerup';
import { getActivePowerup } from './powerupEffects';
import { damageMara, getMaraPhase } from '../entities/mara';
import { bounceAndStunEnemy, flashPlayerRed, pushPlayerAwayFromBoss, grantIFrames } from './collisionHelpers';

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
    // Check if player is invincible or enemy is stunned
    if (player.invincible || enemy.stunned) return;

    // Check for meditation shield
    const activePowerup = getActivePowerup();
    if (activePowerup === 'meditation') {
      events.emit('powerup:shieldBroken', {});
      bounceAndStunEnemy(k, player, enemy);
      return;
    }

    // Damage player
    player.hurt(1);
    const remainingHealth = player.hp();

    // Flash player red
    flashPlayerRed(k, player);

    events.emit('player:hit', {
      damage: 1,
      remainingHealth,
    });

    // Bounce enemy away and stun (enemy takes no damage)
    bounceAndStunEnemy(k, player, enemy);

    // Check for death or grant i-frames
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
    } else {
      grantIFrames(k, player);
    }
  });

  // Player projectile hits boss
  k.onCollide('projectile', 'boss', (projectile, _boss) => {
    // Boss is invincible during entrance
    if (getMaraPhase() === 'entering' || getMaraPhase() === 'defeated') {
      projectile.destroy();
      return;
    }

    // Check if projectile should pierce (wisdom powerup)
    const activePowerup = getActivePowerup();
    const shouldPierce = activePowerup === 'wisdom';

    if (!shouldPierce) {
      projectile.destroy();
    }

    damageMara(1);
  });

  // Player touches boss
  k.onCollide('player', 'boss', (player, boss) => {
    // Boss is invincible during entrance/death - still block but no damage
    if (getMaraPhase() === 'entering' || getMaraPhase() === 'defeated') {
      pushPlayerAwayFromBoss(player, boss);
      return;
    }

    // Check if player is invincible
    if (player.invincible) {
      pushPlayerAwayFromBoss(player, boss);
      return;
    }

    // Check for meditation shield
    const activePowerup = getActivePowerup();
    if (activePowerup === 'meditation') {
      events.emit('powerup:shieldBroken', {});
      pushPlayerAwayFromBoss(player, boss);
      return;
    }

    // Damage player (2 damage from boss contact)
    player.hurt(2);
    const remainingHealth = player.hp();

    // Flash player red
    flashPlayerRed(k, player);

    events.emit('player:hit', {
      damage: 2,
      remainingHealth,
    });

    // Push player away
    pushPlayerAwayFromBoss(player, boss);

    // Check for death or grant i-frames
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
    } else {
      grantIFrames(k, player);
    }
  });

  // Boss projectile hits player
  k.onCollide('bossProjectile', 'player', (projectile, player) => {
    projectile.destroy();

    // Check if player is invincible
    if (player.invincible) return;

    // Check for meditation shield
    const activePowerup = getActivePowerup();
    if (activePowerup === 'meditation') {
      events.emit('powerup:shieldBroken', {});
      return;
    }

    // Damage player
    player.hurt(1);
    const remainingHealth = player.hp();

    // Flash player red
    flashPlayerRed(k, player);

    events.emit('player:hit', {
      damage: 1,
      remainingHealth,
    });

    // Check for death or grant i-frames
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
    } else {
      grantIFrames(k, player);
    }
  });
}
