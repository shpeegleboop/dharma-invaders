# Dharma Invaders — Future Ideas

*Everything that doesn't ship in V1. Reference this after V1 is complete.*

**Status:** These are ideas, not commitments. V1 ships first.

---

## Table of Contents

1. [V1 Polish (Low Effort, High Impact)](#v1-polish)
2. [New Enemy Types](#new-enemy-types)
3. [Buddhist Text Integration](#buddhist-text-integration)
4. [Remaining Pāramīs & Kleshas](#remaining-paramis--kleshas)
5. [V1.5: The Three Realms](#v15-the-three-realms)
6. [V2: The Grand Vision](#v2-the-grand-vision)
7. [Build vs. Rebuild Assessment](#build-vs-rebuild-assessment)

---

## V1 Polish

Low-effort additions after core roguelike system works:

### Screen Effects
| Effect | Impact | Implementation |
|--------|--------|----------------|
| Screenshake on hits | High | `k.shake(5)` on player/boss damage |
| Flash white on damage | Medium | Brief color override |
| Slow-mo on boss defeat | High | `k.timeScale(0.2)` for 1 second |

### Particles
| Particle | Impact | Notes |
|----------|--------|-------|
| Enemy death explosions | High | 5-10 colored particles |
| Powerup collection sparkles | Medium | Radial burst |
| Projectile trails | Medium | Fading tail |

### Feel Improvements
| Improvement | Impact | Notes |
|-------------|--------|-------|
| Input buffering | Medium | Queue inputs during cooldowns |
| Generous hitboxes | High | Player hitbox smaller than sprite |
| Karma counter animation | Medium | Smooth number rolling |

---

## New Enemy Types

### Naraka (Hell Beings) — Cycle 2+

**Concept:** Fast, aggressive chargers. Represent torment and urgency.

```typescript
// src/entities/enemies/naraka.ts
{
  type: 'naraka',
  behavior: 'charge',      // Pause, aim at player, charge in straight line
  speed: 200,              // Fast when charging
  health: 1,
  karmaValue: 15,
  color: '#FF4500',        // Orange-red (fire)
  size: { width: 20, height: 20 },
  chargeDelay: 1000,       // ms before charging
  chargeDuration: 500      // ms of charge
}
```

**Movement Pattern:**
1. Spawn and pause for 1 second
2. Lock onto player position
3. Charge in straight line at 2x speed
4. If missed, pause and repeat

### Animal (Tiryagyoni) — Cycle 3+

**Concept:** Swarm enemies. Weak individually, dangerous in groups.

```typescript
// src/entities/enemies/animal.ts
{
  type: 'animal',
  behavior: 'swarm',       // Move as group toward player
  speed: 60,               // Slow but persistent
  health: 1,
  karmaValue: 5,           // Low karma (they're not malicious)
  color: '#8B4513',        // Brown
  size: { width: 12, height: 12 },
  spawnCount: 5            // Always spawn in groups
}
```

**Movement Pattern:**
- Simple tracking toward player
- Slight randomness in direction
- Clumps together naturally

### Human (Manuṣya) — Cycle 4+

**Concept:** Non-hostile beings. High karma reward for NOT killing them.

```typescript
// src/entities/enemies/human.ts
{
  type: 'human',
  behavior: 'wander',      // Random movement, avoids player
  speed: 80,
  health: 1,
  karmaValue: -50,         // LOSE karma for killing
  karmaForSparing: 100,    // GAIN karma if they escape
  color: '#FFE4B5',        // Skin tone
  size: { width: 24, height: 24 },
  escapeTime: 10000        // Despawn after 10s if alive
}
```

**Design Intent:**
- Tests player's restraint
- Aligns with Buddhist non-harm principle
- High risk (gets in the way) for high reward (karma bonus)
- Killing them grants Kleshas in rebirth

---

## Buddhist Text Integration

### Wave Names (Eightfold Path)

Display during wave transitions: *"Wave 3: Right Speech"*

```json
"waves": {
  "names": [
    "Right View",
    "Right Intention",
    "Right Speech",
    "Right Action",
    "Right Livelihood",
    "Right Effort",
    "Right Mindfulness",
    "Right Concentration"
  ]
}
```

### Victory Text (Four Noble Truths)

Cycle through on each Mara defeat:

```typescript
function getVictoryQuote(cycle: number): string {
  const truths = [
    "Life is suffering. You have witnessed this truth.",
    "Suffering arises from attachment. You have released your grip.",
    "Suffering can end. You have glimpsed the cessation.",
    "The path exists. You have walked it.",
  ];
  return truths[(cycle - 1) % 4];
}
```

### Death Screen (Dependent Origination)

```
"From ignorance arose formations.
From formations arose consciousness.
From consciousness arose name-and-form.

Your karma: 847. Your attachments: 3 Kleshas.
The wheel turns..."
```

### Loading Screen Quotes (Three Marks of Existence)

```json
"loadingQuotes": [
  "All conditioned things are impermanent. (Anicca)",
  "All conditioned things are unsatisfactory. (Dukkha)",
  "All phenomena are not-self. (Anattā)",
  "Mind is the forerunner of all actions.",
  "Hatred is never appeased by hatred in this world.",
  "Peace comes from within. Do not seek it without.",
  "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go."
]
```

---

## Remaining Pāramīs & Kleshas

### Pāramīs Not Yet Implemented

| Pāramī | Effect | Implementation |
|--------|--------|----------------|
| **Sīla** (Virtue) | Start each life with Meditation shield | Auto-grant powerup on respawn |
| **Khanti** (Patience) | +20% powerup duration | Multiply `powerup.duration` |
| **Paññā** (Wisdom) | +1 projectile damage | Add to `projectile.damage` |
| **Sacca** (Truthfulness) | See enemy health bars | Render HP above enemies |
| **Adhiṭṭhāna** (Determination) | +1s respawn invincibility | Add to `respawnInvincibility` |
| **Nekkhamma** (Renunciation) | +0.5x karma multiplier | Multiply karma gains |

### Kleshas Not Yet Implemented

| Klesha | Effect | Implementation |
|--------|--------|----------------|
| **Moha** (Delusion) | -20% powerup duration | Reduce `powerup.duration` |
| **Thīna** (Torpor) | -10% player speed | Multiply `player.speed` |
| **Uddhacca** (Restlessness) | Longer screenshake | Extend shake duration |
| **Ahirika** (Shamelessness) | No respawn invincibility | Set `respawnInvincibility` to 0 |
| **Anottappa** (Recklessness) | -1 projectile damage (min 1) | Subtract from damage |
| **Micchādiṭṭhi** (Wrong View) | -0.25x karma multiplier | Reduce karma gains |

---

## V1.5: The Three Realms

**Concept:** Expand to 3 distinct gameplay modes based on karma.

### Structure

```
V1.5: "Dharma Invaders: The Three Realms"
├── Naraka (8 levels) — Punishing difficulty, fire/ice themes
├── Human (current game, polished)
├── Deva (8 levels) — Bullet heaven, overwhelming power
└── Karma determines starting realm
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

- Achievable with current architecture (3 scene sets)
- Could ship in months, not years
- Proof-of-concept for V2

---

## V2: The Grand Vision

**Concept:** Full Buddhist cosmology as roguelike journey through existence.

### The Thirty-One Planes (Simplified to 3 Arcs)

```
ARC 1: NARAKA (Hell Realms)
├── 8 Hot Narakas (fire-themed levels)
├── 8 Cold Narakas (ice-themed levels)
└── Boss: Yama (Judge of the Dead)

ARC 2: HUMAN REALM (Current Game, Expanded)
├── 8 Waves × N Cycles
├── Progressive enemy/buff unlocks
└── Boss: Mara (Demon of Illusion)

ARC 3: DEVA REALMS (Heavenly)
├── 6 Desire Realm Heavens
├── 4 Form Realm Heavens
├── 4 Formless Realm Heavens
└── Boss: None (Transcendence challenge)
```

### Karma Flow Between Realms

```
                    ┌─────────────────┐
                    │   FORMLESS      │ ← Transcendence
                    │    REALMS       │    (No enemies, pure meditation)
                    └────────┬────────┘
                             │ Extreme positive karma
                    ┌────────┴────────┐
                    │      DEVA       │ ← Beautiful but temporary
                    │     REALMS      │    (Bullet heaven style)
                    └────────┬────────┘
                             │ High karma
    ┌──────────────┬─────────┴─────────┬──────────────┐
    │              │                   │              │
    ▼              ▼                   ▼              ▼
 ANIMAL         HUMAN              ASURA          HUNGRY
 REALM          REALM              REALM          GHOST
(Swarm         (Current           (Warrior       (Resource
 survival)      game)              combat)        scarcity)
    │              │                   │              │
    └──────────────┴─────────┬─────────┴──────────────┘
                             │ Negative karma
                    ┌────────┴────────┐
                    │     NARAKA      │ ← Punishment/purification
                    │     REALMS      │    (Brutal difficulty)
                    └─────────────────┘
```

### Player Archetypes

| Archetype | Starting Realm | Special Ability | Theme |
|-----------|----------------|-----------------|-------|
| **Monk** | Human | Meditation shield regenerates | Discipline |
| **Bodhisattva** | Human | Gains karma for NOT killing | Compassion |
| **Warrior** | Asura | Double damage, half karma | Violence |
| **Spirit** | Hungry Ghost | Drains enemy HP on contact | Hunger |
| **Penitent** | Naraka | Starts with Kleshas, removes through play | Redemption |

### Realm-Specific Mechanics

| Realm | Unique Mechanic |
|-------|-----------------|
| **Naraka** | Temperature meter — too hot/cold = damage |
| **Animal** | No shooting — must dodge and survive for time |
| **Hungry Ghost** | Resources (powerups) are scarce and contested |
| **Human** | Current game — balanced combat |
| **Asura** | Aggressive enemies, multiplied rewards |
| **Deva** | Bullet heaven — overwhelming enemies, overwhelming power |
| **Formless** | No visuals — audio-only meditation minigame |

### Progression Model

```
New Game
    │
    ▼
[Choose Archetype]
    │
    ▼
[Start in assigned realm]
    │
    ├── Die with negative karma → Fall to lower realm
    ├── Die with positive karma → Rise to higher realm
    └── Achieve enlightenment → True ending

The goal: Ascend through all realms to reach Nirvana
Or: Accept the cycle and become a Bodhisattva (endless mode)
```

---

## Build vs. Rebuild Assessment

### What V1 Architecture Handles Well

| System | Extensibility |
|--------|---------------|
| Event bus | ✅ Scales infinitely |
| Config-driven values | ✅ Just add more JSON |
| Scene system | ✅ Add more scenes |
| Entity/enemy pattern | ✅ Add more enemy types |
| Pāramī/Klesha system | ✅ Add more buffs/debuffs |
| Wave spawning | ⚠️ Works but needs refactoring for realm variety |
| Boss pattern | ⚠️ Works for Mara, needs abstraction for multiple bosses |

### What Would Need Significant Refactoring

| System | Issue | Effort |
|--------|-------|--------|
| Single-scene gameplay | V2 needs realm transitions mid-run | High |
| Fixed arena | Different realms = different arenas | Medium |
| Player entity | Archetypes need different base stats/abilities | Medium |
| Karma as score | Karma as realm-transition currency is more complex | Medium |

### What Would Need Complete Rewrite

| System | Why |
|--------|-----|
| Save/persistence | V2 needs cross-session progression |
| Meta-progression | Unlockables, achievements, persistent upgrades |
| Narrative system | Cutscenes, dialogue, branching paths |
| Audio system | Realm-specific music, adaptive audio |
| Visual theming | Each realm needs distinct art direction |

### Recommendation

```
V1 (Current) ────► V1 COMPLETE ────► V1.5 (Three Realms)
                        │
                        │ Use as reference
                        ▼
              V2 FRESH ARCHITECTURE
              (Informed by V1 lessons)
```

**V1 becomes:**
- A complete, shippable game
- A vertical slice proving the concept
- A reference implementation for V2
- Potentially a "Human Realm" module V2 could import

**V2 starts fresh with:**
- Multi-realm architecture from day one
- Proper save/load system
- Archetype/class system
- Narrative framework
- Copies proven patterns from V1 (event bus, config-driven, entity pattern)

---

## Scope Reality Check

| Version | Scope | Timeline | Achievable Solo? |
|---------|-------|----------|------------------|
| **V1** | Roguelike arena shooter | Weeks | ✅ Yes |
| **V1.5** | Three Realms expansion | Months | ✅ Yes |
| **V2** | Full cosmology, archetypes, narrative | Years | ⚠️ Team effort |

**The honest truth:**
- V1 is 3-5 hours of engaging gameplay
- V1.5 could be 10-15 hours
- V2 is 20-50+ hours — a multi-year project

---

## How to Use This Document

1. **Finish V1 first.** Don't read this during active development.
2. **After V1 ships:** Review this for V1.5 planning.
3. **Use V1 codebase** as reference architecture for V2.
4. **Prompt Claude Code** with: "Read FUTURE_IDEAS.md and implement [specific feature]"

---

## Claude Code Prompts (For Later)

### Implement Naraka Enemy

```
Read FUTURE_IDEAS.md section on Naraka enemies.

Create src/entities/enemies/naraka.ts:
- Charge behavior: pause, aim, charge in straight line
- Speed: 200 during charge
- Health: 1, Karma: 15
- Orange-red color (#FF4500)
- 1 second pause before each charge
- Integrate with cycle system (only spawns cycle 2+)

Follow architecture rules from SESSION_HANDOFF.md.
```

### Add Wave Names

```
Read FUTURE_IDEAS.md section on Buddhist Text Integration.

Add Eightfold Path wave names:
1. Add "names" array to waves.json
2. Display "Wave N: [Name]" during wave transitions in waveManager.ts
3. Style: fade in, hold 2 seconds, fade out

Keep under 150 lines. Use config.json for timing values.
```

---

*These ideas wait patiently. V1 ships first.* 🪷
