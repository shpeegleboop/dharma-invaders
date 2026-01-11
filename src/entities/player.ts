// Player entity - movement + mouse aiming
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { createProjectile } from './projectile';

export function createPlayer(k: KAPLAYCtx): GameObj {
  let canShoot = true;

  const player = k.add([
    k.rect(config.player.size.width, config.player.size.height),
    k.pos(config.arena.width / 2, config.arena.offsetY + config.arena.height / 2),
    k.anchor('center'),
    k.area(),
    k.rotate(0),
    k.color(0, 128, 255), // Blue rectangle
    'player',
  ]);

  // Get angle to mouse
  function getAngleToMouse(): number {
    const mouse = k.mousePos();
    return Math.atan2(mouse.y - player.pos.y, mouse.x - player.pos.x);
  }

  // Shoot function
  function shoot() {
    if (!canShoot) return;
    canShoot = false;

    const angle = getAngleToMouse();
    const offset = config.player.size.width / 2 + 5;
    const spawnX = player.pos.x + Math.cos(angle) * offset;
    const spawnY = player.pos.y + Math.sin(angle) * offset;

    createProjectile(k, spawnX, spawnY, angle);

    k.wait(config.player.shootCooldown / 1000, () => {
      canShoot = true;
    });
  }

  // Shoot with spacebar or mouse click
  k.onKeyDown('space', shoot);
  k.onMouseDown('left', shoot);

  // Movement with delta time
  player.onUpdate(() => {
    // Rotate to face mouse
    player.angle = k.rad2deg(getAngleToMouse());

    const speed = config.player.speed;
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
