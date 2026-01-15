# Dharma Invaders — Design Vision

*The "why" behind every decision. For implementation details, see SESSION_HANDOFF.md.*

---

## Core Design Philosophy

### 1. Thematic Integrity Over Feature Creep

Every game mechanic should reinforce Buddhist philosophy, not just wear it as a skin.

| Mechanic | Buddhist Concept | Why It Works |
|----------|------------------|--------------|
| Karma as currency | Cause and effect | Actions have consequences |
| Rebirth on death | Saṃsāra cycle | Death is transformation, not failure |
| Pāramīs (buffs) | Spiritual perfections | Skillful play cultivates virtue |
| Kleshas (debuffs) | Mental afflictions | Unskillful play accumulates suffering |
| Parinirvana | Final liberation | The goal is escape, not high score |
| Mara as boss | Demon of illusion | The final obstacle is self-deception |

**Principle:** If a feature doesn't connect to theme, question whether it belongs.

---

### 2. Liberation Is Never Gated

**Parinirvana (true ending) is ALWAYS available after defeating Mara.**

The choice to continue suffering (Bodhisattva Mode) or end it (Parinirvana) belongs to the player alone. This mirrors Buddhist philosophy: enlightenment is always accessible; we choose to remain in the cycle.

Special endings (deathless run, excessive deaths, high karma) are **achievements or variant text**, not gates. The door to liberation is never locked.

---

### 3. Difficulty Through Variety, Not Volume

**The Problem with Linear Scaling:**
- `1.5x enemies` creates chaos that overshadows new content
- Players can't appreciate new mechanics when overwhelmed
- Difficulty spikes feel unfair rather than challenging

**The Solution: Logarithmic Scaling with Caps**

Difficulty increases approach a ceiling, never exceeding it:
- Enemy speed caps at 1.5x base
- Enemy count caps at 1.3x base
- Boss HP caps at 2.0x base

**Extended Duration Instead of Enemy Spam:**

Each cycle adds 15 seconds to wave duration. Players face more total enemies, but the *density* remains manageable.

**New Enemy Unlocks Per Cycle:**

Variety increases over time. Cycle 2 introduces Naraka enemies, Cycle 3 introduces Animal swarms, etc. The game evolves rather than inflates.

---

### 4. Death Is Transformation

In traditional games, death is punishment. In Dharma Invaders, death is **rebirth**—a mechanical expression of Buddhist philosophy.

**The Rebirth Loop:**
1. Player dies
2. Karma earned "this life" determines rebirth quality
3. High karma → Pāramīs (buffs)
4. Low karma → Kleshas (debuffs)
5. Player returns to the cycle, transformed

**Why This Works:**
- Death doesn't feel punishing—it feels consequential
- Low-skill players can still progress (with accumulated debuffs)
- High-skill players are rewarded with power growth
- The game naturally adjusts difficulty to player performance

---

### 5. The Middle Way in Game Design

Balance extremes. Avoid both:
- **Too Easy:** No tension, no satisfaction
- **Too Hard:** Frustration, abandonment

**Mercy Rule:** 3 consecutive deaths without a kill = game over. This prevents infinite suffering without engagement.

**Generosity:** Hitboxes are slightly smaller than sprites. Brief invincibility after damage. Input buffering for responsive controls.

**Challenge:** Enemies scale with cycles. New attack patterns appear. Debuffs accumulate for struggling players.

---

## Visual & Audio Philosophy

### Aesthetic: Contemplative Arcade

The game should feel like:
- **Visually:** Clean, readable, with moments of beauty
- **Aurally:** Lofi beats, soft impacts, temple bells
- **Emotionally:** Focused intensity with peaceful undertones

Avoid:
- Chaotic visual noise
- Aggressive sound design
- Frustration-inducing feedback

### Placeholder First, Polish Last

Colored rectangles until the game is fun. Art is the final 20%, not the foundation.

---

## Scope Boundaries

### V1 Is (Current Focus)
- Single-player arena shooter
- One playable character
- One boss (Mara)
- 8 waves × N cycles
- Rebirth system with buffs/debuffs
- 3-5 hours of engaging gameplay
- **Shippable as a complete game**

### V1 Is NOT
- Multiple realms
- Character classes
- Branching narratives
- Multiplayer
- Endless content

**Scope creep is the #1 killer of indie games.** V1 ships complete before V1.5/V2 planning begins.

---

## Design Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Logarithmic scaling with caps | Linear scaling creates chaos | 2026-01-14 |
| Parinirvana always available | Liberation should never be gated | 2026-01-14 |
| Module singleton over Zustand | Zustand requires React, project doesn't use React | 2026-01-14 |
| Event bus for notifications only | State belongs in gameStore, not event payloads | 2026-01-14 |
| Extended duration over enemy spam | Variety > volume for difficulty | 2026-01-14 |
| New enemy unlocks per cycle | Keeps game fresh without overwhelming | 2026-01-14 |

---

## Guiding Questions

When adding a feature, ask:

1. **Does this reinforce Buddhist themes?** If not, reconsider.
2. **Does this increase variety or just volume?** Prefer variety.
3. **Does this respect the player's time?** Avoid padding.
4. **Can this be data-driven?** Put numbers in config, not code.
5. **Does this ship V1 faster?** If not, it belongs in FUTURE_IDEAS.md.

---

## The Vision Statement

> Dharma Invaders transforms the arcade shooter into a meditation on impermanence. Death is not failure—it is change. Victory is not domination—it is liberation. The player's journey mirrors the Buddhist path: accumulating karma, facing suffering, and ultimately choosing whether to escape or return for the sake of others.

---

*For implementation details, see SESSION_HANDOFF.md.*  
*For future expansion ideas, see FUTURE_IDEAS.md.*

🪷
