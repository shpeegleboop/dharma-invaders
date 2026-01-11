// Collision detection system
import type { KAPLAYCtx } from 'kaplay';
import { events } from '../utils/events';

export function setupCollisions(k: KAPLAYCtx): void {
  // Projectile hits enemy
  k.onCollide('projectile', 'enemy', (projectile, enemy) => {
    projectile.destroy();
    enemy.hurt(1);

    if (enemy.hp() <= 0) {
      events.emit('enemy:killed', {
        id: enemy.enemyId,
        type: enemy.type,
        position: { x: enemy.pos.x, y: enemy.pos.y },
        karmaValue: enemy.karmaValue,
      });
      enemy.destroy();
    }
  });
}
