// HTML overlay controls for menu logo and pause effects
import { getGameState } from '../stores/gameStore';

// Display names for paramis
const PARAMI_DISPLAY: Record<string, string> = {
  Dana: 'Dāna (Generosity) - +25% drops',
  Viriya: 'Viriya (Energy) - +10% fire rate',
  Metta: 'Mettā (Loving-kindness) - +1 max HP',
  Upekkha: 'Upekkhā (Equanimity) - -10% enemy speed',
  Sila: 'Sīla (Virtue) - auto-shield',
  Khanti: 'Khantī (Patience) - +20% powerup duration',
  Panna: 'Paññā (Wisdom) - +1 damage',
  Adhitthana: 'Adhiṭṭhāna (Resolve) - +1 shield charge',
  Nekkhamma: 'Nekkhamma (Renunciation) - +50% karma',
  Sacca: 'Sacca (Truth) - +5% Paduma drops',
};

// Display names for kleshas
const KLESHA_DISPLAY: Record<string, string> = {
  Lobha: 'Lobha (Greed) - -25% drops',
  Dosa: 'Dosa (Hatred) - +10% enemy speed',
  Mana: 'Māna (Pride) - -1 max HP',
  Vicikiccha: 'Vicikicchā (Doubt) - -10% fire rate',
  Moha: 'Moha (Delusion) - -20% powerup duration',
  Thina: 'Thīna (Sloth) - -10% player speed',
  Anottappa: 'Anottappa (Recklessness) - -1 damage',
  Micchaditthi: 'Micchādiṭṭhi (Wrong View) - -25% karma',
  Ahirika: 'Ahirika (Shamelessness) - flips Manussā karma',
};

function countEffects(effects: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of effects) {
    counts.set(e, (counts.get(e) || 0) + 1);
  }
  return counts;
}

// Menu logo overlay
export function showMenuLogo(): void {
  const overlay = document.getElementById('menu-logo-overlay');
  if (overlay) overlay.classList.add('visible');
}

export function hideMenuLogo(): void {
  const overlay = document.getElementById('menu-logo-overlay');
  if (overlay) overlay.classList.remove('visible');
}

// Pause effects overlay
export function showPauseEffects(): void {
  const overlay = document.getElementById('pause-effects-overlay');
  if (!overlay) return;

  const state = getGameState();
  const paramiCounts = countEffects(state.paramis);
  const kleshaCounts = countEffects(state.kleshas);

  // Populate paramis list
  const paramisList = document.getElementById('paramis-list');
  if (paramisList) {
    paramisList.innerHTML = '';
    if (paramiCounts.size === 0) {
      paramisList.innerHTML = '<li style="opacity: 0.5">None</li>';
    } else {
      for (const [name, count] of paramiCounts) {
        const display = PARAMI_DISPLAY[name] || name;
        const text = count > 1 ? `${display} ×${count}` : display;
        const li = document.createElement('li');
        li.textContent = text;
        paramisList.appendChild(li);
      }
    }
  }

  // Populate kleshas list
  const kleshasList = document.getElementById('kleshas-list');
  if (kleshasList) {
    kleshasList.innerHTML = '';
    if (kleshaCounts.size === 0) {
      kleshasList.innerHTML = '<li style="opacity: 0.5">None</li>';
    } else {
      for (const [name, count] of kleshaCounts) {
        const display = KLESHA_DISPLAY[name] || name;
        const text = count > 1 ? `${display} ×${count}` : display;
        const li = document.createElement('li');
        li.textContent = text;
        kleshasList.appendChild(li);
      }
    }
  }

  overlay.classList.add('visible');
}

export function hidePauseEffects(): void {
  const overlay = document.getElementById('pause-effects-overlay');
  if (overlay) overlay.classList.remove('visible');
}

// Move canvas into game container on init
export function initOverlays(): void {
  const canvas = document.querySelector('canvas');
  const container = document.getElementById('game-container');
  if (canvas && container && !container.contains(canvas)) {
    container.insertBefore(canvas, container.firstChild);
  }
}
