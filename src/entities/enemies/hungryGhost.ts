// Hungry Ghost - wispy, erratic movement toward player
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getEnemySpeedMultiplier } from '../../systems/powerupEffects';
import { isPaused } from '../../ui/pauseMenu';
import { getCurrentWaveNumber } from '../../systems/waveManager';

let ghostIdCounter = 0;

export function createHungryGhost(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.enemies.hungryGhost;
  const enemyId = `hungryGhost_${++ghostIdCounter}`;

  // Erratic movement variables
  let wobbleOffset = k.rand(0, Math.PI * 2);
  const wobbleSpeed = k.rand(3, 5);
  const wobbleAmount = k.rand(0.3, 0.6);

  const ghost = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.rotate(0),
    k.color(k.Color.fromHex(cfg.color)),
    k.health(cfg.health),
    k.opacity(0.85),
    'enemy',
    'hungryGhost',
    { enemyId, type: 'hungryGhost', karmaValue: cfg.karmaValue, speed: cfg.speed, stunned: false },
  ]);

  events.emit('enemy:spawned', {
    id: enemyId,
    type: 'hungryGhost',
    position: { x, y },
  });

  ghost.onUpdate(() => {
    if (isPaused) return;

    // Don't move if stunned
    if (ghost.stunned) return;

    // Find player
    const player = k.get('player')[0];
    if (!player) return;

    // Calculate direction toward player
    const dx = player.pos.x - ghost.pos.x;
    const dy = player.pos.y - ghost.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Add wobble for erratic movement
      wobbleOffset += wobbleSpeed * k.dt();
      const wobbleX = Math.sin(wobbleOffset) * wobbleAmount;
      const wobbleY = Math.cos(wobbleOffset * 1.3) * wobbleAmount;

      // Apply movement with delta time (with patience slowdown and wave scaling)
      const waveMultiplier = 1 + 0.1 * getCurrentWaveNumber();
      const speed = cfg.speed * getEnemySpeedMultiplier() * waveMultiplier;
      ghost.pos.x += (dirX + wobbleX) * speed * k.dt();
      ghost.pos.y += (dirY + wobbleY) * speed * k.dt();

      // Rotate to face movement direction
      ghost.angle = k.rad2deg(Math.atan2(dirY, dirX));
    }

    // Destroy if too far off screen
    const margin = 150;
    if (
      ghost.pos.x < -margin ||
      ghost.pos.x > config.screen.width + margin ||
      ghost.pos.y < config.arena.offsetY - margin ||
      ghost.pos.y > config.screen.height + margin
    ) {
      events.emit('enemy:escaped', { id: ghost.enemyId });
      ghost.destroy();
    }
  });

  return ghost;
}
