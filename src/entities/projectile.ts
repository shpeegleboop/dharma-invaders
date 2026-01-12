// Projectile entity - virtue bullets fired by player
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { isPaused } from '../ui/pauseMenu';

export function createProjectile(
  k: KAPLAYCtx,
  x: number,
  y: number,
  angle: number
): GameObj {
  const projectile = k.add([
    k.rect(config.projectile.size.width, config.projectile.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.rotate(k.rad2deg(angle)),
    k.color(255, 255, 0), // Yellow rectangle
    'projectile',
  ]);

  events.emit('projectile:fired', { type: 'basic', position: { x, y } });

  // Move in direction of angle with delta time
  projectile.onUpdate(() => {
    if (isPaused) return;

    const speed = config.projectile.speed;
    projectile.pos.x += Math.cos(angle) * speed * k.dt();
    projectile.pos.y += Math.sin(angle) * speed * k.dt();

    // Destroy when off screen (any edge)
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
