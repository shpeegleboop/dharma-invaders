// Audio settings - state and input handling
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { getMusicVolume, getSFXVolume, setMusicVolume, setSFXVolume, playSFX, playMusic, type MusicTrack } from '../systems/audio';
import { createAudioSettingsUI, formatVolume, SELECTABLE_TRACKS, getTrackDisplayName } from './audioSettingsUI';
import { hideMenuLogo, showMenuLogo } from './htmlOverlays';
import {
  getMusicUnlocks,
  getSelectedGameplayTrack,
  setSelectedGameplayTrack,
  getSelectedBossTrack,
  setSelectedBossTrack,
} from '../systems/persistence';

type SelectedRow = 'music' | 'sfx' | 'gameplayTrack' | 'bossTrack';

let isVisible = false;
let selectedRow: SelectedRow = 'music';
let uiElements: GameObj[] = [];
let musicValueText: GameObj | null = null;
let sfxValueText: GameObj | null = null;
let musicHighlight: GameObj | null = null;
let sfxHighlight: GameObj | null = null;
let gameplayTrackText: GameObj | null = null;
let bossTrackText: GameObj | null = null;
let gameplayHighlight: GameObj | null = null;
let bossHighlight: GameObj | null = null;
let kRef: KAPLAYCtx | null = null;
let onCloseCallback: (() => void) | null = null;
let isOnMenuScene = false; // Track if we're on menu to control logo overlay

const ROW_ORDER: SelectedRow[] = ['music', 'sfx', 'gameplayTrack', 'bossTrack'];

export function setupAudioSettings(k: KAPLAYCtx, onMenu = false): void {
  // Reset all state on scene change
  isVisible = false;
  selectedRow = 'music';
  uiElements = [];
  musicValueText = null;
  sfxValueText = null;
  musicHighlight = null;
  sfxHighlight = null;
  gameplayTrackText = null;
  bossTrackText = null;
  gameplayHighlight = null;
  bossHighlight = null;
  onCloseCallback = null;
  kRef = k;
  isOnMenuScene = onMenu;

  // Navigation controls
  k.onKeyPress('up', () => navigateRow(-1));
  k.onKeyPress('w', () => navigateRow(-1));
  k.onKeyPress('down', () => navigateRow(1));
  k.onKeyPress('s', () => navigateRow(1));

  // Value adjustment (volume or track selection)
  k.onKeyPress('left', () => adjustValue(-1));
  k.onKeyPress('right', () => adjustValue(1));
}

function navigateRow(delta: number): void {
  if (!isVisible) return;
  const idx = ROW_ORDER.indexOf(selectedRow);
  const newIdx = Math.max(0, Math.min(ROW_ORDER.length - 1, idx + delta));
  selectedRow = ROW_ORDER[newIdx];
  updateHighlight();
}

function adjustValue(delta: number): void {
  if (!isVisible) return;

  if (selectedRow === 'music') {
    const newVol = Math.max(0, Math.min(1, getMusicVolume() + delta * 0.1));
    setMusicVolume(newVol);
    updateValueDisplays();
  } else if (selectedRow === 'sfx') {
    const newVol = Math.max(0, Math.min(1, getSFXVolume() + delta * 0.1));
    setSFXVolume(newVol);
    playSFX('enemy_death');
    updateValueDisplays();
  } else if (selectedRow === 'gameplayTrack') {
    cycleTrack('gameplay', delta);
  } else if (selectedRow === 'bossTrack') {
    cycleTrack('boss', delta);
  }
}

function cycleTrack(category: 'gameplay' | 'boss', delta: number): void {
  const unlocks = getMusicUnlocks();
  // 'default' is always available, plus any unlocked tracks
  const availableTracks = SELECTABLE_TRACKS.filter(t => t.id === 'default' || unlocks.includes(t.id));
  if (availableTracks.length === 0) return;

  const currentId = category === 'gameplay' ? getSelectedGameplayTrack() : getSelectedBossTrack();
  const currentIdx = availableTracks.findIndex(t => t.id === currentId);
  const safeIdx = currentIdx === -1 ? 0 : currentIdx;
  const newIdx = (safeIdx + delta + availableTracks.length) % availableTracks.length;
  const newTrack = availableTracks[newIdx].id;

  if (category === 'gameplay') {
    setSelectedGameplayTrack(newTrack);
  } else {
    setSelectedBossTrack(newTrack);
  }
  updateTrackDisplays();

  // Play the selected track immediately as preview
  const trackToPlay = newTrack === 'default'
    ? (category === 'gameplay' ? 'gameplay' : 'boss')
    : newTrack;
  playMusic(trackToPlay as MusicTrack);
}

export function showAudioSettings(onClose: () => void): void {
  if (!kRef || isVisible) return;

  isVisible = true;
  selectedRow = 'music';
  onCloseCallback = onClose;

  // Hide logo overlay so it doesn't block the menu (only on menu scene)
  if (isOnMenuScene) hideMenuLogo();

  const refs = createAudioSettingsUI(kRef);
  uiElements = refs.elements;
  musicValueText = refs.musicValueText;
  sfxValueText = refs.sfxValueText;
  musicHighlight = refs.musicHighlight;
  sfxHighlight = refs.sfxHighlight;
  gameplayTrackText = refs.gameplayTrackText;
  bossTrackText = refs.bossTrackText;
  gameplayHighlight = refs.gameplayHighlight;
  bossHighlight = refs.bossHighlight;

  updateHighlight();
  updateTrackDisplays();
}

export function hideAudioSettings(): void {
  isVisible = false;
  uiElements.forEach((el) => el.destroy());
  uiElements = [];
  musicValueText = null;
  sfxValueText = null;
  musicHighlight = null;
  sfxHighlight = null;
  gameplayTrackText = null;
  bossTrackText = null;
  gameplayHighlight = null;
  bossHighlight = null;

  // Restore logo overlay (only on menu scene)
  if (isOnMenuScene) showMenuLogo();

  if (onCloseCallback) onCloseCallback();
  onCloseCallback = null;
}

function updateHighlight(): void {
  if (musicHighlight) musicHighlight.opacity = selectedRow === 'music' ? 1 : 0;
  if (sfxHighlight) sfxHighlight.opacity = selectedRow === 'sfx' ? 1 : 0;
  if (gameplayHighlight) gameplayHighlight.opacity = selectedRow === 'gameplayTrack' ? 1 : 0;
  if (bossHighlight) bossHighlight.opacity = selectedRow === 'bossTrack' ? 1 : 0;
}

function updateTrackDisplays(): void {
  const unlocks = getMusicUnlocks();
  if (gameplayTrackText) {
    const trackId = getSelectedGameplayTrack();
    const isUnlocked = unlocks.includes(trackId);
    gameplayTrackText.text = `< ${getTrackDisplayName(trackId, isUnlocked)} >`;
  }
  if (bossTrackText) {
    const trackId = getSelectedBossTrack();
    const isUnlocked = unlocks.includes(trackId);
    bossTrackText.text = `< ${getTrackDisplayName(trackId, isUnlocked)} >`;
  }
}

function updateValueDisplays(): void {
  if (musicValueText) musicValueText.text = formatVolume(getMusicVolume());
  if (sfxValueText) sfxValueText.text = formatVolume(getSFXVolume());
}

export function isAudioSettingsVisible(): boolean {
  return isVisible;
}
