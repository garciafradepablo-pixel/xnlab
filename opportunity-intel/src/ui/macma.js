// =============================================================================
// ui/macma.js — MACMA CORE. La sección privada dentro de Connect.
//
// No es un dashboard ni un CRM: es el mapa interno del operador. Al entrar, la
// sensación buscada es "estoy entrando en mi propia mente" — oscuro, atmosférico,
// con profundidad. La pieza central es el ORBE: la representación viva del modelo
// de identidad en diez dimensiones. Alrededor, cinco módulos: biografía (la
// materia prima), patrones, conflictos, y el reto del día.
//
// Sin dependencias del módulo de app (sin ciclos): lo de fuera entra por
// parámetro (me, rerender). La lógica vive en macma.js (datos) y macma-engine.js
// (lectura). Aquí solo se pinta. La voz reutiliza la Web Speech API del navegador
// (la misma infraestructura que EC · Eco), con punto de integración documentado.
// =============================================================================

import { el, clear } from "./dom.js";
import * as macma from "../macma.js";
import { DIMENSIONS, DIM_BY_KEY, scoreBiography, analyzePatterns, analyzeConflict, dailyChallenge } from "../macma-engine.js";

const today = () => new Date().toISOString().slice(0, 10);

// Estado efímero de la vista (qué pestaña interna, borradores). No persiste:
// lo durable vive en macma.js. Se reinicia con cada montaje de Connect.
const ui = { tab: "core", bioAngle: "free", bioDraft: "", conflictDraft: "", conflictTitle: "" };

const MODULES = [
  ["core", "Núcleo"],
  ["identity", "Biografía"],
  ["patterns", "Patrones"],
  ["conflict", "Conflictos"],
  ["daily", "Hoy"],
];

/** Vista raíz de MACMA CORE. `me` es el usuario en sesión; `rerender` repinta. */
export function macmaView({ me, rerender }) {
  macma.ensureProfile(me);
  const root = el("section", { class: "macma" });

  // Cabecera editorial: el nombre del sistema y su tesis, en voz baja.
  root.appendChild(el("div", { class: "macma-head" }, [
    el("div", { class: "macma-kicker", text: "SISTEMA OPERATIVO HUMANO" }),
    el("h1", { class: "macma-title", text: "MACMA CORE" }),
    el("p", { class: "macma-sub", text: "Tu mapa interno. No mide lo que hiciste — observa en quién te has convertido. Un espejo para reflexionar, no un veredicto." }),
  ]));

  // Navegación interna (módulos).
  const nav = el("nav", { class: "macma-nav" }, MODULES.map(([key, label]) =>
    el("button", {
      class: `macma-tab ${ui.tab === key ? "active" : ""}`,
      text: label,
      onClick: () => { ui.tab = key; rerender(); },
    })
  ));
  root.appendChild(nav);

  const body = el("div", { class: "macma-body" });
  if (ui.tab === "core") body.appendChild(coreModule(me, rerender));
  else if (ui.tab === "identity") body.appendChild(identityModule(me, rerender));
  else if (ui.tab === "patterns") body.appendChild(patternsModule(me, rerender));
  else if (ui.tab === "conflict") body.appendChild(conflictModule(me, rerender));
  else if (ui.tab === "daily") body.appendChild(dailyModule(me, rerender));
  root.appendChild(body);

  return root;
}

// Lectura del modelo: se deriva en vivo de la biografía (no se almacena un número
// "objetivo" — es una lectura, cambia con la materia prima). [IA] aquí entrará el modelo.
function readModel(me) {
  const bios = macma.getBios(me);
  const score = scoreBiography(bios);
  const patterns = analyzePatterns(score, bios);
  return { bios, score, patterns };
}

