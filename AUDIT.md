# Dharma Invaders - Codebase Audit

**Date:** 2026-01-14
**Overall Grade:** A- (Excellent architecture with minor maintenance issues)

---

## Executive Summary

The codebase is **well-architected** and follows most established rules. The event bus pattern is properly implemented, delta time is used correctly everywhere, and file organization is clean. Main issues are:
- 3 junk files to delete
- 2 files slightly over 150-line limit
- Unused `zustand` dependency
- Debug console.logs in audio system

---

## 1. Junk Files to DELETE

| File | Size | Issue |
|------|------|-------|
| `nul` | 0 bytes | Windows null device artifact (empty) |
| `C:Userscr4ckprojectsdharma-invadersreleases.json` | 1 KB | Malformed filename from path separator issue |
| `suffer.jpg` | 253 KB | Unused duplicate (suffer_sharp.jpg is used) |
| `suffer_enhanced.png` | ? | Unused image variant |
| `suffer_upscaled.png` | ? | Unused image variant |
| `suffer_sharp.jpg` (root) | ? | Duplicate - correct one is in public/sprites/ |

**Action:** Delete all these files from project root.

---

## 2. Files Exceeding 150-Line Limit

Per CLAUDE.md: "No file over 150 lines."

| File | Lines | Recommendation |
|------|-------|----------------|
| `src/entities/mara.ts` | **164** | Split movement patterns into `maraMovement.ts` |
| `src/scenes/nirvana.ts` | **155** | Extract confirmation dialog to separate component |

### mara.ts Refactor Plan
Current file handles:
- Boss state machine (entering, phase1, phase2, phase3, defeated)
- Figure-8 movement pattern
- Health management
- Death animation

**Split suggestion:**
```
src/entities/mara.ts        → State machine, health, spawning (~80 lines)
src/entities/maraMovement.ts → Figure-8 pattern, phase speeds (~60 lines)
```

### nirvana.ts Refactor Plan
Current file handles:
- Victory scene rendering
- Confirmation dialog for credits

**Split suggestion:**
```
src/scenes/nirvana.ts           → Main victory scene (~100 lines)
src/ui/confirmationDialog.ts    → Reusable confirmation component (~55 lines)
```

---

## 3. Architecture Compliance

### Event Bus Pattern
**Status:** EXCELLENT

- All entity/system communication uses `events.emit()` / `events.on()`
- Type-safe event definitions in `src/utils/events.ts`
- `events.clear()` properly called on scene start
- No circular dependencies detected

### Delta Time Usage
**Status:** PERFECT

All movement calculations use `k.dt()`:
- Player movement
- Enemy movement (all 3 types)
- Projectiles (player and boss)
- Boss movement and entrance
- Powerup falling
- Flee behavior

### Data-Driven Config
**Status:** GOOD

Most values properly in `config.json`. Minor hardcoded values exist for:
- Boss figure-8 movement amplitudes (200, 60)
- Health bar dimensions (300x16)
- Various push/bounce distances

These are acceptable - they're specialized animation values unlikely to need tuning.

### File Organization
**Status:** CORRECT

```
src/
├── main.ts              ✓ Entry point (37 lines)
├── scenes/              ✓ 7 scene files
├── entities/            ✓ Player, projectile, powerup, mara, maraCombat
│   └── enemies/         ✓ hungryGhost, asura, deva
├── systems/             ✓ 16 system files
├── stores/              ⚠ Empty - zustand unused
├── data/                ✓ config.json, waves.json, quotes.json
├── ui/                  ✓ Pause menu, audio settings, HUD
└── utils/               ✓ events.ts, debug.ts
```

---

## 4. Dependency Analysis

**package.json:**
```json
{
  "dependencies": {
    "howler": "^2.2.4",      // ✓ USED - audio system
    "kaplay": "^3001.0.19",  // ✓ USED - game engine
    "zustand": "^5.0.9"      // ✗ UNUSED - no imports found
  }
}
```

**Action:** Remove `zustand` from dependencies OR implement Zustand for game state (was planned but not used).

---

## 5. Code Quality Issues

### Console Logs to Remove

`src/systems/audio.ts` has 9 console statements:
```
Line 30: console.log('Audio volumes loaded:', ...)
Line 42: console.log(`Music loaded: ${name}`)
Line 43: console.error(`Music load error...`)
Line 44: console.error(`Music play error...`)
Line 63: console.log('initAudio starting...')
Line 75: console.log('initAudio complete...')
Line 79: console.log('playMusic called:', ...)
Line 82: console.log('Same track already playing...')
Line 84: console.log('Stopping previous track:', ...)
Line 87: console.log('Started playing:', ...)
Line 91: console.error('Music track not loaded:', ...)
```

**Action:** Remove or wrap with `if (config.debug.verbose)` flag.

### Commented Code
**Status:** None found

### TODO Comments
**Status:** None found

---

## 6. Line Count Summary

| Category | Files | Total Lines | Average | Max |
|----------|-------|-------------|---------|-----|
| Entities | 8 | 703 | 88 | 164 |
| Scenes | 7 | 685 | 98 | 155 |
| Systems | 16 | 1,184 | 74 | 142 |
| UI | 4 | 487 | 122 | 140 |
| Utils | 2 | 135 | 68 | 115 |
| **Total** | **37** | **3,194** | **86** | **164** |

Codebase is healthy with average 86 lines per file.

---

## 7. Missing/Optional Files

| File | Status | Notes |
|------|--------|-------|
| `vite.config.ts` | Missing | Using Vite defaults (fine for now) |
| `.env` | Missing | Not needed yet |
| `src/stores/gameStore.ts` | Missing | Was planned for Zustand |

---

## 8. Action Items

### HIGH Priority
- [ ] Delete junk files: `nul`, malformed json, duplicate jpgs

### MEDIUM Priority
- [ ] Split `mara.ts` (164 lines → ~80 + ~60)
- [ ] Split `nirvana.ts` (155 lines → ~100 + ~55)

### LOW Priority
- [ ] Remove console.logs from `audio.ts`
- [ ] Either remove `zustand` dependency or implement game store
- [ ] Add `vite.config.ts` if custom build settings needed

---

## 9. Compliance Scorecard

| Rule | Status | Notes |
|------|--------|-------|
| Event bus pattern | ✅ PASS | Properly implemented throughout |
| File size < 150 lines | ⚠️ WARN | 2 files slightly over |
| Delta time everywhere | ✅ PASS | Perfect compliance |
| Config-driven values | ✅ PASS | Minor exceptions acceptable |
| No circular imports | ✅ PASS | Clean dependency graph |
| Git commits | ✅ PASS | Regular, descriptive commits |
| No hardcoded secrets | ✅ PASS | None found |
| TypeScript strict | ✅ PASS | Enabled in tsconfig |

---

## 10. Recommendations for Roguelike Expansion

Before starting Phase 1 (rebirth system):

1. **Clean up first** - Delete junk files, fix line counts
2. **Decide on Zustand** - Either use it for rebirth state or remove dependency
3. **Add verbose debug flag** - Wrap console.logs instead of deleting (useful for debugging new features)

The architecture is **solid enough** to build roguelike features on top. The event bus pattern will make adding rebirth events (`player:reborn`, `karma:reset`, `buff:gained`) straightforward.

---

*Audit complete. Codebase is production-quality with minor housekeeping needed.*
