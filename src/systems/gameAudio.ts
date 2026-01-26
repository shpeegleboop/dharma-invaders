// Game audio event wiring - connects game events to sound effects
import { events } from '../utils/events';
import { playMusic, playSFX, type MusicTrack } from './audio';
import { getCycle } from '../stores/gameStore';
import { getSelectedBossTrack } from './persistence';

export function setupGameAudio(): void {
  // Combat sounds
  events.on('projectile:fired', () => {
    playSFX('shoot');
  });

  events.on('enemy:killed', (data) => {
    if (!data.silent) playSFX('enemy_death');
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
      case 'paduma':
        playSFX('powerup_paduma');
        break;
    }
  });

  events.on('powerup:shieldBroken', () => {
    playSFX('shield_break');
  });

  // Wave sounds - placeholder for future SFX
  events.on('wave:complete', () => {
    // No SFX yet
  });

  // Boss sounds - use player-selected track or kalpa-based default
  events.on('boss:started', () => {
    playSFX('boss_enter');
    const selectedTrack = getSelectedBossTrack();
    if (selectedTrack === 'default') {
      // Original kalpa-based behavior
      const kalpa = getCycle();
      if (kalpa >= 4) playMusic('boss4');
      else if (kalpa === 3) playMusic('boss3');
      else if (kalpa === 2) playMusic('boss2');
      else playMusic('boss');
    } else {
      playMusic(selectedTrack as MusicTrack);
    }
  });

  events.on('boss:phaseChange', () => {
    playSFX('boss_phase');
  });

  events.on('boss:defeated', () => {
    const kalpa = getCycle();
    if (kalpa === 4) {
      playSFX('boss_death_k4');
    } else {
      playSFX('boss_death');
    }
  });
}
