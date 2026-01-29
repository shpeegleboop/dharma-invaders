// Cutscene system - data-driven narrative overlays
import type { KAPLAYCtx, GameObj } from 'kaplay';
import cutsceneData from '../data/cutscenes.json';
import { getCutsceneFlag, setCutsceneFlag, getShowAllCutscenes } from './persistence';
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
const BREATH_SPEED = 0.3; // cycles per second (~3.3 sec per breath)
const BREATH_AMOUNT = 0.03; // 3% scale variation
const ROCK_SPEED = 0.15; // cycles per second (~6.7 sec per rock cycle)
const ROCK_ANGLE = 3; // degrees to tilt each direction

// Add subtle breathing animation to a sprite
function addBreathing(k: KAPLAYCtx, obj: GameObj, baseScale: number, phaseOffset = 0): void {
  const startTime = k.time();
  obj.onUpdate(() => {
    const t = (k.time() - startTime) * BREATH_SPEED * Math.PI * 2 + phaseOffset;
    const breathScale = 1 + Math.sin(t) * BREATH_AMOUNT;
    obj.scale = k.vec2(baseScale * breathScale);
  });
}

// Add breathing + gentle rocking (for non-rotating images)
function addBreathingAndRocking(k: KAPLAYCtx, obj: GameObj, baseScale: number, phaseOffset = 0): void {
  const startTime = k.time();
  obj.onUpdate(() => {
    const bt = (k.time() - startTime) * BREATH_SPEED * Math.PI * 2 + phaseOffset;
    const breathScale = 1 + Math.sin(bt) * BREATH_AMOUNT;
    obj.scale = k.vec2(baseScale * breathScale);

    const rt = (k.time() - startTime) * ROCK_SPEED * Math.PI * 2 + phaseOffset * 0.7;
    obj.angle = Math.sin(rt) * ROCK_ANGLE;
  });
}

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
  const kalpa = getCycle();

  // Cutscenes with special trigger conditions (not just flags)
  if (id === 'maraReturns') return kalpa >= 2;
  if (id === 'rafLinens') return true;

  // Kalpa-specific cutscenes only play in their kalpa
  if (id === 'intro' && kalpa > 1) return false;
  if (id === 'kalpa2' && kalpa !== 2) return false;
  if (id === 'kalpa3' && kalpa !== 3) return false;
  if (id === 'kalpa4' && kalpa !== 4) return false;

  const flag = FLAG_MAP[id];
  if (!flag) return false;

  // Check if already seen
  const alreadySeen = getCutsceneFlag(flag);
  // Play if: never seen, OR (already seen AND "show all" is enabled)
  return !alreadySeen || getShowAllCutscenes();
}

export function markCutsceneSeen(id: CutsceneId): void {
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
          addBreathing(k, bgImg, bgScale);
        } else {
          addBreathingAndRocking(k, bgImg, bgScale);
        }
        const fgSprite = k.add([
          k.sprite(ly.foreground.sprite),
          k.pos(cx, cy),
          k.anchor('center'),
          k.scale(ly.foreground.scale),
          k.rotate(0),
          k.fixed(), k.z(1002), 'cutsceneVisual',
        ]);
        addBreathingAndRocking(k, fgSprite, ly.foreground.scale, Math.PI * 0.5);
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
          addBreathing(k, img, imgScale);
        } else {
          addBreathingAndRocking(k, img, imgScale);
        }
      }

      // Multiple sprites with positions (round to avoid sub-pixel artifacts)
      if (beat.sprites) {
        beat.sprites.forEach((spr, i) => {
          const sprObj = k.add([
            k.sprite(spr.name),
            k.pos(Math.round(spr.x), Math.round(spr.y)),
            k.anchor('center'),
            k.scale(spr.scale),
            k.rotate(0),
            k.fixed(), k.z(1001), 'cutsceneVisual',
          ]);
          // Desynchronize breathing and rocking with different phase offsets
          addBreathingAndRocking(k, sprObj, spr.scale, i * Math.PI * 0.4);
        });
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
      k.rotate(0),
      k.fixed(), k.z(1001), 'cutsceneVisual',
    ]);
    addBreathingAndRocking(k, spr, charConfig.scale);

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
    k.z(1001), 'cutsceneVisual',
  ]);
  k.add([
    k.text(':)', { size: 32 }), k.pos(cx, cy + 20),
    k.anchor('center'), k.color(0, 0, 0),
    k.z(1002), 'cutsceneVisual',
  ]);
  return sprite;
}

export function isCutscenePlaying(): boolean { return isPlaying; }
