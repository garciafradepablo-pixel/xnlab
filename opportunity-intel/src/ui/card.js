// =============================================================================
// card.js — Renders one full opportunity card, matching the brief's output
// format: identity, classification, scores (each with an explainer), executive
// summary, hypothesis, evidence, tensions, why-now, blind spot, lever, offer,
// call opening, objection handling, devil's advocate, invalidators, and the
// operational layer (status, notes, learning loop).
// =============================================================================

import { el, esc } from "./dom.js";
import {
  FILTER_BY_KEY,
  FILTERS,
  LEVELS,
  SECTOR_BY_KEY,
  CLASSIFICATIONS,
  RECOMMENDATIONS,
  OFFER_LADDER,
  TENSION_TYPES,
  SCORE_EXPLAINERS,
  CALL_STATUSES,
  STATUS_LABELS,
  evidenceVerdict,
} from "../models.js";
import { explainScore } from "../scoring.js";

const offerText = (key) => {
  const o = OFFER_LADDER[key];
  return o ? `${o.label} · €${o.price.toLocaleString("es-ES")}` : "—";
};

/** A score chip with an explainer tooltip (title attr) so no score is naked. */
function scoreChip(name, value, suffix = "") {
  const exp = SCORE_EXPLAINERS[name];
  const title = exp
    ? `${exp.label}\n▲ ${exp.up}\n▼ ${exp.down}`
    : name;
  return el("div", { class: "chip", title }, [
    el("span", { class: "chip-val", text: `${value}${suffix}` }),
    el("span", { class: "chip-label", text: exp ? exp.label : name }),
  ]);
}

function signalRow(opp) {
  return el(
    "div",
    { class: "signals" },
    FILTERS.map((f) => {
      const lvl = opp.signals?.[f.key]?.level || "grey";
      const reason = LEVELS[lvl].rank >= 2 ? f.increases : f.decreases;
      return el("div", {
        class: `sig sig-${lvl}`,
        title: `${f.label} — ${LEVELS[lvl].label}\n${f.question}\n${reason}`,
        text: f.label,
      });
    })
  );
}

