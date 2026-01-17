// About overlay tab content rendering
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function renderControls(k: KAPLAYCtx, tabContent: GameObj[]): void {
  const w = config.screen.width;
  const items = [
    { label: 'Move', value: 'WASD' },
    { label: 'Aim', value: 'Mouse' },
    { label: 'Shoot', value: 'Left Click / SPACE (hold)' },
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
  // Base enemies (left column)
  const baseEnemies = [
    { name: 'Hungry Ghost', color: [255, 68, 68], desc: 'Erratic, 1 HP, 10 karma' },
    { name: 'Asura', color: [255, 140, 0], desc: 'Aggressive, 2 HP, 25 karma' },
    { name: 'Deva', color: [147, 112, 219], desc: 'Graceful, 3 HP, 50 karma' },
    { name: 'Mara', color: [139, 0, 0], desc: 'Lord of Illusion - Boss' },
  ];
  let y = 130;
  baseEnemies.forEach(e => {
    const [r, g, b] = e.color;
    tabContent.push(k.add([k.rect(18, 18), k.pos(60, y - 4), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.name, { size: 16 }), k.pos(90, y), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.desc, { size: 12 }), k.pos(90, y + 18), k.color(150, 150, 170), k.fixed(), k.z(101)]));
    y += 48;
  });

  // New enemies (right column) - unlock in later kalpas
  tabContent.push(k.add([
    k.text('Kalpa 2+', { size: 14 }), k.pos(420, 115), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const newEnemies = [
    { name: 'Nerayika', color: [255, 69, 0], desc: 'Charger, 4 HP, +Klesha', kalpa: 2 },
    { name: 'Tiracchana', color: [65, 105, 225], desc: 'Pack, 1 HP, -Parami', kalpa: 3 },
    { name: 'Manussa', color: [0, 255, 0], desc: 'Non-hostile, karma test', kalpa: 4 },
  ];
  y = 135;
  newEnemies.forEach(e => {
    const [r, g, b] = e.color;
    tabContent.push(k.add([k.rect(18, 18), k.pos(420, y - 4), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.name, { size: 16 }), k.pos(450, y), k.color(r, g, b), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(e.desc, { size: 12 }), k.pos(450, y + 18), k.color(150, 150, 170), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`K${e.kalpa}+`, { size: 11 }), k.pos(740, y + 6), k.color(100, 100, 120), k.fixed(), k.z(101)]));
    y += 48;
  });
}

export function renderRebirth(k: KAPLAYCtx, tabContent: GameObj[]): void {
  const w = config.screen.width;

  // Powerups row
  tabContent.push(k.add([
    k.text('Powerups', { size: 18 }), k.pos(w / 2, 118), k.anchor('center'), k.color(255, 215, 0), k.fixed(), k.z(101),
  ]));
  const powerups = [
    { name: 'Compassion', color: '#FF69B4', effect: 'Spread' },
    { name: 'Wisdom', color: '#4169E1', effect: 'Pierce' },
    { name: 'Patience', color: '#32CD32', effect: 'Slow' },
    { name: 'Diligence', color: '#FFD700', effect: 'Rapid' },
    { name: 'Meditation', color: '#9370DB', effect: 'Shield' },
    { name: 'Paduma', color: '#FFB6C1', effect: 'Heal' },
  ];
  let px = 70;
  powerups.forEach(p => {
    tabContent.push(k.add([k.circle(8), k.pos(px, 145), k.color(k.Color.fromHex(p.color)), k.anchor('center'), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.name, { size: 12 }), k.pos(px, 160), k.anchor('center'), k.color(180, 180, 200), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.effect, { size: 11 }), k.pos(px, 175), k.anchor('center'), k.color(120, 120, 140), k.fixed(), k.z(101)]));
    px += 115;
  });

  // Paramis section
  tabContent.push(k.add([
    k.text('Paramis (Buffs)', { size: 16 }), k.pos(55, 200), k.color(144, 238, 144), k.fixed(), k.z(101),
  ]));
  tabContent.push(k.add([
    k.text('Max', { size: 12 }), k.pos(355, 202), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const paramis = [
    { name: 'Dana', effect: '1.25x drop rate', max: 1 },
    { name: 'Viriya', effect: '+10% fire rate', max: 5 },
    { name: 'Metta', effect: '+1 max HP', max: 7 },
    { name: 'Upekkha', effect: '-10% enemy speed', max: 5 },
    { name: 'Sila', effect: 'Auto-shield on spawn', max: 1 },
    { name: 'Khanti', effect: '+20% powerup duration', max: 5 },
    { name: 'Panna', effect: '+1 damage', max: 2 },
    { name: 'Adhitthana', effect: '+1 shield charge', max: 1 },
    { name: 'Nekkhamma', effect: '+50% karma gain', max: 2 },
    { name: 'Sacca', effect: '+5% lotus drop', max: 1 },
  ];
  let y = 226;
  paramis.forEach(p => {
    tabContent.push(k.add([k.text(p.name, { size: 14 }), k.pos(60, y), k.color(180, 255, 180), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(p.effect, { size: 14 }), k.pos(155, y), k.color(140, 200, 140), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`${p.max}`, { size: 14 }), k.pos(360, y), k.color(100, 150, 100), k.fixed(), k.z(101)]));
    y += 26;
  });

  // Kleshas section
  tabContent.push(k.add([
    k.text('Kleshas (Debuffs)', { size: 16 }), k.pos(400, 200), k.color(255, 100, 100), k.fixed(), k.z(101),
  ]));
  tabContent.push(k.add([
    k.text('Max', { size: 12 }), k.pos(755, 202), k.color(100, 100, 120), k.fixed(), k.z(101),
  ]));
  const kleshas = [
    { name: 'Lobha', effect: '-25% drop rate', max: 2 },
    { name: 'Dosa', effect: '+10% enemy speed', max: 3 },
    { name: 'Mana', effect: '-1 max HP', max: 5 },
    { name: 'Vicikiccha', effect: '-10% fire rate', max: 3 },
    { name: 'Moha', effect: '-20% powerup duration', max: 2 },
    { name: 'Thina', effect: '-10% player speed', max: 2 },
    { name: 'Anottappa', effect: '-1 damage', max: 1 },
    { name: 'Micchaditthi', effect: '-25% karma gain', max: 2 },
  ];
  y = 226;
  kleshas.forEach(kl => {
    tabContent.push(k.add([k.text(kl.name, { size: 14 }), k.pos(405, y), k.color(255, 150, 150), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(kl.effect, { size: 14 }), k.pos(520, y), k.color(200, 140, 140), k.fixed(), k.z(101)]));
    tabContent.push(k.add([k.text(`${kl.max}`, { size: 14 }), k.pos(760, y), k.color(150, 100, 100), k.fixed(), k.z(101)]));
    y += 26;
  });
}
