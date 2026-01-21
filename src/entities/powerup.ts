// Powerup entity - virtue orbs dropped by enemies
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getIsPaused } from '../ui/pauseMenu';
import { getDropRateMultiplier, getPadumaDropRateBonus } from '../systems/rebirthEffects';
import { getCycle } from '../stores/gameStore';
import { spawnVajraIdleParticle } from '../systems/particles';

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
    if (getIsPaused()) return;

    // Drift downward
    powerup.pos.y += config.powerups.fallSpeed * k.dt();

    // Pulse effect
    pulsePhase += 4 * k.dt();
    powerup.opacity = 0.7 + Math.sin(pulsePhase) * 0.3;

    // Destroy if off screen
    if (powerup.pos.y > config.screen.height + config.powerups.offscreenMargin) {
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
    if (getIsPaused()) return;
    phase += 2 * k.dt();
    // Float upward with sinusoidal sway
    powerup.pos.y -= config.powerups.fallSpeed * 0.5 * k.dt();
    powerup.pos.x = startX + Math.sin(phase) * config.powerups.paduma.swayAmplitude;
    powerup.opacity = 0.7 + Math.sin(phase * 2) * 0.3;
    // Destroy when off top of screen
    if (powerup.pos.y < -config.powerups.offscreenMargin) {
      powerup.destroy();
    }
  });

  return powerup;
}

// Vajra: rare 2% drop, replaces normal powerup roll
export function shouldDropVajra(k: KAPLAYCtx): boolean {
  return k.rand(0, 1) < config.powerups.vajra.dropChance;
}

// Vajra: golden thunderbolt that clears all enemies
export function createVajra(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.powerups.vajra;
  let particleTimer = 0;

  const vajra = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.color(k.Color.fromHex(cfg.color)),
    k.opacity(0.95),
    k.outline(3, k.Color.fromHex('#FFFFFF')),
    k.rotate(45),
    'vajra',
  ]);

  vajra.onUpdate(() => {
    if (getIsPaused()) return;

    // Drift downward (same as normal powerups)
    vajra.pos.y += config.powerups.fallSpeed * k.dt();

    // Gentle rotation
    vajra.angle += 30 * k.dt();

    // Spawn idle sparkle particles
    particleTimer += k.dt();
    if (particleTimer >= 0.1) {
      particleTimer = 0;
      for (let i = 0; i < cfg.particleCount.idle; i++) {
        spawnVajraIdleParticle(vajra.pos.x, vajra.pos.y);
      }
    }

    // Destroy if off screen
    if (vajra.pos.y > config.screen.height + config.powerups.offscreenMargin) {
      vajra.destroy();
    }
  });

  return vajra;
}
