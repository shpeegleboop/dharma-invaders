// Centralized player damage handling
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { events } from '../utils/events';

// Player base color constant (RGB)
export const PLAYER_BASE_COLOR = { r: 0, g: 128, b: 255 };

// I-frame duration in seconds
const I_FRAME_DURATION = 0.5;
const FLASH_DURATION = 0.15;

let kContext: KAPLAYCtx | null = null;

// Initialize with kaplay context (call from game scene)
export function setupPlayerDamage(k: KAPLAYCtx): void {
  kContext = k;
}

// Centralized damage handler - returns true if player died
export function damagePlayer(player: GameObj, amount: number): boolean {
  if (!kContext) return false;
  const k = kContext;

  // Apply damage
  player.hurt(amount);
  const remainingHealth = player.hp();

  // Flash red
  player.color = k.rgb(255, 0, 0);
  k.wait(FLASH_DURATION, () => {
    if (player.exists()) {
      player.color = k.rgb(PLAYER_BASE_COLOR.r, PLAYER_BASE_COLOR.g, PLAYER_BASE_COLOR.b);
    }
  });

  // Emit hit event
  events.emit('player:hit', {
    damage: amount,
    remainingHealth,
  });

  // Check for death
  if (remainingHealth <= 0) {
    events.emit('player:died', {});
    return true;
  }

  // Grant i-frames (only if survived)
  grantIFrames(k, player);
  return false;
}

// Grant brief invincibility frames after taking damage
function grantIFrames(k: KAPLAYCtx, player: GameObj): void {
  player.invincible = true;
  player.opacity = 0.5;

  k.wait(I_FRAME_DURATION, () => {
    if (player.exists()) {
      player.invincible = false;
      player.opacity = 1;
    }
  });
}
