// =============================================================================
// app.js — Application shell. Wires the search-config panel, candidate
// pipeline, ranking table, filters, opportunity cards, export and the learning
// view together. No framework: explicit render functions over a small state.
// =============================================================================

import { el, $, clear, esc } from "./dom.js";
import { renderCard } from "./card.js";
import { runPipeline } from "../pipeline.js";
import { scoreOpportunity } from "../scoring.js";
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
import { allSectors, sectorByKey, addCustomSector, getCustomSectors, removeCustomSector } from "../customsectors.js";
import { discover } from "../discovery.js";
import { runBatch } from "../agent.js";
import * as auth from "../auth.js";
import * as xport from "../export.js";
import { pickTodayCalls, nextStep, pipelinePulse } from "../today.js";
import { buildPlaybook, playbookToText } from "../playbook.js";
import { buildProposal, proposalToText } from "../proposal.js";
import { dueFollowups, dueLabel } from "../followups.js";
import { fetchWebFreshness, webSignalsToVerifications } from "../enrichweb.js";
import { inferSector } from "../sectorinfer.js";
import { recordSearch, getInterests } from "../interests.js";
import { sectorPerformance, sectorRate } from "../sectorlearning.js";
import { autoProgress, AUTO_BAR } from "../autopilot.js";
import { can, isWriter, roleLabel, ROLES, ROLE_LABEL } from "../roles.js";

// Atajo de permisos del usuario en sesión. La UI oculta lo que no puedes hacer
// (UX); la seguridad real la imponen las Edge Functions (403). No te fíes solo
// de esto.
const allow = (action) => can(auth.currentRole(), action);

const state = {
  config: { ...DEFAULT_CONFIG, ...store.getSavedConfig({}) },
  results: null,
  dataset: "researched", // researched (empresas reales) | demo (sintético de prueba)
  // Arranca en "Hoy": abrir la app y saber al instante a quién llamar y por qué.
  view: "today", // today | cards | pipeline | table | crm | learning
  filters: { sector: "all", city: "all", classification: "all", priority: "all", minEvidence: 0, minConfidence: 0, minEvStrength: 0, search: "" },
};

let root;

export async function mount(rootEl) {
  root = rootEl;
  // Enlace de invitación: ?invite=Nombre → abre directo en "crear usuario".
  try { const inv = new URLSearchParams(location.search).get("invite"); if (inv) { state._invite = inv; if (!auth.currentUser()) state._authTab = "create"; } } catch { /* */ }
  // Puerta de acceso: sin sesión, mostramos login/registro. Cada usuario tiene
  // su color fijo y firma su actividad.
  if (!auth.currentUser()) {
    renderAuth();
    // Trae los colores ya en uso (otras cuentas / otros dispositivos) y repinta
    // la paleta: un color elegido por alguien deja de ofrecerse a nuevos usuarios.
    auth.syncRemoteColors().then(() => { if (!auth.currentUser()) renderAuth(); }).catch(() => {});
    return;
  }
  ensureSyncSubscription();
  ensureHotkeys(); // ⌘K disponible en toda la app
  auth.syncRemoteColors().then(() => render()).catch(() => {}); // colores de firma consistentes entre dispositivos (best-effort)
  purgeWeakUserLeads(); // limpia leads crudos de baja puntuación de versiones previas
  await recompute();
  render();

  // Reanuda el piloto automático si quedó en marcha (no para entre sesiones).
  if (autopilotState().on) { autoEmpty = 0; clearTimeout(autoTimer); autoTimer = setTimeout(autoTick, 1500); }

  // Revalida el rol contra el servidor (si un admin lo cambió) y repinta el
  // badge/controles. Después trae la mesa compartida. Ambos best-effort.
  auth.refreshSession().then((r) => { if (r && r.ok) render(); }).catch(() => {});
  store.startSharedSync().then((r) => { if (r && r.ok) recompute().then(render); }).catch(() => {});
}

// —— Indicador discreto de sincronización ————————————————————————————————————
const SYNC_LABEL = {
  syncing: "Guardando…",
  synced: "Sincronizado",
  offline: "Sin conexión · local",
  local: "Solo local",
  idle: "",
};
let syncSubscribed = false;
function ensureSyncSubscription() {
  if (syncSubscribed) return;
  syncSubscribed = true;
  store.onSyncState(updateSyncBadge); // parche en sitio, sin re-render completo
}
function updateSyncBadge(s) {
  if (!root) return;
  const node = root.querySelector(".sync-badge");
  if (!node) return;
  const label = SYNC_LABEL[s] || "";
  node.textContent = label;
  node.className = `sync-badge sync-${s}`;
  node.style.display = label ? "" : "none";
}

// ---- Puerta de acceso (login / crear usuario) ------------------------------
function renderAuth() {
  clear(root);
  const tab = state._authTab || "login";
  const msg = el("p", { class: "auth-msg" });

  const nameI = el("input", { class: "auth-f", placeholder: "Usuario", autocomplete: "username" });
  const passI = el("input", { class: "auth-f", type: "password", placeholder: "Contraseña", autocomplete: "current-password" });

  // Selector de color (solo al crear). Se muestran los 8 colores, pero los que
  // ya pertenecen a alguien salen BLOQUEADOS (no seleccionables) con su dueño;
  // solo quedan elegibles los libres. Por defecto se marca el primer libre.
  const owners = auth.colorOwners();
  let chosenColor = auth.availableColors()[0] || null;
  const swatches = el("div", { class: "swatches" }, auth.SIGNATURE_COLORS.map((c) => {
    const owner = owners.get(c);
    if (owner) {
      // Cogido: bloqueado y atenuado, con la inicial del dueño dentro (se ve de
      // quién es incluso en móvil, donde no hay tooltip).
      return el("button", {
        class: "swatch taken", style: `background:${c}`, disabled: "",
        title: `Reservado para ${owner}`,
      }, [el("span", { class: "swatch-owner", text: (owner[0] || "?").toUpperCase() })]);
    }
    const sw = el("button", { class: `swatch ${c === chosenColor ? "sel" : ""}`, style: `background:${c}`, title: c });
    sw.addEventListener("click", () => { chosenColor = c; [...swatches.children].forEach((x) => x.classList?.remove?.("sel")); sw.classList.add("sel"); });
    return sw;
  }));
  const noColors = chosenColor === null;

  const busy = (on, label) => { primary.disabled = on; primary.textContent = on ? "Conectando…" : label; };

  const doLogin = async () => {
    msg.textContent = "";
    busy(true);
    const r = await auth.loginAsync(nameI.value, passI.value);
    busy(false, "Entrar");
    if (!r.ok) { msg.textContent = r.error; return; }
    mount(root); // re-entra ya con sesión
  };
  const doCreate = async () => {
    msg.textContent = "";
    if (!chosenColor) { msg.textContent = "No quedan colores de firma libres. Pide a un admin que libere uno."; return; }
    busy(true);
    const r = await auth.createUserAsync(nameI.value, passI.value, chosenColor, state._invite);
    if (!r.ok) { busy(false, "Crear usuario y entrar"); msg.textContent = r.error; return; }
    await auth.loginAsync(nameI.value, passI.value);
    mount(root);
  };

  const primary = el("button", { class: "btn-primary auth-go", text: tab === "login" ? "Entrar" : "Crear usuario y entrar" });
  primary.addEventListener("click", () => { (tab === "login" ? doLogin : doCreate)(); });
  passI.addEventListener("keydown", (e) => { if (e.key === "Enter") primary.click(); });

  const switcher = el("button", { class: "auth-switch", text: tab === "login" ? "¿No tienes usuario? Crear uno" : "Ya tengo usuario — entrar" });
  switcher.addEventListener("click", () => { state._authTab = tab === "login" ? "create" : "login"; renderAuth(); });

  const card = el("div", { class: "auth-card" }, [
    el("div", { class: "auth-whale" }, [whaleMark()]),
    el("div", { class: "auth-logo", html: 'CONNECT <span class="logo-sub">· 01 ↔ XN</span>' }),
    el("p", { class: "auth-kicker", text: "Inteligencia de oportunidades · de la señal al chorro" }),
    state._invite ? el("p", { class: "auth-invite", text: "Tienes una invitación a Connect — crea tu usuario abajo." }) : null,
    el("p", { class: "auth-tagline", text: tab === "login" ? "Entra para continuar" : "Crea tu usuario y elige tu color de firma" }),
    nameI, passI,
    tab === "create" ? el("div", {}, [
      el("p", { class: "auth-color-label", text: noColors ? "No quedan colores de firma libres." : "Tu color (firma tu trabajo):" }),
      swatches,
    ]) : null,
    primary, msg, switcher,
  ]);
  root.appendChild(el("div", { class: "auth-screen" }, [card]));
}

