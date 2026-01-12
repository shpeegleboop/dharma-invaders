// Collision detection system
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { events } from '../utils/events';
import { createPowerup, shouldDropPowerup } from '../entities/powerup';
import { getActivePowerup } from './powerupEffects';
import { damageMara, getMaraPhase } from '../entities/mara';

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

    // Check for death
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
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

    // Check for death
    if (remainingHealth <= 0) {
      events.emit('player:died', {});
    }
  });
}

// Bounce enemy away from player and stun for 0.5s
function bounceAndStunEnemy(k: KAPLAYCtx, player: GameObj, enemy: GameObj): void {
  // Calculate bounce direction (away from player)
  const dx = enemy.pos.x - player.pos.x;
  const dy = enemy.pos.y - player.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Push enemy back
  const bounceDistance = 80;
  enemy.pos.x += dirX * bounceDistance;
  enemy.pos.y += dirY * bounceDistance;

  // Stun enemy
  enemy.stunned = true;
  enemy.opacity = 0.5;

  k.wait(0.5, () => {
    if (enemy.exists()) {
      enemy.stunned = false;
      enemy.opacity = 1;
    }
  });
}

// Flash player red briefly on damage
function flashPlayerRed(k: KAPLAYCtx, player: GameObj): void {
  const originalColor = player.color.clone();
  player.color = k.rgb(255, 0, 0);

  k.wait(0.15, () => {
    if (player.exists()) {
      player.color = originalColor;
    }
  });
}
