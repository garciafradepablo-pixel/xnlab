// =============================================================================
// app.js — Application shell. Wires the search-config panel, candidate
// pipeline, ranking table, filters, opportunity cards, export and the learning
// view together. No framework: explicit render functions over a small state.
// =============================================================================

import { el, $, clear, esc } from "./dom.js";
import { renderCard } from "./card.js";
import { runPipeline } from "../pipeline.js";
import SEED from "../seed.js";
import RESEARCHED from "../data/researched.js";
import {
  SECTORS,
  SECTOR_BY_KEY,
  CLASSIFICATIONS,
  RECOMMENDATIONS,
  PIPELINE_STAGES,
  DEFAULT_CONFIG,
  STATUS_LABELS,
  FILTER_BY_KEY,
  ECONOMIC_LABELS,
  CALL_STATUSES,
  OFFER_LADDER,
  TENSION_TYPES,
} from "../models.js";
import * as store from "../store.js";
import { failureReason } from "../diagnosis.js";
import { matchServices, ticketLabel, SERVICE_BY_ID } from "../services.js";
import { buildLead } from "../newlead.js";
import { discover } from "../discovery.js";
import * as xport from "../export.js";

const state = {
  config: { ...DEFAULT_CONFIG, ...store.getSavedConfig({}) },
  results: null,
  dataset: "demo", // demo (synthetic) | researched (real, Spain)
  // Arranca en Oportunidades: lo primero que se ve son los mejores leads,
  // ordenados de mayor a menor puntuación.
  view: "cards", // cards | pipeline | table | crm | learning
  filters: { sector: "all", city: "all", classification: "all", priority: "all", minEvidence: 0, minConfidence: 0, minEvStrength: 0, search: "" },
};

let root;

export async function mount(rootEl) {
  root = rootEl;
  await recompute();
  render();
}

function activeCandidates() {
  // Dataset base + leads añadidos por el usuario (siempre presentes, son suyos).
  const base = (state.dataset === "researched" ? RESEARCHED : SEED).concat(store.getUserLeads());
  // Aplica las verificaciones manuales del analista antes de puntuar: los
  // huecos confirmados se vuelven evidencia citada y suben la puntuación.
  const verifications = store.getVerifications();
  if (!Object.keys(verifications).length) return base;
  return base.map((o) =>
    verifications[o.id] ? store.applyVerifications(o, verifications[o.id]) : o
  );
}

async function recompute() {
  // Close the loop: call outcomes derive per-filter weight multipliers that
  // feed straight back into scoring. When calibration is inactive (too few
  // calls) the multipliers are all 1.0 and scoring is unchanged.
  state.calibration = store.getCalibration();
  const cfg = {
    ...state.config,
    weightMultipliers: state.calibration.active
      ? state.calibration.weightMultipliers
      : null,
  };
  state.results = await runPipeline(activeCandidates(), cfg);
  store.saveConfig(state.config);
}

// ---- Filtering --------------------------------------------------------------

function visibleOpps() {
  if (!state.results) return [];
  const f = state.filters;
  // The cards/table operate on the full ranked set so filters can reveal
  // candidates below the Top N too.
  return state.results.all.filter((o) => {
    const s = o.scores;
    if (f.sector !== "all" && o.sector !== f.sector) return false;
    if (f.city !== "all" && o.city !== f.city) return false;
    if (f.classification !== "all" && s.classification !== f.classification) return false;
    if (f.priority !== "all" && s.callPriority !== f.priority) return false;
    if (s.evidenceCount < f.minEvidence) return false;
    if (s.confidence < f.minConfidence) return false;
    if (s.evidence < f.minEvStrength) return false;
    if (f.search) {
      const hay = `${o.company} ${o.subsector} ${o.city} ${o.decisionMaker?.name || ""}`.toLowerCase();
      if (!hay.includes(f.search.toLowerCase())) return false;
    }
    return true;
  });
}

// ---- Render -----------------------------------------------------------------

function render() {
  clear(root);
  // Shell fijo: cabecera + tabs pegados arriba, y UN área de scroll para el
  // contenido. Así el scroll es propio del contenido y se reinicia al cambiar
  // de pantalla (antes el scroll del body se quedaba a medias entre vistas).
  root.appendChild(header());
  root.appendChild(tabs());
  const scroller = el("div", { class: "scroll" });
  const main = el("div", { class: "main" });
  // En escritorio el panel de configuración va fijo a la izquierda; en móvil se
  // pliega (details) para no empujar las oportunidades hacia abajo.
  const cfg = el("details", { class: "config-wrap" }, [
    el("summary", { class: "config-summary", text: "⚙︎ Configuración de búsqueda" }),
    configPanel(),
  ]);
  cfg.open = state._cfgOpen ?? false;
  cfg.addEventListener("toggle", () => { state._cfgOpen = cfg.open; });
  main.appendChild(cfg);
  main.appendChild(viewArea());
  scroller.appendChild(main);
  root.appendChild(scroller);
  // Reinicia el scroll arriba en cada render de cambio de vista.
  if (state._resetScroll) {
    requestAnimationFrame(() => { scroller.scrollTop = 0; });
    state._resetScroll = false;
  }
}

// Cambia de pestaña y pide reinicio de scroll (navegación limpia).
function goView(view) {
  state.view = view;
  state._resetScroll = true;
  render();
}

function header() {
  return el("header", { class: "app-head" }, [
    el("div", { class: "brand" }, [
      el("span", { class: "logo", text: "01 · XN LAB" }),
      el("span", { class: "tagline", text: "Inteligencia de Oportunidades — momentos, no empresas" }),
    ]),
    el("div", { class: "head-actions" }, [
      state.dataset === "researched"
        ? el("span", { class: "demo-badge researched-badge", text: "INVESTIGADO — momentos verificados en prensa", title: "Leads reales: aperturas/financiación/expansiones verificadas con prensa citada. Webs, contactos y tensión interna NO verificados (señales grises) — enriquece antes de llamar." })
        : el("span", { class: "demo-badge", text: "DATOS DEMO — leads sintéticos", title: "El dataset de ejemplo es ilustrativo. Conecta fuentes reales mediante los adaptadores de enriquecimiento (ver README)." }),
      el("span", { class: "ver-tag", title: "Versión publicada", text: "v2 · mapa" }),
    ]),
  ]);
}

