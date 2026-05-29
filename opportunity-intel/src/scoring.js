// =============================================================================
// scoring.js — The scoring engine.
//
// Pure, deterministic, side-effect-free. Given an opportunity (signals +
// evidence + a config), it returns every score the system reports, plus the
// red/green flag counts and the final recommendation.
//
// Design tenets, straight from the brief:
//   - Conservative by default. 80% conservative judgement, 20% pattern reach.
//   - Grey ("we don't know") is treated as "probably not", never as neutral.
//   - Red flags cap ceilings; 4+ reds discard outright.
//   - No score is emitted without an explanation the UI can show.
//   - Nothing is hardcoded in the UI — all logic lives here and is testable.
// =============================================================================

import {
  FILTERS,
  FILTER_KEYS,
  LEVELS,
  CONSERVATIVE_BIAS,
  MIN_EVIDENCE_FOR_SHORTLIST,
  OFFER_LADDER,
} from "./models.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
// Una cifra decimal: las puntuaciones dejan de parecer "redondas" (71, 61) y
// dos leads con señales casi iguales se diferencian de verdad.
const round = (n) => Math.round(n * 10) / 10;
// Entero (para conteos, no para puntuaciones).
const roundInt = (n) => Math.round(n);

/**
 * Blended numeric value for a signal colour, given the configured conservatism.
 * conservatism 1.0 -> pure conservative reading; 0.0 -> pure aggressive.
 * Default sits at CONSERVATIVE_BIAS (0.8).
 */
export function levelValue(levelKey, conservatism = CONSERVATIVE_BIAS) {
  const lv = LEVELS[levelKey] || LEVELS.grey;
  const c = clamp(conservatism, 0, 1);
  return lv.conservative * c + lv.aggressive * (1 - c);
}

/** Resolve a filter's colour for an opportunity, defaulting to grey. */
function levelOf(opp, key) {
  const sig = opp.signals && opp.signals[key];
  const lvl = sig && sig.level;
  return LEVELS[lvl] ? lvl : "grey";
}

/** Count signal colours across the ten filters. */
export function countFlags(opp) {
  const counts = { green: 0, yellow: 0, grey: 0, red: 0 };
  for (const key of FILTER_KEYS) counts[levelOf(opp, key)]++;
  return counts;
}

/** Total evidence weight (sum of tiers) and coverage (distinct filters). */
export function evidenceProfile(opp) {
  const evidence = Array.isArray(opp.evidence) ? opp.evidence : [];
  const sumTier = evidence.reduce((s, e) => s + (Number(e.tier) || 1), 0);
  const filtersCovered = new Set(evidence.map((e) => e.filter).filter(Boolean));
  return {
    count: evidence.length,
    sumTier,
    distinctFilters: filtersCovered.size,
  };
}

/**
 * Provenance / verification profile. Answers: how much of this lead is actually
 * proven, and what is still an unverified gap to confirm before calling?
 *
 * A filter counts as VERIFIED only when it is green/yellow AND backed by at
 * least one evidence point carrying a real citation URL. Grey filters (and any
 * signal with no cited evidence) are GAPS — exactly the list an analyst should
 * close. Red filters are tracked separately (proven-negative, not a gap).
 *
 * @returns {{ verifiedFilters:string[], gapFilters:string[],
 *   citedCount:number, uncitedCount:number, sourceCount:number,
 *   verifiedShare:number, fullyCited:boolean }}
 */
export function verificationProfile(opp) {
  const evidence = Array.isArray(opp.evidence) ? opp.evidence : [];
  // Which filters have at least one *cited* (url-bearing) evidence point.
  const citedByFilter = new Set(
    evidence.filter((e) => e.url).map((e) => e.filter)
  );
  const citedCount = evidence.filter((e) => e.url).length;
  const uncitedCount = evidence.length - citedCount;

  const verifiedFilters = [];
  const gapFilters = [];
  for (const key of FILTER_KEYS) {
    const lvl = levelOf(opp, key);
    if ((lvl === "green" || lvl === "yellow") && citedByFilter.has(key)) {
      verifiedFilters.push(key);
    } else if (lvl !== "red") {
      // grey, or green/yellow asserted without a citation = a gap to confirm.
      gapFilters.push(key);
    }
  }

  // Distinct citation sources (deduped URLs) — breadth of provenance.
  const sourceCount = new Set(
    evidence.filter((e) => e.url).map((e) => e.url)
  ).size;

  return {
    verifiedFilters,
    gapFilters,
    citedCount,
    uncitedCount,
    sourceCount,
    verifiedShare: Math.round((verifiedFilters.length / FILTER_KEYS.length) * 100),
    fullyCited: uncitedCount === 0 && citedCount > 0,
  };
}

/** Proporción de evidencias que llevan cita (url). 0..1. */
function evidenceCitedShare(opp) {
  const ev = Array.isArray(opp.evidence) ? opp.evidence : [];
  if (!ev.length) return 0;
  return ev.filter((e) => e.url).length / ev.length;
}

