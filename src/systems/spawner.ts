// Enemy spawner - spawns enemies based on wave state
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { createHungryGhost } from '../entities/enemies/hungryGhost';
import { createAsura } from '../entities/enemies/asura';
import { createDeva } from '../entities/enemies/deva';
import { createNerayika } from '../entities/enemies/nerayika';
import { createTiracchana } from '../entities/enemies/tiracchana';
import { createManussa, hasActiveManussa, resetManussaState } from '../entities/enemies/manussa';
import { spawnMara } from '../entities/mara';
import { getIsPaused } from '../ui/pauseMenu';
import { isRebirthOverlayActive } from '../ui/rebirthOverlay';
import {
  WaveState, createWaveState, resetWaveState, buildEnemyQueue,
  getCurrentWaveConfig, advanceWave, getTimeBetweenWaves, popNextEnemy,
  setCurrentWaveNumber
} from './waveManager';
import { getSpawnRateScaling } from './cycleScaling';
import { getCycle } from '../stores/gameStore';

let state: WaveState = createWaveState();

export function setupSpawner(k: KAPLAYCtx): void {
  resetWaveState(state);
  resetManussaState(); // Clear any lingering Manussa from previous game
  startWave(k);

  k.onUpdate(() => {
    if (getIsPaused()) return;
    if (isRebirthOverlayActive()) return;

    // Don't spawn while player is invincible (respawn protection)
    const player = k.get('player')[0];
    if (player?.invincible) return;

    if (!state.active || state.betweenWaves) return;

    const currentWave = getCurrentWaveConfig(state);
    if (!currentWave) return;

    state.spawnTimer += k.dt();
    const scaledInterval = currentWave.spawnInterval * getSpawnRateScaling();
    if (state.spawnTimer >= scaledInterval && state.enemyQueue.length > 0) {
      state.spawnTimer = 0;
      spawnNextEnemy(k);
    }

    // Check if wave complete (queue empty and no enemies left)
    // Manussa doesn't count - it persists through waves
    const enemies = k.get('enemy').filter((e: any) => !e.isManussa);
    if (state.enemyQueue.length === 0 && enemies.length === 0) {
      completeWave(k);
    }
  });

  // Listen for player death - pause spawning during respawn invincibility
  events.on('player:died', () => {
    state.active = false;
    k.wait(config.spawner.deathPauseDuration, () => {
      state.active = true;
    });
  });

  // Debug: skip to specific wave
  events.on('debug:skipToWave', (data) => {
    destroyAllEnemies(k);
    state.waveIndex = data.wave - 1;
    state.enemyQueue = [];
    state.betweenWaves = false;
    state.active = true;
    startWave(k);
  });

  // Debug: skip to boss
  events.on('debug:skipToBoss', () => {
    state.active = false;
    state.enemyQueue = [];
  });

  // Boss minion spawns (decoupled from maraCombat via event)
  events.on('boss:spawnMinion', (data) => {
    createHungryGhost(k, data.x, data.y);
  });
}

function startWave(k: KAPLAYCtx): void {
  const hasMoreWaves = buildEnemyQueue(state);
  if (!hasMoreWaves) {
    state.active = false;
    spawnMara(k);
  } else {
    const waveNum = state.waveIndex + 1;
    setCurrentWaveNumber(waveNum);
    // Spawn new enemy types based on kalpa and wave
    spawnNewEnemies(k, waveNum);
  }
}

