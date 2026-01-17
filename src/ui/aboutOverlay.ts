// About overlay - shows help/reference during pause without leaving game
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

type AboutTab = 'controls' | 'bestiary' | 'rebirth';

let isVisible = false;
let currentTab: AboutTab = 'controls';
let uiElements: GameObj[] = [];
let tabContent: GameObj[] = [];
let kRef: KAPLAYCtx | null = null;
let onCloseCallback: (() => void) | null = null;

export function setupAboutOverlay(k: KAPLAYCtx): void {
  isVisible = false;
  currentTab = 'controls';
  uiElements = [];
  tabContent = [];
  onCloseCallback = null;
  kRef = k;

  k.onKeyPress('1', () => { if (isVisible) switchTab('controls'); });
  k.onKeyPress('2', () => { if (isVisible) switchTab('bestiary'); });
  k.onKeyPress('3', () => { if (isVisible) switchTab('rebirth'); });
}

function switchTab(tab: AboutTab): void {
  currentTab = tab;
  renderTabContent();
}

export function showAboutOverlay(onClose: () => void): void {
  if (!kRef || isVisible) return;
  isVisible = true;
  currentTab = 'controls';
  onCloseCallback = onClose;
  renderUI();
}

export function hideAboutOverlay(): void {
  isVisible = false;
  clearAll();
  if (onCloseCallback) onCloseCallback();
  onCloseCallback = null;
}

function clearAll(): void {
  uiElements.forEach(el => el.destroy());
  tabContent.forEach(el => el.destroy());
  uiElements = [];
  tabContent = [];
}

function renderUI(): void {
  if (!kRef) return;
  const k = kRef;
  const w = config.screen.width;
  const h = config.screen.height;

  // Background overlay
  uiElements.push(k.add([
    k.rect(w, h), k.pos(0, 0), k.color(0, 0, 0), k.opacity(0.85), k.fixed(), k.z(100),
  ]));

  // Title
  uiElements.push(k.add([
    k.text('HELP & REFERENCE', { size: 32 }),
    k.pos(w / 2, 50), k.anchor('center'), k.color(255, 215, 0), k.fixed(), k.z(101),
  ]));

  // Tab bar
  uiElements.push(k.add([
    k.text('(1) Controls   (2) Bestiary   (3) Rebirth   (ESC) Back', { size: 14 }),
    k.pos(w / 2, 90), k.anchor('center'), k.color(150, 150, 170), k.fixed(), k.z(101),
  ]));

  renderTabContent();
}

function renderTabContent(): void {
  if (!kRef) return;
  tabContent.forEach(el => el.destroy());
  tabContent = [];

  if (currentTab === 'controls') renderControls();
  else if (currentTab === 'bestiary') renderBestiary();
  else if (currentTab === 'rebirth') renderRebirth();
}

function renderControls(): void {
  if (!kRef) return;
  const k = kRef;
  const w = config.screen.width;
  const items = [
    { label: 'Move', value: 'WASD' },
    { label: 'Aim', value: 'Mouse' },
    { label: 'Shoot', value: 'Left Click / SPACE (hold)' },
    { label: 'Pause', value: 'ESC' },
  ];
  let y = 140;
  items.forEach(item => {
    tabContent.push(k.add([
      k.text(`${item.label}:`, { size: 18 }), k.pos(250, y), k.color(200, 180, 100), k.fixed(), k.z(101),
    ]));
    tabContent.push(k.add([
      k.text(item.value, { size: 16 }), k.pos(370, y + 2), k.color(180, 180, 200), k.fixed(), k.z(101),
    ]));
    y += 35;
  });
  tabContent.push(k.add([
    k.text('Collect virtue power-ups. Defeat 8 waves and vanquish Mara!', { size: 14 }),
    k.pos(w / 2, y + 30), k.anchor('center'), k.color(120, 120, 140), k.fixed(), k.z(101),
  ]));
}

function renderBestiary(): void {
  if (!kRef) return;
  const k = kRef;
  const enemies = [
    { name: 'Hungry Ghost', color: [255, 68, 68], desc: 'Erratic, 1 HP, 10 karma' },
    { name: 'Asura', color: [255, 140, 0], desc: 'Aggressive, 2 HP, 25 karma' },
    { name: 'Deva', color: [147, 112, 219], desc: 'Graceful, 3 HP, 50 karma' },
    { name: 'Mara', color: [139, 0, 0], desc: 'Lord of Illusion - Final Boss' },
  ];
  let y = 140;
  enemies.forEach(e => {
    const [r, g, b] = e.color;
    tabContent.push(k.add([k.rect(20, 20), k.pos(120, y - 5), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.name, { size: 18 }), k.pos(155, y), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.desc, { size: 14 }), k.pos(155, y + 22), k.color(150, 150, 170), k.fixed(), k.z(101)]));
    y += 55;
  });
}

