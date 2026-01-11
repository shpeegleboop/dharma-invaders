// Entry point only - just initializes Kaplay
import kaplay from 'kaplay';
import config from './data/config.json';

// Initialize Kaplay with game config
kaplay({
  width: config.screen.width,
  height: config.screen.height,
  background: [26, 26, 46], // #1a1a2e
  canvas: document.querySelector('canvas') || undefined,
  global: false,
});

// Placeholder - game scenes will be loaded here
console.log('Dharma Invaders initialized');
