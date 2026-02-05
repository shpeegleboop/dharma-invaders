// Menu scene - title screen
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { playMusic } from '../systems/audio';
import { setupAudioSettings, showAudioSettings, hideAudioSettings, isAudioSettingsVisible } from '../ui/audioSettings';
import { getDifficulty, setDifficulty, getDifficulties } from '../stores/gameStore';
import { getDifficultyDisplayName, getDifficultySubtitle } from '../systems/difficulty';
import { showMenuLogo, hideMenuLogo } from '../ui/htmlOverlays';
import { hasSeenAllCutscenes, getShowAllCutscenes, setShowAllCutscenes } from '../systems/persistence';

export function createMenuScene(k: KAPLAYCtx): void {
  // Play menu music
  playMusic('menu');

  // Show HTML logo overlay
  showMenuLogo();

  // Dark background
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(15, 15, 30),
  ]);

  // Title and subtitle are now rendered via HTML overlay (dharma_logo_final.svg)

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
    k.fixed(),
  ]).onClick(() => cycleDifficulty(-1));

  k.add([
    k.text('▶', { size: 22 }),
    k.pos(config.screen.width / 2 + 100, config.screen.height * 0.78),
    k.anchor('center'),
    k.color(150, 150, 170),
    k.area(),
    k.fixed(),
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

  // Cutscene toggle (only shown after player has seen all cutscenes)
  if (hasSeenAllCutscenes()) {
    let showCutscenes = getShowAllCutscenes();
    const getCheckboxText = () => showCutscenes ? '☑ Show all cutscenes' : '☐ Show all cutscenes';

    const cutsceneToggle = k.add([
      k.text(getCheckboxText(), { size: 14 }),
      k.pos(config.screen.width / 2, config.screen.height - 25),
      k.anchor('center'),
      k.color(showCutscenes ? 180 : 100, showCutscenes ? 180 : 100, showCutscenes ? 200 : 120),
      k.area(),
    ]);

    cutsceneToggle.onClick(() => {
      arrowClicked = true; // Prevent starting game
      showCutscenes = !showCutscenes;
      setShowAllCutscenes(showCutscenes);
      cutsceneToggle.text = getCheckboxText();
      cutsceneToggle.color = k.rgb(
        showCutscenes ? 180 : 100,
        showCutscenes ? 180 : 100,
        showCutscenes ? 200 : 120
      );
    });
  }

  // Setup audio settings
  setupAudioSettings(k, true);

  // Go to title screen on input
  const startGame = () => {
    if (isAudioSettingsVisible()) return;
    if (arrowClicked) return;
    hideMenuLogo();
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
    hideMenuLogo();
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
