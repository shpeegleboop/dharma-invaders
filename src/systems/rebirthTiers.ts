// Rebirth tier calculation based on karma
import config from '../data/config.json';

export interface RebirthTier {
  name: string;
  paramis: number;
  kleshas: number;
}

const thresholds = config.roguelike.karmaThresholds;

export function getRebirthTier(karmaThisLife: number): RebirthTier {
  if (karmaThisLife <= thresholds.wretched.max) {
    return { name: 'Wretched', ...thresholds.wretched };
  }
  if (karmaThisLife <= thresholds.poor.max) {
    return { name: 'Poor', ...thresholds.poor };
  }
  if (karmaThisLife <= thresholds.humble.max) {
    return { name: 'Humble', ...thresholds.humble };
  }
  if (karmaThisLife <= thresholds.balanced.max) {
    return { name: 'Balanced', ...thresholds.balanced };
  }
  if (karmaThisLife <= thresholds.virtuous.max) {
    return { name: 'Virtuous', ...thresholds.virtuous };
  }
  return { name: 'Enlightened', ...thresholds.enlightened };
}

// Get tier color for UI
export function getTierColor(tierName: string): { r: number; g: number; b: number } {
  const colors: Record<string, { r: number; g: number; b: number }> = {
    Wretched: { r: 139, g: 0, b: 0 },      // Dark red
    Poor: { r: 178, g: 34, b: 34 },        // Firebrick
    Humble: { r: 218, g: 165, b: 32 },     // Goldenrod
    Balanced: { r: 255, g: 255, b: 255 },  // White
    Virtuous: { r: 144, g: 238, b: 144 },  // Light green
    Enlightened: { r: 255, g: 215, b: 0 }, // Gold
  };
  return colors[tierName] || { r: 255, g: 255, b: 255 };
}
