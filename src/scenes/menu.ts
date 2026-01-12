// Menu scene - title screen
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';

export function createMenuScene(k: KAPLAYCtx): void {
  // Play menu music
  playMusic('menu');
  // Dark background
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(15, 15, 30),
  ]);

  // Title
  k.add([
    k.text('Dharma Invaders', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  // Subtitle
  k.add([
    k.text('Escape the Wheel of Samsara', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 3 + 50),
    k.anchor('center'),
    k.color(180, 180, 200),
  ]);

  // Start prompt (pulsing)
  const prompt = k.add([
    k.text('Press SPACE or CLICK to Enter Samsara', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.65),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.opacity(1),
  ]);

  // Pulse the prompt
  prompt.onUpdate(() => {
    prompt.opacity = 0.5 + Math.sin(k.time() * 3) * 0.5;
  });

  // Controls hint
  k.add([
    k.text('WASD to move | Mouse to aim | Click or SPACE to shoot', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height - 60),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]);

  // Start game on input
  const startGame = () => {
    k.go('game');
  };

  k.onKeyPress('space', startGame);
  k.onMousePress('left', startGame);
}
