// Audio system using Howler.js
import { Howl } from 'howler';
import config from '../data/config.json';

type MusicTrack = 'menu' | 'gameplay' | 'boss' | 'nirvana' | 'gameover';
type SFXSound =
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

// localStorage keys
const MUSIC_VOLUME_KEY = 'dharma_musicVolume';
const SFX_VOLUME_KEY = 'dharma_sfxVolume';

// Music and SFX storage
const music: Record<MusicTrack, Howl | null> = {
  menu: null, gameplay: null, boss: null, nirvana: null, gameover: null,
};

const sfx: Record<SFXSound, Howl | null> = {
  shoot: null, enemy_hit: null, enemy_death: null, player_hit: null,
  player_death: null, powerup_compassion: null, powerup_wisdom: null,
  powerup_patience: null, powerup_diligence: null, powerup_meditation: null,
  shield_break: null, boss_enter: null, boss_phase: null, boss_death: null,
  wave_complete: null,
};

let currentMusic: Howl | null = null;
let currentMusicTrack: MusicTrack | null = null;
let musicVolume = config.audio.musicVolume;
let sfxVolume = config.audio.sfxVolume;

// Load volumes from localStorage (with NaN validation)
function loadVolumes(): void {
  const savedMusic = localStorage.getItem(MUSIC_VOLUME_KEY);
  const savedSFX = localStorage.getItem(SFX_VOLUME_KEY);
  if (savedMusic !== null) {
    const parsed = parseFloat(savedMusic);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      musicVolume = parsed;
    }
  }
  if (savedSFX !== null) {
    const parsed = parseFloat(savedSFX);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      sfxVolume = parsed;
    }
  }
  console.log('Audio volumes loaded:', { musicVolume, sfxVolume });
}

// Save volumes to localStorage
function saveVolumes(): void {
  localStorage.setItem(MUSIC_VOLUME_KEY, musicVolume.toString());
  localStorage.setItem(SFX_VOLUME_KEY, sfxVolume.toString());
}

// Helper to create music Howl with error logging
function createMusicHowl(name: string, src: string): Howl {
  const howl = new Howl({
    src: [src],
    loop: true,
    volume: musicVolume,
    onload: () => console.log(`Music loaded: ${name}`),
    onloaderror: (_id, err) => console.error(`Music load error (${name}):`, err),
    onplayerror: (_id, err) => console.error(`Music play error (${name}):`, err),
  });
  return howl;
}

// Initialize and preload all audio
export function initAudio(): void {
  console.log('initAudio starting...');
  loadVolumes();

  // Load music tracks (.wav files)
  music.menu = createMusicHowl('menu', '/audio/music/menu.wav');
  music.gameplay = createMusicHowl('gameplay', '/audio/music/gameplay.wav');
  music.boss = createMusicHowl('boss', '/audio/music/boss.wav');
  music.nirvana = createMusicHowl('nirvana', '/audio/music/nirvana.wav');
  music.gameover = createMusicHowl('gameover', '/audio/music/gameover.wav');

  // Load SFX (.mp3 files)
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

  console.log('initAudio complete - all audio objects created');
}

// Play a music track (stops previous)
export function playMusic(track: MusicTrack): void {
  console.log('playMusic called:', track, '| current:', currentMusicTrack, '| volume:', musicVolume);

  if (currentMusicTrack === track && currentMusic?.playing()) {
    console.log('Same track already playing, skipping');
    return;
  }

  if (currentMusic) {
    console.log('Stopping previous track:', currentMusicTrack);
    currentMusic.stop();
  }

  const newMusic = music[track];
  if (newMusic) {
    newMusic.volume(musicVolume);
    newMusic.play();
    currentMusic = newMusic;
    currentMusicTrack = track;
    console.log('Started playing:', track);
  } else {
    console.error('Music track not loaded:', track);
  }
}

// Stop current music
export function stopMusic(): void {
  if (currentMusic) {
    currentMusic.stop();
    currentMusic = null;
    currentMusicTrack = null;
  }
}

// Play a one-shot sound effect
export function playSFX(sound: SFXSound): void {
  const effect = sfx[sound];
  if (effect) effect.play();
}

// Set music volume (0.0 to 1.0) and save
export function setMusicVolume(vol: number): void {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (currentMusic) currentMusic.volume(musicVolume);
  Object.values(music).forEach((track) => {
    if (track) track.volume(musicVolume);
  });
  saveVolumes();
}

// Set SFX volume (0.0 to 1.0) and save
export function setSFXVolume(vol: number): void {
  sfxVolume = Math.max(0, Math.min(1, vol));
  Object.entries(sfx).forEach(([key, sound]) => {
    if (sound) {
      const multiplier = key === 'shoot' ? 0.3 : 1;
      sound.volume(sfxVolume * multiplier);
    }
  });
  saveVolumes();
}

// Get current volumes
export function getMusicVolume(): number {
  return musicVolume;
}

export function getSFXVolume(): number {
  return sfxVolume;
}
