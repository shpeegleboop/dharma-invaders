# Dharma Invaders: Retrospective Roadmap
## "What We Learned Building It the First Time"

*A post-mortem turned pre-mortem — lessons from shipping v1, now applied to a clean rebuild.*

---

## The Story of v1

We shipped Dharma Invaders. It worked. Players defeated Mara, reached nirvana, and the lofi vibes hit just right. But under the hood? A tangled mess of spaghetti that made every bug fix spawn two more.

Here's what went wrong, what went right, and the exact playbook for building it properly from scratch.

---

## Part 1: What We Got Wrong (And How to Fix It)

### 🔴 Mistake #1: The 800-Line `game.ts` Monster

**What happened:** We started with "just get something working" and kept adding to a single file. By week two, `game.ts` handled player movement, enemy spawning, collision, scoring, audio triggers, and half the UI. Claude's suggestions got worse because context was polluted.

**The fix:** Strict file separation from day one. No file over 150 lines. If it's growing, split it.

### 🔴 Mistake #2: Direct Object References Everywhere

**What happened:** `player.ts` imported `enemy.ts` imported `score.ts` imported `player.ts`. Circular dependency hell. Changing the enemy death animation broke the karma counter somehow.

**The fix:** Event bus pattern. Objects don't talk to each other — they broadcast events into the void, and whoever cares, listens.

### 🔴 Mistake #3: Hardcoded Everything

**What happened:** Enemy speed was `5`. Player health was `3`. Wave timing was `2000`. All buried in logic files. Balancing meant grep-ing through 20 files and hoping you found them all.

**The fix:** Single `config.json` for all game constants. Tweak numbers without touching code.

### 🔴 Mistake #4: Pretty Art Before Fun Gameplay

**What happened:** Spent two days getting the Buddha sprite animation perfect. Then realized the movement felt bad and had to redo the hitbox anyway. Wasted work.

**The fix:** Colored rectangles until the game is fun. Art is the *last* 20% of work.

### 🔴 Mistake #5: No Delta Time

**What happened:** Game ran perfectly on our 60fps monitor. Unplayable on a 144hz screen (everything 2x speed). Reported as "broken" by testers.

**The fix:** Every movement multiplied by `dt` from frame one. Non-negotiable.

### 🔴 Mistake #6: No Debug Tools

**What happened:** Testing the Mara boss fight meant playing through 8 waves every single time. Spent 40% of dev time just *getting to* the thing we were testing.

**The fix:** Debug keys built on day one: skip to boss, toggle invincibility, show hitboxes, give all powerups.

### 🔴 Mistake #7: Git Commits? What Git Commits?

**What happened:** Broke something. Couldn't remember what working state looked like. Lost 3 hours recreating from memory.

**The fix:** Commit after every working feature. Descriptive messages. No exceptions.

---

## Part 2: What We Got Right

### ✅ Kaplay Was the Right Choice

Phaser would've been overkill. Kaplay's simple API meant Claude generated cleaner code with fewer hallucinations. The docs were small enough to fit in context.

### ✅ The Thematic Coherence Carried Us

When motivation flagged, the Buddhist theme kept us engaged. Designing enemy types based on the six realms of samsara was genuinely fun. The virtue projectiles with different effects (compassion = spread, wisdom = pierce) gave natural variety.

### ✅ TypeScript Caught Stupid Bugs

The strict typing meant Claude's generated code was more reliable. Type errors caught before runtime saved hours.

### ✅ Zustand for State Management

Lightweight, simple, worked great with the event bus. No Redux boilerplate nightmares.

### ✅ The "Vertical Slice First" Approach

Building one complete wave with one enemy type, testing it until fun, *then* expanding. This worked beautifully.

---

## Part 3: The Refined Build Order

Based on v1 experience, here's the optimal sequence. Each step is **fully testable before moving on.**

### Phase 0: Foundation (Day 1)
| Step | Task | Claude Code Prompt | Done When |
|------|------|-------------------|-----------|
| 0.1 | Create Vite + TS project | `npm create vite@latest dharma-invaders -- --template vanilla-ts` | Project runs |
| 0.2 | Install deps | `npm install kaplay zustand howler` | No errors |
| 0.3 | Create folder structure | See structure below | All folders exist |
| 0.4 | Create `config.json` | All game constants in one place | File exists with sensible defaults |
| 0.5 | Create `events.ts` | Type-safe event bus | Can emit and listen to events |
| 0.6 | Create debug overlay | FPS counter, state display | Visible on screen |
| 0.7 | Git init + first commit | — | Clean starting point saved |

