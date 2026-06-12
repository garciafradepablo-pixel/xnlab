// =============================================================================
// export.js — Export system: CSV, JSON, PDF (print), and a call sheet.
//
// All exporters take the ranked/final opportunities (already scored) plus the
// per-opportunity tracking records, and return a string or trigger a download.
// No framework — just Blob + anchor for downloads, and window.print() for PDF.
// =============================================================================

import {
  SECTOR_BY_KEY,
  CLASSIFICATIONS,
  RECOMMENDATIONS,
  OFFER_LADDER,
  STATUS_LABELS,
} from "./models.js";
import { decide, strategicLens } from "./decision.js";
import { buildBrief } from "./brief.js";

const offerLabel = (key) => {
  const o = OFFER_LADDER[key];
  return o ? `${o.label} (€${o.price.toLocaleString("es-ES")})` : "—";
};

// ---- CSV --------------------------------------------------------------------

function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(opps, tracking = {}) {
  const headers = [
    "Ranking",
    "Empresa",
    "Sector",
    "Subsector",
    "Ciudad",
    "Clasificación",
    "Confianza",
    "FuerzaEvidencia",
    "Conversación",
    "Reunión",
    "Cierre",
    "PotencialEconómico",
    "Recomendación",
    "PrioridadLlamada",
    "Decisor",
    "Cargo",
    "Teléfono",
    "Email",
    "Web",
    "OfertaSugerida",
    "Estado",
  ];
  const rows = opps.map((o) => {
    const s = o.scores;
    const t = tracking[o.id] || {};
    return [
      o.ranking ?? "",
      o.company,
      SECTOR_BY_KEY[o.sector]?.label || o.sector,
      o.subsector,
      o.city,
      CLASSIFICATIONS[s.classification],
      s.confidence,
      s.evidence,
      s.conversation,
      s.meeting,
      s.closing,
      s.economicPotential,
      RECOMMENDATIONS[s.recommendation],
      s.callPriority,
      o.decisionMaker?.name || "",
      o.decisionMaker?.role || "",
      o.phone || "",
      o.email || "",
      o.website || "",
      offerLabel(o.suggestedOfferKey),
      STATUS_LABELS[t.status || "not_called"],
    ]
      .map(csvCell)
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

// ---- JSON -------------------------------------------------------------------

export function toJSON(opps, tracking = {}) {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: opps.length,
      opportunities: opps.map((o) => ({
        ...o,
        tracking: tracking[o.id] || { status: "not_called" },
      })),
    },
    null,
    2
  );
}

// ---- Call sheet (plain text, print-friendly) --------------------------------

export function toCallSheet(opps) {
  const lines = [];
  lines.push("CONNECT — HOJA DE LLAMADAS");
  lines.push(`Generada ${new Date().toLocaleString("es-ES")}`);
  lines.push("=".repeat(60));
  opps.forEach((o) => {
    const s = o.scores;
    lines.push("");
    lines.push(
      `#${o.ranking ?? "-"}  ${o.company}  [${CLASSIFICATIONS[s.classification]}]`
    );
    lines.push(
      `   ${o.subsector} · ${o.city}  ·  Confianza ${s.confidence} / Cierre ${s.closing}`
    );
    lines.push(
      `   Decisor: ${o.decisionMaker?.name || "—"} (${o.decisionMaker?.role || "—"})  ·  ${o.phone || "sin teléfono"}  ·  ${o.email || "sin email"}`
    );
    lines.push(`   Oferta: ${offerLabel(o.suggestedOfferKey)}`);
    lines.push(`   Apertura: "${o.callOpening}"`);
    lines.push(`   Objeción probable: ${o.objection}`);
    lines.push(`   → Respuesta: ${o.objectionResponse}`);
  });
  return lines.join("\n");
}

// ---- Download helpers -------------------------------------------------------

export function download(filename, text, mime = "text/plain") {
  if (typeof document === "undefined") return text; // node: just return
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- Decision CSV (la capa vendible: OCI + decisión + por qué) --------------
// Cada oportunidad, ya puntuada, pasa por la capa de decisión y sale con su OCI,
// decisión, tag estratégico, lente, calidad de evidencia, kill reasons, acción
// recomendada, ángulo y estado de CRM. Sin dependencias nuevas: Blob + string.
export function toDecisionCSV(opps = [], tracking = {}) {
  const headers = [
    "Empresa", "Website", "Sector", "Ciudad", "OCI", "Decisión", "ValorEstratégico",
    "LenteEstratégica", "CalidadEvidencia", "KillRisk", "KillReasons", "AcciónRecomendada",
    "ÁnguloEntrada", "EstadoCRM",
  ];
  const lines = [headers.join(",")];
  for (const opp of opps) {
    const d = decide(opp, opp.scores || {});
    const lens = strategicLens(opp);
    const brief = buildBrief(opp, opp.scores || {}, d);
    const status = tracking[opp.id]?.status;
    const cells = [
      opp.company || "",
      opp.website || "",
      SECTOR_BY_KEY[opp.sector]?.label || opp.sector || "",
      opp.city || "",
      d.oci,
      d.decisionLabel,
      d.strategicTag ? d.strategicTag.label : "",
      lens ? lens.label : "",
      d.evidenceQuality.label,
      d.killRisk,
      d.killReasons.map((k) => k.label).join("; "),
      d.recommendedAction ? d.recommendedAction.label : "",
      brief.openingAngle || "",
      status ? (STATUS_LABELS[status] || status) : "",
    ];
    lines.push(cells.map(csvCell).join(","));
  }
  return lines.join("\n");
}

const stamp = () => new Date().toISOString().slice(0, 10);

export function exportDecisionCSV(opps, tracking) {
  return download(`oportunidades-decision-${stamp()}.csv`, toDecisionCSV(opps, tracking), "text/csv");
}

export function exportCSV(opps, tracking) {
  download(`opportunities-${stamp()}.csv`, toCSV(opps, tracking), "text/csv");
}
export function exportJSON(opps, tracking) {
  download(`opportunities-${stamp()}.json`, toJSON(opps, tracking), "application/json");
}
export function exportCallSheet(opps) {
  download(`call-sheet-${stamp()}.txt`, toCallSheet(opps), "text/plain");
}

/**
 * PDF export via the browser print dialog. Opens a clean, print-styled window
 * with the Top N cards and lets the user "Save as PDF". Zero dependencies.
 */
export function exportPDF(opps) {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = opps
    .map((o) => {
      const s = o.scores;
      return `
      <section class="card">
        <h2>#${o.ranking ?? "-"} · ${o.company}</h2>
        <p class="meta">${o.subsector} · ${o.city} · <strong>${CLASSIFICATIONS[s.classification]}</strong></p>
        <p class="scores">Confianza ${s.confidence} · Evidencia ${s.evidence} · Conversación ${s.conversation} · Reunión ${s.meeting} · Cierre ${s.closing} · Económico: ${s.economicPotential}</p>
        <p><strong>Tesis:</strong> ${o.thesis}</p>
        <p><strong>Por qué ahora:</strong> ${o.whyNow}</p>
        <p><strong>Primera palanca:</strong> ${o.firstLever} — <em>${offerLabel(o.suggestedOfferKey)}</em></p>
        <p><strong>Decisor:</strong> ${o.decisionMaker?.name || "—"} (${o.decisionMaker?.role || "—"}) · ${o.phone || ""} · ${o.email || ""}</p>
        <p><strong>Apertura:</strong> “${o.callOpening}”</p>
      </section>`;
    })
    .join("");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
    <title>CONNECT — Top ${opps.length} oportunidades</title>
    <style>
      body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;margin:32px;}
      h1{font-size:20px;border-bottom:2px solid #111;padding-bottom:8px;}
      .card{border:1px solid #ccc;border-radius:8px;padding:16px;margin:14px 0;page-break-inside:avoid;}
      h2{font-size:16px;margin:0 0 4px;}
      .meta{color:#555;margin:0 0 6px;}
      .scores{font-size:12px;color:#333;background:#f4f4f4;padding:6px 8px;border-radius:4px;}
      p{margin:6px 0;}
    </style></head><body>
    <h1>CONNECT — Top ${opps.length} oportunidades</h1>
    <p>Generada ${new Date().toLocaleString("es-ES")}</p>
    ${rows}
    <script>window.onload=()=>window.print();</script>
  </body></html>`);
  w.document.close();
}
