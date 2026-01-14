// Collision helpers - bounce and visual effects
import type { KAPLAYCtx, GameObj } from 'kaplay';

// Bounce enemy away from player and stun for 0.5s
export function bounceAndStunEnemy(k: KAPLAYCtx, player: GameObj, enemy: GameObj): void {
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

// Push player away from boss
export function pushPlayerAwayFromBoss(player: GameObj, boss: GameObj): void {
  // Calculate push direction (away from boss)
  const dx = player.pos.x - boss.pos.x;
  const dy = player.pos.y - boss.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Push player back
  const pushDistance = 100;
  player.pos.x += dirX * pushDistance;
  player.pos.y += dirY * pushDistance;
}

// Flash player red briefly on damage
export function flashPlayerRed(k: KAPLAYCtx, player: GameObj): void {
  player.color = k.rgb(255, 0, 0);

  k.wait(0.15, () => {
    if (player.exists()) {
      // Always restore to player's base blue color
      player.color = k.rgb(0, 128, 255);
    }
  });
}

// Grant brief invincibility frames after taking damage
export function grantIFrames(k: KAPLAYCtx, player: GameObj): void {
  player.invincible = true;

  // Brief flash effect during i-frames
  const originalOpacity = player.opacity;
  player.opacity = 0.5;

  k.wait(0.5, () => {
    if (player.exists()) {
      player.invincible = false;
      player.opacity = originalOpacity;
    }
  });
}
