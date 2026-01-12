// SFX system - sound effects using Howler.js
import { Howl } from 'howler';

export type SFXSound =
  | 'shoot'
  | 'enemy_hit'
  | 'enemy_death'
  | 'player_hit'
  | 'player_death'
  | 'powerup_compassion'
  | 'powerup_wisdom'
  | 'powerup_patience'
  | 'powerup_diligence'
  | 'powerup_meditation'
  | 'shield_break'
  | 'boss_enter'
  | 'boss_phase'
  | 'boss_death'
  | 'wave_complete';

const sfx: Record<SFXSound, Howl | null> = {
  shoot: null, enemy_hit: null, enemy_death: null, player_hit: null,
  player_death: null, powerup_compassion: null, powerup_wisdom: null,
  powerup_patience: null, powerup_diligence: null, powerup_meditation: null,
  shield_break: null, boss_enter: null, boss_phase: null, boss_death: null,
  wave_complete: null,
};

let sfxVolume = 0.7;

export function initSFX(volume: number): void {
  sfxVolume = volume;

  sfx.shoot = new Howl({ src: ['/audio/sfx/shoot.mp3'], volume: sfxVolume * 0.3 });
  sfx.enemy_hit = new Howl({ src: ['/audio/sfx/enemy_hit.mp3'], volume: sfxVolume });
  sfx.enemy_death = new Howl({ src: ['/audio/sfx/enemy_death.mp3'], volume: sfxVolume });
  sfx.player_hit = new Howl({ src: ['/audio/sfx/player_hit.mp3'], volume: sfxVolume });
  sfx.player_death = new Howl({ src: ['/audio/sfx/player_death.mp3'], volume: sfxVolume });
  sfx.powerup_compassion = new Howl({ src: ['/audio/sfx/powerup_compassion.mp3'], volume: sfxVolume });
  sfx.powerup_wisdom = new Howl({ src: ['/audio/sfx/powerup_wisdom.mp3'], volume: sfxVolume });
  sfx.powerup_patience = new Howl({ src: ['/audio/sfx/powerup_patience.mp3'], volume: sfxVolume });
  sfx.powerup_diligence = new Howl({ src: ['/audio/sfx/powerup_diligence.mp3'], volume: sfxVolume });
  sfx.powerup_meditation = new Howl({ src: ['/audio/sfx/powerup_meditation.mp3'], volume: sfxVolume });
  sfx.shield_break = new Howl({ src: ['/audio/sfx/shield_break.mp3'], volume: sfxVolume });
  sfx.boss_enter = new Howl({ src: ['/audio/sfx/boss_enter.mp3'], volume: sfxVolume });
  sfx.boss_phase = new Howl({ src: ['/audio/sfx/boss_phase.mp3'], volume: sfxVolume });
  sfx.boss_death = new Howl({ src: ['/audio/sfx/boss_death.mp3'], volume: sfxVolume });
  sfx.wave_complete = new Howl({ src: ['/audio/sfx/wave_complete.mp3'], volume: sfxVolume });
}

export function playSFX(sound: SFXSound): void {
  const effect = sfx[sound];
  if (effect) effect.play();
}

export function setSFXVolumeInternal(vol: number): void {
  sfxVolume = vol;
  Object.entries(sfx).forEach(([key, sound]) => {
    if (sound) {
      const multiplier = key === 'shoot' ? 0.3 : 1;
      sound.volume(sfxVolume * multiplier);
    }
  });
}

export function getSFXVolumeInternal(): number {
  return sfxVolume;
}
