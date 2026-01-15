// Zustand store for roguelike game state
import { create } from 'zustand';

export interface RebirthTier {
  name: string;
  paramis: number;
  kleshas: number;
}

interface GameState {
  // Karma tracking
  karmaTotal: number;
  karmaThisLife: number;

  // Death tracking
  deaths: number;
  deathsWithoutKill: number;

  // Roguelike state
  paramis: string[];
  kleshas: string[];

  // Actions
  addKarma: (amount: number) => void;
  recordDeath: () => void;
  recordKill: () => void;
  resetLife: () => void;
  resetAll: () => void;
  addParami: (parami: string) => void;
  addKlesha: (klesha: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  karmaTotal: 0,
  karmaThisLife: 0,
  deaths: 0,
  deathsWithoutKill: 0,
  paramis: [],
  kleshas: [],

  addKarma: (amount) => set((state) => ({
    karmaTotal: state.karmaTotal + amount,
    karmaThisLife: state.karmaThisLife + amount,
  })),

  recordDeath: () => set((state) => ({
    deaths: state.deaths + 1,
    deathsWithoutKill: state.deathsWithoutKill + 1,
  })),

  recordKill: () => set({
    deathsWithoutKill: 0,
  }),

  resetLife: () => set({
    karmaThisLife: 0,
    deathsWithoutKill: 0,
  }),

  resetAll: () => set({
    karmaTotal: 0,
    karmaThisLife: 0,
    deaths: 0,
    deathsWithoutKill: 0,
    paramis: [],
    kleshas: [],
  }),

  addParami: (parami) => set((state) => ({
    paramis: [...state.paramis, parami],
  })),

  addKlesha: (klesha) => set((state) => ({
    kleshas: [...state.kleshas, klesha],
  })),
}));

// Selector helpers for non-React usage
export const getGameState = () => useGameStore.getState();
export const getKarmaTotal = () => useGameStore.getState().karmaTotal;
export const getKarmaThisLife = () => useGameStore.getState().karmaThisLife;
export const getDeaths = () => useGameStore.getState().deaths;
