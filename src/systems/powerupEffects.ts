// Powerup effects system - manages active powerup state and timers
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import type { VirtueType } from '../entities/powerup';
import { isPaused } from '../ui/pauseMenu';
import {
  getFireRateMultiplier as getRebirthFireRate,
  getEnemySpeedMultiplier as getRebirthEnemySpeed,
  getPowerupDurationMultiplier,
  getShieldChargesBonus,
} from './rebirthEffects';

type PowerupState = {
  active: VirtueType | null;
  timeRemaining: number;
  shieldCharges: number;
};

const state: PowerupState = {
  active: null,
  timeRemaining: 0,
  shieldCharges: 0,
};

let hudText: GameObj | null = null;
let kRef: KAPLAYCtx | null = null;

export function setupPowerupEffects(k: KAPLAYCtx): void {
  kRef = k;
  state.active = null;
  state.timeRemaining = 0;
  state.shieldCharges = 0;

  // Create powerup display in HUD (left side, below health)
  hudText = k.add([
    k.text('', { size: 16 }),
    k.pos(16, config.hud.height - 12),
    k.anchor('left'),
    k.color(255, 255, 255),
    k.fixed(),
    'powerupText',
  ]);

  // Listen for powerup collection
  events.on('player:powerup', (data) => {
    activatePowerup(k, data.type as VirtueType);
  });

  // Listen for shield hit - decrement charges, break if none left
  events.on('powerup:shieldBroken', () => {
    if (state.active === 'meditation') {
      state.shieldCharges--;
      if (state.shieldCharges <= 0) {
        deactivatePowerup();
      } else {
        updateHUD();
      }
    }
  });

  // Listen for player death
  events.on('player:died', () => {
    deactivatePowerup();
  });

  // Update timer
  k.onUpdate(() => {
    if (isPaused) return;
    if (state.active && state.active !== 'meditation') {
      state.timeRemaining -= k.dt() * 1000;
      if (state.timeRemaining <= 0) {
        deactivatePowerup();
      }
      updateHUD();
    }
  });
}

function activatePowerup(_k: KAPLAYCtx, type: VirtueType): void {
  // Deactivate previous powerup
  if (state.active) {
    deactivatePowerup();
  }

  state.active = type;

  // Meditation lasts until hit, others have duration (with Khanti/Moha modifier)
  if (type === 'meditation') {
    state.timeRemaining = -1; // Infinite until broken
    state.shieldCharges = 1 + getShieldChargesBonus(); // Base 1 + Adhitthana bonus
  } else {
    state.timeRemaining = config.powerups.duration * getPowerupDurationMultiplier();
    state.shieldCharges = 0;
  }

  events.emit('powerup:activated', { type });
  updateHUD();
}

function deactivatePowerup(): void {
  if (state.active) {
    events.emit('powerup:deactivated', { type: state.active });
  }
  state.active = null;
  state.timeRemaining = 0;
  updateHUD();
}

function updateHUD(): void {
  if (!hudText || !kRef) return;

  if (!state.active) {
    hudText.text = '';
    return;
  }

  const virtueConfig = config.powerups.virtues[state.active];
  const name = virtueConfig.name;

  if (state.active === 'meditation') {
    const chargeText = state.shieldCharges > 1 ? ` x${state.shieldCharges}` : '';
    hudText.text = `${name} (Shield${chargeText})`;
  } else {
    const seconds = Math.ceil(state.timeRemaining / 1000);
    hudText.text = `${name} (${seconds}s)`;
  }

  hudText.color = kRef.Color.fromHex(virtueConfig.color);
}

// Getter for checking active powerup from other systems
export function getActivePowerup(): VirtueType | null {
  return state.active;
}

// For diligence (rapid fire) - returns cooldown multiplier
// Stacks with Viriya/Vicikiccha rebirth effects
export function getShootCooldownMultiplier(): number {
  const powerupMultiplier = state.active === 'diligence' ? 0.5 : 1;
  const rebirthMultiplier = getRebirthFireRate();
  return powerupMultiplier * rebirthMultiplier;
}

// For patience (slow enemies) - returns speed multiplier
// Stacks with Upekkha/Dosa rebirth effects
export function getEnemySpeedMultiplier(): number {
  const powerupMultiplier = state.active === 'patience' ? 0.5 : 1;
  const rebirthMultiplier = getRebirthEnemySpeed();
  return powerupMultiplier * rebirthMultiplier;
}

// For compassion (spread shot) - returns true if active
export function isSpreadShotActive(): boolean {
  return state.active === 'compassion';
}