// Quita de "tus leads" los que no llegan al listón de calidad (p.ej. los 31.7
// que el agente antiguo metía). Así el ranking no se llena de cifras bajas.
function purgeWeakUserLeads() {
  try {
    const leads = store.getUserLeads();
    for (const l of leads) {
      const s = scoreOpportunity(l, state.config);
      if (s.confidence < 70) store.removeUserLead(l.id);
    }
  } catch { /* no bloquear el arranque */ }
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
  state.successCal = store.getSuccessCalibration();
  const cfg = {
    ...state.config,
    weightMultipliers: state.calibration.active
      ? state.calibration.weightMultipliers
      : null,
    // El Índice de Éxito aprende de lo que de verdad cierra (reuniones reales).
    successFactor: state.successCal.active ? state.successCal.factor : 1,
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
    // Prioridad absoluta: claridad. Por defecto SOLO oportunidades reales
    // (01/XN). Lo "por evaluar" y los descartes no ensucian la vista — solo
    // aparecen si el usuario los pide expresamente con el filtro de clase.
    if (f.classification === "all") {
      if (s.classification !== "01" && s.classification !== "xn") return false;
    }
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
  // Configuración como BARRA plegable arriba del contenido (a todo el ancho),
  // no como columna lateral — así no deja hueco vacío y va igual en móvil y
  // escritorio. Cerrada por defecto.
  const cfg = el("details", { class: "config-wrap" }, [
    el("summary", { class: "config-summary", text: "⚙︎ Configuración de búsqueda y datos" }),
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
      el("div", { class: "brand-lock" }, [
        whaleMark(),
        el("span", { class: "logo", html: 'CONNECT <span class="logo-sub">· 01 ↔ XN</span>' }),
      ]),
      el("span", { class: "tagline", text: "El árbol que conecta 01 y XN — capta y selecciona clientes" }),
    ]),
    el("div", { class: "head-actions" }, [
      state.dataset === "researched"
        ? el("span", { class: "demo-badge researched-badge", text: "INVESTIGADO — momentos verificados en prensa", title: "Leads reales: aperturas/financiación/expansiones verificadas con prensa citada. Webs, contactos y tensión interna NO verificados (señales grises) — enriquece antes de llamar." })
        : el("span", { class: "demo-badge", text: "DATOS DEMO — leads sintéticos", title: "El dataset de ejemplo es ilustrativo. Conecta fuentes reales mediante los adaptadores de enriquecimiento (ver README)." }),
      userChip(),
      syncBadge(),
      el("span", { class: "ver-tag", title: "Versión publicada", text: "v31 · marca premium" }),
    ]),
  ]);
}

// Indicador discreto del estado de sincronización con el servidor compartido.
function syncBadge() {
  const s = store.getSyncState();
  const label = SYNC_LABEL[s] || "";
  return el("span", {
    class: `sync-badge sync-${s}`,
    text: label,
    style: label ? "" : "display:none",
    title: "Estado de sincronización con el servidor compartido",
  });
}

// Chip del usuario en sesión: inicial sobre su color de firma + cerrar sesión.
function userChip() {
  const u = auth.currentUser();
  if (!u) return el("span");
  const dot = el("span", { class: "user-dot", style: `background:${u.color}`, text: u.avatar || u.name[0].toUpperCase() });
  const chip = el("button", { class: "user-chip", title: `${u.name} (${roleLabel(u.role)}) — pulsa para tu perfil` }, [
    dot,
    el("span", { class: "user-name", text: u.name }),
    el("span", { class: `role-badge role-${u.role}`, text: roleLabel(u.role) }),
  ]);
  chip.addEventListener("click", openProfile);
  return chip;
}

// Notas privadas: SOLO en este dispositivo (localStorage), nunca al servidor.
const notesKey = (name) => `oi:notes:${String(name || "").toLowerCase()}`;
function getUserNotes(name) { try { return localStorage.getItem(notesKey(name)) || ""; } catch { return ""; } }
function setUserNotes(name, v) { try { localStorage.setItem(notesKey(name), v); } catch { /* */ } }

const PROFILE_EMOJIS = ["🐋", "🦊", "🦉", "🐺", "🦅", "🦈", "🐉", "🦁", "🐯", "🦄", "🤖", "👁", "⚡", "✦", "◆", "★"];

// Perfil del usuario: avatar (emoji), notas privadas, contraseña e invitación.
// Más personal y más privado, sin foto que suba a ningún sitio.
function openProfile() {
  const u = auth.currentUser();
  if (!u) return;
  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => overlay.remove();

  const dot = el("span", { class: "prof-dot", style: `background:${u.color}`, text: u.avatar || u.name[0].toUpperCase() });
  const picker = el("div", { class: "prof-emojis" });
  const mark = (val) => [...picker.children].forEach((c) => c.classList?.[c._val === val ? "add" : "remove"]?.("sel"));
  PROFILE_EMOJIS.forEach((e) => {
    const b = el("button", { class: `prof-emoji ${u.avatar === e ? "sel" : ""}`, text: e });
    b._val = e;
    b.addEventListener("click", async () => { await auth.setAvatar(e); dot.textContent = e; mark(e); render(); });
    picker.appendChild(b);
  });
  const clearB = el("button", { class: "prof-emoji prof-clear", text: "∅", title: "Sin emoji (usa tu inicial)" });
  clearB._val = null;
  clearB.addEventListener("click", async () => { await auth.setAvatar(""); dot.textContent = u.name[0].toUpperCase(); mark(null); render(); });
  picker.appendChild(clearB);

  const notes = el("textarea", { class: "prof-notes", placeholder: "Tus notas privadas (solo en este dispositivo)…" });
  notes.value = getUserNotes(u.name);
  notes.addEventListener("input", () => setUserNotes(u.name, notes.value));

  const base = String(location.href || "").split("?")[0].split("#")[0];
  const inviteBox = el("div", { class: "prof-invitebox" });
  const renderInviteLink = (code) => {
    clear(inviteBox);
    const link = `${base}?invite=${encodeURIComponent(code)}`;
    const linkInput = el("input", { class: "prof-link", value: link, readonly: "" });
    const copyL = el("button", { class: "btn", text: "Copiar enlace" });
    copyL.addEventListener("click", () => {
      const done = () => { copyL.textContent = "✓ Copiado"; setTimeout(() => (copyL.textContent = "Copiar enlace"), 1400); };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done).catch(done); else done();
    });
    inviteBox.appendChild(el("p", { class: "config-note", text: "Enlace de un solo uso · caduca en 14 días." }));
    inviteBox.appendChild(el("div", { class: "prof-linkrow" }, [linkInput, copyL]));
  };
  const genBtn = el("button", { class: "btn-primary", text: "Generar invitación", onClick: async () => {
    genBtn.disabled = true; genBtn.textContent = "Generando…";
    const r = await auth.createInvite("editor");
    genBtn.disabled = false; genBtn.textContent = "Generar otra invitación";
    if (r.ok && r.code) renderInviteLink(r.code);
    else inviteBox.appendChild(el("p", { class: "sec-msg err", text: r.error || "No se pudo." }));
  } });

  overlay.appendChild(el("div", { class: "pb-panel prof-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", { class: "prof-id" }, [dot, el("div", {}, [
        el("div", { class: "prof-name", text: u.name }),
        el("div", { class: "prof-role", text: roleLabel(u.role) }),
      ])]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    el("div", { class: "prof-sec" }, [el("h4", { text: "Tu avatar" }), picker]),
    el("div", { class: "prof-sec" }, [
      el("h4", { text: "Tus notas privadas" }),
      el("p", { class: "config-note", text: "Solo en este dispositivo. No se comparten ni suben al servidor." }),
      notes,
    ]),
    el("div", { class: "prof-sec" }, [securitySection()]),
    el("div", { class: "prof-sec" }, [
      el("h4", { text: "Invitar a alguien" }),
      allow("manage_roles")
        ? el("div", {}, [
            el("p", { class: "config-note", text: "Registro cerrado: solo entra quien tenga una invitación tuya. Genera un enlace de un solo uso." }),
            genBtn, inviteBox,
          ])
        : el("p", { class: "config-note", text: "El registro es por invitación. Pide a un admin (PABLO/JAVI) que te genere el enlace." }),
    ]),
    el("div", { class: "prof-foot" }, [
      el("button", { class: "btn-danger", text: "Cerrar sesión", onClick: () => { if (confirm(`¿Cerrar sesión de ${u.name}?`)) { auth.logout(); close(); mount(root); } } }),
    ]),
  ]));
  document.body.appendChild(overlay);
}

// Navegación premium en DOS niveles: pocas zonas grandes arriba (la decisión de
// "en qué estoy") y las vistas de cada zona debajo. Menos superficie, más
// dirección. La paleta ⌘K salta a cualquier sitio sin tocar el ratón.
const ZONES = [
  { key: "work", label: "Trabajar", views: [["today", "Hoy"]] },
  { key: "capture", label: "Captar", views: [["cards", "Oportunidades"], ["search", "Buscar"], ["table", "Ranking"], ["connector", "01 ↔ XN"]] },
  { key: "close", label: "Cerrar", views: [["crm", "CRM"], ["pipeline", "Embudo"]] },
  { key: "memory", label: "Memoria", views: [["learning", "Aprendizaje"]] },
];
function zonesForUser() {
  const z = ZONES.map((zz) => ({ ...zz }));
  if (allow("manage_roles")) z.push({ key: "team", label: "Equipo", views: [["users", "Usuarios"]] });
  return z;
}
function zoneOfView(view) {
  for (const z of zonesForUser()) if (z.views.some(([k]) => k === view)) return z.key;
  return "work";
}

function tabs() {
  const zs = zonesForUser();
  const activeZone = zoneOfView(state.view);
  const zoneBar = el("nav", { class: "zones" }, [
    ...zs.map((z) => el("button", {
      class: `zone ${z.key === activeZone ? "active" : ""}`,
      text: z.label,
      // Entrar a una zona: si ya estás en una de sus vistas, te quedas; si no,
      // vas a la primera.
      onClick: () => goView(z.views.some(([k]) => k === state.view) ? state.view : z.views[0][0]),
    })),
    el("button", { class: "zone zone-cmd", title: "Comandos (⌘K / Ctrl+K)", text: "⌘K", onClick: openCommand }),
  ]);
  const zone = zs.find((z) => z.key === activeZone);
  const subs = zone && zone.views.length > 1
    ? el("nav", { class: "subtabs" }, zone.views.map(([key, label]) =>
        el("button", { class: `tab ${state.view === key ? "active" : ""}`, text: label, onClick: () => goView(key) })))
    : null;
  return el("div", { class: "navwrap" }, [zoneBar, subs]);
}