function evidenceList(opp) {
  const items = (opp.evidence || []).map((e) => {
    const f = FILTER_BY_KEY[e.filter];
    const src = e.url
      ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.source)}</a>`
      : esc(e.source);
    return el("li", {
      html: `<span class="ev-tier ev-tier-${e.tier}" title="Evidence weight">T${e.tier}</span> <strong>${esc(f?.label || e.filter)}:</strong> ${esc(e.note)} <span class="ev-src">— ${src}</span>`,
    });
  });
  return el("ul", { class: "evidence" }, items);
}

function bullets(arr) {
  return el("ul", { class: "bullets" }, (arr || []).map((x) => el("li", { text: x })));
}

/**
 * @param {object} opp        Scored opportunity (with .scores and .ranking)
 * @param {object} record     Tracking record { status, notes }
 * @param {object} handlers   { onStatus(id,status), onNotes(id,text), onOutcome(id,outcome) }
 */
export function renderCard(opp, record, handlers = {}) {
  const s = opp.scores;
  const sector = SECTOR_BY_KEY[opp.sector]?.label || opp.sector;

  const header = el("div", { class: "card-head" }, [
    el("div", { class: "rank", text: `#${opp.ranking ?? "—"}` }),
    el("div", { class: "ident" }, [
      el("h3", { text: opp.company }),
      el("p", { class: "sub", text: `${opp.subsector} · ${opp.city}` }),
    ]),
    el("div", { class: `klass klass-${s.classification}` }, [
      el("span", { text: CLASSIFICATIONS[s.classification] }),
      el("small", { text: RECOMMENDATIONS[s.recommendation] }),
    ]),
  ]);

  const scores = el("div", { class: "scores-row" }, [
    scoreChip("confidence", s.confidence),
    scoreChip("evidence", s.evidence),
    scoreChip("conversation", s.conversation, "%"),
    scoreChip("meeting", s.meeting, "%"),
    scoreChip("closing", s.closing, "%"),
    el("div", { class: "chip chip-econ", title: "Economic potential" }, [
      el("span", { class: "chip-val", text: s.economicPotential }),
      el("span", { class: "chip-label", text: "Economic" }),
    ]),
  ]);

  // Contact block
  const dm = opp.decisionMaker || {};
  const contact = el("div", { class: "contact", html: `
    <span><b>DM:</b> ${esc(dm.name || "—")} ${dm.role ? `· ${esc(dm.role)}` : ""}</span>
    ${dm.linkedin ? `<span><b>in:</b> ${esc(dm.linkedin)}</span>` : ""}
    ${opp.phone ? `<span><b>Tel:</b> ${esc(opp.phone)}</span>` : ""}
    ${opp.email ? `<span><b>Email:</b> ${esc(opp.email)}</span>` : ""}
    ${opp.website ? `<span><b>Web:</b> <a href="${esc(opp.website)}" target="_blank" rel="noopener">${esc(opp.website)}</a></span>` : ""}
    ${opp.instagram ? `<span><b>IG:</b> ${esc(opp.instagram)}</span>` : ""}
  ` });

  const section = (title, node) =>
    el("div", { class: "sec" }, [el("h4", { text: title }), node]);

  const tensions = el(
    "div",
    { class: "tensions" },
    (opp.tensions || []).map((t) => el("span", { class: "tension", text: TENSION_TYPES[t] || t }))
  );

  const body = el("div", { class: "card-body" }, [
    section("Executive summary", el("p", { text: opp.summary })),
    section("Main hypothesis", el("p", { class: "thesis", text: opp.thesis })),
    section(
      `Evidence — ${opp.evidence?.length || 0} points (${evidenceVerdict(opp.evidence?.length || 0)})`,
      evidenceList(opp)
    ),
    section("Detected tensions", tensions),
    section("Why now", el("p", { text: opp.whyNow })),
    section("Why this company before others", el("p", { text: opp.whyBeforeOthers })),
    section("What they're probably not seeing", el("p", { text: opp.blindSpot })),
    section("First lever", el("p", { html: `${esc(opp.firstLever)} <span class="offer">→ ${esc(offerText(opp.suggestedOfferKey))}</span>` })),
    section("Call opening", el("blockquote", { text: opp.callOpening })),
    section("Most likely objection", el("p", { text: opp.objection })),
    section("Recommended response", el("p", { text: opp.objectionResponse })),
    section("Reasons NOT to call (devil's advocate)", bullets(opp.reasonsNotToCall)),
    section("What would invalidate our thesis", bullets(opp.invalidators)),
  ]);

  // Diagnostics line
  const diag = el("p", { class: "diag", text: explainScore(s) });

  // ---- Operational layer: status, notes, learning loop ----
  const statusSel = el(
    "select",
    {
      class: "status-sel",
      onChange: (e) => handlers.onStatus?.(opp.id, e.target.value),
    },
    CALL_STATUSES.map((st) =>
      el("option", { value: st, selected: (record?.status || "not_called") === st, text: STATUS_LABELS[st] })
    )
  );

  const notes = el("textarea", {
    class: "notes",
    placeholder: "Notes after the call…",
    onChange: (e) => handlers.onNotes?.(opp.id, e.target.value),
  });
  notes.value = record?.notes || "";

  const ops = el("div", { class: "ops" }, [
    el("div", { class: "ops-row" }, [
      el("label", { text: "Status" }),
      statusSel,
      el("button", {
        class: "btn-learn",
        text: "+ Log call outcome",
        onClick: () => toggleLearning(learnBox),
      }),
    ]),
    notes,
  ]);

  // Learning loop form (collapsed by default)
  const learnBox = buildLearningForm(opp, handlers);

  return el("article", { class: `card prio-${s.callPriority}`, dataset: { id: opp.id } }, [
    header,
    scores,
    diag,
    contact,
    body,
    el("div", { class: "sec-meta", text: `Sector: ${sector}${opp.synthetic ? " · demo data" : ""}` }),
    ops,
    learnBox,
  ]);
}

function toggleLearning(box) {
  box.classList.toggle("open");
}

function buildLearningForm(opp, handlers) {
  const f = (name, ph, type = "input") =>
    el(type, { name, placeholder: ph, class: "learn-f" });
  const outcome = el("select", { name: "outcome", class: "learn-f" },
    CALL_STATUSES.map((st) => el("option", { value: st, text: STATUS_LABELS[st] })));
  const hyp = el("select", { name: "hyp", class: "learn-f" }, [
    el("option", { value: "", text: "Hypothesis correct?" }),
    el("option", { value: "yes", text: "Yes — thesis held" }),
    el("option", { value: "no", text: "No — thesis wrong" }),
  ]);
  const objection = f("objection", "Objection actually raised");
  const worked = f("worked", "What worked");
  const failed = f("failed", "What failed");
  const next = f("next", "Next action");

  const save = el("button", {
    class: "btn-save",
    text: "Save outcome",
    onClick: () => {
      handlers.onOutcome?.(opp.id, {
        id: opp.id,
        classification: opp.scores.classification,
        outcome: outcome.value,
        objection: objection.value,
        whatWorked: worked.value,
        whatFailed: failed.value,
        hypothesisCorrect: hyp.value === "yes",
        nextAction: next.value,
      });
      [objection, worked, failed, next].forEach((n) => (n.value = ""));
      save.textContent = "Saved ✓";
      setTimeout(() => (save.textContent = "Save outcome"), 1500);
    },
  });

  return el("div", { class: "learn-box" }, [
    el("div", { class: "learn-grid" }, [outcome, hyp, objection, worked, failed, next]),
    save,
  ]);
}
