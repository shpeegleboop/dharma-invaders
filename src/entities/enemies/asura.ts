// Asura - aggressive, direct movement toward player
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getEnemySpeedMultiplier } from '../../systems/powerupEffects';
import { isPaused } from '../../ui/pauseMenu';
import { getCurrentWaveNumber } from '../../systems/waveManager';
import { shouldEnemiesFlee, applyFleeMovement } from '../../systems/enemyFlee';

let asuraIdCounter = 0;

export function createAsura(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.enemies.asura;
  const enemyId = `asura_${++asuraIdCounter}`;

  const asura = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.rotate(0),
    k.color(k.Color.fromHex(cfg.color)),
    k.health(cfg.health),
    'enemy',
    'asura',
    { enemyId, type: 'asura', karmaValue: cfg.karmaValue, speed: cfg.speed, stunned: false },
  ]);

  events.emit('enemy:spawned', {
    id: enemyId,
    type: 'asura',
    position: { x, y },
  });

  asura.onUpdate(() => {
    if (isPaused) return;

    // Don't move if stunned
    if (asura.stunned) return;

    // Flee when Mara is defeated
    if (shouldEnemiesFlee()) {
      applyFleeMovement(k, asura, cfg.speed);
      return;
    }

    // Find player
    const player = k.get('player')[0];
    if (!player) return;

    // Calculate direct path toward player (aggressive, no wobble)
    const dx = player.pos.x - asura.pos.x;
    const dy = player.pos.y - asura.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Direct movement with delta time (with patience slowdown and wave scaling)
      const waveMultiplier = 1 + 0.1 * getCurrentWaveNumber();
      const speed = cfg.speed * getEnemySpeedMultiplier() * waveMultiplier;
      asura.pos.x += dirX * speed * k.dt();
      asura.pos.y += dirY * speed * k.dt();

      // Rotate to face player
      asura.angle = k.rad2deg(Math.atan2(dy, dx));
    }

    // Destroy if too far off screen
    const margin = 150;
    if (
      asura.pos.x < -margin ||
      asura.pos.x > config.screen.width + margin ||
      asura.pos.y < config.arena.offsetY - margin ||
      asura.pos.y > config.screen.height + margin
    ) {
      events.emit('enemy:escaped', { id: asura.enemyId });
      asura.destroy();
    }
  });

  return asura;
}
