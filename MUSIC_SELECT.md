# Music Selection Feature Plan

**Status:** Ready for implementation
**Approach:** HTML dropdown button on main menu

---

## Overview

Players can select which music tracks play for boss fights. Tracks unlock progressively as they are heard in game. A dropdown button on the main menu shows unlocked tracks.

---

## UI Design: Dropdown Button

### Location
Main menu, below the difficulty selector area.

### Appearance
```
[MUSIC ▼]  ← Button, shows dropdown on click

┌─────────────────────────────┐
│ BOSS MUSIC                  │
│ ● Mara's Challenge          │
│ ○ Kalpa 2 Theme      🔒     │
│ ○ Kalpa 3 Theme      🔒     │
│ ○ Final Confrontation 🔒    │
└─────────────────────────────┘
```

- Locked tracks show 🔒 icon (grayed out, not clickable)
- Radio buttons for single selection
- Selected track has filled circle ●
- Click outside or ESC to close

### Behavior
1. Click button → dropdown appears above button
2. Click outside or press ESC → dropdown closes
3. Click unlocked track → selects it, persists to localStorage
4. Locked tracks are visible but not clickable

---

## Track Catalog

### Selectable Tracks (Boss Music)

| Track ID | Display Name | Unlock Condition |
|----------|--------------|------------------|
| `boss` | "Mara's Challenge" | Fight kalpa 1 boss |
| `boss2` | "Kalpa 2 Theme" | Fight kalpa 2 boss |
| `boss3` | "Kalpa 3 Theme" | Fight kalpa 3 boss |
| `boss4` | "Final Confrontation" | Fight kalpa 4 boss |

### Non-Selectable Tracks (Scene-Locked)

| Track ID | Purpose |
|----------|---------|
| `menu` | Menu scene only |
| `gameplay` | Gameplay only |
| `nirvana` | Victory/credits only |
| `gameover` | Game over only |

---

## Persistence Integration

### Existing Infrastructure

```typescript
// src/systems/persistence.ts (already exists)
musicUnlocks: string[];           // Already in SaveData
getMusicUnlocks(): string[]       // Returns unlocked track IDs
addMusicUnlock(track: string)     // Adds track if not present
```

### New Fields to Add

Add to `SaveData` interface in persistence.ts:

```typescript
interface SaveData {
  // ... existing fields ...
  musicUnlocks: string[];         // Existing
  selectedBossTrack: string;      // NEW - default 'boss'
}
```

Add new helpers:

```typescript
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

In `playMusic()`, add unlock tracking:

```typescript
import { addMusicUnlock } from './persistence';

export function playMusic(track: MusicTrack): void {
  // ... existing stop/play logic ...

  // Track unlock when music first plays
  addMusicUnlock(track);
}
```

This automatically unlocks tracks as they're encountered in normal gameplay.

---

## UI Implementation

### HTML Structure (index.html)

Add inside `#game-container`, after canvas:

```html
<!-- Music selection dropdown -->
<div id="music-select-overlay" style="display: none;">
  <button id="music-select-btn">MUSIC ▼</button>
  <div id="music-dropdown" class="hidden">
    <div class="dropdown-header">Boss Music</div>
    <div id="boss-tracks"></div>
  </div>
</div>
```

### CSS (in index.html style block)

```css
#music-select-overlay {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

#music-select-btn {
  background: rgba(30, 30, 50, 0.9);
  border: 1px solid #555;
  color: #ccc;
  padding: 8px 20px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  border-radius: 4px;
}

#music-select-btn:hover {
  background: rgba(50, 50, 80, 0.9);
  color: #fff;
}

#music-dropdown {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid #555;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 8px;
  min-width: 200px;
}

#music-dropdown.hidden {
  display: none;
}

.dropdown-header {
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.track-option {
  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  color: #ccc;
  font-size: 14px;
}

.track-option:hover:not(.locked) {
  color: #fff;
}

.track-option.locked {
  color: #555;
  cursor: not-allowed;
}

.track-option.selected {
  color: #ffd700;
}

.track-radio {
  margin-right: 10px;
  font-size: 12px;
}

.track-lock {
  margin-left: auto;
  font-size: 11px;
}
```

### JavaScript (new file: src/ui/musicSelectOverlay.ts)

