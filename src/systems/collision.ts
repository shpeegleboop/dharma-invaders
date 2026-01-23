// Collision detection system - orchestrates all collision handlers
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import {
  createPowerup, shouldDropPowerup, createPaduma, shouldDropPaduma,
  createVajra, shouldDropVajra, markVajraSpawned
} from '../entities/powerup';
import { isPiercingActive, isShieldActive } from './powerupEffects';
import { bounceAndStunEnemy } from './collisionHelpers';
import { damagePlayer } from './playerDamage';
import { getProjectileDamageModifier, getMaxHealthModifier } from './rebirthEffects';
import { spawnHitParticles, spawnVajraPickupBurst, flashScreen } from './particles';
import { addKarma, getDifficulty } from '../stores/gameStore';
import { playSFX } from './audio';
import {
  handleNerayikaCollision,
  handleTiracchanaCollision,
  handleManussaCollision,
  handleManussaDeath,
} from './specialEnemyCollisions';
import { setupBossCollisions } from './bossCollisions';

// Calculate effective projectile damage with Panna/Anottappa modifiers
function getProjectileDamage(): number {
  return Math.max(1, config.projectile.damage + getProjectileDamageModifier());
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

    // Manussa says "Ouch!" when hit but survives
    if (enemy.isManussa && enemy.hp() > 0) {
      const riseSpeed = config.effects.fastTextRiseSpeed;
      const ouch = k.add([
        k.text('Ouch!', { size: 16 }),
        k.pos(enemy.pos.x, enemy.pos.y - 30),
        k.anchor('center'),
        k.color(255, 255, 100),
        k.outline(2, k.rgb(0, 0, 0)),
        k.opacity(1),
        k.lifespan(0.6, { fade: 0.2 }),
        k.z(100),
      ]);
      ouch.onUpdate(() => {
        ouch.pos.y -= riseSpeed * k.dt();
      });
    }

    if (enemy.hp() <= 0) {
      const pos = { x: enemy.pos.x, y: enemy.pos.y };

      // Manussa death triggers severe penalty
      if (enemy.isManussa) {
        const deathRiseSpeed = config.effects.deathTextRiseSpeed;
        const deathText = k.add([
          k.text('bruh, why?', { size: 16 }),
          k.pos(pos.x, pos.y - 30),
          k.anchor('center'),
          k.color(255, 100, 100),
          k.outline(2, k.rgb(0, 0, 0)),
          k.opacity(1),
          k.lifespan(1.5, { fade: 0.4 }),
          k.z(100),
        ]);
        deathText.onUpdate(() => {
          deathText.pos.y -= deathRiseSpeed * k.dt();
        });
        handleManussaDeath(k, pos.x, pos.y);
      }

      events.emit('enemy:killed', {
        id: enemy.enemyId,
        type: enemy.type,
        position: pos,
        karmaValue: enemy.karmaValue,
      });

      // Chance to drop powerup (Vajra replaces normal roll, Paduma independent)
      // Manussa doesn't drop powerups
      // NOAH: Only one unclaimed powerup allowed on screen (prevents farming)
      if (!enemy.isManussa) {
        const noahBlocked = getDifficulty() === 'noah' &&
          (k.get('powerup').length > 0 || k.get('vajra').length > 0);

        if (!noahBlocked) {
          // Vajra: 1.5% chance, replaces normal powerup if it hits
          if (shouldDropVajra(k)) {
            createVajra(k, pos.x, pos.y);
            markVajraSpawned();
          } else if (shouldDropPowerup(k)) {
            createPowerup(k, pos.x, pos.y);
          }
          // Paduma checked independently
          if (shouldDropPaduma(k)) {
            createPaduma(k, pos.x, pos.y);
          }
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
      const maxHealth = Math.max(1, config.player.health + getMaxHealthModifier());
      const newHealth = Math.min(player.hp() + healAmount, maxHealth);
      player.setHP(newHealth);
      events.emit('player:healed', { amount: healAmount, newHealth });
      events.emit('player:powerup', { type: 'paduma' });
    } else {
      events.emit('player:powerup', { type: powerup.virtueType });
    }
    powerup.destroy();
  });

  // Player collects Vajra (clears all enemies after 1s delay)
  k.onCollide('player', 'vajra', (_player, vajra) => {
    const cfg = config.powerups.vajra;

    // Immediate: sound + destroy vajra
    playSFX('vajra');
    vajra.destroy();

    // Delayed: screen clear effect
    k.wait(cfg.clearDelay / 1000, () => {
      // Particle burst centered on screen
      spawnVajraPickupBurst(config.screen.width / 2, config.screen.height / 2);

      // Screen flash
      flashScreen(cfg.color, cfg.flashDuration);

      // Kill all eligible enemies (not Manussa, not boss)
      k.get('enemy').forEach((enemy: any) => {
        if (enemy.isManussa) return;
        if (enemy.is('boss')) return;

        events.emit('enemy:killed', {
          id: enemy.enemyId,
          type: enemy.type,
          position: { x: enemy.pos.x, y: enemy.pos.y },
          karmaValue: 0,
          silent: true,
        });

        spawnHitParticles(enemy.pos.x, enemy.pos.y);
        enemy.destroy();
      });

      // Grant flat karma
      addKarma(cfg.karmaGrant);
    });
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

  // Boss collisions (projectile vs boss, player vs boss, boss projectile vs player)
  setupBossCollisions(k, getProjectileDamage);
}
