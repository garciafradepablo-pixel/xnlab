/**
 * Procedural canvas textures, generated once and cached. We deliberately avoid
 * a postprocessing bloom pass (expensive on phones) and fake the glow with
 * additive radial sprites instead.
 */
import * as THREE from "three";

let glow: THREE.Texture | null = null;
let particle: THREE.Texture | null = null;
let disk: THREE.Texture | null = null;

/** Soft radial halo — additive sprite behind every luminous body. */
export function glowTexture(): THREE.Texture {
  if (glow) return glow;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.7)");
  g.addColorStop(0.5, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  glow = new THREE.CanvasTexture(c);
  glow.colorSpace = THREE.SRGBColorSpace;
  return glow;
}

/** Round soft dot for particle clouds (nebulae, storms, starfields). */
export function particleTexture(): THREE.Texture {
  if (particle) return particle;
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  particle = new THREE.CanvasTexture(c);
  particle.colorSpace = THREE.SRGBColorSpace;
  return particle;
}

/** Accretion-disk gradient ring for black holes. */
export function diskTexture(): THREE.Texture {
  if (disk) return disk;
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.18, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.45, "rgba(255,150,60,0.85)");
  g.addColorStop(0.7, "rgba(180,90,255,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  disk = new THREE.CanvasTexture(c);
  disk.colorSpace = THREE.SRGBColorSpace;
  return disk;
}
