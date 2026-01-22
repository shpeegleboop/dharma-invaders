// Player indicators - visual rings for shield and push ability status
import type { KAPLAYCtx, GameObj } from 'kaplay';
import { getShieldCharges } from './powerupEffects';

// Module state for indicator objects
let pushRing: GameObj | null = null;
let shieldRing: GameObj | null = null;
let kRef: KAPLAYCtx | null = null;

// Cooldown state (set externally from player.ts)
let pushOnCooldown = false;

const PUSH_RING_RADIUS = 24;
const SHIELD_RING_RADIUS = 20;
const PUSH_COLOR = '#FFD700';
const SHIELD_COLOR = '#9966FF';
const PULSE_SPEED = 4;

export function initPlayerIndicators(k: KAPLAYCtx): void {
  kRef = k;
  pushRing = null;
  shieldRing = null;
  pushOnCooldown = false;
}

export function setPushCooldown(onCooldown: boolean): void {
  pushOnCooldown = onCooldown;
}

export function updatePlayerIndicators(player: GameObj): void {
  if (!kRef) return;
  const k = kRef;
  const shieldCharges = getShieldCharges();

  // Push ring (always visible, bright when ready, dim when on cooldown)
  if (!pushRing) {
    pushRing = k.add([
      k.circle(PUSH_RING_RADIUS),
      k.pos(player.pos),
      k.anchor('center'),
      k.outline(2, k.Color.fromHex(PUSH_COLOR)),
      k.opacity(0),
      k.z(player.z ? player.z - 2 : -2),
      'pushRing',
    ]);
    // Make it hollow (no fill)
    pushRing.use(k.color(0, 0, 0));
    pushRing.opacity = 0;
  }

  // Update push ring position and outline color
  pushRing.pos = player.pos;
  // Access outline through the object (Kaplay stores it as a component)
  if (pushRing.outline) {
    pushRing.outline.color = k.Color.fromHex(PUSH_COLOR).lerp(
      k.Color.fromHex('#666666'),
      pushOnCooldown ? 0.7 : 0
    );
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
    // Update shield ring
    shieldRing.pos = player.pos;
    // Pulse effect
    shieldRing.opacity = 0.2 + Math.sin(k.time() * PULSE_SPEED) * 0.15;
  } else if (shieldRing) {
    shieldRing.destroy();
    shieldRing = null;
  }
}

export function cleanupPlayerIndicators(): void {
  if (pushRing) {
    pushRing.destroy();
    pushRing = null;
  }
  if (shieldRing) {
    shieldRing.destroy();
    shieldRing = null;
  }
}
