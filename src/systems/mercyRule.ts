// Mercy rule system - 3 consecutive deaths with 0 karma = game over
import { events } from '../utils/events';
import { getGameState, recordDeath } from '../stores/gameStore';

let gameOverTriggered = false;

export function setupMercyRule(): void {
  gameOverTriggered = false;

  // Check for game over on player death
  events.on('player:died', () => {
    const mercyTriggered = recordDeath();

    if (mercyTriggered) {
      gameOverTriggered = true;
      events.emit('game:over', {});
    }
  });
}

export function isGameOver(): boolean {
  return gameOverTriggered;
}

export function getDeathsWithZeroKarma(): number {
  return getGameState().deathsWithZeroKarma;
}
