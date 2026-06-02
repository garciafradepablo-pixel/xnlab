/**
 * Procedural animal NEBULAS. Each archetype is rendered as a luminous nebula in
 * the shape of the creature — a soft, blurred cloud of coloured light with a
 * faint defining ridge, fine star-dust grain, and bright constellation stars at
 * the joints. No hard "neon" outlines: the animal reads as cosmic gas and stars,
 * tinted to the entity's signature colour (eagle/wolf/bull/lion).
 *
 * Drawn additively over opaque black so it composites cleanly with the scene's
 * AdditiveBlending (black contributes nothing, only the glow shows). Cached per
 * `animal:color`, then billboarded into the cosmos by AnimalGlyph.
 *
 * This is the in-engine default; an entity may override it with its own image
 * (meta.imageUrl) for a bespoke illustrated nebula.
 */
import * as THREE from "three";
import { ANIMAL_SHAPES, type Stroke } from "./animal-shapes";

const SIZE = 512;
const PAD = 56;
const SPAN_X = 3.1;
const SPAN_Y = 2.3;
const cache = new Map<string, THREE.CanvasTexture>();

type RGB = [number, number, number];

function toRGB(hex: string): RGB {
  const c = new THREE.Color(hex);
  return [c.r * 255, c.g * 255, c.b * 255];
}
function lighten([r, g, b]: RGB, t: number): RGB {
  return [r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t];
}
function css([r, g, b]: RGB, a: number): string {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}
function rnd(s: number): number {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function qbez(p0: number[], c: number[], p1: number[], t: number): number[] {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
    u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
  ];
}

/** Sample a stroke into a dense, smoothed polyline (same smoothing as drawn). */
function sampleStroke(pts: Stroke): number[][] {
  const STEP = 24;
  const out: number[][] = [];
  if (pts.length < 2) return out;
  if (pts.length === 2) {
    for (let i = 0; i <= STEP; i++) {
      const t = i / STEP;
      out.push([
        pts[0][0] + (pts[1][0] - pts[0][0]) * t,
        pts[0][1] + (pts[1][1] - pts[0][1]) * t,
      ]);
    }
    return out;
  }
  const n = pts.length - 1;
  let start = pts[0] as number[];
  out.push(start);
  for (let i = 1; i <= n - 1; i++) {
    const c = pts[i] as number[];
    const end =
      i === n - 1
        ? (pts[n] as number[])
        : [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    for (let s = 1; s <= STEP; s++) out.push(qbez(start, c, end, s / STEP));
    start = end;
  }
  return out;
}

export function animalArtTexture(animal: string, color: string): THREE.CanvasTexture | null {
  const shape = ANIMAL_SHAPES[animal];
  if (!shape) return null;
  const key = `${animal}:${color}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  // opaque black base → additive scene blending shows only the glow
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.globalCompositeOperation = "lighter";

  const sc = Math.min((SIZE - PAD * 2) / SPAN_X, (SIZE - PAD * 2) / SPAN_Y);
  const X = (nx: number) => SIZE / 2 + nx * sc;
  const Y = (ny: number) => SIZE / 2 - ny * sc;

  const base = toRGB(color);
  const ridge = lighten(base, 0.25);
  const ridgeHot = lighten(base, 0.55);
  const dustCol = lighten(base, 0.4);

  // soft, gaussian-ish additive disc
  const soft = (x: number, y: number, radius: number, rgb: RGB, intensity: number) => {
    if (radius < 0.5) radius = 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, css(rgb, intensity));
    g.addColorStop(0.5, css(rgb, intensity * 0.4));
    g.addColorStop(1, css(rgb, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const samples = shape.strokes.map(sampleStroke);

  // 1 — soft nebula body (wide clouds merge into volume)
  for (const sp of samples)
    for (const p of sp) {
      soft(X(p[0]), Y(p[1]), sc * 0.43, base, 0.008);
      soft(X(p[0]), Y(p[1]), sc * 0.25, base, 0.014);
      soft(X(p[0]), Y(p[1]), sc * 0.124, base, 0.024);
    }
  // 1b — soft (blurred) core ridge → definition without hard neon
  for (const sp of samples)
    for (const p of sp) {
      soft(X(p[0]), Y(p[1]), sc * 0.052, ridge, 0.085);
      soft(X(p[0]), Y(p[1]), sc * 0.025, ridgeHot, 0.16);
    }
  // 2 — fine star-dust grain scattered through the cloud
  let seed = 1;
  for (const sp of samples)
    for (let j = 0; j < sp.length; j += 2) {
      const p = sp[j];
      for (let k = 0; k < 2; k++) {
        seed++;
        const ang = rnd(seed * 1.3) * Math.PI * 2;
        const rad = rnd(seed * 2.7) * sc * 0.165;
        const b = 0.25 + 0.5 * rnd(seed * 3.9);
        soft(X(p[0]) + Math.cos(ang) * rad, Y(p[1]) + Math.sin(ang) * rad, sc * 0.012, dustCol, b);
      }
    }
  // 3 — bright constellation stars at the joints (white core + soft halo)
  const seen = new Set<string>();
  let si = 0;
  for (const stroke of shape.strokes)
    for (const [nx, ny] of stroke) {
      const k = `${nx},${ny}`;
      if (seen.has(k)) continue;
      seen.add(k);
      si++;
      const big = 1 + 1.5 * rnd(si * 5.1);
      const x = X(nx);
      const y = Y(ny);
      soft(x, y, sc * 0.207 * big, base, 0.16);
      soft(x, y, sc * 0.035 * big, ridgeHot, 0.6);
      soft(x, y, sc * 0.0155 * big, [255, 255, 255], 0.98);
    }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}
