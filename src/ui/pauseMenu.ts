// Pause menu UI - ESC to pause/resume during gameplay
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { createPauseUI, createQuitConfirmUI } from './pauseMenuUI';
import { setupAboutOverlay, showAboutOverlay, hideAboutOverlay } from './aboutOverlay';
import { showPauseEffects, hidePauseEffects } from './htmlOverlays';
import { isCutscenePlaying } from '../systems/cutscene';

type PauseState = 'playing' | 'paused' | 'audioSettings' | 'aboutOverlay' | 'quitConfirm';

// Private pause flag
let paused = false;

// Getter function for pause state (also pauses during cutscenes)
export function getIsPaused(): boolean {
  return paused || isCutscenePlaying();
}

let state: PauseState = 'playing';
let overlay: GameObj | null = null;
let menuItems: GameObj[] = [];
let kRef: KAPLAYCtx | null = null;

let showAudioSettings: (() => void) | null = null;
let hideAudioSettings: (() => void) | null = null;

export function setupPauseMenu(
  k: KAPLAYCtx,
  audioSettingsShow: () => void,
  audioSettingsHide: () => void
): void {
  paused = false;
  state = 'playing';
  overlay = null;
  menuItems = [];
  kRef = k;
  showAudioSettings = audioSettingsShow;
  hideAudioSettings = audioSettingsHide;
  setupAboutOverlay(k);

  k.onKeyPress('escape', () => {
    if (state === 'playing') {
      pause();
    } else if (state === 'paused') {
      resume();
    } else if (state === 'audioSettings') {
      if (hideAudioSettings) hideAudioSettings();
      state = 'paused';
      showPauseUI();
    } else if (state === 'aboutOverlay') {
      hideAboutOverlay();
      state = 'paused';
      showPauseUI();
    } else if (state === 'quitConfirm') {
      state = 'paused';
      hidePauseUI();
      showPauseUI();
    }
  });

  k.onKeyPress('a', () => {
    if (state === 'paused') {
      hidePauseUI();
      state = 'audioSettings';
      if (showAudioSettings) showAudioSettings();
    }
  });

  k.onKeyPress('b', () => {
    if (state === 'paused') {
      hidePauseUI();
      state = 'aboutOverlay';
      showAboutOverlay(() => {
        // Callback when overlay closes itself (not used currently)
      });
    } else if (state === 'aboutOverlay') {
      // B also closes the about overlay
      hideAboutOverlay();
      state = 'paused';
      showPauseUI();
    }
  });

  k.onKeyPress('q', () => {
    if (state === 'paused') {
      hidePauseUI();
      state = 'quitConfirm';
      showQuitConfirmUI();
    } else if (state === 'quitConfirm') {
      resume();
      k.go('menu');
    }
  });

  k.onKeyPress('y', () => {
    if (state === 'quitConfirm') {
      resume();
      k.go('menu');
    }
  });

  k.onKeyPress('n', () => {
    if (state === 'quitConfirm') {
      state = 'paused';
      hidePauseUI();
      showPauseUI();
    }
  });
}

function pause(): void {
  if (!kRef) return;
  state = 'paused';
  paused = true;
  showPauseUI();
}

function resume(): void {
  if (!kRef) return;
  state = 'playing';
  paused = false;
  hidePauseUI();
}

function showPauseUI(): void {
  if (!kRef) return;
  const result = createPauseUI(kRef);
  overlay = result.overlay;
  menuItems = result.items;
  showPauseEffects();
}

function showQuitConfirmUI(): void {
  if (!kRef) return;
  const result = createQuitConfirmUI(kRef);
  overlay = result.overlay;
  menuItems = result.items;
}

function hidePauseUI(): void {
  if (overlay) {
    overlay.destroy();
    overlay = null;
  }
  menuItems.forEach((item) => item.destroy());
  menuItems = [];
  hidePauseEffects();
}

export function getPauseState(): PauseState {
  return state;
}

export function returnToPauseMenu(): void {
  if (!kRef) return;
  state = 'paused';
  showPauseUI();
}
