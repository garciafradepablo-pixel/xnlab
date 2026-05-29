// =============================================================================
// diagnosis.js — Lectura de señales → diagnóstico, motivo de fallo y "camino".
//
// Tres utilidades de lectura/auto-análisis que alimentan la UI y el aprendizaje:
//
//   failureReason(opp)  — si una llamada falla o queda inconclusa, ¿por qué,
//                         según las señales débiles de la propia empresa?
//                         (Para pintar en ROJO los botones de fallo con causa.)
//
//   viability(opp)      — lectura de viabilidad/cobertura: cuánto sabemos, qué
//                         falta, y un veredicto de si merece la pena seguir.
//
//   recommendedPath(opp)— el "camino": los pasos concretos para reducir la
//                         probabilidad de negativa antes y durante la llamada.
// =============================================================================

import { FILTER_BY_KEY, FILTER_KEYS } from "./models.js";

function levelOf(opp, key) {
  return opp?.signals?.[key]?.level || "grey";
}

// Estados que representan fallo o resultado inconcluso (no éxito).
export const FAILURE_STATUSES = new Set(["rejected", "wrong_fit", "no_answer"]);
export const INCONCLUSIVE_STATUSES = new Set(["no_answer", "follow_up"]);

// Para cada filtro débil, la causa probable de negativa que implica y cómo
// mitigarla. Ordenadas por peso de impacto en el cierre.
const FAILURE_PLAYBOOK = [
  {
    key: "reachableDecisionMaker",
    cause: "No llegamos a quien decide — hablamos con un filtro, no con el dueño.",
    mitigate: "Identificar al decisor por nombre (LinkedIn) y pedir por él directamente.",
  },
  {
    key: "budgetPriority",
    cause: "El problema no afecta a ingresos de forma evidente para ellos.",
    mitigate: "Anclar la conversación en dinero perdido, no en estética.",
  },
  {
    key: "whyNow",
    cause: "No hay urgencia: la llamada llega sin un motivo de 'ahora'.",
    mitigate: "Conectar con un gatillo reciente (apertura, ronda, campaña).",
  },
  {
    key: "activePainSignal",
    cause: "El dolor aún no es consciente para ellos — no sienten el problema.",
    mitigate: "Mostrar evidencia concreta (reseñas, fugas) que haga visible el dolor.",
  },
  {
    key: "visibleTension",
    cause: "No perciben desajuste entre lo que son y cómo comunican.",
    mitigate: "Enseñar el contraste producto-premium vs percepción actual.",
  },
  {
    key: "economicCapacity",
    cause: "Puede que no tengan músculo para el ticket propuesto.",
    mitigate: "Empezar por una auditoría de bajo ticket como puerta de entrada.",
  },
  {
    key: "actionableLever",
    cause: "La propuesta es difusa — no ven un primer paso claro.",
    mitigate: "Proponer UNA palanca concreta y medible, no un proyecto entero.",
  },
  {
    key: "strategicFit",
    cause: "Encaje dudoso — puede no ser el tipo de cliente adecuado.",
    mitigate: "Cualificar antes de invertir tiempo; quizá no es para nosotros.",
  },
];

/**
 * Motivo probable de fallo/inconclusión, leído de las señales débiles del lead.
 * @returns {{ headline:string, causes:Array<{filter,label,cause,mitigate,level}> }}
 */
export function failureReason(opp) {
  const causes = [];
  for (const item of FAILURE_PLAYBOOK) {
    const lvl = levelOf(opp, item.key);
    if (lvl === "red" || lvl === "grey") {
      causes.push({
        filter: item.key,
        label: FILTER_BY_KEY[item.key]?.label || item.key,
        cause: item.cause,
        mitigate: item.mitigate,
        level: lvl,
      });
    }
    if (causes.length >= 3) break;
  }
  const headline = causes.length
    ? "Causa probable según las señales débiles de esta empresa:"
    : "Sin causa estructural evidente — probablemente timing o ejecución de la llamada.";
  return { headline, causes };
}

/**
 * Lectura de viabilidad y cobertura. ¿Cuánto sabemos de verdad y merece seguir?
 * @returns {{ coverage:number, verdict:string, tone:"hot"|"warm"|"cool",
 *   strengths:string[], gaps:string[] }}
 */
export function viability(opp) {
  const s = opp?.scores || {};
  const v = s.verification || { verifiedShare: 0, gapFilters: [] };
  // Cobertura = mezcla de confianza, fuerza de evidencia y % verificado.
  const coverage = Math.round(
    (Number(s.confidence || 0) * 0.45 +
      Number(s.evidence || 0) * 0.25 +
      Number(v.verifiedShare || 0) * 0.3)
  );
  const strengths = FILTER_KEYS.filter((k) => levelOf(opp, k) === "green").map(
    (k) => FILTER_BY_KEY[k]?.label || k
  );
  const gaps = (v.gapFilters || []).map((k) => FILTER_BY_KEY[k]?.label || k);

  let verdict, tone;
  if (coverage >= 70) { verdict = "Viable: hay suficiente para llamar con tesis sólida."; tone = "hot"; }
  else if (coverage >= 50) { verdict = "Viable con reservas: confirmar 1-2 huecos antes de llamar."; tone = "warm"; }
  else { verdict = "Cobertura baja: enriquecer antes de invertir una llamada."; tone = "cool"; }

  return { coverage, verdict, tone, strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4) };
}

/**
 * El "camino": pasos para reducir la probabilidad de negativa. Combina los
 * huecos a confirmar (antes) con los mitigadores de los riesgos (durante).
 * @returns {string[]} pasos ordenados
 */
export function recommendedPath(opp) {
  const steps = [];
  const v = opp?.scores?.verification;

  // 1) Cerrar el hueco más barato primero: decisor.
  if (levelOf(opp, "reachableDecisionMaker") !== "green") {
    steps.push("Antes de llamar: localizar al decisor por nombre (LinkedIn / web).");
  }
  // 2) Verificar la web/tensión si está sin confirmar.
  if (v && v.gapFilters?.includes("visibleTension")) {
    steps.push("Revisar su web y reseñas 2 min: confirmar la tensión real que abrir.");
  }
  // 3) Armar el gancho de urgencia.
  if (levelOf(opp, "whyNow") !== "green") {
    steps.push("Buscar un gatillo reciente (prensa/apertura) para justificar el 'ahora'.");
  } else {
    steps.push("Abrir con el gatillo de 'por qué ahora' — ya es fuerte.");
  }
  // 4) Anclar en dinero.
  steps.push("Enchufar la conversación a ingresos perdidos, no a estética.");
  // 5) Pedir el micro-compromiso, no el proyecto.
  steps.push("Cerrar pidiendo una mini-auditoría de 15 min, no el proyecto completo.");

  return steps.slice(0, 5);
}