// --- Individual score computations ------------------------------------------

function confidenceScore(opp, conservatism, weightMultipliers) {
  // Optional per-filter weight multipliers come from the learning loop's
  // calibration (calibration.js). They are renormalised so the weights still
  // sum to 1.0 — calibration changes the *balance* between filters, never the
  // overall scale, keeping scores comparable across calibration states.
  const mult = weightMultipliers || null;
  let totalWeight = 0;
  const effective = FILTERS.map((f) => {
    const w = f.weight * (mult ? mult[f.key] ?? 1 : 1);
    totalWeight += w;
    return w;
  });
  let raw = 0;
  FILTERS.forEach((f, i) => {
    const w = totalWeight > 0 ? effective[i] / totalWeight : f.weight;
    raw += w * levelValue(levelOf(opp, f.key), conservatism);
  });
  // Micro-ajuste por CALIDAD de evidencia (±~1.5 pts). No mueve el orden que
  // marcan las señales, pero diferencia leads con señales idénticas según
  // cuánta evidencia citada y de peso los respalda. Por eso las puntuaciones
  // ya no salen "redondas" ni empatadas.
  const { sumTier, distinctFilters } = evidenceProfile(opp);
  const citedShare = evidenceCitedShare(opp);
  const quality = (Math.min(sumTier, 12) / 12) * 0.6 + (distinctFilters / FILTER_KEYS.length) * 0.4;
  const microAdj = (quality * citedShare - 0.4) * 3; // rango aprox. -1.2 .. +1.8
  return clamp(raw * 100 + microAdj);
}

function evidenceStrength(opp) {
  const { count, sumTier, distinctFilters } = evidenceProfile(opp);
  // Two ingredients, deliberately balanced so neither alone saturates the
  // score: depth (how load-bearing the evidence is) and breadth (how many of
  // the ten filters it actually corroborates). A pile of strong evidence on a
  // single filter is worth less than evidence spread across the thesis.
  const depth = (sumTier / 20) * 60; // ~6-7 tier-3 points to max the depth term
  const breadth = (distinctFilters / FILTER_KEYS.length) * 40;
  let strength = depth + breadth;
  // Hard conservative cap: fewer than the required evidence points can never
  // read as strong, no matter how load-bearing.
  if (count < MIN_EVIDENCE_FOR_SHORTLIST) strength = Math.min(strength, 40);
  return clamp(round(strength));
}

function conversationProbability(opp, conservatism, confidence) {
  const v = (k) => levelValue(levelOf(opp, k), conservatism);
  const core =
    v("reachableDecisionMaker") * 0.4 +
    v("activePainSignal") * 0.25 +
    v("whyNow") * 0.2 +
    v("transitionSignal") * 0.15;
  // Damp by overall confidence so a reachable contact on a weak lead doesn't
  // inflate the odds of a real conversation.
  const damp = 0.6 + 0.4 * (confidence / 100);
  return clamp(round(core * 100 * damp));
}

function meetingProbability(opp, conservatism, conversation) {
  const v = (k) => levelValue(levelOf(opp, k), conservatism);
  const f =
    v("visibleTension") * 0.4 +
    v("budgetPriority") * 0.35 +
    v("actionableLever") * 0.25;
  // A meeting is a subset of a conversation, so it can never exceed it.
  return clamp(round(conversation * (0.4 + 0.6 * f)));
}

function closingPotential(opp, conservatism, confidence, redCount) {
  const v = (k) => levelValue(levelOf(opp, k), conservatism);
  const core =
    v("economicCapacity") * 0.3 +
    v("budgetPriority") * 0.25 +
    v("strategicFit") * 0.2 +
    v("visibleTension") * 0.15 +
    v("brutalFinalFilter") * 0.1;
  const damp = 0.55 + 0.45 * (confidence / 100);
  let closing = core * 100 * damp;
  closing -= redCount * 6; // each red flag erodes closing odds
  return clamp(round(closing));
}

function economicPotential(opp, conservatism, closing) {
  const cap = levelOf(opp, "economicCapacity");
  const budget = levelOf(opp, "budgetPriority");
  if (cap === "green" && closing >= 70 && budget !== "red") return "very high";
  if (cap === "green" || (cap === "yellow" && closing >= 60)) return "high";
  if (cap === "yellow" || cap === "grey") return "medium";
  return "low";
}

