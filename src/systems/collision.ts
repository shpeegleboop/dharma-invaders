// Collision detection system
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { createPowerup, shouldDropPowerup, createPaduma, shouldDropPaduma } from '../entities/powerup';
import { getActivePowerup, isPiercingActive, isShieldActive } from './powerupEffects';
import { damageMara, getMaraPhase } from '../entities/mara';
import { bounceAndStunEnemy, pushPlayerAwayFromBoss } from './collisionHelpers';
import { damagePlayer } from './playerDamage';
import { getProjectileDamageModifier } from './rebirthEffects';
import { absorbDamage } from './shieldSystem';
import {
  addKlesha, getRandomKlesha, removeRandomParami,
  setKarmaThisLife, hasKlesha
} from '../stores/gameStore';
import { reduceAllTimers } from './powerupEffects';
import { spawnHitParticles } from './particles';

// Calculate effective projectile damage with Panna/Anottappa modifiers
function getProjectileDamage(): number {
  return Math.max(1, config.projectile.damage + getProjectileDamageModifier());
}

// Handle Nerayika collision: 2 damage + random Klesha (Klesha bypasses shield)
function handleNerayikaCollision(k: KAPLAYCtx, player: any, enemy: any): void {
  const damage = enemy.damage || config.newEnemies.nerayika.damage;

  // Shield absorbs damage but Klesha still applies
  const remainingDamage = absorbDamage(damage);

  // If shield absorbed any damage, emit events for HUD update
  if (remainingDamage < damage) {
    events.emit('powerup:shieldBroken', {});
  }

  // Apply remaining damage to player HP
  if (remainingDamage > 0) {
    damagePlayer(player, remainingDamage);
  }

  // Klesha ALWAYS applies, even if shield blocked all damage
  const klesha = getRandomKlesha();
  addKlesha(klesha);
  events.emit('player:applyKlesha', { klesha });

  // Bounce enemy away
  bounceAndStunEnemy(k, player, enemy);
}

// Handle Tiracchana collision: 1 damage + removes 1 Parami stack
function handleTiracchanaCollision(k: KAPLAYCtx, player: any, enemy: any): void {
  // Shield blocks damage normally
  if (isShieldActive()) {
    events.emit('powerup:shieldBroken', {});
    bounceAndStunEnemy(k, player, enemy);
    // Parami removal only happens if damage gets through
    return;
  }

  // Damage player
  damagePlayer(player, 1);

  // Remove a random Parami stack (if player has any)
  const removed = removeRandomParami();
  if (removed) {
    events.emit('player:removeParami', { parami: removed });
  }

  // Bounce enemy away
  bounceAndStunEnemy(k, player, enemy);
}

// Handle Manussa collision: no damage, just gentle bump away
function handleManussaCollision(_k: KAPLAYCtx, player: any, enemy: any): void {
  // Push Manussa away from player (gentle)
  const dx = enemy.pos.x - player.pos.x;
  const dy = enemy.pos.y - player.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0) {
    const pushDist = 30;
    enemy.pos.x += (dx / dist) * pushDist;
    enemy.pos.y += (dy / dist) * pushDist;
  }
  // No damage, no stun
}

// Handle Manussa death: severe karmic penalty (or reward if Ahirika active)
function handleManussaDeath(): void {
  // Ahirika flips the mechanics - killing Manussa becomes advantageous
  if (hasKlesha('Ahirika')) {
    events.emit('human:killed:ahirika', {});
    return;
  }

  // Normal penalty for killing Manussa:
  // 1. Wipe karma this life
  setKarmaThisLife(0);

  // 2. Remove 1 random Parami
  const removedParami = removeRandomParami();
  if (removedParami) {
    events.emit('player:removeParami', { parami: removedParami });
  }

  // 3. Add 1 random Klesha
  const klesha = getRandomKlesha();
  addKlesha(klesha);
  events.emit('player:applyKlesha', { klesha });

  // 4. Reduce all powerup timers to 1 second
  reduceAllTimers(1000);

  // Emit the human:killed event
  events.emit('human:killed', {});
}

export function setupCollisions(k: KAPLAYCtx): void {
  // Projectile hits enemy
  k.onCollide('projectile', 'enemy', (projectile, enemy) => {
    // Spawn hit particles at impact point
    spawnHitParticles(enemy.pos.x, enemy.pos.y);

    // Check if projectile should pierce (wisdom powerup)
    if (!isPiercingActive()) {
      projectile.destroy();
    }

    // Apply Panna/Anottappa damage modifier
    enemy.hurt(getProjectileDamage());

    if (enemy.hp() <= 0) {
      const pos = { x: enemy.pos.x, y: enemy.pos.y };

      // Manussa death triggers severe penalty
      if (enemy.isManussa) {
        handleManussaDeath();
      }

      events.emit('enemy:killed', {
        id: enemy.enemyId,
        type: enemy.type,
        position: pos,
        karmaValue: enemy.karmaValue,
      });

      // Chance to drop powerup (regular and Paduma checked independently)
      // Manussa doesn't drop powerups
      if (!enemy.isManussa) {
        if (shouldDropPowerup(k)) {
          createPowerup(k, pos.x, pos.y);
        }
        if (shouldDropPaduma(k)) {
          createPaduma(k, pos.x, pos.y);
        }
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
      events.emit('player:healed', { amount: healAmount, newHealth: player.hp() });
      events.emit('player:powerup', { type: 'paduma' });
    } else {
      events.emit('player:powerup', { type: powerup.virtueType });
    }
    powerup.destroy();
  });

  // Enemy touches player
  k.onCollide('player', 'enemy', (player, enemy) => {
    // Check if player is invincible or enemy is stunned
    if (player.invincible || enemy.stunned) return;

    // Nerayika has special handling: 2 damage + Klesha (Klesha bypasses shield)
    if (enemy.isNerayika) {
      handleNerayikaCollision(k, player, enemy);
      return;
    }

    // Tiracchana has special handling: 1 damage + removes Parami
    if (enemy.isTiracchana) {
      handleTiracchanaCollision(k, player, enemy);
      return;
    }

    // Manussa has special handling: no damage, just gentle bump
    if (enemy.isManussa) {
      handleManussaCollision(k, player, enemy);
      return;
    }

    // Check for meditation shield (standard enemies)
    if (isShieldActive()) {
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
  k.onCollide('projectile', 'boss', (projectile, boss) => {
    // Boss is invincible during entrance
    if (getMaraPhase() === 'entering' || getMaraPhase() === 'defeated') {
      projectile.destroy();
      return;
    }

    // Spawn hit particles at impact point
    spawnHitParticles(boss.pos.x, boss.pos.y);

    // Check if projectile should pierce (wisdom powerup)
    if (!isPiercingActive()) {
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
