// Simple module-level state for roguelike game state (no React/Zustand needed)

interface GameState {
  karmaTotal: number;
  karmaThisLife: number;
  deaths: number;
  deathsWithoutKill: number;
  paramis: string[];
  kleshas: string[];
}

const defaultState: GameState = {
  karmaTotal: 0,
  karmaThisLife: 0,
  deaths: 0,
  deathsWithoutKill: 0,
  paramis: [],
  kleshas: [],
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

// Actions
export function addKarma(amount: number): void {
  state.karmaTotal += amount;
  state.karmaThisLife += amount;
}

export function recordDeath(): void {
  state.deaths += 1;
  state.deathsWithoutKill += 1;
}

export function recordKill(): void {
  state.deathsWithoutKill = 0;
}

export function resetLife(): void {
  state.karmaThisLife = 0;
  state.deathsWithoutKill = 0;
}

export function resetAll(): void {
  state = { ...defaultState };
}

export function addParami(parami: string): void {
  state.paramis = [...state.paramis, parami];
}

export function addKlesha(klesha: string): void {
  state.kleshas = [...state.kleshas, klesha];
}
