// Mara - the final boss, state machine driven
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { updateMaraAttacks, resetAttackTimers } from './maraCombat';
import { getIsPaused } from '../ui/pauseMenu';
import { getBossBaseHP, getBossHPScaling } from '../systems/cycleScaling';
import { getCycle } from '../stores/gameStore';

type MaraPhase = 'entering' | 'phase1' | 'phase2' | 'phase3' | 'defeated';

let mara: GameObj | null = null;
let currentPhase: MaraPhase = 'entering';
let deathAnimTimer = 0;
let movementTimer = 0;
let scaledMaxHealth = 0;
let isRageMode = false;

export function spawnMara(k: KAPLAYCtx): void {
  const cfg = config.boss;
  const kalpa = getCycle();

  currentPhase = 'entering';
  movementTimer = 0;
  resetAttackTimers();
  scaledMaxHealth = Math.round(getBossBaseHP() * getBossHPScaling());

  // Kalpa 4+: Rage mode - starts with phase 3 behavior
  isRageMode = kalpa >= cfg.evolution.rageMode.minKalpa;

  mara = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(config.screen.width / 2, -cfg.size.height),
    k.anchor('center'),
    k.area(),
    k.rotate(0),
    k.color(k.Color.fromHex(cfg.color)),
    k.health(scaledMaxHealth),
    k.opacity(1),
    'boss',
    'mara',
    { phase: currentPhase },
  ]);

  mara.onUpdate(() => {
    if (getIsPaused()) return;
    if (!mara) return;
    updateMara(k);
  });
}

function updateMara(k: KAPLAYCtx): void {
  if (!mara) return;

  switch (currentPhase) {
    case 'entering':
      updateEntering(k);
      break;
    case 'phase1':
    case 'phase2':
    case 'phase3':
      updateCombat(k);
      break;
    case 'defeated':
      updateDefeated(k);
      break;
  }
}

function updateEntering(k: KAPLAYCtx): void {
  if (!mara) return;
  const cfg = config.boss;

  // Descend to target position
  if (mara.pos.y < cfg.targetY) {
    mara.pos.y += cfg.entranceSpeed * k.dt();
  } else {
    mara.pos.y = cfg.targetY;
    currentPhase = 'phase1';
    mara.phase = 'phase1';
    events.emit('boss:started', {});
  }
}

function updateCombat(k: KAPLAYCtx): void {
  if (!mara) return;
  const cfg = config.boss;

  // Check phase transitions based on health (use scaled max health)
  const healthPercent = (mara.hp() / scaledMaxHealth) * 100;

  if (healthPercent <= cfg.phase3Threshold && currentPhase !== 'phase3') {
    currentPhase = 'phase3';
    mara.phase = 'phase3';
    // Adjust timer so position stays continuous when speed changes (skip if rage mode)
    if (!isRageMode) {
      movementTimer = movementTimer * (1.0 / cfg.movement.phase3SpeedMultiplier);
    }
    events.emit('boss:phaseChange', { phase: 3 });
  } else if (healthPercent <= cfg.phase2Threshold && currentPhase === 'phase1') {
    currentPhase = 'phase2';
    mara.phase = 'phase2';
    events.emit('boss:phaseChange', { phase: 2 });
  }

  // Figure-8 movement pattern (stays in upper half of screen)
  // Rage mode: always use phase 3 speed
  movementTimer += k.dt();
  const baseX = config.screen.width / 2;
  const baseY = cfg.targetY + cfg.movement.offsetY;
  const usePhase3Speed = currentPhase === 'phase3' || isRageMode;
  const speed = usePhase3Speed ? cfg.movement.phase3SpeedMultiplier : 1.0;
  mara.pos.x = baseX + Math.sin(movementTimer * speed) * cfg.movement.amplitudeX;
  mara.pos.y = baseY + Math.sin(movementTimer * speed * 2) * cfg.movement.amplitudeY;

  // Delegate attacks to maraCombat (handles kalpa-based evolution)
  const usePhase3Projectiles = currentPhase === 'phase3' || isRageMode;
  const spawnMinions = currentPhase === 'phase2' || currentPhase === 'phase3' || isRageMode;
  updateMaraAttacks(k, mara, usePhase3Projectiles, spawnMinions);

  // Phase 3 / Rage mode flash effect
  if (currentPhase === 'phase3' || isRageMode) {
    const flash = Math.sin(k.time() * 10) > 0;
    mara.opacity = flash ? 1 : cfg.phase3Opacity;
  }
}

function updateDefeated(k: KAPLAYCtx): void {
  if (!mara) return;
  const cfg = config.boss;

  deathAnimTimer += k.dt() * 1000;

  // Flash rapidly
  mara.opacity = Math.sin(deathAnimTimer * 0.05) > 0 ? 1 : 0.2;

  // After death animation duration, destroy and emit victory
  if (deathAnimTimer >= cfg.deathAnimDuration) {
    mara.destroy();
    mara = null;
    events.emit('game:victory', {});
  }
}

export function damageMara(amount: number): void {
  if (!mara || currentPhase === 'entering' || currentPhase === 'defeated') return;

  mara.hurt(amount);

  if (mara.hp() <= 0) {
    currentPhase = 'defeated';
    mara.phase = 'defeated';
    deathAnimTimer = 0;
    // Emit immediately so enemies flee during death animation
    events.emit('boss:defeated', {});
  }
}

export function getMara(): GameObj | null {
  return mara;
}

export function getMaraPhase(): MaraPhase {
  return currentPhase;
}

export function getMaraMaxHealth(): number {
  return scaledMaxHealth;
}