### Phase 1: Core Loop (Days 2-3)
| Step | Task | Deliverable | Test |
|------|------|-------------|------|
| 1.1 | Game shell | Empty canvas, Kaplay initialized, game loop running | See blank screen, no errors |
| 1.2 | Player rectangle | WASD/arrow movement, stays in bounds | Move around, can't leave screen |
| 1.3 | Basic shooting | Spacebar fires rectangles upward | Projectiles appear, travel up, despawn |
| 1.4 | Single enemy | One rectangle spawns at top, moves down | Enemy appears, moves, despawns at bottom |
| 1.5 | Collision detection | Projectile + enemy = both destroyed | Shoot enemy, both disappear |
| 1.6 | Karma counter | Score increases on kill, displays on screen | Kill enemy, see number go up |

**Checkpoint commit: "Core loop working — shoot rectangles at rectangles"**

### Phase 2: Game Systems (Days 4-6)
| Step | Task | Deliverable | Test |
|------|------|-------------|------|
| 2.1 | Wave spawner | Enemies spawn in patterns from `waves.json` | Multiple enemies appear in formation |
| 2.2 | Enemy variants | 3 types (Hungry Ghost, Asura, Deva) with different behaviors | Each moves/acts differently |
| 2.3 | Player health | 3 hits, damage on enemy collision, brief invincibility | Get hit, health drops, brief flash |
| 2.4 | Death + restart | Game over state, press to restart | Die, see game over, restart works |
| 2.5 | Power-up drops | Enemies sometimes drop virtue orbs | Orbs appear, can collect |
| 2.6 | Virtue effects | 5 power-up types with distinct behaviors | Each virtue does something different |

**Checkpoint commit: "Full game loop — waves, death, powerups working"**

### Phase 3: Content (Days 7-9)
| Step | Task | Deliverable | Test |
|------|------|-------------|------|
| 3.1 | Samsara wheel | Visual spawner element, rotates, enemies emerge from it | Looks cool, enemies spawn from it |
| 3.2 | Quote system | Buddha quotes between waves, fade in/out | See quotes, feels contemplative |
| 3.3 | Audio foundation | Howler setup, one music track, basic SFX | Hear music and sounds |
| 3.4 | Menu scene | Title screen, start button | Can navigate to game |
| 3.5 | Wave progression | 8 waves of increasing difficulty | Game gets harder |

**Checkpoint commit: "Content complete — ready for boss"**

### Phase 4: The Boss (Days 10-12)
| Step | Task | Deliverable | Test |
|------|------|-------------|------|
| 4.1 | Boss intro | Mara appears with dramatic entrance | Feels like a moment |
| 4.2 | Boss Phase 1 | Slow projectile patterns | Learnable, dodgeable |
| 4.3 | Boss Phase 2 | Adds minion spawns | Pressure increases |
| 4.4 | Boss Phase 3 | Enraged mode, faster attacks | Climactic difficulty |
| 4.5 | Boss defeat | Death animation, transition | Satisfying conclusion |
| 4.6 | Nirvana scene | Victory screen, peaceful visuals | Emotional payoff |

**Checkpoint commit: "Boss complete — game is finishable"**

### Phase 5: Persistence (Day 13)
| Step | Task | Deliverable | Test |
|------|------|-------------|------|
| 5.1 | Save system | High score, settings persist to localStorage | Close and reopen, data remains |
| 5.2 | Statistics | Track games played, enemies defeated, etc. | Stats accumulate across sessions |
| 5.3 | Settings menu | Volume sliders, screenshake toggle | Settings actually apply |

**Checkpoint commit: "Persistence working — player progress saves"**

### Phase 6: Polish (Days 14-17)
| Step | Task | Impact |
|------|------|--------|
| 6.1 | Screenshake on hits | High |
| 6.2 | Enemy death particles | High |
| 6.3 | Player invincibility flash | Medium |
| 6.4 | Powerup collection sparkles | Medium |
| 6.5 | Smooth karma counter animation | Medium |
| 6.6 | Boss health bar with drama | High |
| 6.7 | Slow-mo on boss defeat | High |
| 6.8 | Input buffering | Medium |
| 6.9 | Generous hitboxes | High |

