// Player combat - shooting + push ability
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { createProjectile } from './projectile';
import { getShootCooldownMultiplier, isSpreadShotActive } from '../systems/powerupEffects';
import { getIsPaused } from '../ui/pauseMenu';
import { isRebirthOverlayActive } from '../ui/rebirthOverlay';
import { pushEnemiesFromPoint } from '../systems/enemyHelpers';
import { spawnPushRing } from '../systems/particles';
import { playSFX } from '../systems/audio';
import { setPushCooldown } from '../systems/playerIndicators';
import { getAngleToMouse } from './playerMovement';

// Combat state
let canShoot = true;
let canPush = true;

// Reset combat state (call on new player)
export function resetCombatState(): void {
  canShoot = true;
  canPush = true;
}

// Setup shooting input bindings
export function setupPlayerShooting(k: KAPLAYCtx, player: GameObj): void {
  const shoot = () => {
    if (getIsPaused()) return;
    if (player.invincible) return;
    if (isRebirthOverlayActive()) return;
    if (!canShoot) return;
    canShoot = false;

    const angle = getAngleToMouse(k, player);
    const offset = config.player.size.width / 2 + 5;

    if (isSpreadShotActive()) {
      // Compassion: 3-way spread shot
      const spreadAngle = config.player.spreadAngle;
      for (const angleOffset of [-spreadAngle, 0, spreadAngle]) {
        const shotAngle = angle + angleOffset;
        const spawnX = player.pos.x + Math.cos(shotAngle) * offset;
        const spawnY = player.pos.y + Math.sin(shotAngle) * offset;
        createProjectile(k, spawnX, spawnY, shotAngle);
      }
    } else {
      // Normal single shot
      const spawnX = player.pos.x + Math.cos(angle) * offset;
      const spawnY = player.pos.y + Math.sin(angle) * offset;
      createProjectile(k, spawnX, spawnY, angle);
    }

    // Apply cooldown with potential multiplier (diligence = 0.5x cooldown)
    const cooldown = config.player.shootCooldown * getShootCooldownMultiplier();
    k.wait(cooldown / 1000, () => {
      canShoot = true;
    });
  };

  k.onKeyDown('space', shoot);
  k.onMouseDown('left', shoot);
}

// Setup push ability input bindings
export function setupPlayerPush(k: KAPLAYCtx, player: GameObj): void {
  const pushCfg = config.player.pushAbility;

  const push = () => {
    if (getIsPaused()) return;
    if (player.invincible) return;
    if (isRebirthOverlayActive()) return;
    if (!canPush) return;
    canPush = false;
    setPushCooldown(true);

    // Visual and audio effect
    spawnPushRing(player.pos.x, player.pos.y, pushCfg.ringColor);
    playSFX('patighata');

    // Push all enemies away from player
    pushEnemiesFromPoint(k, player.pos.x, player.pos.y, pushCfg.pushDistance);

    // Cooldown
    k.wait(pushCfg.cooldown / 1000, () => {
      canPush = true;
      setPushCooldown(false);
    });
  };

  k.onMousePress('right', push);
}
