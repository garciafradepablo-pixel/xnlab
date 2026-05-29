// =============================================================================
// card.js — High-impact, scannable opportunity card.
//
// Design goal: a salesperson grasps the lead in ~10 seconds and can act.
//   1. Confidence RING + classification + priority — the verdict, at a glance.
//   2. "Why now" HOOK — the one timing reason to call, front and centre.
//   3. Metric BARS — conversation / meeting / closing, visual not numeric-only.
//   4. Signal DOTS — the ten filters as colour, tooltips for detail.
//   5. ACTION STRIP — the offer + price, a copyable opening line, and one-tap
//      status buttons (the conversion action).
//   6. DETAIL — everything analytical (thesis, evidence, objections,
//      verification, devil's advocate, notes, learning) folded away.
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
  CALL_STATUSES,
  STATUS_LABELS,
  ECONOMIC_LABELS,
  evidenceVerdict,
} from "../models.js";
import { explainScore, verificationProfile } from "../scoring.js";
import { matchServices, ticketLabel, SERVICE_BY_ID } from "../services.js";
import { failureReason, viability, recommendedPath, freshness, connectionDifficulty, FAILURE_STATUSES } from "../diagnosis.js";

const offerText = (key) => {
  const o = OFFER_LADDER[key];
  return o ? `${o.label} · €${o.price.toLocaleString("es-ES")}` : "—";
};

// ---- Normalización de enlaces -----------------------------------------------
// Los datos guardan handles parciales (in/marta, @cuenta, company/x). Estos
// helpers los convierten en URLs reales y clicables. Devuelven null si no hay.
function linkedinUrl(v) {
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://www.linkedin.com/${v.replace(/^\/+/, "")}`;
}
function instagramUrl(v) {
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://instagram.com/${v.replace(/^@/, "")}`;
}
function webUrl(v) {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
function mapsUrl(opp) {
  if (opp.googleMaps) return webUrl(opp.googleMaps);
  // Fallback: búsqueda de Maps por nombre + ciudad.
  const q = encodeURIComponent(`${opp.company} ${opp.city || ""}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
// Enlace de contacto compacto y clicable.
function ctLink(label, href, title) {
  return el("a", { class: "ct-link", href, target: "_blank", rel: "noopener", title: title || label, text: label });
}

const classLabel = (c) => (c === "xn" ? "XN LAB" : c === "01" ? "01 Agency" : "Descartar");

// Score → colour band (drives the ring + accents).
function band(score) {
  if (score >= 75) return "hot";
  if (score >= 58) return "warm";
  return "cool";
}

// ---- Confidence ring (inline SVG, no deps) ----------------------------------
function confidenceRing(score) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, score)) / 100);
  return el("div", {
    class: `ring ring-${band(score)}`,
    title: `Opportunity Confidence ${score}/100`,
    html: `
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle class="ring-bg" cx="32" cy="32" r="${r}" fill="none" stroke-width="6"/>
        <circle class="ring-fg" cx="32" cy="32" r="${r}" fill="none" stroke-width="6"
          stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
          stroke-linecap="round" transform="rotate(-90 32 32)"/>
      </svg>
      <div class="ring-num">${score}</div>`,
  });
}

// ---- Metric bar -------------------------------------------------------------
function bar(label, value, suffix = "%") {
  return el("div", { class: "mbar", title: `${label}: ${value}${suffix}` }, [
    el("span", { class: "mbar-l", text: label }),
    el("div", { class: "mbar-track" }, [
      el("div", { class: `mbar-fill fill-${band(value)}`, style: `width:${value}%` }),
    ]),
    el("span", { class: "mbar-v", text: `${value}${suffix}` }),
  ]);
}

// ---- Signal dots ------------------------------------------------------------
function signalDots(opp) {
  return el(
    "div",
    { class: "dots" },
    FILTERS.map((f) => {
      const lvl = opp.signals?.[f.key]?.level || "grey";
      const reason = LEVELS[lvl].rank >= 2 ? f.increases : f.decreases;
      return el("span", {
        class: `dot dot-${lvl}`,
        title: `${f.label} — ${LEVELS[lvl].label}\n${f.question}\n${reason}`,
      });
    })
  );
}

// ---- Copy-to-clipboard button ----------------------------------------------
function copyBtn(text, label = "Copiar") {
  const b = el("button", {
    class: "copy-btn",
    title: "Copiar al portapapeles",
    text: label,
    onClick: (e) => {
      e.stopPropagation();
      const done = () => { b.textContent = "✓ Copiado"; b.classList.add("copied"); setTimeout(() => { b.textContent = label; b.classList.remove("copied"); }, 1400); };
      try {
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done);
        else done();
      } catch { done(); }
    },
  });
  return b;
}

// ---- Quick one-tap status buttons (the conversion action) -------------------
const QUICK_STATUS = [
  ["called", "Llamado"],
  ["interested", "Interesado"],
  ["meeting_booked", "Reunión"],
  ["rejected", "Rechazado"],
];
function quickStatus(opp, current, handlers) {
  return el(
    "div",
    { class: "quick" },
    QUICK_STATUS.map(([key, label]) =>
      el("button", {
        class: `q q-${key} ${current === key ? "active" : ""}`,
        // Toggle: si ya está activo, al pulsar se desmarca (vuelve a "sin
        // llamar"). Así un toque por error se deshace con otro toque.
        title: current === key ? "Pulsa de nuevo para desmarcar" : label,
        text: current === key ? `✓ ${label}` : label,
        onClick: () => handlers.onStatus?.(opp.id, current === key ? "not_called" : key),
      })
    )
  );
}

// ---- Evidence + verification (inside detail) --------------------------------
function evidenceList(opp) {
  return el("ul", { class: "evidence" }, (opp.evidence || []).map((e) => {
    const f = FILTER_BY_KEY[e.filter];
    const src = e.url
      ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.source)}</a>`
      : esc(e.source);
    return el("li", {
      html: `<span class="ev-tier ev-tier-${e.tier}" title="Peso de la evidencia">T${e.tier}</span> <strong>${esc(f?.label || e.filter)}:</strong> ${esc(e.note)} <span class="ev-src">— ${src}</span>`,
    });
  }));
}

