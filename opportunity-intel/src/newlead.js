// =============================================================================
// newlead.js — Construye una oportunidad bien formada desde la entrada mínima
// del formulario "Buscar / añadir leads" dentro de la app.
//
// El usuario aporta lo que sabe (nombre, sector, ciudad, web, decisor, qué
// momento/transición detecta y qué tensión ve). De ahí derivamos señales
// conservadoras y evidencia citada — sin inventar: si no marca algo, queda gris.
// =============================================================================

import { FILTER_KEYS } from "./models.js";

let counter = 0;
function uid() {
  counter++;
  return `u-${Date.now().toString(36)}-${counter}`;
}

const grey = () => Object.fromEntries(FILTER_KEYS.map((k) => [k, { level: "grey" }]));

/**
 * @param {object} input
 *   company, sector, subsector, city, region, website, instagram, linkedin,
 *   phone, email, dmName, dmRole, dmLinkedin,
 *   transitionNote, transitionUrl   (la señal/momento — opcional pero recomendado)
 *   tensionNote                      (qué se ve mal — opcional)
 *   offer (clave de oferta), tensions [keys]
 * @returns {object} oportunidad lista para puntuar
 */
export function buildLead(input) {
  const signals = grey();
  const evidence = [];

  // Capacidad y encaje: por defecto amarillo (hay que confirmarlo), nunca verde
  // gratis. El usuario los sube luego con verificación.
  signals.economicCapacity = { level: "yellow" };
  signals.strategicFit = { level: "yellow" };

  // Transición / por qué ahora: si aporta un momento con fuente, cuenta fuerte.
  if (input.transitionNote) {
    const tier = input.transitionUrl ? 3 : 1;
    signals.transitionSignal = { level: input.transitionUrl ? "green" : "yellow" };
    signals.whyNow = { level: input.transitionUrl ? "green" : "yellow" };
    evidence.push({
      filter: "transitionSignal", type: "press", source: input.transitionUrl ? "Fuente citada" : "Aportado por usuario",
      note: input.transitionNote, tier, url: input.transitionUrl || "aportado-usuario",
    });
  }

  // Tensión visible: si la describe, amarillo + evidencia (sin url = baja).
  if (input.tensionNote) {
    signals.visibleTension = { level: "yellow" };
    evidence.push({
      filter: "visibleTension", type: "web", source: "Aportado por usuario",
      note: input.tensionNote, tier: 1, url: input.website || "aportado-usuario",
    });
  }

  // Decisor alcanzable: verde si hay nombre + (linkedin o teléfono o email).
  const reachable = input.dmName && (input.dmLinkedin || input.phone || input.email);
  if (reachable) {
    signals.reachableDecisionMaker = { level: "green" };
    evidence.push({
      filter: "reachableDecisionMaker", type: "directory", source: "Aportado por usuario",
      note: `Decisor: ${input.dmName}${input.dmRole ? ` (${input.dmRole})` : ""}`,
      tier: 2, url: input.dmLinkedin ? normLi(input.dmLinkedin) : (input.website || "aportado-usuario"),
    });
  } else if (input.dmName) {
    signals.reachableDecisionMaker = { level: "yellow" };
  }

  // Palanca accionable: si hay web (algo que tocar), amarillo.
  if (input.website) signals.actionableLever = { level: "yellow" };

  return {
    id: input.id || uid(),
    company: input.company || "Sin nombre",
    sector: input.sector || "growth",
    subsector: input.subsector || "",
    categoryPath: Array.isArray(input.categoryPath) && input.categoryPath.length ? input.categoryPath : null,
    tags: input.tags && typeof input.tags === "object" && Object.keys(input.tags).length ? input.tags : null,
    city: input.city || "",
    region: input.region || "",
    country: "Spain",
    website: input.website || null,
    instagram: input.instagram || null,
    linkedin: input.linkedin || null,
    googleMaps: input.googleMaps || null,
    phone: input.phone || null,
    email: input.email || null,
    decisionMaker: { name: input.dmName || null, role: input.dmRole || "", linkedin: input.dmLinkedin || null },
    suggestedOfferKey: input.offer || "audit",
    signals,
    evidence,
    tensions: input.tensions || [],
    userAdded: true,
    addedAt: new Date().toISOString(),
    // Narrativa mínima editable luego.
    thesis: input.thesis || "Lead añadido manualmente — completar tesis tras investigar.",
    summary: input.summary || (input.transitionNote || "Lead añadido desde la app; pendiente de enriquecer."),
    whyNow: input.transitionNote || "Por confirmar.",
    whyBeforeOthers: "Por confirmar.",
    blindSpot: "Por confirmar.",
    firstLever: input.tensionNote || "Por definir tras revisar la web.",
    callOpening: input.callOpening || `Hola, ¿hablo con ${input.dmName || "la dirección"}?`,
    objection: "Por anticipar.",
    objectionResponse: "Por preparar.",
    reasonsNotToCall: ["Lead sin verificar — confirmar antes de invertir tiempo."],
    invalidators: ["La transición no se confirma con una fuente real."],
  };
}

function normLi(v) {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://www.linkedin.com/${v.replace(/^\/+/, "")}`;
}
