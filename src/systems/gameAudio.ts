// Game audio event wiring - connects game events to sound effects
import { events } from '../utils/events';
import { playMusic, playSFX } from './audio';

export function setupGameAudio(): void {
  // Combat sounds
  events.on('projectile:fired', () => {
    playSFX('shoot');
  });

  events.on('enemy:killed', () => {
    playSFX('enemy_death');
  });

  // Player sounds
  events.on('player:hit', () => {
    playSFX('player_hit');
  });

  events.on('player:died', () => {
    playSFX('player_death');
  });

  // Powerup sounds - play specific sound based on type
  events.on('player:powerup', (data) => {
    const type = data.type as string;
    switch (type) {
      case 'compassion':
        playSFX('powerup_compassion');
        break;
      case 'wisdom':
        playSFX('powerup_wisdom');
        break;
      case 'patience':
        playSFX('powerup_patience');
        break;
      case 'diligence':
        playSFX('powerup_diligence');
        break;
      case 'meditation':
        playSFX('powerup_meditation');
        break;
    }
  });

  events.on('powerup:shieldBroken', () => {
    playSFX('shield_break');
  });

  // Wave sounds
  events.on('wave:complete', () => {
    playSFX('wave_complete');
  });

  // Boss sounds
  events.on('boss:started', () => {
    playSFX('boss_enter');
    playMusic('boss');
  });

  events.on('boss:phaseChange', () => {
    playSFX('boss_phase');
  });

  events.on('boss:defeated', () => {
    playSFX('boss_death');
  });
}