function tabs() {
  const items = [
    ["cards", "Oportunidades"],
    ["connector", "01 ↔ XN"],
    ["search", "Buscar leads"],
    ["table", "Ranking"],
    ["crm", "CRM"],
    ["pipeline", "Embudo"],
    ["learning", "Aprendizaje"],
  ];
  return el(
    "nav",
    { class: "tabs" },
    items.map(([key, label]) =>
      el("button", {
        class: `tab ${state.view === key ? "active" : ""}`,
        text: label,
        onClick: () => goView(key),
      })
    )
  );
}

// ---- Search configuration panel --------------------------------------------

function configPanel() {
  const c = state.config;
  const field = (label, control) => el("div", { class: "field" }, [el("label", { text: label }), control]);

  const sectorChecks = el("div", { class: "checks" }, SECTORS.map((sct) =>
    el("label", { class: "check" }, [
      el("input", {
        type: "checkbox",
        checked: c.sectors.includes(sct.key),
        onChange: (e) => {
          const set = new Set(c.sectors);
          e.target.checked ? set.add(sct.key) : set.delete(sct.key);
          c.sectors = [...set];
        },
      }),
      el("span", { text: sct.label }),
    ])
  ));

  const conservSlider = el("input", {
    type: "range", min: "0", max: "100", value: String(Math.round(c.conservatism * 100)),
    onInput: (e) => { conservOut.textContent = `${e.target.value}% conservador`; c.conservatism = +e.target.value / 100; },
  });
  const conservOut = el("output", { text: `${Math.round(c.conservatism * 100)}% conservador` });

  const minScore = el("input", { type: "number", min: "0", max: "100", value: String(c.minScore), onChange: (e) => (c.minScore = +e.target.value) });
  const finalCount = el("input", { type: "number", min: "1", max: "50", value: String(c.finalCount), onChange: (e) => (c.finalCount = +e.target.value) });
  const candVol = el("input", { type: "number", min: "1", value: String(c.candidateVolume), onChange: (e) => (c.candidateVolume = +e.target.value) });
  const xnThr = el("input", { type: "number", min: "0", max: "100", value: String(c.xnThreshold), onChange: (e) => (c.xnThreshold = +e.target.value) });
  const country = el("input", { type: "text", value: c.country, onChange: (e) => (c.country = e.target.value) });

  const datasetSel = el(
    "select",
    { onChange: async (e) => { state.dataset = e.target.value; await recompute(); render(); } },
    [
      el("option", { value: "demo", selected: state.dataset === "demo", text: `Demo — sintético (${SEED.length})` }),
      el("option", { value: "researched", selected: state.dataset === "researched", text: `Investigado — España (${RESEARCHED.length})` }),
    ]
  );

  // Botón con feedback visible: en el móvil, el panel queda arriba y los
  // resultados abajo, así que sin confirmación parecía "que no hacía nada".
  const runBtn = el("button", { class: "btn-primary", text: "Ejecutar embudo" });
  runBtn.addEventListener("click", async () => {
    runBtn.textContent = "Recalculando…";
    runBtn.disabled = true;
    await recompute();
    runBtn.textContent = `✓ ${state.results.counts.final} oportunidades`;
    // Lleva al usuario a los resultados (clave en móvil).
    setTimeout(() => goView("cards"), 450);
  });

  return el("aside", { class: "config" }, [
    field("Dataset", datasetSel),
    field("País", country),
    field("Sectores", sectorChecks),
    field("Volumen de candidatos (objetivo)", candVol),
    field("Nº final de leads", finalCount),
    field("Conservadurismo", el("div", {}, [conservSlider, conservOut])),
    field("Puntuación mínima", minScore),
    field("Umbral 01 → XN LAB (confianza)", xnThr),
    runBtn,
    el("p", { class: "config-note", text: "El conservadurismo mezcla el motor 80/20 por defecto: más alto = más rojo/gris tratado como 'probablemente no'." }),
    // Zona peligrosa, al fondo y blindada: exporta copia + doble confirmación.
    el("div", { class: "danger-zone" }, [
      el("h4", { text: "Zona de datos" }),
      el("button", { class: "btn-ghost", text: "Exportar copia de seguridad", onClick: () => {
        xport.download(`copia-seguridad-${new Date().toISOString().slice(0,10)}.json`, store.exportState(), "application/json");
      } }),
      el("button", { class: "btn-danger", text: "Borrar todos mis datos", onClick: () => {
        if (!confirm("Esto borra TUS llamadas, notas, verificaciones y leads añadidos. ¿Has exportado una copia?")) return;
        if (!confirm("Última confirmación: esto NO se puede deshacer. ¿Borrar definitivamente?")) return;
        store.resetAll(); location.reload();
      } }),
    ]),
  ]);
}

// ---- View area --------------------------------------------------------------

function viewArea() {
  const area = el("section", { class: "view" });
  if (state.view === "pipeline") area.appendChild(pipelineView());
  else if (state.view === "table") area.appendChild(tableView());
  else if (state.view === "cards") area.appendChild(cardsView());
  else if (state.view === "crm") area.appendChild(crmView());
  else if (state.view === "connector") area.appendChild(connectorView());
  else if (state.view === "search") area.appendChild(searchView());
  else area.appendChild(learningView());
  return area;
}

