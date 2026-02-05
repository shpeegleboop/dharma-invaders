// Main game scene - orchestrates gameplay
import type { KAPLAYCtx } from 'kaplay';
import { createPlayer } from '../entities/player';
import { setupCollisions } from '../systems/collision';
import { setupKarma, getKarma } from '../systems/karma';
import { setupHealth, setHealthDisplay } from '../systems/health';
import { setupSpawner } from '../systems/spawner';
import { setupWaveDisplay } from '../systems/waveDisplay';
import { setupPowerupEffects, getShieldCharges, restoreShieldCharges } from '../systems/powerupEffects';
import { setupBossHealthBar } from '../systems/bossHealthBar';
import { setupMercyRule } from '../systems/mercyRule';
import { setupDebug } from '../utils/debug';
import { setupGameAudio } from '../systems/gameAudio';
import { initParticles } from '../systems/particles';
import { setupFleeListener } from '../systems/enemyFlee';
import { setupPlayerDamage } from '../systems/playerDamage';
import { setupPauseMenu } from '../ui/pauseMenu';
import { setupAudioSettings, showAudioSettings, hideAudioSettings } from '../ui/audioSettings';
import { resetRebirthOverlay } from '../ui/rebirthOverlay';
import { setupRebirthHud } from '../ui/rebirthHud';
import { events } from '../utils/events';
import { playMusic, type MusicTrack } from '../systems/audio';
import { getSelectedGameplayTrack } from '../systems/persistence';
import {
  getCycle,
  saveHealth,
  consumeSavedHealth,
  saveShieldCharges,
  consumeSavedShieldCharges,
  getDifficulty,
} from '../stores/gameStore';
import { getMaxHealthModifier } from '../systems/rebirthEffects';
import { getDifficultyDisplayName } from '../systems/difficulty';
import config from '../data/config.json';
import { resetVajraCooldown } from '../entities/powerup';
import { tryPlayCutscene } from '../systems/cutscene';

export async function createGameScene(k: KAPLAYCtx): Promise<void> {
  // Clear all event listeners from previous scene
  events.clear();

  // Reset rebirth overlay UI (not game state - that's handled by menu/titleScreen)
  resetRebirthOverlay();

  // Reset Vajra wave cooldown for new game
  resetVajraCooldown();

  // Play intro cutscene (first game only)
  await tryPlayCutscene(k, 'intro');

  // Play kalpa-specific intro cutscenes
  const currentKalpa = getCycle();
  if (currentKalpa === 2) await tryPlayCutscene(k, 'kalpa2');
  else if (currentKalpa === 3) await tryPlayCutscene(k, 'kalpa3');
  else if (currentKalpa >= 4) await tryPlayCutscene(k, 'kalpa4');

  // Play selected gameplay music (default = 'gameplay')
  const gameplayTrack = getSelectedGameplayTrack();
  playMusic((gameplayTrack === 'default' ? 'gameplay' : gameplayTrack) as MusicTrack);

  // Background image (covers full screen behind everything)
  // Scale to cover screen (bg1.jpg is 1104x832, screen is 800x650)
  const bgScaleX = config.screen.width / 1104;
  const bgScaleY = config.screen.height / 832;
  const bgScale = Math.max(bgScaleX, bgScaleY); // Cover, not contain
  k.add([
    k.sprite('bg1'),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.scale(bgScale),
    k.z(-100),
    'background',
  ]);

  // Draw HUD background bar
  k.add([
    k.rect(config.screen.width, config.hud.height),
    k.pos(0, 0),
    k.color(20, 20, 35),
    k.fixed(),
    'hudBar',
  ]);

  // HUD separator line (top)
  k.add([
    k.rect(config.screen.width, 2),
    k.pos(0, config.hud.height - 2),
    k.color(60, 60, 80),
    k.fixed(),
  ]);

  // Bottom HUD bar
  k.add([
    k.rect(config.screen.width, config.bottomHud.height),
    k.pos(0, config.bottomHud.offsetY),
    k.color(20, 20, 35),
    k.fixed(),
    'bottomHudBar',
  ]);

  // Bottom HUD separator line
  k.add([
    k.rect(config.screen.width, 2),
    k.pos(0, config.bottomHud.offsetY),
    k.color(60, 60, 80),
    k.fixed(),
  ]);

  // Title in HUD (center)
  const diff = getDifficulty();
  const titleY = diff !== 'sakadagami' ? config.hud.height / 2 - 6 : config.hud.height / 2;
  k.add([
    k.text('Dharma Invaders', { size: 24 }),
    k.pos(config.screen.width / 2, titleY),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
  ]);

  // Difficulty indicator (tiny text under title, only for non-default)
  if (diff !== 'sakadagami') {
    const diffColor = diff === 'sotapanna' ? [100, 220, 100]
      : diff === 'anagami' ? [255, 100, 100]
      : [180, 40, 40]; // noah
    k.add([
      k.text(getDifficultyDisplayName(), { size: 10 }),
      k.pos(config.screen.width / 2, titleY + 18),
      k.anchor('center'),
      k.color(diffColor[0], diffColor[1], diffColor[2]),
      k.fixed(),
    ]);
  }

  // Kalpa indicator (only shown after first kalpa)
  const cycle = getCycle();
  if (cycle > 1) {
    k.add([
      k.text(`Kalpa ${cycle}`, { size: 20 }),
      k.pos(config.screen.width - 150, config.hud.height / 2),
      k.anchor('right'),
      k.color(220, 200, 100),
      k.fixed(),
    ]);
  }

  // Setup systems
  initParticles(k);
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
  setupRebirthHud(k);

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

  // Boss intro cutscenes when wave 8 completes
  events.on('wave:complete', async (data) => {
    if (data.waveNumber === 8) {
      const kalpa = getCycle();
      if (kalpa === 1) {
        await tryPlayCutscene(k, 'bossIntro');
      } else {
        await tryPlayCutscene(k, 'maraReturns');
      }
    }
  });

  // Spawn player
  const player = createPlayer(k);

  // Restore saved health and shield from previous kalpa (if any)
  const savedHP = consumeSavedHealth();
  if (savedHP !== null) {
    // Clamp to current max health (in case Metta/Mana changed)
    const maxHealth = Math.max(1, config.player.health + getMaxHealthModifier());
    const clampedHP = Math.min(savedHP, maxHealth);
    player.setHP(clampedHP);
    setHealthDisplay(clampedHP);
  }
  const savedShield = consumeSavedShieldCharges();
  if (savedShield !== null) {
    restoreShieldCharges(savedShield);
  }

  // Save player health and shield when boss is defeated (for next kalpa)
  events.on('boss:defeated', () => {
    saveHealth(player.hp());
    saveShieldCharges(getShieldCharges());
  });
}
