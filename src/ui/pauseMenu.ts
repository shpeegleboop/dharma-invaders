// Pause menu UI - ESC to pause/resume during gameplay
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

type PauseState = 'playing' | 'paused' | 'audioSettings';

// Global pause flag - import this in entity/system files
export let isPaused = false;

let state: PauseState = 'playing';
let overlay: GameObj | null = null;
let menuItems: GameObj[] = [];
let kRef: KAPLAYCtx | null = null;

// Audio settings imports (will be set up in setupPauseMenu)
let showAudioSettings: (() => void) | null = null;
let hideAudioSettings: (() => void) | null = null;

export function setupPauseMenu(
  k: KAPLAYCtx,
  audioSettingsShow: () => void,
  audioSettingsHide: () => void
): void {
  // Reset all state on scene change
  isPaused = false;
  state = 'playing';
  overlay = null;
  menuItems = [];
  kRef = k;
  showAudioSettings = audioSettingsShow;
  hideAudioSettings = audioSettingsHide;

  // ESC key handler
  k.onKeyPress('escape', () => {
    if (state === 'playing') {
      pause();
    } else if (state === 'paused') {
      resume();
    } else if (state === 'audioSettings') {
      // Return to pause menu from audio settings
      if (hideAudioSettings) hideAudioSettings();
      state = 'paused';
      showPauseUI();
    }
  });

  // Pause menu controls (only active when paused)
  k.onKeyPress('a', () => {
    if (state === 'paused') {
      hidePauseUI();
      state = 'audioSettings';
      if (showAudioSettings) showAudioSettings();
    }
  });

  k.onKeyPress('q', () => {
    if (state === 'paused') {
      resume();
      k.go('menu');
    }
  });
}

function pause(): void {
  if (!kRef) return;
  state = 'paused';
  isPaused = true;
  showPauseUI();
}

function resume(): void {
  if (!kRef) return;
  state = 'playing';
  isPaused = false;
  hidePauseUI();
}

function showPauseUI(): void {
  if (!kRef) return;
  const k = kRef;

  // Dark overlay
  overlay = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.fixed(),
    k.z(100),
    'pauseOverlay',
  ]);

  // PAUSED title
  menuItems.push(k.add([
    k.text('PAUSED', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  // Resume option
  menuItems.push(k.add([
    k.text('(ESC) Resume', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  // Audio settings option
  menuItems.push(k.add([
    k.text('(A) Audio Settings', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 40),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));

  // Quit option
  menuItems.push(k.add([
    k.text('(Q) Quit to Menu', { size: 24 }),
    k.pos(config.screen.width / 2, config.screen.height / 2 + 80),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(101),
    'pauseUI',
  ]));
}

function hidePauseUI(): void {
  if (overlay) {
    overlay.destroy();
    overlay = null;
  }
  menuItems.forEach((item) => item.destroy());
  menuItems = [];
}

export function getPauseState(): PauseState {
  return state;
}

// Called when returning from audio settings opened from pause menu
export function returnToPauseMenu(): void {
  if (!kRef) return;
  state = 'paused';
  showPauseUI();
}
