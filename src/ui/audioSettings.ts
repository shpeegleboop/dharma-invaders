// Audio settings UI - arrow key volume controls
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getMusicVolume, getSFXVolume, setMusicVolume, setSFXVolume, playSFX } from '../systems/audio';

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
    // Play SFX so user hears the change
    playSFX('enemy_death');
  }
  updateValueDisplays();
}

export function showAudioSettings(onClose: () => void): void {
  if (!kRef || isVisible) return;
  const k = kRef;
  isVisible = true;
  selectedSlider = 'music';
  onCloseCallback = onClose;

  // Dark overlay
  uiElements.push(k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.85),
    k.fixed(),
    k.z(200),
    'audioSettingsUI',
  ]));

  // Title
  uiElements.push(k.add([
    k.text('AUDIO SETTINGS', { size: 36 }),
    k.pos(config.screen.width / 2, 120),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // Music label
  uiElements.push(k.add([
    k.text('Music Volume', { size: 20 }),
    k.pos(config.screen.width / 2, 200),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // Music highlight (selection indicator)
  musicHighlight = k.add([
    k.text('>', { size: 24 }),
    k.pos(config.screen.width / 2 - 120, 240),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]);
  uiElements.push(musicHighlight);

  // Music value with arrows
  musicValueText = k.add([
    k.text(formatVolume(getMusicVolume()), { size: 24 }),
    k.pos(config.screen.width / 2, 240),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]);
  uiElements.push(musicValueText);

  // SFX label
  uiElements.push(k.add([
    k.text('SFX Volume', { size: 20 }),
    k.pos(config.screen.width / 2, 310),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // SFX highlight
  sfxHighlight = k.add([
    k.text('>', { size: 24 }),
    k.pos(config.screen.width / 2 - 120, 350),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.fixed(),
    k.z(201),
    k.opacity(0),
    'audioSettingsUI',
  ]);
  uiElements.push(sfxHighlight);

  // SFX value
  sfxValueText = k.add([
    k.text(formatVolume(getSFXVolume()), { size: 24 }),
    k.pos(config.screen.width / 2, 350),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]);
  uiElements.push(sfxValueText);

  // Controls hint
  uiElements.push(k.add([
    k.text('UP/DOWN to select | LEFT/RIGHT to adjust', { size: 14 }),
    k.pos(config.screen.width / 2, 430),
    k.anchor('center'),
    k.color(120, 120, 140),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // Back hint
  uiElements.push(k.add([
    k.text('(ESC) Back', { size: 18 }),
    k.pos(config.screen.width / 2, 480),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

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

function formatVolume(vol: number): string {
  const percent = Math.round(vol * 100);
  const bars = Math.round(vol * 10);
  const barStr = '\u2588'.repeat(bars) + '\u2591'.repeat(10 - bars);
  return `< ${barStr} ${percent}% >`;
}

export function isAudioSettingsVisible(): boolean {
  return isVisible;
}
