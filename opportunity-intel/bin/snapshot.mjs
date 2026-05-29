#!/usr/bin/env node
// =============================================================================
// bin/snapshot.mjs — Render a self-contained, viewable HTML snapshot of the
// dashboard (no server, no JS needed to view). Useful for sharing the app's
// look + the real ranked output as a single file you can open on any device.
//
// Usage:  node bin/snapshot.mjs [--out snapshot.html]
//
// It inlines the real stylesheet and renders the same class names the live UI
// uses, so the snapshot looks like the app. It is a static view (no filtering /
// status controls) — for the interactive tool run `npm run dev`.
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { runPipeline } from "../src/pipeline.js";
import SEED from "../src/seed.js";
import RESEARCHED from "../src/data/researched.js";
import {
  DEFAULT_CONFIG, CLASSIFICATIONS, RECOMMENDATIONS, OFFER_LADDER,
  SECTOR_BY_KEY, FILTERS, LEVELS, TENSION_TYPES, PIPELINE_STAGES,
} from "../src/models.js";
import { verificationProfile } from "../src/scoring.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const offer = (k) => { const o = OFFER_LADDER[k]; return o ? `${o.label} · €${o.price.toLocaleString("es-ES")}` : "—"; };

const args = process.argv.slice(2);
const outArg = args.indexOf("--out");
const outPath = resolve(outArg >= 0 ? args[outArg + 1] : join(root, "snapshot.html"));

const css = readFileSync(join(root, "src/ui/styles.css"), "utf8");

const [demo, real] = await Promise.all([
  runPipeline(SEED, DEFAULT_CONFIG),
  runPipeline(RESEARCHED, DEFAULT_CONFIG),
]);

function pipelineRow(counts) {
  return `<div class="pipeline">${PIPELINE_STAGES.map((st, i) => {
    const n = counts[st.key];
    const prev = i > 0 ? counts[PIPELINE_STAGES[i - 1].key] : n;
    const drop = prev && prev !== n ? `<div class="stage-drop">−${prev - n}</div>` : "";
    return `<div class="stage ${st.key === "final" ? "stage-final" : ""}"><div class="stage-n">${n}</div><div class="stage-label">${esc(st.label)}</div>${drop}</div>`;
  }).join("")}</div>`;
}

function chip(val, label, suffix = "") {
  return `<div class="chip"><span class="chip-val">${val}${suffix}</span><span class="chip-label">${esc(label)}</span></div>`;
}

function signals(opp) {
  return `<div class="signals">${FILTERS.map((f) => {
    const lvl = opp.signals?.[f.key]?.level || "grey";
    return `<div class="sig sig-${lvl}" title="${esc(f.label)} — ${esc(LEVELS[lvl].label)}">${esc(f.label)}</div>`;
  }).join("")}</div>`;
}

