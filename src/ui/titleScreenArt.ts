// Title screen art - geometric background and lotus patterns
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';

// Brighter purple palette for geometric background
const COLORS = {
  deepPurple: [45, 15, 65] as const,
  purple: [100, 50, 140] as const,
  brightPurple: [160, 90, 200] as const,
  magenta: [220, 80, 180] as const,
  gold: [255, 200, 80] as const,
  cyan: [80, 220, 220] as const,
  pink: [255, 150, 200] as const,
};

// Draw a lotus flower pattern at position
function drawLotus(k: KAPLAYCtx, x: number, y: number, size: number, style: number): void {
  const petals = style === 0 ? 8 : style === 1 ? 6 : 12;
  const color = style === 0 ? COLORS.magenta :
                style === 1 ? COLORS.gold : COLORS.pink;
  const [cr, cg, cb] = color;

  // Petals
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const px = x + Math.cos(angle) * size * 0.6;
    const py = y + Math.sin(angle) * size * 0.6;

    k.add([
      k.circle(size * 0.35),
      k.pos(px, py),
      k.anchor('center'),
      k.color(cr, cg, cb),
      k.opacity(0.7),
    ]);
  }

  // Center
  const [gr, gg, gb] = COLORS.gold;
  k.add([
    k.circle(size * 0.25),
    k.pos(x, y),
    k.anchor('center'),
    k.color(gr, gg, gb),
    k.opacity(0.9),
  ]);
}

export function drawGeometricBackground(k: KAPLAYCtx): void {
  const w = config.screen.width;
  const h = config.screen.height;
  const [dr, dg, db] = COLORS.deepPurple;

  // Base purple background
  k.add([
    k.rect(w, h),
    k.pos(0, 0),
    k.color(dr, dg, db),
  ]);

  // Hexagonal tessellation
  const hexSize = 28;
  const hexH = hexSize * Math.sqrt(3);
  const rowHeight = hexH * 0.5;
  const cols = Math.ceil(w / (hexSize * 1.5)) + 2;
  const rows = Math.ceil(h / rowHeight) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2) * hexSize * 0.75;
      const x = col * hexSize * 1.5 + offsetX;
      const y = row * hexH * 0.5;

      // Tile style varies by position
      const styleIdx = (col * 3 + row * 7) % 5;
      let color: readonly [number, number, number];
      let opacity: number;
      let radius: number;

      if (styleIdx === 0) {
        color = COLORS.purple;
        opacity = 0.4;
        radius = hexSize * 0.4;
      } else if (styleIdx === 1) {
        color = COLORS.brightPurple;
        opacity = 0.5;
        radius = hexSize * 0.3;
      } else if (styleIdx === 2) {
        color = COLORS.deepPurple;
        opacity = 0.6;
        radius = hexSize * 0.5;
      } else if (styleIdx === 3) {
        color = COLORS.purple;
        opacity = 0.3;
        radius = hexSize * 0.25;
      } else {
        color = COLORS.brightPurple;
        opacity = 0.35;
        radius = hexSize * 0.35;
      }

      // Draw hexagon as 6 circles (pixelated hex)
      const [r, g, b] = color;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const hx = x + Math.cos(angle) * radius;
        const hy = y + Math.sin(angle) * radius;

        k.add([
          k.circle(4),
          k.pos(hx, hy),
          k.anchor('center'),
          k.color(r, g, b),
          k.opacity(opacity),
        ]);
      }
    }
  }

  // Lotus patterns at key positions (radial from center)
  const cx = w / 2;
  const cy = h / 2;

  // Center lotus
  drawLotus(k, cx, cy, 20, 0);

  // Ring of lotuses around center
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const lx = cx + Math.cos(angle) * 120;
    const ly = cy + Math.sin(angle) * 120;
    drawLotus(k, lx, ly, 15, 1);
  }

  // Outer ring
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const lx = cx + Math.cos(angle) * 250;
    const ly = cy + Math.sin(angle) * 250;
    drawLotus(k, lx, ly, 12, 2);
  }

  // Corner lotuses
  drawLotus(k, 60, 60, 18, 0);
  drawLotus(k, w - 60, 60, 18, 1);
  drawLotus(k, 60, h - 80, 18, 1);
  drawLotus(k, w - 60, h - 80, 18, 0);

  // Additional scattered lotuses - top half
  drawLotus(k, 150, 200, 10, 2);
  drawLotus(k, w - 150, 200, 10, 2);
  drawLotus(k, 100, h / 2, 12, 1);
  drawLotus(k, w - 100, h / 2, 12, 1);

  // Bottom area lotuses
  drawLotus(k, cx, h - 120, 16, 0);
  drawLotus(k, 200, h - 150, 12, 2);
  drawLotus(k, w - 200, h - 150, 12, 2);
  drawLotus(k, 120, h - 200, 10, 1);
  drawLotus(k, w - 120, h - 200, 10, 1);

  // Bottom ring (6-fold symmetry around lower center)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const lx = cx + Math.cos(angle) * 180;
    const ly = h - 180 + Math.sin(angle) * 60;
    drawLotus(k, lx, ly, 10, i % 3);
  }
}

export function drawQuoteFrame(k: KAPLAYCtx): void {
  const w = config.screen.width;
  const h = config.screen.height;
  const frameHeight = 52;
  const frameY = h - frameHeight;
  const [gr, gg, gb] = COLORS.gold;

  // Dark frame background
  k.add([
    k.rect(w, frameHeight),
    k.pos(0, frameY),
    k.color(15, 10, 25),
    k.opacity(0.95),
  ]);

  // Top border accent line
  k.add([
    k.rect(w, 2),
    k.pos(0, frameY),
    k.color(gr, gg, gb),
    k.opacity(0.8),
  ]);

  // Quote text (condensed to two lines)
  const quote = `"For there is suffering, but none who suffers... Although there is a path, there is no goer."`;

  k.add([
    k.text(quote, { size: 15 }),
    k.pos(w / 2, frameY + 18),
    k.anchor('center'),
    k.color(220, 200, 255),
  ]);

  // Attribution
  k.add([
    k.text('- Visuddhimagga XVI', { size: 14 }),
    k.pos(w / 2, frameY + 38),
    k.anchor('center'),
    k.color(180, 160, 200),
  ]);
}
