// Rebirth effects - multipliers from accumulated paramis/kleshas
import { getGameState } from '../stores/gameStore';

// Count occurrences of a parami/klesha in the store
function countParami(name: string): number {
  return getGameState().paramis.filter(p => p === name).length;
}

function countKlesha(name: string): number {
  return getGameState().kleshas.filter(k => k === name).length;
}

// Dana (+25% per stack) vs Lobha (-25% per stack) - both multiplicative
export function getDropRateMultiplier(): number {
  const dana = countParami('Dana');
  const lobha = countKlesha('Lobha');
  return Math.max(0.1, 1 + (dana * 0.25) - (lobha * 0.25));
}

// Sacca: additive +0.05 to Paduma drop rate per stack
export function getPadumaDropRateBonus(): number {
  const sacca = countParami('Sacca');
  return sacca * 0.05;
}

// Viriya (+10% fire rate = -10% cooldown) vs Vicikiccha (-10% fire rate = +10% cooldown)
export function getFireRateMultiplier(): number {
  const viriya = countParami('Viriya');
  const vicikiccha = countKlesha('Vicikiccha');
  // Lower = faster fire rate (cooldown multiplier)
  return Math.max(0.2, 1 - (viriya * 0.10) + (vicikiccha * 0.10));
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

// Khanti (+20% powerup duration) vs Moha (-20% powerup duration)
export function getPowerupDurationMultiplier(): number {
  const khanti = countParami('Khanti');
  const moha = countKlesha('Moha');
  return Math.max(0.2, 1 + (khanti * 0.20) - (moha * 0.20));
}

// Panna (+1 damage) vs Anottappa (-1 damage, min 1 total)
export function getProjectileDamageModifier(): number {
  const panna = countParami('Panna');
  const anottappa = countKlesha('Anottappa');
  return panna - anottappa;
}

// Thina (-10% player speed per stack)
export function getPlayerSpeedMultiplier(): number {
  const thina = countKlesha('Thina');
  return Math.max(0.3, 1 - (thina * 0.10));
}

// Nekkhamma (+0.5x karma) vs Micchaditthi (-0.25x karma)
export function getKarmaMultiplier(): number {
  const nekkhamma = countParami('Nekkhamma');
  const micchaditthi = countKlesha('Micchaditthi');
  return Math.max(0.25, 1 + (nekkhamma * 0.50) - (micchaditthi * 0.25));
}

// Adhitthana (+1 shield charge per stack)
export function getShieldChargesBonus(): number {
  return countParami('Adhitthana');
}

// Sila (start each life with Meditation shield)
export function hasSila(): boolean {
  return countParami('Sila') > 0;
}

// Debug: get current effect summary
export function getEffectSummary(): string {
  const hp = getMaxHealthModifier();
  const hpStr = hp >= 0 ? `+${hp}` : `${hp}`;
  const dmg = getProjectileDamageModifier();
  const dmgStr = dmg >= 0 ? `+${dmg}` : `${dmg}`;
  return [
    `Drop:${getDropRateMultiplier().toFixed(2)}x`,
    `Fire:${getFireRateMultiplier().toFixed(2)}x`,
    `HP:${hpStr}`,
    `Dmg:${dmgStr}`,
    `ESpd:${getEnemySpeedMultiplier().toFixed(2)}x`,
    `PSpd:${getPlayerSpeedMultiplier().toFixed(2)}x`,
    `Karma:${getKarmaMultiplier().toFixed(2)}x`,
    `Dur:${getPowerupDurationMultiplier().toFixed(2)}x`,
  ].join(' | ');
}
