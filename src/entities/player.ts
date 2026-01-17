// Player entity - movement + mouse aiming + health
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { createProjectile } from './projectile';
import { events } from '../utils/events';
import { getShootCooldownMultiplier, isSpreadShotActive } from '../systems/powerupEffects';
import { isGameOver } from '../systems/mercyRule';
import { isPaused } from '../ui/pauseMenu';
import { PLAYER_BASE_COLOR } from '../systems/playerDamage';
import { pushAllEnemies } from '../systems/enemyHelpers';
import { showRebirthOverlay, isRebirthOverlayActive } from '../ui/rebirthOverlay';
import { getGameState, resetLife } from '../stores/gameStore';
import { updateKarmaDisplay } from '../systems/karma';
import {
  getMaxHealthModifier,
  getPlayerSpeedMultiplier,
  hasSila,
} from '../systems/rebirthEffects';

// Calculate effective max health with rebirth modifiers
function getEffectiveMaxHealth(): number {
  return Math.max(1, config.player.health + getMaxHealthModifier());
}

export function createPlayer(k: KAPLAYCtx): GameObj {
  let canShoot = true;
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

  // Get angle to mouse
  function getAngleToMouse(): number {
    const mouse = k.mousePos();
    return Math.atan2(mouse.y - player.pos.y, mouse.x - player.pos.x);
  }

  // Shoot function
  function shoot() {
    if (isPaused) return;
    if (player.invincible) return;
    if (isRebirthOverlayActive()) return;
    if (!canShoot) return;
    canShoot = false;

    const angle = getAngleToMouse();
    const offset = config.player.size.width / 2 + 5;

    if (isSpreadShotActive()) {
      // Compassion: 3-way spread shot
      const spreadAngle = 0.25; // ~15 degrees
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

  // Handle death - show rebirth overlay, then respawn (unless game over)
  events.on('player:died', () => {
    // Set invincibility IMMEDIATELY (synchronous, before any callbacks)
    player.invincible = true;
    const state = getGameState();

    k.wait(0.5, () => {
      // Don't respawn if mercy rule triggered game over
      if (isGameOver()) {
        player.invincible = false;
        return;
      }

      // Show rebirth overlay with current karma
      showRebirthOverlay(k, state.karmaThisLife, () => {
        // Reset karma for next life
        resetLife();
        updateKarmaDisplay();

        // Order matters: invincibility already set, now push enemies, THEN move player
        pushAllEnemies(k);

        // Move player to center
        player.pos.x = config.arena.width / 2;
        player.pos.y = config.arena.offsetY + config.arena.height / 2;
        player.setHP(getEffectiveMaxHealth());

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
        const flashInterval = k.loop(0.1, () => {
          player.opacity = player.opacity === 1 ? 0.3 : 1;
          flashCount++;
          if (flashCount >= respawnInvincibility / 100) {
            flashInterval.cancel();
            player.opacity = 1;
          }
        });
      });
    });
  });

  // Movement with delta time
  player.onUpdate(() => {
    if (isPaused) return;

    // Rotate to face mouse
    player.angle = k.rad2deg(getAngleToMouse());

    // Apply Thina debuff to player speed
    const speed = config.player.speed * getPlayerSpeedMultiplier();
    let dx = 0;
    let dy = 0;

    // WASD + Arrow keys
    if (k.isKeyDown('left') || k.isKeyDown('a')) dx -= 1;
    if (k.isKeyDown('right') || k.isKeyDown('d')) dx += 1;
    if (k.isKeyDown('up') || k.isKeyDown('w')) dy -= 1;
    if (k.isKeyDown('down') || k.isKeyDown('s')) dy += 1;

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
  });

  return player;
}