// Paleta de comandos (⌘K): saltar a cualquier vista, buscar una empresa (abre su
// ficha) o lanzar una acción — sin ratón. Firma premium.
function openCommand() {
  if (document.body.querySelector && document.body.querySelector(".cmd-overlay")) return;
  const overlay = el("div", { class: "cmd-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const input = el("input", { class: "cmd-input", placeholder: "Ir a una vista, buscar una empresa o una acción…", autocomplete: "off" });
  const list = el("div", { class: "cmd-list" });
  let items = [], sel = 0;
  function close() { overlay.remove(); document.removeEventListener("keydown", onKey); }
  function build(q) {
    const out = [];
    for (const z of zonesForUser()) for (const [key, label] of z.views)
      out.push({ kind: "nav", label: `Ir a ${label}`, run: () => { close(); goView(key); } });
    out.push({ kind: "act", label: "Buscar oportunidades (recalcular)", run: async () => { close(); await recompute(); goView("cards"); } });
    out.push({ kind: "act", label: "Cerrar sesión", run: () => { close(); if (confirm("¿Cerrar sesión?")) { auth.logout(); mount(root); } } });
    for (const o of (state.results?.all || []))
      out.push({ kind: "lead", label: `${o.company}${o.city ? " · " + o.city : ""}`, run: () => { close(); openCase(o.id); } });
    const qq = q.trim().toLowerCase();
    return qq ? out.filter((c) => c.label.toLowerCase().includes(qq)).slice(0, 14) : out.slice(0, 8);
  }
  function paint() {
    items = build(input.value);
    if (sel >= items.length) sel = Math.max(0, items.length - 1);
    clear(list);
    items.forEach((c, i) => list.appendChild(el("div", {
      class: `cmd-item cmd-${c.kind} ${i === sel ? "sel" : ""}`, text: c.label, onClick: () => c.run(),
    })));
    if (!items.length) list.appendChild(el("div", { class: "cmd-empty", text: "Sin resultados." }));
  }
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") { sel = Math.min(sel + 1, items.length - 1); paint(); e.preventDefault?.(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); paint(); e.preventDefault?.(); }
    else if (e.key === "Enter") { items[sel]?.run(); }
  };
  document.addEventListener("keydown", onKey);
  input.addEventListener("input", () => { sel = 0; paint(); });
  overlay.appendChild(el("div", { class: "cmd-panel" }, [
    el("div", { class: "cmd-bar" }, [el("span", { class: "cmd-k", text: "⌘K" }), input]),
    list,
    el("div", { class: "cmd-hint", text: "↑↓ moverse · ↵ abrir · esc cerrar" }),
  ]));
  document.body.appendChild(overlay);
  paint();
  setTimeout(() => input.focus(), 0);
}

// Atajo global ⌘K / Ctrl+K para abrir la paleta. Se registra una sola vez.
let hotkeysBound = false;
function ensureHotkeys() {
  if (hotkeysBound) return;
  hotkeysBound = true;
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault?.();
      if (auth.currentUser()) openCommand();
    }
  });
}

// ---- Search configuration panel --------------------------------------------

