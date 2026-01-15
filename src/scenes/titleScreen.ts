// Title screen - "suffer" image with clickable Join/X buttons
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';

export function createTitleScreen(k: KAPLAYCtx): void {
  const ts = config.titleScreen;

  // Add the suffer image (scaled and centered)
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
    'joinButton',
  ]);

  joinButton.onClick(() => {
    k.go('game');
  });

  // "X" button - returns to menu (invisible clickable area)
  const closeButton = k.add([
    k.rect(ts.buttons.close.width, ts.buttons.close.height),
    k.pos(ts.buttons.close.x, ts.buttons.close.y),
    k.area(),
    k.opacity(0),
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
