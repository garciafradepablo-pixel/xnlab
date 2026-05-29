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
    "Company",
    "Sector",
    "Subsector",
    "City",
    "Classification",
    "Confidence",
    "EvidenceStrength",
    "Conversation",
    "Meeting",
    "Closing",
    "EconomicPotential",
    "Recommendation",
    "CallPriority",
    "DecisionMaker",
    "Role",
    "Phone",
    "Email",
    "Website",
    "SuggestedOffer",
    "Status",
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
  lines.push("01 AGENCY / XN LAB — CALL SHEET");
  lines.push(`Generated ${new Date().toLocaleString("es-ES")}`);
  lines.push("=".repeat(60));
  opps.forEach((o) => {
    const s = o.scores;
    lines.push("");
    lines.push(
      `#${o.ranking ?? "-"}  ${o.company}  [${CLASSIFICATIONS[s.classification]}]`
    );
    lines.push(
      `   ${o.subsector} · ${o.city}  ·  Confidence ${s.confidence} / Closing ${s.closing}`
    );
    lines.push(
      `   DM: ${o.decisionMaker?.name || "—"} (${o.decisionMaker?.role || "—"})  ·  ${o.phone || "no phone"}  ·  ${o.email || "no email"}`
    );
    lines.push(`   Offer: ${offerLabel(o.suggestedOfferKey)}`);
    lines.push(`   Open: "${o.callOpening}"`);
    lines.push(`   Likely objection: ${o.objection}`);
    lines.push(`   → Response: ${o.objectionResponse}`);
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

const stamp = () => new Date().toISOString().slice(0, 10);

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
        <p class="scores">Confidence ${s.confidence} · Evidence ${s.evidence} · Conversation ${s.conversation} · Meeting ${s.meeting} · Closing ${s.closing} · Economic: ${s.economicPotential}</p>
        <p><strong>Thesis:</strong> ${o.thesis}</p>
        <p><strong>Why now:</strong> ${o.whyNow}</p>
        <p><strong>First lever:</strong> ${o.firstLever} — <em>${offerLabel(o.suggestedOfferKey)}</em></p>
        <p><strong>DM:</strong> ${o.decisionMaker?.name || "—"} (${o.decisionMaker?.role || "—"}) · ${o.phone || ""} · ${o.email || ""}</p>
        <p><strong>Open:</strong> “${o.callOpening}”</p>
      </section>`;
    })
    .join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8">
    <title>01 / XN LAB — Top ${opps.length} Opportunities</title>
    <style>
      body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;margin:32px;}
      h1{font-size:20px;border-bottom:2px solid #111;padding-bottom:8px;}
      .card{border:1px solid #ccc;border-radius:8px;padding:16px;margin:14px 0;page-break-inside:avoid;}
      h2{font-size:16px;margin:0 0 4px;}
      .meta{color:#555;margin:0 0 6px;}
      .scores{font-size:12px;color:#333;background:#f4f4f4;padding:6px 8px;border-radius:4px;}
      p{margin:6px 0;}
    </style></head><body>
    <h1>01 Agency / XN LAB — Top ${opps.length} Opportunities</h1>
    <p>Generated ${new Date().toLocaleString("es-ES")}</p>
    ${rows}
    <script>window.onload=()=>window.print();</script>
  </body></html>`);
  w.document.close();
}