**Checkpoint commit: "Polish pass complete — game feels good"**

### Phase 7: Art & Audio (Days 18-21)
| Step | Task | Notes |
|------|------|-------|
| 7.1 | Replace player rectangle | AI-generate base, clean in Aseprite |
| 7.2 | Replace enemy rectangles | 4-frame idle animations each |
| 7.3 | Virtue projectile sprites | Glowy, distinct colors |
| 7.4 | Samsara wheel art | Large, ornate, central |
| 7.5 | Mara boss sprite | 8-12 frames for attack poses |
| 7.6 | Background | Subtle gradient or pattern |
| 7.7 | Lofi tracks | Menu, gameplay, boss (Suno/Udio) |
| 7.8 | SFX polish | Soft, satisfying sounds |

**Final commit: "Dharma Invaders v2 complete"**

---

## Part 4: The Folder Structure (Refined)

```
dharma-invaders/
├── src/
│   ├── main.ts                 # Entry point only — just initializes Kaplay
│   ├── scenes/
│   │   ├── boot.ts             # Asset loading with progress bar
│   │   ├── menu.ts             # Title screen
│   │   ├── game.ts             # Core gameplay orchestration (NOT logic)
│   │   ├── boss.ts             # Mara fight scene
│   │   ├── nirvana.ts          # Victory sequence
│   │   └── quote.ts            # Inter-wave contemplation
│   ├── entities/
│   │   ├── player.ts           # Movement + shooting only
│   │   ├── enemy.ts            # Base enemy factory
│   │   ├── enemies/
│   │   │   ├── hungryGhost.ts  # Wispy, erratic
│   │   │   ├── asura.ts        # Aggressive, direct
│   │   │   └── deva.ts         # Floaty, graceful
│   │   ├── projectile.ts       # Virtue bullets
│   │   ├── powerup.ts          # Collectible virtues
│   │   ├── samsaraWheel.ts     # The spawner
│   │   └── mara.ts             # Boss logic + state machine
│   ├── systems/
│   │   ├── collision.ts        # All collision logic
│   │   ├── spawner.ts          # Wave management
│   │   ├── karma.ts            # Scoring
│   │   └── audio.ts            # Music + SFX manager
│   ├── stores/
│   │   └── gameStore.ts        # Zustand state
│   ├── data/
│   │   ├── config.json         # All game constants
│   │   ├── enemies.json        # Enemy definitions
│   │   ├── waves.json          # Wave patterns
│   │   ├── quotes.json         # Buddha wisdom
│   │   └── powerups.json       # Virtue definitions
│   └── utils/
│       ├── events.ts           # Type-safe event bus
│       ├── debug.ts            # Debug tools
│       └── helpers.ts          # Utility functions
├── public/
│   ├── sprites/                # All pixel art
│   ├── audio/
│   │   ├── music/              # Lofi tracks
│   │   └── sfx/                # Sound effects
│   └── fonts/                  # Custom fonts if needed
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src-tauri/                  # Only if wrapping for desktop
```

---

## Part 5: The Event Bus (Copy-Paste Ready)

This is the backbone. Create this first, use it everywhere.

```typescript
// src/utils/events.ts
type GameEvents = {
  // Combat
  'enemy:spawned': { id: string; type: string; position: { x: number; y: number } };
  'enemy:killed': { id: string; type: string; position: { x: number; y: number }; karmaValue: number };
  'enemy:escaped': { id: string };
  'projectile:fired': { type: string; position: { x: number; y: number } };
  
  // Player
  'player:hit': { damage: number; remainingHealth: number };
  'player:died': {};
  'player:powerup': { type: string };
  
  // Game flow
  'wave:started': { waveNumber: number };
  'wave:complete': { waveNumber: number };
  'boss:started': {};
  'boss:phaseChange': { phase: number };
  'boss:defeated': {};
  'game:victory': {};
  'game:over': {};
  
  // Systems
  'karma:changed': { newValue: number; delta: number };
  'audio:play': { sound: string };
  'debug:toggle': { feature: string };
};

type EventCallback<T> = (data: T) => void;

class EventBus {
  private listeners = new Map<string, Set<EventCallback<any>>>();

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(callback);
  }

  once<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });
  }
}

export const events = new EventBus();
```

