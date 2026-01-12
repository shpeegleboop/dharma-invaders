// Nirvana scene - victory screen
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';

export function createNirvanaScene(k: KAPLAYCtx, karma: number): void {
  // Play nirvana music
  playMusic('nirvana');
  // Peaceful gradient background (deep purple to gold tint)
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(25, 20, 45),
  ]);

  // Decorative circle (represents enlightenment)
  const circle = k.add([
    k.circle(80),
    k.pos(config.screen.width / 2, config.screen.height / 3 - 20),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.opacity(0.3),
  ]);

  // Pulse the circle
  circle.onUpdate(() => {
    const scale = 1 + Math.sin(k.time() * 2) * 0.1;
    circle.radius = 80 * scale;
    circle.opacity = 0.2 + Math.sin(k.time() * 2) * 0.1;
  });

  // Title
  k.add([
    k.text('Nirvana Achieved', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 223, 150),
  ]);

  // Subtitle
  k.add([
    k.text('You have escaped the Wheel of Samsara', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height / 3 + 50),
    k.anchor('center'),
    k.color(200, 180, 220),
  ]);

  // Mara defeated message
  k.add([
    k.text('Mara, the demon of illusion, is vanquished', { size: 16 }),
    k.pos(config.screen.width / 2, config.screen.height / 3 + 80),
    k.anchor('center'),
    k.color(150, 140, 170),
  ]);

  // Karma score
  k.add([
    k.text(`Final Karma: ${karma}`, { size: 28 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 20),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  // Return prompt
  const prompt = k.add([
    k.text('Press SPACE to return', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.75),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.opacity(1),
  ]);

  prompt.onUpdate(() => {
    prompt.opacity = 0.5 + Math.sin(k.time() * 2) * 0.5;
  });

  // Return to menu
  k.onKeyPress('space', () => {
    k.go('menu');
  });

  k.onMousePress('left', () => {
    k.go('menu');
  });
}
