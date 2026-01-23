// Projectile entity - virtue bullets fired by player
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { getIsPaused } from '../ui/pauseMenu';

export function createProjectile(
  k: KAPLAYCtx,
  x: number,
  y: number,
  angle: number
): GameObj {
  const projectile = k.add([
    k.sprite('projectile'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), config.projectile.size.width, config.projectile.size.height) }),
    k.rotate(k.rad2deg(angle)),
    k.color(255, 255, 255),
    'projectile',
  ]);

  events.emit('projectile:fired', { type: 'basic', position: { x, y } });

  // Move in direction of angle with delta time
  projectile.onUpdate(() => {
    if (getIsPaused()) return;

    const speed = config.projectile.speed;
    projectile.pos.x += Math.cos(angle) * speed * k.dt();
    projectile.pos.y += Math.sin(angle) * speed * k.dt();

    // Destroy when off screen (any edge)
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