function verificationBlock(opp, handlers = {}) {
  const v = verificationProfile(opp);
  const isReal = opp.researched === true;
  if (!isReal && v.gapFilters.length === 0) return null;
  const children = [
    el("div", { class: "verif-head" }, [
      el("span", { class: "verif-pct", text: `${v.verifiedShare}%` }),
      el("span", { class: "verif-label", text: isReal ? "evidencia verificada" : "afirmado (demo)" }),
    ]),
    el("p", { class: "verif-line", text: `Verificado (citado): ${v.verifiedFilters.length}/10 filtros · ${v.sourceCount} fuente${v.sourceCount === 1 ? "" : "s"}` }),
  ];
  if (v.gapFilters.length) {
    children.push(el("p", { class: "verif-gaps-h", text: "Confirmar antes de llamar (pulsa para verificar y subir puntuación):" }));
    const form = el("div", { class: "verify-form" });
    children.push(
      el("div", { class: "verif-gaps" }, v.gapFilters.map((k) =>
        el("button", {
          class: "verif-gap verif-gap-btn",
          title: "Verificar este hueco",
          text: `+ ${FILTER_BY_KEY[k]?.label || k}`,
          onClick: () => openVerifyForm(form, opp, k, handlers),
        })
      ))
    );
    children.push(form);
  } else {
    children.push(el("p", { class: "verif-line ok", text: "Todos los filtros con evidencia citada." }));
  }
  return el("div", { class: `verif ${isReal ? "verif-real" : ""}` }, [el("h4", { text: "Verificación" }), ...children]);
}

