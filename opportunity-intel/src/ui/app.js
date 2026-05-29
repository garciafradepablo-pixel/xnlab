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
  state.results = await runPipeline(activeCandidates(), state.config);
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
      el("span", { class: "tagline", text: "Opportunity Intelligence — moments, not companies" }),
    ]),
    el("div", { class: "head-actions" }, [
      el("span", { class: "demo-badge", text: "DEMO DATA — synthetic leads", title: "The seeded dataset is illustrative. Connect real sources via the enrichment adapters (see README)." }),
      el("button", { class: "btn-ghost", text: "Reset", onClick: () => { if (confirm("Reset all tracking, notes and learning?")) { store.resetAll(); location.reload(); } } }),
    ]),
  ]);
}

function tabs() {
  const items = [
    ["pipeline", "Pipeline"],
    ["table", "Ranking table"],
    ["cards", "Opportunity cards"],
    ["learning", "Learning loop"],
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
    onInput: (e) => { conservOut.textContent = `${e.target.value}% conservative`; c.conservatism = +e.target.value / 100; },
  });
  const conservOut = el("output", { text: `${Math.round(c.conservatism * 100)}% conservative` });

  const minScore = el("input", { type: "number", min: "0", max: "100", value: String(c.minScore), onChange: (e) => (c.minScore = +e.target.value) });
  const finalCount = el("input", { type: "number", min: "1", max: "50", value: String(c.finalCount), onChange: (e) => (c.finalCount = +e.target.value) });
  const candVol = el("input", { type: "number", min: "1", value: String(c.candidateVolume), onChange: (e) => (c.candidateVolume = +e.target.value) });
  const xnThr = el("input", { type: "number", min: "0", max: "100", value: String(c.xnThreshold), onChange: (e) => (c.xnThreshold = +e.target.value) });
  const country = el("input", { type: "text", value: c.country, onChange: (e) => (c.country = e.target.value) });

  const datasetSel = el(
    "select",
    { onChange: async (e) => { state.dataset = e.target.value; await recompute(); render(); } },
    [
      el("option", { value: "demo", selected: state.dataset === "demo", text: `Demo — synthetic (${SEED.length})` }),
      el("option", { value: "researched", selected: state.dataset === "researched", text: `Researched — Spain (${RESEARCHED.length})` }),
    ]
  );

  return el("aside", { class: "config" }, [
    el("h2", { text: "Search configuration" }),
    field("Dataset", datasetSel),
    field("Country", country),
    field("Sectors", sectorChecks),
    field("Candidate volume (target)", candVol),
    field("Final lead count", finalCount),
    field("Conservatism", el("div", {}, [conservSlider, conservOut])),
    field("Minimum score", minScore),
    field("01 → XN LAB threshold (confidence)", xnThr),
    el("button", { class: "btn-primary", text: "Run pipeline", onClick: async () => { await recompute(); render(); } }),
    el("p", { class: "config-note", text: "Conservatism blends the engine 80/20 by default: higher = more red/grey treated as 'probably not'." }),
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
      el("h2", { text: "Candidate pipeline" }),
      el("div", { class: "pipe-summary" }, [
        el("p", { html: "<b>No researched leads yet.</b> The real-data pilot ships empty on purpose — a lead may only be added once it carries at least three cited, verifiable evidence points." }),
        el("p", { class: "hint", text: "Populate it via the live connectors (node bin/run.mjs --enrich) or by manual research following the protocol in src/data/researched.js. Switch the Dataset selector back to ‘Demo’ to explore the system now." }),
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
    el("p", { html: `Started from a target pool of <b>${state.config.candidateVolume.toLocaleString("es-ES")}</b> · scored <b>${counts.scored}</b> seeded candidates · <b>${counts.final}</b> made the final cut.` }),
    el("div", { class: "dist" }, Object.entries(dist).map(([k, v]) =>
      el("span", { class: `pill pill-${k}`, text: `${CLASSIFICATIONS[k]}: ${v}` })
    )),
  ]);

  const exports = el("div", { class: "exports" }, [
    el("h3", { text: "Export final list" }),
    el("div", { class: "export-btns" }, [
      el("button", { class: "btn", text: "CSV", onClick: () => xport.exportCSV(state.results.final, store.getTracking()) }),
      el("button", { class: "btn", text: "JSON", onClick: () => xport.exportJSON(state.results.final, store.getTracking()) }),
      el("button", { class: "btn", text: "PDF report", onClick: () => xport.exportPDF(state.results.final) }),
      el("button", { class: "btn", text: "Call sheet", onClick: () => xport.exportCallSheet(state.results.final) }),
    ]),
  ]);

  return el("div", {}, [
    el("h2", { text: "Candidate pipeline" }),
    stages,
    summary,
    exports,
    el("p", { class: "hint", text: "Stages: discovered → enriched → filtered → scored → shortlisted → final Top N. The drop under each stage shows how many candidates the funnel rejected." }),
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
    el("input", { type: "search", placeholder: "Search company / city / DM…", value: f.search, onInput: (e) => { f.search = e.target.value; rerenderResults(); } }),
    sel("sector", [opt("all", "All sectors", f.sector === "all"), ...SECTORS.map((s) => opt(s.key, s.label, f.sector === s.key))]),
    sel("city", [opt("all", "All cities", f.city === "all"), ...cities.map((c) => opt(c, c, f.city === c))]),
    sel("classification", [opt("all", "01 + XN + discard", f.classification === "all"), ...Object.entries(CLASSIFICATIONS).map(([k, v]) => opt(k, v, f.classification === k))]),
    sel("priority", [opt("all", "Any priority", f.priority === "all"), opt("high", "High priority", f.priority === "high"), opt("medium", "Medium", f.priority === "medium"), opt("low", "Low", f.priority === "low")]),
    el("label", { class: "minev" }, [
      el("span", { text: "Min evidence" }),
      el("input", { type: "number", min: "0", max: "10", value: String(f.minEvidence), onChange: (e) => { f.minEvidence = +e.target.value; render(); } }),
    ]),
    el("label", { class: "minev" }, [
      el("span", { text: "Min score" }),
      el("input", { type: "number", min: "0", max: "100", value: String(f.minConfidence), onChange: (e) => { f.minConfidence = +e.target.value; render(); } }),
    ]),
    el("label", { class: "minev" }, [
      el("span", { text: "Min evid. strength" }),
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
    el("h2", { text: "Ranking table" }),
    filterBar(),
    el("div", { class: "results-region" }, [buildTable()]),
  ]);
}

function buildTable() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  const head = ["#", "Company", "Sector", "City", "Class", "Conf", "Evid", "Conv", "Meet", "Close", "Econ", "Reco", "Status"];
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
        el("td", { text: s.economicPotential }),
        el("td", { class: "td-reco", text: RECOMMENDATIONS[s.recommendation] }),
        el("td", { text: STATUS_LABELS[t.status || "not_called"] }),
      ]);
    })),
  ]);
  return el("div", {}, [el("p", { class: "count", text: `${rows.length} candidates` }), table]);
}

