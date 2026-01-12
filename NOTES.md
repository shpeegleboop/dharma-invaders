# Dharma Invaders — Design Notes

*Running document of ideas, decisions, and future plans. Update as development progresses.*

---

## Core Design Decisions (Implemented)

### Arena Shooter (NOT Classic Shmup)
- Player rotates to face mouse cursor
- Shoot toward cursor with click or spacebar
- Enemies spawn from ALL screen edges, not just top
- This affects wave design, spawner logic, balance — everything downstream

### HUD Layout
- Title ("Dharma Invaders") and Karma score on outer border, OUTSIDE gameplay area
- Gameplay canvas is separate from HUD chrome
- More HUD elements will be added to this border later (health, powerup indicators, wave number, etc.)

---

## Virtue Powerups (Implemented)

| Virtue | Color | Effect | Duration |
|--------|-------|--------|----------|
| Compassion | Pink (#FF69B4) | 3-way spread shot | 8s |
| Wisdom | Blue (#4169E1) | Shots pierce through enemies | 8s |
| Patience | Green (#32CD32) | Enemies move at 50% speed | 8s |
| Diligence | Gold (#FFD700) | 2x fire rate | 8s |
| Meditation | Purple (#9370DB) | Absorb 1 hit (shield) | Until hit or 8s |

Drop chance: 15% on enemy death. Collecting new powerup replaces current one.

---

## Future Ideas (Not Yet Implemented)

### Rebirth System
- On death, player is "rebirthed" with buffs/debuffs based on karma earned
- **Kleshas** (afflictions/debuffs): slower speed, weaker shots, shorter powerup duration, etc.
- **Paramitas** (perfections/buffs): faster speed, stronger shots, better drops, etc.
- Karma threshold determines ratio — high karma = more paramitas, low karma = more kleshas
- Creates risk/reward: do you play safe or push for more karma?

### No Permanent Death
- Dying triggers rebirth, not game over
- Player can always continue, but accumulates kleshas (debuffs)
- High karma = more paramitas, low karma = more kleshas on rebirth
- Theoretically beatable even dying every wave — just brutally hard
- "Game over" is reaching nirvana, not dying
- Skill expression: how clean can you get there?
- **Mercy rule:** 5 consecutive deaths with zero kills = actual game over (prevents infinite suffering)

### Mercy Rule Death (TO IMPLEMENT)
- Track consecutive deaths without kills
- Currently player just respawns indefinitely — no mercy rule enforcement yet
- When implementing: show special "game over" screen with Buddhist quote about persistence/trying again
- Reset counter on any enemy kill

### Mara Boss Ideas (Post-Implementation)
- Multiple attack styles (spread shots, sweeping beams, targeted bursts)
- Klesha projectiles that apply debuffs on hit (slowed, reversed controls, weakened shots)
- Arena hazards during phase 3
- Dramatic visual changes per phase
- Taunts/dialogue during fight
- Different music track for boss phase

### Level Progression & Story
- Multiple levels with increasing difficulty
- Story beats between levels or at milestones
- Cutscenes or dialogue scenes using `src/scenes/cutscene.ts` (to be created)
- Data-driven via `levels.json` and `story.json`

### Enemy Behavior (Later Waves)
- Enemies get faster in later waves
- More complex movement patterns
- Attack patterns (enemies that shoot back?)
- Mini-bosses before Mara?

### Powerup Polish
- Visual indicator when powerup is about to expire
- Consider stacking vs replacing — test single first, decide after playing
- Rare "enlightenment" powerup that clears screen?

### Title Screen / Menu
- Intro title screen before gameplay
- Sections: enemy bestiary, game lore/background, controls
- Maybe unlockable entries as you encounter enemies?

---

## Technical Notes

### Architecture Reminders
- Event bus for all cross-system communication
- All numbers in `config.json`, not hardcoded
- No file over 150 lines
- Commit after every working feature

### Event Listener Cleanup (Option B)
- Using `events.clear()` at scene start to prevent duplicate listeners
- Simple approach appropriate for single-scene game
- If we add persistent cross-scene systems later (audio manager, achievements), refactor those specific systems to Option A (manual unsubscribe per listener)
- Rationale: Option A is surgical but more code; Option B is clean slate, works for our current structure

### Placeholder Art (Current)
- Player: Blue 32x32 rectangle (rotates toward cursor)
- Enemies: Red/Orange/Purple rectangles by type
- Projectiles: Yellow rectangles (travel toward cursor direction)
- Powerups: Colored circles
- Mara: Dark red 64x64 rectangle

---

## Session Log

### Session 1 (Initial Build)
- [x] Phase 0: Project setup, folder structure, config.json, events.ts
- [x] Phase 1: Game shell, player movement, shooting
- [x] Design pivot: Arena shooter with mouse aiming
- [x] HUD moved to outer border
- [x] Phase 2: Enemy spawner, all 3 enemy types, collision, player health
- [x] Event listener audit — implemented Option B cleanup
- [x] Wave spawner with waves.json (8 waves)
- [x] Power-up drops + all 5 virtue effects
- [ ] Phase 4: Mara boss fight ← CURRENT

### Next Session Starting Point
Continue with Mara boss:
1. Create mara.ts with state machine (entering, phase1, phase2, phase3, defeated)
2. Boss projectiles that damage player
3. Health bar in HUD
4. Phase transitions at 70% and 30% health
5. Victory event on defeat

---

## Questions to Resolve Later
- How does karma persist between runs? High score only, or cumulative progression?
- Is there a "win" state beyond defeating Mara, or endless mode?
- Local multiplayer someday? (Probably not, but noting it)
