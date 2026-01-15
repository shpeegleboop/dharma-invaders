# Dharma Invaders — Development Roadmap

*Bird's eye view from current state through V2. For implementation details, see SESSION_HANDOFF.md.*

---

## Version Overview

```
V1: Roguelike Arena Shooter (CURRENT)
├── Phases 1-5: ✅ COMPLETE
├── Phases 6-10: IN PROGRESS
└── Goal: Shippable game, 3-5 hours gameplay

V1.5: The Three Realms (FUTURE)
├── Naraka, Human, Deva realms
├── Karma-based realm selection
└── Goal: 10-15 hours gameplay

V2: The Grand Vision (DISTANT FUTURE)
├── Full Buddhist cosmology
├── Player archetypes
├── Fresh architecture
└── Goal: 20-50+ hours, team effort
```

---

## V1: Current State

**Status:** Phases 1-5 complete, Phase 6 next

### Completed ✅

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Karma split + rebirth overlay | `gameStore.ts` with karmaTotal/karmaThisLife, tier calculation |
| 2 | 4 basic Pāramīs | Dāna (+25% drops), Viriya (+10% fire rate), Mettā (+1 HP), Upekkhā (-10% enemy speed) |
| 3 | 4 basic Kleshas | Lobha (-25% drops), Dosa (+10% enemy speed), Māna (-1 HP), Vicikicchā (-10% fire rate) |
| 4 | HUD icons | Bottom bar shows paramis (green) / kleshas (red) with stack counts |
| 5 | Kalpa system | Bodhisattva mode, logarithmic scaling (2.25x max), Four Noble Truths rotation |

### Architecture Verified ✅

- Event bus pattern (maraCombat refactored)
- Module singleton state (gameStore.ts)
- Delta time consistent
- Config-driven values
- No circular dependencies

---

## V1: Remaining Phases

### Phase 6: Balance + Remaining Buffs/Debuffs — NEXT

**Goal:** Complete the full 10 Pāramīs and 10 Kleshas, tune difficulty curves.

#### Remaining Pāramīs (6)

| Pāramī | Effect | Integration |
|--------|--------|-------------|
| **Sīla** (Virtue) | Start each life with Meditation shield | Auto-grant on respawn |
| **Khanti** (Patience) | +20% powerup duration | `powerupEffects.ts` |
| **Paññā** (Wisdom) | +1 projectile damage | `projectile.ts` |
| **Sacca** (Truthfulness) | See enemy health bars | Enemy render |
| **Adhiṭṭhāna** (Determination) | +1s respawn invincibility | `player.ts` |
| **Nekkhamma** (Renunciation) | +0.5x karma multiplier | `karma.ts` |

#### Remaining Kleshas (6)

| Klesha | Effect | Integration |
|--------|--------|-------------|
| **Moha** (Delusion) | -20% powerup duration | `powerupEffects.ts` |
| **Thīna** (Torpor) | -10% player speed | `player.ts` |
| **Uddhacca** (Restlessness) | Longer screenshake | Polish phase |
| **Ahirika** (Shamelessness) | No respawn invincibility | `player.ts` |
| **Anottappa** (Recklessness) | -1 projectile damage (min 1) | `projectile.ts` |
| **Micchādiṭṭhi** (Wrong View) | -0.25x karma multiplier | `karma.ts` |

#### Balance Tasks

- [ ] Playtest kalpas 1-5, note difficulty spikes
- [ ] Tune karma thresholds if too harsh/generous
- [ ] Verify game winnable with max debuffs
- [ ] Dynamic fire rate cap (currently hardcoded 0.2x floor)

---

### Phase 7: New Enemy Types

**Goal:** Add 3 enemies that unlock in later kalpas, increasing variety not volume.

#### Naraka (Hell Beings) — Kalpa 2+, after 45s

```typescript
{
  behavior: 'charge',      // Pause → aim → charge
  speed: 200,              // Fast when charging
  health: 1,
  karmaValue: 15,
  color: '#FF4500'         // Orange-red
}
```

**Pattern:** Spawn → pause 1s → lock onto player → charge straight → repeat if missed

#### Animal (Tiryagyoni) — Kalpa 3+, after 60s

```typescript
{
  behavior: 'swarm',       // Group movement toward player
  speed: 60,               // Slow but persistent
  health: 1,
  karmaValue: 5,           // Low karma (not malicious)
  spawnCount: 5,           // Always in groups
  color: '#8B4513'         // Brown
}
```

**Pattern:** Simple tracking with slight randomness, clumps naturally

#### Human (Manuṣya) — Kalpa 4+, after 90s

```typescript
{
  behavior: 'wander',      // Random movement, avoids player
  speed: 80,
  health: 1,
  karmaValue: -50,         // LOSE karma for killing
  karmaForSparing: 100,    // GAIN karma if they escape
  escapeTime: 10000,       // Despawn after 10s
  color: '#FFE4B5'         // Skin tone
}
```

