// Karma scoring system - uses gameStore for roguelike tracking
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { getGameState, getKarmaTotal, addKarma } from '../stores/gameStore';
import { getKarmaMultiplier } from './rebirthEffects';

let karmaText: GameObj | null = null;
let karmaThisLifeText: GameObj | null = null;

export function setupKarma(k: KAPLAYCtx): void {
  const state = getGameState();

  // Create karma display in HUD bar (right side) - shows total
  karmaText = k.add([
    k.text(`Karma: ${state.karmaTotal}`, { size: 20 }),
    k.pos(config.screen.width - 16, config.hud.height / 2 - 10),
    k.anchor('right'),
    k.color(255, 215, 0), // Gold color
    k.fixed(),
    'karmaText',
  ]);

  // Show karma this life below
  karmaThisLifeText = k.add([
    k.text(`This life: ${state.karmaThisLife}`, { size: 14 }),
    k.pos(config.screen.width - 16, config.hud.height / 2 + 12),
    k.anchor('right'),
    k.color(200, 200, 150),
    k.fixed(),
    'karmaThisLifeText',
  ]);

  // Listen for enemy kills
  events.on('enemy:killed', (data) => {
    // Apply Nekkhamma/Micchaditthi karma multiplier
    const karmaEarned = Math.round(data.karmaValue * getKarmaMultiplier());
    addKarma(karmaEarned);
    const state = getGameState();
    events.emit('karma:changed', { newValue: state.karmaTotal, delta: karmaEarned });

    if (karmaText) {
      karmaText.text = `Karma: ${state.karmaTotal}`;
    }
    if (karmaThisLifeText) {
      karmaThisLifeText.text = `This life: ${state.karmaThisLife}`;
    }
  });
}

export function getKarma(): number {
  return getKarmaTotal();
}

export function updateKarmaDisplay(): void {
  const store = getGameState();
  if (karmaThisLifeText) {
    karmaThisLifeText.text = `This life: ${store.karmaThisLife}`;
  }
}
