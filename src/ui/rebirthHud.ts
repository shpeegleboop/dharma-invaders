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

  // Two-line layout: line1 at top of bar, line2 below
  const line1Y = config.bottomHud.offsetY + 14;
  const line2Y = config.bottomHud.offsetY + 34;
  const maxX = config.screen.width / 2 - 20; // Max width before wrapping

  // Display paramis (left side, green) - wrap to second line if needed
  let xLeft = 16;
  let leftLine = 1;
  Object.entries(paramiCounts).forEach(([name, count]) => {
    const text = count > 1 ? `${name} x${count}` : name;
    const textWidth = text.length * 9 + 16;

    // Wrap to next line if exceeding max width
    if (xLeft + textWidth > maxX && leftLine === 1) {
      xLeft = 16;
      leftLine = 2;
    }

    const y = leftLine === 1 ? line1Y : line2Y;
    hudObjects.push(k.add([
      k.text(text, { size: 14 }),
      k.pos(xLeft, y),
      k.anchor('left'),
      k.color(144, 238, 144),
      k.fixed(),
      k.z(50),
    ]));
    xLeft += textWidth;
  });

  // Display kleshas (right side, red) - wrap to second line if needed
  let xRight = config.screen.width - 16;
  let rightLine = 1;
  Object.entries(kleshaCounts).reverse().forEach(([name, count]) => {
    const text = count > 1 ? `${name} x${count}` : name;
    const textWidth = text.length * 9 + 16;

    // Wrap to next line if exceeding max width
    if (xRight - textWidth < maxX && rightLine === 1) {
      xRight = config.screen.width - 16;
      rightLine = 2;
    }

    const y = rightLine === 1 ? line1Y : line2Y;
    hudObjects.push(k.add([
      k.text(text, { size: 14 }),
      k.pos(xRight, y),
      k.anchor('right'),
      k.color(255, 100, 100),
      k.fixed(),
      k.z(50),
    ]));
    xRight -= textWidth;
  });
}

export function clearRebirthHud(): void {
  hudObjects.forEach(obj => obj.destroy());
  hudObjects = [];
}
