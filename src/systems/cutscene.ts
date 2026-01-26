// Cutscene system - data-driven narrative overlays
import type { KAPLAYCtx, GameObj } from 'kaplay';
import cutsceneData from '../data/cutscenes.json';
import { getCutsceneFlag, setCutsceneFlag } from './persistence';
import { getCycle } from '../stores/gameStore';

type CutsceneId = keyof typeof cutsceneData;
type FlagId = 'hasSeenIntro' | 'hasSeenFirstDeath' | 'hasSeenBossIntro' |
  'hasSeenVictory' | 'hasSeenBodhisattva' | 'hasSeenKalpa2' | 'hasSeenKalpa3' | 'hasSeenKalpa4';

interface SpriteConfig {
  name: string;
  x: number;
  y: number;
  scale: number;
}

interface OverlayText {
  text: string;
  x: number;
  y: number;
  color: string;
}

interface LayeredConfig {
  background: { image: string; rotate?: boolean; scale?: number };
  foreground: { sprite: string; scale: number };
}

interface CutsceneBeat {
  background: string;
  character?: string | null;
  text: string;
  textColor: string;
  image?: string;
  imageScale?: number;
  imageRotate?: boolean;
  sprites?: SpriteConfig[];
  overlayTexts?: OverlayText[];
  layered?: LayeredConfig;
}

let isPlaying = false;
const ROTATION_SPEED = 15; // degrees per second

const FLAG_MAP: Partial<Record<CutsceneId, FlagId>> = {
  intro: 'hasSeenIntro',
  firstDeath: 'hasSeenFirstDeath',
  bossIntro: 'hasSeenBossIntro',
  victory: 'hasSeenVictory',
  bodhisattva: 'hasSeenBodhisattva',
  kalpa2: 'hasSeenKalpa2',
  kalpa3: 'hasSeenKalpa3',
  kalpa4: 'hasSeenKalpa4',
};

function shouldPlayCutscene(id: CutsceneId): boolean {
  if (id === 'maraReturns') return getCycle() >= 2;
  if (id === 'rafLinens') return true;
  const flag = FLAG_MAP[id];
  return flag ? !getCutsceneFlag(flag) : false;
}

function markCutsceneSeen(id: CutsceneId): void {
  const flag = FLAG_MAP[id];
  if (flag) setCutsceneFlag(flag, true);
}

export async function tryPlayCutscene(k: KAPLAYCtx, id: CutsceneId): Promise<void> {
  if (!shouldPlayCutscene(id)) return;
  if (id !== 'maraReturns' && id !== 'rafLinens') markCutsceneSeen(id);
  await playCutscene(k, id);
}

