// Mara combat helpers - projectile firing and minion spawning
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { createBossProjectile } from './bossProjectile';
import { events } from '../utils/events';

export function fireAtPlayer(
  k: KAPLAYCtx,
  mara: GameObj,
  isPhase3: boolean
): void {
  const cfg = config.boss;

  const player = k.get('player')[0];
  if (!player) return;

  const angle = Math.atan2(
    player.pos.y - mara.pos.y,
    player.pos.x - mara.pos.x
  );

  const speed = isPhase3
    ? cfg.projectile.speedPhase3
    : cfg.projectile.speed;

  createBossProjectile(k, mara.pos.x, mara.pos.y + cfg.size.height / 2, angle, speed);
}

export function spawnMinion(k: KAPLAYCtx): void {
  // Emit event for spawner to handle - no direct entity import
  const edge = k.rand(0, 4) | 0;
  let x: number, y: number;

  switch (edge) {
    case 0: // Top
      x = k.rand(50, config.screen.width - 50);
      y = config.arena.offsetY - 20;
      break;
    case 1: // Right
      x = config.screen.width + 20;
      y = k.rand(config.arena.offsetY + 50, config.screen.height - 50);
      break;
    case 2: // Bottom
      x = k.rand(50, config.screen.width - 50);
      y = config.screen.height + 20;
      break;
    default: // Left
      x = -20;
      y = k.rand(config.arena.offsetY + 50, config.screen.height - 50);
  }

  events.emit('boss:spawnMinion', { x, y });
}
