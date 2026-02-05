// Nirvana scene - victory screen with cycle choice
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';
import { getCycle, getDeaths, getGameState, incrementCycle } from '../stores/gameStore';
import { tryPlayCutscene, playCutscene } from '../systems/cutscene';

const FOUR_NOBLE_TRUTHS = [
  'Life is suffering. You have witnessed this truth.',
  'Suffering arises from attachment. You have released your grip.',
  'Suffering can end. You have glimpsed the cessation.',
  'The path exists. You have walked it.',
];

export async function createNirvanaScene(k: KAPLAYCtx, karma: number): Promise<void> {
  const cycle = getCycle();

  // Play victory cutscene (first time only)
  await tryPlayCutscene(k, 'victory');

  // Play rafLinens easter egg after kalpa 4 boss only
  if (cycle === 4) {
    await playCutscene(k, 'rafLinens');
  }

  playMusic('nirvana');
  const deaths = getDeaths();
  const state = getGameState();
  const truth = FOUR_NOBLE_TRUTHS[(cycle - 1) % 4];

  // Background
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(25, 20, 45),
  ]);

  // Glowing circle
  const circle = k.add([
    k.circle(80),
    k.pos(config.screen.width / 2, 100),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.opacity(0.3),
  ]);

  circle.onUpdate(() => {
    const scale = 1 + Math.sin(k.time() * 2) * 0.1;
    circle.radius = 80 * scale;
    circle.opacity = 0.2 + Math.sin(k.time() * 2) * 0.1;
  });

  // Title
  k.add([
    k.text('Nirvana Achieved', { size: 42 }),
    k.pos(config.screen.width / 2, 100),
    k.anchor('center'),
    k.color(255, 223, 150),
  ]);

  // Four Noble Truths quote
  k.add([
    k.text(`"${truth}"`, { size: 16 }),
    k.pos(config.screen.width / 2, 155),
    k.anchor('center'),
    k.color(200, 180, 220),
  ]);

  // Stats section
  const statsY = 210;
  k.add([
    k.text(`Kalpa ${cycle} Complete`, { size: 24 }),
    k.pos(config.screen.width / 2, statsY),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  k.add([
    k.text(`Karma: ${karma}  |  Deaths: ${deaths}`, { size: 18 }),
    k.pos(config.screen.width / 2, statsY + 35),
    k.anchor('center'),
    k.color(180, 180, 200),
  ]);

  // Paramis/Kleshas display
  if (state.paramis.length > 0 || state.kleshas.length > 0) {
    let effectsText = '';
    if (state.paramis.length > 0) {
      effectsText += `Paramis: ${state.paramis.length}  `;
    }
    if (state.kleshas.length > 0) {
      effectsText += `Kleshas: ${state.kleshas.length}`;
    }
    k.add([
      k.text(effectsText, { size: 16 }),
      k.pos(config.screen.width / 2, statsY + 65),
      k.anchor('center'),
      k.color(150, 150, 170),
    ]);
  }

  // Choice section
  const choiceY = 360;

  k.add([
    k.text('(P) Parinirvana — True liberation, end your journey', { size: 18 }),
    k.pos(config.screen.width / 2, choiceY),
    k.anchor('center'),
    k.color(150, 220, 150),
  ]);

  k.add([
    k.text(`(C) Continue — Return as Bodhisattva (Kalpa ${cycle + 1})`, { size: 18 }),
    k.pos(config.screen.width / 2, choiceY + 35),
    k.anchor('center'),
    k.color(220, 200, 100),
  ]);

  k.add([
    k.text('(M) Menu — Abandon this path', { size: 18 }),
    k.pos(config.screen.width / 2, choiceY + 70),
    k.anchor('center'),
    k.color(180, 150, 150),
  ]);

  // Flavor text
  k.add([
    k.text('The Bodhisattva delays liberation to help all beings.', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height - 40),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]);

  // Key handlers
  k.onKeyPress('p', () => {
    k.go('credits');
  });

  k.onKeyPress('c', async () => {
    await tryPlayCutscene(k, 'bodhisattva');
    incrementCycle();
    k.go('game');
  });

  k.onKeyPress('m', () => {
    k.go('menu');
  });
}
