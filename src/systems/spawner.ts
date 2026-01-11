// Enemy spawner system
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { createHungryGhost } from '../entities/enemies/hungryGhost';

type SpawnerState = {
  active: boolean;
  spawnTimer: number;
  spawnInterval: number;
};

const state: SpawnerState = {
  active: false,
  spawnTimer: 0,
  spawnInterval: 1.5,
};

export function setupSpawner(k: KAPLAYCtx): void {
  state.active = true;
  state.spawnTimer = 0;

  // Spawn loop
  k.onUpdate(() => {
    if (!state.active) return;

    state.spawnTimer += k.dt();
    if (state.spawnTimer >= state.spawnInterval) {
      state.spawnTimer = 0;
      spawnFromEdge(k);
    }
  });

  // Listen for player death to pause spawning briefly
  events.on('player:died', () => {
    state.active = false;
    k.wait(1.5, () => {
      state.active = true;
      destroyAllEnemies(k);
    });
  });
}

function spawnFromEdge(k: KAPLAYCtx): void {
  const pos = getRandomEdgePosition(k);
  createHungryGhost(k, pos.x, pos.y);
}

function getRandomEdgePosition(k: KAPLAYCtx): { x: number; y: number } {
  const edge = Math.floor(k.rand(0, 4));
  const margin = 30;
  const arenaTop = config.arena.offsetY;
  const arenaBottom = config.screen.height;

  switch (edge) {
    case 0: // Top
      return { x: k.rand(margin, config.screen.width - margin), y: arenaTop - margin };
    case 1: // Right
      return { x: config.screen.width + margin, y: k.rand(arenaTop + margin, arenaBottom - margin) };
    case 2: // Bottom
      return { x: k.rand(margin, config.screen.width - margin), y: arenaBottom + margin };
    default: // Left
      return { x: -margin, y: k.rand(arenaTop + margin, arenaBottom - margin) };
  }
}

function destroyAllEnemies(k: KAPLAYCtx): void {
  k.get('enemy').forEach((enemy) => enemy.destroy());
}

export function setSpawnInterval(interval: number): void {
  state.spawnInterval = interval;
}

export function pauseSpawner(): void {
  state.active = false;
}

export function resumeSpawner(): void {
  state.active = true;
}
