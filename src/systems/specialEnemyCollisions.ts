// Special enemy collision handlers - Nerayika, Tiracchana, Manussa
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { isShieldActive } from './powerupEffects';
import { bounceAndStunEnemy } from './collisionHelpers';
import { damagePlayer } from './playerDamage';
import { absorbDamage } from './shieldSystem';
import { playSFX } from './audio';
import {
  addKlesha, getRandomKlesha, removeRandomParami,
  setKarmaThisLife, hasKlesha
} from '../stores/gameStore';
import { reduceAllTimers } from './powerupEffects';

// Handle Nerayika collision: 2 damage + random Klesha (Klesha bypasses shield)
export function handleNerayikaCollision(k: KAPLAYCtx, player: any, enemy: any): void {
  const damage = enemy.damage || config.newEnemies.nerayika.damage;
  const remainingDamage = absorbDamage(damage);

  if (remainingDamage < damage) {
    events.emit('powerup:shieldBroken', {});
  }

  if (remainingDamage > 0) {
    damagePlayer(player, remainingDamage);
  }

  // Klesha ALWAYS applies, even if shield blocked all damage
  const klesha = getRandomKlesha();
  addKlesha(klesha);
  events.emit('player:applyKlesha', { klesha });

  // Visual feedback for klesha
  spawnFloatingText(k, enemy.pos.x, enemy.pos.y - 30, `+${klesha}`, [255, 100, 100]);
  bounceAndStunEnemy(k, player, enemy);
}

// Handle Tiracchana collision: 1 damage + removes 1 Parami stack
export function handleTiracchanaCollision(k: KAPLAYCtx, player: any, enemy: any): void {
  if (isShieldActive()) {
    events.emit('powerup:shieldBroken', {});
    bounceAndStunEnemy(k, player, enemy);
    return;
  }

  damagePlayer(player, 1);

  const removed = removeRandomParami();
  if (removed) {
    events.emit('player:removeParami', { parami: removed });
    spawnFloatingText(k, enemy.pos.x, enemy.pos.y - 30, `-${removed}`, [144, 238, 144]);
  }

  bounceAndStunEnemy(k, player, enemy);
}

// Handle Manussa collision: no damage, just gentle bump away
export function handleManussaCollision(_k: KAPLAYCtx, player: any, enemy: any): void {
  const dx = enemy.pos.x - player.pos.x;
  const dy = enemy.pos.y - player.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0) {
    const pushDist = config.collision.manussaPushDistance;
    enemy.pos.x += (dx / dist) * pushDist;
    enemy.pos.y += (dy / dist) * pushDist;
  }
}

// Handle Manussa death: severe karmic penalty (or reward if Ahirika active)
export function handleManussaDeath(k: KAPLAYCtx, x: number, y: number): void {
  playSFX('manussa_death');

  if (hasKlesha('Ahirika')) {
    events.emit('human:killed:ahirika', {});
    spawnFloatingText(k, x, y - 50, '+1000 karma', [255, 215, 0]);
    return;
  }

  // Normal penalty for killing Manussa
  setKarmaThisLife(0);

  const removedParami = removeRandomParami();
  if (removedParami) {
    events.emit('player:removeParami', { parami: removedParami });
    spawnFloatingText(k, x - 40, y - 50, `-${removedParami}`, [144, 238, 144]);
  }

  const klesha = getRandomKlesha();
  addKlesha(klesha);
  events.emit('player:applyKlesha', { klesha });
  spawnFloatingText(k, x + 40, y - 50, `+${klesha}`, [255, 100, 100]);

  reduceAllTimers(1000);
  events.emit('human:killed', {});
}

// Helper: spawn floating text that rises and fades
function spawnFloatingText(
  k: KAPLAYCtx,
  x: number,
  y: number,
  text: string,
  color: [number, number, number]
): void {
  const riseSpeed = config.effects?.textRiseSpeed ?? 20;
  const textObj = k.add([
    k.text(text, { size: 14 }),
    k.pos(x, y),
    k.anchor('center'),
    k.color(color[0], color[1], color[2]),
    k.outline(2, k.rgb(0, 0, 0)),
    k.opacity(1),
    k.lifespan(1.2, { fade: 0.3 }),
    k.z(100),
  ]);
  textObj.onUpdate(() => { textObj.pos.y -= riseSpeed * k.dt(); });
}
