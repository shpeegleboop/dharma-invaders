// Main game scene - orchestrates gameplay
import type { KAPLAYCtx } from 'kaplay';
import { createPlayer } from '../entities/player';
import { setupCollisions } from '../systems/collision';
import { setupKarma } from '../systems/karma';
import { setupHealth } from '../systems/health';
import { setupSpawner } from '../systems/spawner';
import { setupWaveDisplay } from '../systems/waveDisplay';
import { setupPowerupEffects } from '../systems/powerupEffects';
import { events } from '../utils/events';
import config from '../data/config.json';

export function createGameScene(k: KAPLAYCtx): void {
  // Clear all event listeners from previous scene
  events.clear();

  // Draw HUD background bar
  k.add([
    k.rect(config.screen.width, config.hud.height),
    k.pos(0, 0),
    k.color(20, 20, 35),
    k.fixed(),
    'hudBar',
  ]);

  // HUD separator line
  k.add([
    k.rect(config.screen.width, 2),
    k.pos(0, config.hud.height - 2),
    k.color(60, 60, 80),
    k.fixed(),
  ]);

  // Title in HUD (center)
  k.add([
    k.text('Dharma Invaders', { size: 24 }),
    k.pos(config.screen.width / 2, config.hud.height / 2),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
  ]);

  // Setup systems
  setupCollisions(k);
  setupKarma(k);
  setupHealth(k);
  setupWaveDisplay(k);
  setupPowerupEffects(k);
  setupSpawner(k);

  // Spawn player
  createPlayer(k);
}
