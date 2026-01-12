# Dharma Invaders — Audio Implementation Guide

*Reference for implementing audio system with Howler.js*

---

## File Structure

```
public/audio/
├── music/
│   ├── menu.wav          # Title screen - calm, inviting
│   ├── gameplay.wav      # Waves 1-8 - lofi, focused
│   ├── boss.wav          # Mara fight - intense, dramatic
│   ├── nirvana.wav       # Victory screen - peaceful, transcendent
│   └── gameover.wav      # Death screen - somber, reflective
└── sfx/
    ├── shoot.mp3                 # Player fires projectile
    ├── enemy_hit.mp3             # Enemy takes damage
    ├── enemy_death.mp3           # Enemy dies
    ├── player_hit.mp3            # Player takes damage
    ├── player_death.mp3          # Player dies
    ├── powerup_compassion.mp3    # Collect pink powerup
    ├── powerup_wisdom.mp3        # Collect blue powerup
    ├── powerup_patience.mp3      # Collect green powerup
    ├── powerup_diligence.mp3     # Collect gold powerup
    ├── powerup_meditation.mp3    # Collect purple powerup
    ├── shield_break.mp3          # Meditation shield destroyed
    ├── boss_enter.mp3            # Mara appears
    ├── boss_phase.mp3            # Boss phase transition
    ├── boss_death.mp3            # Mara defeated
    └── wave_complete.mp3         # Wave cleared
```

---

## Audio System Requirements

### Create `src/systems/audio.ts`

**Exports:**
- `initAudio()` — preload all audio files
- `playMusic(track: string)` — play looping music, stops previous
- `stopMusic()` — stop current music
- `playSFX(sound: string)` — play one-shot sound effect
- `setMusicVolume(vol: number)` — 0.0 to 1.0
- `setSFXVolume(vol: number)` — 0.0 to 1.0

**Music tracks:** `'menu' | 'gameplay' | 'boss' | 'nirvana' | 'gameover'`

**SFX sounds:** `'shoot' | 'enemy_hit' | 'enemy_death' | 'player_hit' | 'player_death' | 'powerup_compassion' | 'powerup_wisdom' | 'powerup_patience' | 'powerup_diligence' | 'powerup_meditation' | 'shield_break' | 'boss_enter' | 'boss_phase' | 'boss_death' | 'wave_complete'`

---

## Event-to-Audio Mapping

| Event | Audio |
|-------|-------|
| Scene: menu | playMusic('menu') |
| Scene: game starts | playMusic('gameplay') |
| 'boss:started' | playMusic('boss') |
| 'game:victory' | playMusic('nirvana') |
| 'game:over' | playMusic('gameover') |
| 'projectile:fired' | playSFX('shoot') |
| 'enemy:killed' | playSFX('enemy_death') |
| 'player:hit' | playSFX('player_hit') |
| 'player:died' | playSFX('player_death') |
| 'player:powerup' (compassion) | playSFX('powerup_compassion') |
| 'player:powerup' (wisdom) | playSFX('powerup_wisdom') |
| 'player:powerup' (patience) | playSFX('powerup_patience') |
| 'player:powerup' (diligence) | playSFX('powerup_diligence') |
| 'player:powerup' (meditation) | playSFX('powerup_meditation') |
| 'powerup:shieldBroken' | playSFX('shield_break') |
| 'boss:phaseChange' | playSFX('boss_phase') |
| 'boss:defeated' | playSFX('boss_death') |
| 'wave:complete' | playSFX('wave_complete') |

---

## Config.json Addition

```json
"audio": {
  "musicVolume": 0.5,
  "sfxVolume": 0.7
}
```

---

## Notes

- Music loops continuously until changed
- Only one music track plays at a time
- SFX can overlap (multiple enemies dying at once)
- shoot.mp3 should be very subtle — it plays constantly
- Volume settings will be saved to localStorage in future (save system)
- Pause menu with volume sliders planned for later

---

## File Extensions

Most files are `.mp3`. The following are `.wav`:
- `menu.wav`
- `boss.wav`
- `gameplay.wav`
- `nirvana.wav`
- `gameover.wav`
Howler.js handles both formats seamlessly.
