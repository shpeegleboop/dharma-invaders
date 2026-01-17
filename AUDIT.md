# Dharma Invaders — Code Audit Report

**Date:** 2026-01-16
**Auditor:** Claude Opus 4.5
**Overall Grade:** B+

---

## Summary

The codebase is well-organized and follows most architectural rules. Main issues are file size violations (technical debt) and documentation drift in ROADMAP.md.

---

## 1. Architecture Rules Compliance

### Event Bus Pattern — PASS

No cross-entity direct imports. Systems import entities for spawn/damage, but entities never import other entities.

```
src/entities/*.ts → No imports from other entities
src/systems/collision.ts → Imports mara.ts for damageMara() (acceptable)
src/systems/spawner.ts → Imports mara.ts for spawnMara() (acceptable)
```

### Delta Time Usage — PASS

All 23 movement calculations use `* k.dt()`. No raw position increments found.

```
Verified in: player.ts, mara.ts, projectile.ts, bossProjectile.ts,
             hungryGhost.ts, asura.ts, deva.ts, powerup.ts, enemyFlee.ts
```

### Data-Driven Config — PASS

All speed, health, damage, and timing values come from `config.json`. No hardcoded magic numbers in logic files.

### Event Listener Cleanup — PASS

`events.clear()` called at start of `createGameScene()`.

---

## 2. File Size Rule Violations

**Rule:** No file over 150 lines.

| File | Lines | Over By | Priority |
|------|-------|---------|----------|
| `scenes/titleScreen.ts` | 261 | 111 | HIGH |
| `scenes/about.ts` | 201 | 51 | HIGH |
| `entities/player.ts` | 179 | 29 | MEDIUM |
| `entities/mara.ts` | 173 | 23 | MEDIUM |
| `ui/aboutOverlay.ts` | 166 | 16 | LOW |
| `systems/powerupEffects.ts` | 160 | 10 | LOW |
| `utils/debug.ts` | 156 | 6 | LOW |
| `ui/rebirthOverlay.ts` | 153 | 3 | LOW |
| `systems/collision.ts` | 152 | 2 | LOW |

**Recommended Splits:**

1. `titleScreen.ts` → Extract `titleScreenUI.ts` (button creation, layout)
2. `about.ts` → Extract `aboutContent.ts` (text/data definitions)
3. `player.ts` → Extract `playerInput.ts` or `playerMovement.ts`
4. `mara.ts` → Already has `maraCombat.ts`, could extract `maraMovement.ts`

---

## 3. Documentation Cross-Check

### SESSION_HANDOFF.md — ACCURATE

- Phase 6 progress correct (Steps 1-3 complete)
- Parami/Klesha lists match implementation
- Tech stack and architecture rules current

### CLAUDE.md — ACCURATE

- Includes Paduma powerup
- Debug keys 1-9, V documented
- player:healed event listed
- Build order updated

### ROADMAP.md — FIXED (this audit)

Previously had outdated Phase 6 tables. Updated to reflect:
- Correct effect descriptions (Adhiṭṭhāna = +1 shield charge)
- Deferred effects (Sacca, Ahirika, Uddhacca)
- Step-by-step progress with checkmarks
- Quick Reference now points to CURRENT_STRAT.md

### VISION.md — ACCURATE

Design philosophy unchanged, no conflicts.

### CURRENT_STRAT.md — ACCURATE

Step-by-step implementation plan current and correct.

---

## 4. Code Quality Observations

### Positives

- Clean separation of concerns (entities/systems/stores/ui)
- Consistent naming conventions
- Good use of TypeScript types
- Config-driven values throughout
- Event bus used correctly for cross-entity communication

### Minor Issues

1. **Unused imports warning** — `mara.ts` had `saveHealth` import removed (fixed)
2. **LF/CRLF warnings** — Git line ending inconsistency (cosmetic)
3. **Some long functions** — `createPlayer()` at ~80 lines could be split

### Potential Tech Debt

1. File size violations (see Section 2)
2. `powerupEffects.ts` becoming complex with shield charges
3. Multiple scene files have similar UI patterns (could extract shared components)

---

## 5. Recommended Actions

### Immediate (Before Phase 6 Step 4)

- [x] Update ROADMAP.md Phase 6 tables to match reality (DONE)

### Soon (During Balance Pass)

- [ ] Split `titleScreen.ts` into UI + logic
- [ ] Split `about.ts` into content + rendering
- [ ] Consider `playerMovement.ts` extraction

### Later (Phase 10 Polish)

- [ ] Standardize scene UI patterns
- [ ] Add shared component library for menus
- [ ] Address CRLF warnings in git config

---

## 6. Test Coverage Gaps

No automated tests exist. Consider adding for:

- Karma tier calculation (`rebirthTiers.ts`)
- Cycle scaling math (`cycleScaling.ts`)
- Parami/Klesha multiplier stacking (`rebirthEffects.ts`)

---

## 7. Security Review

**N/A** — Single-player offline game with no external data, user input, or network calls. No security concerns.

---

## Conclusion

The codebase is healthy for a solo project at this stage. The main technical debt is file sizes, which can be addressed incrementally. Documentation is mostly synchronized with one exception (ROADMAP.md).

**Recommendation:** Proceed with Phase 6 Step 4 (Powerup Stacking). Address file splits during the balance pass when touching those files anyway.

---

*Audit complete. Ready for PM review.*
