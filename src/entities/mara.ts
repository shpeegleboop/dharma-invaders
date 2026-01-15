// Mara - the final boss, state machine driven
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { fireAtPlayer, spawnMinion } from './maraCombat';
import { isPaused } from '../ui/pauseMenu';

type MaraPhase = 'entering' | 'phase1' | 'phase2' | 'phase3' | 'defeated';

let mara: GameObj | null = null;
let currentPhase: MaraPhase = 'entering';
let shootTimer = 0;
let minionTimer = 0;
let deathAnimTimer = 0;
let movementTimer = 0;

export function spawnMara(k: KAPLAYCtx): void {
  const cfg = config.boss;
  currentPhase = 'entering';
  shootTimer = 0;
  minionTimer = 0;
  movementTimer = 0;

  mara = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(config.screen.width / 2, -cfg.size.height),
    k.anchor('center'),
    k.area(),
    k.rotate(0),
    k.color(k.Color.fromHex(cfg.color)),
    k.health(cfg.health),
    k.opacity(1),
    'boss',
    'mara',
    { phase: currentPhase },
  ]);

  mara.onUpdate(() => {
    if (isPaused) return;
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

  // Check phase transitions based on health
  const healthPercent = (mara.hp() / cfg.health) * 100;

  if (healthPercent <= cfg.phase3Threshold && currentPhase !== 'phase3') {
    currentPhase = 'phase3';
    mara.phase = 'phase3';
    // Adjust timer so position stays continuous when speed changes (1.0 → 1.5)
    movementTimer = movementTimer * (1.0 / 1.5);
    events.emit('boss:phaseChange', { phase: 3 });
  } else if (healthPercent <= cfg.phase2Threshold && currentPhase === 'phase1') {
    currentPhase = 'phase2';
    mara.phase = 'phase2';
    events.emit('boss:phaseChange', { phase: 2 });
  }

  // Figure-8 movement pattern (stays in upper half of screen)
  movementTimer += k.dt();
  const baseX = config.screen.width / 2;
  const baseY = cfg.targetY + 40;
  const amplitudeX = 200;
  const amplitudeY = 60;
  const speed = currentPhase === 'phase3' ? 1.5 : 1.0;
  mara.pos.x = baseX + Math.sin(movementTimer * speed) * amplitudeX;
  mara.pos.y = baseY + Math.sin(movementTimer * speed * 2) * amplitudeY;

  // Shooting logic
  shootTimer += k.dt() * 1000;
  if (shootTimer >= cfg.projectile.cooldown) {
    shootTimer = 0;
    fireAtPlayer(k, mara, currentPhase === 'phase3');
  }

  // Minion spawns in phase2+
  if (currentPhase === 'phase2' || currentPhase === 'phase3') {
    minionTimer += k.dt() * 1000;
    if (minionTimer >= cfg.minionSpawnInterval) {
      minionTimer = 0;
      spawnMinion(k);
    }
  }

  // Phase 3 flash effect
  if (currentPhase === 'phase3') {
    const flash = Math.sin(k.time() * 10) > 0;
    mara.opacity = flash ? 1 : 0.6;
  }
}

function updateDefeated(k: KAPLAYCtx): void {
  if (!mara) return;

  deathAnimTimer += k.dt() * 1000;

  // Flash rapidly
  mara.opacity = Math.sin(deathAnimTimer * 0.05) > 0 ? 1 : 0.2;

  // After 2 seconds, destroy and emit victory
  if (deathAnimTimer >= 2000) {
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
