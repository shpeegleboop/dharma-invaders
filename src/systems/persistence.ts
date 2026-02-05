// Unified persistence layer - localStorage wrapper for all saved data
const STORAGE_KEY = 'dharmaInvaders_save';

interface SaveData {
  version?: number; // Migration version
  difficulty: string;
  cutsceneFlags: {
    hasSeenIntro: boolean;
    hasSeenFirstDeath: boolean;
    hasSeenBossIntro: boolean;
    hasSeenVictory: boolean;
    hasSeenBodhisattva: boolean;
    hasSeenKalpa2: boolean;
    hasSeenKalpa3: boolean;
    hasSeenKalpa4: boolean;
  };
  showAllCutscenes: boolean;
  musicUnlocks: string[];
  selectedGameplayTrack: string;
  selectedBossTrack: string;
}

const CURRENT_VERSION = 1; // Bump when adding migrations

const DEFAULT_SAVE: SaveData = {
  version: CURRENT_VERSION,
  difficulty: 'sakadagami',
  cutsceneFlags: {
    hasSeenIntro: false,
    hasSeenFirstDeath: false,
    hasSeenBossIntro: false,
    hasSeenVictory: false,
    hasSeenBodhisattva: false,
    hasSeenKalpa2: false,
    hasSeenKalpa3: false,
    hasSeenKalpa4: false,
  },
  showAllCutscenes: false,
  musicUnlocks: [],
  selectedGameplayTrack: 'default',
  selectedBossTrack: 'default',
};

let cache: SaveData | null = null;

export function loadSave(): SaveData {
  if (cache) return cache;
  let loaded: SaveData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    loaded = raw ? { ...DEFAULT_SAVE, ...JSON.parse(raw) } : { ...DEFAULT_SAVE };
  } catch {
    loaded = { ...DEFAULT_SAVE };
  }
  // Run migrations if needed
  loaded = runMigrations(loaded);
  cache = loaded;
  return loaded;
}

function runMigrations(data: SaveData): SaveData {
  const oldVersion = data.version || 0;

  // Migration to v1: Reset track selection to 'default'
  // Old saves had 'boss'/'gameplay' as defaults, we want 'default' now
  if (oldVersion < 1) {
    data.selectedGameplayTrack = 'default';
    data.selectedBossTrack = 'default';
    data.version = 1;
    // Persist the migration
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
}

function saveToDisk(): void {
  if (cache) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
}

export function getSaveData(): SaveData {
  return loadSave();
}

export function updateSave(partial: Partial<SaveData>): void {
  cache = { ...loadSave(), ...partial };
  saveToDisk();
}

// Difficulty helpers
export function getPersistedDifficulty(): string {
  return loadSave().difficulty;
}

export function setPersistedDifficulty(d: string): void {
  updateSave({ difficulty: d });
}

// Cutscene flag helpers
export function getCutsceneFlag(flag: keyof SaveData['cutsceneFlags']): boolean {
  return loadSave().cutsceneFlags[flag];
}

export function setCutsceneFlag(flag: keyof SaveData['cutsceneFlags'], value: boolean): void {
  const flags = { ...loadSave().cutsceneFlags, [flag]: value };
  updateSave({ cutsceneFlags: flags });
}

export function resetAllCutsceneFlags(): void {
  updateSave({ cutsceneFlags: { ...DEFAULT_SAVE.cutsceneFlags } });
}

export function hasSeenAllCutscenes(): boolean {
  const flags = loadSave().cutsceneFlags;
  const allSeen = Object.values(flags).every(v => v === true);
  // Debug: log which flags are missing
  if (!allSeen) {
    const missing = Object.entries(flags).filter(([, v]) => !v).map(([k]) => k);
    console.log('[Cutscenes] Missing flags:', missing.join(', '));
  }
  return allSeen;
}

export function getShowAllCutscenes(): boolean {
  return loadSave().showAllCutscenes;
}

export function setShowAllCutscenes(value: boolean): void {
  updateSave({ showAllCutscenes: value });
}

// Music unlock helpers
export function getMusicUnlocks(): string[] {
  return loadSave().musicUnlocks;
}

export function addMusicUnlock(track: string): void {
  const unlocks = loadSave().musicUnlocks;
  if (!unlocks.includes(track)) {
    updateSave({ musicUnlocks: [...unlocks, track] });
  }
}

// Track selection helpers
export function getSelectedGameplayTrack(): string {
  return loadSave().selectedGameplayTrack || 'default';
}

export function setSelectedGameplayTrack(track: string): void {
  updateSave({ selectedGameplayTrack: track });
}

export function getSelectedBossTrack(): string {
  return loadSave().selectedBossTrack || 'default';
}

export function setSelectedBossTrack(track: string): void {
  updateSave({ selectedBossTrack: track });
}
