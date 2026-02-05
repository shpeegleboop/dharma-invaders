// Pause menu UI rendering - display components
// Note: Parami/Klesha effects are rendered via HTML overlay (htmlOverlays.ts)
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function createPauseUI(k: KAPLAYCtx): { overlay: GameObj; items: GameObj[] } {
  const items: GameObj[] = [];

  const overlay = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.fixed(),
    k.z(100),
    'pauseOverlay',
  ]);

  items.push(k.add([
    k.text('PAUSED', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(ESC) Resume', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(A) Audio Settings', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 40),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(B) About / Help', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 80),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(Q) Quit to Menu', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 120),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  // Parami/Klesha effects are rendered via HTML overlay (see htmlOverlays.ts)

  return { overlay, items };
}

export function createQuitConfirmUI(k: KAPLAYCtx): { overlay: GameObj; items: GameObj[] } {
  const items: GameObj[] = [];

  const overlay = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.fixed(),
    k.z(100),
    'pauseOverlay',
  ]);

  items.push(k.add([
    k.text('Return to the cycle of rebirth?', { size: 32 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 200, 100),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(Y/Q) Yes, abandon enlightenment', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(N/ESC) No, continue the path', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 40),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  return { overlay, items };
}