**Design:** Tests restraint, reinforces non-harm principle. High risk (gets in way) for high reward.

#### Integration

- Update `spawner.ts` to check kalpa + elapsed time
- Add enemy configs to `config.json`
- Handle Human despawn → karma grant
- Handle Human killed → karma penalty (+ extra Klesha on rebirth?)

---

### Phase 8: Boss Evolution

**Goal:** Mara gains new attacks per kalpa, keeping boss fights fresh.

| Kalpa | New Attack | Description |
|-------|------------|-------------|
| 1 | (Base) | Aimed projectiles, minion spawns, phase 3 speed |
| 2 | **Spread Shot** | 5 projectiles in 90° arc, every 3rd attack |
| 3 | **Sweep Beam** | Horizontal line of 10 projectiles |
| 4+ | **Rage Mode** | Start at phase 3 speed, spawn Asura minions |

#### Implementation

```typescript
// maraCombat.ts
function bossAttack() {
  const kalpa = getCycle();
  const roll = Math.random();

  if (kalpa >= 2 && roll < 0.33) spreadShot();
  else if (kalpa >= 3 && roll < 0.5) sweepBeam();
  else aimedShot();
}

function spawnMinions() {
  const kalpa = getCycle();
  const type = kalpa >= 4 ? 'asura' : 'hungryGhost';
  events.emit('boss:spawnMinion', { x, y, type });
}
```

> **Note:** Current implementation uses `{ x, y }` only. When implementing Phase 8,
> expand event to `{ x, y, type }` and update `spawner.ts` to handle different minion types.

---

### Phase 9: Cutscenes

**Goal:** Add narrative moments at key game states.

#### Trigger System (State-Driven)

| Trigger | Flag | When | Purpose |
|---------|------|------|---------|
| **Intro** | `hasSeenIntro` | First game start | World introduction |
| **First Death** | `hasSeenFirstDeath` | After first death ever | Explain rebirth |
| **Boss Intro** | `hasSeenBossIntro` | Wave 8 complete, first time | Build tension |
| **Victory** | `hasSeenVictory` | First Mara defeat | Celebrate |
| **Bodhisattva** | `hasSeenBodhisattva` | First Continue choice | Explain continuing |
| **Mara Returns** | (kalpa check) | Kalpa 2+ wave 8 complete | "He returns..." |

#### Architecture

- `src/systems/cutscene.ts` — Overlay system
- `src/data/cutscenes.json` — Data-driven content
- Flags stored in `gameStore.ts`
- Simple: background + character sprite + text box + click to advance

#### Placeholder Content

**Intro:** "The wheel of samsara turns endlessly..."  
**First Death:** "Death is not the end—it is transformation."  
**Boss Intro:** "Mara, the demon of illusion, blocks your path."  
**Victory:** "Mara is defeated... for now."  
**Bodhisattva:** "You choose to return for the sake of all beings."  
**Mara Returns:** "Mara returns, stronger than before."

---

### Phase 10: Polish & Art

**Goal:** Add juice, integrate Buddhist text, music unlocks, balance pass.

#### Screen Effects

- [ ] Screenshake on player/boss damage (`k.shake(5)`)
- [ ] Flash white on damage
- [ ] Slow-mo on boss defeat (`k.timeScale(0.2)` for 1s)

#### Particles

- [ ] Enemy death explosions (5-10 colored particles)
- [ ] Powerup collection sparkles
- [ ] Projectile trails (optional)

#### Feel Improvements

- [ ] Input buffering during cooldowns
- [ ] Generous hitboxes (player smaller than sprite)
- [ ] Karma counter smooth animation

#### Buddhist Text Integration

**Wave Names (Eightfold Path):**
```json
["Right View", "Right Intention", "Right Speech", "Right Action",
 "Right Livelihood", "Right Effort", "Right Mindfulness", "Right Concentration"]
```

**Death Screen (Dependent Origination):**
```
"From ignorance arose formations.
From formations arose consciousness.
The wheel turns..."
```

#### Music Track Unlocks

- [ ] Create `src/systems/persistence.ts` (localStorage wrapper)
- [ ] Add `musicTracks` array to config.json with unlock conditions
- [ ] On kalpa complete: check if new track unlocked, save
- [ ] Add track selector to menu.ts
- [ ] Tracks persist across sessions

#### Victory Screen Updates

- Show total deaths
- Show accumulated Pāramīs/Kleshas
- Variant text based on performance:
  - 0 deaths: "Perfect liberation"
  - 5+ Kleshas: "You have escaped... but at what cost?"

---

## V1 Complete Checklist

Before declaring V1 shippable:

### Core Loop
- [ ] Death → Rebirth → Continue flows smoothly
- [ ] Karma split tracks correctly
- [ ] All 6 tiers grant correct buffs/debuffs
- [ ] Stacking works multiplicatively

