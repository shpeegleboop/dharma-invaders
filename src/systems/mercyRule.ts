// Mercy rule system - track consecutive deaths without kills
import { events } from '../utils/events';

const MERCY_THRESHOLD = 3;

let consecutiveDeathsWithoutKill = 0;
let gameOverTriggered = false;

export function setupMercyRule(): void {
  consecutiveDeathsWithoutKill = 0;
  gameOverTriggered = false;

  // Reset counter when player kills an enemy
  events.on('enemy:killed', () => {
    consecutiveDeathsWithoutKill = 0;
  });

  // Increment counter on player death, check for game over
  events.on('player:died', () => {
    consecutiveDeathsWithoutKill++;

    if (consecutiveDeathsWithoutKill >= MERCY_THRESHOLD) {
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
  return consecutiveDeathsWithoutKill;
}
