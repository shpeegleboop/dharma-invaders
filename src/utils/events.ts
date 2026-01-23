// Type-safe event bus for game-wide communication
// Systems communicate via events, NEVER direct imports between entities

type GameEvents = {
  // Combat
  'enemy:spawned': { id: string; type: string; position: { x: number; y: number } };
  'enemy:killed': { id: string; type: string; position: { x: number; y: number }; karmaValue: number; silent?: boolean };
  'enemy:escaped': { id: string };
  'projectile:fired': { type: string; position: { x: number; y: number } };

  // Player
  'player:hit': { damage: number; remainingHealth: number };
  'player:died': Record<string, never>;
  'player:powerup': { type: string };
  'player:healed': { amount: number; newHealth: number };
  'player:applyKlesha': { klesha: string };
  'player:removeParami': { parami: string | null };

  // Manussa (Human) special events
  'human:killed': Record<string, never>;
  'human:killed:ahirika': Record<string, never>;
  'human:escaped': Record<string, never>;

  // Game flow
  'wave:started': { waveNumber: number };
  'wave:complete': { waveNumber: number };
  'boss:started': Record<string, never>;
  'boss:phaseChange': { phase: number };
  'boss:spawnMinion': { x: number; y: number; type?: 'hungryGhost' | 'asura' | 'nerayika' };
  'boss:defeated': Record<string, never>;
  'game:victory': Record<string, never>;
  'game:over': Record<string, never>;

  // Powerups
  'powerup:activated': { type: string };
  'powerup:deactivated': { type: string };
  'powerup:shieldBroken': Record<string, never>;

  // Systems
  'karma:changed': { newValue: number; delta: number };
  'audio:play': { sound: string };
  'debug:toggle': { feature: string };
  'debug:skipToWave': { wave: number };
  'debug:skipToBoss': Record<string, never>;
};

type EventCallback<T> = (data: T) => void;

class EventBus {
  private listeners = new Map<string, Set<EventCallback<unknown>>>();

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
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
  }

  once<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });
  }

  // Clear all listeners (useful for scene cleanup)
  clear(): void {
    this.listeners.clear();
  }
}

export const events = new EventBus();
export type { GameEvents };