function configPanel() {
  const c = state.config;
  const field = (label, control) => el("div", { class: "field" }, [el("label", { text: label }), control]);

  const sectorChecks = el("div", { class: "checks" }, allSectors().map((sct) =>
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
  const runBtn = el("button", { class: "btn-primary", text: "Buscar oportunidades" });
  runBtn.addEventListener("click", async () => {
    runBtn.textContent = "Buscando…";
    runBtn.disabled = true;
    await recompute();
    runBtn.textContent = `✓ ${state.results.counts.final} oportunidades`;
    // Lleva al usuario a los resultados (clave en móvil).
    setTimeout(() => goView("cards"), 450);
  });

  return el("aside", { class: "config" }, [
    // Esenciales: lo único que el usuario toca a diario.
    el("div", { class: "cfg-essentials" }, [
      field("Dataset", datasetSel),
      field("País", country),
      field("Sectores", sectorChecks),
    ]),
    runBtn,
    // Mandos del motor: potentes pero fuera de la vista por defecto (premium:
    // superficie simple, complejidad a un clic).
    el("details", { class: "cfg-advanced" }, [
      el("summary", { text: "Ajustes avanzados del motor" }),
      field("Volumen de candidatos (objetivo)", candVol),
      field("Nº final de leads", finalCount),
      field("Conservadurismo", el("div", {}, [conservSlider, conservOut])),
      field("Puntuación mínima", minScore),
      field("Umbral 01 → XN LAB (confianza)", xnThr),
      el("p", { class: "config-note", text: "El conservadurismo mezcla el motor 80/20 por defecto: más alto = más rojo/gris tratado como 'probablemente no'." }),
    ]),
    securitySection(),
    // Zona peligrosa, al fondo y blindada. Export → roles con permiso de export;
    // borrado duro de la caché local → solo admin. El servidor además refuerza.
    (allow("export") || allow("hard_delete")) ? el("div", { class: "danger-zone" }, [
      el("h4", { text: "Zona de datos" }),
      allow("export") ? el("button", { class: "btn-ghost", text: "Exportar copia de seguridad", onClick: () => {
        xport.download(`copia-seguridad-${new Date().toISOString().slice(0,10)}.json`, store.exportState(), "application/json");
      } }) : null,
      allow("hard_delete") ? el("button", { class: "btn-danger", text: "Borrar todos mis datos", onClick: () => {
        if (!confirm("Esto borra la caché local de llamadas, notas, verificaciones y leads añadidos. ¿Has exportado una copia?")) return;
        if (!confirm("Última confirmación: esto NO se puede deshacer en este navegador. ¿Borrar definitivamente?")) return;
        store.resetAll(); location.reload();
      } }) : null,
    ]) : null,
  ]);
}

// Cambio de contraseña del propio usuario (cualquier rol gestiona la suya).
// Requiere sesión verificada (token); si entraste offline, avisa.
function securitySection() {
  if (!auth.currentUser()) return null;
  const pw1 = el("input", { type: "password", class: "sec-f", placeholder: "Nueva contraseña (mín. 4)", autocomplete: "new-password" });
  const pw2 = el("input", { type: "password", class: "sec-f", placeholder: "Repite la nueva contraseña", autocomplete: "new-password" });
  const msg = el("p", { class: "sec-msg" });
  const btn = el("button", { class: "btn-ghost", text: "Cambiar contraseña" });
  btn.addEventListener("click", async () => {
    msg.className = "sec-msg";
    if (pw1.value !== pw2.value) { msg.textContent = "Las contraseñas no coinciden."; msg.classList.add("err"); return; }
    btn.disabled = true; msg.textContent = "Guardando…";
    const r = await auth.changePassword(pw1.value);
    btn.disabled = false;
    if (r.ok) { msg.textContent = "✓ Contraseña actualizada."; msg.classList.add("ok"); pw1.value = ""; pw2.value = ""; }
    else { msg.textContent = r.error || "No se pudo."; msg.classList.add("err"); }
  });
  return el("div", { class: "sec-zone" }, [
    el("h4", { text: "Seguridad" }),
    el("p", { class: "config-note", text: "Cambia tu contraseña (se guarda cifrada en el servidor)." }),
    pw1, pw2, btn, msg,
  ]);
}

// ---- View area --------------------------------------------------------------

function viewArea() {
  const area = el("section", { class: "view" });
  if (state.view === "today") area.appendChild(todayView());
  else if (state.view === "pipeline") area.appendChild(pipelineView());
  else if (state.view === "table") area.appendChild(tableView());
  else if (state.view === "cards") area.appendChild(cardsView());
  else if (state.view === "crm") area.appendChild(crmView());
  else if (state.view === "connector") area.appendChild(connectorView());
  else if (state.view === "search") area.appendChild(searchView());
  else if (state.view === "users") area.appendChild(usersView());
  else area.appendChild(learningView());
  return area;
}

// ---- Gestión de usuarios y roles (solo admin) -------------------------------
//
// El cliente refuerza el acceso ocultando la pestaña, pero la verdad la impone
// el servidor: setRole exige un token de admin o devuelve 403. Aquí el admin ve
// el equipo y puede cambiar el rol de cada uno.
function usersView() {
  // Cinturón y tirantes: aunque la pestaña esté oculta, si se navega a "users"
  // sin permiso, no se muestra nada operable.
  if (!allow("manage_roles")) {
    return el("div", {}, [el("h2", { text: "Usuarios" }), el("p", { class: "ro-notice", text: "Solo un ADMIN puede gestionar usuarios y roles." })]);
  }
  const me = auth.currentUser();
  const wrap = el("div", {}, [
    el("h2", { text: "Usuarios y roles" }),
    el("p", { class: "hint", text: "Cambia el rol de cada miembro. El cambio se aplica en el servidor (no solo aquí): un VIEWER no podrá modificar la mesa aunque manipule su navegador. Los cambios se reflejan en la próxima carga del afectado." }),
  ]);

  const list = el("div", { class: "users-list" });
  wrap.appendChild(list);

  const renderList = () => {
    clear(list);
    const users = auth.getUsers()
      .filter((u) => !u.colorOnly || u.role) // muestra cuentas reales (con rol conocido)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!users.length) { list.appendChild(el("p", { class: "hint", text: "Aún no hay otras cuentas." })); return; }
    for (const u of users) {
      const role = u.role || "editor";
      const dot = el("span", { class: "user-dot", style: `background:${u.color || "#4a9eff"}`, text: (u.name[0] || "?").toUpperCase() });
      const sel = el("select", { class: "lead-f role-select" }, ROLES.map((r) =>
        el("option", { value: r, selected: r === role, text: ROLE_LABEL[r] })
      ));
      const isMe = me && norm(u.name) === norm(me.name);
      sel.disabled = isMe; // no te cambias el rol a ti mismo desde aquí (evita autobloqueo)
      const status = el("span", { class: "role-status" });
      sel.addEventListener("change", async () => {
        const newRole = sel.value;
        status.textContent = "Guardando…";
        const r = await auth.setUserRole(u.name, newRole);
        if (r.ok) { status.textContent = "✓"; setTimeout(() => (status.textContent = ""), 1500); }
        else { status.textContent = r.error || "Error"; sel.value = role; }
      });
      list.appendChild(el("div", { class: "user-row" }, [
        dot,
        el("span", { class: "user-row-name", text: u.name + (isMe ? " (tú)" : "") }),
        el("span", { class: `role-badge role-${role}`, text: roleLabel(role) }),
        sel,
        status,
      ]));
    }
  };
  renderList();

  // Trae la lista fresca del servidor (colores + roles) y repinta.
  auth.syncRemoteColors().then(renderList).catch(() => {});
  return wrap;
}

// Helper local de normalización de nombres (igual criterio que auth.js).
const norm = (s) => String(s || "").trim().toLowerCase();

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
    el("div", { class: "sec-bars" }, allSectors().map((sc) => {
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

  // Camino al dinero: el cierre comercial atribuible a Connect.
  const pulse = pipelinePulse(state.results.all, store.getTracking());
  const closeStep = (n, label, value, tone) => el("div", { class: `close-step ${tone ? "close-" + tone : ""}` }, [
    el("span", { class: "close-n", text: String(n) }),
    el("span", { class: "close-l", text: label }),
    value != null ? el("span", { class: "close-v", text: eurFmt(value) }) : null,
  ]);
  const closeStrip = el("div", { class: "close-strip" }, [
    el("div", { class: "close-h" }, [
      el("span", { text: "Camino al dinero" }),
      el("span", { class: "close-attr", text: "atribuible a Connect" }),
    ]),
    el("div", { class: "close-steps" }, [
      closeStep(pulse.meetings, "Diagnósticos", null),
      el("span", { class: "close-arrow", text: "→" }),
      closeStep(pulse.proposals, "Propuestas", pulse.proposalValue),
      el("span", { class: "close-arrow", text: "→" }),
      closeStep(pulse.won, "Firmado", pulse.wonValue, "won"),
    ]),
    el("p", { class: "hint", text: "Cada empresa captada por Connect que firmas suma a los ingresos atribuibles. El € usa el ticket estimado del lead — no hace falta escribir nada." }),
  ]);

  return el("div", {}, [
    el("h2", { text: "Embudo de candidatos" }),
    closeStrip,
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
    sel("sector", [opt("all", "Todos los sectores", f.sector === "all"), ...allSectors().map((s) => opt(s.key, s.label, f.sector === s.key))]),
    sel("city", [opt("all", "Todas las ciudades", f.city === "all"), ...cities.map((c) => opt(c, c, f.city === c))]),
    sel("classification", [opt("all", "Solo oportunidades (01 + XN)", f.classification === "all"), ...Object.entries(CLASSIFICATIONS).map(([k, v]) => opt(k, v, f.classification === k))]),
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

// ---- Vista "Hoy" (claridad ejecutiva) ---------------------------------------

const eurFmt = (n) => `${Number(n || 0).toLocaleString("es-ES")} €`;

function todayView() {
  const tracking = store.getTracking();
  const opps = state.results ? state.results.all : [];
  const pulse = pipelinePulse(opps, tracking);
  const calls = pickTodayCalls(opps, tracking, { limit: 3 });
  const u = auth.currentUser();
  const h = new Date().getHours();
  const greet = h < 6 ? "Buenas noches" : h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";

  const blocks = [];
  blocks.push(el("div", { class: "today-hero" }, [
    el("div", { class: "today-greet", text: `${greet}${u ? `, ${u.name}` : ""}` }),
    el("div", { class: "today-sub", text: "Tu día en Connect — a quién llamar y por qué, de un vistazo." }),
  ]));

  // Pulso del pipeline: cuatro cifras que mandan.
  blocks.push(el("div", { class: "pulse" }, [
    pulseKpi(pulse.meetings, "diagnósticos agendados", true),
    pulseKpi(pulse.total, "oportunidades vivas"),
    pulseKpi(pulse.pending, "por llamar"),
    pulseKpi(eurFmt(pulse.valueTotal), "cartera potencial"),
  ]));
  blocks.push(el("div", { class: "pulse-split" }, [
    el("span", { class: "ps ps-won", html: `<b>✓ Firmado</b> ${pulse.won} · ${esc(eurFmt(pulse.wonValue))}` }),
    pulse.proposals ? el("span", { class: "ps ps-prop", html: `<b>Propuestas</b> ${pulse.proposals} · ${esc(eurFmt(pulse.proposalValue))}` }) : null,
    el("span", { class: "ps ps-01", html: `<b>01</b> ${pulse.o1} · ${esc(eurFmt(pulse.value01))}` }),
    el("span", { class: "ps ps-xn", html: `<b>XN</b> ${pulse.xn} · ${esc(eurFmt(pulse.valueXn))}` }),
  ]));

  // Las llamadas de hoy.
  blocks.push(el("h2", { class: "today-h2", text: "Las 3 llamadas de hoy" }));
  if (!calls.length) {
    blocks.push(el("p", { class: "today-empty", text: "No hay oportunidades vivas todavía. Ve a Oportunidades y lanza una tanda para llenar el día." }));
    blocks.push(el("button", { class: "btn-primary", text: "Ir a Oportunidades", onClick: () => goView("cards") }));
  } else {
    blocks.push(el("ol", { class: "today-calls" }, calls.map((o, i) => todayCall(o, i, tracking[o.id] || {}))));
  }

  // Seguimientos que tocan hoy: hilos abiertos con un toque vencido.
  const due = dueFollowups(opps, tracking);
  if (due.length) {
    blocks.push(el("h2", { class: "today-h2", text: `Seguimientos para hoy · ${due.length}` }));
    blocks.push(el("ul", { class: "fu-list" }, due.slice(0, 8).map(({ opp, fu }) => followupRow(opp, fu))));
  }

  return el("div", { class: "today" }, blocks);
}

function followupRow(opp, fu) {
  const open = () => { state.filters.search = opp.company; goView("cards"); };
  return el("li", { class: "fu", onClick: open, title: fu.script }, [
    el("div", { class: "fu-main" }, [
      el("div", { class: "fu-line" }, [
        el("span", { class: "fu-name", text: opp.company }),
        el("span", { class: "fu-chan", text: fu.channel }),
        el("span", { class: "fu-step", text: `toque ${fu.step}/${fu.total}` }),
      ]),
      el("div", { class: "fu-action", text: fu.action }),
    ]),
    el("span", { class: "fu-due", text: dueLabel(fu.dueAt) }),
  ]);
}

function pulseKpi(value, label, accent) {
  return el("div", { class: `kpi ${accent ? "kpi-accent" : ""}` }, [
    el("div", { class: "kpi-n", text: String(value) }),
    el("div", { class: "kpi-l", text: label }),
  ]);
}

function todayCall(o, i, track) {
  const s = o.scores;
  const step = nextStep(o, track);
  const tone = s.confidence >= 90 ? "elite" : s.confidence >= 75 ? "hot" : "warm";
  const open = () => openCase(o.id); // entrar en el caso = pantalla completa
  const st = track.status || "not_called";

  const actions = [];
  if (o.phone) actions.push(el("a", { class: "tc-call", href: `tel:${o.phone}`, text: "Llamar", onClick: (e) => e.stopPropagation() }));
  actions.push(el("button", { class: "tc-script", text: "Guion", onClick: (e) => { e.stopPropagation(); openPlaybook(o); } }));
  actions.push(el("button", { class: "tc-open", text: "Ver ficha", onClick: (e) => { e.stopPropagation(); open(); } }));

  return el("li", { class: `tc tc-${tone}`, onClick: open }, [
    el("div", { class: "tc-rank", text: String(i + 1) }),
    el("div", { class: "tc-main" }, [
      el("div", { class: "tc-line" }, [
        el("span", { class: "tc-name", text: o.company }),
        el("span", { class: `badge badge-${s.classification}`, text: s.classification === "xn" ? "XN" : "01" }),
        el("span", { class: "tc-conf", title: "Confianza", text: String(s.confidence) }),
        st !== "not_called" ? el("span", { class: "tc-status", text: STATUS_LABELS[st] }) : null,
      ]),
      el("div", { class: "tc-meta", text: `${sectorByKey(o.sector)?.label || o.sector} · ${o.city || "—"}` }),
      el("div", { class: "tc-step" }, [
        el("span", { class: "tc-action", text: `→ ${step.action}` }),
        el("span", { class: "tc-why", text: step.why }),
      ]),
    ]),
    el("div", { class: "tc-actions" }, actions),
  ]);
}

// ---- Guion + dossier por lead (Fase 10) -------------------------------------

// Abre el guion de llamada y el mini-dossier de un lead en una capa modal.
// El servicio mejor encajado se incrusta en la oferta; el texto se puede copiar
// listo para enviar. Sin precios: el cierre agenda diagnóstico.
function openPlaybook(opp) {
  if (!opp) return;
  const top = matchServices(opp, { max: 1 })[0] || null;
  const pb = buildPlaybook(opp, { topService: top });

  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => overlay.remove();

  const line = (label, value, weak) => el("div", { class: `pb-d ${weak ? "pb-weak" : ""}` }, [
    el("span", { class: "pb-dk", text: label }),
    el("span", { class: "pb-dv", text: value }),
  ]);
  const part = (label, value) => el("div", { class: "pb-part" }, [
    el("div", { class: "pb-pk", text: label }),
    el("div", { class: "pb-pv", text: value }),
  ]);

  const copyBtn = el("button", { class: "pb-copy", text: "Copiar guion", onClick: () => {
    const txt = playbookToText(opp, pb);
    const done = () => { copyBtn.textContent = "✓ Copiado"; setTimeout(() => (copyBtn.textContent = "Copiar guion"), 1400); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(done).catch(done);
    else done();
  } });

  const panel = el("div", { class: "pb-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", {}, [
        el("div", { class: "pb-title", text: `Guion — ${opp.company}` }),
        el("div", { class: "pb-sub", text: "Qué decir y qué mandar. Sin precio: el cierre agenda diagnóstico." }),
      ]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    part("Apertura", pb.script.opener),
    part("Observación", pb.script.observation),
    part("Oferta", pb.script.offer),
    part("Cierre", pb.script.close),
    el("div", { class: "pb-obj" }, [
      el("div", { class: "pb-pk", text: `Si objeta «${pb.objection.line}»` }),
      el("div", { class: "pb-pv", text: pb.objection.response }),
    ]),
    el("div", { class: "pb-dossier" }, [
      el("div", { class: "pb-pk", text: "Mini-dossier" }),
      ...pb.dossier.map((d) => line(d.k, d.v, d.weak)),
    ]),
    pb.gaps.length ? el("div", { class: "pb-gaps" }, [
      el("div", { class: "pb-pk", text: "Antes de llamar, confirmar" }),
      el("ul", {}, pb.gaps.map((g) => el("li", { text: g }))),
    ]) : null,
    el("div", { class: "pb-actions" }, [copyBtn]),
  ]);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

// Propuesta de colaboración lista para enviar. Cierra hacia el diagnóstico (la
// métrica norte), nunca al precio. Texto copiable.
function openProposal(opp) {
  if (!opp) return;
  const svc = matchServices(opp, { max: 1 })[0] || null;
  const p = buildProposal(opp, { service: svc });

  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => overlay.remove();

  const copyBtn = el("button", { class: "pb-copy", text: "Copiar propuesta", onClick: () => {
    const txt = proposalToText(opp, p);
    const done = () => { copyBtn.textContent = "✓ Copiada"; setTimeout(() => (copyBtn.textContent = "Copiar propuesta"), 1400); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(done).catch(done);
    else done();
  } });

  const panel = el("div", { class: "pb-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", {}, [
        el("div", { class: "pb-title", text: p.title }),
        el("div", { class: "pb-sub", text: "Lista para enviar. Cierra agendando el diagnóstico — el precio se concreta ahí, en privado." }),
      ]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    ...p.sections.map((sec) => el("div", { class: "pb-part" }, [
      el("div", { class: "pb-pk", text: sec.h }),
      el("div", { class: "pb-pv", text: sec.body }),
    ])),
    el("div", { class: "pb-obj" }, [
      el("div", { class: "pb-pk", text: "Siguiente paso" }),
      el("div", { class: "pb-pv", text: p.cta }),
    ]),
    p.gaps.length ? el("div", { class: "pb-gaps" }, [
      el("div", { class: "pb-pk", text: "Interno — confirmar antes de enviar" }),
      el("ul", {}, p.gaps.map((g) => el("li", { text: g }))),
    ]) : null,
    el("div", { class: "pb-actions" }, [copyBtn]),
  ]);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
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
        el("td", { class: "td-rank", "data-k": "#", text: `#${o.ranking}` }),
        el("td", { class: "td-company", "data-k": "Empresa", text: o.company }),
        el("td", { "data-k": "Sector", text: sectorByKey(o.sector)?.label || o.sector }),
        el("td", { "data-k": "Ciudad", text: o.city }),
        el("td", { "data-k": "Clase" }, el("span", { class: `badge badge-${s.classification}`, text: s.classification === "xn" ? "XN" : s.classification === "01" ? "01" : s.classification === "unqualified" ? "?" : "—" })),
        el("td", { class: "num strong", "data-k": "Conf", text: String(s.confidence) }),
        el("td", { class: "num", "data-k": "Evid", text: String(s.evidence) }),
        el("td", { class: "num", "data-k": "Conv", text: String(s.conversation) }),
        el("td", { class: "num", "data-k": "Reun", text: String(s.meeting) }),
        el("td", { class: "num", "data-k": "Cierre", text: String(s.closing) }),
        el("td", { "data-k": "Econ", text: ECONOMIC_LABELS[s.economicPotential] || s.economicPotential }),
        el("td", { class: "td-reco", "data-k": "Recom", text: RECOMMENDATIONS[s.recommendation] }),
        el("td", { "data-k": "Estado", text: STATUS_LABELS[t.status || "not_called"] }),
      ]);
    })),
  ]);
  return el("div", { class: "rank-wrap" }, [el("p", { class: "count", text: `${rows.length} candidatos` }), el("div", { class: "rank-scroll" }, [table])]);
}

// ---- Opportunity cards ------------------------------------------------------

function cardsView() {
  return el("div", {}, [
    el("div", { class: "view-head" }, [
      el("h2", { text: "Oportunidades" }),
      // El agente descubre y añade leads → solo roles con permiso.
      (allow("discover") || allow("write")) ? agentButton() : null,
    ]),
    el("div", { class: "agent-report", id: "agent-report" }),
    topPicks(),
    filterBar(),
    el("div", { class: "results-region" }, [buildCards()]),
  ]);
}

// Umbral de excelencia: solo entran al ranking oportunidades por encima de
// esto. El usuario quiere SOLO leads de calidad, nunca cifras bajas.
const AGENT_MIN_SCORE = 70;

// Control del agente: un prompt (qué buscar) + botón. Vacío → barrido aleatorio
// entre sectores. Solo añade al ranking lo que supere AGENT_MIN_SCORE.
function agentButton() {
  const prompt = el("input", {
    class: "agent-prompt",
    type: "search",
    placeholder: "Qué buscar (ej. clínicas dentales Madrid) — vacío = aleatorio entre sectores",
  });
  const btn = el("button", { class: "btn-agent", html: "⚡ Conseguir más leads" });
  // El agente NO PARA hasta entregar al menos una oportunidad ≥ listón. Reintenta
  // barriendo más sectores/ciudades, con un tope de rondas para no colgarse.
  const run = async () => {
    btn.disabled = true;
    const MAX_ROUNDS = 12;
    const existing = new Set((state.results?.all || []).map((o) => o.company));
    let totalSeen = 0, totalEval = 0, addedTotal = 0, best = 0;
    let lastQueries = [], belowSample = [];
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      btn.innerHTML = `🧠 Buscando… (ronda ${round})`;
      // cede el hilo para que el navegador pinte el progreso
      await new Promise((r) => setTimeout(r, 0));
      const res = await runBatch({
        config: state.config,
        query: prompt.value.trim(),
        existingNames: existing,
        perBatch: 5,
        minScore: AGENT_MIN_SCORE,
        token: auth.getToken(),
        onSave: (lead) => { store.saveUserLead(lead); existing.add(lead.company); },
      });
      totalSeen += res.seen; totalEval += res.evaluated; addedTotal += res.added;
      best = Math.max(best, res.best); lastQueries = res.queries;
      // Acumula los mejores "casi" por si hay que entregar el mejor disponible.
      belowSample = [...belowSample, ...(res.belowSample || [])]
        .sort((a, b) => b.confidence - a.confidence).slice(0, 5);
      if (res.added > 0) break;                 // ¡entregada! paramos
      if (prompt.value.trim() && res.seen === 0) break; // prompt sin resultados de mapa
    }
    // No para con las manos vacías: si nada llegó al listón, entrega el MEJOR
    // candidato encontrado, marcado para enriquecer (honesto, pero siempre da
    // algo accionable). Se guarda como lead de usuario.
    let deliveredBest = null;
    if (addedTotal === 0 && belowSample.length) {
      deliveredBest = belowSample[0];
      const lead = buildLead({ company: deliveredBest.company, sector: "growth", city: deliveredBest.city || "" });
      store.saveUserLead(lead);
    }
    await recompute();
    render();
    const rep = $("#agent-report", root);
    if (rep) rep.appendChild(agentReport({ seen: totalSeen, evaluated: totalEval, added: addedTotal, best, queries: lastQueries.slice(0, 4), sample: [], belowSample, deliveredBest }));
  };
  btn.addEventListener("click", run);
  prompt.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
  return el("div", { class: "agent-bar" }, [prompt, btn]);
}

function agentReport(res) {
  const box = el("div", { class: `agent-card ${res.added ? "ok" : "empty"}` });
  if (res.added) {
    box.appendChild(el("p", { class: "agent-headline", html: `🐋 <b>${res.added} oportunidad${res.added === 1 ? "" : "es"} por encima de ${AGENT_MIN_SCORE}</b> añadida${res.added === 1 ? "" : "s"} al ranking · mejor <b>${res.best}</b>` }));
  } else if (res.deliveredBest) {
    // No se fue con las manos vacías: entrega el mejor candidato hallado, para
    // enriquecer hasta superar el listón.
    const d = res.deliveredBest;
    box.appendChild(el("p", { class: "agent-headline", html: `Exploré ${res.seen} empresas. Ninguna llega aún a <b>${AGENT_MIN_SCORE}</b>, pero te entrego la más prometedora: <b>${esc(d.company)}</b> (${d.confidence}). Enriquécela (web, decisor, momento) para subirla. Está en el filtro "Por evaluar".` }));
  } else {
    // Honesto: exploró muchas, pero ninguna llega al listón de excelencia.
    const near = res.belowSample?.length
      ? ` Las más prometedoras (a enriquecer): ${res.belowSample.map((s) => `${s.company} (${s.confidence})`).join(", ")}.`
      : "";
    box.appendChild(el("p", { class: "agent-headline", html: `Exploré ${res.seen} empresas; ninguna llega aún a <b>${AGENT_MIN_SCORE}</b>. Una empresa solo supera el listón con momento citado + decisor + tensión verificada (eso se enriquece, no viene del mapa).${near}` }));
  }
  box.appendChild(el("p", { class: "agent-sub", text: `Exploradas ${res.seen} · evaluadas ${res.evaluated} · búsquedas: ${res.queries.join(" · ")}` }));
  if (res.sample.length) {
    box.appendChild(el("div", { class: "agent-sample" }, res.sample.map((s) =>
      el("span", { class: "agent-chip", text: `${s.confidence} · ${s.company}` })
    )));
  }
  return box;
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

// Handlers de la tarjeta (mutación + apertura). Compartidos por la rejilla y por
// la vista de caso a pantalla completa. `afterMutate` permite que la capa de
// caso se repinte tras un cambio sin perder el contexto.
function cardHandlers(afterMutate) {
  // RBAC: solo los roles con permiso de escritura reciben handlers de mutación.
  // Un viewer/analyst ve las tarjetas en modo lectura (sin botones de estado,
  // notas, resultado ni verificación). onPlaybook (lectura) se mantiene siempre.
  const canWrite = isWriter(auth.currentRole());
  const refresh = () => recompute().then(() => { render(); afterMutate?.(); });
  return {
    onStatus: !canWrite ? undefined : (id, st) => {
      store.setStatus(id, st);
      // Aprender del CRM: un cambio de estado decisivo (interesado/reunión/
      // rechazado/mal encaje) registra automáticamente un resultado con la foto
      // de señales del lead, para que el solo hecho de mover la tarjeta calibre.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.recordStatusOutcome(id, st, {
        classification: lead?.scores?.classification,
        sector: lead?.sector || null,
        signals: lead?.signals || null,
        successIndex: lead?.scores?.successIndex,
      });
      refresh();
    },
    onNotes: !canWrite ? undefined : (id, notes) => { store.setNotes(id, notes); },
    onOutcome: !canWrite ? undefined : (id, outcome) => {
      // Stamp the lead's signal snapshot so calibration is reproducible even if
      // the dataset later changes. Then recompute — outcomes recalibrate scores.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.addOutcome({ ...outcome, signals: lead?.signals || null });
      refresh();
    },
    onVerify: !canWrite ? undefined : (id, filter, level, note, url) => {
      // El analista confirma un hueco → se vuelve evidencia citada y recalcula.
      store.addVerification(id, filter, level, note, url);
      refresh();
    },
    onPlaybook: (id) => {
      const lead = (state.results?.all || []).find((o) => o.id === id);
      openPlaybook(lead);
    },
    onProposal: (id) => {
      const lead = (state.results?.all || []).find((o) => o.id === id);
      openProposal(lead);
    },
    onOpen: (id) => openCase(id),
  };
}

// Pequeña ballena azul: la marca de CONNECT. Entra una señal, sale un chorro
// (de marca, dirección y valor). El soplo va en oro de acento.
function whaleMark() {
  return el("span", { class: "whale", html:
    '<svg viewBox="0 0 64 42" width="36" height="24" aria-hidden="true">' +
    '<path class="whale-spout" d="M21 9 q-3 -7 0 -9 M21 9 q3 -6 6 -8 M21 9 q-1 -8 -4 -10" fill="none" stroke="#c9a227" stroke-width="1.7" stroke-linecap="round"/>' +
    '<path d="M5 25 q11 -15 29 -13 q15 1 24 11 q-7 2 -13 1 q3 4 2 9 q-7 -2 -9 -7 q-13 5 -26 0 q-2 -1 -4 -2 z" fill="#4a9eff"/>' +
    '<circle cx="15" cy="23" r="1.5" fill="#0e0f12"/></svg>' });
}

// Vista de CASO a pantalla completa: al entrar en una oportunidad se ve SOLO ese
// caso, ocupando la pantalla, con todo el análisis desplegado en paneles. Cierra
// con ← Volver, Esc o clic en el fondo. Reutiliza la tarjeta (toda la
// inteligencia ya vive ahí) y la presenta ancha, con cabecera y firma de marca.
function openCase(id) {
  let lead = (state.results?.all || []).find((o) => o.id === id);
  if (!lead) return;

  const overlay = el("div", { class: "case-screen", onClick: (e) => { if (e.target === overlay) close(); } });
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function close() { overlay.remove(); document.removeEventListener("keydown", onKey); }
  document.addEventListener("keydown", onKey);

  const body = el("div", { class: "case-body" });
  const freshPanel = el("div", { class: "case-fresh" }); // medición automática de su web
  const cardWrap = el("div", {});
  body.appendChild(freshPanel);
  body.appendChild(cardWrap);
  // En la capa de caso no re-abrimos otra capa: onOpen se anula para que el
  // título no apile overlays. El resto de handlers mutan y repintan el caso.
  const handlers = { ...cardHandlers(rebuild), onOpen: undefined };
  function rebuild() {
    lead = (state.results?.all || []).find((o) => o.id === id) || lead;
    clear(cardWrap);
    const card = renderCard(lead, store.getTracking()[lead.id], handlers);
    card.classList.add("case-card");
    const det = card.querySelector(".c-detail");
    if (det) det.open = true; // en pantalla completa el análisis va siempre abierto
    cardWrap.appendChild(card);
  }
  rebuild();
  loadFreshness(lead, freshPanel, rebuild); // automático: lee su web y sube la nota

  const bar = el("div", { class: "case-bar" }, [
    el("button", { class: "case-back", text: "← Volver", onClick: close }),
    el("div", { class: "case-brand" }, [whaleMark(), el("span", { class: "case-brand-t", html: 'CONNECT <i>· de la señal al chorro</i>' })]),
    el("span", { class: "case-rank", text: `#${lead.ranking ?? "—"}` }),
  ]);
  const foot = el("div", { class: "case-foot" }, [
    whaleMark(),
    el("p", { html: 'Entra una señal, sale un chorro de <b>marca</b>, <b>dirección</b> y <b>valor</b>. — la ballena azul de XN&nbsp;LAB.' }),
  ]);

  overlay.appendChild(bar);
  overlay.appendChild(body);
  overlay.appendChild(foot);
  document.body.appendChild(overlay);
}

// Medición AUTOMÁTICA de la web del lead: ¿desde cuándo no la mejoran? Se lee al
// abrir el caso (cacheada en servidor), sin que el usuario pida nada. Honesta:
// si no se puede leer, lo dice (gris) — nunca inventa.
async function loadFreshness(lead, panel, onScoreChange) {
  clear(panel);
  if (!lead.website) {
    panel.appendChild(freshCard({ note: "Este lead no tiene web registrada — no podemos medir su frescura." }, "gray"));
    return;
  }
  panel.appendChild(freshCard(null, "loading"));
  let r;
  try { r = await fetchWebFreshness(lead.website, auth.getToken()); } catch { r = null; }
  clear(panel);
  const kind = r && r.ok && r.readable ? "ok" : "gray";
  panel.appendChild(freshCard(r, kind));
  // La lectura de la web alimenta el motor: una web obsoleta sube la nota
  // (indicio citado) por la misma vía que una verificación del analista.
  if (kind === "ok" && allow("write") && applyWebToScore(lead.id, r)) {
    await recompute();
    onScoreChange?.();
  }
}

// Enchufa la lectura de la web al scoring vía el sistema de verificación
// (auto). Idempotente (upsert por filtro). @returns {boolean} si cambió algo.
function applyWebToScore(leadId, r) {
  const vs = webSignalsToVerifications(r);
  if (!vs.length) return false;
  const existing = store.getLeadVerifications(leadId);
  let changed = false;
  for (const v of vs) {
    if (existing.some((x) => x.auto && x.filter === v.filter)) continue;
    store.addVerification(leadId, v.filter, v.level, v.note, r.url || null, { auto: true, srcLabel: "Lectura de su web" });
    changed = true;
  }
  return changed;
}

function freshMetric(big, label, tone) {
  return el("div", { class: `fresh-m fresh-m-${tone}` }, [
    el("span", { class: "fresh-m-n", text: big }),
    el("span", { class: "fresh-m-l", text: label }),
  ]);
}

function freshCard(r, kind) {
  const year = new Date().getFullYear();
  const head = el("div", { class: "fresh-h" }, [
    el("span", { class: "fresh-ic", text: "◷" }),
    el("span", { class: "fresh-h-t", text: "Frescura de su web" }),
    el("span", { class: "fresh-tag", text: "AUTOMÁTICO" }),
  ]);
  if (kind === "loading") {
    return el("div", { class: "case-fresh-card loading" }, [head, el("p", { class: "fresh-note", text: "Leyendo su web…" })]);
  }
  if (kind === "gray") {
    return el("div", { class: "case-fresh-card gray" }, [head, el("p", { class: "fresh-note", text: (r && (r.note || r.error)) || "No pudimos leer su web." })]);
  }
  const age = r.copyright_year ? year - r.copyright_year : null;
  const stale = age != null && age >= 3;
  const lever = stale || r.has_viewport === false;
  const metrics = el("div", { class: "fresh-metrics" }, [
    freshMetric(r.copyright_year ? String(r.copyright_year) : "—",
      r.copyright_year ? `última señal · ${age} año${age === 1 ? "" : "s"}` : "sin año legible",
      stale ? "bad" : "ok"),
    freshMetric(r.has_viewport === false ? "No" : "Sí", "responsive (móvil)", r.has_viewport === false ? "bad" : "ok"),
    freshMetric(r.generator || "—", "tecnología", "neutral"),
  ]);
  const children = [head, metrics, el("p", { class: "fresh-note", text: r.note || "" })];
  if (lever) children.push(el("div", { class: "fresh-lever", text: "⚡ Palanca de venta: su presencia digital no acompaña a su momento — entrada natural para 01/XN." }));
  return el("div", { class: `case-fresh-card ${lever ? "lever" : "fresh-ok"}` }, children);
}

function buildCards() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  const handlers = cardHandlers();
  if (!rows.length) {
    const f = state.filters;
    const filtering = f.search || f.sector !== "all" || f.city !== "all" || f.classification !== "all" || f.priority !== "all" || f.minEvidence || f.minConfidence || f.minEvStrength;
    return el("div", { class: "empty-state" }, [
      el("p", { class: "empty", text: filtering ? "Ningún candidato coincide con los filtros actuales (puede que un filtro esté ocultando leads)." : "Aún no hay oportunidades. Pulsa ⚡ Nueva tanda de leads para captar." }),
      filtering ? el("button", { class: "btn", text: "✕ Limpiar filtros", onClick: () => {
        state.filters = { sector: "all", city: "all", classification: "all", priority: "all", minEvidence: 0, minConfidence: 0, minEvStrength: 0, search: "" };
        render();
      } }) : null,
    ]);
  }
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
  { key: "proposal_sent", fail: false },
  { key: "won", fail: false },
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
  // Firma de color: quién movió este lead a su estado actual.
  const by = store.getTracking()[o.id]?.by;
  const byColor = by ? auth.colorOf(by) : null;
  const children = [
    el("div", { class: "crm-card-top" }, [
      byColor ? el("span", { class: "by-dot", style: `background:${byColor}`, title: `Movido por ${by}` }) : null,
      el("span", { class: "crm-card-name", text: o.company }),
      el("span", { class: `crm-card-conf conf-${s.confidence >= 75 ? "hot" : s.confidence >= 58 ? "warm" : "cool"}`, text: String(s.confidence) }),
    ]),
    el("p", { class: "crm-card-sub", text: `${o.city} · ${o.decisionMaker?.name || "decisor por identificar"}${by ? " · " + by : ""}` }),
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

// ---- PILOTO AUTOMÁTICO: capta solo hasta el objetivo en 01 y XN -------------
function autopilotState() {
  if (!state._auto) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("oi:autopilot")) || {}; } catch { saved = {}; }
    state._auto = { on: !!saved.on, target: saved.target || 100, _msg: "" };
  }
  return state._auto;
}
function saveAuto() {
  try { localStorage.setItem("oi:autopilot", JSON.stringify({ on: state._auto.on, target: state._auto.target })); } catch { /* */ }
}
let autoTimer = null, autoEmpty = 0;