```typescript
import {
  getMusicUnlocks,
  getSelectedBossTrack,
  setSelectedBossTrack
} from '../systems/persistence';

const BOSS_TRACKS = [
  { id: 'boss', name: "Mara's Challenge" },
  { id: 'boss2', name: 'Kalpa 2 Theme' },
  { id: 'boss3', name: 'Kalpa 3 Theme' },
  { id: 'boss4', name: 'Final Confrontation' },
];

let isDropdownVisible = false;

export function initMusicSelect(): void {
  const btn = document.getElementById('music-select-btn');
  const dropdown = document.getElementById('music-dropdown');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    isDropdownVisible = !isDropdownVisible;
    dropdown.classList.toggle('hidden', !isDropdownVisible);
    if (isDropdownVisible) populateDropdown();
  });

  // Close on click outside
  document.addEventListener('click', () => {
    if (isDropdownVisible) {
      isDropdownVisible = false;
      dropdown.classList.add('hidden');
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDropdownVisible) {
      isDropdownVisible = false;
      dropdown.classList.add('hidden');
    }
  });
}

function populateDropdown(): void {
  const container = document.getElementById('boss-tracks');
  if (!container) return;

  const unlocks = getMusicUnlocks();
  const selected = getSelectedBossTrack();

  container.innerHTML = '';

  for (const track of BOSS_TRACKS) {
    const isUnlocked = unlocks.includes(track.id);
    const isSelected = selected === track.id;

    const div = document.createElement('div');
    div.className = `track-option${isUnlocked ? '' : ' locked'}${isSelected ? ' selected' : ''}`;

    const radio = isSelected ? '●' : '○';
    div.innerHTML = `
      <span class="track-radio">${radio}</span>
      <span class="track-name">${track.name}</span>
      ${isUnlocked ? '' : '<span class="track-lock">🔒</span>'}
    `;

    if (isUnlocked) {
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedBossTrack(track.id);
        populateDropdown();
      });
    }

    container.appendChild(div);
  }
}

export function showMusicSelect(): void {
  const overlay = document.getElementById('music-select-overlay');
  if (overlay) overlay.style.display = 'block';
}

export function hideMusicSelect(): void {
  const overlay = document.getElementById('music-select-overlay');
  if (overlay) overlay.style.display = 'none';
  isDropdownVisible = false;
  const dropdown = document.getElementById('music-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
}
```

---

## Game Integration

### Modify gameAudio.ts

Replace hardcoded boss track with player selection:

```typescript
import { getSelectedBossTrack, getMusicUnlocks } from '../systems/persistence';

events.on('boss:started', () => {
  playSFX('boss_enter');
  const kalpa = getCycle();
  const selectedBoss = getSelectedBossTrack();
  const unlocks = getMusicUnlocks();

  // Use selected track if unlocked, otherwise kalpa-appropriate default
  if (unlocks.includes(selectedBoss)) {
    playMusic(selectedBoss as MusicTrack);
  } else {
    // Fallback to kalpa-based default
    if (kalpa >= 4) playMusic('boss4');
    else if (kalpa === 3) playMusic('boss3');
    else if (kalpa === 2) playMusic('boss2');
    else playMusic('boss');
  }
});
```

### Modify menu.ts

Show/hide music select with menu:

```typescript
import { initMusicSelect, showMusicSelect, hideMusicSelect } from '../ui/musicSelectOverlay';

export function createMenuScene(k: KAPLAYCtx): void {
  // ... existing code ...

  initMusicSelect();
  showMusicSelect();

  const startGame = () => {
    if (isAudioSettingsVisible()) return;
    if (arrowClicked) return;
    hideMenuLogo();
    hideMusicSelect();  // ADD THIS
    k.go('titleScreen');
  };

  // ... rest of scene
}
```

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `index.html` | Modify | Add music dropdown HTML + CSS |
| `src/systems/persistence.ts` | Modify | Add `selectedBossTrack` field + helpers |
| `src/systems/audio.ts` | Modify | Add `addMusicUnlock()` call in `playMusic()` |
| `src/systems/gameAudio.ts` | Modify | Use selected boss track |
| `src/scenes/menu.ts` | Modify | Init and show/hide music select |
| `src/ui/musicSelectOverlay.ts` | **NEW** | Dropdown UI logic (~80 lines) |

---

## Testing Checklist

- [ ] Menu shows MUSIC button
- [ ] Clicking button toggles dropdown
- [ ] Clicking outside closes dropdown
- [ ] ESC closes dropdown
- [ ] Only unlocked tracks are selectable
- [ ] Locked tracks show lock icon and are grayed out
- [ ] Selecting track updates radio button
- [ ] Selected track persists across sessions
- [ ] Boss fight uses selected track (if unlocked)
- [ ] Tracks unlock when first heard (check console or localStorage)
- [ ] Default selection is 'boss' (Mara's Challenge)

---

## Future Expansion

- Preview button to sample tracks from menu
- More boss track variants
- Gameplay music selection (if more tracks added)