function renderRebirth(): void {
  if (!kRef) return;
  const k = kRef;
  const w = config.screen.width;

  // Powerups row
  tabContent.push(k.add([
    k.text('Powerups', { size: 14 }), k.pos(w / 2, 118), k.anchor('center'), k.color(255, 215, 0), k.fixed(), k.z(101),
  ]));
  const powerups = [
    { name: 'Compassion', color: '#FF69B4', effect: 'Spread' },
    { name: 'Wisdom', color: '#4169E1', effect: 'Pierce' },
    { name: 'Patience', color: '#32CD32', effect: 'Slow' },
    { name: 'Diligence', color: '#FFD700', effect: 'Rapid' },
    { name: 'Meditation', color: '#9370DB', effect: 'Shield' },
    { name: 'Paduma', color: '#FFB6C1', effect: 'Heal' },
  ];
  let px = 70;
  powerups.forEach(p => {
    tabContent.push(k.add([k.circle(5), k.pos(px, 138), k.color(k.Color.fromHex(p.color)), k.anchor('center'), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.name, { size: 9 }), k.pos(px, 148), k.anchor('center'), k.color(180, 180, 200), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.effect, { size: 8 }), k.pos(px, 158), k.anchor('center'), k.color(120, 120, 140), k.fixed(), k.z(101)]));
    px += 115;
  });

  // Paramis section
  tabContent.push(k.add([
    k.text('Paramis (Buffs)', { size: 12 }), k.pos(55, 175), k.color(144, 238, 144), k.fixed(), k.z(101),
  ]));
  tabContent.push(k.add([
    k.text('Max', { size: 9 }), k.pos(340, 176), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const paramis = [
    { name: 'Dana (Generosity)', effect: '1.25x drops', max: 1 },
    { name: 'Viriya (Energy)', effect: '+10% fire', max: 5 },
    { name: 'Metta (Kindness)', effect: '+1 HP', max: 7 },
    { name: 'Upekkha (Equanimity)', effect: '-10% enemy', max: 5 },
    { name: 'Sila (Virtue)', effect: 'Auto-shield', max: 1 },
    { name: 'Khanti (Patience)', effect: '+20% duration', max: 5 },
    { name: 'Panna (Wisdom)', effect: '+1 damage', max: 2 },
    { name: 'Adhitthana (Resolve)', effect: '+1 shield', max: 1 },
    { name: 'Nekkhamma (Renounce)', effect: '+50% karma', max: 2 },
    { name: 'Sacca (Truth)', effect: '+5% lotus', max: 1 },
  ];
  let y = 190;
  paramis.forEach(p => {
    tabContent.push(k.add([k.text(p.name, { size: 10 }), k.pos(60, y), k.color(180, 255, 180), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.effect, { size: 10 }), k.pos(215, y), k.color(140, 200, 140), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`${p.max}`, { size: 10 }), k.pos(345, y), k.color(100, 150, 100), k.fixed(), k.z(101)]));
    y += 15;
  });

  // Kleshas section
  tabContent.push(k.add([
    k.text('Kleshas (Debuffs)', { size: 12 }), k.pos(400, 175), k.color(255, 100, 100), k.fixed(), k.z(101),
  ]));
  tabContent.push(k.add([
    k.text('Max', { size: 9 }), k.pos(700, 176), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const kleshas = [
    { name: 'Lobha (Greed)', effect: '-25% drops', max: 2 },
    { name: 'Dosa (Hatred)', effect: '+10% enemy', max: 3 },
    { name: 'Mana (Pride)', effect: '-1 HP', max: 5 },
    { name: 'Vicikiccha (Doubt)', effect: '-10% fire', max: 3 },
    { name: 'Moha (Delusion)', effect: '-20% duration', max: 2 },
    { name: 'Thina (Sloth)', effect: '-10% player', max: 2 },
    { name: 'Anottappa (Reckless)', effect: '-1 damage', max: 1 },
    { name: 'Micchaditthi (Wrong)', effect: '-25% karma', max: 2 },
  ];
  y = 190;
  kleshas.forEach(kl => {
    tabContent.push(k.add([k.text(kl.name, { size: 10 }), k.pos(405, y), k.color(255, 150, 150), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(kl.effect, { size: 10 }), k.pos(555, y), k.color(200, 140, 140), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`${kl.max}`, { size: 10 }), k.pos(705, y), k.color(150, 100, 100), k.fixed(), k.z(101)]));
    y += 15;
  });
}

export function isAboutOverlayVisible(): boolean {
  return isVisible;
}