function classify(opp, { confidence, econPotential, redCount }, config) {
  // DESCARTE DURO: pruebas negativas reales (no "falta de datos").
  if (redCount >= 4) return "discard";
  if (levelOf(opp, "strategicFit") === "red") return "discard";
  if (redCount === 3 && econPotential !== "very high") return "discard";
  // POR EVALUAR: empresa válida pero aún sin "momento"/evidencia suficiente
  // para cualificar. No es un rechazo — es un prospecto a enriquecer. Esto
  // separa "no sabemos todavía" de "no nos sirve".
  if (confidence < config.minScore) return "unqualified";
  // The 01-vs-XN split is about engagement *scope*, not just whether the
  // client can pay €5k. XN LAB is the higher-ticket transformation lab: an
  // opportunity only reaches it if the scoped first move is itself XN-tier
  // (an €8k+ transformation), AND the economics and confidence support it.
  const xnThreshold = config.xnThreshold ?? 68;
  const scope = OFFER_LADDER[opp.suggestedOfferKey]?.owner === "xn" ? "xn" : "01";
  if (
    scope === "xn" &&
    econPotential === "very high" &&
    confidence >= xnThreshold
  )
    return "xn";
  return "01";
}

function recommend(
  { confidence, evidence, conversation, redCount, classification },
  config
) {
  if (classification === "discard") return "discard";
  // "Por evaluar": prospecto válido sin momento confirmado → enriquecer.
  if (classification === "unqualified") return "enrich";
  if (confidence >= 76 && evidence >= 55 && conversation >= 55 && redCount <= 1)
    return "call_immediately";
  if (confidence >= 60) return "prepare_audit";
  return "secondary";
}

function callPriority(confidence, redCount) {
  if (redCount >= 3) return "low";
  if (confidence >= 75) return "high";
  if (confidence >= 58) return "medium";
  return "low";
}

/**
 * Score a single opportunity. Returns a flat object of all reported metrics
 * plus the diagnostic flag counts and the discard reason (if any).
 *
 * @param {object} opp    Opportunity (signals + evidence + narrative)
 * @param {object} config Search configuration (conservatism, minScore, ...)
 */
export function scoreOpportunity(opp, config = {}) {
  const conservatism = clamp(config.conservatism ?? CONSERVATIVE_BIAS, 0, 1);
  const flags = countFlags(opp);
  const redCount = flags.red;
  const greenCount = flags.green;

  const confidence = round(
    confidenceScore(opp, conservatism, config.weightMultipliers)
  );
  const evidence = evidenceStrength(opp);
  const conversation = conversationProbability(opp, conservatism, confidence);
  const meeting = meetingProbability(opp, conservatism, conversation);
  const closing = closingPotential(opp, conservatism, confidence, redCount);
  const econPotential = economicPotential(opp, conservatism, closing);

  // Apply the brief's hard caps. 4+ reds cannot present as a confident lead.
  let cappedConfidence = confidence;
  let discardReason = null;
  if (redCount >= 4) {
    cappedConfidence = Math.min(cappedConfidence, 25);
    discardReason = "4+ banderas rojas";
  } else if (redCount === 3 && econPotential !== "very high") {
    cappedConfidence = Math.min(cappedConfidence, 44);
    discardReason = "3 banderas rojas sin potencial económico muy alto";
  }

  const classification = classify(
    opp,
    { confidence: cappedConfidence, econPotential, redCount },
    { ...config, minScore: config.minScore ?? 45, xnThreshold: config.xnThreshold ?? 68 }
  );

  const recommendation = recommend(
    {
      confidence: cappedConfidence,
      evidence,
      conversation,
      redCount,
      classification,
    },
    config
  );

  const { count: evidenceCount } = evidenceProfile(opp);

  // Índice de ÉXITO: probabilidad amplificada de que la llamada acabe en
  // negocio. No es la confianza sola — encadena el embudo real (conversar →
  // reunir → cerrar) ponderado por la confianza. Es la métrica de "posibilidad
  // de éxito" que prioriza el usuario: claridad sobre qué tiene más recorrido.
  const successIndex = round(
    (conversation * 0.25 + meeting * 0.35 + closing * 0.40) *
      (0.55 + 0.45 * (cappedConfidence / 100))
  );

  return {
    confidence: cappedConfidence,
    rawConfidence: confidence,
    successIndex,
    evidence,
    conversation,
    meeting,
    closing,
    economicPotential: econPotential,
    classification,
    recommendation,
    callPriority: callPriority(cappedConfidence, redCount),
    flags,
    redCount,
    greenCount,
    evidenceCount,
    discardReason,
    verification: verificationProfile(opp),
    shortlistEligible:
      classification !== "discard" &&
      evidenceCount >= MIN_EVIDENCE_FOR_SHORTLIST &&
      redCount < 4,
  };
}

/**
 * Compose a one-line, defensible explanation of why this lead scored as it
 * did — the kind of thing an analyst would say out loud.
 */
export function explainScore(scored) {
  const parts = [];
  parts.push(`${scored.greenCount} verde / ${scored.redCount} rojo de 10 filtros`);
  parts.push(`${scored.evidenceCount} evidencias`);
  if (scored.discardReason) parts.push(`limitado: ${scored.discardReason}`);
  return parts.join(" · ");
}
