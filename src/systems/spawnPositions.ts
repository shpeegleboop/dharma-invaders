// Spawn position helpers - calculate where enemies spawn
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';

export function getRandomEdgePosition(k: KAPLAYCtx): { x: number; y: number } {
  const edge = Math.floor(k.rand(0, 4));
  const margin = config.enemies.spawnMargin;
  const arenaTop = config.arena.offsetY;
  const arenaBottom = config.screen.height;
  const screenWidth = config.screen.width;

  switch (edge) {
    case 0:
      return { x: k.rand(margin, screenWidth - margin), y: arenaTop - margin };
    case 1:
      return { x: screenWidth + margin, y: k.rand(arenaTop + margin, arenaBottom - margin) };
    case 2:
      return { x: k.rand(margin, screenWidth - margin), y: arenaBottom + margin };
    default:
      return { x: -margin, y: k.rand(arenaTop + margin, arenaBottom - margin) };
  }
}

export function getEdgeFromPosition(pos: { x: number; y: number }): 'top' | 'right' | 'bottom' | 'left' {
  if (pos.y < config.arena.offsetY) return 'top';
  if (pos.x > config.screen.width) return 'right';
  if (pos.y > config.screen.height) return 'bottom';
  return 'left';
}

export function getPackOffset(k: KAPLAYCtx, edge: string, index: number): { x: number; y: number } {
  const spread = config.effects.packSpread;
  const variance = k.rand(-config.effects.packVariance, config.effects.packVariance);

  switch (edge) {
    case 'top':
    case 'bottom':
      return { x: (index - 2.5) * spread + variance, y: variance };
    case 'left':
    case 'right':
      return { x: variance, y: (index - 2.5) * spread + variance };
    default:
      return { x: 0, y: 0 };
  }
}
