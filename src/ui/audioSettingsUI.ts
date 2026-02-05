// Audio settings UI elements - visual components
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getMusicVolume, getSFXVolume } from '../systems/audio';
import { getMusicUnlocks, getSelectedGameplayTrack, getSelectedBossTrack } from '../systems/persistence';

export type AudioSettingsUIRefs = {
  elements: GameObj[];
  musicValueText: GameObj;
  sfxValueText: GameObj;
  musicHighlight: GameObj;
  sfxHighlight: GameObj;
  gameplayTrackText: GameObj;
  bossTrackText: GameObj;
  gameplayHighlight: GameObj;
  bossHighlight: GameObj;
};

// Selectable tracks for both gameplay and boss
export const SELECTABLE_TRACKS = [
  { id: 'default', name: 'Default' },
  { id: 'gameplay', name: 'Mindful Focus' },
  { id: 'boss', name: "Mara's Challenge" },
  { id: 'boss2', name: 'Rising Tension' },
  { id: 'boss3', name: 'Deeper Struggle' },
  { id: 'boss4', name: 'Final Confrontation' },
];

export function getTrackDisplayName(trackId: string, isUnlocked: boolean): string {
  const track = SELECTABLE_TRACKS.find(t => t.id === trackId);
  const name = track ? track.name : trackId;
  // 'default' is always available
  if (trackId === 'default') return name;
  return isUnlocked ? name : `${name} 🔒`;
}

export function formatVolume(vol: number): string {
  const percent = Math.round(vol * 100);
  const bars = Math.round(vol * 10);
  const barStr = '\u2588'.repeat(bars) + '\u2591'.repeat(10 - bars);
  return `< ${barStr} ${percent}% >`;
}

export function createAudioSettingsUI(k: KAPLAYCtx): AudioSettingsUIRefs {
  const elements: GameObj[] = [];
  const cx = config.screen.width / 2;
  const unlocks = getMusicUnlocks();

  // Dark overlay
  elements.push(k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0), k.color(0, 0, 0), k.opacity(0.85),
    k.fixed(), k.z(200), 'audioSettingsUI',
  ]));

  // Title
  elements.push(k.add([
    k.text('AUDIO SETTINGS', { size: 32 }),
    k.pos(cx, 80), k.anchor('center'), k.color(255, 255, 255),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  // === VOLUME SECTION ===
  // Music Volume
  elements.push(k.add([
    k.text('Music Volume', { size: 18 }),
    k.pos(cx, 140), k.anchor('center'), k.color(200, 200, 200),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  const musicHighlight = k.add([
    k.text('>', { size: 22 }),
    k.pos(cx - 140, 170), k.anchor('center'), k.color(255, 215, 0),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]);
  elements.push(musicHighlight);

  const musicValueText = k.add([
    k.text(formatVolume(getMusicVolume()), { size: 20 }),
    k.pos(cx, 170), k.anchor('center'), k.color(255, 255, 255),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]);
  elements.push(musicValueText);

  // SFX Volume
  elements.push(k.add([
    k.text('SFX Volume', { size: 18 }),
    k.pos(cx, 220), k.anchor('center'), k.color(200, 200, 200),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  const sfxHighlight = k.add([
    k.text('>', { size: 22 }),
    k.pos(cx - 140, 250), k.anchor('center'), k.color(255, 215, 0),
    k.fixed(), k.z(201), k.opacity(0), 'audioSettingsUI',
  ]);
  elements.push(sfxHighlight);

  const sfxValueText = k.add([
    k.text(formatVolume(getSFXVolume()), { size: 20 }),
    k.pos(cx, 250), k.anchor('center'), k.color(255, 255, 255),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]);
  elements.push(sfxValueText);

  // === TRACK SELECTION SECTION ===
  // Divider
  elements.push(k.add([
    k.text('─────────────────────', { size: 14 }),
    k.pos(cx, 295), k.anchor('center'), k.color(80, 80, 100),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  // Gameplay Music
  elements.push(k.add([
    k.text('Gameplay Music', { size: 18 }),
    k.pos(cx, 330), k.anchor('center'), k.color(200, 200, 200),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  const gameplayHighlight = k.add([
    k.text('>', { size: 22 }),
    k.pos(cx - 140, 360), k.anchor('center'), k.color(255, 215, 0),
    k.fixed(), k.z(201), k.opacity(0), 'audioSettingsUI',
  ]);
  elements.push(gameplayHighlight);

  const gameplayId = getSelectedGameplayTrack();
  const gameplayTrackText = k.add([
    k.text(`< ${getTrackDisplayName(gameplayId, unlocks.includes(gameplayId))} >`, { size: 20 }),
    k.pos(cx, 360), k.anchor('center'), k.color(255, 255, 255),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]);
  elements.push(gameplayTrackText);

  // Boss Music
  elements.push(k.add([
    k.text('Boss Music', { size: 18 }),
    k.pos(cx, 410), k.anchor('center'), k.color(200, 200, 200),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  const bossHighlight = k.add([
    k.text('>', { size: 22 }),
    k.pos(cx - 140, 440), k.anchor('center'), k.color(255, 215, 0),
    k.fixed(), k.z(201), k.opacity(0), 'audioSettingsUI',
  ]);
  elements.push(bossHighlight);

  const bossId = getSelectedBossTrack();
  const bossTrackText = k.add([
    k.text(`< ${getTrackDisplayName(bossId, unlocks.includes(bossId))} >`, { size: 20 }),
    k.pos(cx, 440), k.anchor('center'), k.color(255, 255, 255),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]);
  elements.push(bossTrackText);

  // Controls hint
  elements.push(k.add([
    k.text('UP/DOWN select | LEFT/RIGHT adjust', { size: 14 }),
    k.pos(cx, 510), k.anchor('center'), k.color(120, 120, 140),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  // Back hint
  elements.push(k.add([
    k.text('(ESC) Back', { size: 18 }),
    k.pos(cx, 550), k.anchor('center'), k.color(200, 200, 200),
    k.fixed(), k.z(201), 'audioSettingsUI',
  ]));

  return {
    elements, musicValueText, sfxValueText, musicHighlight, sfxHighlight,
    gameplayTrackText, bossTrackText, gameplayHighlight, bossHighlight,
  };
}
