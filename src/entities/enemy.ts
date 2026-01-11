// Base enemy factory - arena shooter style
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';

export type EnemyType = 'hungryGhost' | 'asura' | 'deva';

let enemyIdCounter = 0;

export function createEnemy(
  k: KAPLAYCtx,
  type: EnemyType,
  x: number,
  y: number,
  angle: number
): GameObj {
  const cfg = config.enemies[type];
  const enemyId = `enemy_${++enemyIdCounter}`;

  const enemy = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.rotate(k.rad2deg(angle)),
    k.color(k.Color.fromHex(cfg.color)),
    k.health(cfg.health),
    'enemy',
    { enemyId, type, karmaValue: cfg.karmaValue, speed: cfg.speed, moveAngle: angle },
  ]);

  events.emit('enemy:spawned', { id: enemyId, type, position: { x, y } });

  // Move in direction of angle with delta time
  enemy.onUpdate(() => {
    enemy.pos.x += Math.cos(enemy.moveAngle) * enemy.speed * k.dt();
    enemy.pos.y += Math.sin(enemy.moveAngle) * enemy.speed * k.dt();

    // Destroy when far off screen (any edge)
    const margin = 100;
    if (
      enemy.pos.x < -margin ||
      enemy.pos.x > config.screen.width + margin ||
      enemy.pos.y < config.arena.offsetY - margin ||
      enemy.pos.y > config.screen.height + margin
    ) {
      events.emit('enemy:escaped', { id: enemy.enemyId });
      enemy.destroy();
    }
  });

  return enemy;
}

// Spawn enemy from random edge, aimed at arena center
export function spawnEnemyFromEdge(k: KAPLAYCtx, type: EnemyType): GameObj {
  const edge = Math.floor(k.rand(0, 4)); // 0=top, 1=right, 2=bottom, 3=left
  const margin = 30;
  let x: number, y: number;

  const arenaTop = config.arena.offsetY;
  const arenaBottom = config.screen.height;

  switch (edge) {
    case 0: // Top
      x = k.rand(margin, config.screen.width - margin);
      y = arenaTop - margin;
      break;
    case 1: // Right
      x = config.screen.width + margin;
      y = k.rand(arenaTop + margin, arenaBottom - margin);
      break;
    case 2: // Bottom
      x = k.rand(margin, config.screen.width - margin);
      y = arenaBottom + margin;
      break;
    default: // Left
      x = -margin;
      y = k.rand(arenaTop + margin, arenaBottom - margin);
      break;
  }

  // Aim toward arena center
  const centerX = config.arena.width / 2;
  const centerY = config.arena.offsetY + config.arena.height / 2;
  const angle = Math.atan2(centerY - y, centerX - x);

  return createEnemy(k, type, x, y, angle);
}
