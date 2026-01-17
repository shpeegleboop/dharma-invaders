// Shield system - manages meditation shield state and charges
import { events } from '../utils/events';
import { getShieldChargesBonus } from './rebirthEffects';

type ShieldState = {
  charges: number;
  active: boolean;
};

const state: ShieldState = {
  charges: 0,
  active: false,
};

export function setupShieldSystem(): void {
  state.charges = 0;
  state.active = false;

  // Listen for shield hit
  events.on('powerup:shieldBroken', () => {
    if (state.active) {
      state.charges--;
      if (state.charges <= 0) {
        state.active = false;
        state.charges = 0;
        events.emit('powerup:deactivated', { type: 'meditation' });
      }
    }
  });

  // Listen for player death - clear shield
  events.on('player:died', () => {
    state.active = false;
    state.charges = 0;
  });
}

export function activateShield(): boolean {
  const wasActive = state.active;
  state.active = true;
  // Add 1 charge + Adhitthana bonus (only apply bonus on first pickup)
  const bonus = wasActive ? 0 : getShieldChargesBonus();
  state.charges += 1 + bonus;
  return !wasActive; // Returns true if this was the first activation
}

export function isShieldActive(): boolean {
  return state.active;
}

export function getShieldCharges(): number {
  return state.active ? state.charges : 0;
}

export function restoreShieldCharges(charges: number): void {
  if (charges > 0) {
    state.active = true;
    state.charges = charges;
  }
}

export function clearShield(): void {
  state.active = false;
  state.charges = 0;
}

// Absorb damage with shield charges, returns remaining damage to apply to HP
// E.g., absorbDamage(2) with 1 charge: consumes 1 charge, returns 1
export function absorbDamage(damage: number): number {
  if (!state.active || state.charges <= 0) {
    return damage; // No shield, full damage passes through
  }

  const absorbed = Math.min(damage, state.charges);
  state.charges -= absorbed;

  if (state.charges <= 0) {
    state.active = false;
    state.charges = 0;
  }

  return damage - absorbed; // Remaining damage after absorption
}
