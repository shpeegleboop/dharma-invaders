// Mara combat helpers - projectile firing and minion spawning
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { createBossProjectile } from './bossProjectile';
import { events } from '../utils/events';
import { getCycle } from '../stores/gameStore';
import { isRebirthOverlayActive } from '../ui/rebirthOverlay';

// Attack timers (managed here to keep mara.ts lean)
let shootTimer = 0;
let spreadShotTimer = 0;
let sweepBeamTimer = 0;
let minionTimer = 0;
let nerayikaSwarmTimer = 0;
let spiralArmTimer = 0;
let spiralArmAngle = 0;

export function resetAttackTimers(): void {
  shootTimer = 0;
  spreadShotTimer = 0;
  sweepBeamTimer = 0;
  minionTimer = 0;
  nerayikaSwarmTimer = config.boss.evolution.nerayikaSwarm.cooldown;
  spiralArmTimer = 0;
  spiralArmAngle = 0;
}

// Orchestrate all attacks based on kalpa and phase
export function updateMaraAttacks(
  k: KAPLAYCtx,
  mara: GameObj,
  usePhase3Projectiles: boolean,
  spawnMinions: boolean,
  isActualPhase3: boolean = false
): void {
  // Don't attack during rebirth screen
  if (isRebirthOverlayActive()) return;

  const cfg = config.boss;
  const kalpa = getCycle();
  const evo = cfg.evolution;

  // Standard aimed shot
  shootTimer += k.dt() * 1000;
  if (shootTimer >= cfg.projectile.cooldown) {
    shootTimer = 0;
    fireAtPlayer(k, mara, usePhase3Projectiles);
  }

  // Kalpa 2+: Spread shot
  if (kalpa >= evo.spreadShot.minKalpa) {
    spreadShotTimer += k.dt() * 1000;
    if (spreadShotTimer >= evo.spreadShot.cooldown) {
      spreadShotTimer = 0;
      fireSpreadShot(k, mara, usePhase3Projectiles);
    }
  }

  // Kalpa 3+: Sweep beam
  if (kalpa >= evo.sweepBeam.minKalpa) {
    sweepBeamTimer += k.dt() * 1000;
    if (sweepBeamTimer >= evo.sweepBeam.cooldown) {
      sweepBeamTimer = 0;
      fireSweepBeam(k, mara, usePhase3Projectiles);
    }
  }

  // Minion spawns
  if (spawnMinions) {
    minionTimer += k.dt() * 1000;
    if (minionTimer >= cfg.minionSpawnInterval) {
      minionTimer = 0;
      spawnMinion(k);
    }
  }

  // Kalpa 4+ Phase 3: Nerayika swarm - 6 converge on player (only actual phase 3, not rage mode)
  const swarmCfg = evo.nerayikaSwarm;
  if (kalpa >= swarmCfg.minKalpa && isActualPhase3) {
    nerayikaSwarmTimer += k.dt() * 1000;
    if (nerayikaSwarmTimer >= swarmCfg.cooldown) {
      nerayikaSwarmTimer = 0;
      spawnNerayikaSwarm(k, swarmCfg.count);
    }
  }

  // Kalpa 5+ Phase 3: Spiral arms - rotating projectile streams
  const spiralCfg = evo.spiralArms;
  if (kalpa >= spiralCfg.minKalpa && isActualPhase3) {
    spiralArmTimer += k.dt() * 1000;
    if (spiralArmTimer >= spiralCfg.cooldown) {
      spiralArmTimer = 0;
      fireSpiralArms(k, mara);
    }
  }
}

export function fireAtPlayer(
  k: KAPLAYCtx,
  mara: GameObj,
  isPhase3: boolean
): void {
  const cfg = config.boss;

  const player = k.get('player')[0];
  if (!player) return;

  const angle = Math.atan2(
    player.pos.y - mara.pos.y,
    player.pos.x - mara.pos.x
  );

  const speed = isPhase3
    ? cfg.projectile.speedPhase3
    : cfg.projectile.speed;

  createBossProjectile(k, mara.pos.x, mara.pos.y + cfg.size.height / 2, angle, speed);
}

