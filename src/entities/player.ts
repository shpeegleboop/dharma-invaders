// Player entity - movement + mouse aiming + health
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { createProjectile } from './projectile';
import { events } from '../utils/events';
import { getShootCooldownMultiplier, isSpreadShotActive } from '../systems/powerupEffects';
import { isGameOver } from '../systems/mercyRule';
import { getIsPaused } from '../ui/pauseMenu';
import { PLAYER_BASE_COLOR } from '../systems/playerDamage';
import { pushAllEnemies, pushEnemiesFromPoint } from '../systems/enemyHelpers';
import { spawnPushRing } from '../systems/particles';
import { playSFX } from '../systems/audio';
import { showRebirthOverlay, isRebirthOverlayActive } from '../ui/rebirthOverlay';
import { getGameState, resetLife } from '../stores/gameStore';

// Track player death state for powerup freeze
let isPlayerDead = false;

export function getIsPlayerDead(): boolean {
  return isPlayerDead;
}
import { updateKarmaDisplay } from '../systems/karma';
import { setHealthDisplay } from '../systems/health';
import {
  getMaxHealthModifier,
  getPlayerSpeedMultiplier,
  hasSila,
} from '../systems/rebirthEffects';
import {
  initPlayerIndicators,
  updatePlayerIndicators,
  setPushCooldown,
  cleanupPlayerIndicators,
} from '../systems/playerIndicators';

// Calculate effective max health with rebirth modifiers
function getEffectiveMaxHealth(): number {
  return Math.max(1, config.player.health + getMaxHealthModifier());
}

