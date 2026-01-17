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
    pageContent.push(k.add([
      k.text('Karma determines rebirth. High karma = Paramis (buffs). Low = Kleshas (debuffs).', { size: 14 }),
      k.pos(config.screen.width / 2, 115), k.anchor('center'), k.color(150, 150, 170),
    ]));

    // Paramis - left column
    pageContent.push(k.add([
      k.text('Paramis (Perfections)', { size: 18 }), k.pos(60, 145), k.color(144, 238, 144),
    ]));
    const paramis = [
      'Dana (1): 1.25x drop rate',
      'Viriya (5): +10% fire rate/stack',
      'Metta (7): +1 HP/stack',
      'Upekkha (5): -10% enemy speed/stack',
      'Sila (1): Auto-shield on spawn',
      'Khanti (5): +20% powerup duration/stack',
      'Panna (2): +1 damage/stack',
      'Adhitthana (1): +1 shield charge',
      'Nekkhamma (2): +50% karma/stack',
      'Sacca (3): +5% lotus drop/stack',
    ];
    let y = 170;
    paramis.forEach(p => {
      pageContent.push(k.add([k.text(p, { size: 13 }), k.pos(70, y), k.color(180, 255, 180)]));
      y += 20;
    });

    // Kleshas - right column
    pageContent.push(k.add([
      k.text('Kleshas (Afflictions)', { size: 18 }), k.pos(420, 145), k.color(255, 100, 100),
    ]));
    const kleshas = [
      'Lobha (2): -25% drop rate/stack',
      'Dosa (3): +10% enemy speed/stack',
      'Mana (5): -1 HP/stack',
      'Vicikiccha (3): -10% fire rate/stack',
      'Moha (2): -20% powerup duration/stack',
      'Thina (2): -10% player speed/stack',
      'Anottappa (1): -1 damage',
      'Micchaditthi (2): -25% karma/stack',
    ];
    y = 170;
    kleshas.forEach(kl => {
      pageContent.push(k.add([k.text(kl, { size: 13 }), k.pos(430, y), k.color(255, 150, 150)]));
      y += 20;
    });

    // Footer
    pageContent.push(k.add([
      k.text('(N) = max stacks. Effects stack with powerups and scale across Kalpas.', { size: 12 }),
      k.pos(config.screen.width / 2, 390), k.anchor('center'), k.color(100, 100, 120),
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
