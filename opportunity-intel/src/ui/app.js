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
} from "../models.js";
import * as store from "../store.js";
import * as xport from "../export.js";

const state = {
  config: { ...DEFAULT_CONFIG, ...store.getSavedConfig({}) },
  results: null,
  dataset: "demo", // demo (synthetic) | researched (real, Spain)
  view: "pipeline", // pipeline | table | cards | learning
  filters: { sector: "all", city: "all", classification: "all", priority: "all", minEvidence: 0, minConfidence: 0, minEvStrength: 0, search: "" },
};

let root;

export async function mount(rootEl) {
  root = rootEl;
  await recompute();
  render();
}

function activeCandidates() {
  return state.dataset === "researched" ? RESEARCHED : SEED;
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
  root.appendChild(header());
  root.appendChild(tabs());
  const main = el("div", { class: "main" });
  main.appendChild(configPanel());
  main.appendChild(viewArea());
  root.appendChild(main);
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
      el("button", { class: "btn-ghost", text: "Reiniciar", onClick: () => { if (confirm("¿Reiniciar todo el seguimiento, notas y aprendizaje?")) { store.resetAll(); location.reload(); } } }),
    ]),
  ]);
}

function tabs() {
  const items = [
    ["pipeline", "Embudo"],
    ["table", "Ranking"],
    ["cards", "Oportunidades"],
    ["learning", "Aprendizaje"],
  ];
  return el(
    "nav",
    { class: "tabs" },
    items.map(([key, label]) =>
      el("button", {
        class: `tab ${state.view === key ? "active" : ""}`,
        text: label,
        onClick: () => { state.view = key; render(); },
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

  return el("aside", { class: "config" }, [
    el("h2", { text: "Configuración de búsqueda" }),
    field("Dataset", datasetSel),
    field("País", country),
    field("Sectores", sectorChecks),
    field("Volumen de candidatos (objetivo)", candVol),
    field("Nº final de leads", finalCount),
    field("Conservadurismo", el("div", {}, [conservSlider, conservOut])),
    field("Puntuación mínima", minScore),
    field("Umbral 01 → XN LAB (confianza)", xnThr),
    el("button", { class: "btn-primary", text: "Ejecutar embudo", onClick: async () => { await recompute(); render(); } }),
    el("p", { class: "config-note", text: "El conservadurismo mezcla el motor 80/20 por defecto: más alto = más rojo/gris tratado como 'probablemente no'." }),
  ]);
}

// ---- View area --------------------------------------------------------------

function viewArea() {
  const area = el("section", { class: "view" });
  if (state.view === "pipeline") area.appendChild(pipelineView());
  else if (state.view === "table") area.appendChild(tableView());
  else if (state.view === "cards") area.appendChild(cardsView());
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
    exports,
    el("p", { class: "hint", text: "Fases: descubierto → enriquecido → filtrado → puntuado → preseleccionado → Top N final. La caída bajo cada fase muestra cuántos candidatos rechazó el embudo." }),
  ]);
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
      return el("tr", { class: `row-${s.classification}`, onClick: () => { state.view = "cards"; state.filters.search = o.company; render(); } }, [
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
    filterBar(),
    el("div", { class: "results-region" }, [buildCards()]),
  ]);
}

function buildCards() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  const handlers = {
    onStatus: (id, st) => { store.setStatus(id, st); recompute().then(render); },
    onNotes: (id, notes) => { store.setNotes(id, notes); },
    onOutcome: (id, outcome) => {
      // Stamp the lead's signal snapshot so calibration is reproducible even if
      // the dataset later changes. Then recompute — outcomes recalibrate scores.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.addOutcome({ ...outcome, signals: lead?.signals || null });
      recompute().then(render);
    },
  };
  if (!rows.length) return el("p", { class: "empty", text: "Ningún candidato coincide con los filtros actuales." });
  return el("div", { class: "cards" }, rows.map((o) => renderCard(o, tracking[o.id], handlers)));
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
        alert(`Importados ${res.addedOutcomes} resultado(s) nuevo(s) y fusionados ${res.mergedTracking} registro(s) de estado.`);
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
