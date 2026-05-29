// =============================================================================
// lenses.js — Lentes por sector: la VERSATILIDAD que la competencia no tiene.
//
// Una clínica dental no se evalúa igual que una promotora de lujo. Cada sector
// tiene su propia "lente": qué filtros pesan más para predecir una venta real
// en ESE tipo de cliente. Connect aplica la lente del sector de cada empresa,
// así que el mismo motor se adapta a cada mundo en vez de medir a todos con la
// misma vara (lo que hacen Apollo/Clay).
//
// Cada lente es un mapa filtro→multiplicador (1.0 = peso normal). Se combinan
// con los multiplicadores del aprendizaje (calibration) y se renormalizan en
// scoring, así que NO inflan la escala — solo cambian el equilibrio.
//
// Diseño honesto y conservador: los multiplicadores son moderados (0.8–1.3).
// La lente afina el orden dentro de un sector; no fabrica puntuación.
// =============================================================================

import { FILTER_KEYS } from "./models.js";

const flat = () => Object.fromEntries(FILTER_KEYS.map((k) => [k, 1]));

// Por sector, qué sube y qué baja respecto al peso base.
// Razonamiento por sector documentado en cada bloque.
export const SECTOR_LENSES = {
  // SALUD/CLÍNICAS: el paciente decide por confianza y el dolor se ve en
  // reseñas (esperas, reservas). Pesa el dolor activo, la palanca (web/booking)
  // y el decisor (médico-dueño). La "tensión de marca" pesa algo menos.
  health: {
    ...flat(),
    activePainSignal: 1.3,
    actionableLever: 1.2,
    reachableDecisionMaker: 1.15,
    budgetPriority: 1.1,
    visibleTension: 0.9,
  },

  // INMOBILIARIO/LUJO: cada unidad vale mucho; manda la capacidad económica, la
  // percepción premium (precio↔comunicación) y el momento (lanzamiento/fase de
  // venta). El "dolor activo" en reseñas importa menos.
  realestate: {
    ...flat(),
    economicCapacity: 1.3,
    visibleTension: 1.2,
    whyNow: 1.15,
    strategicFit: 1.1,
    activePainSignal: 0.8,
  },

  // GROWTH/MARCAS: lo que manda es el momento (ronda/expansión) y la madurez de
  // marca frente a la ambición. El decisor (fundador) suele ser alcanzable.
  growth: {
    ...flat(),
    transitionSignal: 1.3,
    whyNow: 1.2,
    visibleTension: 1.1,
    economicCapacity: 1.05,
    reachableDecisionMaker: 0.95,
  },

  // HOSTELERÍA PREMIUM: el momento (apertura) y la captación/conversión mandan;
  // la experiencia/reservas es la palanca. Capacidad media-alta.
  hospitality: {
    ...flat(),
    whyNow: 1.25,
    actionableLever: 1.2,
    visibleTension: 1.15,
    activePainSignal: 1.1,
    economicCapacity: 0.95,
  },
};

const PRETTY = {
  health: "clínicas: pesan dolor activo, palanca y decisor médico",
  realestate: "inmobiliario/lujo: pesa capacidad, percepción premium y momento",
  growth: "growth: pesa el momento (ronda/expansión) y la madurez de marca",
  hospitality: "hostelería: pesa la apertura y la captación/experiencia",
};

/**
 * Devuelve los multiplicadores de la lente del sector (o todo 1.0 si no hay).
 */
export function lensFor(sector) {
  return SECTOR_LENSES[sector] || flat();
}

/** Etiqueta legible de la lente aplicada (para mostrar en la ficha). */
export function lensLabel(sector) {
  return PRETTY[sector] || null;
}

/**
 * Combina la lente del sector con otros multiplicadores (p.ej. los del
 * aprendizaje). Multiplica filtro a filtro; el resultado lo renormaliza
 * scoring, así que solo cambia el equilibrio, no la escala.
 */
export function combineMultipliers(sector, learned) {
  const lens = lensFor(sector);
  if (!learned) return lens;
  const out = {};
  for (const k of FILTER_KEYS) out[k] = (lens[k] ?? 1) * (learned[k] ?? 1);
  return out;
}