function startAuto() {
  if (!allow("discover") && !allow("write")) return;
  const a = autopilotState(); a.on = true; a._msg = "Arrancando…"; autoEmpty = 0; saveAuto();
  patchAutoPanel(); autoTick();
}
function stopAuto() {
  const a = autopilotState(); a.on = false; a._msg = "Detenido."; saveAuto();
  clearTimeout(autoTimer); patchAutoPanel();
}

async function autoTick() {
  const a = autopilotState();
  if (!a.on) return;
  const prog = autoProgress(state.results?.all || [], { target: a.target, bar: AUTO_BAR });
  if (prog.done) { a.on = false; a._msg = `🐋 Objetivo alcanzado: ${a.target} en 01 y ${a.target} en XN.`; saveAuto(); patchAutoPanel(); render(); return; }
  // Foco guiado por tus intereses la mitad de las veces; si no, barrido base.
  const ints = getInterests(6).map((i) => i.q).filter(Boolean);
  const focus = ints.length && Math.random() < 0.5 ? ints[Math.floor(Math.random() * ints.length)] : "";
  const existing = new Set(store.getUserLeads().map((l) => `${l.company}`.toLowerCase()));
  let res = { added: 0, seen: 0 };
  try {
    res = await runBatch({ config: state.config, query: focus, existingNames: existing, perBatch: 3, minScore: 0, token: auth.getToken(), onSave: (lead) => store.saveUserLead(lead) });
  } catch { /* sin red o límite del mapa */ }
  await recompute();
  if (!a.on) return; // pudo detenerse durante el await
  if ((res.seen || 0) === 0) autoEmpty++; else autoEmpty = 0;
  if (autoEmpty >= 4) {
    a.on = false; a._msg = "Pausado: sin novedades o límite diario del mapa alcanzado. Reanúdalo cuando quieras."; saveAuto();
    patchAutoPanel(); render(); return;
  }
  // Mejora por el camino: lee la web del mejor lead aún sin enriquecer y sube
  // su nota (indicio citado). Una por tanda, best-effort.
  try {
    const cand = (state.results?.all || [])
      .filter((o) => o && o.website && o.scores && o.scores.classification !== "discard"
        && !store.getLeadVerifications(o.id).some((v) => v.auto))
      .sort((a2, b2) => (b2.scores.confidence || 0) - (a2.scores.confidence || 0))[0];
    if (cand) {
      const r = await fetchWebFreshness(cand.website, auth.getToken());
      if (r && r.ok && applyWebToScore(cand.id, r)) await recompute();
    }
  } catch { /* best-effort */ }
  if (!a.on) return;

  a._msg = `Capturando… +${res.added || 0} esta tanda${focus ? ` · foco: ${focus}` : ""}.`;
  patchAutoPanel();
  autoTimer = setTimeout(autoTick, 11000); // ~16 consultas/min, bajo el límite
}

