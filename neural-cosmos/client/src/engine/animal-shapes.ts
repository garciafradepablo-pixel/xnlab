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

// ── RAM — left profile, big curled horn (Aries) ──────────────────────────────
const ram: AnimalShape = {
  strokes: [
    // topline: nose → brow → nape → back → rump
    [[-1.1, -0.05], [-0.9, 0.18], [-0.7, 0.34], [-0.4, 0.4], [0.2, 0.38], [0.7, 0.34], [0.95, 0.26]],
    // the curled horn spiralling back, down and forward
    [[-0.7, 0.34], [-0.5, 0.62], [-0.18, 0.66], [0.02, 0.46], [-0.06, 0.26], [-0.26, 0.26]],
    // face: brow → muzzle → chin
    [[-0.9, 0.18], [-1.12, 0.02], [-1.12, -0.16], [-0.96, -0.24]],
    // chest → belly → flank
    [[-0.96, -0.24], [-0.7, -0.2], [-0.4, -0.3], [0.2, -0.32], [0.7, -0.28], [0.95, -0.16]],
    // legs
    [[-0.5, -0.3], [-0.52, -0.86]],
    [[-0.28, -0.32], [-0.3, -0.84]],
    [[0.5, -0.3], [0.52, -0.86]],
    [[0.72, -0.28], [0.74, -0.82]],
  ],
};

// ── STAG — left profile, head up, branching antlers (zodiac / Green) ──────────
const stag: AnimalShape = {
  strokes: [
    // back: withers → back → rump → short tail
    [[-0.35, 0.28], [0.1, 0.32], [0.55, 0.3], [0.8, 0.22], [0.92, 0.1]],
    // neck + head + nose
    [[-0.35, 0.28], [-0.55, 0.46], [-0.7, 0.6], [-0.9, 0.62], [-1.06, 0.52]],
    // antlers branching from the head
    [[-0.7, 0.6], [-0.66, 0.92]],
    [[-0.66, 0.92], [-0.82, 0.88]],
    [[-0.66, 0.92], [-0.54, 0.94]],
    [[-0.7, 0.6], [-0.48, 0.82]],
    // throat → chest → belly → flank
    [[-0.55, 0.46], [-0.52, 0.02], [0.1, -0.16], [0.55, -0.14], [0.8, 0.0]],
    // slender legs
    [[-0.42, -0.04], [-0.44, -0.72]],
    [[-0.22, -0.12], [-0.24, -0.74]],
    [[0.45, -0.12], [0.47, -0.74]],
    [[0.62, -0.08], [0.64, -0.72]],
  ],
};

// ── BEAR — left profile, heavy, round ear (Green) ────────────────────────────
const bear: AnimalShape = {
  strokes: [
    // topline: head → shoulders hump → back → rump
    [[-0.85, 0.2], [-0.7, 0.34], [-0.45, 0.44], [0.1, 0.4], [0.6, 0.36], [0.88, 0.24]],
    // round ear
    [[-0.7, 0.34], [-0.66, 0.5], [-0.54, 0.42]],
    // face: head → muzzle → chin
    [[-0.85, 0.2], [-1.08, 0.06], [-1.06, -0.12], [-0.88, -0.2]],
    // chest → belly → flank (low, heavy)
    [[-0.88, -0.2], [-0.6, -0.16], [-0.3, -0.3], [0.2, -0.34], [0.6, -0.3], [0.88, -0.14]],
    // thick legs
    [[-0.55, -0.26], [-0.56, -0.82]],
    [[-0.32, -0.3], [-0.34, -0.84]],
    [[0.45, -0.3], [0.47, -0.84]],
    [[0.66, -0.26], [0.68, -0.82]],
  ],
};

// ── SERPENT — a coiling S with a wedge head and forked tongue (Blue/Black) ────
const serpent: AnimalShape = {
  strokes: [
    // body: tail → S-curve → head end
    [[1.2, -0.28], [0.85, 0.06], [0.45, 0.3], [0.05, 0.1], [-0.35, -0.2], [-0.75, 0.06], [-1.02, 0.32]],
    // head wedge
    [[-1.02, 0.32], [-1.28, 0.44], [-1.16, 0.18], [-1.02, 0.32]],
    // forked tongue
    [[-1.28, 0.44], [-1.4, 0.52]],
  ],
};

