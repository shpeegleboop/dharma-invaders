// Nerayika (Hell Being) - charge attack, 2 damage + Klesha
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../../data/config.json';
import { events } from '../../utils/events';
import { getIsPaused } from '../../ui/pauseMenu';
import { shouldEnemiesFlee, applyFleeMovement } from '../../systems/enemyFlee';

type NerayikaState = 'hesitating' | 'charging' | 'pursuing' | 'exiting';

let nerayikaIdCounter = 0;

export function createNerayika(k: KAPLAYCtx, x: number, y: number): GameObj {
  const cfg = config.newEnemies.nerayika;
  const enemyId = `nerayika_${++nerayikaIdCounter}`;

  // Find player to get initial direction
  const player = k.get('player')[0];
  const targetX = player ? player.pos.x : config.screen.width / 2;
  const targetY = player ? player.pos.y : config.screen.height / 2;

  // Calculate charge direction (locked at spawn)
  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const chargeDir = dist > 0 ? { x: dx / dist, y: dy / dist } : { x: 0, y: 1 };

  let state: NerayikaState = 'hesitating';
  let hesitateTimer = 0;

  const nerayika = k.add([
    k.sprite('nerayika'),
    k.pos(x, y),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(0), cfg.size.width, cfg.size.height) }),
    k.rotate(k.rad2deg(Math.atan2(chargeDir.y, chargeDir.x)) + 90),
    k.color(255, 255, 255),
    k.health(cfg.health),
    k.opacity(0.6), // Start semi-transparent during hesitate
    'enemy',
    'nerayika',
    {
      enemyId,
      type: 'nerayika',
      karmaValue: cfg.karmaValue,
      damage: cfg.damage,
      stunned: false,
      isNerayika: true, // Flag for special collision handling
    },
  ]);

  events.emit('enemy:spawned', {
    id: enemyId,
    type: 'nerayika',
    position: { x, y },
  });

  nerayika.onUpdate(() => {
    if (getIsPaused()) return;

    const player = k.get('player')[0];
    if (nerayika.stunned || (player && player.invincible)) return;

    // Flee when Mara is defeated
    if (shouldEnemiesFlee()) {
      applyFleeMovement(k, nerayika, cfg.speed);
      return;
    }

    switch (state) {
      case 'hesitating':
        hesitateTimer += k.dt() * 1000;
        // Pulse effect during hesitate
        nerayika.opacity = 0.5 + 0.3 * Math.sin(hesitateTimer / 100);

        if (hesitateTimer >= cfg.hesitateTime) {
          state = 'charging';
          nerayika.opacity = 1;
        }
        break;

      case 'charging':
        // Move in locked direction at charge speed
        nerayika.pos.x += chargeDir.x * cfg.chargeSpeed * k.dt();
        nerayika.pos.y += chargeDir.y * cfg.chargeSpeed * k.dt();

        // Check if off screen - switch to pursuing instead of destroying
        const margin = config.enemies.offscreenMargin;
        if (
          nerayika.pos.x < -margin ||
          nerayika.pos.x > config.screen.width + margin ||
          nerayika.pos.y < config.arena.offsetY - margin ||
          nerayika.pos.y > config.screen.height + margin
        ) {
          state = 'pursuing';
          nerayika.opacity = 0.8; // Slightly dimmed during pursuit
        }
        break;

      case 'pursuing':
        // Track player at half speed
        if (player) {
          const pdx = player.pos.x - nerayika.pos.x;
          const pdy = player.pos.y - nerayika.pos.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist > 0) {
            const pursuitSpeed = cfg.chargeSpeed * 0.5;
            nerayika.pos.x += (pdx / pdist) * pursuitSpeed * k.dt();
            nerayika.pos.y += (pdy / pdist) * pursuitSpeed * k.dt();
            nerayika.angle = k.rad2deg(Math.atan2(pdy, pdx)) + 90;
          }
        }
        break;
    }
  });

  return nerayika;
}
