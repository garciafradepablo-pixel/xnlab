/**
 * A flat 2D preview of an archetype's constellation, drawn straight from the
 * shared ANIMAL_SHAPES strokes (the same data the 3D AnimalGlyph uses): coloured
 * lines join the figure, white dots mark the stars. Used in the character-select
 * grid so you can recognise each creature before picking it. Pure SVG, no WebGL.
 */
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
  const shape = ANIMAL_SHAPES[animal];

  if (!shape) {
    // "none" → a lone star
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className="arch-glyph" aria-hidden>
        <circle cx="50" cy="50" r="4.5" fill={color} opacity="0.9" />
      </svg>
    );
  }

  const verts = new Set<string>();
  for (const stroke of shape.strokes)
    for (const [x, y] of stroke) verts.add(`${x},${y}`);

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="arch-glyph" aria-hidden>
      <g
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
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
      <g fill="#ffffff">
        {[...verts].map((k, i) => {
          const [x, y] = k.split(",").map(Number);
          return <circle key={i} cx={sx(x)} cy={sy(y)} r="1.6" opacity="0.95" />;
        })}
      </g>
    </svg>
  );
}