---

## Part 6: The Config File (Copy-Paste Ready)

```json
{
  "screen": {
    "width": 800,
    "height": 600
  },
  "player": {
    "speed": 300,
    "health": 3,
    "invincibilityDuration": 1500,
    "shootCooldown": 200
  },
  "projectile": {
    "speed": 500,
    "damage": 1
  },
  "enemies": {
    "hungryGhost": {
      "speed": 100,
      "health": 1,
      "karmaValue": 10
    },
    "asura": {
      "speed": 150,
      "health": 2,
      "karmaValue": 25
    },
    "deva": {
      "speed": 80,
      "health": 3,
      "karmaValue": 50
    }
  },
  "waves": {
    "timeBetweenWaves": 3000,
    "timeBetweenSpawns": 500
  },
  "powerups": {
    "dropChance": 0.15,
    "fallSpeed": 100,
    "duration": 8000
  },
  "boss": {
    "health": 100,
    "phase1Threshold": 70,
    "phase2Threshold": 30
  },
  "debug": {
    "showHitboxes": false,
    "invincible": false,
    "skipToWave": 0
  }
}
```

---

## Part 7: Claude Code Prompts (Ready to Copy)

These prompts are refined from v1 experience — specific, bounded, and effective.

### Foundation Prompts

**Event Bus:**
> Create `src/utils/events.ts` with a type-safe event bus. Include event types for: enemy:killed, player:hit, powerup:collected, wave:complete, karma:changed, boss:phaseChange. Each listener should return an unsubscribe function.

**Game Shell:**
> Create `src/main.ts` that initializes Kaplay with an 800x600 canvas and loads the game scene. The game scene should just display "Dharma Invaders" text centered on screen for now.

**Player Movement:**
> Create `src/entities/player.ts`. The player is a 32x32 rectangle that moves with WASD/arrows. Speed comes from config.json. Player cannot leave screen bounds. Emit 'player:moved' events on position change. Use delta time for framerate independence.

### Combat Prompts

**Projectile System:**
> Create `src/entities/projectile.ts`. Spacebar creates a projectile above the player that travels upward at `config.projectile.speed`. Projectiles despawn when leaving the screen. Use an object pool to avoid garbage collection.

**Collision System:**
> Create `src/systems/collision.ts`. Check projectile vs enemy collisions each frame. On collision: destroy both, emit 'enemy:killed' with the enemy's karmaValue, and emit 'audio:play' with 'enemyDeath'.

**Enemy Spawner:**
> Create `src/systems/spawner.ts`. Read wave patterns from `waves.json`. Each wave is an array of spawn instructions with enemy type, x position, and delay. Emit 'wave:started' and 'wave:complete' events. Spawn enemies from the samsara wheel position.

### Boss Prompts

**Mara Boss:**
> Create `src/entities/mara.ts` with a state machine. States: 'entering', 'phase1', 'phase2', 'phase3', 'defeated'. Phase 1: slow aimed projectiles every 2 seconds. Phase 2: add minion spawns every 5 seconds. Phase 3: projectiles are 2x faster. Transition phases at 70% and 30% health. Emit 'boss:phaseChange' on transitions.

---

## Part 8: The Critical Debug Tools

Build these on Day 1. They save 10x their development time.

