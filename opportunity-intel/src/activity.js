// =============================================================================
// activity.js — Feed de actividad del equipo, DERIVADO del estado que ya existe
// (engagements + CRM), sin una nueva vía de escritura. Reúne en una línea
// temporal quién hizo qué: proyectos creados, notas/commits de bitácora, hitos
// cumplidos y movimientos del CRM. Pura y testeable.
// =============================================================================

import { STATUS_LABELS } from "./models.js";
import { CRITICAL_KINDS } from "./growth.js";

/**
 * Construye el feed (lo más reciente primero).
 * @param {object[]} engagements
 * @param {object}   tracking      mapa id→{status, by, updatedAt}
 * @param {object}   growth        mapa dueño→perfil (para los retos de crítica)
 * @param {function} leadName      id → nombre de empresa (para el CRM)
 * @param {number}   limit
 */
export function buildActivity({ engagements = [], tracking = {}, growth = {}, kudos = [], leadName = () => "", limit = 50 } = {}) {
  const items = [];

  for (const e of engagements) {
    if (e.createdAt) {
      items.push({ at: e.createdAt, by: e.createdBy || "", kind: "eng_new", text: `creó el proyecto «${e.title}»` });
    }
    for (const L of (e.log || [])) {
      const note = L.note || (L.commit ? `commit ${L.commit.short || L.commit.hash}` : "");
      items.push({ at: L.at, by: L.by || "", kind: "log", text: `anotó en «${e.title}»`, note, commit: L.commit || null });
    }
    for (const m of (e.milestones || [])) {
      if (m.doneAt) items.push({ at: m.doneAt, by: "", kind: "ms", text: `hito «${m.title}» cumplido en «${e.title}»` });
    }
  }

  for (const [id, rec] of Object.entries(tracking || {})) {
    if (rec && rec.updatedAt && rec.status && rec.status !== "not_called") {
      const label = STATUS_LABELS[rec.status] || rec.status;
      items.push({ at: rec.updatedAt, by: rec.by || "", kind: "crm", text: `movió ${leadName(id) || "un lead"} → «${label}»` });
    }
  }

  // Pensamiento crítico: que se VEA y se reconozca en el equipo. Cada reto
  // registrado entra en el pulso común.
  for (const [owner, prof] of Object.entries(growth || {})) {
    for (const c of (prof && prof.critical && prof.critical.log) || []) {
      if (!c || !c.at) continue;
      items.push({ at: c.at, by: owner, kind: "critical", text: `ejercitó pensamiento crítico · ${CRITICAL_KINDS[c.kind] || "reto"}`, note: c.note || "" });
    }
  }

  // Reconocimientos: el mérito hecho visible.
  for (const k of kudos || []) {
    if (!k || !k.at) continue;
    items.push({ at: k.at, by: k.from || "", kind: "kudo", text: `reconoció a ${k.to}`, note: k.note || "" });
  }

  return items
    .filter((x) => x.at)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, Math.max(0, limit));
}

/**
 * Resumen de los últimos 7 días a partir del feed: total de eventos, desglose
 * por tipo, por persona, y el conteo de retos de pensamiento crítico (destacado
 * aparte porque es lo que queremos ver crecer).
 */
export function weeklyDigest(feed = [], now = Date.now()) {
  const since = now - 7 * 86400000;
  const byKind = {}, byPerson = {};
  let total = 0, critical = 0;
  for (const x of feed) {
    const t = Date.parse(x.at);
    if (!t || t < since) continue;
    total++;
    byKind[x.kind] = (byKind[x.kind] || 0) + 1;
    if (x.kind === "critical") critical++;
    if (x.by) {
      const p = byPerson[x.by] || (byPerson[x.by] = { total: 0, critical: 0 });
      p.total++;
      if (x.kind === "critical") p.critical++;
    }
  }
  return { total, critical, byKind, byPerson };
}
