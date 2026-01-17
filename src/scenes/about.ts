// About scene - bestiary, lore, and controls
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { showControls, showBestiary, showLore, showRebirth } from './aboutTabs';

interface AboutSceneData {
  returnTo?: string;
}

export function createAboutScene(k: KAPLAYCtx, data?: AboutSceneData): void {
  const returnTo = data?.returnTo || 'menu';
  let pageContent: GameObj[] = [];

  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(15, 15, 30),
  ]);

  k.add([
    k.text('About Dharma Invaders', { size: 32 }),
    k.pos(config.screen.width / 2, 40),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  // Tab navigation
  k.add([
    k.text('(1) Controls  (2) Bestiary  (3) Lore  (4) Rebirth  (ESC) Back', { size: 14 }),
    k.pos(config.screen.width / 2, 80),
    k.anchor('center'),
    k.color(150, 150, 170),
  ]);

  function clearPage(): void {
    pageContent.forEach(obj => obj.destroy());
    pageContent = [];
  }

  function renderControls(): void {
    clearPage();
    showControls(k, pageContent);
  }

  function renderBestiary(): void {
    clearPage();
    showBestiary(k, pageContent);
  }

  function renderLore(): void {
    clearPage();
    showLore(k, pageContent);
  }

  function renderRebirth(): void {
    clearPage();
    showRebirth(k, pageContent);
  }

  renderControls();

  k.onKeyPress('1', renderControls);
  k.onKeyPress('2', renderBestiary);
  k.onKeyPress('3', renderLore);
  k.onKeyPress('4', renderRebirth);
  k.onKeyPress('escape', () => k.go(returnTo));
  k.onKeyPress('b', () => k.go(returnTo));
}
