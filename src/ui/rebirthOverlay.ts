// Rebirth overlay - shown on player death
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getRebirthTier, getTierColor } from '../systems/rebirthTiers';
import { getGameState } from '../stores/gameStore';

// Available paramis and kleshas for random selection
const PARAMI_POOL = ['Dana', 'Viriya', 'Metta', 'Upekkha'];
const KLESHA_POOL = ['Lobha', 'Dosa', 'Mana', 'Vicikiccha'];

let overlayObjects: GameObj[] = [];
let isOverlayActive = false;

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function showRebirthOverlay(
  k: KAPLAYCtx,
  karmaThisLife: number,
  onContinue: () => void
): void {
  if (isOverlayActive) return;
  isOverlayActive = true;

  const tier = getRebirthTier(karmaThisLife);
  const tierColor = getTierColor(tier.name);
  const store = getGameState();

  // Select random paramis and kleshas
  const grantedParamis = pickRandom(PARAMI_POOL, tier.paramis);
  const grantedKleshas = pickRandom(KLESHA_POOL, tier.kleshas);

  // Add to store
  grantedParamis.forEach((p) => store.addParami(p));
  grantedKleshas.forEach((k) => store.addKlesha(k));

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

  // Paramis granted
  if (grantedParamis.length > 0) {
    const paramiText = k.add([
      k.text(`+ ${grantedParamis.join(', ')}`, { size: 20 }),
      k.pos(config.screen.width / 2, 290),
      k.anchor('center'),
      k.color(144, 238, 144), // Light green
      k.fixed(),
      k.z(101),
    ]);
    overlayObjects.push(paramiText);
  }

  // Kleshas inflicted
  if (grantedKleshas.length > 0) {
    const kleshaText = k.add([
      k.text(`- ${grantedKleshas.join(', ')}`, { size: 20 }),
      k.pos(config.screen.width / 2, 330),
      k.anchor('center'),
      k.color(255, 100, 100), // Light red
      k.fixed(),
      k.z(101),
    ]);
    overlayObjects.push(kleshaText);
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
