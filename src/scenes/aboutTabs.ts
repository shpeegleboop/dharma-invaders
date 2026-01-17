// About scene tab content rendering
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function showControls(k: KAPLAYCtx, pageContent: GameObj[]): void {
  const items = [
    { label: 'Move', value: 'WASD' },
    { label: 'Aim', value: 'Mouse' },
    { label: 'Shoot', value: 'Left Click / SPACE (hold for auto-fire)' },
    { label: 'Pause', value: 'ESC' },
  ];
  let y = 140;
  items.forEach(item => {
    pageContent.push(k.add([
      k.text(`${item.label}:`, { size: 18 }),
      k.pos(200, y),
      k.color(200, 180, 100),
    ]));
    pageContent.push(k.add([
      k.text(item.value, { size: 16 }),
      k.pos(320, y + 2),
      k.color(180, 180, 200),
    ]));
    y += 35;
  });
  pageContent.push(k.add([
    k.text('Collect virtue power-ups to gain abilities.', { size: 14 }),
    k.pos(config.screen.width / 2, y + 30),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]));
  pageContent.push(k.add([
    k.text('Defeat 8 waves of enemies and vanquish Mara!', { size: 14 }),
    k.pos(config.screen.width / 2, y + 55),
    k.anchor('center'),
    k.color(120, 120, 140),
  ]));
}