// Formulario inline para verificar un hueco: el analista mira la web/reseñas,
// elige el veredicto y deja una nota; eso se convierte en evidencia y recalcula.
function openVerifyForm(container, opp, filterKey, handlers) {
  const label = FILTER_BY_KEY[filterKey]?.label || filterKey;
  const level = el("select", { class: "learn-f" }, [
    el("option", { value: "green", text: "✓ Confirmado fuerte (verde)" }),
    el("option", { value: "yellow", text: "~ Parcial (amarillo)" }),
    el("option", { value: "red", text: "✗ Negativo (rojo)" }),
  ]);
  const note = el("input", { class: "learn-f", placeholder: `Qué observaste sobre "${label}"` });
  const url = el("input", { class: "learn-f", placeholder: "URL revisada (web, reseñas…) — opcional" });
  const save = el("button", {
    class: "btn-save",
    text: "Guardar verificación",
    onClick: () => {
      handlers.onVerify?.(opp.id, filterKey, level.value, note.value, url.value);
    },
  });
  container.innerHTML = "";
  container.appendChild(el("div", { class: "verify-form-inner" }, [
    el("div", { class: "verify-form-h", text: `Verificar: ${label}` }),
    el("div", { class: "learn-grid" }, [level, note, url]),
    save,
  ]));
}

function bullets(arr) {
  return el("ul", { class: "bullets" }, (arr || []).map((x) => el("li", { text: x })));
}

/**
 * @param {object} opp        Scored opportunity (with .scores and .ranking)
 * @param {object} record     Tracking record { status, notes }
 * @param {object} handlers   { onStatus, onNotes, onOutcome }
 */
