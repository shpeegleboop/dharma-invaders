// Wave-based enemy spawner system
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import waves from '../data/waves.json';
import { events } from '../utils/events';
import { createHungryGhost } from '../entities/enemies/hungryGhost';
import { createAsura } from '../entities/enemies/asura';
import { createDeva } from '../entities/enemies/deva';
import { spawnMara } from '../entities/mara';

type EnemyType = 'hungryGhost' | 'asura' | 'deva';

type SpawnerState = {
  active: boolean;
  waveIndex: number;
  spawnTimer: number;
  enemyQueue: EnemyType[];
  betweenWaves: boolean;
};

const state: SpawnerState = {
  active: false,
  waveIndex: 0,
  spawnTimer: 0,
  enemyQueue: [],
  betweenWaves: false,
};

export function setupSpawner(k: KAPLAYCtx): void {
  state.active = true;
  state.waveIndex = 0;
  state.spawnTimer = 0;
  state.enemyQueue = [];
  state.betweenWaves = false;

  startWave(k);

  k.onUpdate(() => {
    if (!state.active || state.betweenWaves) return;

    const currentWave = waves.waves[state.waveIndex];
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

  // Listen for player death - pause spawning briefly, enemies persist
  events.on('player:died', () => {
    state.active = false;
    k.wait(1.5, () => {
      // Enemies persist - don't destroy them
      // Resume spawning remaining enemies from queue
      state.active = true;
    });
  });

  // Debug: skip to specific wave
  events.on('debug:skipToWave', (data) => {
    destroyAllEnemies(k);
    state.waveIndex = data.wave - 1; // -1 because startWave uses index
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
  const wave = waves.waves[state.waveIndex];
  if (!wave) {
    // All waves complete - spawn Mara boss
    state.active = false;
    spawnMara(k);
    return;
  }

  // Build enemy queue from wave definition
  state.enemyQueue = [];
  for (const enemyDef of wave.enemies) {
    for (let i = 0; i < enemyDef.count; i++) {
      state.enemyQueue.push(enemyDef.type as EnemyType);
    }
  }
  // Shuffle the queue for variety
  shuffleArray(state.enemyQueue);

  state.spawnTimer = 0;
  state.betweenWaves = false;

  events.emit('wave:started', { waveNumber: wave.number });
}

function completeWave(k: KAPLAYCtx): void {
  const wave = waves.waves[state.waveIndex];
  events.emit('wave:complete', { waveNumber: wave.number });

  state.betweenWaves = true;
  state.waveIndex++;

  // Pause between waves
  k.wait(waves.timeBetweenWaves / 1000, () => {
    startWave(k);
  });
}

function spawnNextEnemy(k: KAPLAYCtx): void {
  const type = state.enemyQueue.shift();
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

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
