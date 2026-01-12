// Audio settings - state and input handling
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { getMusicVolume, getSFXVolume, setMusicVolume, setSFXVolume, playSFX } from '../systems/audio';
import { createAudioSettingsUI, formatVolume } from './audioSettingsUI';

type SelectedSlider = 'music' | 'sfx';

let isVisible = false;
let selectedSlider: SelectedSlider = 'music';
let uiElements: GameObj[] = [];
let musicValueText: GameObj | null = null;
let sfxValueText: GameObj | null = null;
let musicHighlight: GameObj | null = null;
let sfxHighlight: GameObj | null = null;
let kRef: KAPLAYCtx | null = null;
let onCloseCallback: (() => void) | null = null;

export function setupAudioSettings(k: KAPLAYCtx): void {
  // Reset all state on scene change
  isVisible = false;
  selectedSlider = 'music';
  uiElements = [];
  musicValueText = null;
  sfxValueText = null;
  musicHighlight = null;
  sfxHighlight = null;
  onCloseCallback = null;
  kRef = k;

  // Navigation controls
  k.onKeyPress('up', () => {
    if (!isVisible) return;
    selectedSlider = 'music';
    updateHighlight();
  });

  k.onKeyPress('w', () => {
    if (!isVisible) return;
    selectedSlider = 'music';
    updateHighlight();
  });

  k.onKeyPress('down', () => {
    if (!isVisible) return;
    selectedSlider = 'sfx';
    updateHighlight();
  });

  k.onKeyPress('s', () => {
    if (!isVisible) return;
    selectedSlider = 'sfx';
    updateHighlight();
  });

  // Volume adjustment
  k.onKeyPress('left', () => adjustVolume(-0.1));
  k.onKeyPress('right', () => adjustVolume(0.1));
}

function adjustVolume(delta: number): void {
  if (!isVisible) return;

  if (selectedSlider === 'music') {
    const newVol = Math.max(0, Math.min(1, getMusicVolume() + delta));
    setMusicVolume(newVol);
  } else {
    const newVol = Math.max(0, Math.min(1, getSFXVolume() + delta));
    setSFXVolume(newVol);
    playSFX('enemy_death');
  }
  updateValueDisplays();
}

export function showAudioSettings(onClose: () => void): void {
  if (!kRef || isVisible) return;

  isVisible = true;
  selectedSlider = 'music';
  onCloseCallback = onClose;

  const refs = createAudioSettingsUI(kRef);
  uiElements = refs.elements;
  musicValueText = refs.musicValueText;
  sfxValueText = refs.sfxValueText;
  musicHighlight = refs.musicHighlight;
  sfxHighlight = refs.sfxHighlight;

  updateHighlight();
}

export function hideAudioSettings(): void {
  isVisible = false;
  uiElements.forEach((el) => el.destroy());
  uiElements = [];
  musicValueText = null;
  sfxValueText = null;
  musicHighlight = null;
  sfxHighlight = null;
  if (onCloseCallback) onCloseCallback();
  onCloseCallback = null;
}

function updateHighlight(): void {
  if (musicHighlight) musicHighlight.opacity = selectedSlider === 'music' ? 1 : 0;
  if (sfxHighlight) sfxHighlight.opacity = selectedSlider === 'sfx' ? 1 : 0;
}

function updateValueDisplays(): void {
  if (musicValueText) musicValueText.text = formatVolume(getMusicVolume());
  if (sfxValueText) sfxValueText.text = formatVolume(getSFXVolume());
}

export function isAudioSettingsVisible(): boolean {
  return isVisible;
}
