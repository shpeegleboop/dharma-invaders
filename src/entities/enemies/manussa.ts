// Manussa (Human) - non-hostile wanderer, karma test
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getIsPaused } from '../../ui/pauseMenu';
import { hasKlesha } from '../../stores/gameStore';

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
  const wanderInterval = cfg.wanderInterval;

  const manussa = k.add([
    k.sprite('manussa'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.color(255, 255, 255),
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
  k.wait(cfg.chatBubbleDuration / 1000, () => {
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
    const margin = cfg.bounceMargin;
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

// Manussa escapes at end of wave 8 - reward or penalty based on Ahirika
function triggerManussaEscape(k: KAPLAYCtx, manussa: GameObj): void {
  const cfg = config.newEnemies.manussa;
  const ahirikaActive = hasKlesha('Ahirika');

  // Show chat bubble - different message if Ahirika active
  const message = ahirikaActive ? 'You let me go... fool!' : cfg.escapeMessage;
  const textColor = ahirikaActive ? k.rgb(255, 100, 100) : k.rgb(255, 255, 255);

  chatBubble = k.add([
    k.text(message, { size: 16 }),
    k.pos(manussa.pos.x, manussa.pos.y - 40),
    k.anchor('center'),
    k.color(textColor),
    k.outline(2, k.rgb(0, 0, 0)),
    k.z(100),
  ]);

  // Emit escape event and destroy after delay
  k.wait(cfg.chatBubbleDuration / 1000, () => {
    const pos = { x: manussa.pos.x, y: manussa.pos.y };
    events.emit('human:escaped', {});

    // Show karma feedback
    if (ahirikaActive) {
      // Penalty feedback
      const penaltyText = k.add([
        k.text('Karma wiped!', { size: 14 }),
        k.pos(pos.x, pos.y - 60),
        k.anchor('center'),
        k.color(255, 100, 100),
        k.outline(2, k.rgb(0, 0, 0)),
        k.opacity(1),
        k.lifespan(1.2, { fade: 0.3 }),
        k.z(100),
      ]);
      penaltyText.onUpdate(() => { penaltyText.pos.y -= 20 * k.dt(); });
    } else {
      const karmaText = k.add([
        k.text('+1000 karma', { size: 14 }),
        k.pos(pos.x, pos.y - 60),
        k.anchor('center'),
        k.color(255, 215, 0),
        k.outline(2, k.rgb(0, 0, 0)),
        k.opacity(1),
        k.lifespan(1.2, { fade: 0.3 }),
        k.z(100),
      ]);
      karmaText.onUpdate(() => { karmaText.pos.y -= 20 * k.dt(); });
    }

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
