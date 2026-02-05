// New enemy spawner - spawns Nerayika, Tiracchana, Manussa based on kalpa and wave
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';
import { createNerayika } from '../entities/enemies/nerayika';
import { createTiracchana } from '../entities/enemies/tiracchana';
import { createManussa, hasActiveManussa } from '../entities/enemies/manussa';
import { getCycle } from '../stores/gameStore';
import { getRandomEdgePosition, getEdgeFromPosition, getPackOffset } from './spawnPositions';

export function spawnNewEnemies(k: KAPLAYCtx, waveNum: number): void {
  const kalpa = getCycle();
  const waveKey = String(waveNum);

  spawnNerayikas(k, kalpa, waveKey);
  spawnTiracchanas(k, kalpa, waveKey);
  spawnManussa(k, kalpa, waveNum);
}

function spawnNerayikas(k: KAPLAYCtx, kalpa: number, waveKey: string): void {
  if (kalpa < config.newEnemies.nerayika.spawns.minKalpa) return;

  const nerayikaCfg = config.newEnemies.nerayika;
  const waves = nerayikaCfg.spawns.waves as Record<string, number>;
  const count = waves[waveKey] || 0;
  const stagger = nerayikaCfg.spawns.stagger;

  for (let i = 0; i < count; i++) {
    k.wait(i * stagger, () => {
      const pos = getRandomEdgePosition(k);
      createNerayika(k, pos.x, pos.y);
    });
  }
}

function spawnTiracchanas(k: KAPLAYCtx, kalpa: number, waveKey: string): void {
  if (kalpa < config.newEnemies.tiracchana.spawns.minKalpa) return;

  const tiracCfg = config.newEnemies.tiracchana;
  const waves = tiracCfg.spawns.waves as Record<string, number>;
  const packCount = waves[waveKey] || 0;
  const packSize = tiracCfg.packSize;
  const packStagger = tiracCfg.spawns.packStagger;
  const individualStagger = tiracCfg.spawns.individualStagger;

  for (let pack = 0; pack < packCount; pack++) {
    if (pack === 0) {
      // First pack: grouped from one edge
      const basePos = getRandomEdgePosition(k);
      const edge = getEdgeFromPosition(basePos);

      for (let i = 0; i < packSize; i++) {
        k.wait(i * individualStagger, () => {
          const offset = getPackOffset(k, edge, i);
          createTiracchana(k, basePos.x + offset.x, basePos.y + offset.y);
        });
      }
    } else {
      // Later packs: each member from random edge
      k.wait(pack * packStagger, () => {
        for (let i = 0; i < packSize; i++) {
          k.wait(i * individualStagger, () => {
            const pos = getRandomEdgePosition(k);
            createTiracchana(k, pos.x, pos.y);
          });
        }
      });
    }
  }
}

function spawnManussa(k: KAPLAYCtx, kalpa: number, waveNum: number): void {
  if (kalpa < config.newEnemies.manussa.spawns.minKalpa) return;
  if (waveNum !== config.newEnemies.manussa.spawns.wave) return;
  if (hasActiveManussa()) return;

  const centerX = config.screen.width / 2;
  const centerY = config.arena.offsetY + (config.arena.height / 2);
  createManussa(k, centerX, centerY);
}
