// Credits scene - parinirvana ending with looping quotes
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import quotes from '../data/quotes.json';
import { playMusic } from '../systems/audio';

export function createCreditsScene(k: KAPLAYCtx): void {
  playMusic('nirvana');

  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(10, 10, 20),
  ]);

  // Title
  k.add([
    k.text('Parinirvana', { size: 40 }),
    k.pos(config.screen.width / 2, 80),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  k.add([
    k.text('The Final Liberation', { size: 18 }),
    k.pos(config.screen.width / 2, 120),
    k.anchor('center'),
    k.color(180, 160, 200),
  ]);

  // Quote display
  let currentQuoteIndex = 0;
  const quoteText = k.add([
    k.text(quotes.enlightenment[0], { size: 18, width: 600 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(200, 200, 220),
    k.opacity(1),
  ]);

  // Attribution
  k.add([
    k.text('— The Buddha', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 80),
    k.anchor('center'),
    k.color(150, 150, 170),
  ]);

  // Cycle quotes
  let timer = 0;
  const quoteDuration = 6;

  quoteText.onUpdate(() => {
    timer += k.dt();
    if (timer >= quoteDuration) {
      timer = 0;
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.enlightenment.length;
      quoteText.text = quotes.enlightenment[currentQuoteIndex];
    }
    // Fade effect
    const phase = timer / quoteDuration;
    if (phase < 0.15) {
      quoteText.opacity = phase / 0.15;
    } else if (phase > 0.85) {
      quoteText.opacity = (1 - phase) / 0.15;
    } else {
      quoteText.opacity = 1;
    }
  });

  // Credits section
  k.add([
    k.text('Dharma Invaders', { size: 16 }),
    k.pos(config.screen.width / 2, config.screen.height - 120),
    k.anchor('center'),
    k.color(100, 100, 120),
  ]);

  k.add([
    k.text('A meditation on impermanence', { size: 12 }),
    k.pos(config.screen.width / 2, config.screen.height - 95),
    k.anchor('center'),
    k.color(80, 80, 100),
  ]);

  // Exit hint
  const hint = k.add([
    k.text('Press ESC to return to the world of form', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height - 40),
    k.anchor('center'),
    k.color(120, 120, 140),
    k.opacity(0.5),
  ]);

  hint.onUpdate(() => {
    hint.opacity = 0.3 + Math.sin(k.time() * 1.5) * 0.2;
  });

  k.onKeyPress('escape', () => {
    k.go('menu');
  });
}
