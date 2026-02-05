// Player movement - key tracking + movement update
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getIsPaused } from '../ui/pauseMenu';
import { isRebirthOverlayActive } from '../ui/rebirthOverlay';
import { getPlayerSpeedMultiplier } from '../systems/rebirthEffects';
import { updatePlayerIndicators } from '../systems/playerIndicators';

// Key tracking state
let keysHeld: Set<string>;
let canvas: HTMLCanvasElement | null = null;
let handleKeyDown: (e: KeyboardEvent) => void;
let handleKeyUp: (e: KeyboardEvent) => void;
let clearAllKeys: () => void;
let visibilityHandler: () => void;

// Initialize key tracking with blur handlers to prevent stuck keys
export function setupKeyTracking(): Set<string> {
  keysHeld = new Set<string>();

  handleKeyDown = (e: KeyboardEvent) => {
    keysHeld.add(e.key.toLowerCase());
  };

  handleKeyUp = (e: KeyboardEvent) => {
    keysHeld.delete(e.key.toLowerCase());
  };

  clearAllKeys = () => {
    keysHeld.clear();
  };

  visibilityHandler = () => {
    if (document.hidden) clearAllKeys();
  };

  // Attach listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', clearAllKeys);
  document.addEventListener('visibilitychange', visibilityHandler);

  // Canvas focus handling
  canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.addEventListener('blur', clearAllKeys);
    canvas.addEventListener('focus', clearAllKeys);
  }

  return keysHeld;
}

// Cleanup key tracking event listeners
export function cleanupKeyTracking(): void {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('blur', clearAllKeys);
  document.removeEventListener('visibilitychange', visibilityHandler);
  if (canvas) {
    canvas.removeEventListener('blur', clearAllKeys);
    canvas.removeEventListener('focus', clearAllKeys);
  }
}

// Get angle from player to mouse cursor
export function getAngleToMouse(k: KAPLAYCtx, player: GameObj): number {
  const mouse = k.mousePos();
  return Math.atan2(mouse.y - player.pos.y, mouse.x - player.pos.x);
}

// Update player movement (call from onUpdate)
export function updatePlayerMovement(k: KAPLAYCtx, player: GameObj, keys: Set<string>): void {
  if (getIsPaused()) return;
  if (isRebirthOverlayActive()) return;

  // Rotate to face mouse
  player.angle = k.rad2deg(getAngleToMouse(k, player));

  // Apply Thina debuff to player speed
  const speed = config.player.speed * getPlayerSpeedMultiplier();
  let dx = 0;
  let dy = 0;

  // WASD + Arrow keys
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const norm = 1 / Math.sqrt(2);
    dx *= norm;
    dy *= norm;
  }

  // Apply movement with delta time
  player.pos.x += dx * speed * k.dt();
  player.pos.y += dy * speed * k.dt();

  // Keep player in arena bounds
  const halfW = config.player.size.width / 2;
  const halfH = config.player.size.height / 2;
  const minY = config.arena.offsetY + halfH;
  const maxY = config.arena.offsetY + config.arena.height - halfH;
  player.pos.x = k.clamp(player.pos.x, halfW, config.arena.width - halfW);
  player.pos.y = k.clamp(player.pos.y, minY, maxY);

  // Update shield and push indicators
  updatePlayerIndicators(player);
}