function patchAutoPanel() {
  if (!root) return;
  const node = root.querySelector(".auto-panel");
  if (node && node.parentNode) node.parentNode.replaceChild(autopilotPanel(), node);
}

function autopilotPanel() {
  const a = autopilotState();
  const prog = autoProgress(state.results?.all || [], { target: a.target, bar: AUTO_BAR });
  const track = (label, n, pct, cls) => el("div", { class: "auto-track-row" }, [
    el("span", { class: "auto-tl", html: `<b>${label}</b> ${n}/${a.target}` }),
    el("div", { class: "auto-track" }, [el("div", { class: `auto-fill auto-fill-${cls}`, style: `width:${pct}%` })]),
  ]);
  const targetInput = el("input", { type: "number", min: "1", max: "1000", value: String(a.target), class: "auto-target",
    onChange: (e) => { a.target = Math.max(1, +e.target.value || 100); saveAuto(); patchAutoPanel(); } });
  const toggle = el("button", { class: `btn-agent ${a.on ? "auto-on" : ""}`,
    html: a.on ? "⏸ Detener piloto" : "🐋 Arrancar piloto automático",
    onClick: () => (a.on ? stopAuto() : startAuto()) });
  return el("div", { class: "auto-panel" }, [
    el("div", { class: "auto-head" }, [
      el("span", { class: "auto-title", text: "Piloto automático de captación" }),
      a.on ? el("span", { class: "auto-live", text: "● EN MARCHA" }) : null,
    ]),
    el("p", { class: "hint", text: "Mete empresas cualificadas solo —guiado por tus intereses— hasta tener tu objetivo en 01 y en XN. Arráncalo y déjalo correr." }),
    track("01", prog.q01, prog.pct01, "01"),
    track("XN", prog.qxn, prog.pctxn, "xn"),
    el("div", { class: "auto-ctl" }, [el("label", { class: "auto-tlbl", text: "Objetivo por marca:" }), targetInput, toggle]),
    a._msg ? el("p", { class: "auto-msg", text: a._msg }) : null,
    el("p", { class: "auto-foot", text: "Corre mientras la pestaña esté abierta y dentro del presupuesto diario del mapa (se pausa y reanuda solo). Cuenta empresas con nota ≥70; llegar a 100 de nota exige enriquecimiento (en construcción)." }),
  ]);
}

