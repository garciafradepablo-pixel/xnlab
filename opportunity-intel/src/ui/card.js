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

import { el, esc, safeUrl } from "./dom.js";
import {
  FILTER_BY_KEY,
  FILTERS,
  LEVELS,
  SECTOR_BY_KEY,
  CLASSIFICATIONS,
  OFFER_LADDER,
  TENSION_TYPES,
  CALL_STATUSES,
  STATUS_LABELS,
  CALL_CHANNELS,
  CALL_RESULTS,
  evidenceVerdict,
} from "../models.js";
import { explainScore, verificationProfile } from "../scoring.js";
import { matchServices, ticketLabel, SERVICE_BY_ID } from "../services.js";
import { failureReason, viability, recommendedPath, freshness, connectionDifficulty, FAILURE_STATUSES } from "../diagnosis.js";
import { lensLabel } from "../lenses.js";
import { getNextBestAction } from "../nextaction.js";
import { decide, strategicLens } from "../decision.js";

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

const classLabel = (c) => (c === "xn" ? "Profunda" : c === "01" ? "Ágil" : "Descartar");

// Score → colour band (drives the ring + accents).
function band(score) {
  if (score >= 75) return "hot";
  if (score >= 58) return "warm";
  return "cool";
}

// (El anillo de confianza se retiró como hero: OCI es ahora la jerarquía
// principal de la card —ver ociHero—; la confianza queda como chip secundario.)

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

// ---- Radar de percepción: las 10 señales como abanico de visión -------------
// Muestra de un vistazo QUÉ VE Connect en la empresa: cada eje es un filtro;
// cuanto más lejos del centro, más fuerte la señal. Verde fuerte / rojo débil.
const LEVEL_RADIUS = { green: 1, yellow: 0.6, grey: 0.32, red: 0.12 };
const LEVEL_COLOR = { green: "#3fb950", yellow: "#d4a72c", grey: "#6b7280", red: "#f04747" };

