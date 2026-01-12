// Audio settings UI elements - visual components
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getMusicVolume, getSFXVolume } from '../systems/audio';

export type AudioSettingsUIRefs = {
  elements: GameObj[];
  musicValueText: GameObj;
  sfxValueText: GameObj;
  musicHighlight: GameObj;
  sfxHighlight: GameObj;
};

export function formatVolume(vol: number): string {
  const percent = Math.round(vol * 100);
  const bars = Math.round(vol * 10);
  const barStr = '\u2588'.repeat(bars) + '\u2591'.repeat(10 - bars);
  return `< ${barStr} ${percent}% >`;
}

export function createAudioSettingsUI(k: KAPLAYCtx): AudioSettingsUIRefs {
  const elements: GameObj[] = [];

  // Dark overlay
  elements.push(k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.85),
    k.fixed(),
    k.z(200),
    'audioSettingsUI',
  ]));

  // Title
  elements.push(k.add([
    k.text('AUDIO SETTINGS', { size: 36 }),
    k.pos(config.screen.width / 2, 120),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // Music label
  elements.push(k.add([
    k.text('Music Volume', { size: 20 }),
    k.pos(config.screen.width / 2, 200),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // Music highlight (selection indicator)
  const musicHighlight = k.add([
    k.text('>', { size: 24 }),
    k.pos(config.screen.width / 2 - 120, 240),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]);
  elements.push(musicHighlight);

  // Music value with arrows
  const musicValueText = k.add([
    k.text(formatVolume(getMusicVolume()), { size: 24 }),
    k.pos(config.screen.width / 2, 240),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]);
  elements.push(musicValueText);

  // SFX label
  elements.push(k.add([
    k.text('SFX Volume', { size: 20 }),
    k.pos(config.screen.width / 2, 310),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // SFX highlight
  const sfxHighlight = k.add([
    k.text('>', { size: 24 }),
    k.pos(config.screen.width / 2 - 120, 350),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.fixed(),
    k.z(201),
    k.opacity(0),
    'audioSettingsUI',
  ]);
  elements.push(sfxHighlight);

  // SFX value
  const sfxValueText = k.add([
    k.text(formatVolume(getSFXVolume()), { size: 24 }),
    k.pos(config.screen.width / 2, 350),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]);
  elements.push(sfxValueText);

  // Controls hint
  elements.push(k.add([
    k.text('UP/DOWN to select | LEFT/RIGHT to adjust', { size: 14 }),
    k.pos(config.screen.width / 2, 430),
    k.anchor('center'),
    k.color(120, 120, 140),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  // Back hint
  elements.push(k.add([
    k.text('(ESC) Back', { size: 18 }),
    k.pos(config.screen.width / 2, 480),
    k.anchor('center'),
    k.color(200, 200, 200),
    k.fixed(),
    k.z(201),
    'audioSettingsUI',
  ]));

  return { elements, musicValueText, sfxValueText, musicHighlight, sfxHighlight };
}
