// Cycle (kalpa) difficulty scaling - logarithmic with caps
import config from '../data/config.json';
import { getCycle, getGameState, getDifficulty } from '../stores/gameStore';
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

// Get base boss HP for current kalpa (fixed values per kalpa)
export function getBossBaseHP(): number {
  const cycle = getCycle();
  const hpByKalpa = config.boss.healthByKalpa as number[];
  // Kalpa 1-4 use fixed values, kalpa 5+ use kalpa 4 value with scaling
  if (cycle <= hpByKalpa.length) {
    return hpByKalpa[cycle - 1];
  }
  // Kalpa 5+: use kalpa 4 base + 10% per extra kalpa
  const extraKalpas = cycle - hpByKalpa.length;
  return Math.round(hpByKalpa[hpByKalpa.length - 1] * (1 + extraKalpas * 0.1));
}

// Boss HP multiplier (difficulty × Paññā bonus on NOAH)
export function getBossHPScaling(): number {
  let multiplier = getDifficultyMultiplier('bossHealthMultiplier');

  // NOAH only: Panna stacks increase boss HP by 85% per stack
  if (getDifficulty() === 'noah') {
    const pannaStacks = getGameState().paramis.filter(p => p === 'Panna').length;
    const pannaBonus = pannaStacks * 0.85;
    multiplier *= (1 + pannaBonus);
  }

  return multiplier;
}

// Debug: get current scaling summary
export function getScalingSummary(): string {
  const cycle = getCycle();
  const bossHP = Math.round(getBossBaseHP() * getBossHPScaling());
  return `Kalpa ${cycle} | Speed: ${getEnemySpeedScaling().toFixed(2)}x | Count: ${getEnemyCountScaling().toFixed(2)}x | Spawn: ${getSpawnRateScaling().toFixed(2)}x | Boss HP: ${bossHP}`;
}
