# Dharma Invaders — Audit Result

**Date:** 2026-01-14  
**Verdict:** A- (Ready for roguelike expansion after minor cleanup)

---

## Pre-Commit Actions

### 1. Delete Junk Files (DO NOW)

```bash
# From project root:
del nul
del suffer.jpg
del suffer_sharp.jpg
del "C:Userscr4ckprojectsdharma-invadersreleases.json"
```

Or tell Claude Code: "Delete these junk files: nul, suffer.jpg, suffer_sharp.jpg (root only, keep the one in public/sprites/), and the malformed releases.json"

### 2. Commit Current State

```bash
git add -A
git commit -m "Phase 0: Title screen with suffer image, cleanup junk files"
```

---

## Decisions Made

| Item | Decision | Reason |
|------|----------|--------|
| Split mara.ts (164 lines) | **SKIP** | Only 14 lines over, not worth churn |
| Split nirvana.ts (155 lines) | **SKIP** | Only 5 lines over, trivial |
| Remove console.logs | **DEFER** | Useful for debugging roguelike |
| Remove zustand | **KEEP** | Will use for roguelike state management |

---

## Ready for Phase 1

After cleanup, proceed with roguelike implementation:

| Phase | Focus | Status |
|-------|-------|--------|
| **0** | Title screen | ✅ COMPLETE |
| **1** | Karma split + rebirth overlay | **NEXT** |
| **2** | 4 basic Pāramīs | Pending |
| **3** | 4 basic Kleshas | Pending |
| **4** | HUD icons + victory updates | Pending |
| **5** | Balance + remaining buffs/debuffs | Pending |

---

## Claude Code Prompt (Copy This)

```
Delete these junk files from project root:
- nul
- suffer.jpg  
- suffer_sharp.jpg (keep the one in public/sprites/)
- C:Userscr4ckprojectsdharma-invadersreleases.json (malformed filename)

Then commit with message: "Cleanup: remove junk files, title screen complete"

Do NOT:
- Split mara.ts or nirvana.ts
- Remove console.logs from audio.ts
- Remove zustand dependency
```

---

*After commit, begin Phase 1: Karma split and rebirth overlay*