export function createPlayer(k: KAPLAYCtx): GameObj {
  // Reset death state on new player creation
  isPlayerDead = false;

  // Initialize player indicators (shield + push rings)
  initPlayerIndicators(k);

  let canShoot = true;
  let canPush = true;
  const maxHealth = getEffectiveMaxHealth();
  const pushCfg = config.player.pushAbility;

  // Track focus state to prevent stuck keys when clicking outside game
  let hasFocus = true;
  const onBlur = () => { hasFocus = false; };
  const onFocus = () => { hasFocus = true; };
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', () => {
    hasFocus = document.visibilityState === 'visible';
  });

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

  // Get angle to mouse
  function getAngleToMouse(): number {
    const mouse = k.mousePos();
    return Math.atan2(mouse.y - player.pos.y, mouse.x - player.pos.x);
  }

  // Shoot function
  function shoot() {
    if (getIsPaused()) return;
    if (player.invincible) return;
    if (isRebirthOverlayActive()) return;
    if (!canShoot) return;
    canShoot = false;

    const angle = getAngleToMouse();
    const offset = config.player.size.width / 2 + 5;

    if (isSpreadShotActive()) {
      // Compassion: 3-way spread shot
      const spreadAngle = config.player.spreadAngle;
      for (const angleOffset of [-spreadAngle, 0, spreadAngle]) {
        const shotAngle = angle + angleOffset;
        const spawnX = player.pos.x + Math.cos(shotAngle) * offset;
        const spawnY = player.pos.y + Math.sin(shotAngle) * offset;
        createProjectile(k, spawnX, spawnY, shotAngle);
      }
    } else {
      // Normal single shot
      const spawnX = player.pos.x + Math.cos(angle) * offset;
      const spawnY = player.pos.y + Math.sin(angle) * offset;
      createProjectile(k, spawnX, spawnY, angle);
    }

    // Apply cooldown with potential multiplier (diligence = 0.5x cooldown)
    const cooldown = config.player.shootCooldown * getShootCooldownMultiplier();
    k.wait(cooldown / 1000, () => {
      canShoot = true;
    });
  }

  // Shoot with spacebar or mouse click
  k.onKeyDown('space', shoot);
  k.onMouseDown('left', shoot);

  // Push ability function
  function push() {
    if (getIsPaused()) return;
    if (player.invincible) return;
    if (isRebirthOverlayActive()) return;
    if (!canPush) return;
    canPush = false;
    setPushCooldown(true);

    // Visual and audio effect
    spawnPushRing(player.pos.x, player.pos.y, pushCfg.ringColor);
    playSFX('patighata');

    // Push all enemies away from player
    pushEnemiesFromPoint(k, player.pos.x, player.pos.y, pushCfg.pushDistance);

    // Cooldown
    k.wait(pushCfg.cooldown / 1000, () => {
      canPush = true;
      setPushCooldown(false);
    });
  }

  // Push with right-click
  k.onMousePress('right', push);

  // Handle death - show rebirth overlay, then respawn (unless game over)
  events.on('player:died', () => {
    // Set invincibility IMMEDIATELY (synchronous, before any callbacks)
    player.invincible = true;
    isPlayerDead = true; // Freeze powerups during death screen
    const state = getGameState();

    k.wait(config.player.deathDelay, () => {
      // Don't respawn if mercy rule triggered game over
      if (isGameOver()) {
        player.invincible = false;
        isPlayerDead = false; // Reset on game over
        return;
      }

      // Show rebirth overlay with current karma
      showRebirthOverlay(k, state.karmaThisLife, () => {
        // Unfreeze powerups on respawn
        isPlayerDead = false;

        // Reset karma for next life
        resetLife();
        updateKarmaDisplay();

        // Order matters: invincibility already set, now push enemies, THEN move player
        pushAllEnemies(k);

        // Move player to center
        player.pos.x = config.arena.width / 2;
        player.pos.y = config.arena.offsetY + config.arena.height / 2;

        // Update max HP (may have changed due to Metta/Mana from rebirth)
        const newMaxHealth = getEffectiveMaxHealth();
        player.setMaxHP(newMaxHealth);
        player.setHP(newMaxHealth);
        setHealthDisplay(newMaxHealth);

        // Respawn invincibility from config
        const respawnInvincibility = config.roguelike.respawnInvincibility;

        // Sila: grant Meditation shield on respawn (benefits from Adhitthana charges)
        if (hasSila()) {
          events.emit('player:powerup', { type: 'meditation' });
        }

        k.wait(respawnInvincibility / 1000, () => {
          player.invincible = false;
          player.opacity = 1;
        });

        // Flash during respawn invincibility
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

  // Movement with delta time
  player.onUpdate(() => {
    if (getIsPaused()) return;
    if (isRebirthOverlayActive()) return; // No movement during death screen

    // Rotate to face mouse
    player.angle = k.rad2deg(getAngleToMouse());

    // Apply Thina debuff to player speed
    const speed = config.player.speed * getPlayerSpeedMultiplier();
    let dx = 0;
    let dy = 0;

    // WASD + Arrow keys (only when window has focus to prevent stuck keys)
    if (hasFocus) {
      if (k.isKeyDown('left') || k.isKeyDown('a')) dx -= 1;
      if (k.isKeyDown('right') || k.isKeyDown('d')) dx += 1;
      if (k.isKeyDown('up') || k.isKeyDown('w')) dy -= 1;
      if (k.isKeyDown('down') || k.isKeyDown('s')) dy += 1;
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const norm = 1 / Math.sqrt(2);
      dx *= norm;
      dy *= norm;
    }

    // Apply movement with delta time
    player.pos.x += dx * speed * k.dt();
    player.pos.y += dy * speed * k.dt();

    // Keep player in arena bounds (below HUD)
    const halfW = config.player.size.width / 2;
    const halfH = config.player.size.height / 2;
    const minY = config.arena.offsetY + halfH;
    const maxY = config.arena.offsetY + config.arena.height - halfH;
    player.pos.x = k.clamp(player.pos.x, halfW, config.arena.width - halfW);
    player.pos.y = k.clamp(player.pos.y, minY, maxY);

    // Update shield and push indicators
    updatePlayerIndicators(player);
  });

  // Cleanup indicators and event listeners when player is destroyed
  player.onDestroy(() => {
    cleanupPlayerIndicators();
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
  });

  return player;
}
