// Collision helpers - bounce and visual effects
import type { KAPLAYCtx, GameObj } from 'kaplay';

// Bounce enemy away from player and stun for 0.5s
export function bounceAndStunEnemy(k: KAPLAYCtx, player: GameObj, enemy: GameObj): void {
  // Calculate bounce direction (away from player)
  const dx = enemy.pos.x - player.pos.x;
  const dy = enemy.pos.y - player.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Push enemy back
  const bounceDistance = 80;
  enemy.pos.x += dirX * bounceDistance;
  enemy.pos.y += dirY * bounceDistance;

  // Stun enemy
  enemy.stunned = true;
  enemy.opacity = 0.5;

  k.wait(0.5, () => {
    if (enemy.exists()) {
      enemy.stunned = false;
      enemy.opacity = 1;
    }
  });
}

// Flash player red briefly on damage
export function flashPlayerRed(k: KAPLAYCtx, player: GameObj): void {
  const originalColor = player.color.clone();
  player.color = k.rgb(255, 0, 0);

  k.wait(0.15, () => {
    if (player.exists()) {
      player.color = originalColor;
    }
  });
}
