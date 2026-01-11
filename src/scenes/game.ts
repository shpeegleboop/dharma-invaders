// Main game scene - orchestrates gameplay
import type { KAPLAYCtx } from 'kaplay';
import { createPlayer } from '../entities/player';
import config from '../data/config.json';

export function createGameScene(k: KAPLAYCtx): void {
  // Spawn player
  createPlayer(k);

  // Title text (temporary)
  k.add([
    k.text('Dharma Invaders', { size: 32 }),
    k.pos(config.screen.width / 2, 40),
    k.anchor('center'),
    k.color(255, 255, 255),
  ]);
}
