// Entry point only - initializes Kaplay and loads game scene
import kaplay from 'kaplay';
import config from './data/config.json';
import { createGameScene } from './scenes/game';

// Initialize Kaplay with game config
const k = kaplay({
  width: config.screen.width,
  height: config.screen.height,
  background: [26, 26, 46], // #1a1a2e
  global: false,
});

// Register scenes
k.scene('game', () => createGameScene(k));

// Start the game scene
k.go('game');
