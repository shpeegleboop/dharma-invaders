// Mara - the final boss, state machine driven
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { updateMaraAttacks, resetAttackTimers } from './maraCombat';
import { getIsPaused } from '../ui/pauseMenu';
import { getIsPlayerDead, getIsPlayerInvulnerable } from './player';
import { getBossBaseHP, getBossHPScaling } from '../systems/cycleScaling';
import { getCycle } from '../stores/gameStore';

type MaraPhase = 'entering' | 'phase1' | 'phase2' | 'phase3' | 'defeated';

interface MovementConfig {
  pattern: string;
  amplitudeX: number;
  amplitudeY: number;
  speed: number;
  centerY: number;
  tilt?: number;
}

let mara: GameObj | null = null;
let currentPhase: MaraPhase = 'entering';
let deathAnimTimer = 0;
let movementTimer = 0;
let scaledMaxHealth = 0;
let currentKalpa = 1;

// Get movement config for current kalpa and phase, merging with defaults
function getMovementConfig(kalpa: number, phase: number): MovementConfig {
  const defaultCfg = config.boss.movement.default as MovementConfig;
  const clampedKalpa = Math.min(kalpa, 5);

  // Access byKalpa config using bracket notation for robustness
  const byKalpa = config.boss.movement.byKalpa as Record<string, Record<string, Partial<MovementConfig> | null>>;
  const kalpaConfig = byKalpa[String(clampedKalpa)];
  const phaseOverride = kalpaConfig?.[`phase${phase}`] as Partial<MovementConfig> | null;

  // Debug log - shows actual values being used
  console.log(`[Mara] Kalpa ${kalpa} (clamped: ${clampedKalpa}), Phase ${phase}`);
  console.log(`[Mara] kalpaConfig exists:`, !!kalpaConfig);
  console.log(`[Mara] phaseOverride:`, phaseOverride);

  if (!phaseOverride) {
    console.log(`[Mara] Using default: figure8`);
    return { ...defaultCfg };
  }

  // Explicitly merge to ensure all fields are included
  const result: MovementConfig = {
    pattern: phaseOverride.pattern ?? defaultCfg.pattern,
    amplitudeX: phaseOverride.amplitudeX ?? defaultCfg.amplitudeX,
    amplitudeY: phaseOverride.amplitudeY ?? defaultCfg.amplitudeY,
    speed: phaseOverride.speed ?? defaultCfg.speed,
    centerY: phaseOverride.centerY ?? defaultCfg.centerY,
    tilt: phaseOverride.tilt,
  };

  console.log(`[Mara] Using pattern: ${result.pattern}, centerY: ${result.centerY}`);
  return result;
}

// Calculate figure-8 position
function calculateFigure8(t: number, cfg: MovementConfig): { x: number; y: number } {
  const centerX = config.screen.width / 2;
  return {
    x: centerX + Math.sin(t) * cfg.amplitudeX,
    y: cfg.centerY + Math.sin(t * 2) * cfg.amplitudeY,
  };
}

// Calculate figure-8 with triangular perturbation (Kalpa 2 Phase 3 variety)
function calculateTriangularFigure8(t: number, cfg: MovementConfig): { x: number; y: number } {
  const centerX = config.screen.width / 2;
  // Base figure-8
  const baseX = Math.sin(t) * cfg.amplitudeX;
  const baseY = Math.sin(t * 2) * cfg.amplitudeY;
  // Triangular perturbation using triangle wave at 3x frequency
  const triWave = (2 / Math.PI) * Math.asin(Math.sin(3 * t));
  const perturbX = triWave * cfg.amplitudeX * 0.15;
  const perturbY = triWave * cfg.amplitudeY * 0.2;
  return {
    x: centerX + baseX + perturbX,
    y: cfg.centerY + baseY + perturbY,
  };
}

