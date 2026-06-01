/**
 * Hand-authored "constellations" for each archetype animal. Coordinates are
 * normalised ~[-1.3, 1.3] (x) × [-1, 1] (y); the renderer scales them to the
 * body. These are line-art constellations (points + edges), not illustrations —
 * exactly the "animal formed of constellations" the brief describes.
 */
export interface AnimalShape {
  points: [number, number][];
  edges: [number, number][];
}

const eagle: AnimalShape = {
  points: [
    [0, 0.9], // 0 head
    [0, 0.55], // 1 neck
    [0, 0.05], // 2 body
    [0, -0.75], // 3 tail
    [-0.35, 0.5], // 4 L wing inner
    [-0.8, 0.6], // 5 L wing mid
    [-1.3, 0.32], // 6 L wing tip
    [-0.7, 0.12], // 7 L wing low
    [0.35, 0.5], // 8 R wing inner
    [0.8, 0.6], // 9 R wing mid
    [1.3, 0.32], // 10 R wing tip
    [0.7, 0.12], // 11 R wing low
  ],
  edges: [
    [0, 1], [1, 2], [2, 3],
    [1, 4], [4, 5], [5, 6], [5, 7], [7, 2],
    [1, 8], [8, 9], [9, 10], [9, 11], [11, 2],
  ],
};

const wolf: AnimalShape = {
  points: [
    [-0.2, 0.92], // 0 ear
    [0.12, 0.95], // 1 ear
    [0.0, 0.6], // 2 head
    [-0.55, 0.45], // 3 snout
    [-0.4, 0.22], // 4 jaw
    [0.22, 0.35], // 5 neck
    [0.72, 0.22], // 6 back
    [0.9, -0.4], // 7 hind
    [0.0, -0.72], // 8 front leg
    [0.72, -0.8], // 9 hind leg
    [1.15, 0.12], // 10 tail
    [0.05, -0.05], // 11 chest
  ],
  edges: [
    [0, 2], [1, 2], [2, 3], [3, 4], [4, 11],
    [2, 5], [5, 6], [6, 7], [7, 10],
    [11, 8], [7, 9], [5, 11],
  ],
};

const bull: AnimalShape = {
  points: [
    [-0.95, 0.88], // 0 L horn tip
    [-0.35, 0.5], // 1 L horn base
    [0, 0.55], // 2 head top
    [0.35, 0.5], // 3 R horn base
    [0.95, 0.88], // 4 R horn tip
    [0, 0.12], // 5 snout
    [0, -0.08], // 6 neck
    [0.82, -0.1], // 7 back
    [0.42, -0.62], // 8 belly
    [-0.1, -0.72], // 9 front leg
    [0.72, -0.72], // 10 hind leg
    [1.15, -0.2], // 11 tail
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [2, 5], [5, 6], [6, 7], [7, 11],
    [6, 9], [7, 10], [6, 8],
  ],
};

const lion: AnimalShape = {
  points: [
    [0, 0.5], // 0 head
    [-0.45, 0.9], // 1 mane
    [-0.82, 0.58], // 2 mane
    [-0.85, 0.18], // 3 mane
    [-0.5, -0.08], // 4 mane low
    [0.12, 0.95], // 5 mane top
    [0.5, 0.68], // 6 mane right
    [0.18, 0.2], // 7 neck
    [0.85, 0.1], // 8 back
    [1.0, -0.42], // 9 hind
    [0.22, -0.7], // 10 front leg
    [0.92, -0.75], // 11 hind leg
    [1.32, 0.02], // 12 tail
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 7], [0, 5], [5, 6], [6, 8],
    [0, 7], [7, 8], [8, 9], [9, 12], [7, 10], [9, 11],
  ],
};

export const ANIMAL_SHAPES: Record<string, AnimalShape> = {
  eagle,
  wolf,
  bull,
  lion,
};