// ---- Opportunity cards ------------------------------------------------------

function cardsView() {
  return el("div", {}, [
    el("h2", { text: "Opportunity cards" }),
    filterBar(),
    el("div", { class: "results-region" }, [buildCards()]),
  ]);
}

function buildCards() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  const handlers = {
    onStatus: (id, st) => { store.setStatus(id, st); },
    onNotes: (id, notes) => { store.setNotes(id, notes); },
    onOutcome: (id, outcome) => { store.addOutcome(outcome); },
  };
  if (!rows.length) return el("p", { class: "empty", text: "No candidates match the current filters." });
  return el("div", { class: "cards" }, rows.map((o) => renderCard(o, tracking[o.id], handlers)));
}

// ---- Learning loop view -----------------------------------------------------

function learningView() {
  const summary = store.applyLearning();
  const log = store.getLearning();
  const blocks = [];

  blocks.push(el("h2", { text: "Learning loop" }));
  blocks.push(el("p", { class: "hint", text: "Outcomes logged on each card feed this view. It reports observed performance and suggests directional calibration — it never silently rewrites the engine." }));

  blocks.push(el("div", { class: "learn-stats" }, [
    stat("Outcomes logged", summary.sampleSize),
    stat("Hypothesis accuracy", summary.hypothesisAccuracy == null ? "—" : `${summary.hypothesisAccuracy}%`),
    stat("Meeting rate (01)", rate(summary.meetingRateByClass["01"])),
    stat("Meeting rate (XN)", rate(summary.meetingRateByClass["xn"])),
  ]));

  if (summary.topObjections.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Most common objections" }),
      el("ul", { class: "bullets" }, summary.topObjections.map((o) => el("li", { text: `${o.objection} (${o.count})` }))),
    ]));
  }
  if (summary.notes.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Calibration notes" }),
      el("ul", { class: "bullets" }, summary.notes.map((n) => el("li", { text: n }))),
    ]));
  }
  if (log.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Outcome log" }),
      el("ul", { class: "outcome-log" }, log.slice().reverse().map((o) =>
        el("li", { html: `<b>${esc(o.id)}</b> — ${esc(STATUS_LABELS[o.outcome] || o.outcome)} · hypothesis ${o.hypothesisCorrect ? "✓" : "✗"}${o.objection ? ` · obj: ${esc(o.objection)}` : ""}` })
      )),
    ]));
  } else {
    blocks.push(el("p", { class: "empty", text: "No outcomes logged yet. Log a call outcome from any opportunity card." }));
  }

  return el("div", {}, blocks);
}

function stat(label, value) {
  return el("div", { class: "stat" }, [el("div", { class: "stat-v", text: String(value) }), el("div", { class: "stat-l", text: label })]);
}
function rate(obj) {
  return obj ? `${obj.rate}% (${obj.meetings}/${obj.total})` : "—";
}
