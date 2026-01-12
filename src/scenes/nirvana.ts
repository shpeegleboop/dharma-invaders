// Nirvana scene - victory screen with exit confirmation
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';

type NirvanaState = 'viewing' | 'confirming';

export function createNirvanaScene(k: KAPLAYCtx, karma: number): void {
  playMusic('nirvana');
  let state: NirvanaState = 'viewing';
  let confirmUI: GameObj[] = [];

  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(25, 20, 45),
  ]);

  const circle = k.add([
    k.circle(80),
    k.pos(config.screen.width / 2, config.screen.height / 3 - 20),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.opacity(0.3),
  ]);

  circle.onUpdate(() => {
    const scale = 1 + Math.sin(k.time() * 2) * 0.1;
    circle.radius = 80 * scale;
    circle.opacity = 0.2 + Math.sin(k.time() * 2) * 0.1;
  });

  k.add([
    k.text('Nirvana Achieved', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 223, 150),
  ]);

  k.add([
    k.text('You have escaped the Wheel of Samsara', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height / 3 + 50),
    k.anchor('center'),
    k.color(200, 180, 220),
  ]);

  k.add([
    k.text('Mara, the demon of illusion, is vanquished', { size: 16 }),
    k.pos(config.screen.width / 2, config.screen.height / 3 + 80),
    k.anchor('center'),
    k.color(150, 140, 170),
  ]);

  k.add([
    k.text(`Final Karma: ${karma}`, { size: 28 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 20),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  const prompt = k.add([
    k.text('Press SPACE to continue', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.75),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.opacity(1),
  ]);

  prompt.onUpdate(() => {
    if (state === 'viewing') {
      prompt.opacity = 0.5 + Math.sin(k.time() * 2) * 0.5;
    }
  });

  function showConfirmation(): void {
    state = 'confirming';
    prompt.hidden = true;

    const overlay = k.add([
      k.rect(config.screen.width, config.screen.height),
      k.pos(0, 0),
      k.color(0, 0, 0),
      k.opacity(0.8),
      k.z(50),
    ]);
    confirmUI.push(overlay);

    confirmUI.push(k.add([
      k.text('Are you sure you want to forget', { size: 20 }),
      k.pos(config.screen.width / 2, config.screen.height / 3),
      k.anchor('center'),
      k.color(255, 200, 100),
      k.z(51),
    ]));

    confirmUI.push(k.add([
      k.text('the unconditioned state beyond', { size: 20 }),
      k.pos(config.screen.width / 2, config.screen.height / 3 + 28),
      k.anchor('center'),
      k.color(255, 200, 100),
      k.z(51),
    ]));

    confirmUI.push(k.add([
      k.text('existence and nonexistence?', { size: 20 }),
      k.pos(config.screen.width / 2, config.screen.height / 3 + 56),
      k.anchor('center'),
      k.color(255, 200, 100),
      k.z(51),
    ]));

    confirmUI.push(k.add([
      k.text('(N) No, time for parinirvana', { size: 18 }),
      k.pos(config.screen.width / 2, config.screen.height / 2 + 20),
      k.anchor('center'),
      k.color(150, 220, 150),
      k.z(51),
    ]));

    confirmUI.push(k.add([
      k.text('(Y) Yes, I like suffering', { size: 18 }),
      k.pos(config.screen.width / 2, config.screen.height / 2 + 55),
      k.anchor('center'),
      k.color(220, 150, 150),
      k.z(51),
    ]));
  }

  function hideConfirmation(): void {
    confirmUI.forEach(obj => obj.destroy());
    confirmUI = [];
    state = 'viewing';
    prompt.hidden = false;
  }

  k.onKeyPress('space', () => {
    if (state === 'viewing') showConfirmation();
  });

  k.onMousePress('left', () => {
    if (state === 'viewing') showConfirmation();
  });

  k.onKeyPress('n', () => {
    if (state === 'confirming') k.go('credits');
  });

  k.onKeyPress('y', () => {
    if (state === 'confirming') k.go('menu');
  });

  k.onKeyPress('escape', () => {
    if (state === 'confirming') hideConfirmation();
  });
}
