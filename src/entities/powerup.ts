// Powerup entity - virtue orbs dropped by enemies
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getIsPaused } from '../ui/pauseMenu';
import { getIsPlayerDead } from './player';
import { getDropRateMultiplier, getPadumaDropRateBonus } from '../systems/rebirthEffects';
import { getDifficultyMultiplier } from '../systems/difficulty';
import { getCycle } from '../stores/gameStore';
import { spawnVajraIdleParticle } from '../systems/particles';
import { getCurrentWaveNumber } from '../systems/waveManager';

// Track last wave when Vajra dropped (for wave cooldown)
let lastVajraWave = -999;

export type VirtueType = 'compassion' | 'wisdom' | 'patience' | 'diligence' | 'meditation' | 'paduma';

const BASE_VIRTUE_TYPES: VirtueType[] = ['compassion', 'wisdom', 'patience', 'diligence', 'meditation'];

// Map virtue types to sprite names
const VIRTUE_SPRITES: Record<string, string> = {
  compassion: 'powerup_compassion',
  wisdom: 'powerup_wisdom',
  patience: 'powerup_patience',
  diligence: 'powerup_diligence',
  meditation: 'powerup_meditation',
};

export function createPowerup(k: KAPLAYCtx, x: number, y: number): GameObj {
  // Random virtue type (Paduma handled separately via createPaduma)
  const virtueType = BASE_VIRTUE_TYPES[Math.floor(k.rand(0, BASE_VIRTUE_TYPES.length))];
  const spriteName = VIRTUE_SPRITES[virtueType];

  const powerup = k.add([
    k.sprite(spriteName),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), config.powerups.size.width, config.powerups.size.width) }),
    k.color(255, 255, 255),
    k.opacity(0.9),
    'powerup',
    { virtueType },
  ]);

  // Gentle pulse effect
  let pulsePhase = 0;

  powerup.onUpdate(() => {
    if (getIsPaused() || getIsPlayerDead()) return;

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
  const modifiedChance = baseChance * getDropRateMultiplier() * getDifficultyMultiplier('dropRateMultiplier');
  return k.rand(0, 1) < modifiedChance;
}

// Paduma: separate drop chance, only in Kalpa 2+, boosted by Sacca and difficulty
export function shouldDropPaduma(k: KAPLAYCtx): boolean {
  if (getCycle() < config.powerups.paduma.minKalpa) return false;
  const baseChance = config.powerups.paduma.dropChance;
  const modifiedChance = (baseChance + getPadumaDropRateBonus()) * getDifficultyMultiplier('dropRateMultiplier');
  return k.rand(0, 1) < modifiedChance;
}

export function createPaduma(k: KAPLAYCtx, x: number, y: number): GameObj {
  const startX = x;

  const powerup = k.add([
    k.sprite('paduma'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), config.powerups.size.width, config.powerups.size.width) }),
    k.color(255, 255, 255),
    k.opacity(0.9),
    'powerup',
    { virtueType: 'paduma' as VirtueType },
  ]);

  let phase = 0;

  powerup.onUpdate(() => {
    if (getIsPaused() || getIsPlayerDead()) return;
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

// Check if Vajra can spawn (respects wave cooldown)
function canSpawnVajra(): boolean {
  const currentWave = getCurrentWaveNumber();
  const cooldown = config.powerups.vajra.waveCooldown;
  return currentWave - lastVajraWave >= cooldown;
}

// Mark Vajra as spawned this wave
export function markVajraSpawned(): void {
  lastVajraWave = getCurrentWaveNumber();
}

// Reset Vajra cooldown (call on scene start)
export function resetVajraCooldown(): void {
  lastVajraWave = -999;
}

// Vajra: rare 1.5% drop, replaces normal powerup roll, with wave cooldown
export function shouldDropVajra(k: KAPLAYCtx): boolean {
  if (!canSpawnVajra()) return false;
  return k.rand(0, 1) < config.powerups.vajra.dropChance;
}

// Vajra: golden thunderbolt that clears all enemies
export function createVajra(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.powerups.vajra;
  let particleTimer = 0;

  const vajra = k.add([
    k.sprite('vajra'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.color(255, 255, 255),
    k.opacity(0.95),
    k.rotate(0),
    'vajra',
  ]);

  vajra.onUpdate(() => {
    if (getIsPaused() || getIsPlayerDead()) return;

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
