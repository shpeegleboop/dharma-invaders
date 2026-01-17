# Current Strategy — Phase 7 Planning

**Created:** 2026-01-16
**Updated:** 2026-01-16
**Status:** Phase 6 COMPLETE. Ready for Phase 7.

---

## Phase 6 Summary — COMPLETE ✅

All steps finished:

| Step | Task | Status |
|------|------|--------|
| 1 | 9 new Pāramīs/Kleshas | ✅ Complete |
| 2 | Health persistence across kalpas | ✅ Complete |
| 3 | Paduma healing powerup | ✅ Complete |
| 4 | Powerup stacking foundation | ✅ Complete |
| 5 | Parami/Klesha stack caps | ✅ Complete |
| 6 | About menus + bug fixes | ✅ Complete |

### Key Implementations

**Powerup Stacking:**
- Map-based state for multiple simultaneous powerups
- Diligence: (0.5)^stacks cooldown, max 3 stacks (8x fire rate)
- Patience: 10% additive slow per stack, max 5 stacks (50% slow)
- Compassion/Wisdom: Binary (on/off), time stacks to 40s max
- Shield: Uncapped charges, persists across kalpas

**Parami/Klesha Caps:**
```typescript
PARAMI_CAPS = {
  Dana: 1, Viriya: 5, Metta: 7, Upekkha: 5, Sila: 1,
  Khanti: 5, Panna: 2, Adhitthana: 1, Nekkhamma: 2, Sacca: 1
}
KLESHA_CAPS = {
  Lobha: 2, Dosa: 3, Mana: 5, Vicikiccha: 3,
  Moha: 2, Thina: 2, Anottappa: 1, Micchaditthi: 2
}
```

**New Parami:**
- Sacca (Truthfulness): +5% Paduma drop rate, max 1 stack

**About Menus:**
- Main menu: English translations, max stacks column, powerup sprites
- Pause menu: "QUALITIES OF MIND" title, Pali-only names, full effect descriptions

**Bug Fix:**
- Wisdom piercing now works when shield is active (uses `isPiercingActive()` instead of `getActivePowerup()`)

---

## Phase 7: New Enemy Types — NEXT

**Goal:** Add 3 enemies that unlock in later kalpas, increasing variety not volume.

### Naraka (Hell Beings) — Kalpa 2+, after 45s

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

### Animal (Tiryagyoni) — Kalpa 3+, after 60s

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

### Human (Manuṣya) — Kalpa 4+, after 90s

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

### Implementation Steps

1. Add enemy configs to `config.json`
2. Create `src/entities/enemies/naraka.ts`
3. Create `src/entities/enemies/animal.ts`
4. Create `src/entities/enemies/human.ts`
5. Update `spawner.ts` to check kalpa + elapsed time
6. Handle Human despawn → karma grant
7. Handle Human killed → karma penalty

---

## Phase 8: Boss Evolution

**Goal:** Mara gains new attacks per kalpa, keeping boss fights fresh.

| Kalpa | New Attack | Description |
|-------|------------|-------------|
| 1 | (Base) | Aimed projectiles, minion spawns, phase 3 speed |
| 2 | **Spread Shot** | 5 projectiles in 90° arc, every 3rd attack |
| 3 | **Sweep Beam** | Horizontal line of 10 projectiles |
| 4+ | **Rage Mode** | Start at phase 3 speed, spawn Asura minions |

---

## Debug Keys Reference

| Key | Action |
|-----|--------|
| F1 | Toggle hitbox visibility |
| F2 | Skip to wave 8 |
| F3 | Skip directly to boss |
| F4 | Cycle through powerups |
| F6 | Toggle invincibility |
| T/Y/U/I | Add Dana/Viriya/Metta/Upekkha |
| 1/2/3/4/5 | Add Sila/Khanti/Panna/Adhitthana/Nekkhamma |
| 0 | Add Sacca |
| G/H/J/K | Add Lobha/Dosa/Mana/Vicikiccha |
| 6/7/8/9 | Add Moha/Thina/Anottappa/Micchaditthi |
| M | Clear all paramis and kleshas |
| V | Heal player |

---

*Phase 6 complete. Onward to new realms.* 🪷
