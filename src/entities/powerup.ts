// Powerup entity - virtue orbs dropped by enemies
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { isPaused } from '../ui/pauseMenu';
import { getDropRateMultiplier, getPadumaDropRateBonus } from '../systems/rebirthEffects';
import { getCycle } from '../stores/gameStore';

export type VirtueType = 'compassion' | 'wisdom' | 'patience' | 'diligence' | 'meditation' | 'paduma';

const BASE_VIRTUE_TYPES: VirtueType[] = ['compassion', 'wisdom', 'patience', 'diligence', 'meditation'];

export function createPowerup(k: KAPLAYCtx, x: number, y: number): GameObj {
  // Random virtue type (Paduma handled separately via createPaduma)
  const virtueType = BASE_VIRTUE_TYPES[Math.floor(k.rand(0, BASE_VIRTUE_TYPES.length))];
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

// Paduma: separate drop chance, only in Kalpa 2+, boosted by Sacca
export function shouldDropPaduma(k: KAPLAYCtx): boolean {
  if (getCycle() < config.powerups.paduma.minKalpa) return false;
  const baseChance = config.powerups.paduma.dropChance;
  const modifiedChance = baseChance + getPadumaDropRateBonus();
  return k.rand(0, 1) < modifiedChance;
}

export function createPaduma(k: KAPLAYCtx, x: number, y: number): GameObj {
  const virtueConfig = config.powerups.virtues.paduma;
  const startX = x;

  const powerup = k.add([
    k.circle(config.powerups.size.width / 2),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.color(k.Color.fromHex(virtueConfig.color)),
    k.opacity(0.9),
    k.outline(2, k.Color.fromHex('#FFFFFF')),
    'powerup',
    { virtueType: 'paduma' as VirtueType },
  ]);

  let phase = 0;

  powerup.onUpdate(() => {
    if (isPaused) return;
    phase += 2 * k.dt();
    // Float upward with sinusoidal sway
    powerup.pos.y -= config.powerups.fallSpeed * 0.5 * k.dt();
    powerup.pos.x = startX + Math.sin(phase) * 30;
    powerup.opacity = 0.7 + Math.sin(phase * 2) * 0.3;
    // Destroy when off top of screen
    if (powerup.pos.y < -50) {
      powerup.destroy();
    }
  });

  return powerup;
}
