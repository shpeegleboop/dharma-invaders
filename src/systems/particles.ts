// Particle effects for visual feedback
import type { KAPLAYCtx } from 'kaplay';
import config from '../data/config.json';

let kCtx: KAPLAYCtx | null = null;

export function initParticles(k: KAPLAYCtx): void {
  kCtx = k;
}

export function spawnHitParticles(x: number, y: number): void {
  if (!kCtx) return;
  const k = kCtx;

  const count = Math.floor(k.rand(5, 9));
  for (let i = 0; i < count; i++) {
    const angle = k.rand(0, Math.PI * 2);
    const speed = k.rand(80, 150);
    const size = k.rand(3, 5);

    const particle = k.add([
      k.rect(size, size),
      k.pos(x, y),
      k.anchor('center'),
      k.color(k.Color.fromHex('#9966FF')),
      k.opacity(1),
      k.lifespan(0.25, { fade: 0.15 }),
      k.z(50),
    ]);

    particle.onUpdate(() => {
      particle.pos.x += Math.cos(angle) * speed * k.dt();
      particle.pos.y += Math.sin(angle) * speed * k.dt();
    });
  }
}

// Spawn expanding gold ring effect for push ability
export function spawnPushRing(x: number, y: number, color: string): void {
  if (!kCtx) return;
  const k = kCtx;

  // Create ring of particles expanding outward
  const particleCount = 16;
  const expandSpeed = 300;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 / particleCount) * i;
    const size = 6;

    const particle = k.add([
      k.rect(size, size),
      k.pos(x, y),
      k.anchor('center'),
      k.color(k.Color.fromHex(color)),
      k.opacity(1),
      k.lifespan(0.4, { fade: 0.2 }),
      k.z(50),
    ]);

    particle.onUpdate(() => {
      particle.pos.x += Math.cos(angle) * expandSpeed * k.dt();
      particle.pos.y += Math.sin(angle) * expandSpeed * k.dt();
    });
  }
}

// Vajra idle sparkle - small gold particles radiating slowly
export function spawnVajraIdleParticle(x: number, y: number): void {
  if (!kCtx) return;
  const k = kCtx;
  const cfg = config.powerups.vajra;

  const angle = k.rand(0, Math.PI * 2);
  const speed = k.rand(20, 40);
  const size = cfg.particleSize.idle;

  const particle = k.add([
    k.rect(size, size),
    k.pos(x + k.rand(-8, 8), y + k.rand(-8, 8)),
    k.anchor('center'),
    k.color(k.Color.fromHex(cfg.color)),
    k.opacity(1),
    k.lifespan(0.5, { fade: 0.3 }),
    k.z(45),
  ]);

  particle.onUpdate(() => {
    particle.pos.x += Math.cos(angle) * speed * k.dt();
    particle.pos.y += Math.sin(angle) * speed * k.dt();
  });
}

// Vajra pickup burst - large gold burst on collection
export function spawnVajraPickupBurst(x: number, y: number): void {
  if (!kCtx) return;
  const k = kCtx;
  const cfg = config.powerups.vajra;

  for (let i = 0; i < cfg.particleCount.burst; i++) {
    const angle = k.rand(0, Math.PI * 2);
    const speed = k.rand(150, 300);
    const size = cfg.particleSize.burst;

    const particle = k.add([
      k.rect(size, size),
      k.pos(x, y),
      k.anchor('center'),
      k.color(k.Color.fromHex(cfg.color)),
      k.opacity(1),
      k.lifespan(0.3, { fade: 0.2 }),
      k.z(55),
    ]);

    particle.onUpdate(() => {
      particle.pos.x += Math.cos(angle) * speed * k.dt();
      particle.pos.y += Math.sin(angle) * speed * k.dt();
    });
  }
}

// Screen flash effect (for Vajra pickup and other dramatic moments)
export function flashScreen(color: string, durationMs: number): void {
  if (!kCtx) return;
  const k = kCtx;

  const flash = k.add([
    k.rect(k.width(), k.height()),
    k.pos(0, 0),
    k.color(k.Color.fromHex(color)),
    k.opacity(0.3),
    k.fixed(),
    k.z(999),
  ]);

  k.wait(durationMs / 1000, () => flash.destroy());
}
