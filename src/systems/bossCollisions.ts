// Boss collision handlers - projectile vs boss, player vs boss, boss projectile vs player
import type { KAPLAYCtx } from 'kaplay';
import { events } from '../utils/events';
import { getActivePowerup, isPiercingActive } from './powerupEffects';
import { damageMara, getMaraPhase } from '../entities/mara';
import { pushPlayerAwayFromBoss } from './collisionHelpers';
import { damagePlayer } from './playerDamage';
import { spawnHitParticles } from './particles';

export function setupBossCollisions(
  k: KAPLAYCtx,
  getProjectileDamage: () => number
): void {
  // Player projectile hits boss
  k.onCollide('projectile', 'boss', (projectile, boss) => {
    // Boss is invincible during entrance
    if (getMaraPhase() === 'entering' || getMaraPhase() === 'defeated') {
      projectile.destroy();
      return;
    }

    spawnHitParticles(boss.pos.x, boss.pos.y);

    if (!isPiercingActive()) {
      projectile.destroy();
    }

    damageMara(getProjectileDamage());
  });

  // Player touches boss
  k.onCollide('player', 'boss', (player, boss) => {
    // Boss is invincible during entrance/death - still block but no damage
    if (getMaraPhase() === 'entering' || getMaraPhase() === 'defeated') {
      pushPlayerAwayFromBoss(player, boss);
      return;
    }

    if (player.invincible) {
      pushPlayerAwayFromBoss(player, boss);
      return;
    }

    const activePowerup = getActivePowerup();
    if (activePowerup === 'meditation') {
      events.emit('powerup:shieldBroken', {});
      pushPlayerAwayFromBoss(player, boss);
      return;
    }

    damagePlayer(player, 2);
    pushPlayerAwayFromBoss(player, boss);
  });

  // Boss projectile hits player
  k.onCollide('bossProjectile', 'player', (projectile, player) => {
    projectile.destroy();

    if (player.invincible) return;

    const activePowerup = getActivePowerup();
    if (activePowerup === 'meditation') {
      events.emit('powerup:shieldBroken', {});
      return;
    }

    damagePlayer(player, 1);
  });
}
