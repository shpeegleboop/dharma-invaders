// Title screen - "suffer" image with clickable Join/X buttons
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { resetAll } from '../stores/gameStore';
import { drawGeometricBackground, drawQuoteFrame } from '../ui/titleScreenArt';

export function createTitleScreen(k: KAPLAYCtx): void {
  const ts = config.titleScreen;

  // Layer 1: Geometric purple background
  drawGeometricBackground(k);

  // Layer 2: Quote frame at bottom
  drawQuoteFrame(k);

  // Layer 3: The suffer image (scaled and centered)
  k.add([
    k.sprite('sufferScreen'),
    k.pos(ts.offsetX, 0),
    k.scale(ts.scale),
  ]);

  // "Join" button - starts the game (invisible clickable area)
  const joinButton = k.add([
    k.rect(ts.buttons.join.width, ts.buttons.join.height),
    k.pos(ts.buttons.join.x, ts.buttons.join.y),
    k.area(),
    k.opacity(0),
    k.fixed(),
    'joinButton',
  ]);

  joinButton.onClick(() => {
    resetAll(); // Fresh start - clear karma, paramis, kleshas, cycle
    k.go('game');
  });

  // "X" button - returns to menu (invisible clickable area)
  const closeButton = k.add([
    k.rect(ts.buttons.close.width, ts.buttons.close.height),
    k.pos(ts.buttons.close.x, ts.buttons.close.y),
    k.area(),
    k.opacity(0),
    k.fixed(),
    'closeButton',
  ]);

  closeButton.onClick(() => {
    k.go('menu');
  });

  // ESC also returns to menu
  k.onKeyPress('escape', () => {
    k.go('menu');
  });
}
