// Tiracchana (Animal) - pack movement with wobble, removes Parami on hit
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getEnemySpeedMultiplier } from '../../systems/powerupEffects';
import { getIsPaused } from '../../ui/pauseMenu';
import { getCurrentWaveNumber } from '../../systems/waveManager';
import { shouldEnemiesFlee, applyFleeMovement } from '../../systems/enemyFlee';
import { getEnemySpeedScaling } from '../../systems/cycleScaling';

let tiracchanaIdCounter = 0;

export function createTiracchana(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.newEnemies.tiracchana;
  const enemyId = `tiracchana_${++tiracchanaIdCounter}`;

  // Random wobble phase offset for pack variety
  const wobbleOffset = k.rand(0, Math.PI * 2);
  let time = 0;

  const tiracchana = k.add([
    k.sprite('tiracchana'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.rotate(0),
    k.color(255, 255, 255),
    k.health(cfg.health),
    'enemy',
    'tiracchana',
    {
      enemyId,
      type: 'tiracchana',
      karmaValue: cfg.karmaValue,
      damage: cfg.damage,
      stunned: false,
      isTiracchana: true, // Flag for special collision handling
    },
  ]);

  events.emit('enemy:spawned', {
    id: enemyId,
    type: 'tiracchana',
    position: { x, y },
  });

  tiracchana.onUpdate(() => {
    if (getIsPaused()) return;

    const player = k.get('player')[0];
    if (!player) return;

    if (tiracchana.stunned || player.invincible) return;

    // Flee when Mara is defeated
    if (shouldEnemiesFlee()) {
      applyFleeMovement(k, tiracchana, cfg.speed);
      return;
    }

    time += k.dt();

    // Calculate direction toward player
    const dx = player.pos.x - tiracchana.pos.x;
    const dy = player.pos.y - tiracchana.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const dirX = dx / dist;
      const dirY = dy / dist;

      // Intense wobble (perpendicular to movement)
      const wobbleFreq = config.effects?.wobbleFrequency ?? 8;
      const wobble = Math.sin(time * wobbleFreq + wobbleOffset) * cfg.wobbleIntensity;
      const perpX = -dirY * wobble;
      const perpY = dirX * wobble;

      // Combined movement
      const waveSpeedMult = config.effects?.waveSpeedMultiplier ?? 0.025;
      const waveMultiplier = 1 + waveSpeedMult * getCurrentWaveNumber();
      const speed = cfg.speed * getEnemySpeedMultiplier() * waveMultiplier * getEnemySpeedScaling();

      tiracchana.pos.x += (dirX + perpX * 0.3) * speed * k.dt();
      tiracchana.pos.y += (dirY + perpY * 0.3) * speed * k.dt();

      // Rotate to face movement direction
      tiracchana.angle = k.rad2deg(Math.atan2(dy, dx)) + 90;
    }

    // Destroy if too far off screen
    const margin = config.enemies.offscreenMargin;
    if (
      tiracchana.pos.x < -margin ||
      tiracchana.pos.x > config.screen.width + margin ||
      tiracchana.pos.y < config.arena.offsetY - margin ||
      tiracchana.pos.y > config.screen.height + margin
    ) {
      events.emit('enemy:escaped', { id: tiracchana.enemyId });
      tiracchana.destroy();
    }
  });

  return tiracchana;
}