function pipelineView() {
  const counts = state.results.counts;

  // Empty-state for the researched dataset before it is populated.
  if (counts.discovered === 0) {
    return el("div", {}, [
      el("h2", { text: "Embudo de candidatos" }),
      el("div", { class: "pipe-summary" }, [
        el("p", { html: "<b>Aún no hay leads investigados.</b> El piloto de datos reales viene vacío a propósito — un lead solo se añade cuando tiene al menos tres evidencias citadas y verificables." }),
        el("p", { class: "hint", text: "Rellénalo con los conectores en vivo (node bin/run.mjs --enrich) o con investigación manual siguiendo el protocolo en src/data/researched.js. Cambia el selector de Dataset a ‘Demo’ para explorar el sistema ahora." }),
      ]),
    ]);
  }
  const stages = el("div", { class: "pipeline" }, PIPELINE_STAGES.map((st, i) => {
    const n = counts[st.key];
    const prev = i > 0 ? counts[PIPELINE_STAGES[i - 1].key] : n;
    const drop = prev && prev !== n ? `−${prev - n}` : "";
    return el("div", { class: `stage ${st.key === "final" ? "stage-final" : ""}` }, [
      el("div", { class: "stage-n", text: String(n) }),
      el("div", { class: "stage-label", text: st.label }),
      drop ? el("div", { class: "stage-drop", text: drop }) : null,
    ]);
  }));

  const dist = classDistribution();
  const summary = el("div", { class: "pipe-summary" }, [
    el("p", { html: `Partimos de un pool objetivo de <b>${state.config.candidateVolume.toLocaleString("es-ES")}</b> · puntuados <b>${counts.scored}</b> candidatos · <b>${counts.final}</b> llegaron al corte final.` }),
    el("div", { class: "dist" }, Object.entries(dist).map(([k, v]) =>
      el("span", { class: `pill pill-${k}`, text: `${CLASSIFICATIONS[k]}: ${v}` })
    )),
  ]);

  // Cobertura por sector (los 4 objetivos del brief) — lectura de balance.
  const bySector = sectorCoverage();
  const coverage = el("div", { class: "sector-cov" }, [
    el("h3", { text: "Cobertura por sector" }),
    el("div", { class: "sec-bars" }, SECTORS.map((sc) => {
      const c = bySector[sc.key] || { n: 0, avg: 0 };
      const pct = counts.final ? Math.round((c.n / counts.final) * 100) : 0;
      return el("div", { class: "sec-bar-row", title: `${c.n} en el Top · puntuación media ${c.avg}` }, [
        el("span", { class: "sec-bar-l", text: sc.label }),
        el("div", { class: "sec-bar-track" }, [
          el("div", { class: "sec-bar-fill", style: `width:${pct}%` }),
        ]),
        el("span", { class: "sec-bar-v", text: `${c.n} · ${c.avg || "—"}` }),
      ]);
    })),
    el("p", { class: "hint", text: "Nº de leads en el corte final y su puntuación media por sector. Sirve para ver si falta cubrir algún objetivo del brief." }),
  ]);

  const exports = el("div", { class: "exports" }, [
    el("h3", { text: "Exportar lista final" }),
    el("div", { class: "export-btns" }, [
      el("button", { class: "btn", text: "CSV", onClick: () => xport.exportCSV(state.results.final, store.getTracking()) }),
      el("button", { class: "btn", text: "JSON", onClick: () => xport.exportJSON(state.results.final, store.getTracking()) }),
      el("button", { class: "btn", text: "Informe PDF", onClick: () => xport.exportPDF(state.results.final) }),
      el("button", { class: "btn", text: "Hoja de llamadas", onClick: () => xport.exportCallSheet(state.results.final) }),
    ]),
  ]);

  return el("div", {}, [
    el("h2", { text: "Embudo de candidatos" }),
    stages,
    summary,
    coverage,
    exports,
    el("p", { class: "hint", text: "Fases: descubierto → enriquecido → filtrado → puntuado → preseleccionado → Top N final. La caída bajo cada fase muestra cuántos candidatos rechazó el embudo." }),
  ]);
}

// Cobertura por sector en el corte final: nº de leads y puntuación media.
function sectorCoverage() {
  const out = {};
  for (const o of state.results.final) {
    const k = o.sector;
    out[k] = out[k] || { n: 0, sum: 0 };
    out[k].n++;
    out[k].sum += o.scores.confidence;
  }
  for (const k of Object.keys(out)) out[k].avg = Math.round((out[k].sum / out[k].n) * 10) / 10;
  return out;
}

function classDistribution() {
  const d = {};
  for (const o of state.results.final) {
    const k = o.scores.classification;
    d[k] = (d[k] || 0) + 1;
  }
  return d;
}

// ---- Filters (shared by table + cards) --------------------------------------

function filterBar() {
  const f = state.filters;
  const opt = (v, label, sel) => el("option", { value: v, text: label, selected: sel });
  const cities = [...new Set(state.results.all.map((o) => o.city))].sort();

  const sel = (key, opts) =>
    el("select", { onChange: (e) => { f[key] = e.target.value; render(); } }, opts);

  return el("div", { class: "filters" }, [
    el("input", { type: "search", placeholder: "Buscar empresa / ciudad / decisor…", value: f.search, onInput: (e) => { f.search = e.target.value; rerenderResults(); } }),
    sel("sector", [opt("all", "Todos los sectores", f.sector === "all"), ...SECTORS.map((s) => opt(s.key, s.label, f.sector === s.key))]),
    sel("city", [opt("all", "Todas las ciudades", f.city === "all"), ...cities.map((c) => opt(c, c, f.city === c))]),
    sel("classification", [opt("all", "01 + XN + descartar", f.classification === "all"), ...Object.entries(CLASSIFICATIONS).map(([k, v]) => opt(k, v, f.classification === k))]),
    sel("priority", [opt("all", "Cualquier prioridad", f.priority === "all"), opt("high", "Prioridad alta", f.priority === "high"), opt("medium", "Media", f.priority === "medium"), opt("low", "Baja", f.priority === "low")]),
    el("label", { class: "minev" }, [
      el("span", { text: "Mín. evidencias" }),
      el("input", { type: "number", min: "0", max: "10", value: String(f.minEvidence), onChange: (e) => { f.minEvidence = +e.target.value; render(); } }),
    ]),
    el("label", { class: "minev" }, [
      el("span", { text: "Mín. puntuación" }),
      el("input", { type: "number", min: "0", max: "100", value: String(f.minConfidence), onChange: (e) => { f.minConfidence = +e.target.value; render(); } }),
    ]),
    el("label", { class: "minev" }, [
      el("span", { text: "Mín. fuerza evid." }),
      el("input", { type: "number", min: "0", max: "100", value: String(f.minEvStrength), onChange: (e) => { f.minEvStrength = +e.target.value; render(); } }),
    ]),
  ]);
}

