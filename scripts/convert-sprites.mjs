// Convert SVG sprites to PNG with transparent padding
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITES_DIR = './public/sprites';
const OUTPUT_DIR = './public/sprites-png';
const PADDING = 4; // pixels of transparent padding on each side (need more for linear filtering at high scale)
const SCALE = 1; // render at native size to keep scaling math unchanged

// SVGs to convert (game sprites only, not photos/logos)
const SVGS_TO_CONVERT = [
  'player.svg',
  'peta.svg',
  'asura.svg',
  'deva.svg',
  'nerayika.svg',
  'tiracchana.svg',
  'manussa.svg',
  'mara.svg',
  'paduma.svg',
  'vajra.svg',
  'projectile.svg',
  'boss_projectile.svg',
  'powerup_compassion.svg',
  'powerup_wisdom.svg',
  'powerup_patience.svg',
  'powerup_diligence.svg',
  'powerup_meditation.svg',
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function convertSvg(filename) {
  const inputPath = path.join(SPRITES_DIR, filename);
  const outputFilename = filename.replace('.svg', '.png');
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  // Read SVG
  const svgContent = fs.readFileSync(inputPath, 'utf8');

  // Parse original dimensions from viewBox or width/height
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const widthMatch = svgContent.match(/width="(\d+)"/);
  const heightMatch = svgContent.match(/height="(\d+)"/);

  let width, height;
  if (viewBoxMatch) {
    const [, , , w, h] = viewBoxMatch[1].split(/\s+/).map(Number);
    width = w;
    height = h;
  } else {
    width = parseInt(widthMatch?.[1] || 32);
    height = parseInt(heightMatch?.[1] || 32);
  }

  // Render SVG at scaled size
  const scaledWidth = width * SCALE;
  const scaledHeight = height * SCALE;

  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: scaledWidth,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Add padding with sharp
  const paddedWidth = scaledWidth + (PADDING * 2);
  const paddedHeight = scaledHeight + (PADDING * 2);

  await sharp(pngBuffer)
    .extend({
      top: PADDING,
      bottom: PADDING,
      left: PADDING,
      right: PADDING,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(outputPath);

  console.log(`✓ ${filename} → ${outputFilename} (${paddedWidth}x${paddedHeight})`);

  return { filename, width: paddedWidth, height: paddedHeight, originalWidth: width, originalHeight: height };
}

async function main() {
  console.log('Converting SVG sprites to PNG with padding...\n');

  const results = [];
  for (const svg of SVGS_TO_CONVERT) {
    try {
      const result = await convertSvg(svg);
      results.push(result);
    } catch (err) {
      console.error(`✗ ${svg}: ${err.message}`);
    }
  }

  console.log(`\nConverted ${results.length}/${SVGS_TO_CONVERT.length} sprites`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // Output info for updating main.ts
  console.log('\n--- Sprite dimensions (for reference) ---');
  for (const r of results) {
    console.log(`${r.filename.replace('.svg', '')}: original ${r.originalWidth}x${r.originalHeight}, padded ${r.width}x${r.height}`);
  }
}

main().catch(console.error);
