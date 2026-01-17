// Health display system
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { getMaxHealthModifier } from './rebirthEffects';

let healthText: GameObj | null = null;
let currentHealth = config.player.health;

function getEffectiveMaxHealth(): number {
  return Math.max(1, config.player.health + getMaxHealthModifier());
}

export function setupHealth(k: KAPLAYCtx): void {
  currentHealth = getEffectiveMaxHealth();

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

  // Health reset on respawn is handled by player.ts calling setHealthDisplay()
  // after paramis/kleshas are applied

  // Listen for player healing (Paduma powerup)
  events.on('player:healed', (data) => {
    // Use actual HP from Kaplay component to stay in sync
    currentHealth = data.newHealth;
    updateDisplay();
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

export function setHealthDisplay(health: number): void {
  currentHealth = health;
  updateDisplay();
}