// Lightweight re-render of just the results region for search-as-you-type.
function rerenderResults() {
  const area = $(".results-region", root);
  if (!area) { render(); return; }
  clear(area);
  area.appendChild(state.view === "table" ? buildTable() : buildCards());
}

// ---- Ranking table ----------------------------------------------------------

function tableView() {
  return el("div", {}, [
    el("h2", { text: "Ranking" }),
    filterBar(),
    el("div", { class: "results-region" }, [buildTable()]),
  ]);
}

function buildTable() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  const head = ["#", "Empresa", "Sector", "Ciudad", "Clase", "Conf", "Evid", "Conv", "Reun", "Cierre", "Econ", "Recom", "Estado"];
  const table = el("table", { class: "rank-table" }, [
    el("thead", {}, el("tr", {}, head.map((h) => el("th", { text: h })))),
    el("tbody", {}, rows.map((o) => {
      const s = o.scores;
      const t = tracking[o.id] || {};
      return el("tr", { class: `row-${s.classification}`, onClick: () => { state.filters.search = o.company; goView("cards"); } }, [
        el("td", { text: `#${o.ranking}` }),
        el("td", { class: "td-company", text: o.company }),
        el("td", { text: SECTOR_BY_KEY[o.sector]?.label || o.sector }),
        el("td", { text: o.city }),
        el("td", {}, el("span", { class: `badge badge-${s.classification}`, text: s.classification === "xn" ? "XN" : s.classification === "01" ? "01" : "—" })),
        el("td", { class: "num strong", text: String(s.confidence) }),
        el("td", { class: "num", text: String(s.evidence) }),
        el("td", { class: "num", text: String(s.conversation) }),
        el("td", { class: "num", text: String(s.meeting) }),
        el("td", { class: "num", text: String(s.closing) }),
        el("td", { text: ECONOMIC_LABELS[s.economicPotential] || s.economicPotential }),
        el("td", { class: "td-reco", text: RECOMMENDATIONS[s.recommendation] }),
        el("td", { text: STATUS_LABELS[t.status || "not_called"] }),
      ]);
    })),
  ]);
  return el("div", {}, [el("p", { class: "count", text: `${rows.length} candidatos` }), table]);
}

// ---- Opportunity cards ------------------------------------------------------

function cardsView() {
  return el("div", {}, [
    el("h2", { text: "Oportunidades" }),
    topPicks(),
    filterBar(),
    el("div", { class: "results-region" }, [buildCards()]),
  ]);
}

// Franja "para llamar ya": los mejores leads, lo primero que se ve. Llevan a la
// ficha al pulsarlos. Solo aparece sin filtros activos (es el estado de entrada).
function topPicks() {
  const f = state.filters;
  const filtering = f.search || f.sector !== "all" || f.city !== "all" ||
    f.classification !== "all" || f.priority !== "all" ||
    f.minEvidence || f.minConfidence || f.minEvStrength;
  if (filtering) return el("span");

  const picks = state.results.all
    .filter((o) => o.scores.classification !== "discard")
    .slice(0, 5);
  if (!picks.length) return el("span");

  const tracking = store.getTracking();
  return el("div", { class: "top-picks" }, [
    el("div", { class: "tp-head" }, [
      el("span", { class: "tp-bolt", text: "⚡" }),
      el("span", { class: "tp-title", text: "Para llamar ya" }),
      el("span", { class: "tp-sub", text: "las mejores, de mayor a menor puntuación" }),
    ]),
    el("div", { class: "tp-list" }, picks.map((o) => {
      const s = o.scores;
      const st = tracking[o.id]?.status || "not_called";
      const tone = s.confidence >= 90 ? "elite" : s.confidence >= 75 ? "hot" : "warm";
      return el("button", {
        class: `tp-chip tp-${tone}`,
        title: `${o.company} · ${RECOMMENDATIONS[s.recommendation]}`,
        onClick: () => { state.filters.search = o.company; render(); },
      }, [
        el("span", { class: "tp-score", text: String(s.confidence) }),
        el("span", { class: "tp-name", text: o.company }),
        el("span", { class: `tp-badge badge-${s.classification}`, text: s.classification === "xn" ? "XN" : "01" }),
        st !== "not_called" ? el("span", { class: "tp-st", text: STATUS_LABELS[st] }) : null,
      ]);
    })),
  ]);
}

function buildCards() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  const handlers = {
    onStatus: (id, st) => {
      store.setStatus(id, st);
      // Aprender del CRM: un cambio de estado decisivo (interesado/reunión/
      // rechazado/mal encaje) registra automáticamente un resultado con la foto
      // de señales del lead, para que el solo hecho de mover la tarjeta calibre.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.recordStatusOutcome(id, st, {
        classification: lead?.scores?.classification,
        signals: lead?.signals || null,
      });
      recompute().then(render);
    },
    onNotes: (id, notes) => { store.setNotes(id, notes); },
    onOutcome: (id, outcome) => {
      // Stamp the lead's signal snapshot so calibration is reproducible even if
      // the dataset later changes. Then recompute — outcomes recalibrate scores.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.addOutcome({ ...outcome, signals: lead?.signals || null });
      recompute().then(render);
    },
    onVerify: (id, filter, level, note, url) => {
      // El analista confirma un hueco → se vuelve evidencia citada y recalcula.
      store.addVerification(id, filter, level, note, url);
      recompute().then(render);
    },
  };
  if (!rows.length) return el("p", { class: "empty", text: "Ningún candidato coincide con los filtros actuales." });
  return el("div", { class: "cards" }, rows.map((o) => renderCard(o, tracking[o.id], handlers)));
}

