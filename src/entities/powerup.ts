// Powerup entity - virtue orbs dropped by enemies
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { isPaused } from '../ui/pauseMenu';
import { getDropRateMultiplier } from '../systems/rebirthEffects';

export type VirtueType = 'compassion' | 'wisdom' | 'patience' | 'diligence' | 'meditation';

const VIRTUE_TYPES: VirtueType[] = ['compassion', 'wisdom', 'patience', 'diligence', 'meditation'];

export function createPowerup(k: KAPLAYCtx, x: number, y: number): GameObj {
  // Random virtue type
  const virtueType = VIRTUE_TYPES[Math.floor(k.rand(0, VIRTUE_TYPES.length))];
  const virtueConfig = config.powerups.virtues[virtueType];

  const powerup = k.add([
    k.circle(config.powerups.size.width / 2),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.color(k.Color.fromHex(virtueConfig.color)),
    k.opacity(0.9),
    k.outline(2, k.Color.fromHex('#FFFFFF')),
    'powerup',
    { virtueType },
  ]);

  // Gentle pulse effect
  let pulsePhase = 0;

  powerup.onUpdate(() => {
    if (isPaused) return;

    // Drift downward
    powerup.pos.y += config.powerups.fallSpeed * k.dt();

    // Pulse effect
    pulsePhase += 4 * k.dt();
    powerup.opacity = 0.7 + Math.sin(pulsePhase) * 0.3;

    // Destroy if off screen
    if (powerup.pos.y > config.screen.height + 50) {
      powerup.destroy();
    }
  });

  return powerup;
}

export function shouldDropPowerup(k: KAPLAYCtx): boolean {
  const baseChance = config.powerups.dropChance;
  const modifiedChance = baseChance * getDropRateMultiplier();
  return k.rand(0, 1) < modifiedChance;
}
