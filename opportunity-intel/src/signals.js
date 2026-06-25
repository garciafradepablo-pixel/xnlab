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

function urlOf(opp) {
  const w = opp.website || opp.web || "";
  return typeof w === "string" ? w : "";
}

// Una URL que NO es web propia: su única presencia es una red o un enlace social.
// Observable en la propia URL — hueco real de captación, sin inferencia.
const SOCIAL_HOST = /(facebook\.com|instagram\.com|twitter\.com|x\.com\/|linkedin\.com|tiktok\.com|wa\.me|whatsapp\.com|business\.site|linktr\.ee|beacons\.ai|t\.me\/)/i;
// Constructores gratuitos: web real, pero en plataforma de bajo coste → margen claro.
const FREE_HOST = /(wixsite\.com|\.wix\.com|weebly\.com|\.blogspot\.|wordpress\.com|\.jimdo|webnode\.|mystrikingly\.com|godaddysites\.com|sites\.google\.com|carrd\.co|\.glitch\.me|negocio\.site)/i;
// HTTP explícito (no HTTPS): hueco de seguridad/confianza, leído de la URL.
const isInsecure = (u) => /^http:\/\//i.test(u);


/** Lectura de frescura web cruda, si un enrich la dejó en el lead (p. ej. tests). */
function storedFreshness(opp) {
  const fr = opp.webFreshness || opp._webFreshness || null;
  return fr && fr.readable ? fr : null;
}

/**
 * Evidencia derivada de una lectura REAL de su web, ya persistida por el
 * enriquecimiento: store.applyVerifications deja una entrada con
 * source "Lectura de su web" y la url real. Esto es lo que sobrevive al recompute,
 * así que es de aquí de donde sale web_stale en la app real (no de un campo que
 * nadie escribe). Exige url http real → nunca confunde una nota tecleada a mano.
 */
function webReadEvidence(opp) {
  const ev = Array.isArray(opp.evidence) ? opp.evidence : [];
  return ev.find((e) =>
    e && e.source === "Lectura de su web" &&
    typeof e.url === "string" && /^https?:\/\//i.test(e.url)) || null;
}

function staleSignal(note, url) {
  const label = String(note || "")
    .replace(/^Palanca de rediseño:\s*/i, "")
    .replace(/\.$/, "") || "web con margen de mejora";
  return {
    key: "web_stale",
    label,
    strength: "indicative",
    source: "su web",
    url: url || null,
    verified: true,
    detail: note || null,
  };
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
  const url = urlOf(opp);

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
  } else {
    // 2) Solo redes / enlace social — sin web propia que controle. Observable.
    if (SOCIAL_HOST.test(url)) {
      out.push({
        key: "social_only",
        label: "Solo redes, sin web propia",
        strength: "strong",
        source: "su enlace",
        url,
        verified: true,
        detail: "Su única presencia es una red/enlace social: no controla una web propia.",
      });
    } else if (FREE_HOST.test(url)) {
      // 3) Web en constructor gratuito — margen claro de profesionalización.
      out.push({
        key: "free_host",
        label: "Web en plataforma gratuita",
        strength: "indicative",
        source: "su web",
        url,
        verified: true,
        detail: "Su web vive en un constructor gratuito: margen claro de profesionalización.",
      });
    }

    // 4) Sin HTTPS — hueco de seguridad/confianza (y de SEO). Leído de la URL.
    if (isInsecure(url)) {
      out.push({
        key: "no_https",
        label: "Web sin HTTPS",
        strength: "indicative",
        source: "su web",
        url,
        verified: true,
        detail: "Su web no usa HTTPS: hueco de seguridad y confianza, penaliza en buscadores.",
      });
    }

    // 5) Web obsoleta / no responsive — SIEMPRE a partir de una lectura REAL:
    //    frescura cruda (si está) o, en la app, la evidencia citada del enrich.
    const fr = storedFreshness(opp);
    if (fr) {
      const lever = webLeverFromFreshness(fr, year);
      if (lever) out.push(staleSignal(lever.note, url || null));
    } else {
      const we = webReadEvidence(opp);
      if (we) out.push(staleSignal(we.note, we.url));
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

// Señales web que alimentan la PUNTUACIÓN (no solo la UI). Un hueco web real es
// una palanca de acción concreta — eso es exactamente lo que mide actionableLever.
const LEVER_KEYS = new Set(["no_web", "social_only", "free_host", "no_https", "web_stale"]);

/**
 * Convierte la mejor señal web real en una palanca para el motor (actionableLever).
 * Fuerte → "green", indicio → "yellow". Devuelve null si no hay señal web real,
 * de modo que un lead sin hueco detectado NO se toca (cero efecto, cero invención).
 * @returns {{level:"green"|"yellow", note:string, key:string}|null}
 */
export function signalLever(opp = {}, opts = {}) {
  const webSignals = detectSignals(opp, opts).filter((s) => LEVER_KEYS.has(s.key));
  if (!webSignals.length) return null;
  const rank = (s) => (s.strength === "strong" ? 0 : 1);
  const best = webSignals.sort((a, b) => rank(a) - rank(b))[0];
  return { level: best.strength === "strong" ? "green" : "yellow", note: best.detail || best.label, key: best.key };
}
