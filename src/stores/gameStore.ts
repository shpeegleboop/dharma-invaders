// Simple module-level state for roguelike game state (no React/Zustand needed)
import {
  loadSave,
  getPersistedDifficulty,
  setPersistedDifficulty,
} from '../systems/persistence';

// Per-effect stack caps
const PARAMI_CAPS: Record<string, number> = {
  Dana: 1,
  Viriya: 5,
  Metta: 7,
  Upekkha: 5,
  Sila: 1,
  Khanti: 5,
  Panna: 2,
  Adhitthana: 1,
  Nekkhamma: 2,
  Sacca: 1,
};

const KLESHA_CAPS: Record<string, number> = {
  Lobha: 2,
  Dosa: 3,
  Mana: 5,
  Vicikiccha: 3,
  Moha: 2,
  Thina: 2,
  Anottappa: 1,
  Micchaditthi: 2,
  Ahirika: 1,
};

interface GameState {
  karmaTotal: number;
  karmaThisLife: number;
  deaths: number;
  deathsWithZeroKarma: number; // Consecutive deaths with 0 karma this life
  cycle: number; // Current cycle (starts at 1, increments on Continue)
  paramis: string[];
  kleshas: string[];
  savedHealth: number | null; // Health to restore on next kalpa (null = use max)
  savedShieldCharges: number | null; // Shield charges to restore on next kalpa
  bossDeathCount: number; // Deaths during current boss fight
  inBossFight: boolean; // Whether currently in boss fight
}

const defaultState: GameState = {
  karmaTotal: 0,
  karmaThisLife: 0,
  deaths: 0,
  deathsWithZeroKarma: 0,
  cycle: 1,
  paramis: [],
  kleshas: [],
  savedHealth: null,
  savedShieldCharges: null,
  bossDeathCount: 0,
  inBossFight: false,
};

let state: GameState = { ...defaultState };

// Getters
export function getGameState(): GameState {
  return state;
}

export function getKarmaTotal(): number {
  return state.karmaTotal;
}

export function getKarmaThisLife(): number {
  return state.karmaThisLife;
}

export function getDeaths(): number {
  return state.deaths;
}

export function getCycle(): number {
  return state.cycle;
}

// Actions
export function addKarma(amount: number): void {
  state.karmaTotal += amount;
  state.karmaThisLife += amount;
}

// Called on player death - returns true if mercy rule triggered
export function recordDeath(): boolean {
  state.deaths += 1;

  if (state.karmaThisLife === 0) {
    // Died with no karma earned this life - wasted life
    state.deathsWithZeroKarma += 1;
  } else {
    // Died with karma earned - reset counter
    state.deathsWithZeroKarma = 0;
  }

  return state.deathsWithZeroKarma >= 3;
}

export function resetLife(): void {
  state.karmaThisLife = 0;
  // Don't reset deathsWithZeroKarma - that persists across lives
}

export function resetAll(): void {
  state = { ...defaultState };
}

export function addParami(parami: string): boolean {
  const currentCount = state.paramis.filter((p) => p === parami).length;
  const cap = PARAMI_CAPS[parami] ?? 99;
  if (currentCount >= cap) return false; // At cap
  state.paramis = [...state.paramis, parami];
  return true;
}

export function addKlesha(klesha: string): boolean {
  const currentCount = state.kleshas.filter((k) => k === klesha).length;
  const cap = KLESHA_CAPS[klesha] ?? 99;
  if (currentCount >= cap) return false; // At cap
  state.kleshas = [...state.kleshas, klesha];
  return true;
}

// Check if a parami is at its cap
export function isParamiCapped(parami: string): boolean {
  const currentCount = state.paramis.filter((p) => p === parami).length;
  const cap = PARAMI_CAPS[parami] ?? 99;
  return currentCount >= cap;
}

