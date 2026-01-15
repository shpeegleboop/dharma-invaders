// Mercy rule system - track consecutive deaths without kills
import { events } from '../utils/events';
import { getGameState, recordDeath } from '../stores/gameStore';
import config from '../data/config.json';

const MERCY_THRESHOLD = config.roguelike.mercyRuleDeaths;

let gameOverTriggered = false;

export function setupMercyRule(): void {
  gameOverTriggered = false;

  // Increment counter on player death, check for game over
  events.on('player:died', () => {
    recordDeath();
    const state = getGameState();

    if (state.deathsWithoutKill >= MERCY_THRESHOLD) {
      // Mercy rule triggered - actual game over
      gameOverTriggered = true;
      events.emit('game:over', {});
    }
  });
}

export function isGameOver(): boolean {
  return gameOverTriggered;
}

export function getConsecutiveDeaths(): number {
  return getGameState().deathsWithoutKill;
}
