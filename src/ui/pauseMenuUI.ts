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

  // Fullscreen toggle
  const fsText = k.isFullscreen() ? '(F) Windowed' : '(F) Fullscreen';
  items.push(k.add([
    k.text(fsText, { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 160),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
    'fullscreenLabel',
  ]));

  // Add status section showing active effects (two columns: paramis left, kleshas right)
  const state = getGameState();
  const paramiCounts = countEffects(state.paramis);
  const kleshaCounts = countEffects(state.kleshas);
  const hasEffects = paramiCounts.size > 0 || kleshaCounts.size > 0;

  if (hasEffects) {
    const baseY = config.screen.height - 168;
    const leftX = 30;
    const rightX = config.screen.width / 2 + 30;
    const lineHeight = 14;

    // Paramis column (green, left side)
    if (paramiCounts.size > 0) {
      items.push(k.add([
        k.text('Virtues', { size: 14 }),
        k.pos(leftX, baseY),
        k.anchor('left'),
        k.color(100, 220, 100),
        k.fixed(),
        k.z(101),
        'pauseUI',
      ]));

      let y = baseY + 18;
      for (const [name, count] of paramiCounts) {
        const display = PARAMI_DISPLAY[name] || name;
        const text = count > 1 ? `${display} x${count}` : display;
        items.push(k.add([
          k.text(text, { size: 11 }),
          k.pos(leftX, y),
          k.anchor('left'),
          k.color(150, 255, 150),
          k.fixed(),
          k.z(101),
          'pauseUI',
        ]));
        y += lineHeight;
      }
    }

    // Kleshas column (red, right side)
    if (kleshaCounts.size > 0) {
      items.push(k.add([
        k.text('Afflictions', { size: 14 }),
        k.pos(rightX, baseY),
        k.anchor('left'),
        k.color(255, 100, 100),
        k.fixed(),
        k.z(101),
        'pauseUI',
      ]));

      let y = baseY + 18;
      for (const [name, count] of kleshaCounts) {
        const display = KLESHA_DISPLAY[name] || name;
        const text = count > 1 ? `${display} x${count}` : display;
        items.push(k.add([
          k.text(text, { size: 11 }),
          k.pos(rightX, y),
          k.anchor('left'),
          k.color(255, 150, 150),
          k.fixed(),
          k.z(101),
          'pauseUI',
        ]));
        y += lineHeight;
      }
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
