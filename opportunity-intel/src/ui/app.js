// =============================================================================
// app.js — Application shell. Wires the search-config panel, candidate
// pipeline, ranking table, filters, opportunity cards, export and the learning
// view together. No framework: explicit render functions over a small state.
// =============================================================================

import { el, $, clear, esc } from "./dom.js";
import { renderCard } from "./card.js";
import { ensureEco } from "./voice.js";
import * as posits from "./posits.js";
import { runPipeline } from "../pipeline.js";
import { scoreOpportunity } from "../scoring.js";
import SEED from "../seed.js";
import RESEARCHED from "../data/researched.js";
import MALLORCA from "../data/mallorca.js";

// ECO_ENABLED: el micro flotante EC·Eco es una herramienta de colaboración
// interna. Se desactiva del flujo principal sin borrar voice.js ni su lógica.
// Cambiar a true para restaurarlo cuando se quiera.
const ECO_ENABLED = false;
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
  CALL_RESULTS,
  OFFER_LADDER,
  TENSION_TYPES,
} from "../models.js";
import * as store from "../store.js";
import { failureReason } from "../diagnosis.js";
import { matchServices, ticketLabel, SERVICE_BY_ID } from "../services.js";
import { buildLead } from "../newlead.js";
import { allSectors, sectorByKey, addCustomSector, getCustomSectors, removeCustomSector } from "../customsectors.js";
import {
  generateTaxonomy, getForest, mergeForest, clearForest, removePath,
  childrenAt, isLeaf, leavesUnder, leadsUnder, pathQuery, countUnder,
  classifyLeads, pathNodes, allTags, leadMatchesFacet, radarSuggest, seedCron,
} from "../taxonomy.js";
import { fetchContacts } from "../contacts.js";
import { startAutoUpdate } from "../autoupdate.js";
import { discover } from "../discovery.js";
import { runBatch } from "../agent.js";
import * as auth from "../auth.js";
import * as xport from "../export.js";
import { pickTodayCalls, nextStep, pipelinePulse } from "../today.js";
import { planRounds, groupByDate, groupByRound, planSummary, orderByPriority, DEFAULT_SCHEDULE, ymd } from "../agenda.js";
import { buildPlaybook, playbookToText } from "../playbook.js";
import { buildProposal, proposalToText } from "../proposal.js";
import { dueFollowups, dueLabel } from "../followups.js";
import { fetchWebFreshness, webSignalsToVerifications } from "../enrichweb.js";
import { extractWebSignals, enrichmentSummary } from "../webenrich.js";
import { fetchMomentum, momentumToVerification, momentumLabel } from "../momentum.js";
import { inferSector } from "../sectorinfer.js";
import { recordSearch, getInterests } from "../interests.js";
import { sectorPerformance, sectorRate } from "../sectorlearning.js";
import { autoProgress, AUTO_BAR } from "../autopilot.js";
import { synthesize } from "../synthesis.js";
import { pendingCronLeads, claimCronLeads } from "../cronleads.js";
import { can, isWriter, roleLabel, ROLES, ROLE_LABEL } from "../roles.js";
import { getCatalog, cacheCatalog, labelMap, teamByTag, teamGaps } from "../teamtags.js";
import * as chat from "../messaging.js";
import { FOLDERS, listFiles, requestUpload, requestDownload, removeFile, formatSize } from "../drive.js";
import { buildLeaderboard } from "../productivity.js";
import { newCall, resultToStatus, latestCallContext } from "../calls.js";
import { buildFollowUpTask, dueFollowupTasks } from "../callfollowup.js";
import { resolveNextActionIntent } from "../nextaction.js";
import { analyzeCall } from "../callai.js";
import { buildDashboard, actionableMemory } from "../commercialmemory.js";
import { decide } from "../decision.js";
import { buildVerdict, buildPriorityList } from "../verdict.js";
import { deriveOrderStatus } from "../orders.js";
import { orderIdFor, foldOrders, OUTCOME_STATUS } from "../ledger.js";
import { authorityLine, hasOverrideRegret } from "../authority.js";
import { buildBrief, briefToText, briefToMarkdown } from "../brief.js";
import { detectSignals, primarySignal, signalLever } from "../signals.js";
import { parseLeads, rowToLeadInput, findDuplicates } from "../importer.js";
import { operatorAnswer, OPERATOR_INTENTS, OPERATOR_LABELS, bucketize, parseCommand, applyCommand, commandAnswer, BUCKETS } from "../operator.js";
import * as tasks from "../tasks.js";
import * as presence from "../presence.js";
import * as activity from "../activity.js";
import { remoteCreateShare, remoteLoadShare } from "../statesync.js";

// Modo PRUEBA (solo lectura, sin sesión): cuando se abre un enlace ?preview=…
// el que mira no tiene cuenta. Mientras esté activo, la app se bloquea en
// lectura aunque alguien manipule el cliente. { scope, company, companyName }.
let previewMode = null;

// Atajo de permisos del usuario en sesión. La UI oculta lo que no puedes hacer
// (UX); la seguridad real la imponen las Edge Functions (403). No te fíes solo
// de esto. En modo prueba, todo es lectura.
const allow = (action) => previewMode ? (action === "read" || action === "stats") : can(auth.currentRole(), action);

// — Iconos de línea (stroke), nivel ejecutivo: reemplazan a los emojis. —
const _svg = (p, vb = "0 0 24 24") =>
  `<svg viewBox="${vb}" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONS = {
  folder: _svg('<path d="M3 7.5a2 2 0 0 1 2-2h3.6l1.8 2.2H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  folderOpen: _svg('<path d="M3 7.5a2 2 0 0 1 2-2h3.6l1.8 2.2H19a2 2 0 0 1 2 2"/><path d="M3 9.5h17.2a1 1 0 0 1 .96 1.27l-1.5 6A1.5 1.5 0 0 1 18.2 18H4.5A1.5 1.5 0 0 1 3 16.5z"/>'),
  dot: _svg('<circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/>'),
  chevR: _svg('<path d="M9 6l6 6-6 6"/>'),
  chevD: _svg('<path d="M6 9l6 6 6-6"/>'),
  search: _svg('<circle cx="11" cy="11" r="6.5"/><path d="M20.5 20.5l-4-4"/>'),
  radar: _svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 12l6-3.4"/>'),
  spark: _svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  mail: _svg('<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M4 7l8 5.5L20 7"/>'),
  phone: _svg('<path d="M6.5 4h3l1.4 4-2 1.4a12 12 0 0 0 5.7 5.7l1.4-2 4 1.4v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/>'),
  id: _svg('<rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16a2.6 2.6 0 0 1 5 0M14.5 10h4M14.5 13.5h4"/>'),
  trash: _svg('<path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M6.5 7l1 12.5A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>'),
};
const icon = (name) => ICONS[name] || "";
const iconEl = (name, cls = "") => el("span", { class: `ic ${cls}`.trim(), html: icon(name) });

const state = {
  config: { ...DEFAULT_CONFIG, ...store.getSavedConfig({}) },
  results: null,
  dataset: "researched", // researched (empresas reales) | demo (sintético de prueba)
  // Arranca en el Opportunity Feed: la superficie principal de trabajo (OCI +
  // buckets + Command Bar). "Hoy" sigue a un toque para el arranque operativo.
  view: "cards", // cards (feed) | today | pipeline | table | crm | learning
  filters: { sector: "all", city: "all", classification: "all", priority: "all", minEvidence: 0, minConfidence: 0, minEvStrength: 0, search: "" },
  feedCmd: null,      // foco activo del feed (salida de parseCommand)
  feedCmdText: "",    // texto en la Command Bar
};

let root;

export async function mount(rootEl) {
  root = rootEl;
  // Enlace de PRUEBA en solo-lectura: ?preview=TOKEN. Sin sesión ni registro.
  let previewTok = null;
  try { previewTok = new URLSearchParams(location.search).get("preview"); } catch { /* */ }
  if (previewTok) { await previewMount(previewTok); return; }
  // Entrada de demostración pública: ?try (o ?demo). Sin sesión, sin registro.
  // El destinatario de un email ve UNA orden comercial real en segundos — el
  // momento mágico — y solo entonces decide crear cuenta. Es lo que hace a
  // Connect vendible por email: el producto se demuestra en el clic.
  try {
    const sp = new URLSearchParams(location.search);
    const tv = sp.get("try"), dv = sp.get("demo");
    if (tv != null || dv != null) {
      // El valor del propio parámetro personaliza el saludo: ?try=Mhares → "Para
      // Mhares:". Así un DM en frío abre con el nombre del prospecto.
      await demoMount((tv || dv || "").trim());
      return;
    }
  } catch { /* */ }
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
  ensureRemoteRefresh(); // el latido del muelle: lo del otro entra sin recargar
  ensureHotkeys(); // ⌘K disponible en toda la app
  if (ECO_ENABLED) ensureEco(); // micro flotante (EC · Eco) — desactivado en flujo principal
  auth.syncRemoteColors().then(() => render()).catch(() => {}); // colores de firma consistentes entre dispositivos (best-effort)
  purgeWeakUserLeads(); // limpia leads crudos de baja puntuación de versiones previas
  await recompute();
  // Cada arranque parte del Reactor (sistema operativo de decisión) sin foco
  // residual de la sesión anterior. Igual que en un reload real: módulo limpio.
  state.view = "desk";
  state.feedCmd = null;
  state.feedCmdText = "";
  const _savedImportIds = loadRecentImportIds();
  if (_savedImportIds && _savedImportIds.length) {
    const _userLeadIds = new Set(store.getUserLeads().map((l) => l.id));
    const _alive = _savedImportIds.filter((id) => _userLeadIds.has(id));
    if (_alive.length) {
      state.feedCmd = { kind: "recent", ids: _alive, label: "Recién importados" };
      state.feedCmdText = "Recién importados";
      // Importación pendiente de revisión: ir al feed donde vive el focus-banner.
      state.view = "cards";
    } else {
      clearRecentImportIds(); // ids caducados: no crea foco engañoso
    }
  }
  render();

  // Reanuda el piloto automático si quedó en marcha (no para entre sesiones).
  if (autopilotState().on) { autoEmpty = 0; clearTimeout(autoTimer); autoTimer = setTimeout(autoTick, 1500); }

  // Absorbe lo que el cron capturó solo (de noche, sin la app abierta) y siembra
  // el cron con los nichos del mapa, para que cace lo que el cerebro decide.
  absorbCronLeads();
  seedCronFromMap();

  // Auto-actualización: cada ventana recarga sola cuando hay un deploy nuevo,
  // y muestra la versión real publicada en la cabecera.
  startAutoUpdate({ onVersion: setPublishedVersion });

  // Revalida el rol contra el servidor (si un admin lo cambió) y repinta el
  // badge/controles. Después trae la mesa compartida. Ambos best-effort.
  auth.refreshSession().then((r) => { if (r && r.ok) render(); }).catch(() => {});
  store.startSharedSync().then(async (r) => {
    if (r && r.ok) { await recompute(); await maybeSeedStarterPlan(); render(); }
  }).catch(() => {});

  // Latido de presencia: anuncia que estás y en qué andas. Best-effort; si no
  // hay red, simplemente no late (nadie te ve como presente, que es lo honesto).
  presence.startHeartbeat(() => ({ status: myStatus, activity: currentActivity() }));
}

// Modo PRUEBA: abre un enlace compartido en solo-lectura, sin sesión. Trae el
// estado del servidor (no empuja nada nunca), lo pinta bloqueado y, si el enlace
// apunta a una empresa, abre su ficha directamente. El que mira no se registra.
async function previewMount(token) {
  clear(root);
  root.appendChild(el("div", { class: "auth-screen" }, [
    el("div", { class: "auth-card" }, [
      el("div", { class: "auth-logo", html: 'CONNECT <span class="logo-sub">· vista de prueba</span>' }),
      el("p", { class: "auth-tagline", text: "Abriendo la vista compartida…" }),
    ]),
  ]));
  let r;
  try { r = await remoteLoadShare(token); } catch { r = null; }
  if (!r || !r.ok) {
    clear(root);
    root.appendChild(el("div", { class: "auth-screen" }, [
      el("div", { class: "auth-card" }, [
        el("div", { class: "auth-logo", html: 'CONNECT' }),
        el("p", { class: "auth-msg", text: (r && r.error) || "Este enlace de prueba no es válido o ha caducado." }),
      ]),
    ]));
    return;
  }
  previewMode = { scope: r.scope || "workspace", company: r.company || null, companyName: r.companyName || null };
  // Hidrata el estado compartido en local SIN empujar (merge no destructivo).
  try { if (r.data) store.importState(r.data, { replace: false }); } catch { /* */ }
  state.view = "cards";
  await recompute();
  render();
  // Enlace a una ficha concreta: ábrela directamente.
  if (previewMode.scope === "company" && previewMode.company) {
    const lead = (state.results?.all || []).find((o) => o.id === previewMode.company);
    if (lead) openCase(lead.id);
  }
}

// ============================================================================
// Momento mágico — la entrada pública (?try / ?demo). Sin sesión ni registro.
// El destinatario de un email ve UNA orden comercial real, computada sobre datos
// reales del sistema, en segundos. Una promesa, una orden, una llamada a la
// acción. Es la superficie que hace a Connect vendible por email automatizado.
// ============================================================================
async function demoMount(recipient = "") {
  previewMode = { scope: "demo" }; // bloquea escrituras de red, como la vista de prueba
  state.dataset = "demo";
  clear(root);
  root.appendChild(el("div", { class: "demo-screen" }, [
    el("div", { class: "demo-card" }, [
      el("div", { class: "auth-logo", html: 'CONNECT' }),
      el("p", { class: "auth-tagline", text: "Calculando tu primera orden…" }),
    ]),
  ]));

  try { await recompute(); } catch { /* datos demo: nunca bloquea */ }

  const now = Date.now();
  const model = feedModel();
  const actNow = (model.buckets.actNow || [])
    .slice()
    .sort((a, b) => (b.decision?.oci || 0) - (a.decision?.oci || 0));
  const top = buildPriorityList({ actNow, tracking: {}, now })[0] || null;

  const startCTA = (label) => el("button", {
    class: "demo-cta",
    text: label,
    onClick: () => { previewMode = null; state._authTab = "create"; renderAuth(); },
  });

  // La orden real, o un estado honesto si el dataset no produjo ninguna.
  const orderBlock = top
    ? el("div", { class: "demo-order" }, [
        el("div", { class: "ord-label", text: "TU PRIMERA ORDEN" }),
        el("div", { class: "ord-command" }, [
          el("span", { class: "ord-verb", text: top.status === "not_called" ? "PRIMER CONTACTO CON" : "LLAMA A" }),
          el("span", { class: "ord-company", text: top.company.toUpperCase() }),
        ]),
        el("div", { class: "ord-oci", text: `OCI ${top.oci}` }),
        el("div", { class: "ord-context" }, [
          top.motive ? el("div", { class: "ord-ctx-line", text: top.motive }) : null,
          top.riskLine ? el("div", { class: "ord-ctx-line", text: top.riskLine }) : null,
        ].filter(Boolean)),
      ])
    : el("div", { class: "demo-order" }, [
        el("div", { class: "ord-label", text: "TU PRIMERA ORDEN" }),
        el("div", { class: "demo-empty", text: "Pega tus empresas y Connect emite la primera orden al instante." }),
      ]);

  clear(root);
  root.appendChild(el("div", { class: "demo-screen" }, [
    el("div", { class: "demo-wrap" }, [
      el("div", { class: "auth-logo", html: 'CONNECT' }),
      recipient ? el("p", { class: "demo-for", text: `Para ${recipient}:` }) : null,
      el("h1", { class: "demo-head", text: "Tu siguiente movimiento comercial, decidido." }),
      el("p", { class: "demo-sub", text: "No es un CRM. Connect te dice a quién llamar hoy, y por qué. Tú solo obedeces." }),
      orderBlock,
      el("div", { class: "demo-steps" }, [
        el("div", { class: "demo-step" }, [el("span", { class: "demo-step-n", text: "1" }), el("span", { text: "Pegas tu caos comercial." })]),
        el("div", { class: "demo-step" }, [el("span", { class: "demo-step-n", text: "2" }), el("span", { text: "Connect emite una orden: a quién, por qué, qué pasa si esperas." })]),
        el("div", { class: "demo-step" }, [el("span", { class: "demo-step-n", text: "3" }), el("span", { text: "Obedeces. El sistema registra el resultado y aprende." })]),
      ]),
      startCTA("PROBAR CON MIS EMPRESAS"),
      el("p", { class: "demo-foot", text: "Empieza en menos de un minuto. Sin instalar nada." }),
    ]),
  ]));
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

// Refresco en vivo: cuando el latido baja cambios del otro, repintamos. Pero con
// cuidado — no arrancarle el teclado a quien escribe ni repintar a lo loco. Se
// agrupa con un respiro y se aplaza si hay un campo de texto enfocado. Los
// modales viven en document.body, así que render() (que limpia root) no los toca.
let remoteSubscribed = false;
let remoteRenderPending = false;
function ensureRemoteRefresh() {
  if (remoteSubscribed) return;
  remoteSubscribed = true;
  store.onRemoteChange(scheduleRemoteRender);
}
function scheduleRemoteRender() {
  if (remoteRenderPending) return;
  remoteRenderPending = true;
  setTimeout(flushRemoteRender, 400);
}
function flushRemoteRender() {
  const a = typeof document !== "undefined" ? document.activeElement : null;
  const typing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable);
  if (typing) { setTimeout(flushRemoteRender, 1500); return; } // espera a que termine
  remoteRenderPending = false;
  recompute().then(render).catch(() => render());
}
// Cuando hay sesión local/sin sincronizar, el badge invita a reconectar.
const syncClickable = (s) => s === "local" || s === "offline";
function syncText(s) {
  const label = SYNC_LABEL[s] || "";
  return syncClickable(s) && label ? `${label} · reconectar` : label;
}
// Reconecta: re-login para coger un token estable (arregla "Solo local"). Con la
// corrección del servidor, volver a entrar ya no rota el token de nadie.
function reconnectSession() {
  if (!syncClickable(store.getSyncState())) return;
  auth.logout();
  mount(root);
}
function updateSyncBadge(s) {
  if (!root) return;
  const node = root.querySelector(".sync-badge");
  if (!node) return;
  const label = syncText(s);
  node.textContent = label;
  node.className = `sync-badge sync-${s}${syncClickable(s) ? " sync-click" : ""}`;
  node.style.display = label ? "" : "none";
}

// ---- Estado vacío unificado -------------------------------------------------
// Un solo componente para todos los "aún no hay nada / nada coincide". Da un
// tono coherente en cada vista: un icono tenue, una línea clara y, opcional, una
// acción. Antes cada vista pintaba su propio vacío con clases y pesos distintos.
//   emptyNote("Aún no hay tareas.", { icon: "✓", action: {label, onClick} })
function emptyNote(text, opts = {}) {
  const kids = [];
  if (opts.icon !== null) kids.push(el("div", { class: "empty-ic", text: opts.icon || "◍" }));
  kids.push(el("p", { class: "empty-line", text }));
  if (opts.sub) kids.push(el("p", { class: "empty-sub", text: opts.sub }));
  if (opts.action) kids.push(el("button", { class: "btn", text: opts.action.label, onClick: opts.action.onClick }));
  return el("div", { class: `empty-note${opts.compact ? " empty-note-sm" : ""}` }, kids);
}

// Estado de CARGA con spinner: en vez de un "Cargando…" plano que parece colgado,
// un giro tenue + texto. Mismo registro visual que emptyNote.
function loadingNote(text = "Cargando…", opts = {}) {
  return el("div", { class: `empty-note${opts.compact ? " empty-note-sm" : ""} loading-note` }, [
    el("div", { class: "spinner", "aria-hidden": "true" }),
    el("p", { class: "empty-line", text }),
  ]);
}

// Estado de ERROR con reintento: un error de red deja de ser un callejón sin
// salida — si se pasa onRetry, ofrece "Reintentar". Mismo molde que emptyNote.
function errorNote(text, onRetry, opts = {}) {
  return emptyNote(text || "No se pudo cargar.", {
    icon: "⚠", compact: opts.compact,
    action: onRetry ? { label: "Reintentar", onClick: onRetry } : undefined,
  });
}

// ---- Puerta de acceso (login / crear usuario) ------------------------------
function renderAuth() {
  clear(root);
  const tab = state._authTab || "login";
  const msg = el("p", { class: "auth-msg" });

  const nameI = el("input", { class: "auth-f", placeholder: tab === "create" ? "Nombre y apellido" : "Usuario", autocomplete: "username" });
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
    const nm = String(nameI.value || "").trim();
    if (nm.length < 2) { msg.textContent = "El nombre debe tener al menos 2 caracteres."; return; }
    // Equipo: NOMBRE + al menos un APELLIDO. Se avisa aquí, antes de la ronda de
    // etiquetas, para no rebotar contra el servidor tras elegirlas (mismo criterio).
    if (nm.replace(/\s+/g, " ").split(" ").filter(Boolean).length < 2) { msg.textContent = "Escribe tu NOMBRE y un APELLIDO (los dos)."; return; }
    if (String(passI.value || "").length < 4) { msg.textContent = "La contraseña debe tener al menos 4 caracteres."; return; }
    // Ronda de etiquetas: tras nombre y contraseña, cada uno decide qué etiquetas
    // lo definen ANTES de crear la cuenta (se guardan en el registro).
    renderTagRound({ name: nm, password: passI.value, color: chosenColor, invite: state._invite });
  };

  const primary = el("button", { class: "btn-primary auth-go", text: tab === "login" ? "Entrar" : "Crear usuario y entrar" });
  primary.addEventListener("click", () => { (tab === "login" ? doLogin : doCreate)(); });
  passI.addEventListener("keydown", (e) => { if (e.key === "Enter") primary.click(); });

  const switcher = el("button", { class: "auth-switch", text: tab === "login" ? "¿No tienes usuario? Crear uno" : "Ya tengo usuario — entrar" });
  switcher.addEventListener("click", () => { state._authTab = tab === "login" ? "create" : "login"; renderAuth(); });

  const card = el("div", { class: "auth-card" }, [
    el("div", { class: "auth-whale" }, [whaleMark()]),
    el("div", { class: "auth-logo", html: 'CONNECT' }),
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

// Selector de etiquetas (chips multi-selección). `selected` es un Set de slugs
// que muta in situ; `onChange` permite reaccionar (p. ej. autoguardar). Reusado
// por la ronda de registro y por el perfil.
function tagPickerChips(catalog, selected, onChange) {
  const chips = el("div", { class: "tag-pick" });
  const paint = () => {
    clear(chips);
    const list = (catalog && catalog.length) ? catalog : getCatalog();
    for (const t of list) {
      const on = selected.has(t.slug);
      const b = el("button", { class: `tag-chip ${on ? "on" : ""}`, type: "button", text: t.label });
      b.addEventListener("click", () => { on ? selected.delete(t.slug) : selected.add(t.slug); paint(); onChange && onChange(); });
      chips.appendChild(b);
    }
    if (!list.length) chips.appendChild(el("p", { class: "config-note", text: "Aún no hay etiquetas en el catálogo." }));
  };
  paint();
  return { chips, repaint: paint };
}

// Ronda de etiquetas: tras nombre + contraseña, cada uno decide qué etiquetas lo
// definen. Crea la cuenta CON esas etiquetas y entra. Mandatorio pasar por aquí,
// pero se puede entrar sin marcar ninguna (revisables luego desde el perfil).
function renderTagRound(creds) {
  clear(root);
  const selected = new Set();
  const msg = el("p", { class: "auth-msg" });
  const { chips } = tagPickerChips(getCatalog(), selected);

  const enter = el("button", { class: "btn-primary auth-go", text: "Entrar al equipo" });
  const busy = (on) => { enter.disabled = on; enter.textContent = on ? "Creando tu usuario…" : "Entrar al equipo"; };
  enter.addEventListener("click", async () => {
    busy(true); msg.textContent = "";
    const r = await auth.createUserAsync(creds.name, creds.password, creds.color, creds.invite, [...selected]);
    if (!r.ok) { busy(false); msg.textContent = r.error; return; }
    await auth.loginAsync(creds.name, creds.password);
    mount(root);
  });
  const back = el("button", { class: "auth-switch", text: "← Volver", onClick: () => { state._authTab = "create"; renderAuth(); } });

  const card = el("div", { class: "auth-card auth-tags" }, [
    el("div", { class: "auth-logo", html: 'CONNECT <span class="logo-sub">· tu perfil</span>' }),
    el("p", { class: "auth-tagline", text: `Hola, ${creds.name}. ¿En qué te reconoces?` }),
    el("p", { class: "config-note", text: "Marca todo lo que encaje — puedes ser varias cosas a la vez (Dirección, RRHH, Psicología…). Así el equipo sabe a quién acudir. Lo cambias cuando quieras." }),
    chips, enter, msg, back,
  ]);
  root.appendChild(el("div", { class: "auth-screen" }, [card]));
}

// ---- Persistencia del foco "Recién importados" entre sesiones ---------------
// El foco vive en memoria; esta clave lo ancla a localStorage para restaurarlo
// tras reload. Se limpia cuando el usuario lo descarta explícitamente.
const RECENT_IMPORT_KEY = "oi:recentImportIds";
function saveRecentImportIds(ids) {
  try { localStorage.setItem(RECENT_IMPORT_KEY, JSON.stringify(ids)); } catch { /* */ }
}
function loadRecentImportIds() {
  try { const v = localStorage.getItem(RECENT_IMPORT_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function clearRecentImportIds() {
  try { localStorage.removeItem(RECENT_IMPORT_KEY); } catch { /* */ }
}

// Limpia el foco activo: descarta el estado en memoria, el texto de la barra y
// (si era "recent") el ancla de localStorage para no restaurarlo al recargar.
function clearFeedCmd() {
  if (state.feedCmd && state.feedCmd.kind === "recent") clearRecentImportIds();
  state.feedCmd = null;
  state.feedCmdText = "";
  render();
}

// Quita de "tus leads" los que no llegan al listón de calidad (p.ej. los 31.7
// que el agente antiguo metía). Así el ranking no se llena de cifras bajas.
// Leads con _source (importados por el usuario) nunca se purgan: son suyos.
function purgeWeakUserLeads() {
  try {
    const leads = store.getUserLeads();
    for (const l of leads) {
      if (l._source) continue; // el usuario lo puso deliberadamente; no tocar
      const s = scoreOpportunity(l, state.config);
      if (s.confidence < 70) store.removeUserLead(l.id);
    }
  } catch { /* no bloquear el arranque */ }
}

function activeCandidates() {
  // "Mi lista": trabaja SOLO tus leads importados — tu pipeline real, sin demo.
  // En otro caso: dataset base + tanda real de Mallorca + tus leads añadidos.
  const userLeads = store.getUserLeads();
  const base = state.dataset === "mine"
    ? userLeads
    : (state.dataset === "researched" ? RESEARCHED : SEED).concat(MALLORCA).concat(userLeads);
  // Aplica las verificaciones manuales del analista antes de puntuar: los
  // huecos confirmados se vuelven evidencia citada y suben la puntuación.
  const verifications = store.getVerifications();
  const withVerif = Object.keys(verifications).length
    ? base.map((o) => (verifications[o.id] ? store.applyVerifications(o, verifications[o.id]) : o))
    : base;
  // Alimenta la PUNTUACIÓN con los huecos web REALES detectados (signals.js): un
  // hueco observable (sin web, solo redes, gratuito, sin HTTPS, web obsoleta) es
  // una palanca de acción concreta → actionableLever. Solo añade donde hay señal
  // real y nunca pisa una palanca ya verificada más fuerte; el resto queda intacto.
  return withVerif.map(withSignalLever);
}

function withSignalLever(o) {
  // Solo añadimos la palanca cuando el lead NO tiene ya una (de seed, de alta
  // manual o de una lectura real). Nunca pisamos evidencia más rica ni re-derivamos
  // sobre la nuestra: si ya hay actionableLever, se respeta tal cual.
  if (o.signals && o.signals.actionableLever) return o;
  const lever = signalLever(o);
  if (!lever) return o;
  return { ...o, signals: { ...(o.signals || {}), actionableLever: { level: lever.level, note: lever.note } } };
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
  // Configuración técnica (dataset, país, conservadurismo…): solo para ADMIN y
  // fuera de la vista diaria del trabajador. En modo prueba, solo el aviso.
  if (previewMode) {
    main.appendChild(previewBanner()); // aviso "solo lectura"
  } else if (allow("manage_roles") && state.view !== "cards") {
    // Configuración técnica fuera de Mapa: la primera pantalla abre en la
    // decisión, no en ajustes. Sigue disponible en el resto de vistas.
    const cfg = el("details", { class: "config-wrap" }, [
      el("summary", { class: "config-summary", text: "⚙︎ Configuración de búsqueda y datos" }),
      configPanel(),
    ]);
    cfg.open = state._cfgOpen ?? false;
    cfg.addEventListener("toggle", () => { state._cfgOpen = cfg.open; });
    main.appendChild(cfg);
  }
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
  presence.beatNow(); // tu "en qué andas" se actualiza al instante al cambiar de vista
}

// Pulso del muelle: el gadget de cabecera que engancha. La llama es tu racha de
// días trabajando en la app; el punto se enciende si tienes posits sin ver. Un
// toque te lleva al Muelle. Glanceable — un número y un punto, sin texto.
function muellePulse() {
  const me = auth.currentUser()?.name || "";
  const n = posits.unread(me);
  const days = posits.streak(me);
  return el("button", {
    class: `muelle-pulse${n ? " has-unread" : ""}`,
    title: `${n ? `${n} posit${n === 1 ? "" : "s"} sin ver · ` : ""}Racha: ${days} día${days === 1 ? "" : "s"} seguidos en la app`,
    onClick: () => goView("muelle"),
  }, [
    el("span", { class: "pulse-flame", text: "🔥" }),
    el("span", { class: "pulse-streak", text: String(days) }),
    n ? el("span", { class: "pulse-dot", text: String(n) }) : null,
  ]);
}

function header() {
  return el("header", { class: "app-head" }, [
    el("div", { class: "brand" }, [
      el("div", { class: "brand-lock" }, [
        whaleMark(),
        el("span", { class: "logo", html: 'CONNECT' }),
      ]),
    ]),
    el("div", { class: "head-actions" }, [
      state.dataset !== "mine"
        ? el("span", { class: "demo-badge", text: "DATOS DEMO", title: "Dataset de ejemplo. Importa tu lista o conecta una fuente real para trabajar datos de verdad." })
        : null,
      userChip(),
      syncBadge(),
    ]),
  ]);
}

// Versión publicada real (hora del último deploy, de VERSION.txt). Sustituye a
// la etiqueta fija: así la cabecera dice siempre la verdad de qué versión corre.
let pubLabel = "";
function setPublishedVersion(v) {
  if (!v) return;
  const d = new Date(v);
  pubLabel = isNaN(d.getTime())
    ? `v · ${String(v).slice(0, 16)}`
    : `actualizado ${d.toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
  // La versión vive ahora en el menú de perfil (cabecera más calmada): si está
  // abierto, refréscalo en sitio.
  if (typeof document !== "undefined") { const n = document.body.querySelector?.(".prof-ver"); if (n) n.textContent = pubLabel; }
}

