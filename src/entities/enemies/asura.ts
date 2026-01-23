// Asura - aggressive, direct movement toward player
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getEnemySpeedMultiplier } from '../../systems/powerupEffects';
import { getIsPaused } from '../../ui/pauseMenu';
import { getCurrentWaveNumber } from '../../systems/waveManager';
import { shouldEnemiesFlee, applyFleeMovement } from '../../systems/enemyFlee';
import { getEnemySpeedScaling } from '../../systems/cycleScaling';

let asuraIdCounter = 0;

export function createAsura(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.enemies.asura;
  const enemyId = `asura_${++asuraIdCounter}`;

  const asura = k.add([
    k.sprite('asura'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.rotate(0),
    k.color(255, 255, 255),
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
    if (getIsPaused()) return;

    // Find player
    const player = k.get('player')[0];
    if (!player) return;

    // Freeze while player is invincible or enemy is stunned
    if (asura.stunned || player.invincible) return;

    // Flee when Mara is defeated
    if (shouldEnemiesFlee()) {
      applyFleeMovement(k, asura, cfg.speed);
      return;
    }

    // Calculate direct path toward player (aggressive, no wobble)
    const dx = player.pos.x - asura.pos.x;
    const dy = player.pos.y - asura.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Direct movement with delta time (with patience slowdown, wave scaling, and cycle scaling)
      const waveSpeedMult = config.effects?.waveSpeedMultiplier ?? 0.025;
      const waveMultiplier = 1 + waveSpeedMult * getCurrentWaveNumber();
      const speed = cfg.speed * getEnemySpeedMultiplier() * waveMultiplier * getEnemySpeedScaling();
      asura.pos.x += dirX * speed * k.dt();
      asura.pos.y += dirY * speed * k.dt();

      // Rotate to face player
      asura.angle = k.rad2deg(Math.atan2(dy, dx));
    }

    // Destroy if too far off screen
    const margin = config.enemies.offscreenMargin;
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
