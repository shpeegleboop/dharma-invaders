// Health display system
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';

let healthText: GameObj | null = null;
let currentHealth = config.player.health;

export function setupHealth(k: KAPLAYCtx): void {
  currentHealth = config.player.health;

  // Create health display in HUD bar (left side)
  healthText = k.add([
    k.text(`Health: ${currentHealth}`, { size: 20 }),
    k.pos(16, config.hud.height / 2),
    k.anchor('left'),
    k.color(255, 100, 100), // Red color
    k.fixed(),
    'healthText',
  ]);

  // Listen for player hits
  events.on('player:hit', (data) => {
    currentHealth = data.remainingHealth;
    updateDisplay();
  });

  // Listen for player death (reset health display)
  events.on('player:died', () => {
    k.wait(0.5, () => {
      currentHealth = config.player.health;
      updateDisplay();
    });
  });
}

function updateDisplay(): void {
  if (healthText) {
    healthText.text = `Health: ${currentHealth}`;
  }
}

export function getHealth(): number {
  return currentHealth;
}
