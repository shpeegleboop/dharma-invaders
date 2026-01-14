// Enemy flee state - event-driven approach to avoid circular imports
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';

let enemiesShouldFlee = false;

// Call this once at scene start to set up the listener
export function setupFleeListener(): void {
  enemiesShouldFlee = false;
  events.on('boss:defeated', () => {
    enemiesShouldFlee = true;
  });
}

// Check if enemies should flee (called by enemy update loops)
export function shouldEnemiesFlee(): boolean {
  return enemiesShouldFlee;
}

// Shared flee movement logic - moves entity away from screen center
export function applyFleeMovement(
  k: KAPLAYCtx,
  entity: GameObj,
  baseSpeed: number
): void {
  const centerX = config.screen.width / 2;
  const centerY = config.screen.height / 2;
  const dx = entity.pos.x - centerX;
  const dy = entity.pos.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const fleeSpeed = baseSpeed * 2;

  entity.pos.x += (dx / dist) * fleeSpeed * k.dt();
  entity.pos.y += (dy / dist) * fleeSpeed * k.dt();
  entity.angle = k.rad2deg(Math.atan2(dy, dx));
}
