# IMPLEMENT_MUSIC.md — Music Selection Feature

**Status:** Ready for implementation  
**Approach:** Dropdown selectors inside existing Audio Settings menu  
**Priority:** After Phase 9.8 (current), can be done before or alongside Phase 10

---

## Overview

Players can select which music tracks play during **gameplay (waves)** and **boss fights** independently. Any unlocked track can be used in either context — full mix-and-match freedom. Tracks unlock progressively as they are heard in normal gameplay.

---

## Critical Fix Required

### Logo Overlay Blocking Audio Menu

**Problem:** The HTML logo overlay on the main menu overlaps/blocks the Audio Settings menu.

**Solution:** Ensure the Audio Settings menu has a higher z-index than the logo overlay, OR hide the logo overlay when Audio Settings opens and restore it when Audio Settings closes.

**Files involved:**
- `index.html` — Check z-index values
- `src/ui/audioSettings.ts` — May need to call logo hide/show functions
- Whatever file manages the logo overlay (likely `menu.ts` or a dedicated file)

**Fix this BEFORE or WHILE implementing music selection.**

---

## Selectable Track Pool

All unlocked tracks are available for both gameplay and boss contexts.

| Track ID | Display Name (placeholder) | Unlock Condition |
|----------|---------------------------|------------------|
| `gameplay` | "Mindful Focus" | Start any game |
| `boss` | "Mara's Challenge" | Fight kalpa 1 boss |
| `boss2` | "Rising Tension" | Fight kalpa 2 boss |
| `boss3` | "Deeper Struggle" | Fight kalpa 3 boss |
| `boss4` | "Final Confrontation" | Fight kalpa 4 boss |

**Note:** Display names are placeholders — Cody will provide final names.

### Non-Selectable Tracks (Scene-Locked)

These tracks are tied to specific scenes and cannot be selected:

| Track ID | Purpose |
|----------|---------|
| `menu` | Menu scene only |
| `nirvana` | Victory/credits only |
| `gameover` | Game over only |

---

## UI Design: Dropdowns in Audio Settings

Radio buttons for 5×2 options would make the menu too tall. Use **compact dropdown selectors** instead.

### Layout

```
┌─────────────────────────────────────┐
│          AUDIO SETTINGS             │
├─────────────────────────────────────┤
│  Music Volume     [━━━━━━━━○───]    │
│  SFX Volume       [━━━━━━━━━━━○]    │
├─────────────────────────────────────┤
│  Gameplay Music   [Mindful Focus ▼] │
│  Boss Music       [Mara's Chall. ▼] │
├─────────────────────────────────────┤
│            [CLOSE]                  │
└─────────────────────────────────────┘
```

### Dropdown Behavior

1. Click dropdown → shows all 5 tracks
2. Unlocked tracks are selectable (normal color)
3. Locked tracks show 🔒 icon, grayed out, not clickable (`disabled`)
4. Selecting a track immediately persists to localStorage
5. Click outside or select option → dropdown closes

### Implementation Recommendation

Use native HTML `<select>` elements styled to match the dark theme. This gives you:
- Built-in keyboard navigation
- Native dropdown behavior
- Easy disabled state for locked options
- No custom dropdown logic needed

---

## Persistence

### New Fields in SaveData

```typescript
interface SaveData {
  // ... existing fields ...
  musicUnlocks: string[];           // Existing - tracks that have been heard
  selectedGameplayTrack: string;    // NEW - default 'gameplay'
  selectedBossTrack: string;        // NEW - default 'boss'
}
```

### New Helper Functions

Add to `src/systems/persistence.ts`:

```typescript
export function getSelectedGameplayTrack(): string {
  return loadSave().selectedGameplayTrack || 'gameplay';
}

export function setSelectedGameplayTrack(track: string): void {
  updateSave({ selectedGameplayTrack: track });
}

export function getSelectedBossTrack(): string {
  return loadSave().selectedBossTrack || 'boss';
}

export function setSelectedBossTrack(track: string): void {
  updateSave({ selectedBossTrack: track });
}
```

---

## Unlock Integration

### Modify audio.ts

Tracks unlock automatically when first played. Add to `playMusic()`:

```typescript
import { addMusicUnlock } from './persistence';

export function playMusic(track: MusicTrack): void {
  // ... existing stop/play logic ...

  // Track unlock when music first plays
  addMusicUnlock(track);
}
```

This means:
- `gameplay` unlocks on first game start
- `boss` unlocks on first kalpa 1 boss fight
- `boss2` unlocks on first kalpa 2 boss fight
- etc.

---

## Game Integration

