// Karma scoring system
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';

let karma = 0;
let karmaText: GameObj | null = null;

export function setupKarma(k: KAPLAYCtx): void {
  karma = 0;

  // Create karma display in HUD bar (right side)
  karmaText = k.add([
    k.text(`Karma: ${karma}`, { size: 20 }),
    k.pos(config.screen.width - 16, config.hud.height / 2),
    k.anchor('right'),
    k.color(255, 215, 0), // Gold color
    k.fixed(),
    'karmaText',
  ]);

  // Listen for enemy kills
  events.on('enemy:killed', (data) => {
    karma += data.karmaValue;
    events.emit('karma:changed', { newValue: karma, delta: data.karmaValue });

    if (karmaText) {
      karmaText.text = `Karma: ${karma}`;
    }
  });
}

export function getKarma(): number {
  return karma;
}
