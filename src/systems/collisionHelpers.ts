// Collision helpers - bounce and visual effects
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

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

// Push player away from boss with screen bounds clamping
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

  // Clamp to arena bounds
  const halfW = config.player.size.width / 2;
  const halfH = config.player.size.height / 2;
  const minX = halfW;
  const maxX = config.arena.width - halfW;
  const minY = config.arena.offsetY + halfH;
  const maxY = config.arena.offsetY + config.arena.height - halfH;

  player.pos.x = Math.max(minX, Math.min(maxX, player.pos.x));
  player.pos.y = Math.max(minY, Math.min(maxY, player.pos.y));
}