// ---- CRM view (tablero por estado de llamada) -------------------------------

// Columnas del CRM, en orden de avance comercial. Las de fallo van marcadas.
const CRM_COLUMNS = [
  { key: "not_called", fail: false },
  { key: "called", fail: false },
  { key: "no_answer", fail: true },
  { key: "interested", fail: false },
  { key: "meeting_booked", fail: false },
  { key: "follow_up", fail: true },
  { key: "rejected", fail: true },
  { key: "wrong_fit", fail: true },
];

function crmView() {
  const tracking = store.getTracking();
  const all = state.results.all;
  // Agrupar leads por estado actual.
  const byStatus = {};
  for (const st of CALL_STATUSES) byStatus[st] = [];
  for (const o of all) {
    const st = tracking[o.id]?.status || "not_called";
    (byStatus[st] || byStatus.not_called).push(o);
  }

  // Métricas de conversión del embudo comercial.
  const total = all.length;
  const contacted = all.length - byStatus.not_called.length;
  const interested = byStatus.interested.length + byStatus.meeting_booked.length;
  const meetings = byStatus.meeting_booked.length;
  const rejected = byStatus.rejected.length + byStatus.wrong_fit.length;
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

  const kpis = el("div", { class: "crm-kpis" }, [
    crmKpi("Total", total, ""),
    crmKpi("Contactados", contacted, `${pct(contacted, total)}%`),
    crmKpi("Interesados", interested, `${pct(interested, contacted)}% de contactados`, "hot"),
    crmKpi("Reuniones", meetings, `${pct(meetings, contacted)}% de contactados`, "hot"),
    crmKpi("Rechazos", rejected, `${pct(rejected, contacted)}% de contactados`, "cool"),
  ]);

  // Tablero kanban.
  const board = el("div", { class: "crm-board" }, CRM_COLUMNS.map((col) => {
    const leads = byStatus[col.key] || [];
    return el("div", { class: `crm-col ${col.fail ? "crm-col-fail" : ""}` }, [
      el("div", { class: "crm-col-head" }, [
        el("span", { class: "crm-col-title", text: STATUS_LABELS[col.key] }),
        el("span", { class: "crm-col-n", text: String(leads.length) }),
      ]),
      el("div", { class: "crm-col-body" }, leads.length
        ? leads.map((o) => crmCard(o, col.fail))
        : [el("p", { class: "crm-empty", text: "—" })]),
    ]);
  }));

  return el("div", {}, [
    el("h2", { text: "CRM — seguimiento de llamadas" }),
    el("p", { class: "hint", text: "Quién está en cada fase. Cambia el estado en la ficha; las columnas de fallo (no contesta, seguimiento, rechazado, mal encaje) muestran el motivo probable. El CRM alimenta el aprendizaje." }),
    kpis,
    board,
  ]);
}

function crmKpi(label, n, sub, tone) {
  return el("div", { class: `crm-kpi ${tone ? "kpi-" + tone : ""}` }, [
    el("div", { class: "crm-kpi-n", text: String(n) }),
    el("div", { class: "crm-kpi-l", text: label }),
    sub ? el("div", { class: "crm-kpi-s", text: sub }) : null,
  ]);
}

function crmCard(o, isFail) {
  const s = o.scores;
  const children = [
    el("div", { class: "crm-card-top" }, [
      el("span", { class: "crm-card-name", text: o.company }),
      el("span", { class: `crm-card-conf conf-${s.confidence >= 75 ? "hot" : s.confidence >= 58 ? "warm" : "cool"}`, text: String(s.confidence) }),
    ]),
    el("p", { class: "crm-card-sub", text: `${o.city} · ${o.decisionMaker?.name || "decisor por identificar"}` }),
  ];
  // En columnas de fallo, mostrar el motivo probable (lectura de señales).
  if (isFail) {
    const fr = failureReason(o);
    if (fr.causes.length) {
      children.push(el("p", { class: "crm-card-fail", text: `⚠ ${fr.causes[0].cause}` }));
    }
  }
  return el("div", { class: "crm-card", onClick: () => { state.filters.search = o.company; goView("cards"); } }, children);
}

// ---- Buscar / añadir leads --------------------------------------------------

// Ideas de búsqueda por sector: rellenan el descubridor de un toque para
// orientar qué tipo de "momento" buscar.
const SEARCH_IDEAS = {
  health: [
    "clínica dental nueva apertura {ciudad} 2025",
    "clínica estética amplía sede {ciudad} 2025",
    "fisioterapia medicina deportiva nueva clínica {ciudad}",
    "clínica fertilidad reproducción asistida inaugura {ciudad}",
  ],
  realestate: [
    "promotora lujo nueva promoción {ciudad} 2025",
    "branded residences {ciudad} obra nueva",
    "estudio arquitectura premio {ciudad} 2025",
    "inmobiliaria lujo abre oficina {ciudad}",
  ],
  growth: [
    "startup {ciudad} ronda financiación seed 2025",
    "empresa {ciudad} amplía plantilla expansión 2025",
    "marca consumo española nueva ronda inversión",
    "empresa entra retail nacional 2025 {ciudad}",
  ],
  hospitality: [
    "hotel boutique apertura {ciudad} 2025 reforma",
    "restaurante premium abre {ciudad} 2025 grupo",
    "rooftop nuevo {ciudad} apertura",
    "grupo gastronómico expansión nuevo local {ciudad}",
  ],
};

