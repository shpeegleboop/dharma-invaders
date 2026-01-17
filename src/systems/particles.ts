// Particle effects for visual feedback
import type { KAPLAYCtx } from 'kaplay';

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
