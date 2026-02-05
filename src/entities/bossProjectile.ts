// Boss projectile - aimed at player, damages on contact
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getIsPaused } from '../ui/pauseMenu';
import { getIsPlayerDead, getIsPlayerInvulnerable } from './player';

export function createBossProjectile(
  k: KAPLAYCtx,
  x: number,
  y: number,
  angle: number,
  speed?: number
): GameObj {
  const cfg = config.boss.projectile;
  const projectileSpeed = speed ?? cfg.speed;

  const projectile = k.add([
    k.sprite('boss_projectile'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.rotate(k.rad2deg(angle)),
    k.color(255, 255, 255),
    k.opacity(0.9),
    'bossProjectile',
    { moveAngle: angle, speed: projectileSpeed },
  ]);

  projectile.onUpdate(() => {
    if (getIsPaused()) return;
    // Freeze during player death/respawn invulnerability
    if (getIsPlayerDead() || getIsPlayerInvulnerable()) return;

    // Move in set direction
    projectile.pos.x += Math.cos(projectile.moveAngle) * projectile.speed * k.dt();
    projectile.pos.y += Math.sin(projectile.moveAngle) * projectile.speed * k.dt();

    // Destroy if off screen
    const margin = config.projectile.offscreenMargin;
    if (
      projectile.pos.x < -margin ||
      projectile.pos.x > config.screen.width + margin ||
      projectile.pos.y < -margin ||
      projectile.pos.y > config.screen.height + margin
    ) {
      projectile.destroy();
    }
  });

  return projectile;
}