```typescript
// src/utils/debug.ts
import { events } from './events';

export const debug = {
  enabled: true,
  
  init() {
    if (!this.enabled) return;
    
    // Key bindings
    onKeyPress('f1', () => this.toggleHitboxes());
    onKeyPress('f2', () => this.skipToWave(8)); // Last wave
    onKeyPress('f3', () => this.skipToBoss());
    onKeyPress('f4', () => this.giveAllPowerups());
    onKeyPress('f5', () => this.toggleInvincibility());
    
    // Event logging
    this.logEvents();
  },
  
  toggleHitboxes() {
    events.emit('debug:toggle', { feature: 'hitboxes' });
    console.log('Hitboxes toggled');
  },
  
  skipToWave(wave: number) {
    events.emit('debug:skipToWave', { wave });
    console.log(`Skipping to wave ${wave}`);
  },
  
  skipToBoss() {
    events.emit('debug:skipToBoss', {});
    console.log('Skipping to boss fight');
  },
  
  giveAllPowerups() {
    const powerups = ['compassion', 'wisdom', 'patience', 'diligence', 'meditation'];
    powerups.forEach(p => events.emit('player:powerup', { type: p }));
    console.log('All powerups granted');
  },
  
  toggleInvincibility() {
    events.emit('debug:toggle', { feature: 'invincibility' });
    console.log('Invincibility toggled');
  },
  
  logEvents() {
    // Log all events to console for debugging
    const eventTypes = [
      'enemy:killed', 'player:hit', 'wave:complete', 
      'boss:phaseChange', 'karma:changed'
    ] as const;
    
    eventTypes.forEach(type => {
      events.on(type, (data) => console.log(`[EVENT] ${type}:`, data));
    });
  }
};
```

---

## Part 9: Data Files (Pre-Built)

### waves.json
```json
{
  "waves": [
    {
      "number": 1,
      "spawns": [
        { "type": "hungryGhost", "x": 200, "delay": 0 },
        { "type": "hungryGhost", "x": 400, "delay": 500 },
        { "type": "hungryGhost", "x": 600, "delay": 1000 }
      ]
    },
    {
      "number": 2,
      "spawns": [
        { "type": "hungryGhost", "x": 150, "delay": 0 },
        { "type": "hungryGhost", "x": 300, "delay": 200 },
        { "type": "asura", "x": 450, "delay": 400 },
        { "type": "hungryGhost", "x": 600, "delay": 600 }
      ]
    }
  ]
}
```

### quotes.json
```json
{
  "betweenWaves": [
    "Peace comes from within. Do not seek it without.",
    "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go.",
    "The mind is everything. What you think you become.",
    "Hatred does not cease by hatred, but only by love.",
    "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment."
  ],
  "onDeath": [
    "Even death is not to be feared by one who has lived wisely.",
    "The trouble is, you think you have time."
  ],
  "onVictory": [
    "You have reached the end of suffering.",
    "The dewdrop slips into the shining sea."
  ]
}
```

### powerups.json
```json
{
  "virtues": [
    {
      "type": "compassion",
      "name": "Compassion",
      "effect": "spreadShot",
      "description": "Fire spreads to embrace all beings",
      "color": "#FF69B4"
    },
    {
      "type": "wisdom",
      "name": "Wisdom",
      "effect": "piercing",
      "description": "See through illusion — shots pierce enemies",
      "color": "#4169E1"
    },
    {
      "type": "patience",
      "name": "Patience",
      "effect": "slowMotion",
      "description": "Time flows like water around you",
      "color": "#32CD32"
    },
    {
      "type": "diligence",
      "name": "Diligence",
      "effect": "rapidFire",
      "description": "Persistent effort yields rapid progress",
      "color": "#FFD700"
    },
    {
      "type": "meditation",
      "name": "Meditation",
      "effect": "shield",
      "description": "Inner calm creates an outer barrier",
      "color": "#9370DB"
    }
  ]
}
```

---

## Part 10: The First Day Checklist

Print this. Check boxes as you go.

```
□ Create project: npm create vite@latest dharma-invaders -- --template vanilla-ts
□ cd dharma-invaders && npm install
□ npm install kaplay zustand howler
□ Create folder structure (copy from Part 4)
□ Create src/data/config.json (copy from Part 6)
□ Create src/utils/events.ts (copy from Part 5)
□ Create src/utils/debug.ts (copy from Part 8)
□ Create placeholder data files (quotes.json, waves.json, powerups.json)
□ Create src/main.ts with Kaplay init
□ npm run dev — verify it runs
□ git init && git add . && git commit -m "Initial setup complete"
```

---

## Final Words (From Future You)

We built this game twice. The second time took half as long and was twice as fun to work on. The difference wasn't skill — it was structure.

Every hour spent on architecture saves ten hours of debugging. Every commit is a save point you'll thank yourself for. Every debug tool pays for itself within a day.

Start with rectangles. Make it fun. Then make it pretty.

The path to nirvana is paved with clean code and frequent commits.

🪷

---

*Now go build something beautiful.*
