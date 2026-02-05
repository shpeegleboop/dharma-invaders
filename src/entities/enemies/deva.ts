// Deva - floaty, graceful sinusoidal movement toward player
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getEnemySpeedMultiplier } from '../../systems/powerupEffects';
import { getIsPaused } from '../../ui/pauseMenu';
import { getCurrentWaveNumber } from '../../systems/waveManager';
import { shouldEnemiesFlee, applyFleeMovement } from '../../systems/enemyFlee';
import { getEnemySpeedScaling } from '../../systems/cycleScaling';

let devaIdCounter = 0;

export function createDeva(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.enemies.deva;
  const enemyId = `deva_${++devaIdCounter}`;

  // Graceful floating movement variables
  let floatPhase = k.rand(0, Math.PI * 2);
  const floatFrequency = k.rand(1.5, 2.5);
  const floatAmplitude = k.rand(40, 60);

  // Store initial approach angle
  const player = k.get('player')[0];
  let baseAngle = player
    ? Math.atan2(player.pos.y - y, player.pos.x - x)
    : 0;

  const deva = k.add([
    k.sprite('deva'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.rotate(0),
    k.color(255, 255, 255),
    k.health(cfg.health),
    k.opacity(0.9),
    'enemy',
    'deva',
    { enemyId, type: 'deva', karmaValue: cfg.karmaValue, speed: cfg.speed, stunned: false },
  ]);

  events.emit('enemy:spawned', {
    id: enemyId,
    type: 'deva',
    position: { x, y },
  });

  deva.onUpdate(() => {
    if (getIsPaused()) return;

    // Find player
    const player = k.get('player')[0];
    if (!player) return;

    // Freeze while player is invincible or enemy is stunned
    if (deva.stunned || player.invincible) return;

    // Flee when Mara is defeated
    if (shouldEnemiesFlee()) {
      applyFleeMovement(k, deva, cfg.speed);
      return;
    }

    // Update base angle slowly (lazy tracking)
    const targetAngle = Math.atan2(
      player.pos.y - deva.pos.y,
      player.pos.x - deva.pos.x
    );
    // Smoothly interpolate toward player (graceful, not aggressive)
    const angleDiff = targetAngle - baseAngle;
    baseAngle += angleDiff * cfg.angleSmoothing * k.dt();

    // Sinusoidal perpendicular movement for graceful floating
    floatPhase += floatFrequency * k.dt();
    const perpAngle = baseAngle + Math.PI / 2;
    const floatOffset = Math.sin(floatPhase) * floatAmplitude * k.dt();

    // Move forward along base angle + perpendicular float (with patience slowdown, wave scaling, and cycle scaling)
    const waveSpeedMult = config.effects?.waveSpeedMultiplier ?? 0.025;
    const waveMultiplier = 1 + waveSpeedMult * getCurrentWaveNumber();
    const speed = cfg.speed * getEnemySpeedMultiplier() * waveMultiplier * getEnemySpeedScaling();
    deva.pos.x += Math.cos(baseAngle) * speed * k.dt();
    deva.pos.y += Math.sin(baseAngle) * speed * k.dt();
    deva.pos.x += Math.cos(perpAngle) * floatOffset;
    deva.pos.y += Math.sin(perpAngle) * floatOffset;

    // Gentle rotation (floaty feel)
    deva.angle = k.rad2deg(baseAngle) + Math.sin(floatPhase * 0.5) * cfg.rotationAmplitude;

    // Destroy if too far off screen
    const margin = config.enemies.offscreenMargin;
    if (
      deva.pos.x < -margin ||
      deva.pos.x > config.screen.width + margin ||
      deva.pos.y < config.arena.offsetY - margin ||
      deva.pos.y > config.screen.height + margin
    ) {
      events.emit('enemy:escaped', { id: deva.enemyId });
      deva.destroy();
    }
  });

  return deva;
}
