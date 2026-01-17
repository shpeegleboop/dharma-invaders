// Powerup effects system - manages active powerups with stacking
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

// Timed powerups that use stacking system
type StackablePowerup = 'diligence' | 'patience' | 'compassion' | 'wisdom';

type PowerupStack = {
  stacks: number;
  timeRemaining: number;
};

type PowerupState = {
  active: Map<StackablePowerup, PowerupStack>;
  shieldCharges: number; // Meditation handled separately
  shieldActive: boolean;
};

const state: PowerupState = {
  active: new Map(),
  shieldCharges: 0,
  shieldActive: false,
};

let hudText: GameObj | null = null;
let kRef: KAPLAYCtx | null = null;

const stackingConfig = config.powerups.stacking;

export function setupPowerupEffects(k: KAPLAYCtx): void {
  kRef = k;
  state.active.clear();
  state.shieldCharges = 0;
  state.shieldActive = false;

  // Create powerup display in HUD
  hudText = k.add([
    k.text('', { size: 14 }),
    k.pos(16, config.hud.height - 12),
    k.anchor('left'),
    k.color(255, 255, 255),
    k.fixed(),
    'powerupText',
  ]);

  // Listen for powerup collection
  events.on('player:powerup', (data) => {
    activatePowerup(data.type as VirtueType);
  });

  // Listen for shield hit
  events.on('powerup:shieldBroken', () => {
    if (state.shieldActive) {
      state.shieldCharges--;
      if (state.shieldCharges <= 0) {
        state.shieldActive = false;
        state.shieldCharges = 0;
        events.emit('powerup:deactivated', { type: 'meditation' });
      }
      updateHUD();
    }
  });

  // Listen for player death - clear all timed powerups
  events.on('player:died', () => {
    state.active.clear();
    // Shield handled by Sila on respawn
    state.shieldActive = false;
    state.shieldCharges = 0;
    updateHUD();
  });

  // Update timers
  k.onUpdate(() => {
    if (isPaused) return;

    const dt = k.dt() * 1000;
    const toRemove: StackablePowerup[] = [];

    state.active.forEach((stack, type) => {
      stack.timeRemaining -= dt;
      if (stack.timeRemaining <= 0) {
        toRemove.push(type);
      }
    });

    toRemove.forEach((type) => {
      state.active.delete(type);
      events.emit('powerup:deactivated', { type });
    });

    if (state.active.size > 0 || toRemove.length > 0) {
      updateHUD();
    }
  });
}

function isStackable(type: VirtueType): type is StackablePowerup {
  return type === 'diligence' || type === 'patience' || type === 'compassion' || type === 'wisdom';
}

function activatePowerup(type: VirtueType): void {
  // Paduma is instant heal, handled elsewhere
  if (type === 'paduma') return;

  // Meditation uses shield system
  if (type === 'meditation') {
    state.shieldActive = true;
    state.shieldCharges = 1 + getShieldChargesBonus();
    events.emit('powerup:activated', { type });
    updateHUD();
    return;
  }

  // Stackable timed powerups
  if (!isStackable(type)) return;

  const typeConfig = stackingConfig[type];
  const baseDuration = stackingConfig.baseDuration * getPowerupDurationMultiplier();
  const maxTime = stackingConfig.maxTimeCap * getPowerupDurationMultiplier();

  const existing = state.active.get(type);

  if (existing) {
    // Add stack (if under max) and time
    if (existing.stacks < typeConfig.maxStacks) {
      existing.stacks++;
    }
    existing.timeRemaining = Math.min(existing.timeRemaining + baseDuration, maxTime);
  } else {
    // New powerup entry
    state.active.set(type, {
      stacks: 1,
      timeRemaining: baseDuration,
    });
    events.emit('powerup:activated', { type });
  }

  updateHUD();
}

function updateHUD(): void {
  if (!hudText || !kRef) return;

  const parts: string[] = [];

  // Timed powerups
  state.active.forEach((stack, type) => {
    const virtueConfig = config.powerups.virtues[type];
    const seconds = Math.ceil(stack.timeRemaining / 1000);
    const stackText = stack.stacks > 1 ? ` x${stack.stacks}` : '';
    parts.push(`${virtueConfig.name}${stackText} ${seconds}s`);
  });

  // Shield
  if (state.shieldActive) {
    const chargeText = state.shieldCharges > 1 ? ` x${state.shieldCharges}` : '';
    parts.push(`Shield${chargeText}`);
  }

  hudText.text = parts.join(' | ');
  hudText.color = kRef.Color.fromHex('#FFFFFF');
}

// === Public API ===

export function getStacks(type: StackablePowerup): number {
  return state.active.get(type)?.stacks ?? 0;
}

export function hasPowerup(type: VirtueType): boolean {
  if (type === 'meditation') return state.shieldActive;
  if (type === 'paduma') return false;
  if (isStackable(type)) return state.active.has(type);
  return false;
}

// Legacy getter for collision.ts compatibility
export function getActivePowerup(): VirtueType | null {
  if (state.shieldActive) return 'meditation';
  if (state.active.has('wisdom')) return 'wisdom';
  if (state.active.has('compassion')) return 'compassion';
  if (state.active.has('diligence')) return 'diligence';
  if (state.active.has('patience')) return 'patience';
  return null;
}

// Diligence: (0.5)^stacks cooldown multiplier, combined with rebirth
export function getShootCooldownMultiplier(): number {
  const stacks = getStacks('diligence');
  const powerupMultiplier = stacks > 0 ? Math.pow(0.5, stacks) : 1;
  const rebirthMultiplier = getRebirthFireRate();
  return powerupMultiplier * rebirthMultiplier;
}

// Patience: 10% slow per stack (max 50% at 5 stacks), combined with rebirth
export function getEnemySpeedMultiplier(): number {
  const stacks = getStacks('patience');
  const slowPerStack = stackingConfig.patience.slowPerStack ?? 0.10;
  const powerupMultiplier = stacks > 0 ? 1 - (stacks * slowPerStack) : 1;
  const rebirthMultiplier = getRebirthEnemySpeed();
  return powerupMultiplier * rebirthMultiplier;
}

// Compassion: spread shot active
export function isSpreadShotActive(): boolean {
  return state.active.has('compassion');
}

// Wisdom: piercing active (checked via hasPowerup in collision.ts)
export function isPiercingActive(): boolean {
  return state.active.has('wisdom');
}

// Shield charge getters/setters for persistence across kalpas
export function getShieldCharges(): number {
  return state.shieldActive ? state.shieldCharges : 0;
}

export function restoreShieldCharges(charges: number): void {
  if (charges > 0) {
    state.shieldActive = true;
    state.shieldCharges = charges;
    updateHUD();
  }
}
