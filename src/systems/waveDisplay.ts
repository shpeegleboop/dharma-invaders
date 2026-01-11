// Wave display system for HUD
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';

let waveText: GameObj | null = null;
let currentWave = 1;

export function setupWaveDisplay(k: KAPLAYCtx): void {
  currentWave = 1;

  // Create wave display in HUD bar (between health and title)
  waveText = k.add([
    k.text(`Wave ${currentWave}`, { size: 18 }),
    k.pos(140, config.hud.height / 2),
    k.anchor('left'),
    k.color(150, 200, 255),
    k.fixed(),
    'waveText',
  ]);

  // Listen for wave changes
  events.on('wave:started', (data) => {
    currentWave = data.waveNumber;
    if (waveText) {
      waveText.text = `Wave ${currentWave}`;
    }
  });
}

export function getCurrentWaveDisplay(): number {
  return currentWave;
}