// Check if a klesha is at its cap
export function isKleshaCapped(klesha: string): boolean {
  const currentCount = state.kleshas.filter((k) => k === klesha).length;
  const cap = KLESHA_CAPS[klesha] ?? 99;
  return currentCount >= cap;
}

// Called when player chooses "Continue" after defeating Mara
export function incrementCycle(): void {
  state.cycle += 1;
  state.karmaThisLife = 0; // Reset karma for new cycle
  state.deathsWithZeroKarma = 0; // Reset mercy rule
}

// Save player health when beating boss (for next kalpa)
export function saveHealth(health: number): void {
  state.savedHealth = health;
}

// Get and consume saved health (returns null if none saved)
export function consumeSavedHealth(): number | null {
  const health = state.savedHealth;
  state.savedHealth = null;
  return health;
}

// Save shield charges when beating boss (for next kalpa)
export function saveShieldCharges(charges: number): void {
  state.savedShieldCharges = charges > 0 ? charges : null;
}

// Get and consume saved shield charges (returns null if none saved)
export function consumeSavedShieldCharges(): number | null {
  const charges = state.savedShieldCharges;
  state.savedShieldCharges = null;
  return charges;
}

// Remove one stack of a specific parami type (returns true if removed)
export function removeParami(parami: string): boolean {
  const index = state.paramis.indexOf(parami);
  if (index === -1) return false;
  state.paramis = [...state.paramis.slice(0, index), ...state.paramis.slice(index + 1)];
  return true;
}

// Remove one stack of a random parami (returns the type removed, or null if none)
export function removeRandomParami(): string | null {
  if (state.paramis.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * state.paramis.length);
  const removed = state.paramis[randomIndex];
  state.paramis = [...state.paramis.slice(0, randomIndex), ...state.paramis.slice(randomIndex + 1)];
  return removed;
}

// Set karmaThisLife to a specific value (for Manussa kill penalty)
export function setKarmaThisLife(amount: number): void {
  state.karmaThisLife = amount;
}

// Get a random klesha type to add (for Nerayika effect)
export function getRandomKlesha(): string {
  const kleshaTypes = Object.keys(KLESHA_CAPS);
  return kleshaTypes[Math.floor(Math.random() * kleshaTypes.length)];
}

// Get a random parami type (for display/debug purposes)
export function getRandomParami(): string {
  const paramiTypes = Object.keys(PARAMI_CAPS);
  return paramiTypes[Math.floor(Math.random() * paramiTypes.length)];
}

// Get all parami types
export function getParamiTypes(): string[] {
  return Object.keys(PARAMI_CAPS);
}

// Get all klesha types
export function getKleshaTypes(): string[] {
  return Object.keys(KLESHA_CAPS);
}

// Check if player has a specific klesha
export function hasKlesha(klesha: string): boolean {
  return state.kleshas.includes(klesha);
}

// Boss fight death tracking
export function startBossFight(): void {
  state.inBossFight = true;
  state.bossDeathCount = 0;
}

export function endBossFight(): void {
  state.inBossFight = false;
  state.bossDeathCount = 0;
}

export function isInBossFight(): boolean {
  return state.inBossFight;
}

export function recordBossDeath(): void {
  if (state.inBossFight) {
    state.bossDeathCount += 1;
  }
}

export function getBossDeathCount(): number {
  return state.bossDeathCount;
}

// Difficulty system - delegates to persistence module
export type Difficulty = 'sotapanna' | 'sakadagami' | 'anagami' | 'noah';
const DIFFICULTIES: Difficulty[] = ['sotapanna', 'sakadagami', 'anagami', 'noah'];

export function getDifficulty(): Difficulty {
  return getPersistedDifficulty() as Difficulty;
}

export function setDifficulty(d: Difficulty): void {
  setPersistedDifficulty(d);
}

export function getDifficulties(): Difficulty[] {
  return DIFFICULTIES;
}

// Initialize persistence on module load
loadSave();
