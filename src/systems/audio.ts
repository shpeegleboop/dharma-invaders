// Music system using Howler.js
import { Howl } from 'howler';
import config from '../data/config.json';
import { initSFX, playSFX as playSFXInternal, setSFXVolumeInternal } from './sfx';
import type { SFXSound } from './sfx';
import { addMusicUnlock } from './persistence';

export type MusicTrack = 'menu' | 'gameplay' | 'boss' | 'boss2' | 'boss3' | 'boss4' | 'nirvana' | 'gameover';

// localStorage keys
const MUSIC_VOLUME_KEY = 'dharma_musicVolume';
const SFX_VOLUME_KEY = 'dharma_sfxVolume';

// Music storage
const music: Record<MusicTrack, Howl | null> = {
  menu: null, gameplay: null, boss: null, boss2: null, boss3: null, boss4: null, nirvana: null, gameover: null,
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
  return new Howl({
    src: [src],
    loop: true,
    volume: musicVolume,
    onload: () => console.log(`Music loaded: ${name}`),
    onloaderror: (_id, err) => console.error(`Music load error (${name}):`, err),
    onplayerror: (_id, err) => console.error(`Music play error (${name}):`, err),
  });
}

// Initialize and preload all audio
export function initAudio(): void {
  console.log('initAudio starting...');
  loadVolumes();

  // Load music tracks (.wav files)
  music.menu = createMusicHowl('menu', '/audio/music/menu.wav');
  music.gameplay = createMusicHowl('gameplay', '/audio/music/gameplay.wav');
  music.boss = createMusicHowl('boss', '/audio/music/boss.wav');
  music.boss2 = createMusicHowl('boss2', '/audio/music/boss2.wav');
  music.boss3 = createMusicHowl('boss3', '/audio/music/boss3.wav');
  music.boss4 = createMusicHowl('boss4', '/audio/music/boss4.wav');
  music.nirvana = createMusicHowl('nirvana', '/audio/music/nirvana.wav');
  music.gameover = createMusicHowl('gameover', '/audio/music/gameover.wav');

  // Initialize SFX system
  initSFX(sfxVolume);

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
    // Unlock track when first played
    addMusicUnlock(track);
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

// Re-export playSFX for convenience
export function playSFX(sound: SFXSound): void {
  playSFXInternal(sound);
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
  setSFXVolumeInternal(sfxVolume);
  saveVolumes();
}

// Get current volumes
export function getMusicVolume(): number {
  return musicVolume;
}

export function getSFXVolume(): number {
  return sfxVolume;
}