function searchView() {
  const userLeads = store.getUserLeads();
  const blocks = [el("h2", { text: "Descubrir leads" })];
  blocks.push(el("p", { class: "hint", text: "Elige sector y/o escribe (ej. 'clínicas dentales Madrid') y pulsa Descubrir: aparecen empresas reales aquí mismo. Añádelas de un toque — entran al ranking y las enriqueces luego. Abajo puedes añadir cualquier otra a mano." }));

  // --- DESCUBRIDOR INTERNO ---
  const secSel = el("select", { class: "lead-f" }, [
    el("option", { value: "all", text: "Todos los sectores" }),
    ...SECTORS.map((s) => el("option", { value: s.key, text: s.label })),
  ]);
  const qInput = el("input", { type: "search", class: "lead-f", placeholder: "Qué y dónde (ej. clínicas dentales Madrid)" });
  const resultsBox = el("div", { class: "discover-results" });

  const runDiscover = async () => {
    clear(resultsBox);
    const status = el("p", { class: "hint", text: "🗺️ Buscando en el mapa…" });
    resultsBox.appendChild(status);
    let found = [];
    try {
      found = await discover({ sector: secSel.value, query: qInput.value });
    } catch (e) {
      // Si el backend falla, al menos mostramos el directorio interno.
      found = []; status.textContent = "El mapa no respondió; mostrando directorio interno.";
    }
    const existing = new Set(store.getUserLeads().map((l) => `${l.company}`.toLowerCase()));
    clear(resultsBox);
    if (!found.length) {
      resultsBox.appendChild(el("p", { class: "empty", html: "Sin resultados para eso. Prueba algo más genérico (ej. <b>clínicas dentales</b>) o revisa que el descubrimiento del mapa esté activo. También puedes añadir la empresa a mano abajo." }));
      return;
    }
    const nMap = found.filter((c) => c.source === "places").length;
    resultsBox.appendChild(el("p", { class: "count", text: `${found.length} candidatos${nMap ? ` · ${nMap} del mapa 🗺️` : " (directorio)"}` }));
    resultsBox.appendChild(el("div", { class: "discover-list" }, found.map((c) => {
      const already = existing.has(c.company.toLowerCase());
      const addBtn = el("button", {
        class: "btn-add-cand",
        text: already ? "✓ Añadido" : "+ Añadir",
        disabled: already,
      });
      addBtn.addEventListener("click", async () => {
        const lead = buildLead({
          company: c.company, sector: c.sector || secSel.value === "all" ? c.sector : secSel.value,
          subsector: c.subsector, city: c.city, website: c.website || null,
          phone: c.phone || null, googleMaps: c.googleMaps || null,
        });
        store.saveUserLead(lead);
        addBtn.textContent = "✓ Añadido"; addBtn.disabled = true;
        await recompute();
      });
      const meta = [];
      if (c.source === "places") meta.push(el("span", { class: "dc-src dc-src-places", text: "🗺️ mapa" }));
      else meta.push(el("span", { class: "dc-src", text: "directorio" }));
      if (c.rating) meta.push(el("span", { class: "dc-rating", text: `★ ${c.rating}${c.reviews ? ` (${c.reviews})` : ""}` }));
      return el("div", { class: "discover-card" }, [
        el("div", { class: "dc-main" }, [
          el("div", { class: "dc-name", text: c.company }),
          el("div", { class: "dc-sub", text: `${c.subsector ? c.subsector + " · " : ""}${c.city || "—"}` }),
          el("div", { class: "dc-meta" }, [
            ...meta,
            c.website ? el("a", { class: "ct-link", href: c.website, target: "_blank", rel: "noopener", text: "🌐 web" }) : null,
            c.phone ? el("a", { class: "ct-link", href: `tel:${c.phone.replace(/\s/g, "")}`, text: "☎" }) : null,
          ]),
        ]),
        addBtn,
      ]);
    })));
  };

  const discoverBtn = el("button", { class: "btn-primary", text: "Descubrir", onClick: runDiscover });
  qInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runDiscover(); });

  blocks.push(el("div", { class: "discover-bar" }, [secSel, qInput, discoverBtn]));

  // Ideas rápidas: rellenan el buscador y lanzan la búsqueda.
  const ideaChips = [
    ["health", "clínicas dentales Madrid"],
    ["hospitality", "restaurante premium"],
    ["realestate", "inmobiliaria lujo"],
    ["growth", "marca DTC"],
  ];
  blocks.push(el("div", { class: "idea-chips" }, [
    el("span", { class: "idea-lbl", text: "Ideas:" }),
    ...ideaChips.map(([sec, q]) => el("button", { class: "idea-chip", text: q, onClick: () => { secSel.value = sec; qInput.value = q; runDiscover(); } })),
  ]));

  blocks.push(resultsBox);
  // Muestra candidatos de entrada al abrir la pestaña.
  setTimeout(runDiscover, 0);

  // Formulario de alta.
  blocks.push(el("h3", { text: "Añadir lead", class: "add-h" }));
  blocks.push(addLeadForm());

  // Leads ya añadidos.
  if (userLeads.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: `Tus leads añadidos (${userLeads.length})` }),
      el("ul", { class: "user-leads" }, userLeads.map((l) =>
        el("li", {}, [
          el("span", { text: `${l.company} · ${SECTOR_BY_KEY[l.sector]?.label || l.sector} · ${l.city || "—"}` }),
          el("button", { class: "ul-del", text: "✕", title: "Eliminar", onClick: () => { store.removeUserLead(l.id); recompute().then(render); } }),
        ])
      )),
    ]));
  }

  return el("div", {}, blocks);
}

