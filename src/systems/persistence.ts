// Unified persistence layer - localStorage wrapper for all saved data
const STORAGE_KEY = 'dharmaInvaders_save';

interface SaveData {
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
}

const DEFAULT_SAVE: SaveData = {
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
  cache = loaded;
  return loaded;
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
