// Player entity - movement only
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function createPlayer(k: KAPLAYCtx): GameObj {
  const player = k.add([
    k.rect(config.player.size.width, config.player.size.height),
    k.pos(config.screen.width / 2, config.screen.height - 60),
    k.anchor('center'),
    k.area(),
    k.color(0, 128, 255), // Blue rectangle
    'player',
  ]);

  // Movement with delta time
  player.onUpdate(() => {
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

    // Keep player in bounds
    const halfW = config.player.size.width / 2;
    const halfH = config.player.size.height / 2;
    player.pos.x = k.clamp(player.pos.x, halfW, config.screen.width - halfW);
    player.pos.y = k.clamp(player.pos.y, halfH, config.screen.height - halfH);
  });

  return player;
}
