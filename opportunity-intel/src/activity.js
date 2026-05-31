// =============================================================================
// activity.js — Feed de actividad del equipo, DERIVADO del estado que ya existe
// (engagements + CRM), sin una nueva vía de escritura. Reúne en una línea
// temporal quién hizo qué: proyectos creados, notas/commits de bitácora, hitos
// cumplidos y movimientos del CRM. Pura y testeable.
// =============================================================================

import { STATUS_LABELS } from "./models.js";

/**
 * Construye el feed (lo más reciente primero).
 * @param {object[]} engagements
 * @param {object}   tracking      mapa id→{status, by, updatedAt}
 * @param {function} leadName      id → nombre de empresa (para el CRM)
 * @param {number}   limit
 */
export function buildActivity({ engagements = [], tracking = {}, leadName = () => "", limit = 50 } = {}) {
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

  return items
    .filter((x) => x.at)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, Math.max(0, limit));
}
