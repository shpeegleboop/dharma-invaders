# What NOT To Do: Player Sprite Line Artifact

This document chronicles the failed attempts to fix a persistent vertical line artifact on the player sprite. **None of these approaches worked.** The line artifact remains unfixed as of this writing.

---

## The Problem

A visible vertical line appears on the LEFT edge of the player sprite:
- Visible in gameplay at 1x scale
- Visible in cutscenes at 4x scale
- Does NOT appear on other sprites (peta, asura, deva, mara, etc.)
- The line appears to be texture edge sampling bleeding

See `playerline.png` for reference.

---

## Failed Approaches (Chronological)

### 1. ViewBox Padding - 1px (commit 59fc77a)
**Theory:** Expanding the SVG viewBox gives gradients room to fade without hitting the boundary.

**Change:** `viewBox="0 0 32 32"` → `viewBox="-1 -1 34 34"`

**Result:** Did not fix the artifact.

---

### 2. ViewBox Padding - 2px (commit dd3b7a8)
**Theory:** 1px wasn't enough, try 2px.

**Change:** `viewBox="-2 -2 36 36"`

**Result:** Did not fix the artifact.

---

### 3. Revert to 1px (commit e89350f)
**Theory:** Maybe 2px was too much?

**Change:** Back to `viewBox="-1 -1 34 34"`

**Result:** Still broken.

---

### 4. ViewBox Padding - 3px (commit 70ac30f)
**Theory:** More padding = more better?

**Change:** `viewBox="-3 -3 38 38"`

**Result:** Still broken.

---

### 5. ViewBox Padding - 4px (commit 339ac04)
**Theory:** Even MORE padding.

**Change:** `viewBox="-4 -4 40 40"` with `width="32" height="32"`

**Result:** Still broken. Now also causing fractional scaling (32/40 = 0.8x).

---

### 6. Gradient Stop Smoothing (commit 141a273)
**Theory:** Add intermediate gradient stop at 95% with opacity 0.01 to smooth the transition.

**Change:** Added `<stop offset="95%" style="stop-color:#5D4E8C;stop-opacity:0.01"/>`

**Result:** Did not fix the artifact.

---

### 7. Revert ViewBox + Shrink Mandorla (commit ce551ea)
**Theory:** The viewBox offset trick doesn't work. Instead, shrink the mandorla to keep it away from edges.

**Changes:**
- Reverted to `viewBox="0 0 32 32"`
- Shrunk mandorla from `rx="14"` to `rx="12"`
- Reduced blur from 0.5 to 0.3

**Result:** Did not fix the artifact.

---

### 8. SVG to PNG Conversion with Transparent Padding (commit 9dc91a0)
**Theory:** The problem is SVG rasterization. Pre-rasterize to PNG with actual transparent pixel padding.

**Changes:**
- Created `scripts/convert-sprites.mjs` using `@resvg/resvg-js` and `sharp`
- Converted all 17 game sprites from SVG to PNG
- Added 4px transparent padding on all sides
- Changed `main.ts` to load `.png` instead of `.svg`

**Result:** Did not fix the artifact. Also added unnecessary dependencies and complexity.

---

### 9. Position Rounding in All Entities (attempted, reverted)
**Theory:** Fractional pixel positions cause sub-pixel rendering artifacts with linear filtering.

**Changes attempted:**
- Add `Math.round()` to positions in playerMovement.ts
- Add `Math.round()` to positions in all enemy files
- Add `Math.round()` to projectile, powerup, mara, bossProjectile

**Result:** REVERTED before testing. This was scope creep - the artifact appears in cutscenes where positions ARE already rounded. Would also cause visual stepping/stutter on slow-moving objects.

---

### 10. Shrink Mandorla Further (commit e1559b8 - current)
**Theory:** Keep mandorla even further from edges.

**Changes:**
- `viewBox="0 0 32 32"` (normal, no offset)
- Mandorla: `rx="14" ry="15"` → `rx="11" ry="12"`
- Gradient stops adjusted: 35%/95% → 45%/85%

**Result:** Did not fix the artifact.

---

## What We Know

1. **Only the player sprite has this issue** - other sprites with similar radial gradients (peta, asura, deva) render fine
2. **The line is on the LEFT edge** - not circular around the mandorla
3. **Visible at 1x scale** - not just a high-scale cutscene issue
4. **ViewBox offset tricks don't work** - they just add complexity and fractional scaling
5. **PNG conversion doesn't help** - the artifact persists in pre-rasterized PNGs
6. **Position rounding is unrelated** - cutscenes already round positions, still broken

---

## What NOT To Try Again

| Approach | Why It Failed |
|----------|---------------|
| ViewBox padding (`-N -N ...`) | Creates fractional scaling, doesn't address actual texture sampling |
| Adding gradient stops near 100% | The artifact is at the texture edge, not the gradient edge |
| SVG → PNG conversion | The problem exists in the SVG itself before rasterization |
| Shrinking the mandorla | Even at rx=11 (5px from edge), artifact persists |
| Global position rounding | Unrelated to this bug, would cause other visual issues |
| Per-sprite texture filtering | Kaplay doesn't support this |

---

## Possible Actual Causes (Uninvestigated)

1. **Something unique in player.svg structure** - Compare byte-for-byte with working sprites
2. **Gradient ID collision** - `mandorlaGrad` might conflict with something
3. **Kaplay/WebGL texture loading bug** - Specific to this file
4. **Browser SVG rasterization quirk** - Test in different browsers
5. **The original SVG has the artifact baked in** - Check the source file in a vector editor

---

## Lessons Learned

1. **Don't chase symptoms** - We kept trying variations of the same approach (padding) without understanding root cause
2. **Don't expand scope** - Position rounding in 12+ files was massive scope creep for a single-sprite bug
3. **Compare working vs broken** - Other sprites work fine; should have diffed them byte-by-byte first
4. **Test the simplest hypothesis first** - Is the line actually IN the SVG source file?

---

## Current State

- Using SVG sprites (not PNG)
- Player has `viewBox="0 0 32 32"`, mandorla at `rx="11" ry="12"`
- **Line artifact still present**
- All other sprites render correctly

The bug remains open.
