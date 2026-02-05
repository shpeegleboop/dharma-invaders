// Wave management - wave state and progression
import waves from '../data/waves.json';
import { events } from '../utils/events';
import { getEnemyCountScaling } from './cycleScaling';

export type EnemyType = 'hungryGhost' | 'asura' | 'deva';

export type WaveState = {
  active: boolean;
  waveIndex: number;
  spawnTimer: number;
  enemyQueue: EnemyType[];
  betweenWaves: boolean;
};

export function createWaveState(): WaveState {
  return {
    active: true,
    waveIndex: 0,
    spawnTimer: 0,
    enemyQueue: [],
    betweenWaves: false,
  };
}

export function resetWaveState(state: WaveState): void {
  state.active = true;
  state.waveIndex = 0;
  state.spawnTimer = 0;
  state.enemyQueue = [];
  state.betweenWaves = false;
}

export function buildEnemyQueue(state: WaveState): boolean {
  const wave = waves.waves[state.waveIndex];
  if (!wave) {
    return false; // No more waves
  }

  state.enemyQueue = [];
  const countMultiplier = getEnemyCountScaling();
  for (const enemyDef of wave.enemies) {
    const scaledCount = Math.round(enemyDef.count * countMultiplier);
    for (let i = 0; i < scaledCount; i++) {
      state.enemyQueue.push(enemyDef.type as EnemyType);
    }
  }
  shuffleArray(state.enemyQueue);

  state.spawnTimer = 0;
  state.betweenWaves = false;

  events.emit('wave:started', { waveNumber: wave.number });
  return true;
}

export function getCurrentWaveConfig(state: WaveState) {
  return waves.waves[state.waveIndex] ?? null;
}

export function advanceWave(state: WaveState): void {
  const wave = waves.waves[state.waveIndex];
  if (wave) {
    events.emit('wave:complete', { waveNumber: wave.number });
  }
  state.betweenWaves = true;
  state.waveIndex++;
}

export function getTimeBetweenWaves(): number {
  return waves.timeBetweenWaves / 1000;
}

export function popNextEnemy(state: WaveState): EnemyType | undefined {
  return state.enemyQueue.shift();
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Global wave number for enemy speed scaling (set by spawner)
let currentWaveNumber = 1;

export function setCurrentWaveNumber(waveNum: number): void {
  currentWaveNumber = waveNum;
}

export function getCurrentWaveNumber(): number {
  return currentWaveNumber;
}