export function showBestiary(k: KAPLAYCtx, pageContent: GameObj[]): void {
  // Helper to create hexagon vertices
  const hexVerts = (size: number) => {
    const verts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      verts.push(k.vec2(Math.cos(angle) * size, Math.sin(angle) * size));
    }
    return verts;
  };

  // Base enemies (left column)
  const baseEnemies = [
    { name: 'Petā', color: [255, 68, 68], desc: 'Erratic, 1 HP, 10 karma', realm: 'Realm of hungry spirits' },
    { name: 'Asurā', color: [255, 140, 0], desc: 'Aggressive, 2 HP, 25 karma', realm: 'Realm of jealous demigods' },
    { name: 'Devā', color: [147, 112, 219], desc: 'Graceful, 3 HP, 50 karma', realm: 'Heavenly realm' },
    { name: 'Māra', color: [139, 0, 0], desc: 'Lord of Illusion - Boss', realm: 'Master of Samsara' },
  ];
  let y = 125;
  baseEnemies.forEach(e => {
    const [r, g, b] = e.color;
    pageContent.push(k.add([k.rect(24, 24), k.pos(50, y), k.anchor('center'), k.color(r, g, b)]));
    pageContent.push(k.add([k.text(e.name, { size: 20 }), k.pos(80, y - 12), k.color(r, g, b)]));
    pageContent.push(k.add([k.text(e.desc, { size: 16 }), k.pos(80, y + 10), k.color(150, 150, 170)]));
    pageContent.push(k.add([k.text(e.realm, { size: 14 }), k.pos(80, y + 30), k.color(100, 100, 120)]));
    y += 70;
  });

  // New enemies (right column) - unlock in later kalpas
  pageContent.push(k.add([
    k.text('Unlocked in Later Kalpas', { size: 20 }), k.pos(420, 105), k.color(100, 100, 120),
  ]));

  // Nerayikā - hexagon
  y = 150;
  pageContent.push(k.add([k.polygon(hexVerts(14)), k.pos(432, y), k.anchor('center'), k.color(255, 69, 0)]));
  pageContent.push(k.add([k.text('Nerayikā', { size: 20 }), k.pos(465, y - 14), k.color(255, 69, 0)]));
  pageContent.push(k.add([k.text('Charger, 4 HP, applies Klesha', { size: 16 }), k.pos(465, y + 8), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Hell realm (Kalpa 2+)', { size: 14 }), k.pos(465, y + 28), k.color(100, 100, 120)]));

  // Tiracchānā - triangle
  y += 70;
  const triVerts = [k.vec2(0, -14), k.vec2(14, 12), k.vec2(-14, 12)];
  pageContent.push(k.add([k.polygon(triVerts), k.pos(432, y), k.anchor('center'), k.color(65, 105, 225)]));
  pageContent.push(k.add([k.text('Tiracchānā', { size: 20 }), k.pos(465, y - 14), k.color(65, 105, 225)]));
  pageContent.push(k.add([k.text('Pack of 6, removes Pāramī', { size: 16 }), k.pos(465, y + 8), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Animal realm (Kalpa 3+)', { size: 14 }), k.pos(465, y + 28), k.color(100, 100, 120)]));

  // Manussā - rectangle
  y += 70;
  pageContent.push(k.add([k.rect(24, 24), k.pos(432, y), k.anchor('center'), k.color(0, 255, 0)]));
  pageContent.push(k.add([k.text('Manussā', { size: 20 }), k.pos(465, y - 14), k.color(0, 255, 0)]));
  pageContent.push(k.add([k.text('Non-hostile, +1000 if spared', { size: 16 }), k.pos(465, y + 8), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Human realm (Kalpa 4+)', { size: 14 }), k.pos(465, y + 28), k.color(100, 100, 120)]));
}

export function showLore(k: KAPLAYCtx, pageContent: GameObj[]): void {
  const lines = [
    'In Buddhist cosmology, all sentient beings are trapped',
    'in the wheel of Samsara - the cycle of rebirth.',
    '',
    'The Six Realms house beings in various states of existence:',
    'Devā(Gods), Asurā(Demons), Manussā(Humans),',
    'Tiracchānā(Animals), Petā(Hungry Ghosts), and Nerayikā(Hell Beings).',
    '',
    'Mara, the demon of desire and death, keeps all beings',
    'trapped in this cycle through delusion and attachment.',
    '',
    'Skillful actions cultivate Pāramīs(perfections) in the bodymind',
    'and weaken the grip of suffering. Unskillful actions generate',
    'Kleshas(defilements) and multiply our miseries.',
    '',
    'Only through cultivating the virtues of Compassion, Wisdom,',
    'Patience, and Diligence through the process of Meditation',
    'can one see anicca(impermanence), realize anattā(no continuous',
    '"self" exists within us from moment to moment), and attain Nirvana,',
    'the state beyond existence and nonexistence, free from all suffering.',
    '',
    'May all beings be happy.',
  ];
  let y = 115;
  lines.forEach(line => {
    if (line) {
      pageContent.push(k.add([
        k.text(line, { size: 15 }),
        k.pos(config.screen.width / 2, y),
        k.anchor('center'),
        k.color(180, 180, 200),
      ]));
    }
    y += 22;
  });
}

export function showRebirth(k: KAPLAYCtx, pageContent: GameObj[]): void {
  const w = config.screen.width;

  // Powerups section
  pageContent.push(k.add([
    k.text('Virtue Powerups', { size: 20 }), k.pos(w / 2, 115), k.anchor('center'), k.color(255, 215, 0),
  ]));
  const powerups = [
    { name: 'Compassion', color: '#FF69B4', effect: 'Spread shot' },
    { name: 'Wisdom', color: '#4169E1', effect: 'Piercing' },
    { name: 'Patience', color: '#32CD32', effect: 'Slow enemies' },
    { name: 'Diligence', color: '#FFD700', effect: 'Rapid fire' },
    { name: 'Meditation', color: '#9370DB', effect: 'Shield' },
    { name: 'Paduma(Lotus)', color: '#FFB6C1', effect: '+1 HP (Kalpa 2+)' },
  ];
  let px = 70;
  powerups.forEach(p => {
    pageContent.push(k.add([k.circle(10), k.pos(px, 145), k.color(k.Color.fromHex(p.color)), k.anchor('center')]));
    pageContent.push(k.add([k.text(p.name, { size: 14 }), k.pos(px, 162), k.anchor('center'), k.color(200, 200, 220)]));
    pageContent.push(k.add([k.text(p.effect, { size: 12 }), k.pos(px, 180), k.anchor('center'), k.color(140, 140, 160)]));
    px += 122;
  });

  // Paramis section
  pageContent.push(k.add([
    k.text('Paramis (Perfections)', { size: 18 }), k.pos(40, 210), k.color(144, 238, 144),
  ]));
  pageContent.push(k.add([
    k.text('Max', { size: 14 }), k.pos(380, 212), k.color(100, 100, 120),
  ]));
  const paramis = [
    { name: 'Dāna(Generosity)', effect: '1.25x drops', max: 1 },
    { name: 'Viriya(Energy)', effect: '+10% fire rate', max: 5 },
    { name: 'Mettā(Loving-kindness)', effect: '+1 HP', max: 7 },
    { name: 'Upekkhā(Equanimity)', effect: '-10% enemy spd', max: 5 },
    { name: 'Sīla(Morality)', effect: 'Auto-shield', max: 1 },
    { name: 'Khantī(Patience)', effect: '+20% duration', max: 5 },
    { name: 'Paññā(Wisdom)', effect: '+1 damage', max: 2 },
    { name: 'Adhiṭṭhāna(Determination)', effect: '+1 shield', max: 1 },
    { name: 'Nekkhamma(Renunciation)', effect: '+50% karma', max: 2 },
    { name: 'Sacca(Truthfulness)', effect: '+5% lotus', max: 1 },
  ];
  let y = 238;
  paramis.forEach(p => {
    pageContent.push(k.add([k.text(p.name, { size: 15 }), k.pos(45, y), k.color(180, 255, 180)]));
    pageContent.push(k.add([k.text(p.effect, { size: 15 }), k.pos(260, y), k.color(140, 200, 140)]));
    pageContent.push(k.add([k.text(`${p.max}`, { size: 15 }), k.pos(390, y), k.color(100, 150, 100)]));
    y += 29;
  });

  // Kleshas section
  pageContent.push(k.add([
    k.text('Kleshas (Afflictions)', { size: 18 }), k.pos(405, 210), k.color(255, 100, 100),
  ]));
  pageContent.push(k.add([
    k.text('Max', { size: 14 }), k.pos(775, 212), k.color(100, 100, 120),
  ]));
  const kleshas = [
    { name: 'Lobha(Greed)', effect: '-25% drops', max: 2 },
    { name: 'Dosa(Aversion)', effect: '+10% enemy spd', max: 3 },
    { name: 'Māna(Conceit)', effect: '-1 HP', max: 5 },
    { name: 'Vicikicchā(Doubt)', effect: '-10% fire rate', max: 3 },
    { name: 'Moha(Delusion)', effect: '-20% duration', max: 2 },
    { name: 'Thīna(Sloth)', effect: '-10% player spd', max: 2 },
    { name: 'Anottappa(Recklessness)', effect: '-1 damage', max: 1 },
    { name: 'Micchādiṭṭhi(Wrong View)', effect: '-25% karma', max: 2 },
    { name: 'Ahirika(Shamelessness)', effect: 'Flip Manussā karma', max: 1 },
  ];
  y = 238;
  kleshas.forEach(kl => {
    pageContent.push(k.add([k.text(kl.name, { size: 15 }), k.pos(410, y), k.color(255, 150, 150)]));
    pageContent.push(k.add([k.text(kl.effect, { size: 15 }), k.pos(615, y), k.color(200, 140, 140)]));
    pageContent.push(k.add([k.text(`${kl.max}`, { size: 15 }), k.pos(775, y), k.color(150, 100, 100)]));
    y += 29;
  });

  // Footer
  pageContent.push(k.add([
    k.text('Karma at death determines buffs/debuffs. Effects stack per rebirth.', { size: 14 }),
    k.pos(w / 2, 540), k.anchor('center'), k.color(100, 100, 120),
  ]));
}
