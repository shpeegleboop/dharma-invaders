// Player entity - coordinates movement, combat, and lifecycle
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { isGameOver } from '../systems/mercyRule';
import { PLAYER_BASE_COLOR } from '../systems/playerDamage';
import { pushAllEnemies } from '../systems/enemyHelpers';
import { showRebirthOverlay } from '../ui/rebirthOverlay';
import { getGameState, resetLife } from '../stores/gameStore';
import { updateKarmaDisplay } from '../systems/karma';
import { setHealthDisplay } from '../systems/health';
import { getMaxHealthModifier, hasSila } from '../systems/rebirthEffects';
import {
  initPlayerIndicators,
  cleanupPlayerIndicators,
} from '../systems/playerIndicators';
import {
  setupKeyTracking,
  cleanupKeyTracking,
  updatePlayerMovement,
} from './playerMovement';
import {
  resetCombatState,
  setupPlayerShooting,
  setupPlayerPush,
} from './playerCombat';

// Track player death state for powerup freeze
let isPlayerDead = false;

export function getIsPlayerDead(): boolean {
  return isPlayerDead;
}

// Calculate effective max health with rebirth modifiers
function getEffectiveMaxHealth(): number {
  return Math.max(1, config.player.health + getMaxHealthModifier());
}

export function createPlayer(k: KAPLAYCtx): GameObj {
  // Reset state on new player creation
  isPlayerDead = false;
  resetCombatState();

  // Initialize systems
  initPlayerIndicators(k);
  const keysHeld = setupKeyTracking();

  const maxHealth = getEffectiveMaxHealth();

  const player = k.add([
    k.rect(config.player.size.width, config.player.size.height),
    k.pos(config.arena.width / 2, config.arena.offsetY + config.arena.height / 2),
    k.anchor('center'),
    k.area(),
    k.rotate(0),
    k.health(maxHealth),
    k.opacity(1),
    k.color(PLAYER_BASE_COLOR.r, PLAYER_BASE_COLOR.g, PLAYER_BASE_COLOR.b),
    'player',
    { invincible: false },
  ]);

  // Setup combat (shooting + push)
  setupPlayerShooting(k, player);
  setupPlayerPush(k, player);

  // Handle death - show rebirth overlay, then respawn
  events.on('player:died', () => {
    player.invincible = true;
    isPlayerDead = true;
    const state = getGameState();

    k.wait(config.player.deathDelay, () => {
      if (isGameOver()) {
        player.invincible = false;
        isPlayerDead = false;
        return;
      }

      showRebirthOverlay(k, state.karmaThisLife, () => {
        isPlayerDead = false;
        resetLife();
        updateKarmaDisplay();
        pushAllEnemies(k);

        // Reset position
        player.pos.x = config.arena.width / 2;
        player.pos.y = config.arena.offsetY + config.arena.height / 2;

        // Update health
        const newMaxHealth = getEffectiveMaxHealth();
        player.setMaxHP(newMaxHealth);
        player.setHP(newMaxHealth);
        setHealthDisplay(newMaxHealth);

        // Sila: grant Meditation shield on respawn
        if (hasSila()) {
          events.emit('player:powerup', { type: 'meditation' });
        }

        // Respawn invincibility
        const respawnInvincibility = config.roguelike.respawnInvincibility;
        k.wait(respawnInvincibility / 1000, () => {
          player.invincible = false;
          player.opacity = 1;
        });

        // Flash during invincibility
        let flashCount = 0;
        const flashIntervalMs = config.player.respawnFlashInterval * 1000;
        const flashLoop = k.loop(config.player.respawnFlashInterval, () => {
          player.opacity = player.opacity === 1 ? 0.3 : 1;
          flashCount++;
          if (flashCount >= respawnInvincibility / flashIntervalMs) {
            flashLoop.cancel();
            player.opacity = 1;
          }
        });
      });
    });
  });

  // Movement update loop
  player.onUpdate(() => {
    updatePlayerMovement(k, player, keysHeld);
  });

  // Cleanup on destroy
  player.onDestroy(() => {
    cleanupPlayerIndicators();
    cleanupKeyTracking();
  });

  return player;
}
