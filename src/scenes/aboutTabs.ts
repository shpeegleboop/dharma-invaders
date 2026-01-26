// About scene tab content rendering
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function showControls(k: KAPLAYCtx, pageContent: GameObj[]): void {
  const items = [
    { label: 'Move', value: 'WASD' },
    { label: 'Aim', value: 'Mouse' },
    { label: 'Shoot', value: 'Left Click / SPACE (hold for auto-fire)' },
    { label: 'Paṭighāta', value: 'Right Click (5s cooldown)' },
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
  // Base enemies with sprites (left column)
  const spriteEnemies = [
    { name: 'Petā', sprite: 'peta', color: [255, 68, 68], desc: 'Erratic, 1 HP, 10 karma', realm: 'Hungry ghosts' },
    { name: 'Asurā', sprite: 'asura', color: [255, 140, 0], desc: 'Aggressive, 2 HP, 25 karma', realm: 'Jealous demigods' },
    { name: 'Devā', sprite: 'deva', color: [147, 112, 219], desc: 'Graceful, 3 HP, 50 karma', realm: 'Heavenly realm' },
  ];
  let y = 150;
  spriteEnemies.forEach(e => {
    const [r, g, b] = e.color;
    pageContent.push(k.add([k.sprite(e.sprite), k.pos(70, y), k.anchor('center'), k.scale(4)]));
    pageContent.push(k.add([k.text(e.name, { size: 22 }), k.pos(140, y - 25), k.color(r, g, b)]));
    pageContent.push(k.add([k.text(e.desc, { size: 16 }), k.pos(140, y), k.color(150, 150, 170)]));
    pageContent.push(k.add([k.text(e.realm, { size: 14 }), k.pos(140, y + 22), k.color(100, 100, 120)]));
    y += 120;
  });

  // Mara
  y += 20;
  pageContent.push(k.add([k.sprite('mara'), k.pos(70, y), k.anchor('center'), k.scale(2.3)]));
  pageContent.push(k.add([k.text('Māra', { size: 22 }), k.pos(140, y - 25), k.color(139, 0, 0)]));
  pageContent.push(k.add([k.text('Lord of Illusion - Boss', { size: 16 }), k.pos(140, y), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Master of Samsara', { size: 14 }), k.pos(140, y + 22), k.color(100, 100, 120)]));

  // New enemies (right column) - unlock in later kalpas
  pageContent.push(k.add([
    k.text('Unlocked in Later Kalpas', { size: 20 }), k.pos(570, 105), k.anchor('center'), k.color(100, 100, 120),
  ]));

  // Nerayikā
  y = 170;
  pageContent.push(k.add([k.sprite('nerayika'), k.pos(470, y), k.anchor('center'), k.scale(4)]));
  pageContent.push(k.add([k.text('Nerayikā', { size: 22 }), k.pos(540, y - 25), k.color(255, 69, 0)]));
  pageContent.push(k.add([k.text('4 HP, +Klesha (K2+)', { size: 16 }), k.pos(540, y), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Hell realm', { size: 14 }), k.pos(540, y + 22), k.color(100, 100, 120)]));

  // Tiracchānā
  y += 120;
  pageContent.push(k.add([k.sprite('tiracchana'), k.pos(470, y), k.anchor('center'), k.scale(4)]));
  pageContent.push(k.add([k.text('Tiracchānā', { size: 22 }), k.pos(540, y - 25), k.color(65, 105, 225)]));
  pageContent.push(k.add([k.text('Pack of 6, -Pāramī (K3+)', { size: 16 }), k.pos(540, y), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Animal realm', { size: 14 }), k.pos(540, y + 22), k.color(100, 100, 120)]));

  // Manussā (taller sprite, use smaller scale)
  y += 120;
  pageContent.push(k.add([k.sprite('manussa'), k.pos(470, y), k.anchor('center'), k.scale(2)]));
  pageContent.push(k.add([k.text('Manussā', { size: 22 }), k.pos(540, y - 25), k.color(0, 255, 0)]));
  pageContent.push(k.add([k.text('Peaceful (K4+)', { size: 16 }), k.pos(540, y), k.color(150, 150, 170)]));
  pageContent.push(k.add([k.text('Human realm', { size: 14 }), k.pos(540, y + 22), k.color(100, 100, 120)]));
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
    { name: 'Compassion', sprite: 'powerup_compassion', effect: 'Spread shot' },
    { name: 'Wisdom', sprite: 'powerup_wisdom', effect: 'Piercing' },
    { name: 'Patience', sprite: 'powerup_patience', effect: 'Slow enemies' },
    { name: 'Diligence', sprite: 'powerup_diligence', effect: 'Rapid fire' },
    { name: 'Meditation', sprite: 'powerup_meditation', effect: 'Shield' },
    { name: 'Paduma(Lotus)', sprite: 'paduma', effect: '+1 HP (Kalpa 2+)' },
  ];
  let px = 70;
  powerups.forEach(p => {
    pageContent.push(k.add([k.sprite(p.sprite), k.pos(px, 145), k.anchor('center'), k.scale(1.5)]));
    pageContent.push(k.add([k.text(p.name, { size: 14 }), k.pos(px, 165), k.anchor('center'), k.color(200, 200, 220)]));
    pageContent.push(k.add([k.text(p.effect, { size: 12 }), k.pos(px, 183), k.anchor('center'), k.color(140, 140, 160)]));
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
    k.text('Kleshas (Defilements)', { size: 18 }), k.pos(405, 210), k.color(255, 100, 100),
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

  // Vajra section (centered below both columns)
  pageContent.push(k.add([k.sprite('vajra'), k.pos(w / 2 - 90, 530), k.anchor('center'), k.scale(1.2)]));
  pageContent.push(k.add([k.text('Vajra', { size: 18 }), k.pos(w / 2 - 55, 530), k.anchor('left'), k.color(255, 215, 0)]));
  pageContent.push(k.add([k.text('1.5% drop, clears all enemies, +500 karma', { size: 15 }), k.pos(w / 2 + 5, 530), k.anchor('left'), k.color(180, 180, 200)]));

  // Footer
  pageContent.push(k.add([
    k.text('Karma at death determines buffs/debuffs. Effects stack per rebirth.', { size: 14 }),
    k.pos(w / 2, 565), k.anchor('center'), k.color(100, 100, 120),
  ]));
}