// Indicador discreto del estado de sincronización con el servidor compartido.
// Es un botón: si la sesión está en local, un toque reconecta (re-login).
function syncBadge() {
  const s = store.getSyncState();
  const label = syncText(s);
  return el("button", {
    class: `sync-badge sync-${s}${syncClickable(s) ? " sync-click" : ""}`,
    text: label,
    style: label ? "" : "display:none",
    title: syncClickable(s) ? "Reconectar: vuelve a entrar para sincronizar con el equipo" : "Estado de sincronización con el servidor compartido",
    onClick: reconnectSession,
  });
}

// Chip del usuario en sesión: inicial sobre su color de firma + cerrar sesión.
function userChip() {
  if (previewMode) {
    return el("span", { class: "user-chip preview-chip", title: "Estás viendo una vista de prueba en solo lectura. Para operar, pide acceso a un admin." }, [
      el("span", { class: "role-badge role-viewer", text: "PRUEBA" }),
      el("span", { class: "user-name", text: "Solo lectura" }),
    ]);
  }
  const u = auth.currentUser();
  if (!u) return el("span");
  const dot = el("span", { class: "user-dot", style: `background:${u.color}`, text: u.avatar || u.name[0].toUpperCase() });
  const chip = el("button", { class: "user-chip", title: `${u.name} · ${tierLabel(u.tier)} · ${roleLabel(u.role)} — pulsa para tu perfil` }, [
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

const PROFILE_EMOJIS = ["◆", "✦", "★", "▲", "●", "◇", "✧", "◈", "❖", "⬢", "⬡", "⚡", "△", "□", "○", "✕"];

// Pinta un enlace de PRUEBA (?preview=TOKEN) con botón de copiar. Reusado por el
// perfil (toda la app) y por la ficha (una empresa).
function renderShareLink(box, token) {
  clear(box);
  const base = String(location.href || "").split("?")[0].split("#")[0];
  const link = `${base}?preview=${encodeURIComponent(token)}`;
  const inp = el("input", { class: "prof-link", value: link, readonly: "" });
  const copy = el("button", { class: "btn", text: "Copiar enlace" });
  copy.addEventListener("click", () => {
    const done = () => { copy.textContent = "✓ Copiado"; setTimeout(() => (copy.textContent = "Copiar enlace"), 1400); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done).catch(done); else done();
  });
  box.appendChild(el("p", { class: "config-note", text: "Solo lectura · sin registro · caduca en 30 días." }));
  box.appendChild(el("div", { class: "prof-linkrow" }, [inp, copy]));
}

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
  const renderInviteLink = (code, role) => {
    clear(inviteBox);
    const link = `${base}?invite=${encodeURIComponent(code)}`;
    const linkInput = el("input", { class: "prof-link", value: link, readonly: "" });
    const copyL = el("button", { class: "btn", text: "Copiar enlace" });
    copyL.addEventListener("click", () => {
      const done = () => { copyL.textContent = "✓ Copiado"; setTimeout(() => (copyL.textContent = "Copiar enlace"), 1400); };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done).catch(done); else done();
    });
    const typeLabel = role === "analyst" ? "Analista" : role === "viewer" ? "Solo lectura" : "Vendedor";
    inviteBox.appendChild(el("p", { class: "config-note", html: `Da acceso como <b>${typeLabel}</b> · enlace de un solo uso · caduca en 14 días.` }));
    inviteBox.appendChild(el("div", { class: "prof-linkrow" }, [linkInput, copyL]));
  };
  // Tipo de cuenta que se concede con la invitación. "Vendedor" es el perfil de
  // trabajo (Dani): bajo el capó es el rol "editor" (escribe, CRM, seguimiento,
  // cierre, agenda) — exactamente lo que necesita quien llama. No se ofrece admin
  // por enlace (un admin se promueve a mano, no con un link que puede reenviarse).
  const ACCOUNT_TYPES = [
    { role: "editor", label: "Vendedor — llama y gestiona sus leads, CRM y agenda" },
    { role: "analyst", label: "Analista — lee, analiza y exporta (no edita el CRM)" },
    { role: "viewer", label: "Solo lectura — ve ranking y dossiers, sin tocar" },
  ];
  const roleSel = el("select", { class: "prof-rolesel" },
    ACCOUNT_TYPES.map((t) => el("option", { value: t.role, text: t.label })));
  const genBtn = el("button", { class: "btn-primary", text: "Generar invitación", onClick: async () => {
    genBtn.disabled = true; genBtn.textContent = "Generando…";
    const r = await auth.createInvite(roleSel.value || "editor");
    genBtn.disabled = false; genBtn.textContent = "Generar otra invitación";
    if (r.ok && r.code) renderInviteLink(r.code, roleSel.value);
    else inviteBox.appendChild(el("p", { class: "sec-msg err", text: r.error || "No se pudo." }));
  } });

  // Tus etiquetas: el usuario revisa/ajusta las que lo definen (autoguardado).
  const myTags = new Set(auth.getTags() || []);
  const tagStatus = el("span", { class: "role-status" });
  const saveTags = async () => {
    tagStatus.textContent = "Guardando…";
    const r = await auth.setTags([...myTags]);
    tagStatus.textContent = r.ok ? "✓" : (r.error || "Error");
    setTimeout(() => { if (tagStatus.textContent === "✓") tagStatus.textContent = ""; }, 1500);
  };
  const tagPick = tagPickerChips(getCatalog(), myTags, saveTags);
  auth.tagCatalog().then((r) => { if (r && r.ok && Array.isArray(r.tags)) { cacheCatalog(r.tags); tagPick.repaint(); } }).catch(() => {});

  // Compartir vista de prueba (toda la app) — la pueden generar los roles con
  // permiso de escritura, sin pedir permiso a nadie y sin que el que mira se
  // registre. Enlace de solo lectura.
  const shareBox = el("div", { class: "prof-invitebox" });
  const shareBtn = el("button", { class: "btn", text: "Generar enlace de prueba", onClick: async () => {
    shareBtn.disabled = true; shareBtn.textContent = "Generando…";
    let r; try { r = await remoteCreateShare(auth.getToken(), "workspace"); } catch { r = null; }
    shareBtn.disabled = false; shareBtn.textContent = "Generar otro enlace";
    if (r && r.ok && r.token) renderShareLink(shareBox, r.token);
    else shareBox.appendChild(el("p", { class: "sec-msg err", text: (r && r.error) || "No se pudo (sin conexión)." }));
  } });

  overlay.appendChild(el("div", { class: "pb-panel prof-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", { class: "prof-id" }, [dot, el("div", {}, [
        el("div", { class: "prof-name", text: u.name }),
        el("div", { class: "prof-role", text: `${tierLabel(u.tier)} · ${roleLabel(u.role)}` }),
      ])]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    el("div", { class: "prof-sec" }, [el("h4", { text: "Tu avatar" }), picker]),
    el("div", { class: "prof-sec" }, [
      el("h4", {}, [el("span", { text: "Quién eres en el equipo " }), tagStatus]),
      el("p", { class: "config-note", text: "Las etiquetas que te definen. Puedes llevar varias — el equipo sabrá a quién acudir." }),
      tagPick.chips,
    ]),
    el("div", { class: "prof-sec" }, [
      el("h4", { text: "Tus notas privadas" }),
      el("p", { class: "config-note", text: "Solo en este dispositivo. No se comparten ni suben al servidor." }),
      notes,
    ]),
    isWriter(u.role) ? el("div", { class: "prof-sec" }, [
      el("h4", { text: "Compartir una vista de prueba" }),
      el("p", { class: "config-note", text: "Un enlace de solo lectura de toda la app, para enseñarla sin que la otra persona tenga que registrarse. No pide permiso a nadie." }),
      shareBtn, shareBox,
    ]) : null,
    el("div", { class: "prof-sec" }, [securitySection()]),
    el("div", { class: "prof-sec" }, [
      el("h4", { text: "Invitar a alguien" }),
      allow("manage_roles")
        ? el("div", {}, [
            el("p", { class: "config-note", text: "Registro cerrado: solo entra quien tenga una invitación tuya. Elige el tipo de cuenta y genera un enlace de un solo uso. Su nivel y etiquetas los ajustas luego en El equipo." }),
            el("label", { class: "prof-rolewrap" }, [el("span", { text: "Tipo de cuenta" }), roleSel]),
            genBtn, inviteBox,
          ])
        : el("p", { class: "config-note", text: "El registro es por invitación. Pide a un admin (PABLO/JAVI) que te genere el enlace." }),
    ]),
    el("div", { class: "prof-foot" }, [
      el("span", { class: "prof-ver", title: "Versión publicada que estás usando", text: pubLabel || "comprobando versión…" }),
      el("button", { class: "btn-danger", text: "Cerrar sesión", onClick: () => { if (confirm(`¿Cerrar sesión de ${u.name}?`)) { presence.stopHeartbeat(); auth.logout(); close(); mount(root); } } }),
    ]),
  ]));
  document.body.appendChild(overlay);
}

// Navegación premium en DOS niveles: pocas zonas grandes arriba (la decisión de
// "en qué estoy") y las vistas de cada zona debajo. Menos superficie, más
// dirección. La paleta ⌘K salta a cualquier sitio sin tocar el ratón.
// Navegación en dos niveles: ZONAS (verbo dominante del trabajo) y, dentro,
// sub-vistas. Sigue el bucle diario: trabajar → captar → cerrar → hablar (muelle)
// → saber. «Saber» reúne lo que el equipo aprende y lo que estudia (antes dos
// zonas sueltas, Memoria y Formación): menos botones arriba, mismo contenido.
// Cada sub-vista es [clave, etiqueta, capacidad?]. La capacidad opcional la
// esconde a quien no la tiene: un viewer/analyst (solo lectura) no ve «Buscar»
// (descubrir) ni el tablero «CRM» (mover) — entra a su mundo sin botones que no
// puede pulsar. El editor (Javi) las ve todas; el admin (Pablo), además «Equipo».
// Navegación principal: 3 zonas. Mapa es el feed central. Captar agrupa el
// descubrimiento activo. Avanzado recoge todo lo operativo/interno sin abarrotar
// la barra — las vistas siguen vivas en viewArea() y accesibles por ⌘K.
function zonesForUser() {
  // En modo prueba (solo lectura, sin sesión): solo mirar el mapa de oportunidades.
  if (previewMode) {
    return [{ key: "map", label: "Mapa", views: [["cards", "Oportunidades"]] }];
  }

  // Desk: la superficie héroe de prospección. Primera superficie visible. Sin
  // gate de permiso — quien puede entrar a la app ve el desk.
  const reactorZone = { key: "desk", label: "Desk", primary: true, views: [["desk", "Desk"]] };

  // Mapa: el feed completo de oportunidades. Siempre visible.
  const mapZone = { key: "map", label: "Mapa", primary: true, views: [["cards", "Oportunidades"]] };

  // Captar: descubrimiento activo (gated por permiso discover). Zona secundaria:
  // no ocupa la barra principal; se alcanza por ⌘K y aparece al estar dentro.
  const captureViews = [["search", "Buscar", "discover"]].filter(([,, cap]) => !cap || allow(cap));
  const captureZone = captureViews.length ? { key: "capture", label: "Captar", views: captureViews } : null;

  // Avanzado: ADELGAZADO a lo esencial operativo (Hoy · Tareas · Agenda · CRM).
  // El resto (Embudo, Caja Negra, Posits, Aprendizaje, Dossiers, equipo) sigue
  // vivo y accesible por ⌘K (ver extraViews) — no abarrota la navegación.
  const advancedViews = [
    ["today", "Hoy"],
    ["tasks", "Tareas"],
    ["agenda", "Agenda"],
    ["crm", "CRM", "crm"],
  ].filter(([,, cap]) => !cap || allow(cap));
  const advancedZone = advancedViews.length ? { key: "advanced", label: "Avanzado", views: advancedViews } : null;

  return [reactorZone, mapZone, captureZone, advancedZone].filter(Boolean);
}

// Vistas de cola larga: vivas pero NO en la barra. Solo accesibles por ⌘K, para
// mantener la navegación en 2 zonas primarias sin perder ninguna función.
function extraViews() {
  const out = [
    ["pipeline", "Embudo"],
    ["memory", "Caja Negra", "crm"],
    ["muelle", "Posits"],
    ["learning", "Aprendizaje"],
    ["training", "Dossiers"],
  ].filter(([,, cap]) => !cap || allow(cap));
  if (allow("write")) {
    out.push(["presence", "Ahora"], ["feed", "Feed"], ["chat", "Chat"], ["board", "Mejoras"], ["dms", "Privados"], ["drive", "Drive"], ["leaderboard", "Productividad"]);
    if (allow("manage_roles")) out.push(["users", "Personas"]);
  }
  return out;
}
function zoneOfView(view) {
  for (const z of zonesForUser()) if (z.views.some(([k]) => k === view)) return z.key;
  return "map"; // fallback al mapa si la vista no está en ninguna zona visible
}

function tabs() {
  const zs = zonesForUser();
  const activeZone = zoneOfView(state.view);
  // Barra de 2 zonas: solo las primarias (Reactor · Mapa). Una zona secundaria
  // (Captar / Avanzado) aparece SOLO mientras estás dentro de ella; se entra por
  // ⌘K. Así la navegación por defecto es mínima sin perder nada.
  const visible = zs.filter((z) => z.primary || z.key === activeZone);
  const zoneBar = el("nav", { class: "zones" }, [
    ...visible.map((z) => el("button", {
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
    // Cola larga (no en la barra): sigue accesible aquí, en la paleta.
    for (const [key, label] of extraViews())
      out.push({ kind: "nav", label: `Ir a ${label}`, run: () => { close(); goView(key); } });
    out.push({ kind: "act", label: "Buscar oportunidades (recalcular)", run: async () => { close(); await recompute(); goView("cards"); } });
    out.push({ kind: "act", label: "Cerrar sesión", run: () => { close(); if (confirm("¿Cerrar sesión?")) { presence.stopHeartbeat(); auth.logout(); mount(root); } } });
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

// Navegación por teclado del Desk (Linear-grade): ↑↓/j/k mueven la selección,
// ↵ abre la ficha, C redacta el contacto. Manipula el DOM directamente (sin
// re-render) para que sea fluido. Inactivo fuera del Desk o con un overlay abierto.
let deskKeysBound = false;
function ensureDeskKeys() {
  if (deskKeysBound) return;
  deskKeysBound = true;
  document.addEventListener("keydown", (e) => {
    if (state.view !== "desk" || !auth.currentUser()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.body.querySelector(".draft-overlay, .cmd-overlay, .case-overlay, .modal")) return;
    const tag = (e.target && e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    const rows = [...document.querySelectorAll(".desk-row")];
    if (!rows.length) return;
    let i = rows.findIndex((r) => r.classList.contains("sel"));
    const k = e.key;
    if (k === "ArrowDown" || k === "j") i = Math.min((i < 0 ? -1 : i) + 1, rows.length - 1);
    else if (k === "ArrowUp" || k === "k") i = Math.max((i < 0 ? 0 : i) - 1, 0);
    else if (k === "Enter") { (rows[i] || rows[0]).click(); return; }
    else if (k === "c" || k === "C") { const b = (rows[i] || rows[0]).querySelector(".dr-go"); if (b) b.click(); return; }
    else return;
    e.preventDefault?.();
    rows.forEach((r) => r.classList.remove("sel"));
    const sel = rows[i];
    if (sel) { sel.classList.add("sel"); sel.scrollIntoView({ block: "nearest" }); }
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
      field("Umbral ágil → profunda (confianza)", xnThr),
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
  if (state.view === "desk") area.appendChild(deskView());
  else if (state.view === "today") area.appendChild(todayView());
  else if (state.view === "tasks") area.appendChild(tasksView());
  else if (state.view === "agenda") area.appendChild(agendaView());
  else if (state.view === "pipeline") area.appendChild(pipelineView());
  else if (state.view === "table") area.appendChild(tableView());
  else if (state.view === "cards") area.appendChild(cardsView());
  else if (state.view === "crm") area.appendChild(crmView());
  else if (state.view === "memory") area.appendChild(memoryView());
  else if (state.view === "search") area.appendChild(searchView());
  else if (state.view === "users") area.appendChild(usersView());
  else if (state.view === "chat") area.appendChild(chatView("general"));
  else if (state.view === "board") area.appendChild(chatView("mejoras"));
  else if (state.view === "dms") area.appendChild(dmsView());
  else if (state.view === "drive") area.appendChild(driveView());
  else if (state.view === "presence") area.appendChild(presenceView());
  else if (state.view === "feed") area.appendChild(activityView());
  else if (state.view === "leaderboard") area.appendChild(leaderboardView());
  else if (state.view === "training") area.appendChild(trainingView());
  else if (state.view === "muelle") area.appendChild(muelleView());
  else area.appendChild(learningView());
  return area;
}

// Etiqueta del nivel jerárquico (organigrama). 0 dirección · 1 · 2 equipo · 3+.
function tierLabel(t) {
  return `Nivel ${t}` + ({ 0: " · Dirección", 1: " · Segundo nivel", 2: " · Equipo" }[t] || "");
}

// Editor de etiquetas de OTRA persona (solo admin). Guarda al instante; `onSaved`
// repinta la lista. Pablo monta los perfiles sin esperar a que cada uno se etiquete.
function openTagEditor(user, onSaved) {
  const selected = new Set(user.tags || []);
  const status = el("span", { class: "role-status" });
  const save = async () => {
    status.textContent = "Guardando…";
    const r = await auth.setUserTags(user.name, [...selected]);
    status.textContent = r.ok ? "✓" : (r.error || "Error");
    if (r.ok && onSaved) onSaved([...selected]);
    setTimeout(() => { if (status.textContent === "✓") status.textContent = ""; }, 1500);
  };
  const { chips } = tagPickerChips(getCatalog(), selected, save);
  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => overlay.remove();
  overlay.appendChild(el("div", { class: "pb-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", { class: "prof-name" }, [el("span", { text: `Etiquetas de ${user.name} ` }), status]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    el("p", { class: "config-note", text: "Marca lo que define a esta persona. Se guarda al instante." }),
    chips,
  ]));
  document.body.appendChild(overlay);
}

// El Muelle: posits del equipo. Resuelve el nombre del lead desde el pipeline en
// memoria para que el gadget muestre "sobre Tal" sin guardar texto en el posit.
function leadNameById(id) {
  const o = (state.results?.all || []).find((x) => x.id === id);
  return o ? o.company : null;
}
// Tira de pulso personal en Hoy. Cuatro señales de un vistazo; las dos primeras
// premian trabajar en la app, la tercera te tira del muelle, la cuarta es la
// huella del CEO. Cada una es tocable y lleva a la acción, nunca es texto muerto.
function todayPulseStrip(me) {
  const days = posits.streak(me);
  const done = posits.actionsToday(me);
  const unread = posits.unread(me);
  const rec = posits.lastRecognition(me);

  const cell = (cls, glyph, big, label, onClick) =>
    el("button", { class: `tp-cell ${cls}`, onClick }, [
      el("span", { class: "tp-glyph", text: glyph }),
      el("div", { class: "tp-text" }, [
        el("span", { class: "tp-big", text: String(big) }),
        el("span", { class: "tp-label", text: label }),
      ]),
    ]);

  const cells = [
    cell("tp-streak", "🔥", days, `día${days === 1 ? "" : "s"} de racha`, () => goView("today")),
    cell("tp-done", "⚡", done, "acciones hoy", () => goView("cards")),
    cell(`tp-inbox${unread ? " on" : ""}`, "📌", unread, "posits sin ver", () => goView("muelle")),
  ];
  if (rec) {
    cells.push(el("button", { class: "tp-cell tp-rec", title: `${rec.from} te potenció`, onClick: () => goView("muelle") }, [
      el("span", { class: "tp-glyph", text: rec.glyph || "🚀" }),
      el("div", { class: "tp-text" }, [
        el("span", { class: "tp-big tp-rec-from", text: rec.from }),
        el("span", { class: "tp-label", text: "te potencia" }),
      ]),
    ]));
  }
  return el("div", { class: "today-pulse" }, cells);
}

function muelleView() {
  const me = auth.currentUser()?.name || "";
  return posits.positsView({
    me,
    isCeo: allow("manage_roles"),
    openLead: (id) => openCase(id),
    rerender: render,
    leadName: leadNameById,
  });
}

// ---- El equipo: personas, organigrama, roles y etiquetas (solo admin) -------
//
// El cliente refuerza el acceso ocultando la pestaña, pero la verdad la impone
// el servidor: setRole/setTier/setUserTags exigen token de admin o devuelven 403.
function usersView() {
  // Cinturón y tirantes: aunque la pestaña esté oculta, si se navega a "users"
  // sin permiso, no se muestra nada operable.
  if (!allow("manage_roles")) {
    return el("div", {}, [el("h2", { text: "Personas" }), el("p", { class: "ro-notice", text: "Solo un ADMIN puede gestionar personas, roles y etiquetas." })]);
  }
  const me = auth.currentUser();
  const wrap = el("div", {}, [
    el("h2", { text: "El equipo" }),
    el("p", { class: "hint", text: "Quién es quién y dónde encaja. El nivel dibuja el organigrama (0 dirección · 1 · 2 equipo); el rol marca qué puede tocar en Connect; las etiquetas, qué sabe hacer. Todo lo montas tú aquí." }),
  ]);

  // ── Quién sabe hacer qué (perfiles del equipo, clic para filtrar) ──────────
  const overview = el("div", { class: "tag-overview" });

  // ── Posiciones abiertas: perfiles del catálogo que nadie cubre todavía ─────
  const gaps = el("div", { class: "gap-list" });
  const paintGaps = () => {
    clear(gaps);
    const users = auth.getUsers().filter((u) => !u.colorOnly || u.role);
    const missing = teamGaps(users, getCatalog());
    if (!missing.length) {
      gaps.appendChild(el("p", { class: "hint", text: "Cada perfil del catálogo tiene al menos a una persona. Ningún hueco abierto ahora mismo." }));
      return;
    }
    for (const g of missing) gaps.appendChild(el("span", { class: "gap-chip", title: "Nadie del equipo cubre este perfil todavía", text: g.label }));
  };

  const paintOverview = () => {
    paintGaps();
    clear(overview);
    const users = auth.getUsers().filter((u) => !u.colorOnly || u.role);
    const summary = teamByTag(users, getCatalog());
    if (!summary.length) { overview.appendChild(el("p", { class: "hint", text: "Aún nadie tiene etiquetas. Pónselas tú con ✎ o que las elijan al entrar." })); return; }
    for (const t of summary) overview.appendChild(el("button", {
      class: "tag-stat", title: t.people.join(", "),
      onClick: () => { state._tagFilter = state._tagFilter === t.slug ? null : t.slug; renderList(); paintOverview(); },
    }, [
      el("span", { class: `tag-stat-l ${state._tagFilter === t.slug ? "on" : ""}`, text: t.label }),
      el("span", { class: "tag-stat-n", text: String(t.count) }),
    ]));
  };
  wrap.appendChild(el("div", { class: "team-sec" }, [el("h4", { text: "Quién sabe hacer qué" }), overview]));
  wrap.appendChild(el("div", { class: "team-sec" }, [
    el("h4", { text: "Posiciones abiertas" }),
    el("p", { class: "config-note", text: "Perfiles del catálogo que nadie del equipo cubre todavía: dónde planificar plantilla. Añade un perfil al catálogo y aparecerá aquí hasta que alguien lo lleve." }),
    gaps,
  ]));

  const list = el("div", { class: "users-list" });
  wrap.appendChild(list);

  const renderList = () => {
    clear(list);
    const lm = labelMap(getCatalog());
    let users = auth.getUsers().filter((u) => !u.colorOnly || u.role);
    if (state._tagFilter) users = users.filter((u) => (u.tags || []).includes(state._tagFilter));
    if (!users.length) { list.appendChild(el("p", { class: "hint", text: state._tagFilter ? "Nadie con esa etiqueta — un hueco que cubrir." : "Aún no hay otras cuentas." })); return; }
    // Orden por organigrama: nivel y, dentro, por nombre.
    users.sort((a, b) => (a.tier ?? 2) - (b.tier ?? 2) || a.name.localeCompare(b.name));
    let curTier = null;
    for (const u of users) {
      const tier = Number.isFinite(u.tier) ? u.tier : 2;
      if (tier !== curTier) {
        curTier = tier;
        list.appendChild(el("div", { class: "tier-head" }, [
          el("span", { class: `tier-badge tier-${tier}`, text: `N${tier}` }),
          el("span", { class: "tier-head-l", text: tierLabel(tier) }),
        ]));
      }
      const role = u.role || "editor";
      const isMe = me && norm(u.name) === norm(me.name);
      const dot = el("span", { class: "user-dot", style: `background:${u.color || "#4a9eff"}`, text: (u.avatar || u.name[0] || "?").toString().toUpperCase().slice(0, 2) });

      const roleSel = el("select", { class: "lead-f role-select", title: "Qué puede tocar en Connect" }, ROLES.map((r) =>
        el("option", { value: r, selected: r === role, text: ROLE_LABEL[r] })));
      roleSel.disabled = isMe;
      const roleStatus = el("span", { class: "role-status" });
      roleSel.addEventListener("change", async () => {
        roleStatus.textContent = "Guardando…";
        const r = await auth.setUserRole(u.name, roleSel.value);
        if (r.ok) { roleStatus.textContent = "✓"; setTimeout(() => (roleStatus.textContent = ""), 1500); }
        else { roleStatus.textContent = r.error || "Error"; roleSel.value = role; }
      });

      const tierSel = el("select", { class: "lead-f tier-select", title: "Nivel en el organigrama" }, [0, 1, 2, 3].map((n) =>
        el("option", { value: String(n), selected: n === tier, text: `Nivel ${n}` })));
      const tierStatus = el("span", { class: "role-status" });
      tierSel.addEventListener("change", async () => {
        tierStatus.textContent = "…";
        const r = await auth.setUserTier(u.name, Number(tierSel.value));
        if (r.ok) renderList();
        else { tierStatus.textContent = r.error || "Error"; tierSel.value = String(tier); }
      });

      const tagEls = (u.tags || []).length
        ? (u.tags || []).map((s) => el("span", { class: "tag-mini", text: lm.get(s) || s }))
        : [el("span", { class: "tag-none", text: "sin etiquetas" })];
      const editTags = el("button", { class: "btn-ghost btn-xs", title: "Editar las etiquetas de esta persona", text: "✎ etiquetas", onClick: () => openTagEditor(u, () => { renderList(); paintOverview(); }) });

      list.appendChild(el("div", { class: "user-row" }, [
        el("div", { class: "user-row-main" }, [
          dot,
          el("span", { class: "user-row-name", text: u.name + (isMe ? " (tú)" : "") }),
          el("span", { class: `role-badge role-${role}`, text: roleLabel(role) }),
          roleSel, roleStatus, tierSel, tierStatus,
        ]),
        el("div", { class: "user-row-tags" }, [el("div", { class: "user-tags" }, tagEls), editTags]),
      ]));
    }
  };
  renderList();

  // ── Catálogo de etiquetas (el admin lo amplía) ─────────────────────────────
  const catBox = el("div", { class: "cat-list" });
  const paintCat = () => {
    clear(catBox);
    for (const t of getCatalog()) {
      catBox.appendChild(el("span", { class: "cat-chip" }, [
        el("span", { text: t.label }),
        el("button", {
          class: "cat-x", title: "Quitar del catálogo", text: "✕",
          onClick: async () => {
            if (!confirm(`¿Quitar "${t.label}" del catálogo? (no borra la etiqueta de quien ya la tenga)`)) return;
            const r = await auth.removeCatalogTag(t.slug);
            if (r.ok) await refreshCatalog(); else alert(r.error || "No se pudo.");
          },
        }),
      ]));
    }
  };
  const newTagI = el("input", { class: "auth-f cat-input", placeholder: "Nueva etiqueta (p. ej. Legal)" });
  const addBtn = el("button", { class: "btn", text: "Añadir", onClick: async () => {
    const v = String(newTagI.value || "").trim();
    if (!v) return;
    const r = await auth.addCatalogTag(v);
    if (r.ok) { newTagI.value = ""; await refreshCatalog(); } else alert(r.error || "No se pudo.");
  } });
  async function refreshCatalog() {
    const r = await auth.tagCatalog();
    if (r && r.ok && Array.isArray(r.tags)) cacheCatalog(r.tags);
    paintCat(); paintOverview(); renderList();
  }
  paintCat();
  wrap.appendChild(el("div", { class: "team-sec" }, [
    el("h4", { text: "Catálogo de etiquetas" }),
    el("p", { class: "config-note", text: "Estas son las etiquetas que cada uno puede elegir para definirse. Amplíalo si falta un perfil." }),
    catBox,
    el("div", { class: "cat-add" }, [newTagI, addBtn]),
  ]));

  // ── Supervisión de privados (solo admin) ───────────────────────────────────
  let supervLoaded = false;
  const superv = el("div", { class: "superv-list" });
  const paintSuperv = async () => {
    supervLoaded = true;
    clear(superv);
    superv.appendChild(loadingNote("Cargando conversaciones…", { compact: true }));
    const threads = await chat.adminThreads(auth.getToken());
    clear(superv);
    if (!threads.length) { superv.appendChild(emptyNote("No hay privados todavía.", { icon: "🔒", compact: true })); return; }
    for (const t of threads) {
      const who = (t.between || []).join(" ↔ ");
      superv.appendChild(el("button", { class: "superv-row", onClick: () => openConversation(t.channel, `Privado · ${who}`) }, [
        el("span", { class: "superv-who", text: who }),
        el("span", { class: "superv-last", text: t.last || "" }),
      ]));
    }
  };
  const supervDetails = el("details", { class: "team-sec superv-sec" }, [
    el("summary", { text: "Supervisión de conversaciones privadas" }),
    el("p", { class: "config-note", text: "Como admin puedes abrir cualquier privado del equipo. Úsalo con criterio." }),
    superv,
  ]);
  supervDetails.addEventListener("toggle", () => { if (supervDetails.open && !supervLoaded) paintSuperv(); });
  wrap.appendChild(supervDetails);

  // Trae lista fresca (colores/roles/etiquetas) y catálogo del servidor; repinta.
  auth.syncRemoteColors().then(() => { renderList(); paintOverview(); }).catch(() => {});
  refreshCatalog().catch(() => {});
  return wrap;
}

// ---- Mensajería interna (chat general · mejoras · privados) ------------------

function fmtTime(iso) {
  try { return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

// Lista de mensajes teñida por autor (color de firma). El cuerpo va como texto
// (escapado por el DOM), nunca como HTML.
function messageList(messages) {
  const me = auth.currentUser();
  if (!messages || !messages.length) return emptyNote("Aún no hay mensajes.", { icon: "💬", sub: "Rompe el hielo.", compact: true });
  return el("div", { class: "msg-list" }, messages.map((m) => {
    const mine = me && norm(m.from_lower || m.from_name) === norm(me.name);
    const color = auth.colorOf(m.from_name) || "#4a9eff";
    return el("div", { class: `msg ${mine ? "mine" : ""}` }, [
      el("div", { class: "msg-meta" }, [
        el("span", { class: "msg-dot", style: `background:${color}` }),
        el("span", { class: "msg-from", text: m.from_name }),
        el("span", { class: "msg-time", text: fmtTime(m.created_at) }),
      ]),
      el("div", { class: "msg-body", text: m.body }),
    ]);
  }));
}

// Compositor reutilizable: textarea + enviar (⌘/Ctrl+Enter) + actualizar.
function composer(placeholder, onSend, onRefresh) {
  const input = el("textarea", { class: "chat-input", placeholder });
  const send = el("button", { class: "btn-primary", text: "Enviar" });
  const doSend = async () => {
    const body = String(input.value || "").trim();
    if (!body) return;
    send.disabled = true;
    const ok = await onSend(body);
    send.disabled = false;
    if (ok) input.value = "";
  };
  send.addEventListener("click", doSend);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault?.(); doSend(); } });
  return el("div", { class: "chat-compose" }, [
    input,
    el("div", { class: "chat-actions" }, [
      el("button", { class: "btn-ghost", text: "↻ Actualizar", onClick: onRefresh }),
      send,
    ]),
  ]);
}

function chatView(channel) {
  const meta = {
    general: { h: "Chat del equipo", sub: "El canal de todos. Aquí se coordina el día y no se pierde nada de vista.", ph: "Escribe al equipo…" },
    mejoras: { h: "Ideas de mejora", sub: "Lo que haría el trabajo más fácil, anotado. Cada idea pequeña que suma queda aquí, a la vista y sin perderse.", ph: "Propón una mejora…" },
  }[channel] || { h: "Chat", sub: "", ph: "Escribe un mensaje…" };
  const wrap = el("div", {}, [el("h2", { text: meta.h }), el("p", { class: "hint", text: meta.sub })]);
  const box = el("div", { class: "chat-box" });
  wrap.appendChild(box);
  const load = async () => {
    const r = await chat.listMessages(auth.getToken(), { channel });
    clear(box);
    if (r && r.ok) { box.appendChild(messageList(r.messages)); requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; }); }
    else box.appendChild(errorNote((r && r.error) || "No se pudieron cargar los mensajes.", load, { compact: true }));
  };
  wrap.appendChild(composer(
    meta.ph,
    async (body) => { const r = await chat.sendMessage(auth.getToken(), { channel, body }); if (r && r.ok) { await load(); return true; } alert((r && r.error) || "No se pudo enviar."); return false; },
    load,
  ));
  load();
  return wrap;
}

// Drive: material del equipo para vender, en tres carpetas. Pestañas de carpeta,
// subida directa (URL firmada) y lista con descargar/eliminar. Limpio y a mano.
function driveView() {
  const wrap = el("section", { class: "drive-view" });
  wrap.appendChild(el("div", { class: "view-head" }, [
    el("h2", { text: "Drive" }),
    el("p", { class: "hint", text: "Material del equipo para vender: imágenes de marketing, propuestas y recursos. Limpio y a mano." }),
  ]));

  const token = auth.getToken();
  if (!token) {
    wrap.appendChild(el("p", { class: "hint", text: "Entra con tu usuario para ver el Drive." }));
    return wrap;
  }

  if (!state._driveFolder) state._driveFolder = FOLDERS[0].slug;

  // Pestañas de carpeta: cambian la carpeta activa y recargan la lista.
  const tabsRow = el("div", { class: "drive-tabs" }, FOLDERS.map((f) =>
    el("button", {
      class: `drive-tab ${state._driveFolder === f.slug ? "active" : ""}`,
      text: f.label,
      onClick: () => { state._driveFolder = f.slug; render(); },
    })));

  const status = el("p", { class: "drive-status" });
  const list = el("div", { class: "drive-list" });

  const load = async () => {
    clear(list);
    list.appendChild(loadingNote("Cargando…", { compact: true }));
    const r = await listFiles(token, state._driveFolder);
    clear(list);
    if (!r || !r.ok) { list.appendChild(errorNote((r && r.error) || "No se pudo cargar la carpeta.", load, { compact: true })); return; }
    const files = r.files || [];
    if (!files.length) { list.appendChild(emptyNote("Aún no hay archivos en esta carpeta.", { icon: "📁", compact: true })); return; }
    for (const f of files) list.appendChild(driveRow(f, token, load));
  };

  // Subida: input oculto → URL firmada → PUT directo a Storage → recarga.
  const fileInput = el("input", { type: "file", class: "drive-file", style: "display:none" });
  const upBtn = el("button", { class: "btn-primary", text: "Subir archivo", onClick: () => fileInput.click() });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    upBtn.disabled = true;
    status.textContent = `Subiendo ${file.name}…`; status.className = "drive-status";
    try {
      const sign = await requestUpload(token, state._driveFolder, file.name, file.type);
      if (!sign || !sign.ok || !sign.url) throw new Error((sign && sign.error) || "No se pudo preparar la subida.");
      const put = await fetch(sign.url, { method: "PUT", headers: { "Content-Type": sign.contentType || file.type || "application/octet-stream" }, body: file });
      if (!put.ok) throw new Error("La subida falló.");
      status.textContent = `✓ ${file.name} subido.`; status.classList.add("ok");
      const folderLabel = (FOLDERS.find((f) => f.slug === state._driveFolder) || {}).label;
      activity.logActivity("file_up", file.name, folderLabel ? { folder: folderLabel } : null);
      await load();
    } catch (e) {
      status.textContent = String(e.message || e); status.classList.add("err");
    } finally {
      upBtn.disabled = false;
      fileInput.value = "";
    }
  });

  wrap.appendChild(tabsRow);
  wrap.appendChild(el("div", { class: "drive-bar" }, [upBtn, fileInput, status]));
  wrap.appendChild(list);
  load();
  return wrap;
}

// Fila de archivo: icono por tipo, nombre, tamaño/fecha y acciones.
function driveRow(f, token, reload) {
  const dl = el("button", { class: "btn-ghost btn-xs", text: "Descargar", onClick: async () => {
    dl.disabled = true;
    const r = await requestDownload(token, f.path);
    dl.disabled = false;
    if (r && r.ok && r.url) globalThis.open?.(r.url, "_blank");
    else alert((r && r.error) || "No se pudo descargar.");
  } });
  const del = el("button", { class: "btn-ghost btn-xs drive-del", text: "Eliminar", onClick: async () => {
    if (!confirm(`¿Eliminar "${f.name}"? No se puede deshacer.`)) return;
    del.disabled = true;
    const r = await removeFile(token, f.path);
    if (r && r.ok) reload();
    else { del.disabled = false; alert((r && r.error) || "No se pudo eliminar."); }
  } });
  const date = f.updated_at ? new Date(f.updated_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "";
  return el("div", { class: "drive-row" }, [
    el("span", { class: `drive-kind kind-${f.kind}`, html: driveKindIcon(f.kind) }),
    el("div", { class: "drive-meta" }, [
      el("span", { class: "drive-name", text: f.name }),
      el("span", { class: "drive-sub", text: [formatSize(f.size), date].filter(Boolean).join(" · ") }),
    ]),
    el("div", { class: "drive-acts" }, [dl, del]),
  ]);
}

// Icono de línea por tipo de archivo (mismo lenguaje visual que ICONS).
function driveKindIcon(kind) {
  if (kind === "image") return _svg('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-6 6"/>');
  if (kind === "video") return _svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>');
  if (kind === "doc") return _svg('<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4M8 13h8M8 17h8"/>');
  return _svg('<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/>');
}

function dmsView() {
  const me = auth.currentUser();
  const wrap = el("div", {}, [
    el("h2", { text: "Mensajes privados" }),
    el("p", { class: "hint", text: "Uno a uno, en privado. Para lo que no hace falta que vea todo el equipo. (El admin puede supervisar.)" }),
  ]);
  const layout = el("div", { class: "dm-layout" });
  const people = el("div", { class: "dm-people" });
  const thread = el("div", { class: "dm-thread" }, [el("p", { class: "hint", text: "Elige a alguien y empieza la conversación." })]);
  layout.appendChild(people);
  layout.appendChild(thread);
  wrap.appendChild(layout);

  const others = auth.getUsers()
    .filter((u) => (!u.colorOnly || u.role) && me && norm(u.name) !== norm(me.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const openThread = async (other) => {
    clear(thread);
    thread.appendChild(el("div", { class: "dm-head", text: `Con ${other.name}` }));
    const box = el("div", { class: "chat-box" });
    thread.appendChild(box);
    const load = async () => {
      const r = await chat.listMessages(auth.getToken(), { to: other.name });
      clear(box);
      if (r && r.ok) { box.appendChild(messageList(r.messages)); requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; }); }
      else box.appendChild(errorNote((r && r.error) || "No se pudo cargar.", load, { compact: true }));
    };
    thread.appendChild(composer(
      `Mensaje para ${other.name}…`,
      async (body) => { const r = await chat.sendMessage(auth.getToken(), { to: other.name, body }); if (r && r.ok) { await load(); return true; } alert((r && r.error) || "No se pudo enviar."); return false; },
      load,
    ));
    await load();
  };

  if (!others.length) people.appendChild(el("p", { class: "hint", text: "Aún no hay nadie más en el equipo." }));
  for (const o of others) {
    people.appendChild(el("button", { class: "dm-person", onClick: () => openThread(o) }, [
      el("span", { class: "user-dot", style: `background:${o.color || "#4a9eff"}`, text: (o.name[0] || "?").toUpperCase() }),
      el("span", { text: o.name }),
    ]));
  }
  return wrap;
}

// Conversación en una capa (supervisión del admin / lectura puntual).
function openConversation(channel, title) {
  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => overlay.remove();
  const box = el("div", { class: "chat-box superv-box" });
  const load = async () => {
    const r = await chat.listMessages(auth.getToken(), { channel });
    clear(box);
    if (r && r.ok) box.appendChild(messageList(r.messages));
    else box.appendChild(errorNote((r && r.error) || "No se pudo cargar.", load, { compact: true }));
  };
  overlay.appendChild(el("div", { class: "pb-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", { class: "prof-name", text: title || "Conversación" }),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    box,
  ]));
  document.body.appendChild(overlay);
  load();
}

// ---- Presencia: quién está ahora --------------------------------------------

// Mi estado declarado (lo elijo a mano en la vista "Ahora"); el latido lo
// mantiene fresco. Arranca en "disponible" al entrar.
let myStatus = "online";

// En qué ando: la vista en la que estoy, en lenguaje natural ("en CRM"). Viaja
// con el latido para que el equipo vea no solo que estás, sino en qué.
function currentActivity() {
  for (const z of zonesForUser()) {
    const v = z.views.find(([k]) => k === state.view);
    if (v) return `en ${v[1]}`;
  }
  return "";
}

let presenceGen = 0; // corta el refresco de una vista que ya no está montada
function presenceView() {
  const mine = ++presenceGen;
  const me = auth.currentUser();
  const wrap = el("section", { class: "presence-view" });
  wrap.appendChild(el("div", { class: "view-head" }, [
    el("h2", { text: "Quién está ahora" }),
    el("p", { class: "hint", text: "El equipo en vivo: quién está disponible, ocupado o en reunión, y en qué anda. Tu estado se mantiene solo mientras trabajas." }),
  ]));

  // Tu estado: lo eliges a mano. "Desconectado" no se ofrece — eso lo marca
  // cerrar sesión o quedarte sin latir; aquí solo declaras presencia activa.
  const STSEL = [["online", "Disponible"], ["meeting", "En reunión"], ["busy", "Ocupado"], ["away", "Ausente"]];
  const sel = el("select", { class: "presence-mystatus lead-f" }, STSEL.map(([v, l]) =>
    el("option", { value: v, selected: v === myStatus, text: l })));
  sel.addEventListener("change", () => { myStatus = sel.value; presence.beatNow(); });
  wrap.appendChild(el("div", { class: "presence-me" }, [
    el("span", { class: "presence-me-lbl", text: "Tu estado" }), sel,
  ]));

  const summary = el("p", { class: "presence-summary hint" });
  const list = el("div", { class: "presence-list" });
  wrap.appendChild(summary);
  wrap.appendChild(list);

  const team = auth.getUsers().filter((u) => !u.colorOnly || u.role);

  const paint = (roster) => {
    const sorted = presence.sortRoster(roster);
    const s = presence.summarize(sorted);
    summary.textContent = `${s.present} de ${s.total} presentes · ${s.online} disponibles`;
    clear(list);
    for (const r of sorted) {
      const color = auth.colorOf(r.name) || "#4a9eff";
      const meta = [presence.STATUS_LABELS[r.status]];
      if (r.activity && r.status !== "offline") meta.push(r.activity);
      meta.push(presence.relativeSeen(r.lastSeen));
      list.appendChild(el("div", { class: `presence-row${r.me ? " is-me" : ""}${r.status === "offline" ? " is-off" : ""}` }, [
        el("span", { class: "presence-avatar", style: `background:${color}` }, [
          el("span", { class: "presence-initial", text: (r.name[0] || "?").toUpperCase() }),
          el("span", { class: `presence-dot status-${presence.STATUS_DOT[r.status]}`, title: presence.STATUS_LABELS[r.status] }),
        ]),
        el("div", { class: "presence-who" }, [
          el("span", { class: "presence-name", text: r.name + (r.me ? " (tú)" : "") }),
          el("span", { class: "presence-meta", text: meta.filter(Boolean).join(" · ") }),
        ]),
      ]));
    }
  };

  const load = async () => {
    const r = await presence.fetchRoster();
    if (mine !== presenceGen || state.view !== "presence") return; // la vista cambió: corta el refresco
    if (!r || !r.ok) { clear(list); list.appendChild(errorNote((r && r.error) || "No se pudo cargar la presencia.", load, { compact: true })); }
    else paint(presence.buildRoster(r.roster || [], team, Date.now(), me ? me.name : ""));
    if (mine === presenceGen && state.view === "presence") setTimeout(load, 15000); // refresco suave en vivo
  };
  list.appendChild(loadingNote("Cargando…", { compact: true }));
  load();
  return wrap;
}

// ---- Feed de actividad: la traza honesta del equipo -------------------------

let feedGen = 0; // corta el refresco de una vista que ya no está montada
function activityView() {
  const mine = ++feedGen;
  const wrap = el("section", { class: "feed-view" });
  wrap.appendChild(el("div", { class: "view-head" }, [
    el("h2", { text: "Actividad del equipo" }),
    el("p", { class: "hint", text: "La traza honesta de qué pasa en Connect: tareas hechas, archivos subidos, leads nuevos. Quién hizo qué, y cuándo." }),
  ]));
  const listWrap = el("div", { class: "feed-list" });
  wrap.appendChild(listWrap);

  const paint = (feed) => {
    clear(listWrap);
    const groups = activity.groupByDay(feed, Date.now());
    if (!groups.length) { listWrap.appendChild(emptyNote("Aún no hay actividad registrada.", { icon: "✦", sub: "En cuanto el equipo trabaje, aparecerá aquí." })); return; }
    for (const g of groups) {
      listWrap.appendChild(el("div", { class: "feed-day", text: g.label }));
      for (const ev of g.events) {
        const m = activity.verbMeta(ev.verb);
        const color = auth.colorOf(ev.actor) || "#4a9eff";
        listWrap.appendChild(el("div", { class: "feed-row" }, [
          el("span", { class: "feed-glyph", style: `border-color:${color}`, text: m.glyph }),
          el("div", { class: "feed-body" }, [
            el("span", { class: "feed-text", text: activity.describe(ev) }),
            el("span", { class: "feed-time", text: activity.relativeTime(ev.created_at || ev.at) }),
          ]),
        ]));
      }
    }
  };

  const load = async () => {
    const r = await activity.fetchFeed();
    if (mine !== feedGen || state.view !== "feed") return; // la vista cambió: corta el refresco
    if (!r || !r.ok) { clear(listWrap); listWrap.appendChild(errorNote((r && r.error) || "No se pudo cargar la actividad.", load)); }
    else paint(r.feed || []);
    if (mine === feedGen && state.view === "feed") setTimeout(load, 20000); // refresco suave
  };
  listWrap.appendChild(loadingNote());
  load();
  return wrap;
}

// ---- Productividad / competitividad interna ---------------------------------

function leaderboardView() {
  const wrap = el("div", {}, [
    el("h2", { text: "El marcador" }),
    el("p", { class: "hint", text: "Quién mueve, quién reúne, quién cierra. No cuenta el ruido — cuenta el resultado. El listón sube solo cuando se ve." }),
  ]);
  const board = el("div", { class: "board" });
  wrap.appendChild(board);
  const paint = (stats) => {
    clear(board);
    const users = auth.getUsers().filter((u) => !u.colorOnly || u.role).map((u) => ({ name: u.name, color: u.color, avatar: u.avatar }));
    const rows = buildLeaderboard(store.getTracking(), store.getLearning(), users, stats || {});
    if (!rows.length) { board.appendChild(emptyNote("Todavía no hay nada que medir.", { icon: "▲", sub: "En cuanto el equipo se mueva, el marcador se llena." })); return; }
    const max = rows[0].score || 1;
    rows.forEach((r, i) => {
      board.appendChild(el("div", { class: `board-row ${i === 0 && r.score > 0 ? "lead" : ""}` }, [
        el("span", { class: "board-rank", text: `#${i + 1}` }),
        el("span", { class: "user-dot", style: `background:${r.color || "#4a9eff"}`, text: (r.avatar || r.name[0] || "?").toString().toUpperCase().slice(0, 2) }),
        el("span", { class: "board-name", text: r.name }),
        el("div", { class: "board-bar-wrap" }, [el("div", { class: "board-bar", style: `width:${Math.max(4, Math.round((r.score / max) * 100))}%` })]),
        el("span", { class: "board-score", text: String(r.score) }),
        el("div", { class: "board-detail", text: `${r.won} cierres · ${r.meetings} reuniones · ${r.interested} interesados · ${r.worked} tocadas · ${r.messages} msgs` }),
      ]));
    });
  };
  paint({});
  chat.messageStats(auth.getToken()).then(paint).catch(() => {});
  return wrap;
}

// Aviso de modo prueba (solo lectura) en lo alto del contenido.
function previewBanner() {
  const txt = previewMode && previewMode.scope === "company" && previewMode.companyName
    ? `Vista de prueba de ${previewMode.companyName} · solo lectura.`
    : "Vista de prueba · solo lectura. Estás viendo Connect sin cuenta.";
  return el("div", { class: "preview-banner" }, [
    el("span", { class: "role-badge role-viewer", text: "PRUEBA" }),
    el("span", { text: txt }),
  ]);
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
    sel("classification", [opt("all", "Todas las clases", f.classification === "all"), ...Object.entries(CLASSIFICATIONS).map(([k, v]) => opt(k, v, f.classification === k))]),
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
  area.appendChild(state.view === "table" ? buildTable() : feedCards(feedModel().filtered));
}

// ---- Vista "Hoy" (claridad ejecutiva) ---------------------------------------

const eurFmt = (n) => `${Number(n || 0).toLocaleString("es-ES")} €`;

// Centro de mando del día: UNA acción ahora (lo más directo) + la ruta del día
// clicable (te lleva de la mano). Las cifras de motivación las da el pulso debajo.
function commandCenter(calls) {
  const top = calls[0];
  const now = top
    ? el("div", { class: "cc-now" }, [
        el("span", { class: "cc-now-lbl", text: "Ahora" }),
        el("div", { class: "cc-now-main" }, [
          el("div", { class: "cc-now-co", text: `Llama a ${top.company}` }),
          el("div", { class: "cc-now-why", text: top.firstLever || top.whyNow || [sectorByKey(top.sector)?.label, top.city].filter(Boolean).join(" · ") || "Tu mejor oportunidad ahora." }),
        ]),
        el("button", { class: "btn-primary cc-go", html: icon("phone") + " Abrir y llamar", onClick: () => { state.filters.search = top.company; goView("cards"); } }),
      ])
    : el("div", { class: "cc-now cc-now-empty" }, [
        el("span", { class: "cc-now-lbl", text: "Ahora" }),
        el("div", { class: "cc-now-main" }, [
          el("div", { class: "cc-now-co", text: "Nada en cola para llamar" }),
          el("div", { class: "cc-now-why", text: "Capta empresas y llena el día." }),
        ]),
        el("button", { class: "btn-primary cc-go", html: icon("search") + " Captar", onClick: () => goView("search") }),
      ]);
  // Ruta del día: el orden natural de trabajo, a un clic cada paso.
  const steps = [["Llama", "cards", !!top], ["Registra", "crm", false], ["Capta", "search", !top], ["Forma", "training", false]];
  const route = el("div", { class: "cc-route" }, steps.map(([lbl, view, on], i) =>
    el("button", { class: `cc-step ${on ? "on" : ""}`, onClick: () => goView(view) }, [
      el("span", { class: "cc-step-n", text: String(i + 1) }),
      el("span", { class: "cc-step-l", text: lbl }),
    ])));
  return el("section", { class: "command-center" }, [now, route]);
}

// ---- Reactor V3: Mission Control -----------------------------------------------
//
// La primera pantalla. Una jerarquía: dinero → prioridad #1 → #2 → #3 → sistema.
// Cada bloque se entiende en <2 segundos. Sin párrafos. Sin tiles de dashboard.
// Acción > explicación. Dinero > métricas. Prioridad > navegación.

// Reactor V4 — UNA sola orden activa. No lista, no menú, no alternativas. El
// bloque entero es la orden; el único acto posible es OBEDECER.
function renderActiveOrder(p) {
  const verb = p.status === "not_called" ? "PRIMER CONTACTO CON" : "LLAMA A";
  return el("div", { class: "ord-active" }, [
    el("div", { class: "ord-label", text: "ORDEN ACTIVA" }),
    el("div", { class: "ord-command" }, [
      el("span", { class: "ord-verb", text: verb }),
      el("span", { class: "ord-company", text: p.company.toUpperCase() }),
    ]),
    el("div", { class: "ord-oci", text: `OCI ${p.oci}` }),
    el("div", { class: "ord-context" }, [
      p.motive ? el("div", { class: "ord-ctx-line", text: p.motive }) : null,
      p.riskLine ? el("div", { class: "ord-ctx-line", text: p.riskLine }) : null,
    ].filter(Boolean)),
    el("button", {
      class: "ord-obey",
      text: "OBEDECER",
      onClick: () => obeyOrder(p.leadId),
    }),
  ]);
}

// El acto de obediencia: registra OBEYED en el Ledger y abre la ejecución de la
// orden — NO cards, NO terreno, NO listas, NO navegación. Solo la orden viva.
function obeyOrder(leadId) {
  const rec = store.getRecord(leadId);
  if (rec.orderIssuedAt) store.ledgerObey(orderIdFor(leadId, rec.orderIssuedAt));
  openOrderExecution(leadId);
}

// Vista de ejecución: lo mínimo para ejecutar la orden ya. Empresa, contexto,
// objeción dominante, última interacción, siguiente acción → y el cierre en un
// click. Reusa buildVerdict (lectura), no toca scoring/decision/memory.
function openOrderExecution(leadId) {
  const lead = (state.results?.all || []).find((o) => o.id === leadId);
  if (!lead) return;
  const now = Date.now();
  const v = buildVerdict({
    actNow: [{ opp: lead, decision: (feedModel().buckets.actNow || []).find((x) => x.opp.id === leadId)?.decision || {} }],
    tracking: store.getTracking(),
    calls: store.getCalls(),
    tasks: store.getTasks(),
    now,
    today: ymd(new Date()),
  });

  const overlay = el("div", { class: "ord-screen", onClick: (e) => { if (e.target === overlay) close(); } });
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function close() { overlay.remove(); document.removeEventListener("keydown", onKey); }
  document.addEventListener("keydown", onKey);

  // Zona de cierre: el botón revela los 5 resultados rápidos; un click cierra.
  const finishZone = el("div", { class: "ord-finish" });
  finishZone.appendChild(el("button", {
    class: "ord-finish-btn",
    text: "ORDEN COMPLETADA",
    onClick: () => {
      clear(finishZone);
      finishZone.appendChild(el("div", { class: "ord-outcome-q", text: "¿Qué pasó?" }));
      finishZone.appendChild(el("div", { class: "ord-outcomes" }, [
        ["avance", "Avance"], ["seguimiento", "Seguimiento"], ["propuesta", "Propuesta"],
        ["perdido", "Perdido"], ["sin_respuesta", "Sin respuesta"],
      ].map(([key, label]) => el("button", {
        class: "ord-chip",
        text: label,
        onClick: () => { resolveOrder(leadId, key); close(); },
      }))));
    },
  }));

  const panel = el("div", { class: "ord-exec" }, [
    el("div", { class: "ord-exec-head" }, [
      el("div", { class: "ord-exec-company", text: lead.company }),
      el("button", { class: "ord-exec-x", text: "✕", onClick: () => close() }),
    ]),
    el("div", { class: "ord-exec-rows" }, [
      v.objection ? execRow("Objeción dominante", `«${v.objection}»`) : null,
      execRow("Última interacción", v.lastContact || "Sin registro."),
      v.nextAction?.why ? execRow("Siguiente acción", v.nextAction.why) : null,
    ].filter(Boolean)),
    finishZone,
  ]);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function execRow(label, value) {
  return el("div", { class: "ord-exec-row" }, [
    el("span", { class: "ord-exec-label", text: label }),
    el("span", { class: "ord-exec-value", text: value }),
  ]);
}

// Cierre de la orden: registra RESOLVED en el Ledger con su resultado y mueve el
// tracking por el camino normal (cierra la orden vía updatedAt > orderIssuedAt).
function resolveOrder(leadId, outcome) {
  const rec = store.getRecord(leadId);
  if (rec.orderIssuedAt) store.ledgerResolve(orderIdFor(leadId, rec.orderIssuedAt), outcome);
  const status = OUTCOME_STATUS[outcome];
  if (status) store.setStatus(leadId, status);
  goView("desk"); // el desk ya muestra la siguiente cuenta a trabajar
}

// ═══════════════════════════════════════════════════════════════════════════
// DESK — la superficie héroe. Un desk de prospección con IA, legible y vendible:
// (1) métrica viva, (2) EL siguiente movimiento (una cuenta, un acto), (3) la
// lista densa de oportunidades (Linear/Attio), (4) track record honesto del
// Ledger. Reusa el motor entero: decide() + buildPriorityList() + buildBrief().
// ═══════════════════════════════════════════════════════════════════════════
const DESK_ROWS = 12; // el desk enfoca las 12 mejores cuentas; el resto vive en Mapa
function ociBand(oci) { return oci >= 70 ? "hot" : oci >= 50 ? "warm" : "cold"; }

const DESK_GOAL = 5; // objetivo diario de contactos — el progreso que incita a trabajar
function deskGreeting() {
  const h = new Date().getHours();
  return h < 6 ? "Buenas noches" : h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
}

// Conmutador de origen: "Mi lista" (tu pipeline importado, datos reales) vs
// "Demo" (dataset de muestra). Honesto: el demo se etiqueta como demo.
function setDataset(key) {
  if (state.dataset === key) return;
  state.dataset = key;
  state.feedCmd = null; state.feedCmdText = "";
  recompute().then(render).catch(render);
}
function deskDatasetToggle(mineCount) {
  const isMine = state.dataset === "mine";
  const tab = (key, label, active) => el("button", {
    class: `desk-ds ${active ? "active" : ""}`, text: label, onClick: () => setDataset(key),
  });
  return el("div", { class: "desk-ds-wrap", title: "Origen de los datos" }, [
    tab("mine", mineCount ? `Mi lista · ${mineCount}` : "Mi lista", isMine),
    tab("researched", "Demo", !isMine),
  ]);
}

// Cuenta ascendente de las cifras del pulso — se ejecuta UNA vez por sesión (la
// primera vez que se pinta el Desk), para que la entrada se sienta viva sin
// re-animar en cada repintado del latido. Degrada a número final sin rAF.
let deskCountedUp = false;
function animateDeskCounts() {
 try {
  if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") return;
  const nodes = document.querySelectorAll(".desk [data-to]");
  if (typeof requestAnimationFrame !== "function" || typeof performance === "undefined") {
    nodes.forEach((n) => { n.textContent = n.dataset.to; n.removeAttribute("data-to"); });
    return;
  }
  nodes.forEach((node) => {
    const to = parseInt(node.dataset.to, 10) || 0;
    node.removeAttribute("data-to");
    if (to <= 0) { node.textContent = "0"; return; }
    const start = performance.now(), dur = 650;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      node.textContent = String(Math.round((1 - Math.pow(1 - k, 3)) * to));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
 } catch { /* animación decorativa: nunca debe romper el render */ }
}

function deskView() {
  ensureDeskKeys();
  const tracking = store.getTracking();
  const now = Date.now();
  const cons = state.config?.conservatism;
  const items = (state.results?.all || [])
    .filter((o) => o.scores)
    .map((o) => ({ opp: o, decision: decide(o, o.scores || {}, cons != null ? { conservatism: cons } : {}) }))
    .sort((a, b) => (b.decision.oci || 0) - (a.decision.oci || 0));

  if (!items.length) return deskEmpty();

  // Estricto: el Desk NO pone el ojo en quien no es oportunidad — descartes y
  // empresas ya óptimas (demasiado servidas, sin hueco). Solo donde hay algo que
  // resolver. Las excluidas se cuentan, no se ocultan (transparencia).
  const EXCLUDED = new Set(["KILL", "OVER_SERVED"]);
  const opps = items.filter((d) => !EXCLUDED.has(d.decision.decision));
  const excluded = items.length - opps.length;
  if (!opps.length) return deskEmpty(excluded);

  const live = opps.length;
  const hot = opps.filter((d) => (d.decision.oci || 0) >= 70).length;

  // Track record honesto, leído del Ledger (nunca inventado).
  const orders = foldOrders(store.getLedger());
  const contacted = orders.filter((o) => o.obeyedAt).length;
  const advanced = orders.filter((o) => o.resolvedAt && (o.outcome === "avance" || o.outcome === "propuesta")).length;
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const doneToday = orders.filter((o) => o.obeyedAt && new Date(o.obeyedAt).getTime() >= startToday.getTime()).length;

  // Cola de trabajo: cuentas AÚN sin contactar. La fuente de verdad es el Ledger
  // (¿hay orden obedecida?) más cualquier estado ya trabajado del tracking. Así,
  // al contactar una, sale de la cola y el Desk avanza — y NO reaparece aunque su
  // desenlace sea "sin respuesta".
  const contactedIds = new Set(orders.filter((o) => o.obeyedAt).map((o) => o.leadId));
  const WORKED = new Set(["contacted", "called", "interested", "meeting_booked", "proposal", "proposal_sent", "follow_up", "won", "signed", "rejected", "lost", "no_answer"]);
  const queue = opps.filter((d) => !contactedIds.has(d.opp.id) && !WORKED.has(tracking[d.opp.id]?.status));
  const priority = buildPriorityList({ actNow: queue, tracking, now });
  const top = priority[0] || null;

  // En seguimiento: contactadas que aún no tienen desenlace. Cerrarlas hace real
  // la métrica "Avanzaron".
  const inProgress = orders.filter((o) => o.obeyedAt && !o.resolvedAt);

  const firstName = (auth.currentUser()?.name || "").split(" ")[0] || "";
  const userLeadCount = store.getUserLeads().length;

  // Anima las cifras del pulso solo en la primera pintada de la sesión.
  const firstPaint = !deskCountedUp;
  deskCountedUp = true;
  if (firstPaint) setTimeout(animateDeskCounts, 40);

  return el("div", { class: "desk" }, [
    // Bloque cabecera: saludo + entrada de comandos
    el("div", { class: "desk-head" }, [
      el("div", {}, [
        el("h1", { class: "desk-hello", text: firstName ? `${deskGreeting()}, ${firstName}` : deskGreeting() }),
        el("div", { class: "desk-sub", text: (queue.length
          ? `${queue.length} ${queue.length === 1 ? "cuenta espera" : "cuentas esperan"} tu movimiento · ${live} oportunidad${live === 1 ? "" : "es"}`
          : `Bandeja vacía: trabajaste las ${live} oportunidades. 🔥`)
          + (excluded ? ` · ${excluded} descartada${excluded === 1 ? "" : "s"} (ya óptimas / sin hueco)` : "") }),
      ]),
      el("div", { class: "desk-head-actions" }, [
        deskDatasetToggle(userLeadCount),
        (allow("write") || allow("discover"))
          ? el("button", { class: "desk-import", title: "Importar tu lista (CSV de Apollo/Clay/HubSpot)", onClick: openImport }, [
              el("span", { class: "desk-import-ic", text: "↥" }),
              el("span", { text: "Importar" }),
            ])
          : null,
        el("button", { class: "desk-cmd", title: "Comandos (⌘K / Ctrl+K)", onClick: openCommand }, [
          el("span", { class: "kbd", text: "⌘K" }),
          el("span", { text: "Buscar o pedir…" }),
        ]),
      ]),
    ]),

    // BENTO superior: siguiente movimiento (grande) + panel de pulso
    el("div", { class: "desk-bento" }, [
      top ? deskHero(top, primarySignal((opps.find((d) => d.opp.id === top.leadId) || {}).opp || {})) : deskCleared(doneToday),
      deskStats({ live, hot, contacted, advanced, doneToday, orders, now, firstPaint }),
    ]),

    // Bloque lista: la cola de cuentas a trabajar (las ya contactadas salen)
    el("div", { class: "desk-block desk-listblock" }, [
      el("div", { class: "desk-block-head" }, [
        el("span", { class: "desk-block-title", text: "Cuentas a trabajar" }),
        el("span", { class: "desk-block-count", text: queue.length ? `Top ${Math.min(DESK_ROWS, queue.length)} de ${queue.length}` : "0 en cola" }),
      ]),
      queue.length
        ? el("div", { class: "desk-table" }, [
            el("div", { class: "desk-thead" }, [
              el("span", { text: "Empresa" }),
              el("span", { text: "Lectura" }),
              el("span", { text: "Fuerza" }),
              el("span", { class: "dt-r", text: "OCI" }),
              el("span", { text: "" }),
            ]),
            ...queue.slice(0, DESK_ROWS).map((d) => deskRow(d)),
          ])
        : el("div", { class: "desk-queue-done", text: "No queda nada en cola. Capta una nueva tanda o revisa el Mapa." }),
      queue.length > DESK_ROWS
        ? el("button", { class: "desk-more", onClick: () => goView("cards") }, [
            el("span", { text: `Ver las ${live} oportunidades en Mapa` }),
            el("span", { class: "desk-more-arrow", text: "→" }),
          ])
        : null,
    ]),

    // Bloque en seguimiento: contactadas sin cerrar. Cerrarlas alimenta "Avanzaron".
    inProgress.length
      ? el("div", { class: "desk-block desk-followup" }, [
          el("div", { class: "desk-block-head" }, [
            el("span", { class: "desk-block-title", text: "En seguimiento" }),
            el("span", { class: "desk-block-count", text: `${inProgress.length} sin cerrar` }),
          ]),
          ...inProgress.slice(0, 6).map((o) => deskFollowupRow(o)),
        ])
      : null,

    el("div", { class: "desk-keys" }, [
      el("span", {}, [el("kbd", { text: "↑↓" }), el("span", { text: "navegar" })]),
      el("span", {}, [el("kbd", { text: "↵" }), el("span", { text: "ficha" })]),
      el("span", {}, [el("kbd", { text: "C" }), el("span", { text: "contacto" })]),
      el("span", {}, [el("kbd", { text: "⌘K" }), el("span", { text: "comandos" })]),
    ]),
  ]);
}

// Estado "bandeja vacía": no queda cuenta sin tocar. Celebra el progreso e
// invita a captar más — mantiene vivo el bucle de trabajo.
function deskCleared(doneToday) {
  return el("div", { class: "desk-block desk-hero band-cold desk-cleared" }, [
    el("div", { class: "desk-cleared-mark", text: "✓" }),
    el("div", { class: "desk-hero-label", text: "Bandeja vacía" }),
    el("div", { class: "desk-hero-co", text: doneToday ? `Trabajaste ${doneToday} ${doneToday === 1 ? "cuenta" : "cuentas"} hoy` : "Cola al día" }),
    el("div", { class: "desk-hero-motive", text: "No queda ninguna cuenta sin tocar. Capta una nueva tanda para seguir avanzando." }),
    el("div", { class: "desk-hero-actions" }, [
      (allow("discover") || allow("write"))
        ? el("button", { class: "desk-act-primary", text: "⚡ Conseguir más leads", onClick: () => goView("search") })
        : el("button", { class: "desk-act-ghost", text: "Ver el Mapa", onClick: () => goView("cards") }),
    ]),
  ]);
}

function deskHero(p, signal) {
  const band = ociBand(p.oci);
  return el("div", { class: `desk-block desk-hero band-${band}` }, [
    el("div", { class: "desk-hero-top" }, [
      el("span", { class: "desk-hero-label", text: "● Siguiente movimiento" }),
      el("span", { class: "desk-hero-oci-chip", text: `OCI ${p.oci}` }),
    ]),
    el("div", { class: "desk-hero-co", text: p.company || "Sin nombre" }),
    el("div", { class: "desk-hero-meta", text: [p.sector, p.city].filter(Boolean).join(" · ") || "sector y ubicación por confirmar" }),
    // Señal REAL detectada (con su fuente). Sustituye al motivo genérico cuando
    // existe — esto es lo derivado de verdad, no tecleado a mano.
    signal
      ? el("div", { class: `desk-hero-signal ${signal.strength}` }, [
          el("span", { class: "desk-hero-sig-dot" }),
          el("span", { class: "desk-hero-sig-label", text: signal.label }),
          el("span", { class: "desk-hero-sig-src", text: `· fuente: ${signal.source}` }),
        ])
      : (p.motive ? el("div", { class: "desk-hero-motive", text: p.motive }) : null),
    p.riskLine ? el("div", { class: "desk-hero-risk", text: `↑ ${p.riskLine}` }) : null,
    el("div", { class: "desk-hero-actions" }, [
      el("button", { class: "desk-act-primary", text: "Redactar contacto →", onClick: () => openDraft(p.leadId) }),
      el("button", { class: "desk-act-ghost", text: "Ver ficha", onClick: () => openCase(p.leadId) }),
    ]),
  ]);
}

// Panel de pulso: cifras vivas + progreso del día (lo que incita a trabajar) +
// prueba honesta del Ledger. Cada cifra es real, nunca inventada.
function deskStats({ live, hot, contacted, advanced, doneToday, orders, now, firstPaint }) {
  const pct = Math.max(0, Math.min(100, Math.round((doneToday / DESK_GOAL) * 100)));
  const goalHit = doneToday >= DESK_GOAL;
  const tile = (n, label, mod) => {
    const num = el("span", { class: "desk-tile-n", text: firstPaint && n > 0 ? "0" : String(n) });
    if (firstPaint && n > 0) num.dataset.to = String(n);
    return el("div", { class: `desk-tile ${mod || ""}` }, [num, el("span", { class: "desk-tile-l", text: label })]);
  };
  return el("div", { class: "desk-block desk-stats" }, [
    el("div", { class: "desk-stats-grid" }, [
      tile(live, "Vivas"),
      tile(hot, "Calientes", "hot"),
      tile(contacted, "Contactadas"),
      tile(advanced, "Avanzaron"),
    ]),
    el("div", { class: "desk-goal" }, [
      el("div", { class: "desk-goal-top" }, [
        el("span", { class: "desk-goal-label", text: "Hoy" }),
        el("span", { class: "desk-goal-count", text: `${doneToday}/${DESK_GOAL}` }),
      ]),
      el("div", { class: "desk-goal-bar" }, [el("div", { class: `desk-goal-fill ${goalHit ? "hit" : ""}`, style: `width:${pct}%` })]),
      el("div", { class: "desk-goal-note", text: goalHit ? "¡Objetivo del día hecho! 🔥" : doneToday ? `Te faltan ${DESK_GOAL - doneToday} para el objetivo.` : "Empieza por el siguiente movimiento." }),
    ]),
    el("div", { class: "desk-proof", text: contacted ? authorityLine(orders, now) : "Tu prueba de autoridad se construye con cada contacto." }),
  ]);
}

// Fuerza dominante de un lead: qué dimensión (encaje/dolor/momento/acceso) lo
// sostiene. Más informativa que el tag estratégico (que tiende a agruparse), y
// enseña al vendedor POR QUÉ cada cuenta rankea. Null si ninguna destaca.
const DOM_LABEL = { fit: "Encaje", pain: "Dolor", timing: "Momento", access: "Acceso" };
function domStrength(decision) {
  const dims = decision.dimensions || {};
  let best = null, bv = -1;
  for (const k of ["fit", "pain", "timing", "access"]) { const v = dims[k] || 0; if (v > bv) { bv = v; best = k; } }
  return bv >= 50 ? DOM_LABEL[best] : null;
}

function deskRow(d) {
  const { opp, decision } = d;
  const oci = decision.oci || 0;
  const band = ociBand(oci);
  const row = el("div", { class: "desk-row", onClick: () => openCase(opp.id) }, [
    el("div", { class: "dr-co" }, [
      el("span", { text: opp.company || "Sin nombre" }),
      el("small", { text: [opp.sector, opp.city].filter(Boolean).join(" · ") || "—" }),
    ]),
    el("span", { class: "dr-read", text: decision.decisionLabel || "—" }),
    el("span", { class: "dr-tag", text: domStrength(decision) || decision.strategicTag?.label || "—" }),
    el("span", { class: `dr-oci ${band}`, text: String(oci) }),
    el("button", {
      class: "dr-go", title: "Redactar contacto", text: "→",
      onClick: (e) => { e.stopPropagation(); openDraft(opp.id); },
    }),
  ]);
  return row;
}

// Fila de seguimiento: una contactada sin cerrar, con dos cierres de un clic.
// "Avanzó" → outcome "avance" (suma a Avanzaron); "Sin respuesta" → cierre neutro.
function deskFollowupRow(order) {
  const opp = (state.results?.all || []).find((x) => x.id === order.leadId);
  const name = opp?.company || "Cuenta contactada";
  const meta = opp ? ([opp.sector, opp.city].filter(Boolean).join(" · ") || "contactada") : "contactada";
  return el("div", { class: "desk-fu-row" }, [
    el("div", { class: "desk-fu-co" }, [
      el("span", { text: name }),
      el("small", { text: meta }),
    ]),
    el("div", { class: "desk-fu-actions" }, [
      el("button", { class: "desk-fu-yes", text: "✓ Avanzó", onClick: () => resolveOrder(order.leadId, "avance") }),
      el("button", { class: "desk-fu-no", text: "Sin respuesta", onClick: () => resolveOrder(order.leadId, "sin_respuesta") }),
    ]),
  ]);
}

function deskEmpty(excluded = 0) {
  const isMine = state.dataset === "mine";
  // Caso estricto: había cuentas, pero TODAS quedaron descartadas (ya óptimas /
  // sin hueco). Es una respuesta honesta, no un vacío: ahí no hay nada que vender.
  if (excluded > 0) {
    return el("div", { class: "desk desk-empty" }, [
      el("div", { class: "desk-empty-icon", text: "✓" }),
      el("div", { class: "desk-empty-title", text: "Ninguna oportunidad real" }),
      el("div", { class: "desk-empty-sub", text: `Las ${excluded} cuentas analizadas ya trabajan de forma óptima o no muestran un hueco accionable. No ponemos el ojo donde no hay nada que resolver.` }),
      el("div", { class: "desk-empty-actions" }, [
        el("button", { class: "desk-act-primary", text: "↥ Importar otra lista", onClick: openImport }),
        isMine ? el("button", { class: "desk-act-ghost", text: "Ver el demo", onClick: () => setDataset("researched") }) : null,
      ]),
    ]);
  }
  if (isMine) {
    return el("div", { class: "desk desk-empty" }, [
      el("div", { class: "desk-empty-icon", text: "↥" }),
      el("div", { class: "desk-empty-title", text: "Trae tu pipeline" }),
      el("div", { class: "desk-empty-sub", text: "Pega tu lista (CSV de Apollo/Clay/HubSpot, o nombres por línea). El motor la prioriza, te dice a quién contactar primero y por qué, y te redacta el primer mensaje." }),
      el("div", { class: "desk-empty-actions" }, [
        el("button", { class: "desk-act-primary", text: "↥ Importar mi lista", onClick: openImport }),
        el("button", { class: "desk-act-ghost", text: "Ver el demo", onClick: () => setDataset("researched") }),
      ]),
    ]);
  }
  return el("div", { class: "desk desk-empty" }, [
    el("div", { class: "desk-empty-icon", text: "⚡" }),
    el("div", { class: "desk-empty-title", text: "Aún no hay oportunidades vivas" }),
    el("div", { class: "desk-empty-sub", text: "Trae tu lista para trabajar tu pipeline real, o capta una primera tanda." }),
    el("div", { class: "desk-empty-actions" }, [
      el("button", { class: "desk-act-primary", text: "↥ Importar mi lista", onClick: openImport }),
      (allow("discover") || allow("write"))
        ? el("button", { class: "desk-act-ghost", text: "⚡ Conseguir leads", onClick: () => goView("search") })
        : null,
    ]),
  ]);
}

// Drawer de redacción: el "Redactar contacto" del desk. Saca el brief del motor
// (buildBrief) y muestra el primer mensaje listo para copiar. Nada inventado:
// si el motor no tiene ángulo, lo dice.
function openDraft(leadId) {
  if (document.body.querySelector(".draft-overlay")) return;
  const opp = (state.results?.all || []).find((o) => o.id === leadId);
  if (!opp) { flash("No encuentro esa oportunidad."); return; }
  const decision = decide(opp, opp.scores || {}, state.config?.conservatism != null ? { conservatism: state.config.conservatism } : {});
  const brief = buildBrief(opp, opp.scores || {}, decision);
  const sig = primarySignal(opp);

  const overlay = el("div", { class: "draft-overlay" });
  const close = () => { document.removeEventListener("keydown", onKey); overlay.remove(); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", onKey);

  const copy = (text, label) => {
    const done = () => flash(`${label} copiado.`);
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
    else done();
  };

  const panel = el("div", { class: "draft-panel" }, [
    el("div", { class: "draft-head" }, [
      el("div", {}, [
        el("div", { class: "draft-kicker", text: `Contacto · ${brief.channel || "canal por confirmar"}` }),
        el("div", { class: "draft-co", text: brief.name }),
        el("div", { class: "draft-meta", text: `${[brief.sector, brief.city].filter(Boolean).join(" · ") || "—"} · OCI ${brief.oci}` }),
      ]),
      el("button", { class: "draft-x", text: "✕", onClick: close }),
    ]),
    sig
      ? el("div", { class: "draft-section" }, [
          el("div", { class: "draft-label", text: "Señal detectada" }),
          el("div", { class: "draft-signal" }, [
            el("span", { class: "draft-signal-dot" }),
            el("span", { class: "draft-signal-label", text: sig.label }),
          ]),
          sig.url
            ? el("a", { class: "draft-signal-src", href: sig.url, target: "_blank", rel: "noopener", text: `Fuente: ${sig.source} ↗` })
            : el("div", { class: "draft-signal-src", text: `Fuente: ${sig.source}` }),
        ])
      : null,
    el("div", { class: "draft-section" }, [
      el("div", { class: "draft-label", text: "Ángulo de entrada" }),
      el("div", { class: "draft-angle", text: brief.openingAngle || "Sin ángulo confirmado — conviene una observación concreta (web/marca/momento) antes de escribir." }),
    ]),
    el("div", { class: "draft-section" }, [
      el("div", { class: "draft-label-row" }, [
        el("span", { class: "draft-label", text: "Primer mensaje" }),
        el("button", { class: "draft-copy", text: "Copiar", onClick: () => copy(brief.firstMessage, "Mensaje") }),
      ]),
      el("div", { class: "draft-message", text: brief.firstMessage }),
    ]),
    el("div", { class: "draft-foot" }, [
      el("button", { class: "draft-act-ghost", text: "Copiar brief", onClick: () => copy(briefToText(brief), "Brief") }),
      el("button", { class: "draft-act-primary", text: "✓ Marcar contactado", onClick: () => { markContacted(leadId, decision); close(); } }),
    ]),
  ]);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

// Registra un contacto REAL en el Ledger (emite la orden y la marca obedecida).
// Esto cierra el bucle que antes solo escribía el Reactor huérfano: ahora el
// "Track record" del Desk refleja tus acciones de verdad, no datos muertos.
function markContacted(leadId, decision) {
  const t = Date.now();
  store.stampOrderIssued(leadId, t);
  const rec = store.getRecord(leadId);
  const oid = orderIdFor(leadId, rec.orderIssuedAt);
  store.ledgerIssue(oid, {
    leadId, at: t, oci: decision.oci || 0,
    expectedOutcome: "avance", confidence: decision.oci || 0, expectedValue: null,
  });
  store.ledgerObey(oid);
  store.setStatus(leadId, "contacted");
  flash("✓ Contactado — registrado en tu track record.");
  render();
}


function todayView() {
  const tracking = store.getTracking();
  const opps = state.results ? state.results.all : [];
  const pulse = pipelinePulse(opps, tracking);
  // Si el usuario en sesión tiene llamadas asignadas (su agenda), Hoy muestra
  // LAS SUYAS que tocan hoy; si no, el foco global de siempre.
  const meNow = auth.currentUser();
  const hasMine = meNow && opps.some((o) => tracking[o.id]?.assignedTo === meNow.name);
  const calls = hasMine
    ? pickTodayCalls(opps, tracking, { owner: meNow.name, today: ymd(new Date()), limit: 3 })
    : pickTodayCalls(opps, tracking, { limit: 3 });
  const u = auth.currentUser();
  const h = new Date().getHours();
  const greet = h < 6 ? "Buenas noches" : h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";

  const blocks = [];
  blocks.push(el("div", { class: "today-hero" }, [
    el("div", { class: "today-greet", text: `${greet}${u ? `, ${u.name}` : ""}` }),
    el("div", { class: "today-sub", text: "Tu día en Connect — a quién llamar y por qué, de un vistazo." }),
  ]));

  // Pulso personal: la obsesión hecha tira glanceable. Racha, lo hecho hoy, lo que
  // te espera en el muelle y la última palmada del CEO. Sin texto: cifras y gestos.
  if (u) blocks.push(todayPulseStrip(u.name));

  // Estado de arranque: si aún no hay NADA movido (cero llamadas, cero cierres),
  // un onboarding claro en vez de un muro de KPIs a cero compitiendo.
  const movedAnything = pulse.called > 0 || pulse.meetings > 0 || pulse.won > 0 || pulse.proposals > 0;
  if (!movedAnything) {
    blocks.push(el("div", { class: "today-onboard" }, [
      el("div", { class: "ob-step" }, [el("span", { class: "ob-n", text: "1" }), el("span", { text: calls.length ? `Llama a ${calls[0].company} — es tu mejor oportunidad ahora.` : "Capta tus primeras oportunidades." })]),
      el("div", { class: "ob-step" }, [el("span", { class: "ob-n", text: "2" }), el("span", { text: "Marca el resultado con un toque (Interesado · Reunión · Rechazado)." })]),
      el("div", { class: "ob-step" }, [el("span", { class: "ob-n", text: "3" }), el("span", { text: "El sistema aprende solo y la app cobra vida." })]),
      el("button", { class: "btn-primary ob-cta", text: calls.length ? `📞 Empezar por ${calls[0].company}` : "⚡ Captar oportunidades", onClick: () => calls.length ? openCase(calls[0].id) : goView("search") }),
    ]));
  }

  // Centro de mando: la acción de ahora + la ruta del día.
  blocks.push(commandCenter(calls));

  // Las llamadas de hoy.
  blocks.push(el("h2", { class: "today-h2", text: "Las 3 llamadas de hoy" }));
  if (!calls.length) {
    blocks.push(emptyNote("No hay oportunidades vivas todavía.", { icon: "☀", sub: "Ve a Oportunidades y lanza una tanda para llenar el día.", action: { label: "Ir a Oportunidades", onClick: () => goView("cards") } }));
    blocks.push(el("button", { class: "btn-primary", text: "Ir a Oportunidades", onClick: () => goView("cards") }));
  } else {
    blocks.push(el("ol", { class: "today-calls" }, calls.map((o, i) => todayCall(o, i, tracking[o.id] || {}))));
  }

  // Seguimientos con fecha (tareas creadas desde llamadas): vencidos o de hoy.
  const today = ymd(new Date());
  const dueTasks = dueFollowupTasks(store.getTasks(), today);
  if (dueTasks.length) {
    blocks.push(el("h2", { class: "today-h2", text: `Seguimientos agendados · ${dueTasks.length}` }));
    blocks.push(el("ul", { class: "fut-list" }, dueTasks.slice(0, 10).map((t) => followupTaskRow(t, today))));
  }

  // Seguimientos que tocan hoy: hilos abiertos con un toque vencido (cadencia).
  const due = dueFollowups(opps, tracking);
  if (due.length) {
    blocks.push(el("h2", { class: "today-h2", text: `Seguimientos sugeridos · ${due.length}` }));
    blocks.push(el("ul", { class: "fu-list" }, due.slice(0, 8).map(({ opp, fu }) => followupRow(opp, fu))));
  }

  // El marcador, al final: primero el trabajo del día, luego cómo va todo. Las
  // cifras son referencia (sirven sobre todo a la dirección), no el titular —
  // la acción manda arriba, el pulso del pipeline acompaña abajo.
  blocks.push(el("h2", { class: "today-h2 today-h2-quiet", text: "El marcador" }));
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

  return el("div", { class: "today" }, blocks);
}

// ---- Tareas: quién hace qué (Fase 12) ---------------------------------------
//
// La mesa de tareas del equipo. Arriba, el briefing del que mira: su foco y lo
// que tiene abierto, para embestir sin pensar. Debajo, el reparto real por
// persona — cada uno marca el avance de lo suyo (por hacer → haciendo → hecho).
// Todo viaja por el documento compartido: lo que marca uno, lo ve el resto.
function tasksView() {
  const me = auth.currentUser();
  const canWrite = isWriter(auth.currentRole());
  const team = auth.getUsers().filter((u) => !u.colorOnly || u.role);
  team.sort((a, b) => (a.tier ?? 2) - (b.tier ?? 2) || a.name.localeCompare(b.name));

  const wrap = el("div", { class: "tasks" });
  const board = el("div", { class: "task-board" });

  const paint = () => {
    clear(board);
    const all = store.getTasks();

    // — Briefing del que mira: su foco y su carga abierta —
    if (me) {
      const mine = tasks.openFor(all, me.name);
      const brief = el("div", { class: "brief" }, [
        el("div", { class: "brief-head" }, [
          el("span", { class: "brief-greet", text: `Tu foco, ${me.name}` }),
          el("span", { class: "brief-count", text: mine.length ? `${mine.length} abierta${mine.length === 1 ? "" : "s"}` : "al día" }),
        ]),
        el("p", { class: "brief-line", text: mine.length
          ? "Embiste lo tuyo de arriba abajo. Marca el avance en cuanto lo muevas — el equipo lo ve al momento."
          : "Sin tareas abiertas. Coge una sin asignar o crea la siguiente jugada." }),
      ]);
      if (mine.length) {
        brief.appendChild(el("ul", { class: "brief-list" }, mine.slice(0, 5).map((t) =>
          el("li", { class: "brief-item" }, [
            el("button", {
              class: `task-chip st-${t.status}`,
              title: "Cambiar estado",
              text: tasks.STATUS_LABELS[t.status],
              onClick: canWrite ? () => { advanceTask(t); paint(); } : null,
            }),
            el("span", { class: "brief-task", text: t.title }),
          ]))));
      }
      board.appendChild(brief);
    }

    // — Reparto del equipo, por responsable (organigrama) —
    const groups = tasks.groupByAssignee(all, team);
    const counts = tasks.countByStatus(all);
    board.appendChild(el("h2", { class: "today-h2", text: `El reparto · ${counts.open} abiertas` }));

    if (!all.length) {
      board.appendChild(emptyNote("Aún no hay tareas.", { icon: "✓", sub: "Crea la primera arriba y asígnala a quien la lleva." }));
      return;
    }

    for (const g of groups) {
      const name = g.name || "Sin asignar";
      const head = el("div", { class: "task-grp-head" }, [
        el("span", { class: "task-grp-name", text: name }),
        el("span", { class: "task-grp-n", text: g.counts.open ? `${g.counts.open} viva${g.counts.open === 1 ? "" : "s"}` : (g.counts.total ? "todo hecho" : "libre") }),
      ]);
      const rows = g.tasks.map((t) => taskRow(t, canWrite, paint));
      board.appendChild(el("div", { class: "task-grp" }, [head, el("ul", { class: "task-list" }, rows.length ? rows : [
        el("li", { class: "task-empty", text: "—" }),
      ])]));
    }
  };

  wrap.appendChild(el("h2", { text: "Tareas del equipo" }));
  wrap.appendChild(el("p", { class: "hint", text: "Quién hace qué, sin ruido. Asigna, marca el avance y embiste. Lo que mueve uno, lo ve el equipo." }));

  // — Crear tarea: título + responsable (solo roles con escritura) —
  if (canWrite) {
    const input = el("input", { class: "lead-f task-new-title", type: "text", placeholder: "Nueva tarea — qué hay que hacer…", maxlength: "280" });
    const who = el("select", { class: "lead-f task-new-who", title: "Para quién" }, [
      el("option", { value: "", text: "Sin asignar" }),
      ...team.map((u) => el("option", { value: u.name, selected: me && norm(u.name) === norm(me.name), text: u.name })),
    ]);
    const add = () => {
      const t = tasks.makeTask({ title: input.value, assignee: who.value, by: me ? me.name : null });
      if (!t) { input.focus(); return; }
      store.upsertTask(t);
      activity.logActivity("task_new", t.title);
      input.value = "";
      paint();
      input.focus();
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    wrap.appendChild(el("div", { class: "task-new" }, [
      input, who,
      el("button", { class: "btn-primary task-new-add", text: "Añadir", onClick: add }),
    ]));
  } else {
    wrap.appendChild(el("p", { class: "ro-notice", text: "Tu rol mira el reparto pero no edita tareas." }));
  }

  wrap.appendChild(board);
  paint();
  return wrap;
}

// Una fila de tarea: estado (clic para avanzar), título, responsable y borrar.
// Avanza el estado de una tarea y, si llega a "hecho", lo deja en el feed.
function advanceTask(t) {
  const next = tasks.nextStatus(t.status);
  store.setTaskStatus(t.id, next);
  if (next === "done") activity.logActivity("task_done", t.title);
}

function taskRow(t, canWrite, repaint) {
  const statusBtn = el("button", {
    class: `task-chip st-${t.status}`,
    title: canWrite ? "Cambiar estado" : tasks.STATUS_LABELS[t.status],
    text: tasks.STATUS_LABELS[t.status],
    onClick: canWrite ? () => { advanceTask(t); repaint(); } : null,
  });
  const kids = [
    statusBtn,
    el("span", { class: `task-title ${t.status === "done" ? "is-done" : ""}`, text: t.title }),
  ];
  if (t.by && t.by !== t.assignee) kids.push(el("span", { class: "task-by", text: `de ${t.by}` }));
  if (canWrite) {
    kids.push(el("button", {
      class: "task-del", title: "Eliminar tarea",
      html: icon("trash"),
      onClick: () => { if (confirm(`¿Eliminar “${t.title}”?`)) { store.removeTask(t.id); repaint(); } },
    }));
  }
  return el("li", { class: "task-row" }, kids);
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

// Fila de una tarea de seguimiento agendada (creada desde una llamada). Trae el
// contexto mínimo de la última llamada del lead y permite marcar hecha o abrir.
function followupTaskRow(task, today) {
  const opp = (state.results?.all || []).find((o) => o.id === task.leadId);
  const name = opp?.company || task.title.replace(/^Seguimiento · /, "") || "Lead";
  const overdue = task.dueDate < today;
  const ctx = latestCallContext(store.getLeadCalls(task.leadId));
  const ctxBits = [];
  if (ctx?.result) ctxBits.push(CALL_RESULTS[ctx.result] || ctx.result);
  if (ctx?.objection) ctxBits.push(`obj: ${ctx.objection}`);
  const canWrite = isWriter(auth.currentRole());

  const doneBtn = !canWrite ? null : el("button", {
    class: "fut-done", title: "Marcar hecha", text: "✓",
    onClick: (e) => { e.stopPropagation(); store.setTaskStatus(task.id, "done"); render(); },
  });

  return el("li", { class: `fut prio-${task.priority || "media"} ${overdue ? "fut-overdue" : ""}` }, [
    el("div", { class: "fut-main", onClick: () => opp ? openCase(opp.id) : (state.filters.search = name, goView("cards")) }, [
      el("div", { class: "fut-line" }, [
        el("span", { class: "fut-name", text: name }),
        el("span", { class: `fut-due ${overdue ? "is-over" : ""}`, text: overdue ? `vencido (${task.dueDate})` : "hoy" }),
        task.priority === "alta" ? el("span", { class: "fut-prio", text: "alta" }) : null,
      ]),
      el("div", { class: "fut-note", text: task.note || ctx?.nextStep || "Seguimiento de la llamada." }),
      ctxBits.length ? el("div", { class: "fut-ctx", text: ctxBits.join(" · ") }) : null,
    ]),
    doneBtn,
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
// Operator v1 — drawer contextual sobre UNA oportunidad. Calcula la decisión y
// el brief en local (decision.js/brief.js), y muestra la respuesta a la
// intención elegida. Sin LLM, sin red. Cambiar de intención repinta en el sitio.
// Enriquecimiento web HONESTO de un lead: lee su web (Edge Function) y convierte
// lo que AFIRMA en verificaciones citadas (verde solo si es explícito; amarillo
// si es indicio; gris si no aparece). No recomputa: lo hace el llamante. Devuelve
// el resultado para que la UI muestre estado (success/failed) sin inventar.
async function enrichLead(opp) {
  if (!opp || !opp.website) return { status: "failed", note: "Este lead no tiene web registrada." };
  let page;
  try {
    page = await fetchWebFreshness(opp.website, auth.getToken(), true); // force: lectura fresca con campos ricos
  } catch {
    return { status: "failed", note: "Sin conexión para leer su web." };
  }
  const result = extractWebSignals(page, { website: opp.website });
  if (result.status === "success") {
    for (const v of result.verifications) {
      store.addVerification(opp.id, v.filter, v.level, v.note, v.url, { auto: true, srcLabel: "Lectura de su web" });
    }
  }
  return result;
}

// Estado de enriquecimiento de un lead (derivado de sus verificaciones auto): sin
// persistencia nueva — la evidencia citada YA lleva fuente (url) y fecha (at).
function leadEnrichment(id) {
  const vs = store.getLeadVerifications(id).filter((v) => v.auto);
  return { enriched: vs.length > 0, count: vs.length, at: vs.length ? vs.map((v) => v.at).sort().pop() : null };
}

// Comando "enrich" / "enriquecer": lee la web de los leads del foco actual que
// están en NEEDS_EVIDENCE y tienen web (lote acotado, no masivo).
async function enrichFocused() {
  const decided = feedModel().filtered;
  const targets = decided
    .filter((x) => x.opp.website && (x.decision.decision === "NEEDS_EVIDENCE" || x.decision.decision === "ENRICH"))
    .slice(0, 12) // tope: nada de automatización masiva
    .map((x) => x.opp);
  if (!targets.length) { flash("Nada que enriquecer aquí: ninguno con web pendiente de evidencia."); return; }
  flash(`Leyendo ${targets.length} web${targets.length === 1 ? "" : "s"}…`);
  let okN = 0, failN = 0;
  for (const opp of targets) {
    const r = await enrichLead(opp);
    if (r.status === "success" && r.verifications.length) okN++; else if (r.status === "failed") failN++;
  }
  await recompute();
  render();
  flash(`Enriquecidos ${okN} con señales · ${failN} no legibles. Revisa el feed.`);
}

// Muelle de importación: pega una lista externa → preview honesto → al feed.
// No enriquece, no inventa, no duplica en silencio.
function openImport() {
  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => { overlay.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);

  const ta = el("textarea", { class: "imp-ta", placeholder: "Pega aquí tu lista (CSV de Apollo/Clay/HubSpot, o nombres por línea).\nEj.: empresa,web,sector,ciudad,notas" });
  const preview = el("div", { class: "imp-preview" });
  const FIELD_LABEL = { company: "empresa", website: "web", sector: "sector", city: "ciudad", notes: "notas" };

  function importRows(rows) {
    const existingNames = new Set((state.results?.all || []).map((o) => (o.company || "").toLowerCase()));
    const importedIds = [];
    let added = 0;
    for (const row of rows) {
      const input = rowToLeadInput(row);
      if (!input.company && !input.website) continue;
      const lead = buildLead(input);
      lead._source = "imported"; // protege del purge de baja confianza al recargar
      store.saveUserLead(lead);
      importedIds.push(lead.id);
      existingNames.add((input.company || "").toLowerCase());
      added++;
    }
    close();
    if (!added) {
      // Todo eran duplicados (o filas vacías): no cambiamos de contexto.
      recompute().then(render);
      flash("No había leads nuevos que importar (todo eran duplicados).");
      return;
    }
    // Persiste los ids para restaurar el foco tras reload (sobrevive al refresco).
    saveRecentImportIds(importedIds);
    state.recentImportIds = importedIds;
    // Trae tu lista: pasa a TU pipeline y re-puntúa SOLO tus leads (no el demo),
    // luego aterriza en el Desk. El motor prioriza tu lista real. Honesto y vendible.
    state.dataset = "mine";
    state.feedCmd = null;
    state.feedCmdText = "";
    recompute().then(() => {
      state.view = "desk";
      render();
      flash(`Importadas ${added} oportunidad${added === 1 ? "" : "es"} — trabajando tu lista.`);
    });
  }

  const analyze = el("button", { class: "btn", text: "Analizar lista", onClick: () => {
    const parsed = parseLeads(ta.value);
    preview.innerHTML = "";
    if (!parsed.total) { preview.appendChild(el("p", { class: "imp-empty", text: "No detecté ninguna fila. Pega al menos un nombre de empresa." })); return; }
    const existing = (state.results?.all || []).map((o) => ({ company: o.company, website: o.website }));
    const dups = findDuplicates(parsed.rows, existing);
    const dupCount = dups.filter((d) => d.dup).length;
    const newRows = parsed.rows.filter((_, i) => !dups[i].dup);

    preview.appendChild(el("div", { class: "imp-summary" }, [
      el("div", { class: "imp-stat" }, [el("b", { text: String(parsed.total) }), el("span", { text: "leads detectados" })]),
      el("div", { class: "imp-stat" }, [el("b", { text: String(newRows.length) }), el("span", { text: "nuevos" })]),
      dupCount ? el("div", { class: "imp-stat imp-dup" }, [el("b", { text: String(dupCount) }), el("span", { text: "posibles duplicados" })]) : null,
    ]));
    preview.appendChild(el("p", { class: "imp-fields" }, [
      el("span", { text: `Reconocidos: ${parsed.fields.recognized.map((f) => FIELD_LABEL[f] || f).join(", ") || "—"}` }),
      parsed.fields.missing.length ? el("span", { class: "imp-missing", text: ` · Sin datos (quedan grises): ${parsed.fields.missing.map((f) => FIELD_LABEL[f] || f).join(", ")}` }) : null,
    ]));
    if (dupCount) {
      preview.appendChild(el("p", { class: "imp-dupnote", text: `${dupCount} ya parecen estar en Connect (por web o nombre). Se saltarán salvo que importes todos.` }));
    }
    // Muestra de las primeras filas (honesto sobre qué entró).
    preview.appendChild(el("div", { class: "imp-rows" }, parsed.rows.slice(0, 6).map((r, i) =>
      el("div", { class: `imp-row ${dups[i].dup ? "is-dup" : ""}` }, [
        el("span", { class: "imp-co", text: r.company || "(sin nombre)" }),
        el("span", { class: "imp-web", text: r.website || "—" }),
        dups[i].dup ? el("span", { class: "imp-tag", text: `dup: ${dups[i].against || ""}` }) : null,
      ]))));

    const actions = el("div", { class: "imp-actions" }, [
      el("button", { class: "btn-primary", text: `Importar ${newRows.length} nuevos`, onClick: () => importRows(newRows), disabled: newRows.length ? undefined : "" }),
      dupCount ? el("button", { class: "btn", text: `Importar todos (${parsed.total}, incl. duplicados)`, onClick: () => importRows(parsed.rows) }) : null,
      el("button", { class: "btn", text: "Cancelar", onClick: close }),
    ]);
    preview.appendChild(actions);
  } });

  overlay.appendChild(el("div", { class: "pb-panel imp-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", {}, [
        el("div", { class: "pb-title", text: "Importar leads" }),
        el("div", { class: "pb-sub", text: "Pega Apollo/Clay/HubSpot/CSV. Connect los convierte en oportunidades con OCI y decisión — sin inventar lo que no aportes." }),
      ]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    ta,
    el("div", { class: "imp-bar" }, [analyze]),
    preview,
  ]));
  document.body.appendChild(overlay);
}

function openOperator(opp, intent = "explain") {
  if (!opp) return;
  const scored = opp.scores || {};
  const decision = decide(opp, scored);
  const brief = buildBrief(opp, scored, decision);
  const ctx = { opp, scored, decision, brief };

  const overlay = el("div", { class: "pb-overlay", onClick: (e) => { if (e.target === overlay) close(); } });
  const close = () => { overlay.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);

  let current = OPERATOR_INTENTS.includes(intent) ? intent : "explain";
  const body = el("div", { class: "op-body" });
  const tabs = el("div", { class: "op-tabs" });

  const copyBtn = el("button", { class: "pb-copy", text: "Copiar brief", onClick: () => {
    const txt = briefToText(brief);
    const done = () => { copyBtn.textContent = "✓ Copiado"; setTimeout(() => (copyBtn.textContent = "Copiar brief"), 1400); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(done).catch(done); else done();
  } });
  const mdBtn = el("button", { class: "pb-copy", text: "Descargar .md", onClick: () => {
    const safe = String(opp.company || "brief").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    xport.download(`brief-${safe}.md`, briefToMarkdown(brief, "es"), "text/markdown");
  } });
  const briefActions = el("div", { class: "op-brief-actions" }, [copyBtn, mdBtn]);

  function paint() {
    tabs.innerHTML = "";
    for (const it of OPERATOR_INTENTS) {
      tabs.appendChild(el("button", {
        class: `op-tab ${it === current ? "active" : ""}`, text: OPERATOR_LABELS[it],
        onClick: () => { current = it; paint(); },
      }));
    }
    const ans = operatorAnswer(current, ctx);
    body.innerHTML = "";
    body.appendChild(el("div", { class: "op-ans-title", text: ans.title }));
    body.appendChild(el("div", { class: "op-ans" }, ans.lines.map((l) => el("p", { class: "op-line", text: l }))));
    body.appendChild(current === "brief" ? briefActions : null);
  }
  paint();

  overlay.appendChild(el("div", { class: "pb-panel op-panel" }, [
    el("div", { class: "pb-head" }, [
      el("div", {}, [
        el("div", { class: "pb-title", text: `Operator — ${opp.company}` }),
        el("div", { class: "pb-sub", text: `OCI ${decision.oci} · ${decision.decisionLabel} · ${decision.strategicTag.label}` }),
      ]),
      el("button", { class: "pb-x", text: "✕", title: "Cerrar", onClick: close }),
    ]),
    tabs,
    body,
  ]));
  document.body.appendChild(overlay);
}

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
  const head = ["#", "Empresa", "Sector", "Ciudad", "Conf", "Evid", "Conv", "Reun", "Cierre", "Econ", "Recom", "Estado"];
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

// Hero de decisión: lo primero que ve el usuario al abrir Mapa. No es un
// resumen pasivo — es el veredicto del motor convertido en una sola orden de
// trabajo. "El motor procesó el caos · hoy hay N que importan · tu siguiente
// acción es verlas". Reutiliza el foco actNow de los buckets (cero lógica nueva).
function mapHero(buckets, total) {
  const act = buckets.actNow?.length || 0;
  const ev  = buckets.needsEvidence?.length || 0;

  // Activa exactamente el mismo foco que el chip del bucket (misma fuente de
  // verdad: BUCKETS). No duplica la lógica de filtrado.
  const focusBucket = (key) => {
    const b = BUCKETS.find((x) => x.key === key);
    if (!b) return;
    state.feedCmd = { kind: "decision", decisions: b.decisions, sort: key === "actNow" ? "oci" : undefined, label: b.label };
    state.feedCmdText = b.label;
    render();
  };

  const kicker = el("span", { class: "hero-kicker", text: "Mapa de oportunidades" });
  const emp = total === 1 ? "empresa" : "empresas";

  // Estado vacío: el motor aún no tiene nada que procesar.
  if (!total) {
    return el("div", { class: "map-hero map-hero-empty" }, [
      kicker,
      el("p", { class: "hero-lead", text: "Aún no hay oportunidades en el mapa." }),
      el("button", { class: "btn-primary hero-cta", text: "Captar las primeras", onClick: () => goView("search") }),
    ]);
  }

  const lead = el("p", { class: "hero-lead" }, [
    el("span", { text: "El motor ha revisado " }),
    el("b", { text: String(total) }),
    el("span", { text: ` ${emp}.` }),
  ]);

  // Caso principal: hay llamadas que hacer hoy. El número manda.
  if (act > 0) {
    const merecen = act === 1 ? "merece" : "merecen";
    const directive = act === 1 ? "Tu trabajo hoy: hablar con ella." : `Tu trabajo hoy: hablar con estas ${act}.`;
    return el("div", { class: "map-hero" }, [
      kicker,
      lead,
      el("p", { class: "hero-figure" }, [
        el("b", { text: String(act) }),
        el("span", { text: ` ${merecen} una llamada ahora.` }),
      ]),
      el("p", { class: "hero-directive", text: directive }),
      el("button", { class: "btn-primary hero-cta", text: act === 1 ? "Ver la empresa" : `Ver las ${act}`, onClick: () => focusBucket("actNow") }),
    ]);
  }

  // Sin llamadas inmediatas, pero hay evidencia que reunir antes de avanzar.
  if (ev > 0) {
    const necesitan = ev === 1 ? "necesita" : "necesitan";
    return el("div", { class: "map-hero map-hero-soft" }, [
      kicker,
      lead,
      el("p", { class: "hero-figure", text: "Ninguna lista para llamar todavía." }),
      el("p", { class: "hero-directive", text: `${ev} ${necesitan} más evidencia antes de avanzar.` }),
      el("button", { class: "btn-primary hero-cta", text: ev === 1 ? "Revisar la empresa" : `Revisar las ${ev}`, onClick: () => focusBucket("needsEvidence") }),
    ]);
  }

  // Nada accionable hoy: todo es puerta estratégica o ruido descartado.
  return el("div", { class: "map-hero map-hero-soft" }, [
    kicker,
    lead,
    el("p", { class: "hero-figure", text: "Ninguna requiere acción inmediata hoy." }),
  ]);
}

// Opportunity Map: la superficie principal. Command Bar ("Ask Operator…") +
// veredicto del motor + buckets accionables + feed escrolleable, todo gobernado por OCI.
function cardsView() {
  const model = feedModel();
  const total = model.decided.length;
  return el("div", { class: "feed" }, [
    // 1. Decisión: el hero del motor abre la pantalla. Una orden de trabajo.
    mapHero(model.buckets, total),
    // 2. Foco activo (si lo hay): banner fino justo encima de las cards, para
    //    que al pulsar "Ver las N" el usuario vea que el feed quedó enfocado.
    focusBanner(model.filtered.length),
    // 3. Las oportunidades, pegadas al hero. Nada entre la decisión y el trabajo.
    el("div", { class: "results-region" }, [feedCards(model.filtered)]),
    // 4. Contexto del motor: buckets + Ask Operator + respuesta. Plegado: nadie
    //    abre Connect para filtrar, sino para que le digan qué hacer.
    el("details", { class: "motor-context" }, [
      el("summary", { text: "Contexto del motor" }),
      bucketsRow(model.buckets),
      commandBar(),
      operatorAnswerLine(model.filtered),
    ]),
    // 5. Herramientas (importar · exportar · captar más) + parte del agente.
    el("details", { class: "map-tools" }, [
      el("summary", { text: "Herramientas" }),
      el("div", { class: "feed-io" }, [
        allow("write") ? el("button", { class: "io-btn", title: "Pegar una lista externa (Apollo/Clay/HubSpot/CSV) y convertirla en oportunidades", text: "↧ Importar", onClick: openImport }) : null,
        el("button", { class: "io-btn", title: "Exportar el feed como CSV de decisión", text: "↥ Export CSV", onClick: exportDecisionCsvNow }),
        (allow("discover") || allow("write")) ? agentButton() : null,
      ]),
      el("div", { class: "agent-report", id: "agent-report" }),
    ]),
    // 6. Filtros avanzados, plegados: la superficie principal no se carga con ellos.
    el("details", { class: "feed-filters" }, [el("summary", { text: "Filtros avanzados" }), filterBar()]),
  ]);
}

// Modelo del feed: decide cada oportunidad visible una sola vez, agrupa en
// buckets y aplica el foco activo (comando o bucket). Determinista.
function feedModel() {
  // Foco "Recién importados": se salta los filtros de visibilidad (clasificación,
  // sector, ciudad, minConfidence…) para el conjunto exacto recién pegado. Así los
  // leads importados —a menudo 'unqualified'— SIEMPRE se ven justo tras importar,
  // sin que un filtro previo los oculte. Fuera de este foco, el feed va normal.
  const base = state.feedCmd && state.feedCmd.kind === "recent"
    ? (state.results?.all || []).filter((o) => (state.feedCmd.ids || []).includes(o.id))
    : visibleOpps();
  const decided = base.map((o) => ({ opp: o, decision: decide(o, o.scores || {}) }));
  const buckets = bucketize(decided);
  const filtered = applyCommand(decided, state.feedCmd);
  return { decided, buckets, filtered };
}

// Command Bar: pregunta en lenguaje natural → enfoca el feed o sugiere.
// Placeholder corto; los ejemplos son chips pulsables debajo (descubribles sin
// texto largo que sature, y en móvil no se cortan).
const CMD_EXAMPLES = ["Qué hago hoy", "Mata ruido", "Strategic doors", "Needs evidence"];
// Comandos de app (import/export) — se interceptan antes del parser de feed para
// no contaminar la lógica pura de operator.js. Devuelve true si lo gestiona.
function appCommand(text) {
  const n = String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!n.trim()) return false;
  if (/\b(import|importar|pegar|paste)\b/.test(n)) { openImport(); return true; }
  if (/\b(enrich|enriquec)/.test(n)) { enrichFocused(); return true; }
  if (/\bexport/.test(n) || /\bexportar/.test(n) || (/\bcsv\b/.test(n) && !/import/.test(n))) {
    exportDecisionCsvNow(); return true;
  }
  return false;
}
function runCommand(text) {
  if (appCommand(text)) { state.feedCmdText = ""; return; }
  const cmd = parseCommand(text);
  state.feedCmdText = text;
  state.feedCmd = cmd.kind === "clear" ? null : cmd;
  render();
}
function exportDecisionCsvNow() {
  const opps = (state.results?.all || []).filter((o) => o.scores);
  if (!opps.length) { flash("No hay oportunidades que exportar todavía."); return; }
  xport.exportDecisionCSV(opps, store.getTracking());
  flash(`CSV exportado · ${opps.length} oportunidades.`);
}
function commandBar() {
  const input = el("input", {
    class: "cmd-ask", type: "text", value: state.feedCmdText || "",
    placeholder: "Ask Operator…",
  });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") runCommand(input.value); });
  const bar = el("div", { class: "cmd-bar" }, [
    el("span", { class: "cmd-ask-ic", text: "▸" }),
    input,
    el("button", { class: "cmd-ask-go", text: "Preguntar", onClick: () => runCommand(input.value) }),
    state.feedCmd ? el("button", { class: "cmd-ask-clear", title: "Quitar foco", text: "✕", onClick: clearFeedCmd }) : null,
  ]);
  const examples = el("div", { class: "cmd-examples" }, CMD_EXAMPLES.map((ex) =>
    el("button", { class: "cmd-ex", text: ex, onClick: () => runCommand(ex) })));
  return el("div", { class: "cmd-wrap" }, [bar, examples]);
}

// Respuesta ejecutiva de una línea del Operator: aparece sobre el feed cuando
// hay un comando/foco activo. Texto honesto desde datos reales (commandAnswer).
function operatorAnswerLine(filtered) {
  if (!state.feedCmd) return null;
  const text = commandAnswer(state.feedCmd, filtered);
  if (!text) return null;
  return el("div", { class: "op-answer" }, [
    el("span", { class: "op-answer-ic", text: "▸" }),
    el("span", { class: "op-answer-text", text }),
  ]);
}

// Resumen de buckets: cuatro cubos accionables + Follow-ups Due (solo si hay
// dato real). Cada uno enfoca el feed al pulsarlo.
function bucketsRow(buckets) {
  const active = state.feedCmd && state.feedCmd.kind === "decision" ? state.feedCmd.decisions.join(",") : null;
  const CLS = { actNow: "act", needsEvidence: "ev", strategicDoors: "door", killedNoise: "kill" };
  const chips = BUCKETS.map((b) => {
    const list = buckets[b.key] || [];
    const isActive = active === b.decisions.join(",");
    return el("button", {
      class: `bk bk-${CLS[b.key]} ${isActive ? "active" : ""}`,
      disabled: list.length ? undefined : "",
      onClick: () => {
        state.feedCmd = isActive ? null : { kind: "decision", decisions: b.decisions, sort: b.key === "actNow" ? "oci" : undefined, label: b.label };
        state.feedCmdText = isActive ? "" : b.label;
        render();
      },
    }, [el("b", { text: String(list.length) }), el("span", { text: b.label })]);
  });
  // Follow-ups Due: solo si existe dato real (tareas de seguimiento vencidas/hoy).
  const due = dueFollowupTasks(store.getTasks(), ymd(new Date())).length;
  if (due) {
    chips.push(el("button", { class: "bk bk-fu", title: "Ir a Hoy", onClick: () => goView("today") }, [
      el("b", { text: String(due) }), el("span", { text: "Follow-ups Due" }),
    ]));
  }
  return el("div", { class: "buckets" }, chips);
}

// Banner de foco: qué está enfocado + cuántos, con salida. Para comandos no
// entendidos, muestra sugerencias en vez de filtrar a ciegas.
function focusBanner(count) {
  const c = state.feedCmd;
  if (!c) return null;
  const clear = el("button", { class: "focus-x", text: "✕ quitar foco", onClick: clearFeedCmd });
  if (c.kind === "unknown") {
    return el("div", { class: "focus-banner focus-unknown" }, [
      el("span", { text: `No entendí «${c.label}». Prueba: ${(c.suggestions || []).join(" · ")}` }),
      clear,
    ]);
  }
  return el("div", { class: "focus-banner" }, [
    el("span", { class: "focus-label", text: `Enfocado: ${c.label}` }),
    el("span", { class: "focus-count", text: `${count} oportunidad${count === 1 ? "" : "es"}` }),
    clear,
  ]);
}

// Pinta las cards del feed (ya decididas/filtradas) o un estado vacío útil.
function feedCards(filtered) {
  const tracking = store.getTracking();
  const handlers = cardHandlers();
  if (!filtered.length) {
    if (state.feedCmd) {
      return emptyNote(`Nada en «${state.feedCmd.label}» ahora mismo.`, {
        icon: "⌕", sub: "Ningún lead cae en este foco con los datos actuales.",
        action: { label: "✕ Quitar foco", onClick: clearFeedCmd },
      });
    }
    const f = state.filters;
    const filtering = f.search || f.sector !== "all" || f.city !== "all" || f.classification !== "all" || f.priority !== "all" || f.minEvidence || f.minConfidence || f.minEvStrength;
    return filtering
      ? emptyNote("Ningún candidato coincide con los filtros actuales.", {
          icon: "⌕", sub: "Puede que un filtro esté ocultando leads.",
          action: { label: "✕ Limpiar filtros", onClick: () => {
            state.filters = { sector: "all", city: "all", classification: "all", priority: "all", minEvidence: 0, minConfidence: 0, minEvStrength: 0, search: "" };
            render();
          } },
        })
      : emptyNote("Aún no hay oportunidades.", { icon: "⚡", sub: "Pulsa ⚡ Nueva tanda de leads para captar." });
  }
  return el("div", { class: "cards" }, filtered.map((x) => renderCard(x.opp, tracking[x.opp.id], handlers)));
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
      btn.innerHTML = `Buscando… (ronda ${round})`;
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
    box.appendChild(el("p", { class: "agent-headline", html: `<b>${res.added} oportunidad${res.added === 1 ? "" : "es"} por encima de ${AGENT_MIN_SCORE}</b> añadida${res.added === 1 ? "" : "s"} al ranking · mejor <b>${res.best}</b>` }));
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

// (La antigua franja "Para llamar ya" se sustituyó por el resumen de buckets +
// el comando "dame los mejores": mismo valor, menos ruido visual.)

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
    // Caja Negra Comercial: leer el historial es para todos; registrar, analizar
    // y borrar llamadas, solo para roles con escritura.
    getCalls: (id) => store.getLeadCalls(id),
    getLeadTasks: (id) => store.getTasks().filter((t) => t.leadId === id),
    // Enriquecimiento web honesto (solo escritura): lee la web del lead y guarda
    // verificaciones citadas; luego recomputa el OCI. Estado derivado, sin
    // persistencia nueva. leadEnrichment está siempre disponible (solo lee).
    leadEnrichment,
    onEnrich: !canWrite ? undefined : async (id, btn) => {
      const lead = (state.results?.all || []).find((o) => o.id === id);
      if (!lead) return;
      const prev = btn && btn.textContent;
      if (btn) { btn.textContent = "Enriqueciendo…"; btn.disabled = true; }
      const r = await enrichLead(lead);
      if (r.status === "failed") {
        flash("No se pudo verificar su web (bloqueada, lenta o sin contenido).");
        if (btn) { btn.textContent = prev || "↻ Enriquecer web"; btn.disabled = false; }
        return;
      }
      flash(enrichmentSummary(r));
      refresh(); // recomputa OCI con la evidencia citada y repinta la card
    },
    // Operator v1: panel contextual (explicar/defender/matar/ángulo/brief). Solo
    // lee y muestra — no muta — así que disponible para cualquier rol.
    onOperator: (id, intent) => {
      const lead = (state.results?.all || []).find((o) => o.id === id);
      if (lead) openOperator(lead, intent);
    },
    // Próxima mejor acción pulsable: resuelve la intención (pura) y la ejecuta
    // con la lógica segura ya existente (CRM, tareas, navegación). Cambios de
    // estado piden confirmación; nada se mueve si rompería la regla de no-degradar.
    onNextAction: !canWrite ? undefined : (id, action) => {
      const lead = (state.results?.all || []).find((o) => o.id === id);
      const rec = store.getRecord(id);
      const status = rec?.status || "not_called";
      const intent = resolveNextActionIntent(action, lead || { id }, store.getLeadCalls(id),
        store.getTasks().filter((t) => t.leadId === id),
        { status, today: ymd(new Date()), by: store.getWho() || null, assignee: rec?.assignedTo || store.getWho() || null });
      // Registro en el feed SOLO de ejecuciones reales (crear tarea, mover
      // estado): la navegación, los noop y lo cancelado no son eventos de equipo.
      const logExec = (nextStatus) => activity.logActivity("next_action", `${intent.label} · ${lead?.company || id}`,
        { actionType: action, result: "executed", previousStatus: status, nextStatus: nextStatus || null });

      switch (intent.kind) {
        case "open_lead":
        case "manual_review":
          openCase(id); break;
        case "open_task":
          goView("tasks"); break;
        case "create_task":
          store.upsertTask(intent.taskDraft); logExec();
          flash(`Seguimiento creado para ${lead?.company || "el lead"}.`);
          refresh(); break;
        case "confirm_status_change":
          if (confirm(intent.reason)) {
            store.setStatus(id, intent.statusTarget);
            store.recordStatusOutcome(id, intent.statusTarget, {
              classification: lead?.scores?.classification,
              sector: lead?.sector || null,
              signals: lead?.signals || null,
              successIndex: lead?.scores?.successIndex,
            });
            logExec(intent.statusTarget);
            flash(`Movido a ${STATUS_LABELS[intent.statusTarget] || intent.statusTarget}.`);
            refresh();
          }
          break;
        case "noop":
        default:
          flash(intent.reason); break;
      }
    },
    onAnalyzeCall: !canWrite ? undefined : (transcript, ctx) => analyzeCall(transcript, ctx),
    onSaveCall: !canWrite ? undefined : (id, fields) => {
      const call = store.upsertCall(newCall(id, { ...fields, by: store.getWho() || null }));
      const lead = (state.results?.all || []).find((o) => o.id === id);
      // Follow-up automático: si la llamada deja una fecha de seguimiento (en el
      // análisis o expresada en la transcripción), se crea/actualiza una tarea
      // asociada al lead y a la llamada (id determinista → sin duplicar). Sin
      // fecha clara, no se inventa: solo queda el siguiente paso dentro de la llamada.
      const task = buildFollowUpTask(call, lead || {}, {
        assignee: store.getRecord(id)?.assignedTo || store.getWho() || null,
      });
      if (task) store.upsertTask(task);
      // El resultado de la llamada mueve el estado del CRM solo (sin degradar un
      // lead ya avanzado) y alimenta el learning loop con la objeción real
      // detectada en el análisis — el sistema aprende de cada llamada.
      const current = store.getRecord(id)?.status || "not_called";
      const target = resultToStatus(fields.result, current);
      if (target && target !== current) {
        store.setStatus(id, target);
        store.recordStatusOutcome(id, target, {
          classification: lead?.scores?.classification,
          sector: lead?.sector || null,
          signals: lead?.signals || null,
          successIndex: lead?.scores?.successIndex,
          objection: fields.analysis?.objections?.[0] || null,
        });
        refresh();
      }
    },
    onRemoveCall: !canWrite ? undefined : (callId) => { store.removeCall(callId); },
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
    // Un toque para lanzar un sello sobre este lead al compañero. No es escritura
    // de negocio (lo puede hacer cualquiera con sesión), así que va fuera de RBAC.
    onSello: (id) => posits.openSelloPicker({
      leadId: id,
      leadName: leadNameById(id),
      me: auth.currentUser()?.name || "",
      isCeo: allow("manage_roles"),
      onSent: render,
    }),
  };
}

// Pequeña ballena azul: la marca de CONNECT. Entra una señal, sale un chorro
// (de marca, dirección y valor). El soplo va en oro de acento.
// Marca de CONNECT: nodo 01 (lleno) ↔ XN (contorno) conectados. Geométrica,
// sobria, en oro. Sustituye a la antigua ballena azul.
function whaleMark() {
  return el("span", { class: "whale brand-mark", html:
    '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">' +
    '<rect x="2.5" y="2.5" width="27" height="27" rx="8.5" fill="none" stroke="#cba24a" stroke-width="1.5" opacity="0.85"/>' +
    '<circle cx="11.4" cy="16" r="2.8" fill="#cba24a"/>' +
    '<circle cx="20.6" cy="16" r="2.8" fill="none" stroke="#cba24a" stroke-width="1.7"/>' +
    '<path d="M14.3 16 H17.7" stroke="#cba24a" stroke-width="1.7" stroke-linecap="round"/>' +
    '</svg>' });
}

// Vista de CASO a pantalla completa: al entrar en una oportunidad se ve SOLO ese
// caso, ocupando la pantalla, con todo el análisis desplegado en paneles. Cierra
// con ← Volver, Esc o clic en el fondo. Reutiliza la tarjeta (toda la
// inteligencia ya vive ahí) y la presenta ancha, con cabecera y firma de marca.
// ---- Agenda: reparto de llamadas por persona (horario · rondas · días) ------
const ISO_DAYS = [["1", "L"], ["2", "M"], ["3", "X"], ["4", "J"], ["5", "V"], ["6", "S"], ["7", "D"]];
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WDAYS_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
function fmtDay(ymdStr) {
  const [y, m, d] = String(ymdStr).split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WDAYS_ES[dt.getDay()]} ${d} ${MONTHS_ES[m - 1]}`;
}
const scoreOf = (o) => Math.round(o?.scores?.confidence || 0);

// Una llamada dentro del desglose de la agenda.
function agendaRow(o, tracking) {
  const t = tracking[o.id] || {};
  const st = STATUS_LABELS[t.status || "not_called"] || "Sin llamar";
  return el("div", { class: "ag-row", onClick: () => openCase(o.id) }, [
    el("span", { class: `ag-score s-${scoreOf(o) >= 80 ? "hi" : scoreOf(o) >= 65 ? "mid" : "lo"}`, text: String(scoreOf(o)) }),
    el("div", { class: "ag-row-main" }, [
      el("div", { class: "ag-row-co", text: o.company }),
      el("div", { class: "ag-row-sub", text: `${o.subsector || sectorByKey(o.sector)?.label || o.sector} · ${o.city}` }),
    ]),
    o.phone ? el("a", { class: "ag-tel", href: `tel:${o.phone.replace(/\s/g, "")}`, text: o.phone, onClick: (e) => e.stopPropagation() }) : el("span", { class: "ag-tel ag-tel-none", text: "sin teléfono" }),
    el("span", { class: "ag-status", text: st }),
  ]);
}

function agendaView() {
  const me = auth.currentUser();
  const team = auth.getUsers().map((u) => u.name).filter(Boolean);
  if (!state.agendaUser || (!team.includes(state.agendaUser) && state.agendaUser !== me?.name)) {
    state.agendaUser = me?.name || team[0] || "";
  }
  const subject = state.agendaUser;
  const canWrite = allow("write");
  const sched = { ...DEFAULT_SCHEDULE, ...(store.getSchedule(subject) || {}) };
  const tracking = store.getTracking();
  const all = state.results?.all || [];
  const mine = all.filter((o) => (tracking[o.id]?.assignedTo || null) === subject);

  const wrap = el("div", { class: "agenda view" });

  // — Cabecera —
  const head = el("div", { class: "ag-head" }, [
    el("div", {}, [
      el("h2", { text: "Agenda de llamadas" }),
      el("p", { class: "ag-sub", text: "A quién llama cada persona, en qué orden y qué día. El plan respeta su capacidad diaria." }),
    ]),
  ]);
  if (team.length > 1) {
    const sel = el("select", { class: "ag-userpick", onChange: (e) => { state.agendaUser = e.target.value; render(); } },
      team.map((n) => el("option", { value: n, text: n, selected: n === subject ? "" : undefined })));
    head.appendChild(el("label", { class: "ag-userwrap" }, [el("span", { text: "Persona:" }), sel]));
  }
  wrap.appendChild(head);

  if (!subject) {
    wrap.appendChild(emptyNote("No hay usuarios todavía.", { icon: "👥", sub: "Crea tu usuario para empezar a repartir llamadas." }));
    return wrap;
  }

  // — Editor de horario (capacidad real) —
  const schedBox = el("div", { class: "ag-card" });
  schedBox.appendChild(el("h4", { text: `Horario de ${subject}` }));
  const dayToggles = ISO_DAYS.map(([iso, lbl]) => {
    const on = (sched.workdays || DEFAULT_SCHEDULE.workdays).map(String).includes(iso);
    return el("button", { class: `ag-day ${on ? "on" : ""}`, text: lbl, "data-iso": iso, disabled: canWrite ? undefined : "" });
  });
  const startI = el("input", { class: "ag-time", type: "time", value: sched.start || "09:00", disabled: canWrite ? undefined : "" });
  const endI = el("input", { class: "ag-time", type: "time", value: sched.end || "18:00", disabled: canWrite ? undefined : "" });
  const perI = el("input", { class: "ag-num", type: "number", min: "1", max: "40", value: String(sched.perDay || 8), disabled: canWrite ? undefined : "" });
  dayToggles.forEach((b) => b.addEventListener("click", () => { if (canWrite) b.classList.toggle("on"); }));
  schedBox.appendChild(el("div", { class: "ag-sched" }, [
    el("label", {}, [el("span", { text: "Días laborables" }), el("div", { class: "ag-days" }, dayToggles)]),
    el("label", {}, [el("span", { text: "Jornada" }), el("div", { class: "ag-times" }, [startI, el("span", { text: "–" }), endI])]),
    el("label", {}, [el("span", { text: "Llamadas / día (capacidad)" }), perI]),
  ]));
  if (canWrite) {
    const saveMsg = el("span", { class: "ag-msg" });
    const saveBtn = el("button", { class: "btn", text: "Guardar horario", onClick: () => {
      const workdays = dayToggles.filter((b) => b.classList.contains("on")).map((b) => Number(b.dataset.iso));
      store.setSchedule(subject, { workdays: workdays.length ? workdays : DEFAULT_SCHEDULE.workdays, start: startI.value, end: endI.value, perDay: Math.max(1, Number(perI.value) || 8) });
      saveMsg.textContent = "✓ Guardado";
      setTimeout(() => (saveMsg.textContent = ""), 1600);
    } });
    schedBox.appendChild(el("div", { class: "ag-actions" }, [saveBtn, saveMsg]));
  }
  wrap.appendChild(schedBox);

  // — Acciones de reparto —
  if (canWrite) {
    const acts = el("div", { class: "ag-card ag-plan" });
    acts.appendChild(el("h4", { text: "Plan de rondas" }));
    acts.appendChild(el("p", { class: "ag-hint", text: `Reparte las ${mine.length} llamadas de ${subject} en días laborables (${sched.perDay}/día), las mejores primero.` }));
    const planBtn = el("button", { class: "btn-primary", text: mine.length ? "⚡ Generar / regenerar plan" : "Sin llamadas asignadas todavía", disabled: mine.length ? undefined : "" });
    planBtn.addEventListener("click", () => {
      const live = orderByPriority(mine.filter((o) => ["01", "xn"].includes(o.scores?.classification)));
      const plan = planRounds(live, store.getSchedule(subject) || sched, {});
      for (const a of plan) store.assignLead(a.id, { scheduledFor: a.date, round: a.round });
      render();
    });
    acts.appendChild(planBtn);

    // Sembrar la tanda real de Mallorca a esta persona (one-click setup).
    const mallIds = new Set(MALLORCA.map((m) => m.id));
    const mallInResults = all.filter((o) => mallIds.has(o.id));
    const unassignedMall = mallInResults.filter((o) => (tracking[o.id]?.assignedTo || null) !== subject).length;
    const seedBtn = el("button", { class: "btn", text: `📍 Asignar la tanda de Mallorca a ${subject} (${mallInResults.length})` });
    seedBtn.addEventListener("click", () => {
      if (!confirm(`Asignar ${mallInResults.length} oportunidades de Mallorca a ${subject} y generar su plan de rondas?`)) return;
      for (const o of mallInResults) store.assignLead(o.id, { assignedTo: subject });
      const live = orderByPriority(mallInResults.filter((o) => ["01", "xn"].includes(o.scores?.classification)));
      const plan = planRounds(live, store.getSchedule(subject) || sched, {});
      for (const a of plan) store.assignLead(a.id, { scheduledFor: a.date, round: a.round });
      render();
    });
    acts.appendChild(seedBtn);
    if (unassignedMall > 0 && mine.length) acts.appendChild(el("p", { class: "ag-hint", text: `${unassignedMall} de Mallorca aún sin asignar a ${subject}.` }));
    wrap.appendChild(acts);
  }

  // — Desglose por ronda / día —
  if (!mine.length) {
    wrap.appendChild(emptyNote(`${canWrite ? "Aún no hay" : `${subject} no tiene`} llamadas asignadas${canWrite ? ` a ${subject}` : " todavía"}.`, { icon: "📞", sub: canWrite ? 'Usa "Asignar la tanda de Mallorca" para montar su semana, o asigna leads desde cada ficha.' : undefined }));
    return wrap;
  }
  const scheduled = mine.filter((o) => tracking[o.id]?.scheduledFor);
  const unscheduled = mine.filter((o) => !tracking[o.id]?.scheduledFor);
  const assignments = scheduled.map((o) => ({ id: o.id, date: tracking[o.id].scheduledFor, round: tracking[o.id].round || 1 }));
  const sum = planSummary(assignments);

  if (scheduled.length) {
    wrap.appendChild(el("div", { class: "ag-summary" }, [
      el("span", { class: "ag-stat", html: `<b>${sum.calls}</b> llamadas` }),
      el("span", { class: "ag-stat", html: `<b>${sum.days}</b> días` }),
      el("span", { class: "ag-stat", html: `<b>${sum.rounds}</b> ronda${sum.rounds === 1 ? "" : "s"}` }),
      el("span", { class: "ag-stat", html: `del <b>${fmtDay(sum.from)}</b> al <b>${fmtDay(sum.to)}</b>` }),
    ]));
    const byRound = groupByRound(assignments);
    const oppById = new Map(mine.map((o) => [o.id, o]));
    for (const r of byRound) {
      const block = el("div", { class: "ag-round" });
      block.appendChild(el("div", { class: "ag-round-h", text: `Ronda ${r.round}` }));
      const byDate = groupByDate(r.items);
      for (const d of byDate) {
        block.appendChild(el("div", { class: "ag-date-h", text: `${fmtDay(d.date)} · ${d.items.length} llamada${d.items.length === 1 ? "" : "s"}` }));
        for (const a of d.items) { const o = oppById.get(a.id); if (o) block.appendChild(agendaRow(o, tracking)); }
      }
      wrap.appendChild(block);
    }
  }
  if (unscheduled.length) {
    const block = el("div", { class: "ag-round" });
    block.appendChild(el("div", { class: "ag-round-h", text: `Sin agendar · ${unscheduled.length}` }));
    for (const o of orderByPriority(unscheduled)) block.appendChild(agendaRow(o, tracking));
    wrap.appendChild(block);
  }
  return wrap;
}

// Control de asignación en la ficha: responsable · día · ronda. Solo escritura.
function assignmentBar(id, rebuild) {
  const t = store.getTracking()[id] || {};
  const team = auth.getUsers().map((u) => u.name).filter(Boolean);
  const canWrite = allow("write");
  const box = el("div", { class: "case-assign" });
  box.appendChild(el("span", { class: "ca-label", text: "Responsable" }));
  const owner = el("select", { class: "ca-owner", disabled: canWrite ? undefined : "" }, [
    el("option", { value: "", text: "— sin asignar —", selected: !t.assignedTo ? "" : undefined }),
    ...team.map((n) => el("option", { value: n, text: n, selected: n === t.assignedTo ? "" : undefined })),
  ]);
  owner.addEventListener("change", () => { store.assignLead(id, { assignedTo: owner.value || null }); rebuild && rebuild(); });
  const date = el("input", { class: "ca-date", type: "date", value: t.scheduledFor || "", disabled: canWrite ? undefined : "" });
  date.addEventListener("change", () => { store.assignLead(id, { scheduledFor: date.value || null }); });
  box.appendChild(owner);
  box.appendChild(el("span", { class: "ca-label", text: "Día" }));
  box.appendChild(date);
  if (t.round) box.appendChild(el("span", { class: "ca-round", text: `Ronda ${t.round}` }));
  return box;
}

// Arranque "déjalo cerrado": la primera vez que la cuenta de Dani existe y aún
// no tiene horario, se le asigna la tanda de Mallorca, se fija un horario de
// mañanas y se generan sus rondas (empezando mañana). Idempotente — en cuanto
// Dani tiene horario guardado no se repite. Solo lo dispara quien puede escribir
// (admin/editor); un viewer ni lo intenta. Si Dani aún no se ha registrado, no
// hace nada y se reintentará en el próximo arranque (se auto-completa solo).
const STARTER_SCHEDULE = { workdays: [1, 2, 3, 4, 5], start: "09:30", end: "14:30", perDay: 8 };
async function maybeSeedStarterPlan() {
  try {
    if (!allow("write")) return;
    const dani = auth.getUsers().find((u) => /dani/i.test(u.name || ""));
    if (!dani) return; // su cuenta aún no está creada/sincronizada
    if (store.getSchedule(dani.name)) return; // ya sembrado → nunca repetir
    const all = state.results?.all || [];
    const ids = new Set(MALLORCA.map((m) => m.id));
    const tanda = all.filter((o) => ids.has(o.id));
    if (!tanda.length) return; // resultados aún sin la tanda: se reintenta en otro arranque
    store.setSchedule(dani.name, STARTER_SCHEDULE);
    for (const o of tanda) store.assignLead(o.id, { assignedTo: dani.name });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const live = orderByPriority(tanda.filter((o) => ["01", "xn"].includes(o.scores?.classification)));
    const plan = planRounds(live, STARTER_SCHEDULE, { from: tomorrow });
    for (const a of plan) store.assignLead(a.id, { scheduledFor: a.date, round: a.round });
  } catch { /* nunca bloquea el arranque */ }
}

function openCase(id) {
  let lead = (state.results?.all || []).find((o) => o.id === id);
  if (!lead) return;

  const overlay = el("div", { class: "case-screen", onClick: (e) => { if (e.target === overlay) close(); } });
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function close() { overlay.remove(); document.removeEventListener("keydown", onKey); }
  document.addEventListener("keydown", onKey);

  const body = el("div", { class: "case-body" });
  const synthWrap = el("div", {}); // síntesis inteligente (se refresca con la nota)
  const momentumPanel = el("div", { class: "case-fresh" }); // momento en prensa (por qué ahora)
  const freshPanel = el("div", { class: "case-fresh" }); // medición automática de su web
  const cardWrap = el("div", {});
  body.appendChild(synthWrap);
  body.appendChild(assignmentBar(id, rebuild)); // responsable · día · ronda
  // Momento + web lado a lado en ancho: la ficha llega antes al guion y la acción.
  body.appendChild(el("div", { class: "case-signals" }, [momentumPanel, freshPanel]));
  body.appendChild(cardWrap);
  // En la capa de caso no re-abrimos otra capa: onOpen se anula para que el
  // título no apile overlays. El resto de handlers mutan y repintan el caso.
  const handlers = { ...cardHandlers(rebuild), onOpen: undefined };
  function rebuild() {
    lead = (state.results?.all || []).find((o) => o.id === id) || lead;
    clear(synthWrap);
    synthWrap.appendChild(caseSynthHero(lead));
    clear(cardWrap);
    const card = renderCard(lead, store.getTracking()[lead.id], handlers);
    card.classList.add("case-card");
    // Jerarquía: el caso abre al veredicto (síntesis) → señales → esenciales del
    // lead. El análisis profundo queda plegado, a un clic — disponible, no encima.
    const det = card.querySelector(".c-detail");
    if (det) det.open = false;
    cardWrap.appendChild(card);
  }
  rebuild();
  loadMomentum(lead, momentumPanel, rebuild); // automático: detecta el momento en prensa
  loadFreshness(lead, freshPanel, rebuild); // automático: lee su web y sube la nota

  // Compartir esta ficha en solo-lectura (sin registro). Solo roles con escritura
  // y fuera del modo prueba.
  let shareBtn = null;
  // (la barra titula la EMPRESA como sujeto; el botón Compartir vive a su lado)
  if (!previewMode && isWriter(auth.currentRole())) {
    shareBtn = el("button", { class: "case-share", title: "Compartir esta empresa en solo lectura (sin registro)", text: "Compartir" });
    shareBtn.addEventListener("click", async () => {
      shareBtn.disabled = true; shareBtn.textContent = "Generando…";
      let r; try { r = await remoteCreateShare(auth.getToken(), "company", lead.id, lead.company || ""); } catch { r = null; }
      shareBtn.disabled = false; shareBtn.textContent = "Compartir";
      if (r && r.ok && r.token) {
        const box = el("div", { class: "case-sharebox" });
        renderShareLink(box, r.token);
        const wrap = el("div", { class: "case-share-overlay", onClick: (e) => { if (e.target === wrap) wrap.remove(); } });
        wrap.appendChild(el("div", { class: "pb-panel" }, [
          el("div", { class: "pb-head" }, [el("div", { class: "prof-name", text: `Compartir ${lead.company || "empresa"}` }), el("button", { class: "pb-x", text: "✕", onClick: () => wrap.remove() })]),
          box,
        ]));
        document.body.appendChild(wrap);
      } else alert((r && r.error) || "No se pudo generar el enlace.");
    });
  }

  // Jerarquía: la barra titula la EMPRESA (el sujeto de esta pantalla), no la
  // marca CONNECT — que ya firma en el pie. Abres un caso y lees a quién llamas.
  const bar = el("div", { class: "case-bar" }, [
    el("button", { class: "case-back", text: "← Volver", onClick: close }),
    el("div", { class: "case-subject" }, [
      el("span", { class: "case-co", text: lead.company }),
      el("span", { class: "case-co-sub", text: `${lead.subsector || lead.sector || ""}${lead.city ? " · " + lead.city : ""}` }),
    ]),
    shareBtn,
    el("span", { class: "case-rank", text: `#${lead.ranking ?? "—"}` }),
  ]);
  const foot = el("div", { class: "case-foot" }, [
    whaleMark(),
    el("p", { html: 'Entra una señal, sale <b>marca</b>, <b>dirección</b> y <b>valor</b>. El sistema de captación de XN&nbsp;LAB.' }),
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

// Enchufa el MOMENTO detectado en prensa al scoring: una apertura/ronda/expansión
// citada sube transitionSignal a verde (es prensa real). Idempotente.
function applyMomentumToScore(leadId, r) {
  const v = momentumToVerification(r);
  if (!v) return false;
  if (store.getLeadVerifications(leadId).some((x) => x.auto && x.filter === v.filter && x.level === "green")) return false;
  store.addVerification(leadId, v.filter, v.level, v.note, v.url, { auto: true, srcLabel: "Prensa" });
  return true;
}

// Carga AUTOMÁTICA del momento en prensa al abrir el caso. Honesto: si no hay
// noticia relevante, lo dice (gris) — nunca inventa.
async function loadMomentum(lead, panel, onScoreChange) {
  clear(panel);
  panel.appendChild(momentumCard(null, "loading"));
  let r;
  try { r = await fetchMomentum(lead.company, auth.getToken()); } catch { r = null; }
  clear(panel);
  if (r && r.ok && r.found) {
    panel.appendChild(momentumCard(r, "ok"));
    if (allow("write") && applyMomentumToScore(lead.id, r)) { await recompute(); onScoreChange?.(); }
  } else {
    panel.appendChild(momentumCard(r, "gray"));
  }
}

function momentumCard(r, kind) {
  const head = el("div", { class: "fresh-h" }, [
    el("span", { class: "fresh-ic ic", html: icon("radar") }),
    el("span", { class: "fresh-h-t", text: "Momento en prensa" }),
    el("span", { class: "fresh-tag", text: "AUTOMÁTICO" }),
  ]);
  if (kind === "loading") return el("div", { class: "case-fresh-card loading" }, [head, el("p", { class: "fresh-note", text: "Buscando en prensa…" })]);
  if (kind === "gray") return el("div", { class: "case-fresh-card gray" }, [head, el("p", { class: "fresh-note", text: "Sin momento reciente en prensa (no concluyente)." })]);
  const children = [head,
    el("div", { class: "mom-kind", text: momentumLabel(r.kind) }),
    el("p", { class: "fresh-note", text: r.headline || "" }),
  ];
  if (r.url) children.push(el("a", { class: "mom-src", href: r.url, target: "_blank", rel: "noopener", text: `Ver en ${r.source || "prensa"} ↗` }));
  children.push(el("div", { class: "fresh-lever", text: "⚡ Momento citado: el 'por qué ahora' está vivo — ángulo de llamada inmediato." }));
  return el("div", { class: "case-fresh-card lever" }, children);
}

// Hero de SÍNTESIS inteligente: veredicto + temperatura + medidor animado +
// palancas. Lee la nota ya enriquecida y la conversión del nicho. Dinámico: el
// medidor sube solo al abrir.
function caseSynthHero(lead) {
  const sr = sectorRate(store.getLearning(), lead.sector, { minSample: 3 });
  const syn = synthesize(lead, { sectorRate: sr });
  const meterFill = el("span", { class: `synth-meter-fill synth-${syn.temp}`, style: "width:0%" });
  // Animación: sube al valor real en el siguiente frame.
  setTimeout(() => { meterFill.style.width = `${syn.conf}%`; }, 30);
  const levers = el("div", { class: "synth-levers" }, syn.levers.length
    ? syn.levers.map((l) => el("span", { class: `synth-lever ${l.strong ? "strong" : ""}`, title: l.note || "", text: l.label }))
    : [el("span", { class: "synth-lever muted", text: "Sin palancas confirmadas aún" })]);
  return el("div", { class: `synth-hero synth-h-${syn.temp}` }, [
    el("div", { class: "synth-top" }, [
      el("span", { class: `synth-temp synth-${syn.temp}`, text: syn.tempLabel }),
      el("div", { class: "synth-meter" }, [meterFill]),
      el("span", { class: "synth-conf", text: String(syn.conf) }),
    ]),
    el("p", { class: "synth-headline", text: syn.headline }),
    levers,
    el("div", { class: "synth-action" }, [el("span", { class: "synth-arrow", text: "→" }), el("span", { text: syn.nextAction })]),
  ]);
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
  if (lever) children.push(el("div", { class: "fresh-lever", text: "⚡ Palanca de venta: su presencia digital no acompaña a su momento — entrada natural para una colaboración." }));
  return el("div", { class: `case-fresh-card ${lever ? "lever" : "fresh-ok"}` }, children);
}

// (buildCards se fusionó en feedCards: una sola ruta de render del feed, con
// foco por comando/bucket. Ver cardsView/feedModel/feedCards más arriba.)

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

// ---- Caja Negra Comercial: dashboard + Memoria Comercial --------------------
// Lo que el equipo aprende del mercado: cifras del embudo, leads calientes y los
// patrones agregados de TODAS las llamadas (objeciones, dolores, sectores que
// responden, frases que abren/cierran, precios mencionados, razones de cierre).
function memoryView() {
  const d = buildDashboard({
    leads: state.results.all,
    tracking: store.getTracking(),
    calls: store.getCalls(),
  });
  const m = d.memory;
  const wrap = el("div", { class: "memory-view" }, [
    el("h2", { text: "Caja Negra Comercial" }),
    el("p", { class: "memory-sub", text: "Cada llamada registrada alimenta esto. Cuantas más llamadas con transcripción, más fina la lectura del mercado." }),
  ]);

  // KPIs del embudo.
  wrap.appendChild(el("div", { class: "crm-kpis" }, [
    crmKpi("Leads", d.totalLeads, ""),
    crmKpi("Llamadas", d.callsMade, `${d.memory.callsWithTranscript} con transcripción`),
    crmKpi("Reuniones", d.meetings, "", "hot"),
    crmKpi("Propuestas", d.proposals, "", "hot"),
    crmKpi("Ganados", d.won, "", "hot"),
    crmKpi("Perdidos", d.lost, "", "cool"),
  ]));

  // Embudo por fases.
  const maxN = Math.max(1, ...d.funnel.map((f) => f.n));
  wrap.appendChild(el("div", { class: "memory-block" }, [
    el("h3", { text: "Conversión por fase" }),
    el("div", { class: "memory-funnel" }, d.funnel.map((f) =>
      el("div", { class: "mf-row" }, [
        el("span", { class: "mf-stage", text: f.stage }),
        el("span", { class: "mf-bar", html: `<i style="width:${Math.round((f.n / maxN) * 100)}%"></i>` }),
        el("span", { class: "mf-n", text: String(f.n) }),
      ]))),
  ]));

  // Leads calientes (clic → ficha).
  if (d.hot.length) {
    wrap.appendChild(el("div", { class: "memory-block" }, [
      el("h3", { text: `Leads calientes (${d.hot.length})` }),
      el("div", { class: "memory-hot" }, d.hot.map((h) =>
        el("button", { class: "mh-chip", text: `${h.company} · ${STATUS_LABELS[h.status] || h.status}`, onClick: () => openCase(h.id) }))),
    ]));
  }

  // Memoria agregada.
  if (!m.sampleSize) {
    wrap.appendChild(emptyNote("Aún no hay llamadas registradas.", { icon: "📞", sub: "Abre un lead, baja a su Caja Negra, pega una transcripción y analízala. A partir de la primera, esto cobra vida." }));
    return wrap;
  }

  // --- Aprendizajes accionables (P3): no solo datos, sino qué hacer ---
  const am = actionableMemory({ calls: store.getCalls(), tracking: store.getTracking() });
  wrap.appendChild(el("div", { class: "memory-block memory-action" }, [
    el("h3", { text: "Próxima llamada — recomendación" }),
    el("p", { class: `memory-rec ${am.recommendation.enough ? "" : "muted"}`, text: am.recommendation.text }),
  ]));

  // Ratio de avance por objeción: dónde se atasca el pitch.
  if (am.objectionAdvance.length) {
    wrap.appendChild(el("div", { class: "memory-block" }, [
      el("h3", { text: "Avance por tipo de objeción" }),
      el("div", { class: "memory-sectors" }, am.objectionAdvance.map((o) =>
        el("div", { class: "ms-row" }, [
          el("span", { class: "ms-name", text: o.label }),
          o.enough
            ? el("span", { class: `ms-rate ${o.rate >= 50 ? "good" : "bad"}`, text: `avanza ${o.rate}%` })
            : el("span", { class: "ms-rate muted", text: "datos insuf." }),
          el("span", { class: "ms-n", text: `${o.total} llamada${o.total === 1 ? "" : "s"}` }),
        ]))),
    ]));
  }

  // Patrones de ganadas vs perdidas (con honestidad de muestra).
  if (am.winLoss.enough) {
    const col = (title, rows, cls) => el("div", { class: "memory-block" }, [
      el("h3", { text: title }),
      rows.length
        ? el("div", { class: `bb-chips ${cls}` }, rows.map((r) => el("span", { class: "bb-chip", text: `${r.label} (${r.count})` })))
        : el("p", { class: "hint", text: "Sin frases registradas todavía." }),
    ]);
    wrap.appendChild(el("div", { class: "memory-grid" }, [
      col(`En ganadas (${am.winLoss.wonSample})`, am.winLoss.winPhrases, "buy"),
      col(`En perdidas (${am.winLoss.lostSample})`, am.winLoss.lossPhrases, "loss"),
    ]));
  }

  const rankBlock = (title, rows, suffix = "") => rows && rows.length
    ? el("div", { class: "memory-block" }, [
        el("h3", { text: title }),
        el("ol", { class: "memory-rank" }, rows.map((r) =>
          el("li", {}, [el("span", { class: "mr-label", text: r.label }), el("span", { class: "mr-count", text: `${r.count}${suffix}` })]))),
      ])
    : null;

  if (m.avgCloseProbability != null) {
    wrap.appendChild(el("p", { class: "memory-avg", html: `Probabilidad de cierre media de las llamadas analizadas: <b>${m.avgCloseProbability}%</b>` }));
  }

  // Sectores que responden.
  if (m.sectors.length) {
    wrap.appendChild(el("div", { class: "memory-block" }, [
      el("h3", { text: "Sectores que mejor responden" }),
      el("div", { class: "memory-sectors" }, m.sectors.map((s) =>
        el("div", { class: "ms-row" }, [
          el("span", { class: "ms-name", text: (SECTOR_BY_KEY[s.sector]?.label) || s.sector }),
          el("span", { class: `ms-rate ${s.rate >= 50 ? "good" : "bad"}`, text: `${s.rate}%` }),
          el("span", { class: "ms-n", text: `${s.total} llamada${s.total === 1 ? "" : "s"}` }),
        ]))),
    ]));
  }

  const grid = el("div", { class: "memory-grid" }, [
    rankBlock("Objeciones más repetidas", m.objections),
    rankBlock("Dolores más frecuentes", m.pains),
    rankBlock("Servicios más demandados", m.services),
    rankBlock("Frases que generan interés", m.buyPhrases),
    rankBlock("Frases que generan rechazo", m.lossPhrases),
    rankBlock("Motivos de cierre", m.winReasons),
    rankBlock("Motivos de pérdida", m.lossReasons),
  ].filter(Boolean));
  wrap.appendChild(grid);

  if (m.prices.length) {
    wrap.appendChild(el("div", { class: "memory-block" }, [
      el("h3", { text: "Precios mencionados en llamadas" }),
      el("div", { class: "memory-prices" }, m.prices.map((p) => el("span", { class: "mp-chip", text: p }))),
    ]));
  }

  return wrap;
}

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
  clearTimeout(autoTimer); // nunca dos bucles a la vez (doble gasto de cuota Places)
  patchAutoPanel(); autoTick();
}
function stopAuto() {
  const a = autopilotState(); a.on = false; a._ticking = false; a._msg = "Detenido."; saveAuto();
  clearTimeout(autoTimer); patchAutoPanel();
}

async function autoTick() {
  const a = autopilotState();
  if (!a.on || a._ticking) return; // re-entrada: una sola tanda a la vez
  a._ticking = true;
  clearTimeout(autoTimer);
  const prog = autoProgress(state.results?.all || [], { target: a.target, bar: AUTO_BAR });
  if (prog.done) { a.on = false; a._ticking = false; a._msg = `Objetivo alcanzado: ${a.target} en 01 y ${a.target} en XN.`; saveAuto(); patchAutoPanel(); render(); return; }
  // Foco guiado por tus intereses la mitad de las veces; si no, barrido base.
  const ints = getInterests(6).map((i) => i.q).filter(Boolean);
  const focus = ints.length && Math.random() < 0.5 ? ints[Math.floor(Math.random() * ints.length)] : "";
  const existing = new Set(store.getUserLeads().map((l) => `${l.company}`.toLowerCase()));
  let res = { added: 0, seen: 0 };
  try {
    res = await runBatch({ config: state.config, query: focus, existingNames: existing, perBatch: 3, minScore: 0, token: auth.getToken(), onSave: (lead) => store.saveUserLead(lead) });
  } catch { /* sin red o límite del mapa */ }
  await recompute();
  if (!a.on) { a._ticking = false; return; } // pudo detenerse durante el await
  if ((res.seen || 0) === 0) autoEmpty++; else autoEmpty = 0;
  if (autoEmpty >= 4) {
    a.on = false; a._ticking = false; a._msg = "Pausado: sin novedades o límite diario del mapa alcanzado. Reanúdalo cuando quieras."; saveAuto();
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

  // ——— CEREBRO AUTOMÁTICO: archiva, etiqueta, explora y saca contactos solo ———
  // 1) Auto-archivado + etiquetas de lo nuevo (un lote por tanda).
  let organized = 0;
  if (a.on) { try { organized = await autoClassifyUnfiled(40); } catch { /* best-effort */ } }
  // 2) Cada ~6 tandas el radar abre nichos nuevos solos: entran a la rotación
  //    local Y se siembran en el cron 24/7 (el cerebro dirige la autopista).
  a._tick = (a._tick || 0) + 1;
  let opened = 0;
  if (a.on && a._tick % 6 === 0) {
    try {
      const interests = getInterests(10).map((i) => i.q).filter(Boolean);
      const sug = await radarSuggest(getForest(), interests, [], auth.getToken());
      const seedQ = [];
      for (const s of (sug || []).slice(0, 2)) {
        if (!Array.isArray(s.path) || !s.path.length) continue;
        mergeForest(pathNodes(s.path));
        const rootKey = ensureRootSector(s.path[0]);
        recordSearch(pathQuery(s.path), rootKey, s.path[0]);
        seedQ.push({ query: pathQuery(s.path), sector: rootKey });
        opened++;
      }
      if (seedQ.length) await seedCron(seedQ, auth.getToken());
    } catch { /* best-effort */ }
  }
  // 3) Un lead por tanda: rasca contactos de su web (gentil con sitios externos).
  if (a.on) {
    try {
      const lead = store.getUserLeads().find((l) => l.website && !l.email && !l._contactsTried);
      if (lead) {
        lead._contactsTried = true;
        const c = await fetchContacts(lead.website, auth.getToken());
        if (c) {
          if (!lead.email && c.email) lead.email = c.email;
          if (!lead.phone && c.phone) lead.phone = c.phone;
          if (!lead.instagram && c.instagram) lead.instagram = c.instagram;
          if (!lead.linkedin && c.linkedin) lead.linkedin = c.linkedin;
          if (Array.isArray(c.images) && c.images.length) lead.images = c.images;
        }
        store.saveUserLead(lead);
      }
    } catch { /* best-effort */ }
  }

  a._ticking = false;
  if (!a.on) return;

  const extra = [organized ? `${organized} archivadas` : "", opened ? `${opened} nichos nuevos` : ""].filter(Boolean).join(" · ");
  a._msg = `Capturando… +${res.added || 0} esta tanda${focus ? ` · foco: ${focus}` : ""}${extra ? ` · ${extra}` : ""}.`;
  patchAutoPanel();
  autoTimer = setTimeout(autoTick, 11000); // ~16 consultas/min, bajo el límite
}

function patchAutoPanel() {
  if (!root) return;
  const node = root.querySelector(".auto-panel");
  if (node && node.parentNode) node.parentNode.replaceChild(autopilotPanel(), node);
}

// Absorbe los candidatos que el cron del servidor capturó solo (24/7). Los mete
// como leads de usuario (el motor los puntúa) y los reclama para no repetir.
// Best-effort y silencioso si no hay red o sesión.
async function absorbCronLeads() {
  if (!allow("write") && !allow("discover")) return;
  const token = auth.getToken();
  if (!token) return;
  let pend = [];
  try { pend = await pendingCronLeads(token); } catch { return; }
  if (!pend.length) return;
  const existing = new Set(store.getUserLeads().map((l) => `${l.company}`.toLowerCase()));
  const byName = new Map((state.results?.all || []).map((o) => [`${o.company}`.toLowerCase(), o.id]));
  const claimed = [];
  const fresh = []; // novedades para el panel interactivo
  for (const c of pend) {
    claimed.push(c.id);
    const k = `${c.company || ""}`.toLowerCase();
    if (!k || existing.has(k)) continue;
    store.saveUserLead(buildLead({
      company: c.company, sector: c.sector || "growth", subsector: "",
      city: c.city || "", website: c.website || null, phone: c.phone || null,
      googleMaps: c.google_maps || null,
    }));
    existing.add(k); fresh.push({ company: c.company, city: c.city || "", key: k });
  }
  await claimCronLeads(token, claimed);
  if (fresh.length) {
    await recompute();
    // Resuelve el id de cada novedad para poder abrir su caso de un toque.
    const idx = new Map((state.results?.all || []).map((o) => [`${o.company}`.toLowerCase(), o.id]));
    state._cronNew = fresh.map((f) => ({ ...f, id: idx.get(f.key) || byName.get(f.key) || null }));
    // El cron ya leyó su web de noche: aplica esas señales a la nota AHORA, para
    // que lleguen puntuadas (no en gris). web_signals viene plano del servidor.
    let lifted = 0;
    for (const f of state._cronNew) {
      if (!f.id || !f.web || !f.web.readable) continue;
      const r = { readable: true, copyright_year: f.web.copyright_year, has_viewport: f.web.has_viewport,
        signals: { opening: !!f.web.opening, hiring: !!f.web.hiring } };
      if (applyWebToScore(f.id, r)) lifted++;
    }
    if (lifted) await recompute();
    render();
    flash(`${fresh.length} empresa${fresh.length === 1 ? "" : "s"} captada${fresh.length === 1 ? "" : "s"} sola${fresh.length === 1 ? "" : "s"} mientras no estabas — ya en el ranking.`);
    // El cerebro las archiva y etiqueta solo en el mapa (lo del cron, organizado).
    try {
      const filed = await autoClassifyUnfiled(40);
      if (filed) { await recompute(); render(); }
    } catch { /* best-effort */ }
  }
}

// Aviso efímero (toast) no intrusivo.
function flash(msg) {
  if (!root) return;
  const t = el("div", { class: "flash", text: msg });
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 20);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 5000);
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
    html: a.on ? "Detener piloto" : "Arrancar piloto automático",
    onClick: () => (a.on ? stopAuto() : startAuto()) });
  return el("div", { class: "auto-panel" }, [
    el("div", { class: "auto-head" }, [
      el("span", { class: "auto-title", text: "Piloto automático de captación" }),
      a.on ? el("span", { class: "auto-live", text: "● EN MARCHA" }) : null,
    ]),
    el("p", { class: "hint", text: "Arráncalo y trabaja solo: capta, ordena, etiqueta y busca contactos." }),
    track("01", prog.q01, prog.pct01, "01"),
    track("XN", prog.qxn, prog.pctxn, "xn"),
    el("div", { class: "auto-ctl" }, [el("label", { class: "auto-tlbl", text: "Objetivo por marca:" }), targetInput, toggle]),
    a._msg ? el("p", { class: "auto-msg", text: a._msg }) : null,
    el("p", { class: "auto-foot", text: "Corre con la pestaña abierta; se pausa y reanuda solo." }),
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

// ---- MAPA DE CAPTACIÓN: una idea → árbol de categorías anidadas -------------
// El usuario escribe una sola línea; Gemini (Edge Function `taxonomy`) devuelve
// un árbol de carpetas dentro de carpetas. Cada carpeta tiene un buscador que trae
// empresas reales del mapa y las archiva dentro (taggeadas con su ruta).
const pk = (path) => (path || []).join("");

function catUI() {
  if (!state._cat) state._cat = { expanded: new Set(), status: "", busy: false, lastPrompt: "" };
  return state._cat;
}
function patchCaptureMap() {
  if (!root) return;
  const node = root.querySelector(".capture-map");
  if (node && node.parentNode) node.parentNode.replaceChild(captureMap(), node);
}

// Resuelve (o crea) el sector raíz de una ruta, para que los leads entren al
// motor de scoring con una lente coherente por nicho raíz.
function ensureRootSector(rootName) {
  const name = String(rootName || "").trim();
  if (!name) return "growth";
  const inf = inferSector(name, allSectors());
  if (inf && inf.key) return inf.key;
  const existing = allSectors().find((s) => s.label.toLowerCase() === name.toLowerCase());
  if (existing) return existing.key;
  const r = addCustomSector(name, [name], null);
  return r.ok ? r.key : "growth";
}

// Archiva y etiqueta (vía Gemini) los leads que aún no tienen carpeta. Reutilizado
// por el piloto y por la absorción del cron. Devuelve cuántos archivó.
async function autoClassifyUnfiled(limit = 40) {
  const unfiled = store.getUserLeads().filter((l) => !Array.isArray(l.categoryPath) || !l.categoryPath.length).slice(0, limit);
  if (!unfiled.length) return 0;
  const items = unfiled.map((l) => ({ company: l.company, subsector: l.subsector || sectorByKey(l.sector)?.label || "", city: l.city || "" }));
  let assigns = [];
  try { assigns = await classifyLeads(items, getForest(), auth.getToken()); } catch { assigns = []; }
  let filed = 0;
  for (const as of (assigns || [])) {
    const lead = unfiled[as.i];
    if (!lead || !Array.isArray(as.path) || !as.path.length) continue;
    mergeForest(pathNodes(as.path));
    lead.categoryPath = as.path;
    if (as.tags && Object.keys(as.tags).length) lead.tags = { ...(lead.tags || {}), ...as.tags };
    store.saveUserLead(lead);
    filed++;
  }
  return filed;
}

// Siembra las hojas del mapa en el cron 24/7: el cerebro dirige qué caza el cron.
async function seedCronFromMap() {
  try {
    const leaves = leavesUnder([]).slice(0, 40).map((lf) => ({ query: pathQuery(lf.path), sector: ensureRootSector(lf.path[0]) }));
    if (leaves.length) await seedCron(leaves, auth.getToken());
  } catch { /* best-effort */ }
}

// ---- FORMACIÓN INTERNA: dossiers del equipo, claros y a mano --------------
// Un sitio tranquilo para guías y procesos. Los admin/editores publican; todo
// el equipo los lee. Se sincroniza, así que lo que pongas lo ve todo el mundo.
function trainingView() {
  const docs = store.getTraining().slice().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  const canEdit = allow("write");
  const blocks = [
    el("h2", { text: "Formación interna" }),
    el("p", { class: "hint", text: "Guías y dossiers del equipo. Lo esencial, claro y a mano." }),
  ];

  if (canEdit) {
    const title = el("input", { class: "lead-f train-title", placeholder: "Título — ej. Cómo abrir una llamada" });
    const tag = el("input", { class: "lead-f train-tag", placeholder: "Etiqueta (opcional) — Ventas, Marca…" });
    const body = el("textarea", { class: "lead-f train-body", placeholder: "El contenido, en claro. Pasos, no párrafos." });
    const msg = el("span", { class: "add-msg" });
    const pub = el("button", {
      class: "btn-primary", text: "Publicar dossier", onClick: () => {
        const t = title.value.trim(); const b = body.value.trim();
        if (t.length < 2 || !b) { msg.textContent = "Pon título y contenido."; return; }
        store.saveTraining({ id: `t-${Date.now().toString(36)}`, title: t, body: b, tag: tag.value.trim() || null, by: auth.currentUser()?.name || "", updatedAt: new Date().toISOString() });
        render();
      },
    });
    blocks.push(el("div", { class: "train-form" }, [title, tag, body, el("div", { class: "train-form-foot" }, [pub, msg])]));
  }

  if (!docs.length) {
    blocks.push(el("p", { class: "empty", text: canEdit ? "Aún no hay dossiers. Publica el primero arriba." : "Aún no hay formación publicada. Pídele a un admin que añada dossiers." }));
  } else {
    blocks.push(el("div", { class: "train-list" }, docs.map((d) => el("article", { class: "train-card" }, [
      el("div", { class: "train-card-h" }, [
        d.tag ? el("span", { class: "train-tag-chip", text: d.tag }) : null,
        el("h3", { class: "train-card-t", text: d.title }),
        canEdit ? el("button", { class: "train-del", title: "Eliminar", html: icon("trash"), onClick: () => { if (confirm(`¿Eliminar «${d.title}»?`)) { store.removeTraining(d.id); render(); } } }) : null,
      ]),
      el("p", { class: "train-card-b", text: d.body }),
      el("div", { class: "train-card-f", text: `${d.by ? d.by + " · " : ""}${d.updatedAt ? new Date(d.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : ""}` }),
    ]))));
  }
  return el("div", {}, blocks);
}

function captureMap() {
  const ui = catUI();
  const forest = getForest();
  const BASE_KEYS = new Set(SECTORS.map((s) => s.key));

  const promptInput = el("input", {
    type: "search", class: "cmap-input", autocomplete: "off", value: ui.lastPrompt || "",
    placeholder: "Describe tu idea — ej. «clínicas» o «creatividades / avatares / 3d / ia»",
  });
  async function gen() {
    const p = promptInput.value.trim();
    if (!p || ui.busy) return;
    ui.lastPrompt = p; ui.busy = true; ui.status = "Generando categorías…"; patchCaptureMap();
    let r = { tree: [] };
    try { r = await generateTaxonomy(p, auth.getToken()); } catch { r = { tree: [] }; }
    ui.busy = false;
    if (r && r.tree && r.tree.length) {
      mergeForest(r.tree);
      seedCronFromMap(); // el cron 24/7 empieza a cazar estos nichos solos
      for (const rootNode of r.tree) ui.expanded.add(pk([rootNode.name]));
      ui.status = r.ai
        ? "✓ Mapa generado con IA. Pulsa buscar en una categoría para traer empresas reales."
        : "✓ Mapa creado a partir de tu ruta. Pulsa buscar en una categoría para buscar empresas.";
    } else {
      ui.status = "No pude generar categorías. Prueba a describirlo de otra forma.";
    }
    render();
  }
  const genBtn = el("button", { class: "btn-primary cmap-go", text: ui.busy ? "…" : "Generar mapa", onClick: gen });
  promptInput.addEventListener("keydown", (e) => { if (e.key === "Enter") gen(); });

  // Trae empresas reales para todas las hojas bajo `path` y las archiva dentro.
  async function discoverNode(path) {
    if (ui.busy) return;
    const leaves = leavesUnder(path);
    if (!leaves.length) return;
    const cap = Math.min(leaves.length, 8); // tope por barrido (cuida el límite del mapa)
    ui.busy = true; ui.expanded.add(pk(path));
    const existing = new Set(store.getUserLeads().map((l) => `${l.company}`.toLowerCase()));
    let added = 0, swept = 0;
    for (const leaf of leaves.slice(0, cap)) {
      const rootKey = ensureRootSector(leaf.path[0]);
      const discKey = BASE_KEYS.has(rootKey) ? rootKey : "all";
      ui.status = `Buscando «${leaf.name}»… (${swept + 1}/${cap})`; patchCaptureMap();
      let found = [];
      try { found = await discover({ sector: discKey, query: pathQuery(leaf.path), token: auth.getToken() }); }
      catch { found = []; }
      for (const c of found) {
        const k = `${c.company || ""}`.toLowerCase();
        if (!k || existing.has(k)) continue;
        store.saveUserLead(buildLead({
          company: c.company, sector: rootKey, subsector: c.subsector || leaf.name,
          city: c.city || "", website: c.website || null, phone: c.phone || null,
          googleMaps: c.googleMaps || null, categoryPath: leaf.path,
        }));
        existing.add(k); added++;
      }
      swept++;
    }
    recordSearch(pathQuery(path), ensureRootSector(path[0] || ""), path[0] || "");
    await recompute();
    ui.busy = false;
    ui.status = added
      ? `✓ +${added} empresas archivadas en «${path.join(" / ")}» — ya están puntuadas en el ranking.`
      : "El mapa no devolvió empresas. Prueba un nicho más concreto, o conecta la API del mapa (Google Places) para nichos nuevos.";
    render();
  }

  // Auto-archivado: coge los leads que han ido apareciendo (piloto, búsquedas,
  // alta a mano) y Gemini los mete SOLO en la carpeta correcta del árbol —
  // creando subcarpetas si hace falta— y los etiqueta por dimensiones.
  async function organizeLeads() {
    if (ui.busy) return;
    const all = store.getUserLeads();
    let pool = all.filter((l) => !Array.isArray(l.categoryPath) || !l.categoryPath.length);
    const reorg = !pool.length;
    if (reorg) pool = all; // si ya están todos archivados, reorganiza todo
    if (!pool.length) { ui.status = "No hay leads que organizar — capta empresas primero (buscar o piloto)."; patchCaptureMap(); return; }
    ui.busy = true;
    const BATCH = 40, MAX = 120;
    pool = pool.slice(0, MAX);
    let filed = 0;
    for (let off = 0; off < pool.length; off += BATCH) {
      const slice = pool.slice(off, off + BATCH);
      ui.status = `Organizando ${off + 1}–${Math.min(off + BATCH, pool.length)} de ${pool.length}…`; patchCaptureMap();
      const items = slice.map((l) => ({ company: l.company, subsector: l.subsector || sectorByKey(l.sector)?.label || "", city: l.city || "" }));
      let assigns = [];
      try { assigns = await classifyLeads(items, getForest(), auth.getToken()); } catch { assigns = []; }
      for (const a of assigns) {
        const lead = slice[a.i];
        if (!lead || !Array.isArray(a.path) || !a.path.length) continue;
        mergeForest(pathNodes(a.path));
        lead.categoryPath = a.path;
        if (a.tags && Object.keys(a.tags).length) lead.tags = { ...(lead.tags || {}), ...a.tags };
        store.saveUserLead(lead);
        ui.expanded.add(pk([a.path[0]]));
        filed++;
      }
    }
    await recompute();
    ui.busy = false;
    ui.status = filed
      ? `✓ ${filed} empresas auto-archivadas en el mapa, con etiquetas. El árbol creció solo.`
      : "No pude organizar ahora (sin IA o sin red). Reinténtalo en un momento.";
    render();
  }

  // Radar de momentos: pide nichos nuevos a explorar (Gemini) y los muestra.
  async function runRadar() {
    if (ui.busy) return;
    ui.busy = true; ui.status = "Buscando nichos del momento…"; patchCaptureMap();
    const interests = (getInterests(10) || []).map((i) => i.q).filter(Boolean);
    let sug = [];
    try { sug = await radarSuggest(getForest(), interests, [], auth.getToken()); } catch { sug = []; }
    ui.busy = false;
    ui.radar = sug;
    ui.status = sug.length
      ? `${sug.length} nichos propuestos — añade al mapa los que te interesen.`
      : "El radar no propuso nada ahora. Reinténtalo en un momento.";
    patchCaptureMap();
  }

  function leadRow(l) {
    const tagVals = l.tags && typeof l.tags === "object" ? Object.values(l.tags).filter(Boolean) : [];
    const stop = (e) => e.stopPropagation();
    const contacts = [];
    if (l.email) contacts.push(el("a", { class: "cat-contact", href: `mailto:${l.email}`, title: l.email, html: icon("mail"), onClick: stop }));
    if (l.phone) contacts.push(el("a", { class: "cat-contact", href: `tel:${l.phone}`, title: l.phone, html: icon("phone"), onClick: stop }));
    if (l.instagram) contacts.push(el("a", { class: "cat-contact", href: l.instagram, target: "_blank", rel: "noopener", title: "Instagram", text: "IG", onClick: stop }));
    if (l.linkedin) contacts.push(el("a", { class: "cat-contact", href: l.linkedin, target: "_blank", rel: "noopener", title: "LinkedIn", text: "in", onClick: stop }));
    const findBtn = el("button", { class: "cat-contact-btn", title: "Buscar contactos en su web", html: icon("id") });
    findBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!l.website) { ui.status = `«${l.company}» no tiene web guardada para rascar contactos.`; patchCaptureMap(); return; }
      findBtn.textContent = "…"; findBtn.disabled = true;
      let c = null;
      try { c = await fetchContacts(l.website, auth.getToken()); } catch { c = null; }
      if (c) {
        if (!l.email && c.email) l.email = c.email;
        if (!l.phone && c.phone) l.phone = c.phone;
        if (!l.instagram && c.instagram) l.instagram = c.instagram;
        if (!l.linkedin && c.linkedin) l.linkedin = c.linkedin;
        if (Array.isArray(c.images) && c.images.length) l.images = c.images;
        store.saveUserLead(l);
        const got = c.email || c.phone || c.instagram || c.linkedin || (l.images && l.images.length);
        ui.status = got
          ? `✓ «${l.company}»: contactos${l.images && l.images.length ? " e imágenes" : ""} desde su web.`
          : `Sin contactos visibles en la web de «${l.company}».`;
      } else {
        ui.status = `No pude leer la web de «${l.company}» (bloqueada o sin contactos).`;
      }
      patchCaptureMap();
    });
    const name = el("span", { class: "cat-lead-name", title: "Abrir en el ranking", text: l.company,
      onClick: () => { state.filters.search = l.company; goView("cards"); } });
    const row = el("div", { class: "cat-lead" }, [
      name,
      ...tagVals.slice(0, 2).map((v) => el("span", { class: "cat-tag", text: v })),
      ...contacts,
      el("span", { class: "cat-lead-city", text: l.city || "" }),
      findBtn,
    ]);
    // Moodboard: miniaturas de la web (remotas, lazy → cero peso al bundle).
    if (Array.isArray(l.images) && l.images.length) {
      const mb = el("div", { class: "cat-mood" }, l.images.slice(0, 5).map((src) =>
        el("a", { class: "cat-mood-i", href: src, target: "_blank", rel: "noopener" }, [
          el("img", { src, loading: "lazy", alt: "", referrerpolicy: "no-referrer" }),
        ])));
      return el("div", { class: "cat-lead-wrap" }, [row, mb]);
    }
    return row;
  }
  function leadList(path, depth) {
    let leads = leadsUnder(path, store.getUserLeads());
    if (ui.facet) leads = leads.filter((l) => leadMatchesFacet(l, ui.facet));
    const pad = `padding-left:${10 + depth * 16}px`;
    if (!leads.length) return el("div", { class: "cat-leads-empty", style: pad, text: ui.facet ? "Nada con ese filtro aquí." : "Sin empresas aún — pulsa buscar para buscar." });
    return el("div", { class: "cat-leads", style: pad }, leads.slice(0, 60).map(leadRow));
  }
  function nodeRow(node, path, depth) {
    const leaf = !node.children || !node.children.length;
    const expanded = ui.expanded.has(pk(path));
    const count = countUnder(path, store.getUserLeads());
    const toggle = () => { if (expanded) ui.expanded.delete(pk(path)); else ui.expanded.add(pk(path)); patchCaptureMap(); };
    return el("div", { class: `cat-row ${leaf ? "is-leaf" : "is-folder"}`, style: `padding-left:${8 + depth * 16}px` }, [
      el("button", { class: "cat-name", onClick: toggle }, [
        el("span", { class: "cat-caret", html: leaf ? "" : icon(expanded ? "chevD" : "chevR") }),
        el("span", { class: "cat-ico", html: leaf ? icon("dot") : icon(expanded ? "folderOpen" : "folder") }),
        el("span", { class: "cat-label", text: node.name }),
        count ? el("span", { class: "cat-count", text: String(count) }) : null,
      ]),
      el("div", { class: "cat-tools" }, [
        el("button", { class: "cat-find", title: "Buscar empresas reales en esta categoría", html: icon("search"), onClick: () => discoverNode(path) }),
        el("button", { class: "cat-del", title: "Quitar esta categoría", text: "✕", onClick: () => { removePath(path); patchCaptureMap(); } }),
      ]),
    ]);
  }
  function renderNode(node, path, depth) {
    const wrap = el("div", { class: "cat-node" }, [nodeRow(node, path, depth)]);
    if (ui.expanded.has(pk(path))) {
      if (node.children && node.children.length) {
        wrap.appendChild(el("div", { class: "cat-children" }, node.children.map((c) => renderNode(c, [...path, c.name], depth + 1))));
      } else {
        wrap.appendChild(leadList(path, depth + 1));
      }
    }
    return wrap;
  }

  const blocks = [
    el("div", { class: "cmap-head" }, [
      el("span", { class: "cmap-title", html: '<span class="ic">' + icon("folderOpen") + '</span>Mapa de captación' }),
      forest.length ? el("button", {
        class: "cmap-clear", text: "Vaciar mapa", title: "Borrar todas las categorías (no borra los leads ya captados)",
        onClick: () => { if (confirm("¿Borrar todo el mapa de categorías? Los leads ya captados se quedan en el ranking.")) { clearForest(); ui.status = ""; render(); } },
      }) : null,
    ]),
    el("p", { class: "hint", html: "Escribe <b>una idea</b>. Se crea el árbol de carpetas; pulsa <b>buscar</b> y entran empresas reales." }),
    el("div", { class: "cmap-bar" }, [promptInput, genBtn]),
  ];

  // Auto-organizar: mete en el árbol los leads que han ido apareciendo.
  const leadsAll = store.getUserLeads();
  const unfiled = leadsAll.filter((l) => !Array.isArray(l.categoryPath) || !l.categoryPath.length).length;
  const actions = [
    el("button", { class: "btn cmap-radar", html: ui.busy ? "…" : icon("radar") + " Radar de momentos", title: "Sugiere nichos nuevos a explorar según el momento", onClick: runRadar }),
  ];
  if (leadsAll.length) {
    actions.push(el("button", { class: "btn cmap-organize", html: ui.busy ? "…" : icon("spark") + ` Auto-organizar leads${unfiled ? ` (${unfiled} sin archivar)` : ""}`, onClick: organizeLeads }));
  }
  blocks.push(el("div", { class: "cmap-actions" }, actions));
  if (ui.status) blocks.push(el("p", { class: "cmap-status", text: ui.status }));

  // Radar: nichos propuestos a explorar (añadir al mapa o descartar).
  if (ui.radar && ui.radar.length) {
    const cards = [el("div", { class: "radar-head" }, [
      el("span", { class: "radar-title", html: icon("radar") + " Nichos a explorar" }),
      el("button", { class: "facet-clear", text: "✕ ocultar", onClick: () => { ui.radar = null; patchCaptureMap(); } }),
    ])];
    ui.radar.forEach((s, idx) => {
      cards.push(el("div", { class: "radar-card" }, [
        el("div", { class: "radar-path", text: s.path.join(" / ") }),
        s.why ? el("div", { class: "radar-why", text: s.why }) : null,
        el("div", { class: "radar-acts" }, [
          el("button", { class: "btn radar-add", text: "➕ añadir al mapa", onClick: () => { mergeForest(pathNodes(s.path)); ui.expanded.add(pk([s.path[0]])); ui.radar.splice(idx, 1); ui.status = `✓ «${s.path.join(" / ")}» añadido al mapa.`; patchCaptureMap(); } }),
          el("button", { class: "facet-clear", text: "descartar", onClick: () => { ui.radar.splice(idx, 1); patchCaptureMap(); } }),
        ]),
      ]));
    });
    blocks.push(el("div", { class: "radar-box" }, cards));
  }

  // Filtro por etiquetas (entorno · clase · estética), cruzable como en Apollo.
  const tagGroups = allTags(leadsAll);
  if (tagGroups.length) {
    const chips = [el("span", { class: "facet-lbl", text: "Filtrar:" })];
    for (const g of tagGroups) {
      for (const v of g.values.slice(0, 6)) {
        const active = ui.facet && ui.facet.dim === g.dim && (ui.facet.value || "").toLowerCase() === v.value.toLowerCase();
        chips.push(el("button", {
          class: `facet-chip ${active ? "on" : ""}`, text: `${v.value} · ${v.count}`,
          onClick: () => { ui.facet = active ? null : { dim: g.dim, value: v.value }; patchCaptureMap(); },
        }));
      }
    }
    if (ui.facet) chips.push(el("button", { class: "facet-clear", text: "✕ quitar", onClick: () => { ui.facet = null; patchCaptureMap(); } }));
    blocks.push(el("div", { class: "cat-facets" }, chips));
  }

  if (forest.length) {
    blocks.push(el("div", { class: "cat-tree" }, forest.map((n) => renderNode(n, [n.name], 0))));
  } else {
    blocks.push(el("div", { class: "cmap-examples" }, [
      el("span", { class: "hint", text: "Ejemplos para empezar:" }),
      ...["clínicas", "creatividades / avatares / 3d / ia", "restauración premium"].map((ex) =>
        el("button", { class: "idea-chip", text: ex, onClick: () => { promptInput.value = ex; gen(); } })),
    ]));
  }
  return el("section", { class: "capture-map" }, blocks);
}

// Veredicto del estado de captación: una frase que orienta antes de cualquier
// CTA. Prioridad: leads recientes > piloto activo > mapa poblado > vacío.
function captureVerdict() {
  const cronNew = state._cronNew?.length || 0;
  const a = autopilotState();
  const forest = getForest();
  const totalLeads = store.getUserLeads().length;
  const totalCats = forest.length;

  let line;
  if (cronNew > 0) {
    line = `Llegaron ${cronNew} empresa${cronNew === 1 ? "" : "s"} mientras no estabas. Ya están captadas y listas para revisión.`;
  } else if (a.on) {
    line = "El piloto está en marcha. El mapa sigue creciendo automáticamente.";
  } else if (totalCats > 0 || totalLeads > 0) {
    const catPart = totalCats > 0 ? `${totalCats} categoría${totalCats === 1 ? "" : "s"}` : null;
    const leadPart = totalLeads > 0 ? `${totalLeads} empresa${totalLeads === 1 ? "" : "s"} captada${totalLeads === 1 ? "" : "s"}` : null;
    const parts = [catPart, leadPart].filter(Boolean);
    line = `El mapa contiene ${parts.join(" y ")}.`;
  } else {
    line = "El mapa está vacío. Describe una oportunidad para generar categorías y arrancar la captación.";
  }

  return el("p", { class: "capture-verdict", text: line });
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

  blocks.push(captureVerdict());

  // Mapa de captación: una idea → árbol de categorías. Lo primero y más fácil.
  blocks.push(captureMap());

  // Piloto automático: lo que no para de meter empresas solo.
  blocks.push(autopilotPanel());

  // Novedades del piloto: lo captado solo (servidor 24/7 + piloto), clicable.
  if (state._cronNew && state._cronNew.length) {
    blocks.push(el("div", { class: "cron-new" }, [
      el("div", { class: "cron-new-head" }, [
        el("span", { class: "cron-new-t", text: `Captado mientras no estabas · ${state._cronNew.length}` }),
        el("button", { class: "cron-new-x", text: "✕", title: "Ocultar", onClick: () => { state._cronNew = []; render(); } }),
      ]),
      el("div", { class: "cron-new-list" }, state._cronNew.slice(0, 12).map((n) =>
        el("button", {
          class: "cron-new-item",
          title: n.id ? "Abrir su caso" : "En el ranking",
          onClick: n.id ? () => openCase(n.id) : undefined,
        }, [
          el("span", { class: "cron-new-name", text: n.company }),
          n.city ? el("span", { class: "cron-new-city", text: n.city }) : null,
        ])
      )),
    ]));
  }

  // --- CAPTAR A MANO (avanzado): se pliega al final; el Mapa + piloto mandan ---
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
    statusBox.appendChild(el("p", { class: "hint", text: "Buscando empresas reales en el mapa…" }));
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

  const interests = getInterests(8);
  const chips = interests.length
    ? interests.map((it) => [it.q, it.q])
    : [["clínicas dentales Madrid"], ["restaurante premium Marbella"], ["promotora branded residences"], ["estudios de tatuaje Barcelona"]].map(([q]) => [q, q]);

  // Todo lo manual/avanzado, plegado. El Mapa y el piloto de arriba son la vía
  // normal; esto queda para casos puntuales, sin ensuciar la pantalla.
  const manual = [
    el("p", { class: "hint", text: "Para casos puntuales. La vía normal es el Mapa y el piloto de arriba." }),
    el("div", { class: "capt-bar" }, [qInput, captBtn]),
    sectorChip,
    el("div", { class: "idea-chips" }, [
      el("span", { class: "idea-lbl", text: interests.length ? "Tus intereses:" : "Ideas:" }),
      ...chips.map(([label, q]) => el("button", { class: "idea-chip", text: label, onClick: () => { qInput.value = q; captar(); } })),
    ]),
    statusBox,
    resultsBox,
    sectorManager(),
    el("h3", { text: "Añadir lead a mano", class: "add-h" }),
    addLeadForm(),
  ];
  if (userLeads.length) {
    manual.push(el("div", { class: "sec" }, [
      el("h4", { text: `Tus leads añadidos (${userLeads.length})` }),
      el("ul", { class: "user-leads" }, userLeads.map((l) =>
        el("li", {}, [
          el("span", { text: `${l.company} · ${sectorByKey(l.sector)?.label || l.sector} · ${l.city || "—"}` }),
          el("button", { class: "ul-del", text: "✕", title: "Eliminar", onClick: () => { store.removeUserLead(l.id); recompute().then(render); } }),
        ])
      )),
    ]));
  }
  blocks.push(el("details", { class: "legacy-tools" }, [
    el("summary", { text: "Captar a mano · herramientas avanzadas" }),
    el("div", { class: "legacy-body" }, manual),
  ]));

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
