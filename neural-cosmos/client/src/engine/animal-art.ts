/**
 * Procedural animal ART (not stick-figures): each archetype is rendered as a
 * luminous, illustrated glyph on a high-resolution canvas and cached as a
 * texture. We reuse the recognisable stroke skeletons from `animal-shapes`, but
 * draw them as smoothed, glowing curves with bloom halos and bright "named"
 * stars at the joints — so the eagle/wolf/bull/lion read as illustrated
 * constellation creatures, tinted to each entity's signature colour.
 *
 * The texture is billboarded onto a plane in the scene (see AnimalGlyph), so it
 * parallaxes and twinkles within the 3D cosmos rather than reading as flat art.
 */
import * as THREE from "three";
import { ANIMAL_SHAPES, type Stroke } from "./animal-shapes";

const SIZE = 512;
const cache = new Map<string, THREE.CanvasTexture>();

// normalised art extents (a touch beyond the figure bounds, for padding)
const SPAN_X = 3.1;
const SPAN_Y = 2.3;

function lighten(hex: string, t: number): string {
  return "#" + new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), t).getHexString();
}
function rgba(hex: string, a: number): string {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

function drawSmooth(
  ctx: CanvasRenderingContext2D,
  pts: Stroke,
  X: (n: number) => number,
  Y: (n: number) => number,
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
  if (pts.length === 2) {
    ctx.lineTo(X(pts[1][0]), Y(pts[1][1]));
    ctx.stroke();
    return;
  }
  // quadratic smoothing through the vertices → organic, illustrated curves
  for (let i = 1; i < pts.length - 1; i++) {
    const x0 = X(pts[i][0]);
    const y0 = Y(pts[i][1]);
    const x1 = X(pts[i + 1][0]);
    const y1 = Y(pts[i + 1][1]);
    ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  const n = pts.length - 1;
  ctx.quadraticCurveTo(X(pts[n - 1][0]), Y(pts[n - 1][1]), X(pts[n][0]), Y(pts[n][1]));
  ctx.stroke();
}

function drawStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  X: (n: number) => number,
  Y: (n: number) => number,
): void {
  for (const s of strokes) drawSmooth(ctx, s, X, Y);
}

export function animalArtTexture(animal: string, color: string): THREE.CanvasTexture | null {
  const shape = ANIMAL_SHAPES[animal];
  if (!shape) return null;
  const key = `${animal}:${color}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const pad = 60;
  const sc = Math.min((SIZE - pad * 2) / SPAN_X, (SIZE - pad * 2) / SPAN_Y);
  const X = (nx: number) => SIZE / 2 + nx * sc;
  const Y = (ny: number) => SIZE / 2 - ny * sc;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1 — soft bloom underlay (wide, blurred, faint)
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 11;
  drawStrokes(ctx, shape.strokes, X, Y);
  // 2 — mid glow
  ctx.shadowBlur = 16;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 5.5;
  drawStrokes(ctx, shape.strokes, X, Y);
  ctx.restore();

  // 3 — crisp near-white core line
  ctx.save();
  ctx.strokeStyle = lighten(color, 0.55);
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 2.2;
  drawStrokes(ctx, shape.strokes, X, Y);
  ctx.restore();

  // 4 — bright "named" stars at every vertex
  const seen = new Set<string>();
  for (const stroke of shape.strokes) {
    for (const [nx, ny] of stroke) {
      const k = `${nx},${ny}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const x = X(nx);
      const y = Y(ny);
      const r = 13;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.98)");
      g.addColorStop(0.35, rgba(color, 0.85));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}
