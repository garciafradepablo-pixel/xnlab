/**
 * A premium 2D preview of an archetype's constellation, drawn from the shared
 * ANIMAL_SHAPES strokes (the same data the 3D AnimalGlyph uses). Rendered as a
 * soft luminous nebula: a tinted radial bloom behind, hairline tracings between
 * the stars, and glowing star nodes (blurred halo + crisp core) — not a flat
 * connect-the-dots. Pure SVG, no WebGL.
 */
import { useId } from "react";
import { ANIMAL_SHAPES } from "../engine/animal-shapes";

// shape coords are x∈[-1.4,1.4] (right), y∈[-1,1] (up) → map into a 0..100 box
const sx = (x: number) => 50 + x * 29;
const sy = (y: number) => 50 - y * 34; // flip: SVG y grows downward

export default function ConstellationGlyph({
  animal,
  color,
  size = 56,
}: {
  animal: string;
  color: string;
  size?: number;
}) {
  const uid = useId().replace(/[:]/g, "");
  const shape = ANIMAL_SHAPES[animal];

  const verts = new Set<string>();
  if (shape)
    for (const stroke of shape.strokes)
      for (const [x, y] of stroke) verts.add(`${x},${y}`);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="arch-glyph"
      aria-hidden
    >
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="44%" r="58%">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="62%" stopColor={color} stopOpacity="0.05" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="100" height="100" fill={`url(#bg${uid})`} />

      {!shape ? (
        <g filter={`url(#glow${uid})`}>
          <circle cx="50" cy="50" r="3" fill={color} opacity="0.6" />
          <circle cx="50" cy="50" r="1.4" fill="#fff" />
        </g>
      ) : (
        <g filter={`url(#glow${uid})`}>
          {/* hairline tracings between stars */}
          <g
            stroke={color}
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.42"
          >
            {shape.strokes.map((stroke, i) => (
              <polyline
                key={i}
                points={stroke
                  .map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
                  .join(" ")}
              />
            ))}
          </g>
          {/* coloured halo under each star */}
          <g fill={color} opacity="0.55">
            {[...verts].map((k, i) => {
              const [x, y] = k.split(",").map(Number);
              return <circle key={i} cx={sx(x)} cy={sy(y)} r="2.1" />;
            })}
          </g>
          {/* crisp white core */}
          <g fill="#fff">
            {[...verts].map((k, i) => {
              const [x, y] = k.split(",").map(Number);
              return <circle key={i} cx={sx(x)} cy={sy(y)} r="1.05" />;
            })}
          </g>
        </g>
      )}
    </svg>
  );
}