function evidence(opp) {
  return `<ul class="evidence">${(opp.evidence || []).map((e) => {
    const src = e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.source)}</a>` : esc(e.source);
    return `<li><span class="ev-tier ev-tier-${e.tier}">T${e.tier}</span> ${esc(e.note)} <span class="ev-src">— ${src}</span></li>`;
  }).join("")}</ul>`;
}

function verifBlock(opp) {
  const v = verificationProfile(opp);
  const isReal = opp.researched === true;
  if (!isReal && v.gapFilters.length === 0) return "";
  const gaps = v.gapFilters.length
    ? `<p class="verif-gaps-h">Confirm before calling:</p><div class="verif-gaps">${v.gapFilters.map((k) => `<span class="verif-gap">${esc((FILTERS.find((f) => f.key === k) || {}).label || k)}</span>`).join("")}</div>`
    : `<p class="verif-line ok">All filters backed by cited evidence.</p>`;
  return `<div class="verif ${isReal ? "verif-real" : ""}"><h4>Verification</h4>
    <div class="verif-head"><span class="verif-pct">${v.verifiedShare}%</span><span class="verif-label">${isReal ? "evidence-verified" : "asserted (demo)"}</span></div>
    <p class="verif-line">Verified (cited): ${v.verifiedFilters.length}/10 filters · ${v.sourceCount} source${v.sourceCount === 1 ? "" : "s"} · ${v.citedCount} cited evidence point${v.citedCount === 1 ? "" : "s"}</p>
    ${gaps}</div>`;
}

function card(opp) {
  const s = opp.scores;
  const dm = opp.decisionMaker || {};
  const sector = SECTOR_BY_KEY[opp.sector]?.label || opp.sector;
  const sec = (t, body) => `<div class="sec"><h4>${esc(t)}</h4>${body}</div>`;
  return `<article class="card prio-${s.callPriority}">
    <div class="card-head">
      <div class="rank">#${opp.ranking ?? "—"}</div>
      <div class="ident"><h3>${esc(opp.company)}</h3><p class="sub">${esc(opp.subsector)} · ${esc(opp.city)}</p></div>
      <div class="klass klass-${s.classification}"><span>${esc(CLASSIFICATIONS[s.classification])}</span><small>${esc(RECOMMENDATIONS[s.recommendation])}</small></div>
    </div>
    <div class="scores-row">
      ${chip(s.confidence, "Confidence")}${chip(s.evidence, "Evidence")}${chip(s.conversation, "Conversation", "%")}
      ${chip(s.meeting, "Meeting", "%")}${chip(s.closing, "Closing", "%")}
      <div class="chip chip-econ"><span class="chip-val">${esc(s.economicPotential)}</span><span class="chip-label">Economic</span></div>
    </div>
    ${signals(opp)}
    <div class="contact">
      <span><b>DM:</b> ${esc(dm.name || "—")}${dm.role ? ` · ${esc(dm.role)}` : ""}</span>
      ${opp.phone ? `<span><b>Tel:</b> ${esc(opp.phone)}</span>` : ""}
      ${opp.email ? `<span><b>Email:</b> ${esc(opp.email)}</span>` : ""}
      ${opp.website ? `<span><b>Web:</b> <a href="${esc(opp.website)}" target="_blank" rel="noopener">${esc(opp.website)}</a></span>` : ""}
    </div>
    <div class="card-body">
      ${sec("Executive summary", `<p>${esc(opp.summary)}</p>`)}
      ${sec("Main hypothesis", `<p class="thesis">${esc(opp.thesis)}</p>`)}
      ${sec(`Evidence — ${opp.evidence?.length || 0} points`, evidence(opp))}
      ${sec("Detected tensions", `<div class="tensions">${(opp.tensions || []).map((t) => `<span class="tension">${esc(TENSION_TYPES[t] || t)}</span>`).join("")}</div>`)}
      ${sec("Why now", `<p>${esc(opp.whyNow)}</p>`)}
      ${sec("First lever", `<p>${esc(opp.firstLever)} <span class="offer">→ ${esc(offer(opp.suggestedOfferKey))}</span></p>`)}
      ${sec("Call opening", `<blockquote>${esc(opp.callOpening)}</blockquote>`)}
      ${sec("Most likely objection", `<p>${esc(opp.objection)}</p>`)}
      ${sec("Recommended response", `<p>${esc(opp.objectionResponse)}</p>`)}
    </div>
    <div class="sec-meta">Sector: ${esc(sector)}${opp.synthetic ? " · demo data" : " · researched"}</div>
    ${verifBlock(opp)}
  </article>`;
}

function table(list) {
  const head = ["#", "Company", "Sector", "City", "Class", "Conf", "Evid", "Close", "Reco"];
  return `<table class="rank-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
    list.map((o) => {
      const s = o.scores;
      const badge = s.classification === "xn" ? "XN" : s.classification === "01" ? "01" : "—";
      return `<tr class="row-${s.classification}"><td>#${o.ranking}</td><td class="td-company">${esc(o.company)}</td><td>${esc(SECTOR_BY_KEY[o.sector]?.label || o.sector)}</td><td>${esc(o.city)}</td><td><span class="badge badge-${s.classification}">${badge}</span></td><td class="num strong">${s.confidence}</td><td class="num">${s.evidence}</td><td class="num">${s.closing}</td><td class="td-reco">${esc(RECOMMENDATIONS[s.recommendation])}</td></tr>`;
    }).join("")
  }</tbody></table>`;
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>01 · XN LAB — Opportunity Intelligence (snapshot)</title>
<style>${css}
/* snapshot-only spacing */
.snap-section{padding:22px 26px;}
.snap-note{font-size:12px;color:var(--ink-dim);background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px 14px;margin:0 26px 16px;}
h2{margin-top:6px;}
</style></head><body><div class="app">
  <header class="app-head">
    <div class="brand"><span class="logo">01 · XN LAB</span><span class="tagline">Opportunity Intelligence — moments, not companies</span></div>
    <div class="head-actions"><span class="demo-badge researched-badge">STATIC SNAPSHOT · ${new Date().toLocaleString("es-ES")}</span></div>
  </header>
  <nav class="tabs"><button class="tab active">Pipeline</button><button class="tab">Ranking table</button><button class="tab">Opportunity cards</button><button class="tab">Learning loop</button></nav>

  <p class="snap-note">This is a static, self-contained snapshot of the dashboard — open it in any browser, no server needed. For the interactive tool (filters, call status, notes, exports, the learning loop), run <code>npm run dev</code> inside <code>opportunity-intel/</code>.</p>

  <section class="snap-section">
    <h2>Candidate pipeline — Researched (real Spanish leads)</h2>
    ${pipelineRow(real.counts)}
    <div class="pipe-summary"><p>Real, press-verified leads with verified decision makers. Conservative on purpose: on-site tension / pain still grey, so scores sit below the synthetic archetypes and read “prepare a mini-audit first”.</p></div>
  </section>

  <section class="snap-section">
    <h2>Opportunity cards — Real leads</h2>
    <div class="cards">${real.final.map(card).join("")}</div>
  </section>

  <section class="snap-section">
    <h2>Demo dataset (synthetic archetypes) — pipeline & ranking</h2>
    ${pipelineRow(demo.counts)}
    <div style="height:14px"></div>
    ${table(demo.final)}
  </section>

  <section class="snap-section">
    <h2>Demo dataset — top opportunity cards</h2>
    <div class="cards">${demo.final.slice(0, 4).map(card).join("")}</div>
  </section>

</div></body></html>`;

writeFileSync(outPath, html, "utf8");
console.log(`Wrote snapshot (${(html.length / 1024).toFixed(0)} KB) to ${outPath}`);
console.log(`Real leads: ${real.final.length} · Demo final: ${demo.final.length}`);
