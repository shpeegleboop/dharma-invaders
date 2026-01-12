// Debug tools - F1-F4, F6 hotkeys for testing
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from './events';
import { spawnMara } from '../entities/mara';

const VIRTUES = ['compassion', 'wisdom', 'patience', 'diligence', 'meditation'];

type DebugState = {
  hitboxes: boolean;
  invincible: boolean;
  powerupIndex: number;
};

const state: DebugState = {
  hitboxes: false,
  invincible: false,
  powerupIndex: 0,
};

let debugIndicator: GameObj | null = null;

export function setupDebug(k: KAPLAYCtx): void {
  // Create debug indicator (hidden by default)
  debugIndicator = k.add([
    k.text('DEBUG', { size: 12 }),
    k.pos(config.screen.width - 8, config.hud.height + 8),
    k.anchor('topright'),
    k.color(255, 0, 0),
    k.fixed(),
    k.opacity(0),
    'debugIndicator',
  ]);

  // F1: Toggle hitbox visibility
  k.onKeyPress('f1', () => {
    state.hitboxes = !state.hitboxes;
    if (state.hitboxes) {
      k.debug.inspect = true;
    } else {
      k.debug.inspect = false;
    }
    updateIndicator();
  });

  // F2: Skip to wave 8
  k.onKeyPress('f2', () => {
    clearAllEnemies(k);
    events.emit('debug:skipToWave', { wave: 8 });
    updateIndicator();
  });

  // F3: Skip to boss
  k.onKeyPress('f3', () => {
    clearAllEnemies(k);
    clearAllProjectiles(k);
    events.emit('debug:skipToBoss', {});
    spawnMara(k);
    updateIndicator();
  });

  // F4: Cycle through powerups (one per press)
  k.onKeyPress('f4', () => {
    const virtue = VIRTUES[state.powerupIndex];
    events.emit('player:powerup', { type: virtue });
    state.powerupIndex = (state.powerupIndex + 1) % VIRTUES.length;
    updateIndicator();
  });

  // F6: Toggle invincibility
  k.onKeyPress('f6', () => {
    state.invincible = !state.invincible;
    const player = k.get('player')[0];
    if (player) {
      player.invincible = state.invincible;
    }
    updateIndicator();
  });

  // Keep player invincible if debug invincibility is on
  k.onUpdate(() => {
    if (state.invincible) {
      const player = k.get('player')[0];
      if (player && !player.invincible) {
        player.invincible = true;
      }
    }
  });
}

function clearAllEnemies(k: KAPLAYCtx): void {
  k.get('enemy').forEach((e) => e.destroy());
  k.get('boss').forEach((b) => b.destroy());
}

function clearAllProjectiles(k: KAPLAYCtx): void {
  k.get('bossProjectile').forEach((p) => p.destroy());
}

function updateIndicator(): void {
  if (!debugIndicator) return;

  const anyActive = state.hitboxes || state.invincible;
  debugIndicator.opacity = anyActive ? 1 : 0;

  // Build status text
  const flags: string[] = ['DEBUG'];
  if (state.hitboxes) flags.push('HITBOX');
  if (state.invincible) flags.push('INVULN');
  debugIndicator.text = flags.join(' | ');
}

export function isInvincible(): boolean {
  return state.invincible;
}