// Detecta el sector de una búsqueda; si es un nicho inédito, lo CREA al vuelo
// (con la consulta como búsqueda y lente neutra que el uso afina). Así el
// captador incorpora sectores nuevos solo, sin que el usuario los configure.
function ensureSector(query) {
  const inf = inferSector(query, allSectors());
  if (!inf || inf.empty) return null;
  if (inf.key) return { key: inf.key, label: sectorByKey(inf.key)?.label || inf.label, isNew: false };
  const r = addCustomSector(inf.label, [query], null);
  if (r.ok) return { key: r.key, label: inf.label, isNew: true };
  const found = allSectors().find((s) => s.label.toLowerCase() === inf.label.toLowerCase());
  return found ? { key: found.key, label: found.label, isNew: false } : { key: "growth", label: "Crecimiento", isNew: false };
}

function searchView() {
  const userLeads = store.getUserLeads();
  const blocks = [el("h2", { text: "Captar clientes" })];

  // RBAC: descubrir y añadir leads exige permiso de escritura/descubrimiento.
  // Un viewer/analyst ve un aviso de solo lectura en vez de los controles.
  if (!allow("discover") && !allow("write")) {
    blocks.push(el("p", { class: "ro-notice", text: `Tu rol (${roleLabel(auth.currentRole())}) es de solo lectura: puedes consultar el ranking y los dossiers, pero no descubrir ni añadir leads. Pide a un ADMIN que cambie tu rol si necesitas operar.` }));
    return el("section", { class: "search-view" }, blocks);
  }

  // Piloto automático arriba del todo: lo que no para de meter empresas solo.
  blocks.push(autopilotPanel());

  blocks.push(el("h3", { class: "capt-h", text: "O capta a mano una búsqueda concreta" }));
  blocks.push(el("p", { class: "hint", html: "Escribe a quién quieres captar (ej. «clínicas dentales en Valencia» o «estudios de tatuaje»). Connect <b>detecta el sector —o crea uno nuevo—</b>, trae empresas reales del mapa, <b>las puntúa y las mete en el ranking</b>." }));

  // --- CAPTADOR AUTOMÁTICO ---
  const qInput = el("input", { type: "search", class: "search-city capt-input", placeholder: "¿A quién quieres captar?", autocomplete: "off" });
  const sectorChip = el("div", { class: "capt-sector" });
  const statusBox = el("div", { class: "capt-status" });
  const resultsBox = el("div", { class: "discover-results" });

  async function captar() {
    const q = qInput.value.trim();
    clear(sectorChip); clear(statusBox); clear(resultsBox);
    if (!q) { statusBox.appendChild(el("p", { class: "hint", text: "Escribe a quién quieres captar." })); return; }

    // 1) Sector: lo detecta o lo crea al vuelo.
    const inf = ensureSector(q);
    const sectorKey = inf ? inf.key : "all";
    if (inf) {
      recordSearch(q, inf.key, inf.label);
      sectorChip.appendChild(el("span", {
        class: `chip-sector ${inf.isNew ? "is-new" : ""}`,
        text: inf.isNew ? `✦ Sector nuevo creado: ${inf.label}` : `Sector detectado: ${sectorByKey(inf.key)?.label || inf.label}`,
      }));
      // Si ya tenemos resultados de ese nicho, lo decimos (memoria por sector).
      const perf = inf.key ? sectorRate(store.getLearning(), inf.key, { minSample: 3 }) : null;
      if (perf && perf.ranked) {
        sectorChip.appendChild(el("span", { class: `chip-rate ${perf.rate >= 50 ? "good" : "bad"}`, text: `este nicho convierte ${perf.rate}% (${perf.decisive} llamadas)` }));
      }
    }

    // 2) Descubrir empresas reales.
    captBtn.disabled = true; captBtn.textContent = "Captando…";
    statusBox.appendChild(el("p", { class: "hint", text: "🗺️ Buscando empresas reales en el mapa…" }));
    let found = [];
    try { found = await discover({ sector: sectorKey, query: q, token: auth.getToken() }); } catch { found = []; }

    // 3) Auto-incorporar las nuevas y puntuarlas (entran al ranking solas).
    const existing = new Set(store.getUserLeads().map((l) => `${l.company}`.toLowerCase()));
    let added = 0;
    for (const c of found) {
      const k = `${c.company || ""}`.toLowerCase();
      if (!k || existing.has(k)) continue;
      store.saveUserLead(buildLead({
        company: c.company, sector: sectorKey === "all" ? (c.sector || "growth") : sectorKey,
        subsector: c.subsector || "", city: c.city || "", website: c.website || null,
        phone: c.phone || null, googleMaps: c.googleMaps || null,
      }));
      existing.add(k); added++;
    }
    await recompute();
    captBtn.disabled = false; captBtn.textContent = "Captar";

    // 4) Resumen + acceso directo al ranking.
    clear(statusBox);
    if (!found.length) {
      statusBox.appendChild(el("p", { class: "empty", html: "El mapa no devolvió empresas para eso. Prueba algo más concreto (ej. <b>clínicas dentales Valencia</b>) o añade una a mano abajo." }));
      return;
    }
    statusBox.appendChild(el("div", { class: "capt-done" }, [
      el("p", { html: `Capté <b>${found.length}</b> empresas${added !== found.length ? ` · <b>${added}</b> nuevas` : ""} — ya están <b>puntuadas en el ranking</b>.` }),
      el("div", { class: "capt-actions" }, [
        el("button", { class: "btn-primary", text: "Ver en el ranking →", onClick: () => goView("table") }),
        el("button", { class: "btn", text: "Ver oportunidades", onClick: () => goView("cards") }),
      ]),
    ]));
    resultsBox.appendChild(el("div", { class: "discover-list" }, found.map((c) =>
      el("div", { class: "discover-card" }, [
        el("div", { class: "dc-main" }, [
          el("div", { class: "dc-name", text: c.company }),
          el("div", { class: "dc-sub", text: `${c.subsector ? c.subsector + " · " : ""}${c.city || "—"}` }),
        ]),
        el("span", { class: "dc-added", text: "✓ en ranking" }),
      ])
    )));
  }

  const captBtn = el("button", { class: "btn-primary capt-go", text: "Captar", onClick: captar });
  qInput.addEventListener("keydown", (e) => { if (e.key === "Enter") captar(); });
  blocks.push(el("div", { class: "capt-bar" }, [qInput, captBtn]));
  blocks.push(sectorChip);

  // Tus intereses: lo que más buscas, a un clic. Si aún no hay historial, ideas.
  const interests = getInterests(8);
  const chips = interests.length
    ? interests.map((it) => [it.q, it.q])
    : [["clínicas dentales Madrid"], ["restaurante premium Marbella"], ["promotora branded residences"], ["estudios de tatuaje Barcelona"]].map(([q]) => [q, q]);
  blocks.push(el("div", { class: "idea-chips" }, [
    el("span", { class: "idea-lbl", text: interests.length ? "Tus intereses:" : "Ideas:" }),
    ...chips.map(([label, q]) => el("button", { class: "idea-chip", text: label, onClick: () => { qInput.value = q; captar(); } })),
  ]));

  blocks.push(statusBox);
  blocks.push(resultsBox);

  // Sectores personalizados (Fase 8): crear nichos nuevos sin tocar código.
  blocks.push(sectorManager());

  // Formulario de alta.
  blocks.push(el("h3", { text: "Añadir lead", class: "add-h" }));
  blocks.push(addLeadForm());

  // Leads ya añadidos.
  if (userLeads.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: `Tus leads añadidos (${userLeads.length})` }),
      el("ul", { class: "user-leads" }, userLeads.map((l) =>
        el("li", {}, [
          el("span", { text: `${l.company} · ${sectorByKey(l.sector)?.label || l.sector} · ${l.city || "—"}` }),
          el("button", { class: "ul-del", text: "✕", title: "Eliminar", onClick: () => { store.removeUserLead(l.id); recompute().then(render); } }),
        ])
      )),
    ]));
  }

  return el("div", {}, blocks);
}

