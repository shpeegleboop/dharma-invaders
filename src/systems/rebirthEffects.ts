// Rebirth effects - multipliers from accumulated paramis/kleshas
import { getGameState } from '../stores/gameStore';

// Count occurrences of a parami/klesha in the store
function countParami(name: string): number {
  return getGameState().paramis.filter(p => p === name).length;
}

function countKlesha(name: string): number {
  return getGameState().kleshas.filter(k => k === name).length;
}

// Dana (+25% per stack) vs Lobha (-25% per stack)
export function getDropRateMultiplier(): number {
  const dana = countParami('Dana');
  const lobha = countKlesha('Lobha');
  return Math.max(0.1, 1 + (dana * 0.25) - (lobha * 0.25));
}

// Viriya (+15% fire rate = -15% cooldown) vs Vicikiccha (-15% fire rate = +15% cooldown)
export function getFireRateMultiplier(): number {
  const viriya = countParami('Viriya');
  const vicikiccha = countKlesha('Vicikiccha');
  // Lower = faster fire rate (cooldown multiplier)
  return Math.max(0.2, 1 - (viriya * 0.15) + (vicikiccha * 0.15));
}

// Metta (+1 max health) vs Mana (-1 max health, min 1)
export function getMaxHealthModifier(): number {
  const metta = countParami('Metta');
  const mana = countKlesha('Mana');
  return metta - mana;
}

// Upekkha (enemies 10% slower) vs Dosa (enemies 10% faster)
export function getEnemySpeedMultiplier(): number {
  const upekkha = countParami('Upekkha');
  const dosa = countKlesha('Dosa');
  // Lower = slower enemies
  return Math.max(0.3, 1 - (upekkha * 0.10) + (dosa * 0.10));
}

// Debug: get current effect summary
export function getEffectSummary(): string {
  const hp = getMaxHealthModifier();
  const hpStr = hp >= 0 ? `+${hp}` : `${hp}`;
  return `Drop: ${getDropRateMultiplier().toFixed(2)}x | Fire: ${getFireRateMultiplier().toFixed(2)}x | HP: ${hpStr} | Enemy Speed: ${getEnemySpeedMultiplier().toFixed(2)}x`;
}
