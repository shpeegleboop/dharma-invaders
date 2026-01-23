// Player indicators - sparkle particles for push, ring for shield
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { getShieldCharges } from './powerupEffects';

let shieldRing: GameObj | null = null;
let pushParticles: GameObj[] = [];
let kRef: KAPLAYCtx | null = null;
let pushOnCooldown = false;

const SHIELD_RING_RADIUS = 20;
const SHIELD_COLOR = '#9966FF';
const PULSE_SPEED = 4;

// Push sparkle config
const PARTICLE_COUNT = 6;
const ORBIT_RADIUS = 28;
const ORBIT_SPEED = 2.5;
const SPARKLE_COLORS = ['#FFD700', '#FFEC80', '#FFF4B0'];

export function initPlayerIndicators(k: KAPLAYCtx): void {
  kRef = k;
  shieldRing = null;
  pushParticles = [];
  pushOnCooldown = false;
}

export function setPushCooldown(onCooldown: boolean): void {
  pushOnCooldown = onCooldown;
}

export function updatePlayerIndicators(player: GameObj): void {
  if (!kRef) return;
  const k = kRef;
  const shieldCharges = getShieldCharges();

  // Push sparkles - only visible when ability is ready
  if (!pushOnCooldown) {
    // Create particles if needed
    if (pushParticles.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = k.add([
          k.rect(4, 4),
          k.pos(player.pos),
          k.anchor('center'),
          k.color(k.Color.fromHex(SPARKLE_COLORS[i % SPARKLE_COLORS.length])),
          k.opacity(0.8),
          k.z(player.z ? player.z - 2 : -2),
          'pushSparkle',
          { angle: (Math.PI * 2 / PARTICLE_COUNT) * i, sparkleOffset: i * 0.5 },
        ]);
        pushParticles.push(particle);
      }
    }

    // Update particle positions - orbit around player with sparkle
    const time = k.time();
    pushParticles.forEach((p, i) => {
      const baseAngle = p.angle + time * ORBIT_SPEED;
      const wobble = Math.sin(time * 8 + p.sparkleOffset) * 3;
      const radius = ORBIT_RADIUS + wobble;
      p.pos.x = player.pos.x + Math.cos(baseAngle) * radius;
      p.pos.y = player.pos.y + Math.sin(baseAngle) * radius;
      // Sparkle opacity
      p.opacity = 0.5 + Math.sin(time * 10 + p.sparkleOffset) * 0.4;
      // Cycle colors for extra sparkle
      const colorIdx = Math.floor((time * 3 + i) % SPARKLE_COLORS.length);
      p.color = k.Color.fromHex(SPARKLE_COLORS[colorIdx]);
    });
  } else {
    // On cooldown - destroy particles
    pushParticles.forEach((p) => p.destroy());
    pushParticles = [];
  }

  // Shield ring (only when shield has charges)
  if (shieldCharges > 0) {
    if (!shieldRing) {
      shieldRing = k.add([
        k.circle(SHIELD_RING_RADIUS),
        k.pos(player.pos),
        k.anchor('center'),
        k.color(k.Color.fromHex(SHIELD_COLOR)),
        k.opacity(0.3),
        k.outline(2, k.Color.fromHex('#CC99FF')),
        k.z(player.z ? player.z - 1 : -1),
        'shieldRing',
      ]);
    }
    shieldRing.pos = player.pos;
    shieldRing.opacity = 0.2 + Math.sin(k.time() * PULSE_SPEED) * 0.15;
  } else if (shieldRing) {
    shieldRing.destroy();
    shieldRing = null;
  }
}

export function cleanupPlayerIndicators(): void {
  pushParticles.forEach((p) => p.destroy());
  pushParticles = [];
  if (shieldRing) {
    shieldRing.destroy();
    shieldRing = null;
  }
}