export function renderCard(opp, record, handlers = {}) {
  const s = opp.scores;
  const sector = SECTOR_BY_KEY[opp.sector]?.label || opp.sector;
  const status = record?.status || "not_called";
  const dm = opp.decisionMaker || {};

  // ---- TOP: rank · identity · class pill · confidence ring ----
  const top = el("div", { class: "c-top" }, [
    el("div", { class: "c-rank" }, [
      s.confidence >= 90 ? el("span", { class: "rank-crown", text: "★" }) : null,
      el("span", { text: `#${opp.ranking ?? "—"}` }),
    ]),
    el("div", { class: "c-ident" }, [
      el("h3", { text: opp.company }),
      el("p", { class: "c-sub", text: `${opp.subsector} · ${opp.city}` }),
      el("div", { class: "c-tags" }, [
        el("span", { class: `pillc pillc-${s.classification}`, text: classLabel(s.classification) }),
        el("span", { class: `reco reco-${band(s.confidence)}`, text: RECOMMENDATIONS[s.recommendation] }),
        el("span", { class: "econ-tag", title: "Potencial económico", text: `€ ${ECONOMIC_LABELS[s.economicPotential] || s.economicPotential}` }),
        (() => { const cd = connectionDifficulty(opp); return el("span", {
          class: `conn conn-${cd.level}`,
          title: `${cd.label} — ${cd.advice}${cd.channels.length ? "\nCanales: " + cd.channels.join(", ") : ""}`,
          text: `${cd.icon} ${cd.label}`,
        }); })(),
      ]),
    ]),
    confidenceRing(s.confidence),
  ]);

  // ---- HOOK: the single reason to call now ----
  const hook = el("div", { class: "c-hook" }, [
    el("span", { class: "hook-ic", text: "⚡" }),
    el("p", { text: opp.whyNow }),
  ]);

  // ---- FRESCURA: ¿sigue viva la empresa / caliente el momento? ----
  const fr2 = freshness(opp);
  const freshBadge = el("div", { class: `fresh fresh-${fr2.tone}`, title: "Antigüedad de la señal — pulsa 'Ver análisis' para los pasos de comprobación" }, [
    el("span", { class: "fresh-dot" }),
    el("span", { class: "fresh-txt", text: fr2.verdict }),
  ]);

  // ---- METRICS: visual bars + signal dots ----
  const metrics = el("div", { class: "c-metrics" }, [
    bar("Conversación", s.conversation),
    bar("Reunión", s.meeting),
    bar("Cierre", s.closing),
    signalDots(opp),
  ]);

  // ---- SERVICIOS QUE ENCAJAN: qué ofrecer a esta empresa ----
  const services = matchServices(opp, { max: 3 });
  const serviceBlock = services.length
    ? el("div", { class: "svc-fit" }, [
        el("div", { class: "svc-head" }, [
          el("span", { class: "svc-ic", text: "◆" }),
          el("span", { text: "Servicios que encajan" }),
        ]),
        el("div", { class: "svc-list" }, services.map((sv) =>
          el("div", { class: `svc svc-${sv.house}`, title: `${sv.solves}\n→ ${sv.produces}\nMotivo: ${sv.reasons.join(" · ")}` }, [
            el("span", { class: `svc-house svc-house-${sv.house}`, text: sv.house === "xn" ? "XN" : "01" }),
            el("span", { class: "svc-name", text: sv.name }),
            el("span", { class: "svc-ticket", text: ticketLabel(SERVICE_BY_ID[sv.id]) }),
          ])
        )),
      ])
    : null;

  // ---- ACTION STRIP: offer + copyable opening + quick status ----
  const action = el("div", { class: "c-action" }, [
    el("div", { class: "offer-line" }, [
      el("span", { class: "offer-ic", text: "→" }),
      el("span", { class: "offer-txt", text: offerText(opp.suggestedOfferKey) }),
    ]),
    el("div", { class: "open-line" }, [
      el("blockquote", { text: opp.callOpening }),
      copyBtn(opp.callOpening),
    ]),
    el("div", { class: "contact-line" }, [
      // Decisor: si hay LinkedIn personal, el nombre es el enlace.
      dm.linkedin
        ? el("a", { class: "ct-dm", href: linkedinUrl(dm.linkedin), target: "_blank", rel: "noopener", title: "LinkedIn del decisor", html: `<b>${esc(dm.name || "—")}</b>${dm.role ? ` · ${esc(dm.role)}` : ""}` })
        : el("span", { class: "ct", html: `<b>${esc(dm.name || "—")}</b>${dm.role ? ` · ${esc(dm.role)}` : ""}` }),
      opp.phone ? el("a", { class: "ct-link ct-call", href: `tel:${esc(opp.phone.replace(/\s/g, ""))}`, title: "Llamar", text: `☎ ${opp.phone}` }) : null,
      opp.email ? el("a", { class: "ct-link", href: `mailto:${esc(opp.email)}`, title: opp.email, text: "✉ email" }) : null,
      opp.website ? ctLink("🌐 web", webUrl(opp.website), opp.website) : null,
      ctLink("📍 Maps", mapsUrl(opp), "Buscar en Google Maps"),
      opp.linkedin ? ctLink("in empresa", linkedinUrl(opp.linkedin), "LinkedIn de la empresa") : null,
      opp.instagram ? ctLink(`◎ ${opp.instagram}`, instagramUrl(opp.instagram), "Instagram") : null,
    ]),
    quickStatus(opp, status, handlers),
  ]);

  // ---- PANEL DE FALLO: si el estado es negativo/inconcluso, por qué ----
  let failurePanel = null;
  if (FAILURE_STATUSES.has(status)) {
    const fr = failureReason(opp);
    failurePanel = el("div", { class: "fail-panel" }, [
      el("p", { class: "fail-head", text: fr.headline }),
      ...(fr.causes.length
        ? [el("ul", { class: "fail-list" }, fr.causes.map((c) =>
            el("li", {}, [
              el("b", { text: `${c.label}: ` }),
              el("span", { text: c.cause }),
              el("span", { class: "fail-fix", text: ` → ${c.mitigate}` }),
            ])
          ))]
        : []),
    ]);
  }

  // ---- DETAIL: everything analytical, folded ----
  const sec = (title, node) => el("div", { class: "sec" }, [el("h4", { text: title }), node]);
  const tensions = el("div", { class: "tensions" }, (opp.tensions || []).map((t) => el("span", { class: "tension", text: TENSION_TYPES[t] || t })));

  // operational: notes + learning form
  const notes = el("textarea", { class: "notes", placeholder: "Notas tras la llamada…", onChange: (e) => handlers.onNotes?.(opp.id, e.target.value) });
  notes.value = record?.notes || "";
  const learnBox = buildLearningForm(opp, handlers);

  // Viabilidad y camino (lectura de señales / auto-análisis).
  const vi = viability(opp);
  const path = recommendedPath(opp);
  const viabilityBlock = el("div", { class: "sec" }, [
    el("h4", { text: "Viabilidad y cobertura" }),
    el("div", { class: "viab" }, [
      el("div", { class: `viab-cov viab-${vi.tone}` }, [
        el("span", { class: "viab-n", text: `${vi.coverage}` }),
        el("span", { class: "viab-l", text: "cobertura" }),
      ]),
      el("p", { class: "viab-verdict", text: vi.verdict }),
    ]),
    vi.gaps.length ? el("p", { class: "viab-gaps", text: `Confirmar: ${vi.gaps.join(", ")}` }) : null,
  ]);
  const pathBlock = sec("Camino para reducir negativas",
    el("ol", { class: "path" }, path.map((p) => el("li", { text: p })))
  );

  // Comprobación de vida del negocio (anti-empresas-en-desuso).
  const lifeBlock = el("div", { class: "sec" }, [
    el("h4", { text: "¿Sigue activa? — comprobar antes de llamar" }),
    el("p", { class: `viab-verdict fresh-line-${fr2.tone}`, text: fr2.verdict }),
    el("ul", { class: "bullets" }, fr2.checks.map((c) => el("li", { text: c }))),
  ]);

  const detail = el("details", { class: "c-detail" }, [
    el("summary", {}, [el("span", { text: "Ver análisis completo" }), el("span", { class: "diag", text: explainScore(s) })]),
    lifeBlock,
    viabilityBlock,
    pathBlock,
    sec("Tesis", el("p", { class: "thesis", text: opp.thesis })),
    sec("Resumen", el("p", { text: opp.summary })),
    sec(`Evidencia — ${opp.evidence?.length || 0} (${evidenceVerdict(opp.evidence?.length || 0)})`, evidenceList(opp)),
    sec("Tensiones", tensions),
    sec("Por qué esta antes que otras", el("p", { text: opp.whyBeforeOthers })),
    sec("Lo que probablemente no ven", el("p", { text: opp.blindSpot })),
    sec("Primera palanca", el("p", { text: opp.firstLever })),
    sec("Objeción probable", el("p", { text: opp.objection })),
    sec("Respuesta recomendada", el("p", { class: "resp", html: `${esc(opp.objectionResponse)}` })),
    sec("Razones para NO llamar", bullets(opp.reasonsNotToCall)),
    sec("Qué invalidaría la tesis", bullets(opp.invalidators)),
    verificationBlock(opp, handlers),
    sec("Notas", notes),
    el("div", { class: "ops-detail" }, [
      el("button", { class: "btn-learn", text: "+ Registrar resultado de llamada", onClick: () => learnBox.classList.toggle("open") }),
      learnBox,
    ]),
    el("div", { class: "sec-meta", text: `Sector: ${sector}${opp.synthetic ? " · datos demo" : opp.researched ? " · investigado" : ""}` }),
  ]);

  // Destacado de élite: leads de máxima puntuación / "llamar de inmediato".
  const elite = s.confidence >= 90 ? "card-elite" : s.recommendation === "call_immediately" ? "card-priority" : "";
  return el("article", { class: `card prio-${s.callPriority} st-${status} ${elite}`, dataset: { id: opp.id } }, [
    top,
    hook,
    freshBadge,
    metrics,
    serviceBlock,
    action,
    failurePanel,
    detail,
  ]);
}

function buildLearningForm(opp, handlers) {
  const f = (name, ph) => el("input", { name, placeholder: ph, class: "learn-f" });
  const outcome = el("select", { name: "outcome", class: "learn-f" },
    CALL_STATUSES.map((st) => el("option", { value: st, text: STATUS_LABELS[st] })));
  const hyp = el("select", { name: "hyp", class: "learn-f" }, [
    el("option", { value: "", text: "¿Tesis acertada?" }),
    el("option", { value: "yes", text: "Sí — se confirmó" }),
    el("option", { value: "no", text: "No — fallida" }),
  ]);
  const objection = f("objection", "Objeción real");
  const worked = f("worked", "Qué funcionó");
  const failed = f("failed", "Qué falló");
  const next = f("next", "Siguiente acción");

  const save = el("button", {
    class: "btn-save",
    text: "Guardar resultado",
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
      save.textContent = "✓ Guardado";
      setTimeout(() => (save.textContent = "Guardar resultado"), 1500);
    },
  });

  return el("div", { class: "learn-box" }, [
    el("div", { class: "learn-grid" }, [outcome, hyp, objection, worked, failed, next]),
    save,
  ]);
}
