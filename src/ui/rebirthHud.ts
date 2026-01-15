// HUD display for active rebirth effects (paramis/kleshas)
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';
import { getGameState } from '../stores/gameStore';

let hudObjects: GameObj[] = [];
let kRef: KAPLAYCtx | null = null;

// Count occurrences in array
function countItems(arr: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return counts;
}

export function setupRebirthHud(k: KAPLAYCtx): void {
  kRef = k;
  updateRebirthHud();

  // Update HUD every frame to reflect changes
  k.onUpdate(() => {
    updateRebirthHud();
  });
}

function updateRebirthHud(): void {
  if (!kRef) return;
  const k = kRef;

  // Clear old HUD objects
  hudObjects.forEach(obj => obj.destroy());
  hudObjects = [];

  const state = getGameState();
  const paramiCounts = countItems(state.paramis);
  const kleshaCounts = countItems(state.kleshas);

  const hasParamis = Object.keys(paramiCounts).length > 0;
  const hasKleshas = Object.keys(kleshaCounts).length > 0;

  if (!hasParamis && !hasKleshas) return;

  // Position in bottom HUD bar - paramis on left, kleshas on right
  const barY = config.bottomHud.offsetY + config.bottomHud.height / 2;

  // Display paramis (left side, green)
  let xLeft = 16;
  Object.entries(paramiCounts).forEach(([name, count]) => {
    const text = count > 1 ? `${name} x${count}` : name;
    hudObjects.push(k.add([
      k.text(text, { size: 16 }),
      k.pos(xLeft, barY),
      k.anchor('left'),
      k.color(144, 238, 144),
      k.fixed(),
      k.z(50),
    ]));
    xLeft += (text.length * 10) + 20;
  });

  // Display kleshas (right side, red)
  let xRight = config.screen.width - 16;
  Object.entries(kleshaCounts).reverse().forEach(([name, count]) => {
    const text = count > 1 ? `${name} x${count}` : name;
    hudObjects.push(k.add([
      k.text(text, { size: 16 }),
      k.pos(xRight, barY),
      k.anchor('right'),
      k.color(255, 100, 100),
      k.fixed(),
      k.z(50),
    ]));
    xRight -= (text.length * 10) + 20;
  });
}

export function clearRebirthHud(): void {
  hudObjects.forEach(obj => obj.destroy());
  hudObjects = [];
}
