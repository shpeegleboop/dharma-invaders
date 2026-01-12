// Boss projectile - aimed at player, damages on contact
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

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
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.rotate(k.rad2deg(angle)),
    k.color(k.Color.fromHex(cfg.color)),
    k.opacity(0.9),
    'bossProjectile',
    { moveAngle: angle, speed: projectileSpeed },
  ]);

  projectile.onUpdate(() => {
    // Move in set direction
    projectile.pos.x += Math.cos(projectile.moveAngle) * projectile.speed * k.dt();
    projectile.pos.y += Math.sin(projectile.moveAngle) * projectile.speed * k.dt();

    // Destroy if off screen
    const margin = 50;
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
