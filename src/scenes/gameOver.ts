// Game Over scene - mercy rule death
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';
import { resetAll } from '../stores/gameStore';

export function createGameOverScene(k: KAPLAYCtx, karma: number): void {
  // Play game over music
  playMusic('gameover');
  // Dark red background
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(30, 10, 10),
  ]);

  // Title
  k.add([
    k.text('You have not reached Nirvana', { size: 36 }),
    k.pos(config.screen.width / 2, config.screen.height / 4),
    k.anchor('center'),
    k.color(200, 50, 50),
  ]);

  // Subtitle
  k.add([
    k.text('in this lifetime.', { size: 36 }),
    k.pos(config.screen.width / 2, config.screen.height / 4 + 45),
    k.anchor('center'),
    k.color(200, 50, 50),
  ]);

  // Message
  k.add([
    k.text('Maybe next time...', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 4 + 95),
    k.anchor('center'),
    k.color(150, 100, 100),
  ]);

  // Karma score
  k.add([
    k.text(`Karma Earned: ${karma}`, { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  // Continue Suffering button
  const continuePrompt = k.add([
    k.text('Press SPACE to Continue Suffering', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.65),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.opacity(1),
  ]);

  continuePrompt.onUpdate(() => {
    continuePrompt.opacity = 0.5 + Math.sin(k.time() * 3) * 0.5;
  });

  // Main Menu button
  k.add([
    k.text('Press M for Main Menu', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.75),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]);

  // Input handlers
  k.onKeyPress('space', () => {
    resetAll(); // Clear karma, paramis, kleshas, cycle for fresh start
    k.go('game');
  });

  k.onKeyPress('m', () => {
    k.go('menu');
  });
}
