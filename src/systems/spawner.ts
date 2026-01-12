// Enemy spawner - spawns enemies based on wave state
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { createHungryGhost } from '../entities/enemies/hungryGhost';
import { createAsura } from '../entities/enemies/asura';
import { createDeva } from '../entities/enemies/deva';
import { spawnMara } from '../entities/mara';
import { isPaused } from '../ui/pauseMenu';
import {
  WaveState, createWaveState, resetWaveState, buildEnemyQueue,
  getCurrentWaveConfig, advanceWave, getTimeBetweenWaves, popNextEnemy
} from './waveManager';

let state: WaveState = createWaveState();

export function setupSpawner(k: KAPLAYCtx): void {
  resetWaveState(state);
  startWave(k);

  k.onUpdate(() => {
    if (isPaused) return;
    if (!state.active || state.betweenWaves) return;

    const currentWave = getCurrentWaveConfig(state);
    if (!currentWave) return;

    state.spawnTimer += k.dt();
    if (state.spawnTimer >= currentWave.spawnInterval && state.enemyQueue.length > 0) {
      state.spawnTimer = 0;
      spawnNextEnemy(k);
    }

    // Check if wave complete (queue empty and no enemies left)
    if (state.enemyQueue.length === 0 && k.get('enemy').length === 0) {
      completeWave(k);
    }
  });

  // Listen for player death - pause spawning briefly
  events.on('player:died', () => {
    state.active = false;
    k.wait(1.5, () => {
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
}

function startWave(k: KAPLAYCtx): void {
  const hasMoreWaves = buildEnemyQueue(state);
  if (!hasMoreWaves) {
    state.active = false;
    spawnMara(k);
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
  const margin = 30;
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
