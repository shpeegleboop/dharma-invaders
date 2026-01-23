// Menu scene - title screen
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';
import { setupAudioSettings, showAudioSettings, hideAudioSettings, isAudioSettingsVisible } from '../ui/audioSettings';
import { getDifficulty, setDifficulty, getDifficulties } from '../stores/gameStore';
import { getDifficultyDisplayName, getDifficultySubtitle } from '../systems/difficulty';

export function createMenuScene(k: KAPLAYCtx): void {
  // Play menu music
  playMusic('menu');
  // Dark background
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(15, 15, 30),
  ]);

  // Title
  k.add([
    k.text('Dharma Invaders', { size: 48 }),
    k.pos(config.screen.width / 2, config.screen.height / 3),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  // Subtitle
  k.add([
    k.text('"Escape" from Samsara', { size: 20 }),
    k.pos(config.screen.width / 2, config.screen.height / 3 + 50),
    k.anchor('center'),
    k.color(180, 180, 200),
  ]);

  // Start prompt (pulsing)
  const prompt = k.add([
    k.text('Press SPACE or CLICK to Enter Samsara', { size: 18 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.65),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.opacity(1),
  ]);

  // Pulse the prompt
  prompt.onUpdate(() => {
    prompt.opacity = 0.5 + Math.sin(k.time() * 3) * 0.5;
  });

  // Controls hint
  k.add([
    k.text('WASD move | Mouse aim | Click shoot | Right-click paṭighāta', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height - 80),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]);

  // Difficulty selector
  const difficulties = getDifficulties();
  let diffIndex = difficulties.indexOf(getDifficulty());

  // Get initial color based on current difficulty
  const getColorForDiff = (d: string) => {
    if (d === 'sotapanna') return k.rgb(100, 220, 100);
    if (d === 'sakadagami') return k.rgb(255, 165, 0);
    if (d === 'anagami') return k.rgb(255, 100, 100);
    return k.rgb(180, 40, 40);
  };

  const diffLabel = k.add([
    k.text(getDifficultyDisplayName(), { size: 22 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.78),
    k.anchor('center'),
    k.color(getColorForDiff(getDifficulty())),
  ]);

  const diffSubtitle = k.add([
    k.text(getDifficultySubtitle(), { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height * 0.78 + 24),
    k.anchor('center'),
    k.color(150, 150, 170),
  ]);

  const updateDifficultyDisplay = () => {
    diffLabel.text = getDifficultyDisplayName();
    diffSubtitle.text = getDifficultySubtitle();
    // Color by difficulty: green → orange → light red → dark red
    const diff = getDifficulty();
    if (diff === 'sotapanna') diffLabel.color = k.rgb(100, 220, 100);
    else if (diff === 'sakadagami') diffLabel.color = k.rgb(255, 165, 0);
    else if (diff === 'anagami') diffLabel.color = k.rgb(255, 100, 100);
    else diffLabel.color = k.rgb(180, 40, 40);
  };

  // Flag to prevent starting game when clicking arrows
  let arrowClicked = false;

  const cycleDifficulty = (direction: number) => {
    arrowClicked = true;
    diffIndex = (diffIndex + direction + difficulties.length) % difficulties.length;
    setDifficulty(difficulties[diffIndex]);
    updateDifficultyDisplay();
  };

  // Left/right arrows
  k.add([
    k.text('◀', { size: 22 }),
    k.pos(config.screen.width / 2 - 100, config.screen.height * 0.78),
    k.anchor('center'),
    k.color(150, 150, 170),
    k.area(),
  ]).onClick(() => cycleDifficulty(-1));

  k.add([
    k.text('▶', { size: 22 }),
    k.pos(config.screen.width / 2 + 100, config.screen.height * 0.78),
    k.anchor('center'),
    k.color(150, 150, 170),
    k.area(),
  ]).onClick(() => cycleDifficulty(1));

  // Reset arrow flag each frame
  k.onUpdate(() => { arrowClicked = false; });

  // Menu hints
  k.add([
    k.text('(A) Audio   (B) About   (D) Difficulty', { size: 14 }),
    k.pos(config.screen.width / 2, config.screen.height - 50),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]);

  // Setup audio settings
  setupAudioSettings(k);

  // Go to title screen on input
  const startGame = () => {
    if (isAudioSettingsVisible()) return;
    if (arrowClicked) return;
    k.go('titleScreen');
  };

  k.onKeyPress('space', startGame);
  k.onMousePress('left', startGame);

  // Audio settings
  k.onKeyPress('a', () => {
    if (isAudioSettingsVisible()) return;
    showAudioSettings(() => {});
  });

  // About/Bestiary
  k.onKeyPress('b', () => {
    if (isAudioSettingsVisible()) return;
    k.go('about');
  });

  // Difficulty selector
  k.onKeyPress('d', () => {
    if (isAudioSettingsVisible()) return;
    cycleDifficulty(1);
  });

  k.onKeyPress('escape', () => {
    if (isAudioSettingsVisible()) {
      hideAudioSettings();
    }
  });
}