function addLeadForm() {
  const f = (name, ph) => el("input", { name, placeholder: ph, class: "lead-f" });
  const company = f("company", "Nombre de la empresa *");
  const sector = el("select", { class: "lead-f" }, SECTORS.map((s) => el("option", { value: s.key, text: s.label })));
  const subsector = f("subsector", "Subsector (ej. clínica dental)");
  const city = f("city", "Ciudad");
  const website = f("website", "Web (https://…)");
  const dmName = f("dmName", "Decisor (nombre)");
  const dmRole = f("dmRole", "Cargo del decisor");
  const dmLinkedin = f("dmLinkedin", "LinkedIn del decisor (in/…)");
  const phone = f("phone", "Teléfono");
  const email = f("email", "Email");
  const transitionNote = f("transitionNote", "Momento / transición (ej. abre 2ª sede en marzo) *");
  const transitionUrl = f("transitionUrl", "Fuente del momento (URL prensa) — sube la puntuación");
  const tensionNote = f("tensionNote", "Tensión que ves (ej. web anticuada, sin reservas)");
  const offer = el("select", { class: "lead-f" }, Object.entries(OFFER_LADDER).map(([k, o]) => el("option", { value: k, text: `${o.label} · ${o.price.toLocaleString("es-ES")} €` })));

  const msg = el("span", { class: "add-msg" });
  const save = el("button", {
    class: "btn-primary",
    text: "Añadir y puntuar",
    onClick: async () => {
      if (!company.value.trim()) { msg.textContent = "El nombre es obligatorio."; return; }
      const lead = buildLead({
        company: company.value.trim(), sector: sector.value, subsector: subsector.value,
        city: city.value, website: website.value || null,
        dmName: dmName.value, dmRole: dmRole.value, dmLinkedin: dmLinkedin.value || null,
        phone: phone.value || null, email: email.value || null,
        transitionNote: transitionNote.value, transitionUrl: transitionUrl.value || null,
        tensionNote: tensionNote.value, offer: offer.value,
      });
      store.saveUserLead(lead);
      // Asegura que se vea: recalcula y abre Oportunidades filtrando por el lead.
      await recompute();
      state.filters.search = lead.company;
      goView("cards");
    },
  });

  return el("div", { class: "add-lead" }, [
    el("div", { class: "lead-grid" }, [company, sector, subsector, city, website, dmName, dmRole, dmLinkedin, phone, email, transitionNote, transitionUrl, tensionNote, offer]),
    el("div", { class: "add-actions" }, [save, msg]),
    el("p", { class: "hint", text: "* Nombre y momento son lo mínimo. Con una URL de fuente del momento, el lead puntúa más alto. El resto de huecos los confirmas luego desde la ficha (Verificación)." }),
  ]);
}

// ---- Conector 01 ↔ XN -------------------------------------------------------
// El corazón del sistema: reparte cada oportunidad entre 01 Agency (ticket
// 1.500–5.000 €) y XN LAB (transformación 8.000 €+), con el valor de cada
// cartera, el porqué del reparto y el traspaso entre casas.

function connectorView() {
  const all = (state.results?.all || []).filter((o) => o.scores.classification !== "discard");
  const o1 = all.filter((o) => o.scores.classification === "01");
  const xn = all.filter((o) => o.scores.classification === "xn");

  // Valor potencial de cada cartera = suma del ticket sugerido por lead.
  const ticketOf = (o) => OFFER_LADDER[o.suggestedOfferKey]?.price || 0;
  const sum = (arr) => arr.reduce((s, o) => s + ticketOf(o), 0);
  const eur = (n) => `${n.toLocaleString("es-ES")} €`;

  const blocks = [el("h2", { text: "Conector 01 ↔ XN LAB" })];
  blocks.push(el("p", { class: "hint", text: "Cada oportunidad se reparte según el alcance del primer movimiento: 01 Agency capta y ejecuta (1.500–5.000 €); XN LAB transforma (8.000 €+). Aquí ves las dos carteras, su valor potencial y por qué cae cada lead donde cae." }));

  // Cabecera con las dos casas y su valor.
  blocks.push(el("div", { class: "conn-houses" }, [
    el("div", { class: "conn-house house-01" }, [
      el("div", { class: "conn-h-name", text: "01 Agency" }),
      el("div", { class: "conn-h-n", text: String(o1.length) }),
      el("div", { class: "conn-h-sub", text: `${eur(sum(o1))} potencial · ticket 1.500–5.000 €` }),
    ]),
    el("div", { class: "conn-arrow", text: "↔", title: "Traspaso entre casas" }),
    el("div", { class: "conn-house house-xn" }, [
      el("div", { class: "conn-h-name", text: "XN LAB" }),
      el("div", { class: "conn-h-n", text: String(xn.length) }),
      el("div", { class: "conn-h-sub", text: `${eur(sum(xn))} potencial · transformación 8.000 €+` }),
    ]),
  ]));

  blocks.push(el("div", { class: "conn-total", html: `Valor potencial combinado del pipeline: <b>${eur(sum(all))}</b> en ${all.length} oportunidades.` }));

  // Dos columnas con los leads de cada casa, con su oferta y el porqué.
  const column = (title, leads, cls) => el("div", { class: `conn-col conn-col-${cls}` }, [
    el("h3", { text: `${title} (${leads.length})` }),
    leads.length ? el("div", { class: "conn-leads" }, leads.map((o) => {
      const offer = OFFER_LADDER[o.suggestedOfferKey];
      const why = connectorReason(o);
      return el("div", { class: "conn-lead", onClick: () => { state.filters.search = o.company; goView("cards"); } }, [
        el("div", { class: "conn-lead-top" }, [
          el("span", { class: "conn-lead-name", text: o.company }),
          el("span", { class: `conn-lead-score conf-${o.scores.confidence >= 75 ? "hot" : o.scores.confidence >= 58 ? "warm" : "cool"}`, text: String(o.scores.confidence) }),
        ]),
        el("div", { class: "conn-lead-offer", text: offer ? `${offer.label} · ${eur(offer.price)}` : "—" }),
        el("div", { class: "conn-lead-why", text: why }),
      ]);
    })) : el("p", { class: "empty", text: "Sin leads en esta cartera ahora mismo." }),
  ]);

  blocks.push(el("div", { class: "conn-cols" }, [
    column("01 Agency — captar y ejecutar", o1, "01"),
    column("XN LAB — transformar", xn, "xn"),
  ]));

  // Candidatos a traspaso: 01 muy fuertes que rozan XN (handoff explícito).
  const handoff = o1.filter((o) => o.scores.confidence >= 80 && o.scores.economicPotential === "very high");
  if (handoff.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Candidatos a escalar de 01 → XN" }),
      el("p", { class: "hint", text: "Leads de 01 con confianza alta y capacidad económica muy alta: si el primer proyecto va bien, son candidatos a una transformación XN." }),
      el("ul", { class: "bullets" }, handoff.map((o) => el("li", { text: `${o.company} — ${o.scores.confidence} · ${o.city}` }))),
    ]));
  }

  return el("div", {}, blocks);
}

