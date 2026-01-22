// Pause menu UI rendering - display components
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getGameState } from '../stores/gameStore';

// Display names for paramis (internal name -> "Pali: effect")
const PARAMI_DISPLAY: Record<string, string> = {
  Dana: 'Dāna: +25% drops',
  Viriya: 'Viriya: +10% fire rate',
  Metta: 'Mettā: +1 max HP',
  Upekkha: 'Upekkhā: -10% enemy speed',
  Sila: 'Sīla: auto-shield',
  Khanti: 'Khantī: +20% powerup duration',
  Panna: 'Paññā: +1 damage',
  Adhitthana: 'Adhiṭṭhāna: +1 shield charge',
  Nekkhamma: 'Nekkhamma: +50% karma',
  Sacca: 'Sacca: +5% Paduma drops',
};

// Display names for kleshas
const KLESHA_DISPLAY: Record<string, string> = {
  Lobha: 'Lobha: -25% drops',
  Dosa: 'Dosa: +10% enemy speed',
  Mana: 'Māna: -1 max HP',
  Vicikiccha: 'Vicikicchā: -10% fire rate',
  Moha: 'Moha: -20% powerup duration',
  Thina: 'Thīna: -10% player speed',
  Anottappa: 'Anottappa: -1 damage',
  Micchaditthi: 'Micchādiṭṭhi: -25% karma',
  Ahirika: 'Ahirika: flips Manussā karma',
};

function countEffects(effects: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of effects) {
    counts.set(e, (counts.get(e) || 0) + 1);
  }
  return counts;
}

export function createPauseUI(k: KAPLAYCtx): { overlay: GameObj; items: GameObj[] } {
  const items: GameObj[] = [];

  const overlay = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.fixed(),
    k.z(100),
    'pauseOverlay',
  ]);

  items.push(k.add([
    k.text('PAUSED', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(ESC) Resume', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(A) Audio Settings', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 40),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(B) About / Help', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 80),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(Q) Quit to Menu', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 120),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  // Add status section showing active effects
  const state = getGameState();
  const paramiCounts = countEffects(state.paramis);
  const kleshaCounts = countEffects(state.kleshas);
  const hasEffects = paramiCounts.size > 0 || kleshaCounts.size > 0;

  if (hasEffects) {
    let statusY = config.screen.height - 120;

    items.push(k.add([
      k.text('Active Effects', { size: 16 }),
      k.pos(config.screen.width / 2, statusY),
      k.anchor('center'),
      k.color(180, 180, 180),
      k.fixed(),
      k.z(101),
      'pauseUI',
    ]));
    statusY += 24;

    // Build compact effect strings
    const paramiStrs: string[] = [];
    for (const [name, count] of paramiCounts) {
      const display = PARAMI_DISPLAY[name] || name;
      paramiStrs.push(count > 1 ? `${display} x${count}` : display);
    }

    const kleshaStrs: string[] = [];
    for (const [name, count] of kleshaCounts) {
      const display = KLESHA_DISPLAY[name] || name;
      kleshaStrs.push(count > 1 ? `${display} x${count}` : display);
    }

    // Show paramis (green)
    if (paramiStrs.length > 0) {
      items.push(k.add([
        k.text(paramiStrs.join(', '), { size: 12 }),
        k.pos(config.screen.width / 2, statusY),
        k.anchor('center'),
        k.color(100, 220, 100),
        k.fixed(),
        k.z(101),
        'pauseUI',
      ]));
      statusY += 18;
    }

    // Show kleshas (red)
    if (kleshaStrs.length > 0) {
      items.push(k.add([
        k.text(kleshaStrs.join(', '), { size: 12 }),
        k.pos(config.screen.width / 2, statusY),
        k.anchor('center'),
        k.color(255, 100, 100),
        k.fixed(),
        k.z(101),
        'pauseUI',
      ]));
    }
  }

  return { overlay, items };
}

export function createQuitConfirmUI(k: KAPLAYCtx): { overlay: GameObj; items: GameObj[] } {
  const items: GameObj[] = [];

  const overlay = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.fixed(),
    k.z(100),
    'pauseOverlay',
  ]);

  items.push(k.add([
    k.text('Return to the cycle of rebirth?', { size: 32 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 200, 100),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(Y/Q) Yes, abandon enlightenment', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  items.push(k.add([
    k.text('(N/ESC) No, continue the path', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 40),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  return { overlay, items };
}