// Calculate X pattern — bounce alternating between diagonal corners
function calculateXPattern(t: number, _cfg: MovementConfig): { x: number; y: number } {
  const margin = (config.boss.movement as Record<string, unknown>).xPatternMargin as number ?? 60;
  const left = margin;
  const right = config.screen.width - margin;
  const top = config.arena.offsetY + margin;
  const bottom = config.screen.height - margin;

  // 8 segments per full cycle: 4 bounces on diagonal 1, then 4 on diagonal 2
  const period = 2 * Math.PI;
  const normalizedT = ((t % period) + period) % period;
  const segmentFloat = (normalizedT / period) * 8;
  const segment = Math.floor(segmentFloat);
  const progress = segmentFloat - segment;

  // Cosine easing for smooth deceleration at corners
  const ease = (1 - Math.cos(progress * Math.PI)) / 2;

  // Diagonal 1: TL <-> BR (segments 0-3), Diagonal 2: TR <-> BL (segments 4-7)
  const corners = [
    [{ x: left, y: top }, { x: right, y: bottom }],   // diagonal 1
    [{ x: right, y: top }, { x: left, y: bottom }],    // diagonal 2
  ];
  const diag = segment < 4 ? 0 : 1;
  const bounceIdx = segment % 4;
  const forward = bounceIdx % 2 === 0;
  const from = forward ? corners[diag][0] : corners[diag][1];
  const to = forward ? corners[diag][1] : corners[diag][0];

  return {
    x: from.x + (to.x - from.x) * ease,
    y: from.y + (to.y - from.y) * ease,
  };
}

// Calculate 4-petal rose curve position
function calculateRoseCurve(t: number, cfg: MovementConfig): { x: number; y: number } {
  const centerX = config.screen.width / 2;
  const r = Math.cos(2 * t);
  return {
    x: centerX + r * Math.cos(t) * cfg.amplitudeX,
    y: cfg.centerY + r * Math.sin(t) * cfg.amplitudeY,
  };
}

// Calculate swooping lemniscate (tilted asymmetric figure-8)
function calculateSwoopingLemniscate(t: number, cfg: MovementConfig): { x: number; y: number } {
  const centerX = config.screen.width / 2;
  const tiltRad = ((cfg.tilt ?? 30) * Math.PI) / 180;

  // Base lemniscate with asymmetry
  const scale = 1 / (1 + Math.sin(t) * Math.sin(t) * 0.3);
  let x = Math.sin(t) * cfg.amplitudeX * scale;
  let y = Math.sin(t * 2) * cfg.amplitudeY * scale;

  // Apply tilt rotation
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);
  const rotX = x * cosT - y * sinT;
  const rotY = x * sinT + y * cosT;

  return {
    x: centerX + rotX,
    y: cfg.centerY + rotY,
  };
}

// Get position based on pattern type
function calculatePosition(t: number, cfg: MovementConfig): { x: number; y: number } {
  switch (cfg.pattern) {
    case 'roseCurve':
      return calculateRoseCurve(t, cfg);
    case 'swoopingLemniscate':
      return calculateSwoopingLemniscate(t, cfg);
    case 'triangularFigure8':
      return calculateTriangularFigure8(t, cfg);
    case 'xPattern':
      return calculateXPattern(t, cfg);
    case 'figure8':
    default:
      return calculateFigure8(t, cfg);
  }
}

// Find the t value on a pattern that produces the position closest to target
function findClosestT(targetX: number, targetY: number, cfg: MovementConfig): number {
  const samples = 360; // Sample every degree
  const period = 2 * Math.PI;
  let bestT = 0;
  let bestDist = Infinity;

  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * period;
    const pos = calculatePosition(t, cfg);
    const dx = pos.x - targetX;
    const dy = pos.y - targetY;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      bestT = t;
    }
  }

  return bestT;
}

