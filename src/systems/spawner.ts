// Enemy spawner - spawns enemies based on wave state
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { createHungryGhost } from '../entities/enemies/hungryGhost';
import { createAsura } from '../entities/enemies/asura';
import { createDeva } from '../entities/enemies/deva';
import { createNerayika } from '../entities/enemies/nerayika';
import { resetManussaState } from '../entities/enemies/manussa';
import { spawnMara } from '../entities/mara';
import { getIsPaused } from '../ui/pauseMenu';
import { isRebirthOverlayActive } from '../ui/rebirthOverlay';
import {
  WaveState, createWaveState, resetWaveState, buildEnemyQueue,
  getCurrentWaveConfig, advanceWave, getTimeBetweenWaves, popNextEnemy,
  setCurrentWaveNumber
} from './waveManager';
import { getSpawnRateScaling } from './cycleScaling';
import { getRandomEdgePosition } from './spawnPositions';
import { spawnNewEnemies } from './newEnemySpawner';

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
    if (data.type === 'nerayika') {
      createNerayika(k, data.x, data.y);
    } else if (data.type === 'asura') {
      createAsura(k, data.x, data.y);
    } else {
      createHungryGhost(k, data.x, data.y);
    }
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
