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
import { matchServices, ticketLabel, SERVICE_BY_ID } from "../src/services.js";
import { viability } from "../src/diagnosis.js";

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

const ECON = { low: "bajo", medium: "medio", high: "alto", "very high": "muy alto" };
const classLabel = (c) => (c === "xn" ? "XN LAB" : c === "01" ? "01 Agency" : "Descartar");
const band = (n) => (n >= 75 ? "hot" : n >= 58 ? "warm" : "cool");

function ring(score) {
  const r = 26, circ = 2 * Math.PI * r, off = circ * (1 - Math.max(0, Math.min(100, score)) / 100);
  return `<div class="ring ring-${band(score)}" title="Confianza ${score}/100">
    <svg viewBox="0 0 64 64" width="64" height="64"><circle class="ring-bg" cx="32" cy="32" r="${r}" fill="none" stroke-width="6"/>
    <circle class="ring-fg" cx="32" cy="32" r="${r}" fill="none" stroke-width="6" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 32 32)"/></svg>
    <div class="ring-num">${score}</div></div>`;
}
function bar(label, v) {
  return `<div class="mbar"><span class="mbar-l">${esc(label)}</span><div class="mbar-track"><div class="mbar-fill fill-${band(v)}" style="width:${v}%"></div></div><span class="mbar-v">${v}%</span></div>`;
}
function dots(opp) {
  return `<div class="dots">${FILTERS.map((f) => {
    const lvl = opp.signals?.[f.key]?.level || "grey";
    return `<span class="dot dot-${lvl}" title="${esc(f.label)} — ${esc(LEVELS[lvl].label)}"></span>`;
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
    ? `<p class="verif-gaps-h">Confirmar antes de llamar:</p><div class="verif-gaps">${v.gapFilters.map((k) => `<span class="verif-gap">${esc((FILTERS.find((f) => f.key === k) || {}).label || k)}</span>`).join("")}</div>`
    : `<p class="verif-line ok">Todos los filtros con evidencia citada.</p>`;
  return `<div class="verif ${isReal ? "verif-real" : ""}"><h4>Verificación</h4>
    <div class="verif-head"><span class="verif-pct">${v.verifiedShare}%</span><span class="verif-label">${isReal ? "evidencia verificada" : "afirmado (demo)"}</span></div>
    <p class="verif-line">Verificado (citado): ${v.verifiedFilters.length}/10 filtros · ${v.sourceCount} fuente${v.sourceCount === 1 ? "" : "s"}</p>
    ${gaps}</div>`;
}

function servicesBlock(opp) {
  const svcs = matchServices(opp, { max: 3 });
  if (!svcs.length) return "";
  return `<div class="svc-fit"><div class="svc-head"><span class="svc-ic">◆</span><span>Servicios que encajan</span></div>
    <div class="svc-list">${svcs.map((sv) => `<div class="svc svc-${sv.house}" title="${esc(sv.solves)} → ${esc(sv.produces)}">
      <span class="svc-house svc-house-${sv.house}">${sv.house === "xn" ? "XN" : "01"}</span>
      <span class="svc-name">${esc(sv.name)}</span>
      <span class="svc-ticket">${esc(ticketLabel(SERVICE_BY_ID[sv.id]))}</span></div>`).join("")}</div></div>`;
}

function card(opp) {
  const s = opp.scores;
  const dm = opp.decisionMaker || {};
  const sector = SECTOR_BY_KEY[opp.sector]?.label || opp.sector;
  const sec = (t, body) => `<div class="sec"><h4>${esc(t)}</h4>${body}</div>`;
  const elite = s.confidence >= 90 ? "card-elite" : s.recommendation === "call_immediately" ? "card-priority" : "";
  return `<article class="card prio-${s.callPriority} ${elite}">
    <div class="c-top">
      <div class="c-rank">${s.confidence >= 90 ? '<span class="rank-crown">★</span>' : ""}<span>#${opp.ranking ?? "—"}</span></div>
      <div class="c-ident">
        <h3>${esc(opp.company)}</h3>
        <p class="c-sub">${esc(opp.subsector)} · ${esc(opp.city)}</p>
        <div class="c-tags">
          <span class="pillc pillc-${s.classification}">${esc(classLabel(s.classification))}</span>
          <span class="reco reco-${band(s.confidence)}">${esc(RECOMMENDATIONS[s.recommendation])}</span>
          <span class="econ-tag">€ ${esc(ECON[s.economicPotential] || s.economicPotential)}</span>
        </div>
      </div>
      ${ring(s.confidence)}
    </div>
    <div class="c-hook"><span class="hook-ic">⚡</span><p>${esc(opp.whyNow)}</p></div>
    <div class="c-metrics">
      ${bar("Conversación", s.conversation)}${bar("Reunión", s.meeting)}${bar("Cierre", s.closing)}
      ${dots(opp)}
    </div>
    ${servicesBlock(opp)}
    <div class="c-action">
      <div class="offer-line"><span class="offer-ic">→</span><span class="offer-txt">${esc(offer(opp.suggestedOfferKey))}</span></div>
      <div class="open-line"><blockquote>${esc(opp.callOpening)}</blockquote></div>
      <div class="contact-line">
        <span class="ct"><b>${esc(dm.name || "—")}</b>${dm.role ? ` · ${esc(dm.role)}` : ""}</span>
        ${opp.phone ? `<a class="ct-link" href="tel:${esc(opp.phone)}">${esc(opp.phone)}</a>` : ""}
        ${opp.email ? `<a class="ct-link" href="mailto:${esc(opp.email)}">email</a>` : ""}
        ${opp.website ? `<a class="ct-link" href="${esc(opp.website)}" target="_blank" rel="noopener">web</a>` : ""}
      </div>
      <div class="quick">
        <button class="q q-called">Llamado</button><button class="q q-interested">Interesado</button>
        <button class="q q-meeting_booked">Reunión</button><button class="q q-rejected">Rechazado</button>
      </div>
    </div>
    <details class="c-detail">
      <summary><span>Ver análisis completo</span></summary>
      ${sec("Tesis", `<p class="thesis">${esc(opp.thesis)}</p>`)}
      ${sec("Resumen", `<p>${esc(opp.summary)}</p>`)}
      ${sec(`Evidencia — ${opp.evidence?.length || 0}`, evidence(opp))}
      ${sec("Tensiones", `<div class="tensions">${(opp.tensions || []).map((t) => `<span class="tension">${esc(TENSION_TYPES[t] || t)}</span>`).join("")}</div>`)}
      ${sec("Objeción probable", `<p>${esc(opp.objection)}</p>`)}
      ${sec("Respuesta recomendada", `<p class="resp">${esc(opp.objectionResponse)}</p>`)}
      ${verifBlock(opp)}
      <div class="sec-meta">Sector: ${esc(sector)}${opp.synthetic ? " · datos demo" : " · investigado"}</div>
    </details>
  </article>`;
}

function table(list) {
  const head = ["#", "Empresa", "Sector", "Ciudad", "Clase", "Conf", "Evid", "Cierre", "Recom"];
  return `<table class="rank-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
    list.map((o) => {
      const s = o.scores;
      const badge = s.classification === "xn" ? "XN" : s.classification === "01" ? "01" : "—";
      return `<tr class="row-${s.classification}"><td>#${o.ranking}</td><td class="td-company">${esc(o.company)}</td><td>${esc(SECTOR_BY_KEY[o.sector]?.label || o.sector)}</td><td>${esc(o.city)}</td><td><span class="badge badge-${s.classification}">${badge}</span></td><td class="num strong">${s.confidence}</td><td class="num">${s.evidence}</td><td class="num">${s.closing}</td><td class="td-reco">${esc(RECOMMENDATIONS[s.recommendation])}</td></tr>`;
    }).join("")
  }</tbody></table>`;
}

function topPicksStrip(list) {
  const picks = list.filter((o) => o.scores.classification !== "discard").slice(0, 5);
  if (!picks.length) return "";
  return `<div class="top-picks"><div class="tp-head"><span class="tp-bolt">⚡</span><span class="tp-title">Para llamar ya</span><span class="tp-sub">las mejores, de mayor a menor puntuación</span></div>
    <div class="tp-list">${picks.map((o) => {
      const s = o.scores; const tone = s.confidence >= 90 ? "elite" : s.confidence >= 75 ? "hot" : "warm";
      return `<span class="tp-chip tp-${tone}"><span class="tp-score">${s.confidence}</span><span class="tp-name">${esc(o.company)}</span><span class="tp-badge badge-${s.classification}">${s.classification === "xn" ? "XN" : "01"}</span></span>`;
    }).join("")}</div></div>`;
}

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>01 · XN LAB — Inteligencia de Oportunidades (snapshot)</title>
<style>${css}
/* solo para el snapshot */
.snap-section{padding:22px 26px;}
.snap-note{font-size:12px;color:var(--ink-dim);background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px 14px;margin:0 26px 16px;}
h2{margin-top:6px;}
</style></head><body><div class="app">
  <header class="app-head">
    <div class="brand"><span class="logo">01 · XN LAB</span><span class="tagline">Inteligencia de Oportunidades — momentos, no empresas</span></div>
    <div class="head-actions"><span class="demo-badge researched-badge">SNAPSHOT ESTÁTICO · ${new Date().toLocaleString("es-ES")}</span></div>
  </header>
  <nav class="tabs"><button class="tab active">Oportunidades</button><button class="tab">Ranking</button><button class="tab">CRM</button><button class="tab">Embudo</button><button class="tab">Aprendizaje</button></nav>

  <p class="snap-note">Esto es un snapshot estático y autocontenido del panel — ábrelo en cualquier navegador, sin servidor. Para la herramienta interactiva (filtros, estado de llamada, notas, exportaciones, aprendizaje), ejecuta <code>npm run dev</code> dentro de <code>opportunity-intel/</code>.</p>

  <section class="snap-section">
    <h2>Oportunidades — Leads reales (España)</h2>
    ${topPicksStrip(real.final)}
    <div class="cards">${real.final.map(card).join("")}</div>
  </section>

  <section class="snap-section">
    <h2>Dataset demo — mejores oportunidades</h2>
    ${topPicksStrip(demo.final)}
    <div class="cards">${demo.final.slice(0, 6).map(card).join("")}</div>
  </section>

  <section class="snap-section">
    <h2>Ranking completo (demo)</h2>
    ${table(demo.final)}
  </section>

  <section class="snap-section">
    <h2>Embudo de candidatos</h2>
    ${pipelineRow(real.counts)}
    <div class="pipe-summary"><p>Leads reales verificados en prensa, con decisores verificados. Conservador a propósito: la tensión interna / dolor siguen en gris, así que las puntuaciones quedan por debajo de los arquetipos sintéticos.</p></div>
  </section>

</div></body></html>`;

writeFileSync(outPath, html, "utf8");
console.log(`Wrote snapshot (${(html.length / 1024).toFixed(0)} KB) to ${outPath}`);
console.log(`Real leads: ${real.final.length} · Demo final: ${demo.final.length}`);