// Por qué cae un lead en su casa (texto corto y defendible).
function connectorReason(o) {
  const s = o.scores;
  if (s.classification === "xn") {
    return `Transformación integral: capacidad ${s.economicPotential}, confianza ${s.confidence}. El primer movimiento ya es de alcance XN.`;
  }
  const svc = matchServices(o, { max: 1 })[0];
  return svc ? `Primer movimiento 01: ${svc.name}. Punto de entrada accionable y de ticket medio.` : `Encaje 01: proyecto acotado de ticket medio.`;
}

// ---- Learning loop view -----------------------------------------------------

function learningView() {
  const summary = store.applyLearning();
  const log = store.getLearning();
  const blocks = [];

  const cal = state.calibration || store.getCalibration();

  blocks.push(el("h2", { text: "Aprendizaje" }));
  blocks.push(el("p", { class: "hint", text: "Los resultados que registras en cada ficha alimentan esta vista Y recalibran la puntuación — con topes para que una primera semana ruidosa no distorsione el modelo. Comparte el archivo para que cuenten las llamadas de todos." }));

  // Controles para compartir — hacen portable el registro de llamadas.
  blocks.push(el("div", { class: "share-bar" }, [
    el("button", { class: "btn", text: "Exportar registro", onClick: () => {
      xport.download(`registro-llamadas-${new Date().toISOString().slice(0,10)}.json`, store.exportState(), "application/json");
    } }),
    el("button", { class: "btn", text: "Importar registro", onClick: () => importPicker.click() }),
    importPickerEl(),
  ]));

  blocks.push(el("div", { class: "learn-stats" }, [
    stat("Resultados registrados", summary.sampleSize),
    stat("Acierto de tesis", summary.hypothesisAccuracy == null ? "—" : `${summary.hypothesisAccuracy}%`),
    stat("Tasa reunión (01)", rate(summary.meetingRateByClass["01"])),
    stat("Tasa reunión (XN)", rate(summary.meetingRateByClass["xn"])),
  ]));

  // Panel de calibración — la parte que realmente cambia la puntuación.
  const calChildren = [
    el("div", { class: "verif-head" }, [
      el("span", { class: `verif-pct ${cal.active ? "" : "muted"}`, text: cal.active ? "ACTIVA" : "INACTIVA" }),
      el("span", { class: "verif-label", text: cal.active
        ? `recalibrando con ${cal.evaluated} llamadas evaluables (éxito base ${Math.round((cal.baseRate||0)*100)}%)`
        : `faltan ${6 - cal.evaluated} llamadas decisivas (interesado/reunión vs rechazado/mal encaje)` }),
    ]),
  ];
  if (cal.active && cal.notes.length) {
    calChildren.push(el("ul", { class: "bullets" }, cal.notes.map((n) => el("li", { text: n }))));
    // Mostrar los multiplicadores de peso que se movieron.
    const moved = Object.entries(cal.weightMultipliers).filter(([, m]) => Math.abs(m - 1) >= 0.01);
    if (moved.length) {
      calChildren.push(el("div", { class: "verif-gaps" }, moved.map(([k, m]) =>
        el("span", { class: `verif-gap ${m > 1 ? "up" : "down"}`, text: `${FILTER_BY_KEY[k]?.label || k} ${m > 1 ? "+" : ""}${Math.round((m-1)*100)}%` })
      )));
    }
  }
  blocks.push(el("div", { class: "verif verif-real" }, [el("h4", { text: "Calibración de la puntuación" }), ...calChildren]));

  if (summary.topObjections.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Objeciones más frecuentes" }),
      el("ul", { class: "bullets" }, summary.topObjections.map((o) => el("li", { text: `${o.objection} (${o.count})` }))),
    ]));
  }
  if (summary.notes.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Notas de calibración" }),
      el("ul", { class: "bullets" }, summary.notes.map((n) => el("li", { text: n }))),
    ]));
  }
  if (log.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Historial de resultados" }),
      el("ul", { class: "outcome-log" }, log.slice().reverse().map((o) =>
        el("li", { html: `<b>${esc(o.id)}</b> — ${esc(STATUS_LABELS[o.outcome] || o.outcome)} · tesis ${o.hypothesisCorrect ? "✓" : "✗"}${o.objection ? ` · obj: ${esc(o.objection)}` : ""}` })
      )),
    ]));
  } else {
    blocks.push(el("p", { class: "empty", text: "Aún no hay resultados registrados. Registra el resultado de una llamada desde cualquier ficha." }));
  }

  return el("div", {}, blocks);
}

// Hidden file input for importing a shared call-log state file. Created once,
// reused across renders.
let importPicker = null;
function importPickerEl() {
  if (importPicker) return importPicker;
  importPicker = el("input", {
    type: "file",
    accept: "application/json,.json",
    style: "display:none",
    onChange: (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const res = store.importState(reader.result);
        if (!res.ok) { alert(`Error al importar: ${res.error}`); return; }
        alert(`Importados ${res.addedOutcomes} resultado(s), ${res.addedLeads || 0} lead(s) y fusionados ${res.mergedTracking} registro(s) de estado.`);
        recompute().then(render);
      };
      reader.readAsText(file);
      e.target.value = ""; // allow re-importing the same file
    },
  });
  return importPicker;
}

function stat(label, value) {
  return el("div", { class: "stat" }, [el("div", { class: "stat-v", text: String(value) }), el("div", { class: "stat-l", text: label })]);
}
function rate(obj) {
  return obj ? `${obj.rate}% (${obj.meetings}/${obj.total})` : "—";
}
