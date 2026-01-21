// Powerup effects system - manages active powerups with stacking
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import type { VirtueType } from '../entities/powerup';
import { getIsPaused } from '../ui/pauseMenu';
import {
  getFireRateMultiplier as getRebirthFireRate,
  getEnemySpeedMultiplier as getRebirthEnemySpeed,
  getPowerupDurationMultiplier,
} from './rebirthEffects';
import {
  setupShieldSystem,
  activateShield,
  isShieldActive,
  getShieldCharges,
  restoreShieldCharges as restoreShield,
} from './shieldSystem';

// Timed powerups that use stacking system
type StackablePowerup = 'diligence' | 'patience' | 'compassion' | 'wisdom';

type PowerupStack = {
  stacks: number;
  timeRemaining: number;
};

const activeMap = new Map<StackablePowerup, PowerupStack>();
let hudText: GameObj | null = null;
let kRef: KAPLAYCtx | null = null;

const stackingConfig = config.powerups.stacking;

export function setupPowerupEffects(k: KAPLAYCtx): void {
  kRef = k;
  activeMap.clear();
  setupShieldSystem();

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

  // Listen for shield changes to update HUD
  events.on('powerup:shieldBroken', updateHUD);

  // Listen for player death - clear all timed powerups
  events.on('player:died', () => {
    activeMap.clear();
    updateHUD();
  });

  // Update timers
  k.onUpdate(() => {
    if (getIsPaused()) return;

    const dt = k.dt() * 1000;
    const toRemove: StackablePowerup[] = [];

    activeMap.forEach((stack, type) => {
      stack.timeRemaining -= dt;
      if (stack.timeRemaining <= 0) {
        toRemove.push(type);
      }
    });

    toRemove.forEach((type) => {
      activeMap.delete(type);
      events.emit('powerup:deactivated', { type });
    });

    if (activeMap.size > 0 || toRemove.length > 0) {
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
    const isNew = activateShield();
    if (isNew) {
      events.emit('powerup:activated', { type });
    }
    updateHUD();
    return;
  }

  // Stackable timed powerups
  if (!isStackable(type)) return;

  const typeConfig = stackingConfig[type];
  const baseDuration = stackingConfig.baseDuration * getPowerupDurationMultiplier();
  const maxTime = stackingConfig.maxTimeCap * getPowerupDurationMultiplier();

  const existing = activeMap.get(type);

  if (existing) {
    if (existing.stacks < typeConfig.maxStacks) {
      existing.stacks++;
    }
    existing.timeRemaining = Math.min(existing.timeRemaining + baseDuration, maxTime);
  } else {
    activeMap.set(type, { stacks: 1, timeRemaining: baseDuration });
    events.emit('powerup:activated', { type });
  }

  updateHUD();
}

function updateHUD(): void {
  if (!hudText || !kRef) return;

  const parts: string[] = [];

  activeMap.forEach((stack, type) => {
    const virtueConfig = config.powerups.virtues[type];
    const seconds = Math.ceil(stack.timeRemaining / 1000);
    const stackText = stack.stacks > 1 ? ` x${stack.stacks}` : '';
    parts.push(`${virtueConfig.name}${stackText} ${seconds}s`);
  });

  if (isShieldActive()) {
    const charges = getShieldCharges();
    const chargeText = charges > 1 ? ` x${charges}` : '';
    parts.push(`Shield${chargeText}`);
  }

  hudText.text = parts.join(' | ');
  hudText.color = kRef.Color.fromHex('#FFFFFF');
}

// === Public API ===

export function getStacks(type: StackablePowerup): number {
  return activeMap.get(type)?.stacks ?? 0;
}

export function hasPowerup(type: VirtueType): boolean {
  if (type === 'meditation') return isShieldActive();
  if (type === 'paduma') return false;
  if (isStackable(type)) return activeMap.has(type);
  return false;
}

// Diligence: (0.75)^stacks cooldown multiplier, combined with rebirth
export function getShootCooldownMultiplier(): number {
  const stacks = getStacks('diligence');
  const powerupMultiplier = stacks > 0 ? Math.pow(0.75, stacks) : 1;
  return powerupMultiplier * getRebirthFireRate();
}

// Patience: 10% slow per stack (max 50% at 5 stacks), combined with rebirth
export function getEnemySpeedMultiplier(): number {
  const stacks = getStacks('patience');
  const slowPerStack = stackingConfig.patience.slowPerStack ?? 0.10;
  const powerupMultiplier = stacks > 0 ? 1 - (stacks * slowPerStack) : 1;
  return powerupMultiplier * getRebirthEnemySpeed();
}

export function isSpreadShotActive(): boolean {
  return activeMap.has('compassion');
}

export function isPiercingActive(): boolean {
  return activeMap.has('wisdom');
}

// Legacy getter for collision.ts compatibility
export function getActivePowerup(): VirtueType | null {
  if (isShieldActive()) return 'meditation';
  if (activeMap.has('wisdom')) return 'wisdom';
  if (activeMap.has('compassion')) return 'compassion';
  if (activeMap.has('diligence')) return 'diligence';
  if (activeMap.has('patience')) return 'patience';
  return null;
}

// Re-export shield functions for external use
export { getShieldCharges, isShieldActive };

// Wrapper to restore shield AND update HUD
export function restoreShieldCharges(charges: number): void {
  restoreShield(charges);
  updateHUD();
}

// Reduce all active timed powerups to a specific remaining time (for Manussa kill)
// Does NOT affect shield charges
export function reduceAllTimers(remainingMs: number): void {
  activeMap.forEach((stack) => {
    if (stack.timeRemaining > remainingMs) {
      stack.timeRemaining = remainingMs;
    }
  });
  updateHUD();
}
