// Cutscene system - data-driven narrative overlays
import type { KAPLAYCtx, GameObj } from 'kaplay';
import cutsceneData from '../data/cutscenes.json';
import { getCutsceneFlag, setCutsceneFlag } from './persistence';
import { getCycle } from '../stores/gameStore';

type CutsceneId = keyof typeof cutsceneData;
type FlagId = 'hasSeenIntro' | 'hasSeenFirstDeath' | 'hasSeenBossIntro' |
  'hasSeenVictory' | 'hasSeenBodhisattva' | 'hasSeenKalpa2' | 'hasSeenKalpa3' | 'hasSeenKalpa4';

interface CutsceneBeat {
  background: string;
  character: string | null;
  text: string;
  textColor: string;
  image?: string;
}

let isPlaying = false;

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
  // maraReturns plays every kalpa 2+, rafLinens plays every kalpa 4 boss beat
  if (id === 'maraReturns') return getCycle() >= 2;
  if (id === 'rafLinens') return true; // Triggered manually after kalpa 4 boss

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
    let charSprite: GameObj | null = null;

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

    function showBeat(beat: CutsceneBeat): void {
      overlay.color = k.Color.fromHex(beat.background);
      textContent.text = beat.text;
      textContent.color = k.Color.fromHex(beat.textColor);
      if (charSprite) { k.destroy(charSprite); charSprite = null; }
      k.get('cutsceneHandle').forEach((obj) => k.destroy(obj)); // Clean up handle text
      if (beat.character) charSprite = createCharSprite(k, beat.character);
    }

    function cleanup(): void {
      k.get('cutscene').forEach((obj) => k.destroy(obj));
      k.get('cutsceneHandle').forEach((obj) => k.destroy(obj));
      if (charSprite) k.destroy(charSprite);
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

    // Show initial character
    if (config.beats[0].character) {
      charSprite = createCharSprite(k, config.beats[0].character);
    }

    // Store handlers for cleanup
    overlay.onDestroy(() => { clickHandler.cancel(); keyHandler.cancel(); });
  });
}

function createCharSprite(k: KAPLAYCtx, character: string): GameObj {
  // Characters that use actual sprites
  const spriteChars: Record<string, { sprite: string; scale: number }> = {
    player: { sprite: 'player', scale: 4 },
    mara: { sprite: 'mara', scale: 3 },
    raflinens: { sprite: 'raflinens', scale: 1 },
  };

  const charConfig = spriteChars[character];
  if (charConfig) {
    const spr = k.add([
      k.sprite(charConfig.sprite),
      k.pos(k.center().x, k.center().y - 70),
      k.anchor('center'),
      k.scale(charConfig.scale),
      k.fixed(), k.z(1001), 'cutsceneChar',
    ]);

    // Add handle text below raflinens image
    if (character === 'raflinens') {
      k.add([
        k.text('@raflinens', { size: 16 }),
        k.pos(k.center().x, k.center().y + 80),
        k.anchor('center'), k.color(0, 0, 0),
        k.fixed(), k.z(1002), 'cutsceneHandle',
      ]);
    }

    return spr;
  }

  // Fallback: generic smiley placeholder for unknown characters
  const sprite = k.add([
    k.rect(64, 64), k.pos(k.center().x, k.center().y - 50),
    k.anchor('center'), k.color(k.Color.fromHex('#ffff00')),
    k.fixed(), k.z(1001), 'cutsceneChar',
  ]);

  k.add([
    k.text(':)', { size: 32 }), k.pos(k.center().x, k.center().y - 50),
    k.anchor('center'), k.color(0, 0, 0),
    k.fixed(), k.z(1002), 'cutscene',
  ]);

  return sprite;
}

export function isCutscenePlaying(): boolean { return isPlaying; }