### Modify gameAudio.ts

Replace hardcoded track logic with player selection:

```typescript
import { 
  getSelectedGameplayTrack, 
  getSelectedBossTrack 
} from './persistence';

// When gameplay starts (wave 1)
events.on('wave:started', ({ wave }) => {
  if (wave === 1) {
    const selected = getSelectedGameplayTrack();
    playMusic(selected as MusicTrack);
  }
});

// When boss starts
events.on('boss:started', () => {
  playSFX('boss_enter');
  const selected = getSelectedBossTrack();
  playMusic(selected as MusicTrack);
});
```

**Remove** any existing kalpa-based boss music selection logic — player choice overrides it.

---

## UI Implementation

### Modify audioSettingsUI.ts

Add the track selection dropdowns below the volume sliders.

**Track data constant:**

```typescript
const SELECTABLE_TRACKS = [
  { id: 'gameplay', name: 'Mindful Focus' },
  { id: 'boss', name: "Mara's Challenge" },
  { id: 'boss2', name: 'Rising Tension' },
  { id: 'boss3', name: 'Deeper Struggle' },
  { id: 'boss4', name: 'Final Confrontation' },
];
```

**For each dropdown:**

1. Create a `<select>` element
2. Populate with `<option>` elements for each track
3. Mark locked tracks as `disabled` with 🔒 in the label
4. Set `selected` on the current choice
5. Add `change` event listener to persist selection

### Modify audioSettings.ts

Wire up the dropdown change handlers to call the persistence functions.

### Styling

Match the existing dark theme:
- Background: `rgba(30, 30, 50, 0.9)` or similar
- Text: `#ccc` normal, `#fff` on hover/focus
- Disabled: `#555` with reduced opacity
- Border: `1px solid #555`
- Selected highlight: `#ffd700` (gold) or keep subtle

---

## Files to Modify

| File | Change |
|------|--------|
| `index.html` | Fix z-index for audio menu vs logo overlay |
| `src/systems/persistence.ts` | Add `selectedGameplayTrack`, `selectedBossTrack` + helpers |
| `src/systems/audio.ts` | Add `addMusicUnlock()` call in `playMusic()` |
| `src/systems/gameAudio.ts` | Use selected tracks instead of hardcoded logic |
| `src/ui/audioSettingsUI.ts` | Add two dropdown selectors for track selection |
| `src/ui/audioSettings.ts` | Wire up dropdown change handlers |

**No new files needed.**

---

## Testing Checklist

### Audio Menu Access
- [ ] Audio menu opens without being blocked by logo overlay
- [ ] Logo overlay handled appropriately (hidden or behind)

### Dropdown UI
- [ ] Both dropdowns appear in Audio Settings
- [ ] Dropdowns show all 5 tracks
- [ ] Locked tracks are grayed out with 🔒
- [ ] Locked tracks cannot be selected
- [ ] Selecting unlocked track updates dropdown display
- [ ] Selections persist after closing and reopening menu

### Track Unlocking
- [ ] `gameplay` unlocks immediately on first game
- [ ] `boss` unlocks after first kalpa 1 boss fight
- [ ] `boss2` unlocks after first kalpa 2 boss fight
- [ ] `boss3` unlocks after first kalpa 3 boss fight
- [ ] `boss4` unlocks after first kalpa 4 boss fight
- [ ] Unlocked tracks become selectable in dropdowns

### In-Game Behavior
- [ ] Wave 1 plays selected gameplay track
- [ ] Boss fight plays selected boss track
- [ ] Tracks don't reset to defaults after death/rebirth
- [ ] Mix-and-match works (e.g., boss4 during gameplay, gameplay during boss)

### Edge Cases
- [ ] Fresh localStorage uses correct defaults (gameplay/boss)
- [ ] Selecting a track that becomes re-locked (shouldn't happen, but handle gracefully)

---

## Future Expansion Ideas

- **Preview button:** Sample tracks from the menu before selecting
- **More tracks:** Additional gameplay/boss variants
- **Menu music selection:** Let players pick menu music too
- **Per-kalpa presets:** Quick buttons for "match kalpa" behavior

---

## Notes for Main Claude

1. **Fix the logo overlap first** — this is a prerequisite for usable audio settings
2. **Use native `<select>` elements** — don't reinvent dropdown logic
3. **Test unlock flow** — play through to kalpa 2+ to verify unlocks work
4. **Track names are placeholders** — Cody will provide final names later
5. **Keep audioSettingsUI.ts under 150 lines** — split if needed after adding dropdowns

---

*Let players curate their own soundtrack. 🎵*