// ── DRAGON — left profile, horned head, membrane wing, barbed tail (Red) ──────
const dragon: AnimalShape = {
  strokes: [
    // tail → back → neck → head
    [[1.3, -0.3], [0.9, 0.0], [0.5, 0.2], [0.12, 0.3], [-0.3, 0.46], [-0.56, 0.62], [-0.8, 0.6]],
    // horn
    [[-0.8, 0.6], [-0.74, 0.82]],
    // open jaw
    [[-0.8, 0.6], [-1.04, 0.5], [-0.88, 0.34], [-0.66, 0.4]],
    // membrane wing fanning up from the shoulders
    [[0.12, 0.3], [-0.04, 0.78], [0.22, 0.66], [0.2, 0.96], [0.46, 0.74], [0.52, 1.0], [0.72, 0.66], [0.36, 0.52], [0.12, 0.3]],
    // belly
    [[-0.56, 0.0], [0.0, -0.2], [0.5, -0.2], [0.9, -0.04]],
    // legs
    [[-0.08, -0.18], [-0.12, -0.66]],
    [[0.55, -0.18], [0.6, -0.7]],
    // barbed tail tip
    [[1.3, -0.3], [1.42, -0.46]],
  ],
};

// ── RAVEN — left profile, beak, folded wing, long tail (Black) ────────────────
const raven: AnimalShape = {
  strokes: [
    // crown → back → long tail
    [[-0.9, 0.46], [-0.6, 0.5], [-0.1, 0.4], [0.5, 0.24], [1.12, 0.08]],
    // beak wedge
    [[-0.9, 0.46], [-1.18, 0.4], [-1.0, 0.28], [-0.78, 0.34]],
    // folded wing
    [[-0.4, 0.46], [0.0, 0.16], [0.5, 0.1], [0.18, 0.32]],
    // breast → underside → tail
    [[-0.78, 0.34], [-0.55, 0.04], [0.1, -0.06], [0.6, 0.0], [1.12, 0.08]],
    // legs
    [[-0.3, -0.03], [-0.32, -0.42]],
    [[-0.1, -0.05], [-0.12, -0.42]],
  ],
};

// ── SCORPION — top-down: claws, six legs, tail curling to the sting (Scorpio) ─
const scorpion: AnimalShape = {
  strokes: [
    // body segments, head (left) → abdomen (right)
    [[-0.2, 0.0], [0.0, 0.0], [0.25, 0.0], [0.5, 0.0]],
    // left pincer
    [[-0.2, 0.0], [-0.55, 0.2], [-0.82, 0.36], [-0.96, 0.26], [-0.8, 0.18]],
    // right pincer
    [[-0.2, 0.0], [-0.55, -0.2], [-0.82, -0.36], [-0.96, -0.26], [-0.8, -0.18]],
    // legs — upper side
    [[-0.05, 0.05], [-0.2, 0.46]],
    [[0.15, 0.05], [0.05, 0.5]],
    [[0.35, 0.05], [0.3, 0.5]],
    // legs — lower side
    [[-0.05, -0.05], [-0.2, -0.46]],
    [[0.15, -0.05], [0.05, -0.5]],
    [[0.35, -0.05], [0.3, -0.5]],
    // tail curling up and over to the sting
    [[0.5, 0.0], [0.8, 0.1], [1.0, 0.3], [1.05, 0.56], [0.9, 0.74], [0.72, 0.64]],
    // sting barb
    [[0.72, 0.64], [0.62, 0.78]],
  ],
};

// ── FISH — profile, fanned tail + dorsal fin (Pisces / Blue) ──────────────────
const fish: AnimalShape = {
  strokes: [
    // upper body: head → back → tail base
    [[-0.92, 0.0], [-0.4, 0.32], [0.32, 0.32], [0.7, 0.06]],
    // lower body: head → belly → tail base
    [[-0.92, 0.0], [-0.4, -0.32], [0.32, -0.32], [0.7, -0.06]],
    // fanned tail fin
    [[0.7, 0.06], [1.12, 0.3], [0.96, 0.0], [1.12, -0.3], [0.7, -0.06]],
    // dorsal fin
    [[-0.18, 0.32], [-0.08, 0.56], [0.16, 0.34]],
    // gill line
    [[-0.56, 0.2], [-0.6, -0.2]],
  ],
};

export const ANIMAL_SHAPES: Record<string, AnimalShape> = {
  eagle,
  wolf,
  bull,
  lion,
  ram,
  stag,
  bear,
  serpent,
  dragon,
  raven,
  scorpion,
  fish,
};
