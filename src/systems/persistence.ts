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
