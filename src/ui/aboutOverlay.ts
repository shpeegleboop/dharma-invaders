// About overlay - shows help/reference during pause without leaving game
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { renderControls, renderBestiary, renderRebirth } from './aboutOverlayTabs';

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
  doRenderTabContent();
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
    k.text('QUALITIES OF MIND', { size: 32 }),
    k.pos(w / 2, 50), k.anchor('center'), k.color(255, 215, 0), k.fixed(), k.z(101),
  ]));

  // Tab bar
  uiElements.push(k.add([
    k.text('(1) Controls   (2) Bestiary   (3) Rebirth   (ESC) Back', { size: 14 }),
    k.pos(w / 2, 90), k.anchor('center'), k.color(150, 150, 170), k.fixed(), k.z(101),
  ]));

  doRenderTabContent();
}

function doRenderTabContent(): void {
  if (!kRef) return;
  tabContent.forEach(el => el.destroy());
  tabContent = [];

  if (currentTab === 'controls') renderControls(kRef, tabContent);
  else if (currentTab === 'bestiary') renderBestiary(kRef, tabContent);
  else if (currentTab === 'rebirth') renderRebirth(kRef, tabContent);
}

export function isAboutOverlayVisible(): boolean {
  return isVisible;
}
