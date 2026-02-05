// About overlay tab content rendering
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function renderControls(k: KAPLAYCtx, tabContent: GameObj[]): void {
  const w = config.screen.width;
  const items = [
    { label: 'Move', value: 'WASD' },
    { label: 'Aim', value: 'Mouse' },
    { label: 'Shoot', value: 'Left Click / SPACE (hold)' },
    { label: 'Paṭighāta', value: 'Right Click (5s cooldown)' },
    { label: 'Pause', value: 'ESC' },
  ];
  let y = 140;
  items.forEach(item => {
    tabContent.push(k.add([
      k.text(`${item.label}:`, { size: 18 }), k.pos(250, y), k.color(200, 180, 100), k.fixed(), k.z(101),
    ]));
    tabContent.push(k.add([
      k.text(item.value, { size: 16 }), k.pos(370, y + 2), k.color(180, 180, 200), k.fixed(), k.z(101),
    ]));
    y += 35;
  });
  tabContent.push(k.add([
    k.text('Collect virtue power-ups. Defeat 8 waves and vanquish Mara!', { size: 14 }),
    k.pos(w / 2, y + 30), k.anchor('center'), k.color(120, 120, 140), k.fixed(), k.z(101),
  ]));
}

export function renderBestiary(k: KAPLAYCtx, tabContent: GameObj[]): void {
  // Base enemies with sprites (left column)
  const spriteEnemies = [
    { name: 'Petā', sprite: 'peta', color: [255, 68, 68], desc: 'Erratic, 1 HP, 10 karma' },
    { name: 'Asurā', sprite: 'asura', color: [255, 140, 0], desc: 'Aggressive, 2 HP, 25 karma' },
    { name: 'Devā', sprite: 'deva', color: [147, 112, 219], desc: 'Graceful, 3 HP, 50 karma' },
  ];
  let y = 150;
  spriteEnemies.forEach(e => {
    const [r, g, b] = e.color;
    tabContent.push(k.add([k.sprite(e.sprite), k.pos(70, y), k.anchor('center'), k.scale(3.5), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.name, { size: 22 }), k.pos(140, y - 20), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.desc, { size: 16 }), k.pos(140, y + 5), k.color(150, 150, 170), k.fixed(), k.z(101)]));
    y += 100;
  });

  // Mara (fine with k.fixed())
  y += 20;
  tabContent.push(k.add([k.sprite('mara'), k.pos(70, y), k.anchor('center'), k.scale(2), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Māra', { size: 22 }), k.pos(140, y - 20), k.color(139, 0, 0), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Lord of Illusion - Boss', { size: 16 }), k.pos(140, y + 5), k.color(150, 150, 170), k.fixed(), k.z(101)]));

  // New enemies (right column) - unlock in later kalpas
  tabContent.push(k.add([
    k.text('Unlocked in Later Kalpas', { size: 18 }), k.pos(570, 110), k.anchor('center'), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));

  // Nerayikā
  y = 170;
  tabContent.push(k.add([k.sprite('nerayika'), k.pos(470, y), k.anchor('center'), k.scale(3.5), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Nerayikā', { size: 22 }), k.pos(540, y - 20), k.color(255, 69, 0), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('4 HP, +Klesha (K2+)', { size: 16 }), k.pos(540, y + 5), k.color(150, 150, 170), k.fixed(), k.z(101)]));

  // Tiracchānā (fine with k.fixed())
  y += 100;
  tabContent.push(k.add([k.sprite('tiracchana'), k.pos(470, y), k.anchor('center'), k.scale(3.5), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Tiracchānā', { size: 22 }), k.pos(540, y - 20), k.color(65, 105, 225), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Pack, -Pāramī (K3+)', { size: 16 }), k.pos(540, y + 5), k.color(150, 150, 170), k.fixed(), k.z(101)]));

  // Manussā (taller sprite, use smaller scale) (fine with k.fixed())
  y += 100;
  tabContent.push(k.add([k.sprite('manussa'), k.pos(470, y), k.anchor('center'), k.scale(1.8), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Manussā', { size: 22 }), k.pos(540, y - 20), k.color(0, 255, 0), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Peaceful (K4+)', { size: 16 }), k.pos(540, y + 5), k.color(150, 150, 170), k.fixed(), k.z(101)]));
}

export function renderRebirth(k: KAPLAYCtx, tabContent: GameObj[]): void {
  const w = config.screen.width;

  // Powerups row
  tabContent.push(k.add([
    k.text('Powerups', { size: 18 }), k.pos(w / 2, 118), k.anchor('center'), k.color(255, 215, 0), k.fixed(), k.z(101),
  ]));
  const powerups = [
    { name: 'Compassion', sprite: 'powerup_compassion', effect: 'Spread' },
    { name: 'Wisdom', sprite: 'powerup_wisdom', effect: 'Pierce' },
    { name: 'Patience', sprite: 'powerup_patience', effect: 'Slow' },
    { name: 'Diligence', sprite: 'powerup_diligence', effect: 'Rapid' },
    { name: 'Meditation', sprite: 'powerup_meditation', effect: 'Shield' },
    { name: 'Paduma', sprite: 'paduma', effect: 'Heal' },
  ];
  let px = 70;
  powerups.forEach(p => {
    tabContent.push(k.add([k.sprite(p.sprite), k.pos(px, 145), k.anchor('center'), k.scale(1.5), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.name, { size: 12 }), k.pos(px, 165), k.anchor('center'), k.color(180, 180, 200), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.effect, { size: 11 }), k.pos(px, 180), k.anchor('center'), k.color(120, 120, 140), k.fixed(), k.z(101)]));
    px += 115;
  });

  // Paramis section
  tabContent.push(k.add([
    k.text('Paramis (Buffs)', { size: 16 }), k.pos(55, 200), k.color(144, 238, 144), k.fixed(), k.z(101),
  ]));
  tabContent.push(k.add([
    k.text('Max', { size: 12 }), k.pos(365, 202), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const paramis = [
    { name: 'Dāna', effect: '1.25x drop rate', max: 1 },
    { name: 'Viriya', effect: '+10% fire rate', max: 5 },
    { name: 'Mettā', effect: '+1 max HP', max: 7 },
    { name: 'Upekkhā', effect: '-10% enemy speed', max: 5 },
    { name: 'Sīla', effect: 'Auto-shield on spawn', max: 1 },
    { name: 'Khantī', effect: '+20% powerup duration', max: 5 },
    { name: 'Paññā', effect: '+1 damage', max: 2 },
    { name: 'Adhiṭṭhāna', effect: '+1 shield charge', max: 1 },
    { name: 'Nekkhamma', effect: '+50% karma gain', max: 2 },
    { name: 'Sacca', effect: '+5% lotus drop', max: 1 },
  ];
  let y = 226;
  paramis.forEach(p => {
    tabContent.push(k.add([k.text(p.name, { size: 14 }), k.pos(60, y), k.color(180, 255, 180), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.effect, { size: 14 }), k.pos(155, y), k.color(140, 200, 140), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`${p.max}`, { size: 14 }), k.pos(370, y), k.color(100, 150, 100), k.fixed(), k.z(101)]));
    y += 26;
  });

  // Kleshas section
  tabContent.push(k.add([
    k.text('Kleshas (Debuffs)', { size: 16 }), k.pos(400, 200), k.color(255, 100, 100), k.fixed(), k.z(101),
  ]));
  tabContent.push(k.add([
    k.text('Max', { size: 12 }), k.pos(765, 202), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const kleshas = [
    { name: 'Lobha', effect: '-25% drop rate', max: 2 },
    { name: 'Dosa', effect: '+10% enemy speed', max: 3 },
    { name: 'Māna', effect: '-1 max HP', max: 5 },
    { name: 'Vicikicchā', effect: '-10% fire rate', max: 3 },
    { name: 'Moha', effect: '-20% powerup duration', max: 2 },
    { name: 'Thīna', effect: '-10% player speed', max: 2 },
    { name: 'Anottappa', effect: '-1 damage', max: 1 },
    { name: 'Micchādiṭṭhi', effect: '-25% karma gain', max: 2 },
    { name: 'Ahirika', effect: 'Flip Manussā karma', max: 1 },
  ];
  y = 226;
  kleshas.forEach(kl => {
    tabContent.push(k.add([k.text(kl.name, { size: 14 }), k.pos(405, y), k.color(255, 150, 150), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(kl.effect, { size: 14 }), k.pos(520, y), k.color(200, 140, 140), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`${kl.max}`, { size: 14 }), k.pos(770, y), k.color(150, 100, 100), k.fixed(), k.z(101)]));
    y += 26;
  });

  // Vajra section (centered below both columns)
  tabContent.push(k.add([k.sprite('vajra'), k.pos(w / 2 - 80, 492), k.anchor('center'), k.scale(1.0), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('Vajra', { size: 16 }), k.pos(w / 2 - 45, 492), k.anchor('left'), k.color(255, 215, 0), k.fixed(), k.z(101)]));
  tabContent.push(k.add([k.text('1.5% drop, clears all enemies, +500 karma', { size: 14 }), k.pos(w / 2 + 10, 492), k.anchor('left'), k.color(180, 180, 200), k.fixed(), k.z(101)]));
}
