// =============================================================================
// enrich.js — Enriquecimiento honesto a partir de la web del lead (Fase 3).
//
// El descubridor trae empresas reales, pero "crudas": sin señales, puntúan bajo.
// Este módulo convierte HECHOS observables de su web (datos duros, no opiniones)
// en señales CITADAS que el motor puede puntuar — sin inventar nada.
//
// Regla de la casa: solo afirmamos lo que se ve. Una web con ©2019 es un hecho;
// "su marca está anticuada" sería opinión y NO se afirma. Por eso las señales
// que generamos son AMARILLAS (indicio con cita), nunca verdes (eso exige juicio
// humano o prensa). El módulo es PURO y testeable; el fetch vive en una Edge
// Function que devuelve los `facts`.
//
// Forma de `facts` (lo que extrae la Edge Function de la web):
//   { ok, url, copyrightYear, hasBooking, hasViewport, emails[], phones[],
//     socials:{instagram,linkedin,facebook}, title }
// =============================================================================

// Sectores donde la reserva/cita online es una palanca de captación esperada.
const BOOKING_SECTORS = new Set(["health", "hospitality"]);

/**
 * Convierte los hechos de la web en entradas de verificación (señal + cita).
 * Una entrada por filtro como máximo (la más fuerte). Conservador: amarillo.
 * @param {object} facts   hechos extraídos de la web
 * @param {object} opp     la oportunidad (para conocer el sector)
 * @param {object} [opts]  { year } año actual (para tests deterministas)
 * @returns {Array<{filter,level,note,url,auto,srcLabel}>}
 */
export function factsToVerifications(facts, opp, opts = {}) {
  if (!facts || !facts.ok) return [];
  const year = opts.year || new Date().getFullYear();
  const url = facts.url || opp?.website || "su-web";
  const byFilter = new Map(); // un indicio por filtro (gana el primero, el más fuerte)
  const add = (filter, level, note) => {
    if (byFilter.has(filter)) return;
    byFilter.set(filter, { filter, level, note, url, auto: true, srcLabel: "Lectura de su web" });
  };

  // 1) Copyright desactualizado → tensión visible (hecho: el pie muestra ©AAAA).
  if (facts.copyrightYear && facts.copyrightYear <= year - 2) {
    add("visibleTension", "yellow", `Su web muestra ©${facts.copyrightYear} en el pie — sin actualizar (≥2 años). Indicio de mantenimiento bajo.`);
  }

  // 2) Sin reserva/cita online en un sector que la espera → palanca por construir.
  if (BOOKING_SECTORS.has(opp?.sector) && facts.hasBooking === false) {
    add("actionableLever", "yellow", "Su web no ofrece reserva/cita online — palanca directa de captación por construir.");
  }

  // 3) Sin viewport móvil → tensión visible (hecho técnico verificable).
  if (facts.hasViewport === false) {
    add("visibleTension", "yellow", "Su web no declara viewport móvil — experiencia móvil probablemente pobre.");
  }

  // 4) Tiene reserva online (sector que la usa) → la palanca EXISTE y se optimiza.
  if (BOOKING_SECTORS.has(opp?.sector) && facts.hasBooking === true) {
    add("actionableLever", "yellow", "Su web ya tiene reserva/cita online — hay flujo real que optimizar (conversión, directa vs. agregadores).");
  }

  // NOTA honesta: NO derivamos "decisor alcanzable" de un email genérico (info@),
  // ni capacidad económica de la web. Eso exige prensa/juicio — no lo inventamos.

  return [...byFilter.values()];
}

/** Resumen legible de lo que aportó el enriquecimiento (para la UI). */
export function summarizeEnrichment(verifs) {
  if (!verifs.length) return "Su web no aportó señales nuevas (o no se pudo leer).";
  return `${verifs.length} señal${verifs.length === 1 ? "" : "es"} desde su web: ${verifs.map((v) => v.note.split(" —")[0].split(".")[0]).join(" · ")}.`;
}