### Buffs/Debuffs
- [ ] All 10 Pāramīs implemented
- [ ] All 10 Kleshas implemented
- [ ] HUD shows all active effects

### Kalpas
- [ ] Bodhisattva mode increments kalpa
- [ ] Scaling affects enemies/boss correctly
- [ ] Parinirvana always accessible

### Enemies
- [ ] Naraka spawns kalpa 2+ after 45s
- [ ] Animal spawns kalpa 3+ after 60s
- [ ] Human spawns kalpa 4+ after 90s
- [ ] Human karma mechanics work

### Boss
- [ ] Spread shot appears kalpa 2+
- [ ] Sweep beam appears kalpa 3+
- [ ] Rage mode kalpa 4+

### Cutscenes
- [ ] All 6 triggers work
- [ ] Flags prevent re-showing tutorials
- [ ] Mara Returns shows every kalpa 2+

### Polish
- [ ] Screenshake feels good
- [ ] Buddhist text integrated
- [ ] Music unlocks persist
- [ ] Balance tested through kalpa 5+

---

## V1.5: The Three Realms

*Do not implement until V1 ships.*

### Concept

Expand to 3 distinct gameplay modes. Karma determines starting realm.

```
V1.5: "Dharma Invaders: The Three Realms"
├── Naraka (8 levels) — Brutal difficulty, fire/ice themes
├── Human (V1 game, polished)
├── Deva (8 levels) — Bullet heaven, overwhelming power
└── Karma at death determines next realm
```

### Realm Selection

| Karma at Death | Starting Realm | Difficulty |
|----------------|----------------|------------|
| Negative | Naraka | Brutal |
| Neutral | Human | Balanced |
| Positive | Deva | Chaotic but powerful |

### Naraka Realm

- Fire/ice themed enemies
- Temperature meter (too hot/cold = damage)
- Boss: Yama (Judge of the Dead)
- Goal: Survive and purify to rise to Human

### Deva Realm

- Bullet heaven style (overwhelming enemies, overwhelming power)
- Permanent powerups but shorter duration
- No boss (transcendence challenge)
- Risk: Falling to lower realm on death

### Feasibility

- Achievable with current V1 architecture
- 3 scene sets, shared systems
- Could ship in months
- Proof-of-concept for V2

---

## V2: The Grand Vision

*Multi-year project. Fresh architecture informed by V1/V1.5 lessons.*

### Concept

Full Buddhist cosmology as roguelike journey through existence.

### Scope

```
ARC 1: NARAKA (Hell Realms)
├── 8 Hot Narakas, 8 Cold Narakas
└── Boss: Yama

ARC 2: HUMAN REALM (V1 Expanded)
├── 8 Waves × N Cycles
└── Boss: Mara

ARC 3: DEVA REALMS (Heavenly)
├── 6 Desire + 4 Form + 4 Formless Heavens
└── Transcendence challenge (no boss)
```

### New Systems

- **Player Archetypes:** Monk, Bodhisattva, Warrior, Spirit, Penitent
- **Realm Transitions:** Karma determines which realm on death
- **Save/Persistence:** Cross-session progression
- **Narrative Framework:** Cutscenes, dialogue, branching paths

### Build vs. Rebuild

V2 starts fresh but copies proven patterns:
- ✅ Event bus
- ✅ Config-driven values
- ✅ Entity/enemy pattern
- ✅ Pāramī/Klesha system
- 🔄 Multi-realm architecture from day one
- 🔄 Proper save system
- 🔄 Archetype/class system

### Timeline Reality

| Version | Scope | Timeline | Solo? |
|---------|-------|----------|-------|
| V1 | Roguelike arena shooter | Weeks | ✅ Yes |
| V1.5 | Three Realms | Months | ✅ Yes |
| V2 | Full cosmology | Years | ⚠️ Team |

---

## Document Hierarchy

| Doc | Purpose | When to Read |
|-----|---------|--------------|
| **SESSION_HANDOFF.md** | Implementation details, current state | Every session |
| **ROADMAP.md** | Bird's eye view, phase planning | Planning sessions |
| **VISION.md** | Design philosophy, "why" | When questioning decisions |
| **FUTURE_IDEAS.md** | Post-V1 features, detailed specs | After V1 ships |
| **CLAUDE.md** | Architecture rules | When coding |
| **LORE.md** | Buddhist concepts | When adding themed content |
| **AUDIO.md** | Audio file reference | When working on audio |

---

## Quick Reference: Current Task

```
Phase 6: Balance + Remaining Buffs/Debuffs

Key files:
- src/systems/rebirthEffects.ts
- src/systems/cycleScaling.ts
- src/data/config.json

Tasks:
1. Add 6 remaining Pāramīs
2. Add 6 remaining Kleshas
3. Playtest kalpas 1-5
4. Tune scaling curves
5. Dynamic fire rate cap
```

---

*Ship V1. Then dream of Three Realms.* 🪷