// Gestor de sectores personalizados: el usuario crea nichos (tatuaje, música…)
// con sus consultas de búsqueda. La lente arranca neutra y se afina con el uso.
function sectorManager() {
  const custom = getCustomSectors();
  const name = el("input", { class: "lead-f", placeholder: "Nuevo sector (ej. Tatuaje, Música, Fitness)" });
  const queries = el("input", { class: "lead-f", placeholder: "Qué buscar, separado por comas (ej. estudio tatuaje, tattoo studio)" });
  const msg = el("span", { class: "add-msg" });
  const add = el("button", {
    class: "btn", text: "+ Crear sector",
    onClick: async () => {
      const r = addCustomSector(name.value, queries.value);
      if (!r.ok) { msg.textContent = r.error; return; }
      name.value = ""; queries.value = "";
      await recompute(); render();
    },
  });
  const list = custom.length
    ? el("div", { class: "user-leads" }, custom.map((s) =>
        el("div", {}, [
          el("span", { text: `${s.label} · busca: ${(s.queries || []).join(", ")}` }),
          el("button", { class: "ul-del", text: "✕", title: "Eliminar sector", onClick: () => { removeCustomSector(s.key); recompute().then(render); } }),
        ])
      ))
    : el("p", { class: "hint", text: "Aún no has creado sectores propios. Crea uno y el agente lo barrerá también." });
  return el("details", { class: "sector-mgr" }, [
    el("summary", { class: "sector-mgr-sum", text: `🧩 Sectores personalizados (${custom.length})` }),
    el("p", { class: "hint", text: "Crea cualquier nicho. Sus consultas alimentan al agente; su lente se afina con tus resultados." }),
    el("div", { class: "sector-add" }, [name, queries, add]),
    msg,
    list,
  ]);
}

function addLeadForm() {
  const f = (name, ph) => el("input", { name, placeholder: ph, class: "lead-f" });
  const company = f("company", "Nombre de la empresa *");
  const sector = el("select", { class: "lead-f" }, allSectors().map((s) => el("option", { value: s.key, text: s.label })));
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

  blocks.push(el("h2", { text: "Memoria — el sistema aprende solo" }));
  blocks.push(el("p", { class: "hint", html: "No registras nada a mano. <b>Cada vez que marcas el resultado de una llamada con un toque en la ficha</b> (Interesado · Reunión · Rechazado · Mal encaje), el sistema guarda la foto de señales de ese lead y <b>recalibra la puntuación solo</b> — con topes para que una primera semana ruidosa no distorsione el modelo. Lo único que el sistema no puede adivinar es qué te dijo el cliente: ese único toque lo enciende todo." }));

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

  // Qué NICHOS cierran mejor — cierra el círculo con el captador: capta más de
  // lo que de verdad convierte. Honesto: pocos datos → "calibrando".
  const sectorPerf = sectorPerformance(log, { minSample: 3 });
  if (sectorPerf.length) {
    blocks.push(el("div", { class: "sec" }, [
      el("h4", { text: "Qué nichos cierran mejor" }),
      el("p", { class: "hint", text: "Conversión real por sector (interés/reunión frente a rechazo/mal encaje). Capta más de lo que convierte. Un nicho con pocos datos aún calibra." }),
      el("div", { class: "nicho-list" }, sectorPerf.map((r) => {
        const label = sectorByKey(r.sector)?.label || r.sector;
        const tone = r.ranked ? (r.rate >= 50 ? "nicho-good" : "nicho-bad") : "nicho-cal";
        return el("div", { class: `nicho ${tone}` }, [
          el("span", { class: "nicho-name", text: label }),
          el("span", { class: "nicho-bar" }, [el("span", { class: "nicho-fill", style: `width:${r.ranked ? r.rate : 0}%` })]),
          el("span", { class: "nicho-rate", text: r.ranked ? `${r.rate}% · ${r.decisive} llamadas` : `calibrando (${r.decisive}/3)` }),
        ]);
      })),
    ]));
  }

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
    blocks.push(el("p", { class: "empty", text: "El sistema aún no ha aprendido nada porque todavía no se ha marcado ninguna llamada. Llama desde una ficha y toca el resultado (Interesado/Reunión/Rechazado): a partir de la 3ª, la puntuación se calibra sola." }));
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
        store.pushSharedState(); // propaga lo importado a la mesa compartida
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
