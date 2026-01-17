// Simple module-level state for roguelike game state (no React/Zustand needed)

interface GameState {
  karmaTotal: number;
  karmaThisLife: number;
  deaths: number;
  deathsWithZeroKarma: number; // Consecutive deaths with 0 karma this life
  cycle: number; // Current cycle (starts at 1, increments on Continue)
  paramis: string[];
  kleshas: string[];
  savedHealth: number | null; // Health to restore on next kalpa (null = use max)
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

export function addParami(parami: string): void {
  state.paramis = [...state.paramis, parami];
}

export function addKlesha(klesha: string): void {
  state.kleshas = [...state.kleshas, klesha];
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
