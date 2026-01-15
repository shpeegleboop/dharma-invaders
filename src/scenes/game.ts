// Main game scene - orchestrates gameplay
import type { KAPLAYCtx } from 'kaplay';
import { createPlayer } from '../entities/player';
import { setupCollisions } from '../systems/collision';
import { setupKarma, getKarma } from '../systems/karma';
import { setupHealth } from '../systems/health';
import { setupSpawner } from '../systems/spawner';
import { setupWaveDisplay } from '../systems/waveDisplay';
import { setupPowerupEffects } from '../systems/powerupEffects';
import { setupBossHealthBar } from '../systems/bossHealthBar';
import { setupMercyRule } from '../systems/mercyRule';
import { setupDebug } from '../utils/debug';
import { setupGameAudio } from '../systems/gameAudio';
import { setupFleeListener } from '../systems/enemyFlee';
import { setupPlayerDamage } from '../systems/playerDamage';
import { setupPauseMenu } from '../ui/pauseMenu';
import { setupAudioSettings, showAudioSettings, hideAudioSettings } from '../ui/audioSettings';
import { resetRebirthOverlay } from '../ui/rebirthOverlay';
import { events } from '../utils/events';
import { playMusic } from '../systems/audio';
import { resetAll } from '../stores/gameStore';
import config from '../data/config.json';

export function createGameScene(k: KAPLAYCtx): void {
  // Clear all event listeners from previous scene
  events.clear();

  // Reset game state and UI for new run
  resetAll();
  resetRebirthOverlay();

  // Play gameplay music
  playMusic('gameplay');

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
  setupBossHealthBar(k);
  setupMercyRule();
  setupFleeListener();
  setupPlayerDamage(k);
  setupSpawner(k);
  setupGameAudio();
  setupDebug(k);

  // Setup pause menu and audio settings
  setupAudioSettings(k);
  setupPauseMenu(k,
    () => showAudioSettings(() => {}),
    hideAudioSettings
  );

  // Handle victory - go to nirvana scene
  events.on('game:victory', () => {
    k.go('nirvana', getKarma());
  });

  // Handle game over - go to game over scene
  events.on('game:over', () => {
    k.go('gameOver', getKarma());
  });

  // Spawn player
  createPlayer(k);
}
