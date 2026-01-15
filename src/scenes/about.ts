// About scene - bestiary, lore, and controls
import type { KAPLAYCtx, GameObj } from 'kaplay';
import config from '../data/config.json';

export function createAboutScene(k: KAPLAYCtx): void {
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
    // Header
    pageContent.push(k.add([
      k.text('When you die, your karma determines your rebirth.', { size: 18 }),
      k.pos(config.screen.width / 2, 120),
      k.anchor('center'),
      k.color(180, 180, 200),
    ]));

    // Paramis section
    pageContent.push(k.add([
      k.text('Paramis (Perfections) - Buffs', { size: 20 }),
      k.pos(60, 160),
      k.color(144, 238, 144),
    ]));

    const paramis = [
      { name: 'Dana', trans: 'Generosity', desc: 'Selfless giving', effect: '+25% powerup drops' },
      { name: 'Viriya', trans: 'Diligence', desc: 'Persistent effort', effect: '+15% fire rate' },
      { name: 'Metta', trans: 'Loving-kindness', desc: 'Universal goodwill', effect: '+1 max health' },
      { name: 'Upekkha', trans: 'Equanimity', desc: 'Mental calmness', effect: 'Enemies 10% slower' },
    ];

    let y = 190;
    paramis.forEach(p => {
      pageContent.push(k.add([
        k.text(`${p.name} (${p.trans})`, { size: 16 }),
        k.pos(70, y),
        k.color(180, 255, 180),
      ]));
      pageContent.push(k.add([
        k.text(`${p.desc} | ${p.effect}`, { size: 14 }),
        k.pos(70, y + 18),
        k.color(130, 130, 150),
      ]));
      y += 44;
    });

    // Kleshas section
    pageContent.push(k.add([
      k.text('Kleshas (Afflictions) - Debuffs', { size: 20 }),
      k.pos(60, y + 15),
      k.color(255, 100, 100),
    ]));

    const kleshas = [
      { name: 'Lobha', trans: 'Greed', desc: 'Clinging attachment', effect: '-25% powerup drops' },
      { name: 'Dosa', trans: 'Hatred', desc: 'Aversion and anger', effect: 'Enemies 10% faster' },
      { name: 'Mana', trans: 'Conceit', desc: 'Pride and arrogance', effect: '-1 max health' },
      { name: 'Vicikiccha', trans: 'Doubt', desc: 'Spiritual uncertainty', effect: '-15% fire rate' },
    ];

    y += 45;
    kleshas.forEach(kl => {
      pageContent.push(k.add([
        k.text(`${kl.name} (${kl.trans})`, { size: 16 }),
        k.pos(70, y),
        k.color(255, 150, 150),
      ]));
      pageContent.push(k.add([
        k.text(`${kl.desc} | ${kl.effect}`, { size: 14 }),
        k.pos(70, y + 18),
        k.color(130, 130, 150),
      ]));
      y += 44;
    });
  }

  showControls();

  k.onKeyPress('1', showControls);
  k.onKeyPress('2', showBestiary);
  k.onKeyPress('3', showLore);
  k.onKeyPress('4', showRebirth);
  k.onKeyPress('escape', () => k.go('menu'));
  k.onKeyPress('b', () => k.go('menu'));
}
