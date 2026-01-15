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

// Initialize audio system
initAudio();

// Initialize Kaplay with game config
const k = kaplay({
  width: config.screen.width,
  height: config.screen.height,
  background: [26, 26, 46], // #1a1a2e
  global: false,
});

// Load sprites
k.loadSprite('sufferScreen', '/sprites/suffer_sharp.jpg');

// Register scenes
k.scene('menu', () => createMenuScene(k));
k.scene('game', () => createGameScene(k));
k.scene('gameOver', (karma: number) => createGameOverScene(k, karma));
k.scene('nirvana', (karma: number) => createNirvanaScene(k, karma));
k.scene('credits', () => createCreditsScene(k));
k.scene('about', () => createAboutScene(k));
k.scene('titleScreen', () => createTitleScreen(k));

// Start at menu
k.go('menu');