// ===========================================================================
// MÓDULO 2 (central) — EL ORBE. La representación viva del modelo de identidad.
// ===========================================================================
function coreModule(me, rerender) {
  const wrap = el("div", { class: "macma-core-grid" });
  const { score, patterns, bios } = readModel(me);
  const corpus = macma.corpus(me);

  wrap.appendChild(orbPanel(score));

  // Lateral: confianza de lectura y atajos a alimentar el modelo.
  const side = el("div", { class: "macma-core-side" });
  side.appendChild(el("div", { class: "macma-conf" }, [
    el("span", { class: "macma-conf-label", text: "Confianza de lectura" }),
    el("div", { class: "macma-conf-bar" }, [el("span", { class: `macma-conf-fill conf-${score.level}`, style: `width:${score.confidence}%` })]),
    el("span", { class: "macma-conf-level", text: `${score.level.toUpperCase()} · ${corpus.words} palabras de biografía` }),
  ]));

  if (corpus.entries === 0) {
    side.appendChild(el("div", { class: "macma-empty-call" }, [
      el("p", { text: "El orbe nace neutro. Cobra forma cuando le cuentas tu historia: no es un test, es un relato." }),
      el("button", { class: "macma-btn primary", text: "Empezar mi biografía →", onClick: () => { ui.tab = "identity"; rerender(); } }),
    ]));
  } else {
    // Las tres lecturas que más se notan, en miniatura.
    side.appendChild(el("h3", { class: "macma-side-h", text: "Lo que más se observa" }));
    patterns.strengths.forEach((s) => side.appendChild(miniReading("Fortaleza probable", s.label, "up")));
    side.appendChild(miniReading("Cuello de botella", patterns.bottleneck.label, "down"));
    side.appendChild(el("button", { class: "macma-btn ghost", text: "Ver patrones completos →", onClick: () => { ui.tab = "patterns"; rerender(); } }));
  }
  wrap.appendChild(side);
  return wrap;
}

function miniReading(tag, label, dir) {
  return el("div", { class: `macma-mini macma-mini-${dir}` }, [
    el("span", { class: "macma-mini-tag", text: tag }),
    el("span", { class: "macma-mini-label", text: label }),
  ]);
}

