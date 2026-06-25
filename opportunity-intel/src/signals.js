// =============================================================================
// signals.js — Capa de detección de señales REALES.
//
// Una "señal" es una observación con BASE VERIFICABLE de que una empresa tiene
// un hueco accionable ahora. Principio rector del producto: nunca se inventa.
// Cada señal lleva su fuente; si no hay base real, no hay señal. Esto sustituye
// los strings tecleados a mano del seed por detección honesta y citada.
//
// Detectores de esta v1 (todos deterministas, sin red — testables):
//   · no_web      — la empresa no tiene web propia. Hueco fuerte y OBSERVABLE
//                   (offline, real). Enorme en listas importadas solo-nombre.
//   · web_stale   — web sin actualizar / sin versión móvil. Derivado de una
//                   lectura REAL previa (enrich-web → copyright_year/viewport).
//
// La capa es extensible: añadir un detector = añadir una función pura que
// devuelve una Signal o null a partir de datos verificables del lead.
// =============================================================================

import { webLeverFromFreshness } from "./enrichweb.js";

/**
 * @typedef {Object} Signal
 * @property {string} key        identificador estable del tipo de señal
 * @property {string} label      etiqueta breve para UI (sin punto final)
 * @property {"strong"|"indicative"} strength
 * @property {string} source     de dónde sale (cita corta: "su web", "presencia web")
 * @property {?string} url        enlace de la fuente, si lo hay
 * @property {boolean} verified   true si la observación es directa (no inferida)
 * @property {?string} detail     una línea ampliando la señal
 */

function hasRealWebsite(opp) {
  const w = opp.website || opp.web || "";
  return typeof w === "string" && /[a-z0-9-]+\.[a-z]{2,}/i.test(w);
}

/** Lectura de frescura web ya almacenada por un enrich REAL previo, si la hay. */
function storedFreshness(opp) {
  const fr = opp.webFreshness || opp._webFreshness || null;
  return fr && fr.readable ? fr : null;
}

/**
 * Detecta las señales reales de un lead. Devuelve [] cuando no hay base real —
 * silencio honesto, nunca un hueco inventado.
 * @param {object} opp
 * @param {{year?:number}} [opts]
 * @returns {Signal[]}
 */
export function detectSignals(opp = {}, opts = {}) {
  const year = opts.year || new Date().getFullYear();
  const out = [];
  const website = opp.website || opp.web || null;

  // 1) Sin presencia web — hueco directo de captación digital. Observable sin red.
  if (!hasRealWebsite(opp)) {
    out.push({
      key: "no_web",
      label: "Sin presencia web",
      strength: "strong",
      source: "presencia web",
      url: null,
      verified: true,
      detail: "No se le encuentra web propia: hueco directo de captación digital.",
    });
  }

  // 2) Web obsoleta / no responsive — a partir de una lectura real (enrich-web).
  const fr = storedFreshness(opp);
  if (hasRealWebsite(opp) && fr) {
    const lever = webLeverFromFreshness(fr, year);
    if (lever) {
      const label = lever.note
        .replace(/^Palanca de rediseño:\s*/i, "")
        .replace(/\.$/, "");
      out.push({
        key: "web_stale",
        label,
        strength: "indicative",
        source: "su web",
        url: typeof website === "string" ? website : null,
        verified: true,
        detail: lever.note,
      });
    }
  }

  return out;
}

/**
 * La mejor señal para mostrar: las fuertes (observables) antes que los indicios.
 * @param {object} opp
 * @param {{year?:number}} [opts]
 * @returns {Signal|null}
 */
export function primarySignal(opp = {}, opts = {}) {
  const rank = (s) => (s.strength === "strong" ? 0 : 1);
  return detectSignals(opp, opts).sort((a, b) => rank(a) - rank(b))[0] || null;
}

/** ¿Tiene el lead al menos una señal real detectada? */
export function hasRealSignal(opp = {}, opts = {}) {
  return detectSignals(opp, opts).length > 0;
}
