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
import { initOverlays } from './ui/htmlOverlays';
// gameStore imports persistence and calls loadSave() on module init
import './stores/gameStore';

// Initialize Kaplay with game config
const k = kaplay({
  width: config.screen.width,
  height: config.screen.height,
  background: [26, 26, 46], // #1a1a2e
  global: false,
  stretch: true, // Stretch canvas to fill browser window
  letterbox: true, // Maintain aspect ratio with letterboxing
  pixelDensity: window.devicePixelRatio || 2, // Crisp text on high-DPI displays
  texFilter: "linear", // Smooth scaling for photo images in cutscenes
});

// Move canvas into overlay container
initOverlays();

// Load sprites
k.loadSprite('sufferScreen', '/sprites/suffer_sharp.jpg');
k.loadSprite('raflinens', '/sprites/raflinens.jpg');
k.loadSprite('bhavachakra', '/sprites/bhavachakra_transparent.png');
k.loadSprite('sting', '/sprites/sting.jpg');
k.loadSprite('deathrebirth', '/sprites/deathrebirth.jpg');
k.loadSprite('hemad', '/sprites/hemad.jpg');
k.loadSprite('headback', '/sprites/headback.jpg');
k.loadSprite('bodhisattva', '/sprites/bodhisattva.jpg');
k.loadSprite('karma', '/sprites/karma.jpg');
k.loadSprite('bg1', '/sprites/bg1.jpg');
k.loadSprite('player', '/sprites/player.svg');
k.loadSprite('peta', '/sprites/peta.svg');
k.loadSprite('asura', '/sprites/asura.svg');
k.loadSprite('deva', '/sprites/deva.svg');
k.loadSprite('nerayika', '/sprites/nerayika.svg');
k.loadSprite('tiracchana', '/sprites/tiracchana.svg');
k.loadSprite('manussa', '/sprites/manussa.svg');
k.loadSprite('mara', '/sprites/mara.svg');
k.loadSprite('paduma', '/sprites/paduma.svg');
k.loadSprite('vajra', '/sprites/vajra.svg');
k.loadSprite('projectile', '/sprites/projectile.svg');
k.loadSprite('boss_projectile', '/sprites/boss_projectile.svg');
k.loadSprite('powerup_compassion', '/sprites/powerup_compassion.svg');
k.loadSprite('powerup_wisdom', '/sprites/powerup_wisdom.svg');
k.loadSprite('powerup_patience', '/sprites/powerup_patience.svg');
k.loadSprite('powerup_diligence', '/sprites/powerup_diligence.svg');
k.loadSprite('powerup_meditation', '/sprites/powerup_meditation.svg');

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
