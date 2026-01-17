// Collision detection system
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { createPowerup, shouldDropPowerup, createPaduma, shouldDropPaduma } from '../entities/powerup';
import { getActivePowerup } from './powerupEffects';
import { damageMara, getMaraPhase } from '../entities/mara';
import { bounceAndStunEnemy, pushPlayerAwayFromBoss } from './collisionHelpers';
import { damagePlayer } from './playerDamage';
import { getProjectileDamageModifier } from './rebirthEffects';

// Calculate effective projectile damage with Panna/Anottappa modifiers
function getProjectileDamage(): number {
  return Math.max(1, config.projectile.damage + getProjectileDamageModifier());
}

export function setupCollisions(k: KAPLAYCtx): void {
  // Projectile hits enemy
  k.onCollide('projectile', 'enemy', (projectile, enemy) => {
    // Check if projectile should pierce (wisdom powerup)
    const activePowerup = getActivePowerup();
    const shouldPierce = activePowerup === 'wisdom';

    if (!shouldPierce) {
      projectile.destroy();
    }

    // Apply Panna/Anottappa damage modifier
    enemy.hurt(getProjectileDamage());

    if (enemy.hp() <= 0) {
      const pos = { x: enemy.pos.x, y: enemy.pos.y };

      events.emit('enemy:killed', {
        id: enemy.enemyId,
        type: enemy.type,
        position: pos,
        karmaValue: enemy.karmaValue,
      });

      // Chance to drop powerup (regular and Paduma checked independently)
      if (shouldDropPowerup(k)) {
        createPowerup(k, pos.x, pos.y);
      }
      if (shouldDropPaduma(k)) {
        createPaduma(k, pos.x, pos.y);
      }

      enemy.destroy();
    }
  });

  // Player collects powerup
  k.onCollide('player', 'powerup', (player, powerup) => {
    if (powerup.virtueType === 'paduma') {
      // Paduma heals immediately instead of activating a powerup
      const healAmount = config.powerups.paduma.healAmount;
      player.heal(healAmount);
      events.emit('player:healed', { amount: healAmount });
    } else {
      events.emit('player:powerup', { type: powerup.virtueType });
    }
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

    // Damage player (handles hurt, flash, i-frames, death check)
    damagePlayer(player, 1);

    // Bounce enemy away and stun
    bounceAndStunEnemy(k, player, enemy);
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

    // Apply Panna/Anottappa damage modifier to boss
    damageMara(getProjectileDamage());
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
    damagePlayer(player, 2);

    // Push player away
    pushPlayerAwayFromBoss(player, boss);
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

    // Damage player (handles hurt, flash, i-frames, death check)
    damagePlayer(player, 1);
  });
}
