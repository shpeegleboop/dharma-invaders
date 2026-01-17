// Manussa (Human) - non-hostile wanderer, karma test
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getIsPaused } from '../../ui/pauseMenu';

let manussaIdCounter = 0;
let currentManussa: GameObj | null = null;
let chatBubble: GameObj | null = null;

export function createManussa(k: KAPLAYCtx, x: number, y: number): GameObj {
  // Only one Manussa at a time
  if (currentManussa && currentManussa.exists()) {
    return currentManussa;
  }

  const cfg = config.newEnemies.manussa;
  const enemyId = `manussa_${++manussaIdCounter}`;

  // Random wander direction, changes periodically
  let wanderDir = { x: k.rand(-1, 1), y: k.rand(-1, 1) };
  let wanderTimer = 0;
  const wanderInterval = 2000; // Change direction every 2s

  const manussa = k.add([
    k.rect(cfg.size.width, cfg.size.height),
    k.pos(x, y),
    k.anchor('center'),
    k.area(),
    k.color(k.Color.fromHex(cfg.color)),
    k.health(cfg.health),
    'enemy',
    'manussa',
    {
      enemyId,
      type: 'manussa',
      karmaValue: cfg.karmaValue,
      damage: cfg.damage,
      stunned: false,
      isManussa: true, // Flag for special collision handling
    },
  ]);

  currentManussa = manussa;

  events.emit('enemy:spawned', {
    id: enemyId,
    type: 'manussa',
    position: { x, y },
  });

  // Spawn greeting bubble
  const spawnBubble = k.add([
    k.text('I come in peace!', { size: 16 }),
    k.pos(x, y - 40),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.outline(2, k.rgb(0, 0, 0)),
    k.z(100),
  ]);
  k.wait(2, () => {
    if (spawnBubble.exists()) spawnBubble.destroy();
  });

  manussa.onUpdate(() => {
    if (getIsPaused()) return;
    if (manussa.stunned) return;

    wanderTimer += k.dt() * 1000;

    // Change direction periodically
    if (wanderTimer >= wanderInterval) {
      wanderTimer = 0;
      wanderDir = {
        x: k.rand(-1, 1),
        y: k.rand(-1, 1),
      };
      // Normalize
      const len = Math.sqrt(wanderDir.x ** 2 + wanderDir.y ** 2);
      if (len > 0) {
        wanderDir.x /= len;
        wanderDir.y /= len;
      }
    }

    // Move in wander direction
    manussa.pos.x += wanderDir.x * cfg.speed * k.dt();
    manussa.pos.y += wanderDir.y * cfg.speed * k.dt();

    // Clamp to arena bounds (bounce off edges)
    const margin = 20;
    const minX = margin;
    const maxX = config.screen.width - margin;
    const minY = config.arena.offsetY + margin;
    const maxY = config.screen.height - config.bottomHud.height - margin;

    if (manussa.pos.x < minX) {
      manussa.pos.x = minX;
      wanderDir.x = Math.abs(wanderDir.x);
    }
    if (manussa.pos.x > maxX) {
      manussa.pos.x = maxX;
      wanderDir.x = -Math.abs(wanderDir.x);
    }
    if (manussa.pos.y < minY) {
      manussa.pos.y = minY;
      wanderDir.y = Math.abs(wanderDir.y);
    }
    if (manussa.pos.y > maxY) {
      manussa.pos.y = maxY;
      wanderDir.y = -Math.abs(wanderDir.y);
    }
  });

  // Listen for wave 8 complete to trigger escape
  const unsubWaveComplete = events.on('wave:complete', (data) => {
    if (data.waveNumber === 8 && manussa.exists()) {
      triggerManussaEscape(k, manussa);
      unsubWaveComplete();
    }
  });

  // Clean up on destroy
  manussa.onDestroy(() => {
    if (currentManussa === manussa) {
      currentManussa = null;
    }
    if (chatBubble && chatBubble.exists()) {
      chatBubble.destroy();
      chatBubble = null;
    }
  });

  return manussa;
}

// Manussa escapes at end of wave 8 - reward player
function triggerManussaEscape(k: KAPLAYCtx, manussa: GameObj): void {
  const cfg = config.newEnemies.manussa;

  // Show chat bubble
  chatBubble = k.add([
    k.text(cfg.escapeMessage, { size: 16 }),
    k.pos(manussa.pos.x, manussa.pos.y - 40),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.outline(2, k.rgb(0, 0, 0)),
    k.z(100),
  ]);

  // Emit escape event and destroy after delay
  k.wait(cfg.chatBubbleDuration / 1000, () => {
    events.emit('human:escaped', {});
    if (chatBubble && chatBubble.exists()) {
      chatBubble.destroy();
      chatBubble = null;
    }
    if (manussa.exists()) {
      manussa.destroy();
    }
  });
}

// Check if a Manussa currently exists
export function hasActiveManussa(): boolean {
  return currentManussa !== null && currentManussa.exists();
}

// Get the current Manussa (for collision handling)
export function getCurrentManussa(): GameObj | null {
  return currentManussa;
}

// Reset Manussa tracking (call on scene start)
export function resetManussaState(): void {
  currentManussa = null;
  chatBubble = null;
}
