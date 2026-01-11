# Phase 0 Cleanup Instructions

## Problem

The folder structure has incorrectly named folders at the root level. These appear to be concatenated paths that didn't nest properly:

**Bad folders to DELETE (at project root):**
- `srcdata`
- `srcentities`
- `srcentitiesenemies`
- `srcscenes`
- `srcstores`
- `srcsystems`
- `srcutils`
- `publicaudio`
- `publicaudiomusic`
- `publicaudiosfx`
- `publicfonts`
- `publicsprites`

## What's Correct (Keep These)

The following structure IS correct and should be kept:
- `src/` folder with `data/`, `utils/`, and `main.ts` inside
- `src/data/config.json` ✓
- `src/utils/events.ts` ✓
- `public/` folder

## Tasks

1. **Delete all the bad folders** listed above (they should be empty or have no useful content)

2. **Verify/create the correct nested structure inside `src/`:**
   ```
   src/
   ├── main.ts           # Already exists
   ├── data/
   │   └── config.json   # Already exists
   ├── utils/
   │   └── events.ts     # Already exists
   ├── scenes/           # Create if missing (empty for now)
   ├── entities/
   │   └── enemies/      # Create if missing (empty for now)
   ├── systems/          # Create if missing (empty for now)
   └── stores/           # Create if missing (empty for now)
   ```

3. **Verify/create the correct nested structure inside `public/`:**
   ```
   public/
   ├── sprites/          # Create if missing (empty for now)
   ├── audio/
   │   ├── music/        # Create if missing (empty for now)
   │   └── sfx/          # Create if missing (empty for now)
   └── fonts/            # Create if missing (empty for now)
   ```

4. **Add placeholder files** to prevent git from ignoring empty folders:
   - Add `.gitkeep` to each empty folder, OR
   - Add a placeholder README like "Assets go here"

## Verification

After cleanup, running `tree` or `ls -la` should show:
- NO folders at root starting with `src` or `public` (except `src/` and `public/` themselves)
- All subfolders properly nested inside `src/` and `public/`

## Commands to Run

```powershell
# Delete bad folders (Windows PowerShell)
Remove-Item -Recurse -Force srcdata, srcentities, srcentitiesenemies, srcscenes, srcstores, srcsystems, srcutils, publicaudio, publicaudiomusic, publicaudiosfx, publicfonts, publicsprites -ErrorAction SilentlyContinue

# Create correct structure
mkdir -p src/scenes, src/entities/enemies, src/systems, src/stores
mkdir -p public/sprites, public/audio/music, public/audio/sfx, public/fonts
```

Note: Use semicolons (`;`) not `&&` for command chaining in PowerShell.
