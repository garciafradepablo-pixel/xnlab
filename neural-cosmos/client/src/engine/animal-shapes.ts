/**
 * Hand-authored "constellations" for each archetype animal — drawn as STROKES
 * (ordered polylines), the way a real star chart joins stars into a figure.
 * AnimalGlyph turns these strokes into a true 3D NEBULA — a volumetric point
 * cloud with depth in Z plus bright stars at the joints — so the animal reads as
 * cosmic gas you can orbit. animal-art renders a flat 2D version of the same for
 * UI thumbnails (cards, inspector).
 *
 * Coordinates are normalised ~[-1.4, 1.4] (x, right) × [-1, 1] (y, up); the
 * renderer scales them to the body and adds gentle z-depth for volume. Each
 * figure is recognisable as its animal:
 *   eagle → front-on, wings swept wide and up   (XNLAB)
 *   wolf  → left profile, ears + bushy tail up   (Connect / Hunter)
 *   bull  → left profile, horns + shoulder hump   (XCAP)
 *   lion  → left profile, full mane + tufted tail (Atlas / 01)
 */
export type Stroke = [number, number][];

export interface AnimalShape {
  /** Each stroke is a polyline; vertices become stars, segments become lines. */
  strokes: Stroke[];
}

// ── EAGLE — flying, front view, wings spread up-and-out ──────────────────────
const eagle: AnimalShape = {
  strokes: [
    // spine: head → neck → chest → belly → tail base
    [[0, 0.98], [0, 0.55], [0, 0.2], [0, -0.15], [0, -0.48]],
    // left wing — leading edge out to the tip
    [[-0.16, 0.46], [-0.5, 0.62], [-0.86, 0.76], [-1.28, 0.84]],
    // left wing — trailing edge back to the chest
    [[-1.28, 0.84], [-0.92, 0.48], [-0.56, 0.28], [-0.14, 0.2]],
    // right wing — leading edge out to the tip
    [[0.16, 0.46], [0.5, 0.62], [0.86, 0.76], [1.28, 0.84]],
    // right wing — trailing edge back to the chest
    [[1.28, 0.84], [0.92, 0.48], [0.56, 0.28], [0.14, 0.2]],
    // tail fan
    [[-0.28, -0.88], [0, -0.46], [0.28, -0.88]],
    // talons
    [[-0.12, -0.2], [-0.18, -0.5]],
    [[0.12, -0.2], [0.18, -0.5]],
  ],
};

// ── WOLF — left profile, prowling, bushy tail up ─────────────────────────────
const wolf: AnimalShape = {
  strokes: [
    // topline: nose → muzzle → forehead → ears → nape → back → hip → tail
    [
      [-1.2, 0.12], [-0.95, 0.26], [-0.78, 0.36],
      [-0.66, 0.6], [-0.54, 0.36], [-0.46, 0.58], [-0.34, 0.34],
      [-0.05, 0.4], [0.4, 0.42], [0.74, 0.36],
      [0.9, 0.34], [1.16, 0.52], [1.36, 0.3], [1.2, 0.1],
    ],
    // lower jaw → throat → chest
    [[-1.2, 0.12], [-1.0, 0.0], [-0.78, 0.06], [-0.5, 0.02]],
    // underline / belly
    [[-0.5, 0.02], [-0.5, -0.06], [0.1, -0.14], [0.62, -0.1], [0.74, 0.0]],
    // legs
    [[-0.46, -0.04], [-0.47, -0.8]],
    [[-0.22, -0.08], [-0.26, -0.78]],
    [[0.58, -0.06], [0.6, -0.82]],
    [[0.78, -0.02], [0.82, -0.78]],
  ],
};

// ── BULL — left profile, head low, big horns, shoulder hump ──────────────────
const bull: AnimalShape = {
  strokes: [
    // topline: poll → hump → back → loin → rump → tail base
    [[-0.78, 0.18], [-0.4, 0.5], [0.1, 0.42], [0.62, 0.32], [0.92, 0.24], [0.98, 0.16]],
    // horn sweeping up-and-back
    [[-0.78, 0.18], [-0.56, 0.46], [-0.42, 0.62]],
    // horn sweeping up-and-forward
    [[-0.78, 0.18], [-0.98, 0.42], [-1.08, 0.6]],
    // face: poll → muzzle → nose
    [[-0.78, 0.18], [-0.98, 0.0], [-1.06, -0.18], [-0.9, -0.3]],
    // dewlap → chest → belly → flank
    [[-0.9, -0.3], [-0.66, -0.22], [-0.5, -0.32], [0.1, -0.36], [0.62, -0.3], [0.92, -0.18]],
    // tail down with a tuft
    [[0.98, 0.16], [1.06, -0.3], [1.0, -0.62], [1.14, -0.8]],
    // legs
    [[-0.5, -0.32], [-0.5, -0.9]],
    [[-0.3, -0.34], [-0.32, -0.88]],
    [[0.6, -0.3], [0.62, -0.92]],
    [[0.82, -0.26], [0.84, -0.88]],
  ],
};

// ── LION — left profile, full mane, tufted tail ──────────────────────────────
const lion: AnimalShape = {
  strokes: [
    // mane: a shaggy spiked ring around the head, with ear tufts
    [
      [-0.34, 0.5], [-0.5, 0.8], [-0.62, 0.5], [-0.78, 0.76], [-0.96, 0.5],
      [-1.08, 0.2], [-1.14, -0.08], [-1.0, -0.3], [-0.78, -0.36],
      [-0.52, -0.26], [-0.36, -0.04], [-0.3, 0.24], [-0.34, 0.5],
    ],
    // muzzle poking out of the mane
    [[-0.92, 0.12], [-1.08, 0.05], [-1.05, -0.1], [-0.92, -0.13]],
    // topline: nape → back → loin → rump → tail base
    [[-0.3, 0.36], [0.12, 0.36], [0.56, 0.32], [0.88, 0.3], [0.98, 0.28]],
    // tail arcing back and down to the tuft
    [[0.98, 0.28], [1.2, 0.12], [1.32, -0.12], [1.44, -0.3], [1.3, -0.42]],
    // chest → belly → flank
    [[-0.4, -0.25], [0.1, -0.32], [0.62, -0.3], [0.88, -0.2]],
    // legs
    [[-0.3, -0.25], [-0.3, -0.82]],
    [[-0.12, -0.28], [-0.14, -0.8]],
    [[0.6, -0.3], [0.62, -0.84]],
    [[0.82, -0.22], [0.84, -0.8]],
  ],
};

export const ANIMAL_SHAPES: Record<string, AnimalShape> = {
  eagle,
  wolf,
  bull,
  lion,
};
