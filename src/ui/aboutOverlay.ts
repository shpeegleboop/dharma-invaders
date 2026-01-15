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
  tabContent.push(k.add([
    k.text('When you die, karma determines rebirth quality.', { size: 16 }),
    k.pos(config.screen.width / 2, 130), k.anchor('center'), k.color(180, 180, 200), k.fixed(), k.z(101),
  ]));
  // Paramis
  tabContent.push(k.add([
    k.text('Paramis (Buffs)', { size: 18 }), k.pos(100, 165), k.color(144, 238, 144), k.fixed(), k.z(101),
  ]));
  const paramis = ['Dana: +25% drops', 'Viriya: +15% fire rate', 'Metta: +1 HP', 'Upekkha: Enemies slower'];
  let y = 190;
  paramis.forEach(p => {
    tabContent.push(k.add([k.text(p, { size: 14 }), k.pos(110, y), k.color(180, 255, 180), k.fixed(), k.z(101)]));
    y += 22;
  });
  // Kleshas
  tabContent.push(k.add([
    k.text('Kleshas (Debuffs)', { size: 18 }), k.pos(420, 165), k.color(255, 100, 100), k.fixed(), k.z(101),
  ]));
  const kleshas = ['Lobha: -25% drops', 'Vicikiccha: -15% fire rate', 'Mana: -1 HP', 'Dosa: Enemies faster'];
  y = 190;
  kleshas.forEach(kl => {
    tabContent.push(k.add([k.text(kl, { size: 14 }), k.pos(430, y), k.color(255, 150, 150), k.fixed(), k.z(101)]));
    y += 22;
  });
}

export function isAboutOverlayVisible(): boolean {
  return isVisible;
}