function perceptionRadar(opp) {
  const n = FILTERS.length;
  const cx = 90, cy = 90, R = 72;
  const pt = (i, r) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * r, cy + Math.sin(a) * R * r];
  };
  // Anillos de referencia.
  const rings = [0.25, 0.5, 0.75, 1].map((r) =>
    `<circle cx="${cx}" cy="${cy}" r="${(R * r).toFixed(1)}" fill="none" stroke="#2a2e37" stroke-width="1"/>`
  ).join("");
  // Ejes.
  const axes = FILTERS.map((_, i) => {
    const [x, y] = pt(i, 1);
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#2a2e37" stroke-width="1"/>`;
  }).join("");
  // Polígono de percepción + puntos de color por nivel.
  const coords = FILTERS.map((f, i) => {
    const lvl = opp.signals?.[f.key]?.level || "grey";
    return pt(i, LEVEL_RADIUS[lvl] ?? 0.32);
  });
  const poly = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dots = FILTERS.map((f, i) => {
    const lvl = opp.signals?.[f.key]?.level || "grey";
    const [x, y] = coords[i];
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${LEVEL_COLOR[lvl]}"/>`;
  }).join("");
  // Etiquetas cortas en cada eje.
  const labels = FILTERS.map((f, i) => {
    const [x, y] = pt(i, 1.18);
    const short = (f.label || "").split(" ")[0];
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="#9aa3b0" font-size="7.5" text-anchor="middle" dominant-baseline="middle">${esc(short)}</text>`;
  }).join("");
  return el("div", { class: "radar", html:
    `<svg viewBox="0 0 180 180" width="100%" height="auto" aria-label="Radar de percepción">
      ${rings}${axes}
      <polygon points="${poly}" fill="rgba(201,162,39,.18)" stroke="#c9a227" stroke-width="1.5"/>
      ${dots}${labels}
    </svg>` });
}

// ---- Lo que Connect "piensa": razonamiento sintetizado y legible -----------
function reasoningLine(opp) {
  const s = opp.scores;
  const greens = FILTERS.filter((f) => (opp.signals?.[f.key]?.level) === "green").map((f) => f.label.toLowerCase());
  const grises = FILTERS.filter((f) => (opp.signals?.[f.key]?.level || "grey") === "grey").map((f) => f.label.toLowerCase());
  const cls = s.classification;
  const casa = cls === "xn" ? "una transformación de fondo" : cls === "01" ? "un proyecto de entrada ágil" : cls === "unqualified" ? "un prospecto a enriquecer" : "un descarte";
  const fuerte = greens.length ? `Veo fuerza en ${greens.slice(0, 3).join(", ")}.` : "Aún no veo señales fuertes confirmadas.";
  const falta = grises.length ? ` Me falta confirmar ${grises.slice(0, 3).join(", ")}.` : "";
  const verdict = ` Lo leo como ${casa} (confianza ${s.confidence}).`;
  return `${fuerte}${falta}${verdict}`;
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
  ["proposal_sent", "Propuesta"],
  ["won", "Firmado"],
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
      ? `<a href="${esc(safeUrl(e.url))}" target="_blank" rel="noopener">${esc(e.source)}</a>`
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

// ---- Opportunity Decision Layer: la tira visible de cada card ----------------
// OCI + decisión + tag estratégico + las cuatro dimensiones + calidad de
// evidencia. Es el titular de valor: en 2 segundos sabes qué es y qué hacer.
function dimBar(label, value) {
  return el("div", { class: "dim" }, [
    el("span", { class: "dim-k", text: label }),
    el("span", { class: "dim-bar" }, [el("i", { style: `width:${Math.max(2, value)}%` })]),
    el("span", { class: "dim-v", text: String(value) }),
  ]);
}

// OCI HERO — el número de decisión principal de la card (sustituye al anillo de
// confianza como jerarquía). El índice de éxito y la confianza del motor viven
// en su tooltip: presentes para quien los busque, sin competir en reposo.
function ociHero(dec, s = {}) {
  const tone = dec.oci >= 66 ? "hot" : dec.oci >= 45 ? "warm" : "cold";
  const extra = [
    s.successIndex != null ? `Éxito ${s.successIndex}` : null,
    s.confidence != null ? `Conf. motor ${s.confidence}` : null,
  ].filter(Boolean).join(" · ");
  return el("div", {
    class: `oci-hero oci-${tone} dec-${dec.decision}`,
    title: `Opportunity Confidence Index ${dec.oci}/100 — ${dec.decisionLabel}: ${dec.decisionWhy}${extra ? `\n${extra}` : ""}`,
  }, [
    el("b", { class: "oci-num", text: String(dec.oci) }),
    el("span", { class: "oci-l", text: "OCI" }),
  ]);
}

// La tira de decisión: decisión + tag + evidencia + lente + las cuatro
// dimensiones. (El OCI ya no se repite aquí: vive como hero arriba.)
function decisionStrip(dec, opp) {
  const eq = dec.evidenceQuality;
  const lens = strategicLens(opp);
  return el("div", { class: `dec-strip dec-${dec.decision}` }, [
    el("div", { class: "dec-mid" }, [
      el("div", { class: "dec-row" }, [
        el("span", { class: `dec-chip dec-chip-${dec.decision}`, text: dec.decisionLabel, title: dec.decisionWhy }),
        el("span", { class: "dec-tag", text: dec.strategicTag.label }),
        lens ? el("span", { class: `lens-tag lens-${lens.code}`, title: "Lente estratégica", text: lens.label }) : null,
        el("span", { class: `eq eq-${eq.label}`, title: `${eq.confirmed} confirmadas · ${eq.indicative} indicios · ${eq.unknown} desconocidas`, text: `ev. ${eq.label}` }),
        dec.killRisk >= 50 ? el("span", { class: "kill-risk", text: `kill ${dec.killRisk}` }) : null,
      ]),
      el("div", { class: "dims" }, [
        dimBar("Fit", dec.dimensions.fit),
        dimBar("Pain", dec.dimensions.pain),
        dimBar("Timing", dec.dimensions.timing),
        dimBar("Access", dec.dimensions.access),
      ]),
    ]),
  ]);
}

// (La fila de cuatro chips Operator en reposo se sustituyó por un solo control
// discreto en el clúster de la card —ver c-operator en `top`— que abre el drawer
// con Defender/Matar/Ángulo/Brief. Menos ruido, mismo acceso.)

// Enriquecimiento web: una línea discreta. Si la web ya se leyó, muestra el
// estado citado ("✓ Web leída · N señales"); si no, un botón para leerla.
function buildEnrichRow(opp, handlers) {
  const e = handlers.leadEnrichment ? handlers.leadEnrichment(opp.id) : { enriched: false, count: 0, at: null };
  const btn = el("button", {
    class: `enrich-btn ${e.enriched ? "is-done" : ""}`,
    title: e.enriched ? "Volver a leer su web" : "Leer su web y convertir lo que afirma en evidencia citada",
    text: e.enriched ? "↻ Re-leer web" : "↻ Enriquecer web",
  });
  btn.addEventListener("click", (ev) => { ev.stopPropagation(); handlers.onEnrich(opp.id, btn); });
  const status = e.enriched
    ? el("span", { class: "enrich-state", text: `✓ Web leída · ${e.count} señal${e.count === 1 ? "" : "es"} citada${e.count === 1 ? "" : "s"}` })
    : null;
  return el("div", { class: "enrich-row" }, [status, btn]);
}

/**
 * @param {object} opp        Scored opportunity (with .scores and .ranking)
 * @param {object} record     Tracking record { status, notes }
 * @param {object} handlers   { onStatus, onNotes, onOutcome }
 */
export function renderCard(opp, record, handlers = {}) {
  const s = opp.scores;
  const dec = decide(opp, s || {});
  const sector = SECTOR_BY_KEY[opp.sector]?.label || opp.sector;
  const status = record?.status || "not_called";
  const dm = opp.decisionMaker || {};
  // Modo lectura (viewer/analyst): sin handlers de mutación → no pintamos los
  // controles que escriben (estado, notas, resultado, verificación). El usuario
  // ve todo el análisis pero no puede tocar la mesa compartida.
  const readOnly = !handlers.onStatus && !handlers.onNotes && !handlers.onOutcome && !handlers.onVerify;

  // ---- TOP: rank · identity · class pill · confidence ring ----
  // Entrar en el caso: el título (y el botón ⤢) abren la vista a pantalla
  // completa. Si no hay onOpen (p.ej. ya dentro de la propia vista de caso), el
  // título se comporta como texto normal.
  const openCase = handlers.onOpen ? () => handlers.onOpen(opp.id) : null;
  const top = el("div", { class: "c-top" }, [
    el("div", { class: "c-rank" }, [
      s.confidence >= 90 ? el("span", { class: "rank-crown", text: "★" }) : null,
      el("span", { text: `#${opp.ranking ?? "—"}` }),
    ]),
    el("div", { class: "c-ident" }, [
      el("h3", { class: openCase ? "c-title-open" : "", title: openCase ? "Abrir el caso a pantalla completa" : null, text: opp.company, onClick: openCase || undefined }),
      el("p", { class: "c-sub", text: `${opp.subsector} · ${opp.city}` }),
      // Foco radical en reposo: solo casa (01/XN) y facilidad de contacto. El
      // éxito y la confianza del motor viven en el tooltip del OCI; ya no compiten.
      el("div", { class: "c-tags" }, [
        el("span", { class: `pillc pillc-${s.classification}`, text: classLabel(s.classification) }),
        (() => { const cd = connectionDifficulty(opp); return el("span", {
          class: `conn conn-${cd.level}`,
          title: `${cd.label} — ${cd.advice}${cd.channels.length ? "\nCanales: " + cd.channels.join(", ") : ""}`,
          text: cd.icon,
        }); })(),
      ]),
    ]),
    ociHero(dec, s),
    // Operator: un solo control discreto en el clúster de la card (abre el drawer
    // con Defender/Matar/Ángulo/Brief). Sustituye a los cuatro chips en reposo.
    handlers.onOperator ? el("button", { class: "c-operator", title: "Operator — defender · matar · ángulo · brief", text: "▸", onClick: (e) => { e.stopPropagation(); handlers.onOperator(opp.id, "explain"); } }) : null,
    openCase ? el("button", { class: "c-open", title: "Abrir el caso a pantalla completa", text: "⤢", onClick: openCase }) : null,
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
            el("span", { class: `svc-house svc-house-${sv.house}`, text: sv.house === "xn" ? "Profunda" : "Ágil" }),
            el("span", { class: "svc-name", text: sv.name }),
            el("span", { class: "svc-ticket", text: ticketLabel(SERVICE_BY_ID[sv.id]) }),
          ])
        )),
      ])
    : null;

  // ---- ACTION STRIP: offer + contact + quick status ----
  // Foco radical en reposo: la oferta (una línea) y el contacto bastan para
  // decidir y marcar. El guion verbatim y los generadores de documento son
  // contenido de ejecución de llamada — se construyen aquí pero se revelan
  // dentro de "Ver análisis completo".
  const scriptBlock = el("div", { class: "open-line" }, [
    el("blockquote", { text: opp.callOpening }),
    copyBtn(opp.callOpening),
  ]);
  const docActions = (handlers.onPlaybook || handlers.onProposal)
    ? el("div", { class: "doc-actions" }, [
        handlers.onPlaybook
          ? el("button", { class: "pb-trigger", text: "📞 Guion + dossier", title: "Qué decir y qué mandar", onClick: () => handlers.onPlaybook(opp.id) })
          : null,
        handlers.onProposal
          ? el("button", { class: "pb-trigger pb-trigger-proposal", text: "✎ Propuesta", title: "Genera la propuesta lista para enviar (cierra agendando el diagnóstico)", onClick: () => handlers.onProposal(opp.id) })
          : null,
      ])
    : null;

  const action = el("div", { class: "c-action" }, [
    el("div", { class: "offer-line" }, [
      el("span", { class: "offer-ic", text: "→" }),
      el("span", { class: "offer-txt", text: offerText(opp.suggestedOfferKey) }),
    ]),
    el("div", { class: "contact-line" }, [
      // Decisor: si hay LinkedIn personal, el nombre es el enlace.
      dm.linkedin
        ? el("a", { class: "ct-dm", href: linkedinUrl(dm.linkedin), target: "_blank", rel: "noopener", title: "LinkedIn del decisor", html: `<b>${esc(dm.name || "—")}</b>${dm.role ? ` · ${esc(dm.role)}` : ""}` })
        : el("span", { class: "ct", html: `<b>${esc(dm.name || "—")}</b>${dm.role ? ` · ${esc(dm.role)}` : ""}` }),
      opp.phone ? el("a", {
        class: "ct-link ct-call", href: `tel:${esc(opp.phone.replace(/\s/g, ""))}`, title: "Llamar (marca el toque automáticamente)", text: `☎ ${opp.phone}`,
        // Captura automática del toque: al llamar, si el lead está sin tocar, se
        // marca "llamado" solo. El usuario no registra nada a mano.
        onClick: (handlers.onStatus && status === "not_called") ? () => handlers.onStatus(opp.id, "called") : undefined,
      }) : null,
      opp.email ? el("a", { class: "ct-link", href: `mailto:${esc(opp.email)}`, title: opp.email, text: "✉ email" }) : null,
      opp.website ? ctLink("🌐 web", webUrl(opp.website), opp.website) : null,
      ctLink("📍 Maps", mapsUrl(opp), "Buscar en Google Maps"),
      opp.linkedin ? ctLink("in empresa", linkedinUrl(opp.linkedin), "LinkedIn de la empresa") : null,
      opp.instagram ? ctLink(`◎ ${opp.instagram}`, instagramUrl(opp.instagram), "Instagram") : null,
    ]),
    readOnly ? null : quickStatus(opp, status, handlers),
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

  // operational: notes + learning form (solo si puedes escribir)
  const notes = el("textarea", { class: "notes", placeholder: "Notas tras la llamada…", onChange: (e) => handlers.onNotes?.(opp.id, e.target.value), readonly: readOnly });
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

  // Radar de percepción + lo que Connect "piensa" + la lente del sector.
  const lens = lensLabel(opp.sector);
  const radarBlock = el("div", { class: "sec radar-sec" }, [
    el("h4", { text: "Radar de percepción — qué ve Connect" }),
    el("div", { class: "radar-wrap" }, [
      perceptionRadar(opp),
      el("div", {}, [
        el("p", { class: "reasoning", html: `<span class="reason-ic">🧠</span> ${esc(reasoningLine(opp))}` }),
        lens ? el("p", { class: "lens-line", html: `<span class="lens-ic">🔬</span> Lente ${esc(lens)}` }) : null,
      ]),
    ]),
  ]);

  const detail = el("details", { class: "c-detail" }, [
    el("summary", {}, [el("span", { text: "Ver análisis completo" }), el("span", { class: "diag", text: explainScore(s) })]),
    // Foco radical: lo secundario vive aquí dentro, no en reposo.
    decisionStrip(dec, opp),
    // Guion de apertura + generadores de documento: ejecución de llamada, no
    // triaje. Viven en el detalle, justo donde el usuario los necesita.
    scriptBlock,
    docActions,
    freshBadge,
    metrics,
    serviceBlock,
    radarBlock,
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
    dec.killReasons.length ? sec("Kill reasons — por qué NO perseguirlo", bullets(dec.killReasons.map((k) => k.label))) : null,
    sec("Razones para NO llamar", bullets(opp.reasonsNotToCall)),
    sec("Qué invalidaría la tesis", bullets(opp.invalidators)),
    readOnly ? null : verificationBlock(opp, handlers),
    handlers.onSaveCall || (handlers.getCalls?.(opp.id) || []).length ? blackBoxSection(opp, handlers, readOnly) : null,
    sec("Notas", notes),
    readOnly ? null : el("div", { class: "ops-detail" }, [
      el("p", { class: "learn-auto", html: "<b>El sistema aprende solo.</b> Marca el resultado con un toque arriba (Interesado · Reunión · Rechazado) y recalibra la puntuación automáticamente — sin formularios." }),
      el("button", { class: "btn-learn", text: "Añadir detalle de la llamada (opcional)", onClick: () => learnBox.classList.toggle("open") }),
      learnBox,
    ]),
    el("div", { class: "sec-meta", text: `Sector: ${sector}${opp.synthetic ? " · datos demo" : opp.researched ? " · investigado" : ""}` }),
  ]);

  // Próxima mejor acción: una recomendación clara por lead, siempre visible.
  const nba = getNextBestAction(
    opp,
    handlers.getCalls?.(opp.id) || [],
    handlers.getLeadTasks?.(opp.id) || [],
    { status, today: new Date().toISOString().slice(0, 10) }
  );
  // Pulsable cuando hay handler (rol con escritura); si no, informativo.
  const nbaClickable = !!handlers.onNextAction;
  const nbaPill = el(nbaClickable ? "button" : "div", {
    class: `nba nba-${nba.action} ${nbaClickable ? "nba-btn" : ""}`,
    title: nba.why,
    onClick: nbaClickable ? (e) => { e.stopPropagation(); handlers.onNextAction(opp.id, nba.action); } : undefined,
  }, [
    el("span", { class: "nba-label", text: `▶ ${nba.label}` }),
    el("span", { class: "nba-why", text: nba.why }),
  ]);

  // Enriquecimiento web honesto: control discreto solo si el lead tiene web y el
  // rol puede escribir. Si ya se leyó, muestra estado citado en vez del botón.
  const enrichRow = (opp.website && handlers.onEnrich) ? buildEnrichRow(opp, handlers) : null;

  // Destacado de élite: leads de máxima puntuación / "llamar de inmediato".
  const elite = s.confidence >= 90 ? "card-elite" : s.recommendation === "call_immediately" ? "card-priority" : "";
  // Foco radical: en reposo solo lo esencial (identidad + éxito + gancho +
  // acción). El resto se revela al abrir "Ver análisis completo".
  return el("article", { class: `card prio-${s.callPriority} st-${status} ${elite}`, dataset: { id: opp.id } }, [
    top,
    hook,
    action,
    nbaPill,
    enrichRow,
    failurePanel,
    detail,
  ]);
}

// ---- Caja Negra Comercial: historial de llamadas + análisis con IA ----------
// Dentro de cada lead: las llamadas hechas, un formulario para registrar una
// nueva (canal · duración · resultado · transcripción), un botón para analizarla
// con IA (Gemini → fallback local) y el resultado estructurado + el mensaje de
// seguimiento listo para copiar. Es el núcleo de "convertir llamadas en datos".
export function blackBoxSection(opp, handlers, readOnly) {
  const calls = (handlers.getCalls?.(opp.id) || []);
  const wrap = el("div", { class: "sec blackbox" }, [
    el("h4", { text: `Caja Negra · llamadas (${calls.length})` }),
  ]);

  // Historial de llamadas (lo más reciente arriba).
  const list = el("div", { class: "bb-calls" });
  const paint = () => {
    list.innerHTML = "";
    const cs = handlers.getCalls?.(opp.id) || [];
    if (!cs.length) { list.appendChild(el("p", { class: "bb-empty", text: "Aún no hay llamadas registradas." })); return; }
    for (const c of cs) list.appendChild(callRow(c, handlers, readOnly, paint));
  };
  paint();
  wrap.appendChild(list);

  if (readOnly) return wrap;

  // Formulario para registrar + analizar una nueva llamada.
  const channel = el("select", { class: "bb-f" }, Object.entries(CALL_CHANNELS).map(([k, v]) => el("option", { value: k, text: v })));
  const result = el("select", { class: "bb-f" }, Object.entries(CALL_RESULTS).map(([k, v]) => el("option", { value: k, text: v })));
  const dur = el("input", { class: "bb-f bb-dur", type: "number", min: "0", placeholder: "min" });
  const transcript = el("textarea", { class: "bb-transcript", placeholder: "Pega aquí la transcripción de la llamada…" });

  const resultBox = el("div", { class: "bb-analysis" });
  let pending = null; // análisis ya calculado, a la espera de guardar

  const analyzeBtn = el("button", {
    class: "btn", text: "Analizar con IA",
    onClick: async () => {
      const text = transcript.value.trim();
      if (!text) { resultBox.innerHTML = ""; resultBox.appendChild(el("p", { class: "bb-empty", text: "Pega una transcripción primero." })); return; }
      analyzeBtn.disabled = true; analyzeBtn.textContent = "Analizando…";
      try {
        const ctx = { leadName: opp.decisionMaker?.name || opp.company, sector: opp.sector, classification: opp.scores?.classification };
        const { analysis, ai } = await handlers.onAnalyzeCall(text, ctx);
        pending = analysis;
        resultBox.innerHTML = "";
        resultBox.appendChild(renderAnalysis(analysis, ai));
      } catch {
        resultBox.innerHTML = "";
        resultBox.appendChild(el("p", { class: "bb-empty", text: "No se pudo analizar. Inténtalo de nuevo." }));
      } finally {
        analyzeBtn.disabled = false; analyzeBtn.textContent = "Analizar con IA";
      }
    },
  });

  const saveBtn = el("button", {
    class: "btn-primary", text: "Guardar llamada",
    onClick: () => {
      const text = transcript.value.trim();
      if (!text && !pending) { return; }
      handlers.onSaveCall?.(opp.id, {
        channel: channel.value,
        result: result.value,
        durationMin: Number(dur.value) || 0,
        transcript: text,
        analysis: pending,
        leadSector: opp.sector || null,
      });
      // Limpia el formulario y repinta el historial.
      transcript.value = ""; dur.value = ""; pending = null; resultBox.innerHTML = "";
      paint();
      saveBtn.textContent = "✓ Guardada";
      setTimeout(() => (saveBtn.textContent = "Guardar llamada"), 1500);
    },
  });

  wrap.appendChild(el("div", { class: "bb-form" }, [
    el("div", { class: "bb-meta" }, [channel, result, dur]),
    transcript,
    el("div", { class: "bb-actions" }, [analyzeBtn, saveBtn]),
    resultBox,
  ]));
  return wrap;
}

// Una llamada del historial: cabecera (fecha · canal · resultado) + resumen.
function callRow(c, handlers, readOnly, repaint) {
  const a = c.analysis || {};
  const when = (c.at || "").slice(0, 10);
  const head = el("div", { class: "bb-row-head" }, [
    el("span", { class: "bb-when", text: when }),
    el("span", { class: "bb-chan", text: CALL_CHANNELS[c.channel] || c.channel }),
    el("span", { class: `bb-res bb-res-${c.result}`, text: CALL_RESULTS[c.result] || c.result }),
    c.durationMin ? el("span", { class: "bb-dur-tag", text: `${c.durationMin}m` }) : null,
    typeof a.closeProbability === "number" ? el("span", { class: "bb-close", text: `cierre ${a.closeProbability}%` }) : null,
    readOnly ? null : el("button", { class: "bb-del", title: "Borrar", text: "×", onClick: () => { handlers.onRemoveCall?.(c.id); repaint(); } }),
  ]);
  const body = el("details", { class: "bb-row-detail" }, [
    el("summary", { text: a.summary || "Ver detalle de la llamada" }),
    a.analysis || a.summary ? renderAnalysis(a, a.engine === "gemini") : el("p", { class: "bb-empty", text: "Llamada sin análisis." }),
  ]);
  return el("div", { class: "bb-row" }, [head, body]);
}

// Render del dossier estructurado de una llamada.
function renderAnalysis(a, ai) {
  if (!a) return el("p", { class: "bb-empty", text: "Sin análisis." });
  const chips = (title, arr, cls = "") => (arr && arr.length)
    ? el("div", { class: "bb-block" }, [el("h5", { text: title }), el("div", { class: `bb-chips ${cls}` }, arr.map((x) => el("span", { class: "bb-chip", text: typeof x === "string" ? x : (x.label || x.objection || x.pain || JSON.stringify(x)) })))])
    : null;
  const para = (title, txt) => txt ? el("div", { class: "bb-block" }, [el("h5", { text: title }), el("p", { text: txt })]) : null;
  const s = a.scores || {};
  return el("div", { class: "bb-dossier" }, [
    el("div", { class: "bb-engine", text: ai ? "Análisis IA (Gemini)" : "Análisis local (determinista)" }),
    el("div", { class: "bb-scores" }, [
      scorePill("Interés", s.interest), scorePill("Encaje", s.fit), scorePill("Cierre", s.close ?? a.closeProbability),
    ]),
    para("Resumen", a.summary),
    para("Qué quiere de verdad", a.wants),
    chips("Dolores", a.pains, "pain"),
    chips("Objeciones", a.objections, "obj"),
    chips("Señales de compra", a.buySignals, "buy"),
    chips("Señales de pérdida", a.lossSignals, "loss"),
    chips("Lo que no dice (inferido)", a.inferred),
    chips("Servicios que encajan", a.services, "svc"),
    a.authority ? para("Autoridad de decisión", a.authority) : null,
    a.budget ? para("Presupuesto mencionado", a.budget) : null,
    a.urgency ? para("Urgencia", a.urgency) : null,
    para("Siguiente paso", a.nextStep),
    chips("Aprendizajes", a.learnings),
    a.followUp ? el("div", { class: "bb-block bb-followup" }, [
      el("h5", { text: "Mensaje de seguimiento" }),
      el("p", { class: "bb-fu-text", text: a.followUp }),
      copyBtn(a.followUp, "Copiar mensaje"),
    ]) : null,
  ]);
}

function scorePill(label, v) {
  const n = typeof v === "number" ? v : 0;
  const tone = n >= 70 ? "hot" : n >= 45 ? "warm" : "cold";
  return el("span", { class: `bb-score bb-score-${tone}` }, [
    el("b", { text: String(n) }),
    el("span", { class: "bb-score-l", text: label }),
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
        sector: opp.sector || null,
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