// Kalpa 2+: Spread shot - 5 projectiles in 90° arc
export function fireSpreadShot(k: KAPLAYCtx, mara: GameObj, isPhase3: boolean): void {
  const cfg = config.boss;
  const evo = cfg.evolution.spreadShot;

  const player = k.get('player')[0];
  if (!player) return;

  const baseAngle = Math.atan2(
    player.pos.y - mara.pos.y,
    player.pos.x - mara.pos.x
  );

  const speed = isPhase3 ? cfg.projectile.speedPhase3 : cfg.projectile.speed;
  const startAngle = baseAngle - evo.arcAngle / 2;
  const angleStep = evo.arcAngle / (evo.projectileCount - 1);

  for (let i = 0; i < evo.projectileCount; i++) {
    const angle = startAngle + angleStep * i;
    createBossProjectile(k, mara.pos.x, mara.pos.y + cfg.size.height / 2, angle, speed);
  }
}

// Kalpa 3+: Sweep beam - horizontal line of 10 projectiles
export function fireSweepBeam(k: KAPLAYCtx, mara: GameObj, isPhase3: boolean): void {
  const cfg = config.boss;
  const evo = cfg.evolution.sweepBeam;

  const player = k.get('player')[0];
  if (!player) return;

  const speed = isPhase3 ? cfg.projectile.speedPhase3 : cfg.projectile.speed;
  const startX = mara.pos.x - evo.width / 2;
  const spacing = evo.width / (evo.projectileCount - 1);

  // All projectiles fire straight down toward player's Y level
  const downAngle = Math.PI / 2; // 90 degrees (down)

  for (let i = 0; i < evo.projectileCount; i++) {
    const x = startX + spacing * i;
    createBossProjectile(k, x, mara.pos.y + cfg.size.height / 2, downAngle, speed);
  }
}

// Kalpa 4+ Phase 3: Spawn Nerayikas equidistant around screen edges
export function spawnNerayikaSwarm(_k: KAPLAYCtx, count: number): void {
  const w = config.screen.width;
  const h = config.screen.height;
  const arenaTop = config.arena.offsetY;
  const margin = 20;

  // Calculate equidistant points around the perimeter
  // Perimeter positions: 0 = top-left, going clockwise
  const perimeter = 2 * w + 2 * (h - arenaTop);

  for (let i = 0; i < count; i++) {
    const t = (i / count) * perimeter;
    let x: number, y: number;

    if (t < w) {
      // Top edge
      x = t;
      y = arenaTop - margin;
    } else if (t < w + (h - arenaTop)) {
      // Right edge
      x = w + margin;
      y = arenaTop + (t - w);
    } else if (t < 2 * w + (h - arenaTop)) {
      // Bottom edge
      x = w - (t - w - (h - arenaTop));
      y = h + margin;
    } else {
      // Left edge
      x = -margin;
      y = h - (t - 2 * w - (h - arenaTop));
    }

    events.emit('boss:spawnMinion', { x, y, type: 'nerayika' });
  }
}

function fireSpiralArms(k: KAPLAYCtx, mara: GameObj): void {
  const cfg = config.boss.evolution.spiralArms;
  for (let i = 0; i < cfg.armCount; i++) {
    const armAngle = spiralArmAngle + (i * 2 * Math.PI) / cfg.armCount;
    createBossProjectile(k, mara.pos.x, mara.pos.y, armAngle, cfg.projectileSpeed);
  }
  spiralArmAngle += cfg.angleStep;
}

export function spawnMinion(k: KAPLAYCtx): void {
  // Emit event for spawner to handle - no direct entity import
  const edge = k.rand(0, 4) | 0;
  let x: number, y: number;

  switch (edge) {
    case 0: // Top
      x = k.rand(50, config.screen.width - 50);
      y = config.arena.offsetY - 20;
      break;
    case 1: // Right
      x = config.screen.width + 20;
      y = k.rand(config.arena.offsetY + 50, config.screen.height - 50);
      break;
    case 2: // Bottom
      x = k.rand(50, config.screen.width - 50);
      y = config.screen.height + 20;
      break;
    default: // Left
      x = -20;
      y = k.rand(config.arena.offsetY + 50, config.screen.height - 50);
  }

  // Kalpa 4+: spawn Asurā minions instead of Petā
  const kalpa = getCycle();
  const evo = config.boss.evolution.rageMode;
  const minionType = (kalpa >= evo.minKalpa && evo.useAsuraMinions) ? 'asura' : 'hungryGhost';

  events.emit('boss:spawnMinion', { x, y, type: minionType });
}
