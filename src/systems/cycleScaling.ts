// Cycle (kalpa) difficulty scaling - logarithmic with caps
import config from '../data/config.json';
import { getCycle } from '../stores/gameStore';

const caps = config.roguelike.scaling;

// Logarithmic scaling: fast early gains, diminishing returns
// Cycle 1: 1.0x, Cycle 2: ~1.14x, Cycle 3: ~1.22x, Cycle 5: ~1.32x, Cycle 10: ~1.46x
function getScalingMultiplier(cap: number): number {
  const cycle = getCycle();
  if (cycle <= 1) return 1.0;

  const rawMultiplier = 1 + (Math.log(cycle) * 0.2);
  return Math.min(rawMultiplier, cap);
}

// Enemy speed multiplier (max 1.5x)
export function getEnemySpeedScaling(): number {
  return getScalingMultiplier(caps.enemySpeed);
}

// Enemy count per wave multiplier (max 1.3x)
export function getEnemyCountScaling(): number {
  return getScalingMultiplier(caps.enemyCount);
}

// Spawn rate multiplier - lower = faster spawns (max 1.4x, inverted)
export function getSpawnRateScaling(): number {
  // Invert: higher multiplier = shorter spawn delay
  return 1 / getScalingMultiplier(caps.spawnRate);
}

// Boss HP multiplier (max 2.0x)
export function getBossHPScaling(): number {
  return getScalingMultiplier(caps.bossHP);
}

// Debug: get current scaling summary
export function getScalingSummary(): string {
  const cycle = getCycle();
  return `Kalpa ${cycle} | Speed: ${getEnemySpeedScaling().toFixed(2)}x | Count: ${getEnemyCountScaling().toFixed(2)}x | Spawn: ${getSpawnRateScaling().toFixed(2)}x | Boss: ${getBossHPScaling().toFixed(2)}x`;
}
