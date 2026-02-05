// Difficulty system - provides multipliers based on selected difficulty
import config from '../data/config.json';
import { getDifficulty, type Difficulty } from '../stores/gameStore';

type DifficultyConfig = {
  displayName: string;
  subtitle: string;
  spawnMultiplier: number;
  enemySpeedMultiplier: number;
  bossHealthMultiplier: number;
  dropRateMultiplier: number;
};

type DifficultyMultiplier =
  | 'spawnMultiplier'
  | 'enemySpeedMultiplier'
  | 'bossHealthMultiplier'
  | 'dropRateMultiplier';

const difficultyConfig = config.difficulty as Record<Difficulty, DifficultyConfig>;

export function getDifficultyMultiplier(stat: DifficultyMultiplier): number {
  const diff = getDifficulty();
  return difficultyConfig[diff][stat] ?? 1;
}

export function getDifficultyDisplayName(): string {
  const diff = getDifficulty();
  return difficultyConfig[diff].displayName;
}

export function getDifficultySubtitle(): string {
  const diff = getDifficulty();
  return difficultyConfig[diff].subtitle;
}