export function spawnMara(k: KAPLAYCtx): void {
  const cfg = config.boss;
  currentKalpa = getCycle();

  currentPhase = 'entering';
  movementTimer = 0;
  resetAttackTimers();
  scaledMaxHealth = Math.round(getBossBaseHP() * getBossHPScaling());

  mara = k.add([
    k.sprite('mara'),
    k.pos(config.screen.width / 2, -cfg.size.height),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.rotate(0),
    k.color(255, 255, 255),
    k.health(scaledMaxHealth),
    k.opacity(1),
    'boss',
    'mara',
    { phase: currentPhase },
  ]);

  mara.onUpdate(() => {
    if (getIsPaused()) return;
    if (!mara) return;
    if (getIsPlayerDead() || getIsPlayerInvulnerable()) return;
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

  if (mara.pos.y < cfg.targetY) {
    mara.pos.y += cfg.entranceSpeed * k.dt();
  } else {
    mara.pos.y = cfg.targetY;
    currentPhase = 'phase1';
    mara.phase = 'phase1';
    // Snap to closest point on phase1 pattern to avoid jumping across screen
    const moveCfg = getMovementConfig(currentKalpa, 1);
    movementTimer = findClosestT(mara.pos.x, mara.pos.y, moveCfg);
    events.emit('boss:started', {});
  }
}

function getPhaseNumber(): number {
  if (currentPhase === 'phase1') return 1;
  if (currentPhase === 'phase2') return 2;
  return 3;
}

function updateCombat(k: KAPLAYCtx): void {
  if (!mara) return;
  const cfg = config.boss;

  // Check phase transitions
  const healthPercent = (mara.hp() / scaledMaxHealth) * 100;
  const oldPhase = currentPhase;

  if (healthPercent <= cfg.phase3Threshold && currentPhase !== 'phase3') {
    currentPhase = 'phase3';
    mara.phase = 'phase3';
    events.emit('boss:phaseChange', { phase: 3 });
  } else if (healthPercent <= cfg.phase2Threshold && currentPhase === 'phase1') {
    currentPhase = 'phase2';
    mara.phase = 'phase2';
    events.emit('boss:phaseChange', { phase: 2 });
  }

  // Get movement config for current kalpa/phase
  const moveCfg = getMovementConfig(currentKalpa, getPhaseNumber());

  // On phase change, snap to closest point on new pattern to avoid glitching
  if (oldPhase !== currentPhase) {
    movementTimer = findClosestT(mara.pos.x, mara.pos.y, moveCfg);
  }

  // Apply phase 3 speed multiplier
  const speedMult = currentPhase === 'phase3' ? cfg.movement.phase3SpeedMultiplier : 1.0;
  movementTimer += k.dt() * moveCfg.speed * speedMult;

  // Calculate position using pattern
  const pos = calculatePosition(movementTimer, moveCfg);
  mara.pos.x = pos.x;
  mara.pos.y = pos.y;

  // Delegate attacks to maraCombat
  const isRageMode = currentKalpa >= cfg.evolution.rageMode.minKalpa;
  const usePhase3Projectiles = currentPhase === 'phase3' || isRageMode;
  const spawnMinions = currentPhase === 'phase2' || currentPhase === 'phase3' || isRageMode;
  const isActualPhase3 = currentPhase === 'phase3';
  updateMaraAttacks(k, mara, usePhase3Projectiles, spawnMinions, isActualPhase3);

  // Kalpa 5+ Phase 3: spin the sprite
  if (currentKalpa >= 5 && currentPhase === 'phase3') {
    const spinSpeed = (cfg.movement as Record<string, unknown>).kalpa5SpinSpeed as number ?? 180;
    mara.angle += spinSpeed * k.dt();
  } else {
    mara.angle = 0;
  }

  // Flash effect for phase 3 or rage mode
  if (currentPhase === 'phase3' || isRageMode) {
    const flash = Math.sin(k.time() * 10) > 0;
    mara.opacity = flash ? 1 : cfg.phase3Opacity;
  }
}

function updateDefeated(k: KAPLAYCtx): void {
  if (!mara) return;
  const cfg = config.boss;

  deathAnimTimer += k.dt() * 1000;
  mara.opacity = Math.sin(deathAnimTimer * 0.05) > 0 ? 1 : 0.2;

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
