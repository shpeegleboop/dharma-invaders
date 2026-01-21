// Cycle (kalpa) difficulty scaling - logarithmic with caps
import config from '../data/config.json';
import { getCycle } from '../stores/gameStore';
import { getDifficultyMultiplier } from './difficulty';

const caps = config.roguelike.scaling;

// Logarithmic scaling: fast early gains, diminishing returns
// Kalpa 1: 1.0x, Kalpa 2: ~1.26x, Kalpa 5: ~1.61x, Kalpa 10: ~1.875x
function getScalingMultiplier(cap: number): number {
  const cycle = getCycle();
  if (cycle <= 1) return 1.0;

  const rawMultiplier = 1 + (Math.log(cycle) * 0.38);
  return Math.min(rawMultiplier, cap);
}

// Enemy speed multiplier (kalpa scaling × difficulty)
export function getEnemySpeedScaling(): number {
  return getScalingMultiplier(caps.enemySpeed) * getDifficultyMultiplier('enemySpeedMultiplier');
}

// Enemy count per wave multiplier (kalpa scaling × difficulty)
export function getEnemyCountScaling(): number {
  return getScalingMultiplier(caps.enemyCount) * getDifficultyMultiplier('spawnMultiplier');
}

// Spawn rate multiplier - lower = faster spawns (max 1.4x, inverted)
export function getSpawnRateScaling(): number {
  // Invert: higher multiplier = shorter spawn delay
  return 1 / getScalingMultiplier(caps.spawnRate);
}

// Boss HP multiplier (kalpa scaling × difficulty)
export function getBossHPScaling(): number {
  return getScalingMultiplier(caps.bossHP) * getDifficultyMultiplier('bossHealthMultiplier');
}

// Debug: get current scaling summary
export function getScalingSummary(): string {
  const cycle = getCycle();
  return `Kalpa ${cycle} | Speed: ${getEnemySpeedScaling().toFixed(2)}x | Count: ${getEnemyCountScaling().toFixed(2)}x | Spawn: ${getSpawnRateScaling().toFixed(2)}x | Boss: ${getBossHPScaling().toFixed(2)}x`;
}