// El orbe en SVG: un núcleo luminoso y diez rayos, uno por dimensión. La longitud
// y el brillo de cada rayo responden a su lectura. Respira (animación CSS suave).
function orbPanel(score) {
  const panel = el("div", { class: "macma-orb-panel" });
  const size = 360;
  const cx = size / 2, cy = size / 2;
  const rCore = 46;        // radio del núcleo
  const rMin = 64, rMax = 168; // radio interior/exterior de los rayos

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("class", "macma-orb");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Orbe de identidad: diez dimensiones observadas");

  // Definiciones: degradado del núcleo y resplandor.
  svg.innerHTML = `
    <defs>
      <radialGradient id="orbCore" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stop-color="#f0e3b8"/>
        <stop offset="38%" stop-color="#cba24a"/>
        <stop offset="100%" stop-color="#6e5417"/>
      </radialGradient>
      <radialGradient id="orbHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(203,162,74,.30)"/>
        <stop offset="60%" stop-color="rgba(155,128,240,.10)"/>
        <stop offset="100%" stop-color="rgba(10,12,15,0)"/>
      </radialGradient>
      <filter id="orbBlur"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${rMax + 6}" fill="url(#orbHalo)"/>
  `;

  // Anillos guía (tenues).
  for (const f of [0.4, 0.7, 1]) {
    const ring = document.createElementNS(ns, "circle");
    ring.setAttribute("cx", cx); ring.setAttribute("cy", cy);
    ring.setAttribute("r", rMin + (rMax - rMin) * f);
    ring.setAttribute("class", "macma-orb-ring");
    svg.appendChild(ring);
  }

  // Polígono que une las puntas: la silueta del modelo de un vistazo.
  const pts = DIMENSIONS.map((d, i) => {
    const ang = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
    const v = (score.scores[d.key] - 0) / 100;
    const r = rMin + (rMax - rMin) * v;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, ang, v, d];
  });
  const poly = document.createElementNS(ns, "polygon");
  poly.setAttribute("points", pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "));
  poly.setAttribute("class", "macma-orb-shape");
  svg.appendChild(poly);

  // Rayos + nodos + etiquetas por dimensión.
  for (const [x, y, ang, v, d] of pts) {
    const x0 = cx + Math.cos(ang) * rMin;
    const y0 = cy + Math.sin(ang) * rMin;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", x0.toFixed(1)); line.setAttribute("y1", y0.toFixed(1));
    line.setAttribute("x2", x.toFixed(1)); line.setAttribute("y2", y.toFixed(1));
    line.setAttribute("class", "macma-orb-ray");
    line.style.opacity = (0.35 + v * 0.55).toFixed(2);
    svg.appendChild(line);

    const node = document.createElementNS(ns, "circle");
    node.setAttribute("cx", x.toFixed(1)); node.setAttribute("cy", y.toFixed(1));
    node.setAttribute("r", (2.5 + v * 3.5).toFixed(1));
    node.setAttribute("class", "macma-orb-node");
    svg.appendChild(node);

    // Etiqueta: abreviatura + valor, alineada según el cuadrante.
    const lr = rMax + 16;
    const lx = cx + Math.cos(ang) * lr;
    const ly = cy + Math.sin(ang) * lr;
    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", lx.toFixed(1)); label.setAttribute("y", ly.toFixed(1));
    label.setAttribute("class", "macma-orb-label");
    label.setAttribute("text-anchor", Math.cos(ang) > 0.25 ? "start" : Math.cos(ang) < -0.25 ? "end" : "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.textContent = d.short;
    svg.appendChild(label);
  }

  // Núcleo luminoso (respira por CSS).
  const halo = document.createElementNS(ns, "circle");
  halo.setAttribute("cx", cx); halo.setAttribute("cy", cy); halo.setAttribute("r", rCore + 10);
  halo.setAttribute("class", "macma-orb-coreglow"); halo.setAttribute("filter", "url(#orbBlur)");
  svg.appendChild(halo);
  const core = document.createElementNS(ns, "circle");
  core.setAttribute("cx", cx); core.setAttribute("cy", cy); core.setAttribute("r", rCore);
  core.setAttribute("fill", "url(#orbCore)");
  core.setAttribute("class", "macma-orb-core");
  svg.appendChild(core);

  panel.appendChild(svg);
  panel.appendChild(el("p", { class: "macma-orb-foot", text: "Diez dimensiones observadas a partir de tu relato. Lecturas, no notas — se mueven cuando tu historia crece." }));

  // Leyenda compacta de las diez dimensiones con su valor.
  const legend = el("div", { class: "macma-legend" });
  DIMENSIONS.forEach((d) => legend.appendChild(el("div", { class: "macma-leg" }, [
    el("span", { class: "macma-leg-dot" }),
    el("span", { class: "macma-leg-name", text: d.label }),
    el("span", { class: "macma-leg-val", text: String(Math.round(score.scores[d.key])) }),
  ])));
  panel.appendChild(legend);
  return panel;
}

// ===========================================================================
// MÓDULO 1 — MOTOR DE IDENTIDAD. La biografía: escrita o hablada.
// ===========================================================================
function identityModule(me, rerender) {
  const wrap = el("div", { class: "macma-mod" });
  const profile = macma.getProfile(me);

  wrap.appendChild(moduleHead("Motor de identidad", "Tu perfil no se rellena: se cuenta. Escribe o habla un fragmento de tu historia. Cada pieza afina el reflejo."));

  // Selector de ángulo: guía sin encorsetar.
  const angle = macma.BIO_ANGLES.find((a) => a.kind === ui.bioAngle) || macma.BIO_ANGLES[0];
  const angles = el("div", { class: "macma-angles" }, macma.BIO_ANGLES.map((a) =>
    el("button", {
      class: `macma-angle ${ui.bioAngle === a.kind ? "active" : ""}`,
      text: a.label,
      onClick: () => { ui.bioAngle = a.kind; rerender(); },
    })
  ));
  wrap.appendChild(angles);

  // Compositor: prompt + textarea + voz.
  const prompt = el("p", { class: "macma-prompt", text: angle.prompt });
  const ta = el("textarea", { class: "macma-textarea", placeholder: "Escribe aquí… o pulsa el micro y habla.", rows: "6" });
  ta.value = ui.bioDraft;
  ta.addEventListener("input", () => { ui.bioDraft = ta.value; });

  const micStatus = el("span", { class: "macma-mic-status" });
  const micBtn = micButton(ta, micStatus, () => { ui.bioDraft = ta.value; });

  const save = el("button", {
    class: "macma-btn primary",
    text: "Guardar en mi biografía",
    onClick: () => {
      const recording = micBtn.classList.contains("on");
      const r = macma.addBio(me, { kind: ui.bioAngle, prompt: angle.prompt, text: ta.value, source: recording ? "voice" : "text" });
      if (r) { ui.bioDraft = ""; stopAnyRec(); rerender(); }
    },
  });

  wrap.appendChild(el("div", { class: "macma-composer" }, [
    prompt,
    ta,
    el("div", { class: "macma-composer-bar" }, [micBtn, micStatus, save]),
  ]));

  // Estado de la voz: enlace con la infraestructura de Voz de Connect.
  wrap.appendChild(voiceStatus(me, profile, rerender));

  // Línea de vida: las entradas guardadas.
  const bios = macma.getBios(me);
  wrap.appendChild(el("h3", { class: "macma-side-h", text: `Tu relato${bios.length ? ` · ${bios.length}` : ""}` }));
  if (!bios.length) {
    wrap.appendChild(el("p", { class: "macma-faint", text: "Aún no has contado nada. Empieza por donde quieras — el orden no importa." }));
  } else {
    const list = el("div", { class: "macma-bios" });
    bios.forEach((b) => list.appendChild(bioCard(b, me, rerender)));
    wrap.appendChild(list);
  }
  return wrap;
}

function bioCard(b, me, rerender) {
  const angle = macma.ANGLE_BY_KIND[b.kind];
  return el("div", { class: "macma-bio" }, [
    el("div", { class: "macma-bio-meta" }, [
      el("span", { class: "macma-bio-kind", text: angle?.label || "Libre" }),
      b.source === "voice" ? el("span", { class: "macma-bio-voice", text: "🎙 voz" }) : null,
      el("span", { class: "macma-bio-time", text: fmtDate(b.createdAt) }),
      el("button", { class: "macma-bio-x", text: "✕", title: "Eliminar", onClick: () => { if (confirm("¿Eliminar esta entrada de tu biografía?")) { macma.removeBio(me, b.id); rerender(); } } }),
    ]),
    el("p", { class: "macma-bio-text", text: b.text }),
  ]);
}

// Estado de la voz — investiga y conecta con la infraestructura existente.
// EC · Eco (voice.js) ya usa la Web Speech API del navegador; MACMA reutiliza la
// MISMA API para dictar la biografía (transcripción local, sin clave, gratis).
// El "enlace" registra la intención de que, cuando el backend de Voz ID de
// Connect (función `eco`) acepte contexto, las notas de voz de MACMA fluyan ahí.
function voiceStatus(me, profile, rerender) {
  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const linked = profile?.voiceLinked;
  return el("div", { class: "macma-voice-status" }, [
    el("span", { class: `macma-voice-dot ${supported ? "ok" : "off"}` }),
    el("span", { class: "macma-voice-text", html: supported
      ? `Dictado por voz <b>activo</b> en este navegador (Web Speech API — la misma base que EC · Eco). ${linked ? "Voz ID enlazada." : "Enlaza con Voz ID para enviar tus notas a tu eco."}`
      : "Tu navegador no soporta dictado por voz. Puedes escribir; la voz quedará lista para cuando lo soporte." }),
    supported && !linked ? el("button", { class: "macma-btn ghost sm", text: "Enlazar Voz ID", onClick: () => { macma.setVoiceLinked(me, true); rerender(); } }) : null,
  ]);
}

// ===========================================================================
// MÓDULO 3 — ANÁLISIS DE PATRONES.
// ===========================================================================
function patternsModule(me, rerender) {
  const wrap = el("div", { class: "macma-mod" });
  const { score, patterns } = readModel(me);
  const corpus = macma.corpus(me);

  wrap.appendChild(moduleHead("Análisis de patrones", "Patrones observados a partir de tu relato. No es un diagnóstico — son tendencias para mirar con honestidad."));

  if (corpus.entries === 0) {
    wrap.appendChild(emptyCall("Sin biografía no hay patrones que leer.", "Contar mi historia →", () => { ui.tab = "identity"; rerender(); }));
    return wrap;
  }
  if (patterns.tentative) {
    wrap.appendChild(el("div", { class: "macma-note" }, [el("span", { text: "Lectura todavía tentativa: hay poca materia prima. Cuanto más cuentes, más se afina. Trátalo como una hipótesis, no como una conclusión." })]));
  }

  const grid = el("div", { class: "macma-patterns" });
  patterns.strengths.forEach((s, i) => grid.appendChild(patternCard(i === 0 ? "Fortaleza dominante" : "Segunda fortaleza", s.label, s.line, "good")));
  grid.appendChild(patternCard("Cuello de botella actual", patterns.bottleneck.label, patterns.bottleneck.line, "warn"));
  grid.appendChild(patternCard("Riesgo oculto", patterns.risk.label, patterns.risk.line, "risk"));
  grid.appendChild(patternCard("Punto ciego actual", patterns.blindSpot.label, patterns.blindSpot.line, "blind"));
  grid.appendChild(patternCard("Oportunidad de crecimiento", patterns.opportunity.label, patterns.opportunity.line, "grow"));
  grid.appendChild(patternCard("Siguiente habilidad sugerida", patterns.nextSkill.label, patterns.nextSkill.line, "skill"));
  wrap.appendChild(grid);

  wrap.appendChild(el("p", { class: "macma-faint center", text: "MACMA observa; no define. Estas lecturas son un espejo para pensar, no una etiqueta sobre quién eres." }));
  return wrap;
}

function patternCard(tag, label, line, tone) {
  return el("div", { class: `macma-pat macma-pat-${tone}` }, [
    el("span", { class: "macma-pat-tag", text: tag }),
    el("span", { class: "macma-pat-label", text: label }),
    el("p", { class: "macma-pat-line", text: line }),
  ]);
}

// ===========================================================================
// MÓDULO 4 — MOTOR DE CONFLICTOS. Claridad, no validación.
// ===========================================================================
function conflictModule(me, rerender) {
  const wrap = el("div", { class: "macma-mod" });
  wrap.appendChild(moduleHead("Motor de conflictos", "Describe un conflicto — socio, equipo, liderazgo, comunicación. MACMA separa hechos de supuestos y propone una conversación. El objetivo es claridad, no darte la razón."));

  const title = el("input", { class: "macma-input", placeholder: "Título corto (opcional): ej. Reparto con mi socio" });
  title.value = ui.conflictTitle;
  title.addEventListener("input", () => { ui.conflictTitle = title.value; });

  const ta = el("textarea", { class: "macma-textarea", rows: "6", placeholder: "Cuéntalo concreto: qué pasó, quién dijo o hizo qué, y qué sentiste. Cuanto más detalle, mejor el reflejo." });
  ta.value = ui.conflictDraft;
  ta.addEventListener("input", () => { ui.conflictDraft = ta.value; });

  const micStatus = el("span", { class: "macma-mic-status" });
  const micBtn = micButton(ta, micStatus, () => { ui.conflictDraft = ta.value; });

  const analyze = el("button", {
    class: "macma-btn primary",
    text: "Analizar conflicto",
    onClick: () => {
      const analysis = analyzeConflict(ta.value);
      if (analysis.tooShort) { micStatus.textContent = analysis.hint; return; }
      macma.addConflict(me, { title: ui.conflictTitle, text: ta.value, analysis });
      ui.conflictDraft = ""; ui.conflictTitle = ""; stopAnyRec(); rerender();
    },
  });

  wrap.appendChild(el("div", { class: "macma-composer" }, [
    title, ta,
    el("div", { class: "macma-composer-bar" }, [micBtn, micStatus, analyze]),
  ]));

  const conflicts = macma.getConflicts(me);
  if (conflicts.length) {
    wrap.appendChild(el("h3", { class: "macma-side-h", text: `Conflictos analizados · ${conflicts.length}` }));
    conflicts.forEach((c) => wrap.appendChild(conflictCard(c, me, rerender)));
  }
  return wrap;
}

function conflictCard(c, me, rerender) {
  const a = c.analysis || {};
  const section = (tag, items, cls) => {
    if (!items || (Array.isArray(items) && !items.length)) return null;
    const list = Array.isArray(items)
      ? el("ul", { class: "macma-cf-list" }, items.map((it) => el("li", { text: it })))
      : el("p", { class: "macma-cf-p", text: items });
    return el("div", { class: `macma-cf-sec ${cls || ""}` }, [el("span", { class: "macma-cf-tag", text: tag }), list]);
  };
  return el("div", { class: "macma-cf" }, [
    el("div", { class: "macma-cf-head" }, [
      el("span", { class: "macma-cf-title", text: c.title || "Conflicto" }),
      el("span", { class: "macma-bio-time", text: fmtDate(c.createdAt) }),
      el("button", { class: "macma-bio-x", text: "✕", title: "Eliminar", onClick: () => { if (confirm("¿Eliminar este análisis?")) { macma.removeConflict(me, c.id); rerender(); } } }),
    ]),
    section("Hechos confirmados", a.facts && a.facts.length ? a.facts : ["No aparece un hecho verificable claro en tu relato. Antes de la conversación, intenta separar qué pasó (verificable) de qué crees que significó."], "fact"),
    section("Supuestos posibles", a.assumptions, "assume"),
    a.emotional && a.emotional.length ? section("Motores emocionales", [a.emotional.join(", ")], "emo") : null,
    a.operational && a.operational.length ? section("Motores operativos", [a.operational.join(", ")], "op") : null,
    section("Malentendido probable", a.misunderstanding, "mis"),
    section("Conversación recomendada", a.conversation, "talk"),
    section("Siguiente acción medible", a.action, "act"),
    a.note ? el("p", { class: "macma-faint", text: a.note }) : null,
  ]);
}

// ===========================================================================
// MÓDULO 5 — EVOLUCIÓN DIARIA. Un reto. Uno.
// ===========================================================================
function dailyModule(me, rerender) {
  const wrap = el("div", { class: "macma-mod" });
  const { score } = readModel(me);
  const date = today();
  const ch = dailyChallenge(me, score, date);
  const entry = macma.recordChallenge(me, date, ch); // idempotente: fija el reto del día.
  const dim = ch.dimension ? DIM_BY_KEY[ch.dimension] : null;
  const streak = macma.challengeStreak(me);

  wrap.appendChild(moduleHead("Evolución diaria", "Una mejora al día. No diez. No cincuenta. Una — pequeña, concreta, accionable."));

  wrap.appendChild(el("div", { class: `macma-daily ${entry.doneAt ? "done" : ""}` }, [
    el("div", { class: "macma-daily-top" }, [
      el("span", { class: "macma-daily-kicker", text: "HOY" }),
      dim ? el("span", { class: "macma-daily-dim", text: dim.label }) : el("span", { class: "macma-daily-dim", text: "Alimenta el modelo" }),
    ]),
    el("p", { class: "macma-daily-text", text: ch.text }),
    el("button", {
      class: `macma-btn ${entry.doneAt ? "ghost" : "primary"}`,
      text: entry.doneAt ? "✓ Hecho hoy — deshacer" : "Marcar como hecho",
      onClick: () => { macma.setChallengeDone(me, date, !entry.doneAt); rerender(); },
    }),
  ]));

  wrap.appendChild(el("div", { class: "macma-streak" }, [
    el("span", { class: "macma-streak-flame", text: "🔥" }),
    el("span", { class: "macma-streak-n", text: String(streak) }),
    el("span", { class: "macma-streak-label", text: streak === 1 ? "día de evolución" : "días de evolución" }),
  ]));

  // Historial reciente (los últimos cumplidos), tenue.
  const log = macma.getChallengeLog(me).filter((e) => e.doneAt).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (log.length) {
    wrap.appendChild(el("h3", { class: "macma-side-h", text: "Tus últimos pasos" }));
    const list = el("div", { class: "macma-daily-log" });
    log.forEach((e) => list.appendChild(el("div", { class: "macma-daily-logitem" }, [
      el("span", { class: "macma-daily-logdate", text: e.date }),
      el("span", { class: "macma-daily-logtext", text: e.text }),
    ])));
    wrap.appendChild(list);
  }
  return wrap;
}

// ---- Piezas compartidas -----------------------------------------------------
function moduleHead(title, sub) {
  return el("div", { class: "macma-modhead" }, [
    el("h2", { class: "macma-modtitle", text: title }),
    el("p", { class: "macma-modsub", text: sub }),
  ]);
}
function emptyCall(text, cta, onClick) {
  return el("div", { class: "macma-empty-call" }, [el("p", { text }), el("button", { class: "macma-btn primary", text: cta, onClick })]);
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return ""; }
}

