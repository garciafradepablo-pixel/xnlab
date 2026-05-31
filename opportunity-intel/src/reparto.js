// =============================================================================
// reparto.js — Economía de proyecto y reparto por contribución.
//
// El corazón del sistema de la agencia: un proyecto entra con un importe y unos
// costes; de ahí sale el MARGEN. Una parte del margen (el "pool") se reparte
// entre quienes lo hicieron posible, proporcional a su CONTRIBUCIÓN. La
// contribución de cada uno se mide con tres palancas, no con el dedo:
//
//     puntuación = aportación × encaje_de_habilidad × importancia
//
//   - aportación: cuánto trabajo real puso (puntos/peso de las acciones).
//   - encaje de habilidad: cómo de bien encajaba su skill con lo que el
//     proyecto necesitaba (1 = neutral; <1 tangencial; >1 clave).
//   - importancia: criticidad de su papel en ESTE proyecto (1 = neutral).
//
// Todo son funciones puras: entran datos, sale el reparto. Sin estado, sin red
// — fácil de auditar y de testear. El dinero se redondea solo al presentarlo.
// =============================================================================

/** Número finito o un valor por defecto. */
export function num(v, d = 0) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : d;
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Margen del proyecto: importe − costes (+ % sobre el importe). */
export function projectMargin(p = {}) {
  const revenue = Math.max(0, num(p.revenue));
  const costs = Math.max(0, num(p.costs));
  const margin = revenue - costs;
  const marginPct = revenue > 0 ? margin / revenue : 0;
  return { revenue, costs, margin, marginPct };
}

/** Puntuación de contribución de un participante (aportación×habilidad×importancia). */
export function contributionScore(part = {}) {
  const aportacion = Math.max(0, num(part.aportacion, 0));
  const skill = Math.max(0, num(part.skill, 1));        // encaje de habilidad
  const importance = Math.max(0, num(part.importance, 1)); // importancia del papel
  return aportacion * skill * importance;
}

/**
 * Reparte el beneficio distribuible del proyecto entre sus participantes.
 * @returns {{revenue,costs,margin,marginPct,poolPct,distributable,agencyKeep,
 *            totalScore, shares: Array<{name,score,sharePct,payout}>}}
 */
export function distributeProject(p = {}) {
  const { revenue, costs, margin, marginPct } = projectMargin(p);
  const poolPct = clamp01(num(p.poolPct, 0.4)); // % del margen al pool de contribuyentes
  const distributable = Math.max(0, margin) * poolPct; // nunca se reparte una pérdida
  const agencyKeep = margin - distributable;
  const parts = Array.isArray(p.participants) ? p.participants : [];
  const scored = parts.map((part) => ({ part, score: contributionScore(part) }));
  const totalScore = scored.reduce((s, x) => s + x.score, 0);
  const shares = scored.map(({ part, score }) => {
    const sharePct = totalScore > 0 ? score / totalScore : 0;
    return { name: part.name, score, sharePct, payout: distributable * sharePct };
  });
  return { revenue, costs, margin, marginPct, poolPct, distributable, agencyKeep, totalScore, shares };
}

/**
 * Beneficios acumulados por trabajador a lo largo de TODOS los proyectos
 * (solo cuenta los proyectos no archivados/borrados que reciba).
 * @returns {Map<string,{name,total,projects:Array<{project,projectId,payout,sharePct}>}>}
 */
export function earningsByWorker(projects = []) {
  const map = new Map();
  for (const p of projects) {
    const d = distributeProject(p);
    for (const s of d.shares) {
      const key = String(s.name || "").trim().toLowerCase();
      if (!key) continue;
      const cur = map.get(key) || { name: s.name, total: 0, projects: [] };
      cur.total += s.payout;
      cur.projects.push({ project: p.name || "Proyecto", projectId: p.id, payout: s.payout, sharePct: s.sharePct });
      map.set(key, cur);
    }
  }
  return map;
}

/** Totales de la cartera: importe, margen y bolsa a repartir agregados. */
export function portfolioTotals(projects = []) {
  let revenue = 0, costs = 0, margin = 0, distributable = 0;
  for (const p of projects) {
    const d = distributeProject(p);
    revenue += d.revenue; costs += d.costs; margin += d.margin; distributable += d.distributable;
  }
  const marginPct = revenue > 0 ? margin / revenue : 0;
  return { revenue, costs, margin, marginPct, distributable, count: projects.length };
}
