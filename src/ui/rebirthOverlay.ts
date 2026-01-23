// Rebirth overlay - shown on player death
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getRebirthTier, getTierColor } from '../systems/rebirthTiers';
import { addParami, addKlesha, isParamiCapped, isKleshaCapped } from '../stores/gameStore';
import { tryPlayCutscene } from '../systems/cutscene';

// Available paramis and kleshas for random selection
const PARAMI_POOL = [
  'Dana', 'Viriya', 'Metta', 'Upekkha',
  'Sila', 'Khanti', 'Panna', 'Adhitthana', 'Nekkhamma', 'Sacca',
];
const KLESHA_POOL = [
  'Lobha', 'Dosa', 'Mana', 'Vicikiccha',
  'Moha', 'Thina', 'Anottappa', 'Micchaditthi', 'Ahirika',
];

// Brief descriptions with effects
const PARAMI_DESC: Record<string, string> = {
  Dana: 'Generosity (+25% drops)',
  Viriya: 'Energy (+10% fire rate)',
  Metta: 'Loving-kindness (+1 HP)',
  Upekkha: 'Equanimity (-10% enemy speed)',
  Sila: 'Morality (auto-shield)',
  Khanti: 'Patience (+20% powerup duration)',
  Panna: 'Wisdom (+1 damage)',
  Adhitthana: 'Determination (+1 shield)',
  Nekkhamma: 'Renunciation (+50% karma)',
  Sacca: 'Truthfulness (+5% Paduma)',
};
const KLESHA_DESC: Record<string, string> = {
  Lobha: 'Greed (-25% drops)',
  Dosa: 'Hatred (+10% enemy speed)',
  Mana: 'Pride (-1 HP)',
  Vicikiccha: 'Doubt (-10% fire rate)',
  Moha: 'Delusion (-20% powerup duration)',
  Thina: 'Sloth (-10% player speed)',
  Anottappa: 'Recklessness (-1 damage)',
  Micchaditthi: 'Wrong View (-25% karma)',
  Ahirika: 'Shamelessness (flips Manussā)',
};

let overlayObjects: GameObj[] = [];
let isOverlayActive = false;

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function showRebirthOverlay(
  k: KAPLAYCtx,
  karmaThisLife: number,
  onContinue: () => void
): Promise<void> {
  if (isOverlayActive) return;
  isOverlayActive = true;

  // Play first death cutscene (only plays once ever)
  await tryPlayCutscene(k, 'firstDeath');

  const tier = getRebirthTier(karmaThisLife);
  const tierColor = getTierColor(tier.name);

  // Select random paramis and kleshas (excluding those at max stacks)
  const availableParamis = PARAMI_POOL.filter(p => !isParamiCapped(p));
  const availableKleshas = KLESHA_POOL.filter(k => !isKleshaCapped(k));
  const grantedParamis = pickRandom(availableParamis, Math.min(tier.paramis, availableParamis.length));
  const grantedKleshas = pickRandom(availableKleshas, Math.min(tier.kleshas, availableKleshas.length));

  // Add to store
  grantedParamis.forEach((p) => addParami(p));
  grantedKleshas.forEach((kl) => addKlesha(kl));

  // Dim overlay
  const dimmer = k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.85),
    k.fixed(),
    k.z(100),
  ]);
  overlayObjects.push(dimmer);

  // "The wheel turns..."
  const title = k.add([
    k.text('The wheel turns...', { size: 32 }),
    k.pos(config.screen.width / 2, 120),
    k.anchor('center'),
    k.color(200, 200, 220),
    k.fixed(),
    k.z(101),
  ]);
  overlayObjects.push(title);

  // Karma earned
  const karmaLabel = k.add([
    k.text(`Karma this life: ${karmaThisLife}`, { size: 20 }),
    k.pos(config.screen.width / 2, 180),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.fixed(),
    k.z(101),
  ]);
  overlayObjects.push(karmaLabel);

  // Rebirth tier
  const tierLabel = k.add([
    k.text(`Rebirth: ${tier.name}`, { size: 28 }),
    k.pos(config.screen.width / 2, 230),
    k.anchor('center'),
    k.color(tierColor.r, tierColor.g, tierColor.b),
    k.fixed(),
    k.z(101),
  ]);
  overlayObjects.push(tierLabel);

  // Paramis granted (one per line)
  let nextY = 280;
  const lineHeight = 24;

  for (const p of grantedParamis) {
    const paramiText = k.add([
      k.text(`+ ${p} (${PARAMI_DESC[p]})`, { size: 16 }),
      k.pos(config.screen.width / 2, nextY),
      k.anchor('center'),
      k.color(144, 238, 144), // Light green
      k.fixed(),
      k.z(101),
    ]);
    overlayObjects.push(paramiText);
    nextY += lineHeight;
  }

  // Kleshas inflicted (one per line)
  if (grantedParamis.length > 0 && grantedKleshas.length > 0) {
    nextY += 8; // Extra gap between sections
  }

  for (const kl of grantedKleshas) {
    const kleshaText = k.add([
      k.text(`- ${kl} (${KLESHA_DESC[kl]})`, { size: 16 }),
      k.pos(config.screen.width / 2, nextY),
      k.anchor('center'),
      k.color(255, 100, 100), // Light red
      k.fixed(),
      k.z(101),
    ]);
    overlayObjects.push(kleshaText);
    nextY += lineHeight;
  }

  // Continue prompt
  const continuePrompt = k.add([
    k.text('Press SPACE to continue', { size: 18 }),
    k.pos(config.screen.width / 2, 450),
    k.anchor('center'),
    k.color(180, 180, 180),
    k.opacity(1),
    k.fixed(),
    k.z(101),
  ]);
  overlayObjects.push(continuePrompt);

  // Pulse the continue prompt
  continuePrompt.onUpdate(() => {
    continuePrompt.opacity = 0.5 + Math.sin(k.time() * 3) * 0.5;
  });

  // Handle continue
  const handler = k.onKeyPress('space', () => {
    hideRebirthOverlay();
    handler.cancel();
    onContinue();
  });
}

export function hideRebirthOverlay(): void {
  overlayObjects.forEach((obj) => obj.destroy());
  overlayObjects = [];
  isOverlayActive = false;
}

export function isRebirthOverlayActive(): boolean {
  return isOverlayActive;
}

// Reset state on scene change
export function resetRebirthOverlay(): void {
  overlayObjects = [];
  isOverlayActive = false;
}