export function playCutscene(k: KAPLAYCtx, id: CutsceneId): Promise<void> {
  return new Promise((resolve) => {
    if (isPlaying) { resolve(); return; }
    isPlaying = true;

    const config = cutsceneData[id] as { beats: CutsceneBeat[] };
    let beatIndex = 0;

    // Overlay background
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(0, 0),
      k.color(k.Color.fromHex(config.beats[0].background)),
      k.fixed(), k.z(1000), 'cutscene',
    ]);

    // Text box
    k.add([
      k.rect(k.width() - 100, 120),
      k.pos(50, k.height() - 170),
      k.color(0, 0, 0), k.opacity(0.7),
      k.fixed(), k.z(1001), 'cutscene',
    ]);

    // Text content
    const textContent = k.add([
      k.text(config.beats[0].text, { size: 20, width: k.width() - 140, align: 'center' }),
      k.pos(k.center().x, k.height() - 110),
      k.anchor('center'),
      k.color(k.Color.fromHex(config.beats[0].textColor)),
      k.fixed(), k.z(1002), 'cutscene',
    ]);

    // Hint
    k.add([
      k.text('Click to continue...', { size: 14 }),
      k.pos(k.center().x, k.height() - 30),
      k.anchor('center'), k.color(150, 150, 150),
      k.fixed(), k.z(1002), 'cutscene',
    ]);

    function clearBeatVisuals(): void {
      k.get('cutsceneVisual').forEach((obj) => k.destroy(obj));
    }

    function showBeat(beat: CutsceneBeat): void {
      overlay.color = k.Color.fromHex(beat.background);
      textContent.text = beat.text;
      textContent.color = k.Color.fromHex(beat.textColor);
      clearBeatVisuals();

      // Round positions to avoid sub-pixel rendering artifacts with linear filtering
      const cx = Math.round(k.center().x);
      const cy = Math.round(k.center().y - 70);

      // Layered composition (sprite inside rotating image)
      if (beat.layered) {
        const ly = beat.layered;
        const bgScale = ly.background.scale ?? 0.5;
        const bgImg = k.add([
          k.sprite(ly.background.image),
          k.pos(cx, cy),
          k.anchor('center'),
          k.scale(bgScale),
          k.rotate(0),
          k.fixed(), k.z(1001), 'cutsceneVisual',
        ]);
        if (ly.background.rotate) {
          bgImg.onUpdate(() => { bgImg.angle += ROTATION_SPEED * k.dt(); });
        }
        k.add([
          k.sprite(ly.foreground.sprite),
          k.pos(cx, cy),
          k.anchor('center'),
          k.scale(ly.foreground.scale),
          k.fixed(), k.z(1002), 'cutsceneVisual',
        ]);
        return;
      }

      // Single image (centered, optional rotation)
      if (beat.image) {
        const imgScale = beat.imageScale ?? 0.5;
        const img = k.add([
          k.sprite(beat.image),
          k.pos(cx, cy),
          k.anchor('center'),
          k.scale(imgScale),
          k.rotate(0),
          k.fixed(), k.z(1001), 'cutsceneVisual',
        ]);
        if (beat.imageRotate) {
          img.onUpdate(() => { img.angle += ROTATION_SPEED * k.dt(); });
        }
      }

      // Multiple sprites with positions (round to avoid sub-pixel artifacts)
      if (beat.sprites) {
        for (const spr of beat.sprites) {
          k.add([
            k.sprite(spr.name),
            k.pos(Math.round(spr.x), Math.round(spr.y)),
            k.anchor('center'),
            k.scale(spr.scale),
            k.fixed(), k.z(1001), 'cutsceneVisual',
          ]);
        }
      }

      // Overlay texts (floating labels like +Klesha, -Parami)
      if (beat.overlayTexts) {
        for (const ot of beat.overlayTexts) {
          k.add([
            k.text(ot.text, { size: 16 }),
            k.pos(Math.round(ot.x), Math.round(ot.y)),
            k.anchor('center'),
            k.color(k.Color.fromHex(ot.color)),
            k.outline(2, k.rgb(0, 0, 0)),
            k.fixed(), k.z(1003), 'cutsceneVisual',
          ]);
        }
      }

      // Legacy character support
      if (beat.character) {
        createCharSprite(k, beat.character, cx, cy);
      }
    }

    function cleanup(): void {
      k.get('cutscene').forEach((obj) => k.destroy(obj));
      k.get('cutsceneVisual').forEach((obj) => k.destroy(obj));
      isPlaying = false;
      resolve();
    }

    function advance(): void {
      beatIndex++;
      if (beatIndex >= config.beats.length) cleanup();
      else showBeat(config.beats[beatIndex]);
    }

    const clickHandler = k.onMousePress('left', advance);
    const keyHandler = k.onKeyPress(['space', 'enter'], advance);

    // Show initial beat visuals
    showBeat(config.beats[0]);

    overlay.onDestroy(() => { clickHandler.cancel(); keyHandler.cancel(); });
  });
}

function createCharSprite(k: KAPLAYCtx, character: string, cx: number, cy: number): GameObj {
  const spriteChars: Record<string, { sprite: string; scale: number }> = {
    player: { sprite: 'player', scale: 4 },
    mara: { sprite: 'mara', scale: 3 },
    raflinens: { sprite: 'raflinens', scale: 1 },
  };

  const charConfig = spriteChars[character];
  if (charConfig) {
    const spr = k.add([
      k.sprite(charConfig.sprite),
      k.pos(cx, cy),
      k.anchor('center'),
      k.scale(charConfig.scale),
      k.fixed(), k.z(1001), 'cutsceneVisual',
    ]);

    if (character === 'raflinens') {
      k.add([
        k.text('@raflinens', { size: 16 }),
        k.pos(cx, cy + 150),
        k.anchor('center'), k.color(0, 0, 0),
        k.fixed(), k.z(1002), 'cutsceneVisual',
      ]);
    }
    return spr;
  }

  // Fallback placeholder
  const sprite = k.add([
    k.rect(64, 64), k.pos(cx, cy + 20),
    k.anchor('center'), k.color(k.Color.fromHex('#ffff00')),
    k.fixed(), k.z(1001), 'cutsceneVisual',
  ]);
  k.add([
    k.text(':)', { size: 32 }), k.pos(cx, cy + 20),
    k.anchor('center'), k.color(0, 0, 0),
    k.fixed(), k.z(1002), 'cutsceneVisual',
  ]);
  return sprite;
}

export function isCutscenePlaying(): boolean { return isPlaying; }
