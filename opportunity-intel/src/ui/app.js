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
import { dueFollowups, dueLabel } from "../followups.js";
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
  auth.syncRemoteColors().then(() => render()).catch(() => {}); // colores de firma consistentes entre dispositivos (best-effort)
  purgeWeakUserLeads(); // limpia leads crudos de baja puntuación de versiones previas
  await recompute();
  render();

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
    const r = await auth.createUserAsync(nameI.value, passI.value, chosenColor);
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
    el("div", { class: "auth-logo", html: 'CONNECT <span class="logo-sub">· 01 ↔ XN</span>' }),
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
      el("span", { class: "logo", html: 'CONNECT <span class="logo-sub">· 01 ↔ XN</span>' }),
      el("span", { class: "tagline", text: "El árbol que conecta 01 y XN — capta y selecciona clientes" }),
    ]),
    el("div", { class: "head-actions" }, [
      state.dataset === "researched"
        ? el("span", { class: "demo-badge researched-badge", text: "INVESTIGADO — momentos verificados en prensa", title: "Leads reales: aperturas/financiación/expansiones verificadas con prensa citada. Webs, contactos y tensión interna NO verificados (señales grises) — enriquece antes de llamar." })
        : el("span", { class: "demo-badge", text: "DATOS DEMO — leads sintéticos", title: "El dataset de ejemplo es ilustrativo. Conecta fuentes reales mediante los adaptadores de enriquecimiento (ver README)." }),
      userChip(),
      syncBadge(),
      el("span", { class: "ver-tag", title: "Versión publicada", text: "v16 · mesa compartida" }),
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
  const dot = el("span", { class: "user-dot", style: `background:${u.color}`, text: u.name[0].toUpperCase() });
  const chip = el("button", { class: "user-chip", title: `${u.name} (${roleLabel(u.role)}) — pulsa para cerrar sesión` }, [
    dot,
    el("span", { class: "user-name", text: u.name }),
    el("span", { class: `role-badge role-${u.role}`, text: roleLabel(u.role) }),
  ]);
  chip.addEventListener("click", () => {
    if (confirm(`¿Cerrar sesión de ${u.name}?`)) { auth.logout(); mount(root); }
  });
  return chip;
}

function tabs() {
  const items = [
    ["today", "Hoy"],
    ["cards", "Oportunidades"],
    ["connector", "01 ↔ XN"],
    ["search", "Buscar leads"],
    ["table", "Ranking"],
    ["crm", "CRM"],
    ["pipeline", "Embudo"],
    ["learning", "Aprendizaje"],
    // Gestión de usuarios/roles: solo admin.
    ...(allow("manage_roles") ? [["users", "Usuarios"]] : []),
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
    pulseKpi(pulse.total, "oportunidades vivas"),
    pulseKpi(pulse.pending, "por llamar"),
    pulseKpi(pulse.meetings, "reuniones"),
    pulseKpi(eurFmt(pulse.valueTotal), "cartera potencial", true),
  ]));
  blocks.push(el("div", { class: "pulse-split" }, [
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
  const open = () => { state.filters.search = o.company; goView("cards"); };
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

function buildCards() {
  const rows = visibleOpps();
  const tracking = store.getTracking();
  // RBAC: solo los roles con permiso de escritura reciben handlers de mutación.
  // Un viewer/analyst ve las tarjetas en modo lectura (sin botones de estado,
  // notas, resultado ni verificación). onPlaybook (lectura) se mantiene siempre.
  const canWrite = isWriter(auth.currentRole());
  const handlers = {
    onStatus: !canWrite ? undefined : (id, st) => {
      store.setStatus(id, st);
      // Aprender del CRM: un cambio de estado decisivo (interesado/reunión/
      // rechazado/mal encaje) registra automáticamente un resultado con la foto
      // de señales del lead, para que el solo hecho de mover la tarjeta calibre.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.recordStatusOutcome(id, st, {
        classification: lead?.scores?.classification,
        signals: lead?.signals || null,
        successIndex: lead?.scores?.successIndex,
      });
      recompute().then(render);
    },
    onNotes: !canWrite ? undefined : (id, notes) => { store.setNotes(id, notes); },
    onOutcome: !canWrite ? undefined : (id, outcome) => {
      // Stamp the lead's signal snapshot so calibration is reproducible even if
      // the dataset later changes. Then recompute — outcomes recalibrate scores.
      const lead = (state.results?.all || []).find((o) => o.id === id);
      store.addOutcome({ ...outcome, signals: lead?.signals || null });
      recompute().then(render);
    },
    onVerify: !canWrite ? undefined : (id, filter, level, note, url) => {
      // El analista confirma un hueco → se vuelve evidencia citada y recalcula.
      store.addVerification(id, filter, level, note, url);
      recompute().then(render);
    },
    onPlaybook: (id) => {
      const lead = (state.results?.all || []).find((o) => o.id === id);
      openPlaybook(lead);
    },
  };
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

function searchView() {
  const userLeads = store.getUserLeads();
  const blocks = [el("h2", { text: "Descubrir leads" })];

  // RBAC: descubrir y añadir leads exige permiso de escritura/descubrimiento.
  // Un viewer/analyst ve un aviso de solo lectura en vez de los controles.
  if (!allow("discover") && !allow("write")) {
    blocks.push(el("p", { class: "ro-notice", text: `Tu rol (${roleLabel(auth.currentRole())}) es de solo lectura: puedes consultar el ranking y los dossiers, pero no descubrir ni añadir leads. Pide a un ADMIN que cambie tu rol si necesitas operar.` }));
    return el("section", { class: "search-view" }, blocks);
  }

  blocks.push(el("p", { class: "hint", text: "Elige sector y/o escribe (ej. 'clínicas dentales Madrid') y pulsa Descubrir: aparecen empresas reales aquí mismo. Añádelas de un toque — entran al ranking y las enriqueces luego. Abajo puedes añadir cualquier otra a mano." }));

  // --- DESCUBRIDOR INTERNO ---
  const secSel = el("select", { class: "lead-f" }, [
    el("option", { value: "all", text: "Todos los sectores" }),
    ...allSectors().map((s) => el("option", { value: s.key, text: s.label })),
  ]);
  const qInput = el("input", { type: "search", class: "lead-f", placeholder: "Qué y dónde (ej. clínicas dentales Madrid)" });
  const resultsBox = el("div", { class: "discover-results" });

  const runDiscover = async () => {
    clear(resultsBox);
    const status = el("p", { class: "hint", text: "🗺️ Buscando en el mapa…" });
    resultsBox.appendChild(status);
    let found = [];
    try {
      found = await discover({ sector: secSel.value, query: qInput.value, token: auth.getToken() });
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
