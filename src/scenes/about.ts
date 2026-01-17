// About scene - bestiary, lore, and controls
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

interface AboutSceneData {
  returnTo?: string;
}

export function createAboutScene(k: KAPLAYCtx, data?: AboutSceneData): void {
  const returnTo = data?.returnTo || 'menu';
  let pageContent: GameObj[] = [];

  k.add([
    k.rect(config.screen.width, config.screen.height),
    k.pos(0, 0),
    k.color(15, 15, 30),
  ]);

  k.add([
    k.text('About Dharma Invaders', { size: 32 }),
    k.pos(config.screen.width / 2, 40),
    k.anchor('center'),
    k.color(255, 215, 0),
  ]);

  // Tab navigation
  k.add([
    k.text('(1) Controls  (2) Bestiary  (3) Lore  (4) Rebirth  (ESC) Back', { size: 14 }),
    k.pos(config.screen.width / 2, 80),
    k.anchor('center'),
    k.color(150, 150, 170),
  ]);

  function clearPage(): void {
    pageContent.forEach(obj => obj.destroy());
    pageContent = [];
  }

  function showControls(): void {
    clearPage();
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

  function showBestiary(): void {
    clearPage();
    const enemies = [
      { name: 'Hungry Ghost', color: [255, 68, 68], desc: 'Erratic, 1 HP, 10 karma', realm: 'Realm of hungry spirits' },
      { name: 'Asura', color: [255, 140, 0], desc: 'Aggressive, 2 HP, 25 karma', realm: 'Realm of jealous demigods' },
      { name: 'Deva', color: [147, 112, 219], desc: 'Graceful, 3 HP, 50 karma', realm: 'Heavenly realm of pleasure' },
      { name: 'Mara', color: [139, 0, 0], desc: 'The Lord of Illusion - Final Boss', realm: 'Master of the Wheel of Samsara' },
    ];
    let y = 140;
    enemies.forEach(e => {
      const [r, g, b] = e.color;
      pageContent.push(k.add([k.rect(20, 20), k.pos(80, y - 5), k.color(r, g, b)]));
      pageContent.push(k.add([k.text(e.name, { size: 18 }), k.pos(115, y), k.color(r, g, b)]));
      pageContent.push(k.add([k.text(e.desc, { size: 14 }), k.pos(115, y + 22), k.color(150, 150, 170)]));
      pageContent.push(k.add([k.text(e.realm, { size: 12 }), k.pos(115, y + 40), k.color(100, 100, 120)]));
      y += 70;
    });
  }

  function showLore(): void {
    clearPage();
    const lines = [
      'In Buddhist cosmology, all sentient beings are trapped',
      'in the Wheel of Samsara - the cycle of birth and rebirth.',
      '',
      'The Six Realms house beings in various states of existence:',
      'Gods, Asuras, Humans, Animals, Hungry Ghosts, and Hell beings.',
      '',
      'Mara, the demon of desire and death, keeps all beings',
      'trapped in this cycle through illusion and attachment.',
      '',
      'Only through cultivating the virtues - Compassion, Wisdom,',
      'Patience, Diligence, and Meditation - can one break free',
      'and achieve Nirvana: the cessation of suffering.',
    ];
    let y = 140;
    lines.forEach(line => {
      if (line) {
        pageContent.push(k.add([
          k.text(line, { size: 14 }),
          k.pos(config.screen.width / 2, y),
          k.anchor('center'),
          k.color(180, 180, 200),
        ]));
      }
      y += 22;
    });
  }

  function showRebirth(): void {
    clearPage();
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
      { name: 'Dana(Generosity)', effect: '1.25x drops', max: 1 },
      { name: 'Viriya(Energy)', effect: '+10% fire rate', max: 5 },
      { name: 'Metta(Loving-kindness)', effect: '+1 HP', max: 7 },
      { name: 'Upekkha(Equanimity)', effect: '-10% enemy spd', max: 5 },
      { name: 'Sila(Virtue)', effect: 'Auto-shield', max: 1 },
      { name: 'Khanti(Patience)', effect: '+20% duration', max: 5 },
      { name: 'Panna(Wisdom)', effect: '+1 damage', max: 2 },
      { name: 'Adhitthana(Resolve)', effect: '+1 shield', max: 1 },
      { name: 'Nekkhamma(Renunciation)', effect: '+50% karma', max: 2 },
      { name: 'Sacca(Truthfulness)', effect: '+5% lotus', max: 1 },
    ];
    let y = 238;
    paramis.forEach(p => {
      pageContent.push(k.add([k.text(p.name, { size: 15 }), k.pos(45, y), k.color(180, 255, 180)]));
      pageContent.push(k.add([k.text(p.effect, { size: 15 }), k.pos(260, y), k.color(140, 200, 140)]));
      pageContent.push(k.add([k.text(`${p.max}`, { size: 15 }), k.pos(380, y), k.color(100, 150, 100)]));
      y += 29;
    });

    // Kleshas section
    pageContent.push(k.add([
      k.text('Kleshas (Afflictions)', { size: 18 }), k.pos(405, 210), k.color(255, 100, 100),
    ]));
    pageContent.push(k.add([
      k.text('Max', { size: 14 }), k.pos(765, 212), k.color(100, 100, 120),
    ]));
    const kleshas = [
      { name: 'Lobha(Greed)', effect: '-25% drops', max: 2 },
      { name: 'Dosa(Hatred)', effect: '+10% enemy spd', max: 3 },
      { name: 'Mana(Pride)', effect: '-1 HP', max: 5 },
      { name: 'Vicikiccha(Doubt)', effect: '-10% fire rate', max: 3 },
      { name: 'Moha(Delusion)', effect: '-20% duration', max: 2 },
      { name: 'Thina(Sloth)', effect: '-10% player spd', max: 2 },
      { name: 'Anottappa(Reckless)', effect: '-1 damage', max: 1 },
      { name: 'Micchaditthi(Wrong View)', effect: '-25% karma', max: 2 },
    ];
    y = 238;
    kleshas.forEach(kl => {
      pageContent.push(k.add([k.text(kl.name, { size: 15 }), k.pos(410, y), k.color(255, 150, 150)]));
      pageContent.push(k.add([k.text(kl.effect, { size: 15 }), k.pos(615, y), k.color(200, 140, 140)]));
      pageContent.push(k.add([k.text(`${kl.max}`, { size: 15 }), k.pos(765, y), k.color(150, 100, 100)]));
      y += 29;
    });

    // Footer
    pageContent.push(k.add([
      k.text('Karma at death determines buffs/debuffs. Effects stack per rebirth.', { size: 14 }),
      k.pos(w / 2, 540), k.anchor('center'), k.color(100, 100, 120),
    ]));
  }

  showControls();

  k.onKeyPress('1', showControls);
  k.onKeyPress('2', showBestiary);
  k.onKeyPress('3', showLore);
  k.onKeyPress('4', showRebirth);
  k.onKeyPress('escape', () => k.go(returnTo));
  k.onKeyPress('b', () => k.go(returnTo));
}
