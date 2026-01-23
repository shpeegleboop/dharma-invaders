// Boss health bar - displays during boss fight only
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { events } from '../utils/events';
import { getMara, getMaraPhase, getMaraMaxHealth } from '../entities/mara';

let barBackground: GameObj | null = null;
let barFill: GameObj | null = null;
let barLabel: GameObj | null = null;
let barHpText: GameObj | null = null;
let isVisible = false;

const BAR_WIDTH = config.boss.healthBar.width;
const BAR_HEIGHT = config.boss.healthBar.height;
const BAR_X = config.screen.width / 2;
const BAR_Y = config.hud.height - 28;

export function setupBossHealthBar(k: KAPLAYCtx): void {
  // Create hidden bar elements
  barBackground = k.add([
    k.rect(BAR_WIDTH + 4, BAR_HEIGHT + 4),
    k.pos(BAR_X, BAR_Y),
    k.anchor('center'),
    k.color(40, 40, 40),
    k.fixed(),
    k.opacity(0),
    'bossBarBg',
  ]);

  barFill = k.add([
    k.rect(BAR_WIDTH, BAR_HEIGHT),
    k.pos(BAR_X - BAR_WIDTH / 2, BAR_Y - BAR_HEIGHT / 2),
    k.color(0, 255, 0),
    k.fixed(),
    k.opacity(0),
    'bossBarFill',
  ]);

  barLabel = k.add([
    k.text('MARA', { size: 12 }),
    k.pos(BAR_X, BAR_Y - 14),
    k.anchor('center'),
    k.color(255, 200, 200),
    k.fixed(),
    k.opacity(0),
    'bossBarLabel',
  ]);

  barHpText = k.add([
    k.text('', { size: 10 }),
    k.pos(BAR_X, BAR_Y),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.opacity(0),
    k.z(10),
    'bossBarHp',
  ]);

  // Show bar when boss starts
  events.on('boss:started', () => {
    showBar();
  });

  // Hide bar on boss defeat
  events.on('boss:defeated', () => {
    hideBar();
  });

  // Update bar each frame
  k.onUpdate(() => {
    if (!isVisible) return;
    updateBar(k);
  });
}

function showBar(): void {
  isVisible = true;
  if (barBackground) barBackground.opacity = 1;
  if (barFill) barFill.opacity = 1;
  if (barLabel) barLabel.opacity = 1;
  if (barHpText) barHpText.opacity = 1;
}

function hideBar(): void {
  isVisible = false;
  if (barBackground) barBackground.opacity = 0;
  if (barFill) barFill.opacity = 0;
  if (barLabel) barLabel.opacity = 0;
  if (barHpText) barHpText.opacity = 0;
}

function updateBar(k: KAPLAYCtx): void {
  const mara = getMara();
  if (!mara || !barFill) return;

  const currentHp = Math.max(0, mara.hp());
  const maxHp = getMaraMaxHealth();

  // Calculate health percentage (use scaled max health)
  const healthPercent = currentHp / maxHp;
  const newWidth = Math.max(0, BAR_WIDTH * healthPercent);

  // Update bar width
  barFill.width = newWidth;

  // Update HP text
  if (barHpText) {
    barHpText.text = `${Math.ceil(currentHp)} / ${maxHp}`;
  }

  // Update color based on phase
  const phase = getMaraPhase();
  switch (phase) {
    case 'phase1':
      barFill.color = k.rgb(0, 255, 0); // Green
      break;
    case 'phase2':
      barFill.color = k.rgb(255, 255, 0); // Yellow
      break;
    case 'phase3':
      barFill.color = k.rgb(255, 0, 0); // Red
      break;
  }
}