// ---- Dictado por voz (Web Speech API) ---------------------------------------
// Reutiliza la misma API del navegador que EC · Eco (voice.js). Local, gratis,
// sin clave. Un único reconocedor activo a la vez en toda la vista de MACMA.
// [IA/Voz ID] Punto de integración: cuando el backend `eco` acepte contexto, el
// texto dictado aquí podrá enviarse al eco del usuario además de a su biografía.
let activeRec = null;
const SR = () => (typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null);

function micButton(textarea, status, onText) {
  const supported = !!SR();
  const btn = el("button", {
    class: "macma-mic",
    title: supported ? "Dictar por voz" : "Tu navegador no soporta dictado por voz",
    html: micSVG(),
    onClick: () => { if (!supported) { status.textContent = "Dictado no disponible en este navegador."; return; } toggleRec(textarea, btn, status, onText); },
  });
  if (!supported) btn.classList.add("disabled");
  return btn;
}

function toggleRec(textarea, btn, status, onText) {
  if (activeRec) { stopAnyRec(); btn.classList.remove("on"); status.textContent = ""; return; }
  const Ctor = SR();
  let finalText = textarea.value ? textarea.value + " " : "";
  const rec = new Ctor();
  activeRec = rec;
  rec.lang = "es-ES";
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (ev) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) finalText += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    textarea.value = (finalText + interim).replace(/\s+/g, " ").trimStart();
    onText?.();
  };
  rec.onerror = (ev) => {
    if (ev.error === "not-allowed" || ev.error === "service-not-allowed") status.textContent = "Permite el micrófono en el navegador para dictar.";
    stopAnyRec(); btn.classList.remove("on");
  };
  rec.onend = () => { if (activeRec === rec) { try { rec.start(); } catch { /* reinicio benigno */ } } };
  try { rec.start(); btn.classList.add("on"); status.textContent = "Escuchando…"; }
  catch { status.textContent = "No se pudo iniciar el micrófono."; activeRec = null; }
}

function stopAnyRec() {
  const rec = activeRec;
  activeRec = null;
  try { rec && rec.stop(); } catch { /* ya parado */ }
  document.querySelectorAll(".macma-mic.on").forEach((b) => b.classList.remove("on"));
}

function micSVG() {
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>';
}