// Spawn new enemy types (Nerayika, Tiracchana, Manussa) based on kalpa and wave
function spawnNewEnemies(k: KAPLAYCtx, waveNum: number): void {
  const kalpa = getCycle();
  const waveKey = String(waveNum);

  // Nerayika: Kalpa 2+, waves defined in config
  if (kalpa >= config.newEnemies.nerayika.spawns.minKalpa) {
    const nerayikaCfg = config.newEnemies.nerayika;
    const waves = nerayikaCfg.spawns.waves as Record<string, number>;
    const count = waves[waveKey] || 0;
    const stagger = nerayikaCfg.spawns.stagger;
    for (let i = 0; i < count; i++) {
      k.wait(i * stagger, () => {
        const pos = getRandomEdgePosition(k);
        createNerayika(k, pos.x, pos.y);
      });
    }
  }

  // Tiracchana: Kalpa 3+, spawn in packs
  // Pack 1: grouped from one edge, Packs 2+: scattered from all edges
  if (kalpa >= config.newEnemies.tiracchana.spawns.minKalpa) {
    const tiracCfg = config.newEnemies.tiracchana;
    const waves = tiracCfg.spawns.waves as Record<string, number>;
    const packCount = waves[waveKey] || 0;
    const packSize = tiracCfg.packSize;
    const packStagger = tiracCfg.spawns.packStagger;
    const individualStagger = tiracCfg.spawns.individualStagger;

    for (let pack = 0; pack < packCount; pack++) {
      if (pack === 0) {
        // First pack: grouped from one edge
        const basePos = getRandomEdgePosition(k);
        const edge = getEdgeFromPosition(basePos);

        for (let i = 0; i < packSize; i++) {
          k.wait(i * individualStagger, () => {
            const offset = getPackOffset(k, edge, i);
            createTiracchana(k, basePos.x + offset.x, basePos.y + offset.y);
          });
        }
      } else {
        // Later packs: each member from random edge
        k.wait(pack * packStagger, () => {
          for (let i = 0; i < packSize; i++) {
            k.wait(i * individualStagger, () => {
              const pos = getRandomEdgePosition(k);
              createTiracchana(k, pos.x, pos.y);
            });
          }
        });
      }
    }
  }

  // Manussa: Kalpa 4+, wave 1 only, one at a time
  if (kalpa >= config.newEnemies.manussa.spawns.minKalpa) {
    if (waveNum === config.newEnemies.manussa.spawns.wave && !hasActiveManussa()) {
      // Spawn in center of arena
      const centerX = config.screen.width / 2;
      const centerY = config.arena.offsetY + (config.arena.height / 2);
      createManussa(k, centerX, centerY);
    }
  }
}

// Determine which edge a spawn position is on
function getEdgeFromPosition(pos: { x: number; y: number }): 'top' | 'right' | 'bottom' | 'left' {
  if (pos.y < config.arena.offsetY) return 'top';
  if (pos.x > config.screen.width) return 'right';
  if (pos.y > config.screen.height) return 'bottom';
  return 'left';
}

// Get offset for pack member based on spawn edge
function getPackOffset(k: KAPLAYCtx, edge: string, index: number): { x: number; y: number } {
  const spread = 15; // Pixels between pack members
  const variance = k.rand(-5, 5);

  switch (edge) {
    case 'top':
    case 'bottom':
      return { x: (index - 2.5) * spread + variance, y: variance };
    case 'left':
    case 'right':
      return { x: variance, y: (index - 2.5) * spread + variance };
    default:
      return { x: 0, y: 0 };
  }
}

function completeWave(k: KAPLAYCtx): void {
  advanceWave(state);
  k.wait(getTimeBetweenWaves(), () => {
    startWave(k);
  });
}

function spawnNextEnemy(k: KAPLAYCtx): void {
  const type = popNextEnemy(state);
  if (!type) return;

  const pos = getRandomEdgePosition(k);

  switch (type) {
    case 'hungryGhost':
      createHungryGhost(k, pos.x, pos.y);
      break;
    case 'asura':
      createAsura(k, pos.x, pos.y);
      break;
    case 'deva':
      createDeva(k, pos.x, pos.y);
      break;
  }
}

function getRandomEdgePosition(k: KAPLAYCtx): { x: number; y: number } {
  const edge = Math.floor(k.rand(0, 4));
  const margin = config.enemies.spawnMargin;
  const arenaTop = config.arena.offsetY;
  const arenaBottom = config.screen.height;
  const screenWidth = config.screen.width;

  switch (edge) {
    case 0:
      return { x: k.rand(margin, screenWidth - margin), y: arenaTop - margin };
    case 1:
      return { x: screenWidth + margin, y: k.rand(arenaTop + margin, arenaBottom - margin) };
    case 2:
      return { x: k.rand(margin, screenWidth - margin), y: arenaBottom + margin };
    default:
      return { x: -margin, y: k.rand(arenaTop + margin, arenaBottom - margin) };
  }
}

function destroyAllEnemies(k: KAPLAYCtx): void {
  k.get('enemy').forEach((enemy) => enemy.destroy());
}

export function getCurrentWave(): number {
  return state.waveIndex + 1;
}

export function pauseSpawner(): void {
  state.active = false;
}

export function resumeSpawner(): void {
  state.active = true;
}
