// Mercy rule system - 3 consecutive deaths with 0 karma = game over
// Also handles boss fight death limits by difficulty
import { events } from '../utils/events';
import {
  getGameState,
  recordDeath,
  startBossFight,
  endBossFight,
  isInBossFight,
  recordBossDeath,
  getBossDeathCount,
  getDifficulty,
} from '../stores/gameStore';
import config from '../data/config.json';

let gameOverTriggered = false;

// Get boss death limit for current difficulty (null = no limit)
function getBossDeathLimit(): number | null {
  const difficulty = getDifficulty();
  const diffConfig = config.difficulty[difficulty];
  return diffConfig?.bossDeathLimit ?? null;
}

export function setupMercyRule(): void {
  gameOverTriggered = false;

  // Track boss fight state
  events.on('boss:started', () => {
    startBossFight();
  });

  events.on('boss:defeated', () => {
    endBossFight();
  });

  // Check for game over on player death
  events.on('player:died', () => {
    // Regular mercy rule (waves)
    const mercyTriggered = recordDeath();

    if (mercyTriggered) {
      gameOverTriggered = true;
      events.emit('game:over', {});
      return;
    }

    // Boss death limit check
    if (isInBossFight()) {
      recordBossDeath();
      const limit = getBossDeathLimit();
      if (limit !== null && getBossDeathCount() >= limit) {
        gameOverTriggered = true;
        events.emit('game:over', {});
      }
    }
  });
}

export function isGameOver(): boolean {
  return gameOverTriggered;
}

export function getDeathsWithZeroKarma(): number {
  return getGameState().deathsWithZeroKarma;
}
