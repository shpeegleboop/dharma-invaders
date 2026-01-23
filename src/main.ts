// Entry point - initializes Kaplay and registers all scenes
import kaplay from 'kaplay';
import config from './data/config.json';
import { createMenuScene } from './scenes/menu';
import { createGameScene } from './scenes/game';
import { createGameOverScene } from './scenes/gameOver';
import { createNirvanaScene } from './scenes/nirvana';
import { createCreditsScene } from './scenes/credits';
import { createAboutScene } from './scenes/about';
import { createTitleScreen } from './scenes/titleScreen';
import { initAudio } from './systems/audio';
// gameStore imports persistence and calls loadSave() on module init
import './stores/gameStore';

// Initialize Kaplay with game config
const k = kaplay({
  width: config.screen.width,
  height: config.screen.height,
  background: [26, 26, 46], // #1a1a2e
  global: false,
});

// Load sprites
k.loadSprite('sufferScreen', '/sprites/suffer_sharp.jpg');
k.loadSprite('raflinens', '/sprites/raflinens.jpg');

// Register scenes
k.scene('menu', () => createMenuScene(k));
k.scene('game', () => createGameScene(k));
k.scene('gameOver', (karma: number) => createGameOverScene(k, karma));
k.scene('nirvana', (karma: number) => createNirvanaScene(k, karma));
k.scene('credits', () => createCreditsScene(k));
k.scene('about', (data) => createAboutScene(k, data));
k.scene('titleScreen', () => createTitleScreen(k));

// Click-to-start scene (unlocks audio on user interaction)
k.scene('start', () => {
  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(15, 15, 30),
  ]);

  const prompt = k.add([
    k.text('Click to Begin', { size: 32 }),
    k.pos(config.screen.width / 2, config.screen.height / 2),
    k.anchor('center'),
    k.color(255, 215, 0),
    k.opacity(1),
  ]);

  prompt.onUpdate(() => {
    prompt.opacity = 0.5 + Math.sin(k.time() * 2) * 0.5;
  });

  const startGame = () => {
    initAudio(); // Initialize audio AFTER user interaction
    k.go('menu');
  };

  k.onMousePress(startGame);
  k.onKeyPress(startGame);
});

// Start at click-to-start screen
k.go('start');
