// =============================================================================
// voice.js — EC · Eco en la app. El micrófono flotante (abajo a la derecha).
//
// Aprietas, hablas, y el navegador transcribe (Web Speech API, gratis, sin clave).
// Al enviar, la función `eco` lo destila a resumen + palabras clave y lo ENTREGA
// a la otra persona del equipo. Cada uno ve en su bandeja lo que le han mandado.
//
// Autónomo: se monta una vez sobre <body> (sobrevive a los re-render de la app,
// que solo limpian `root`). No toca la sincronización compartida. Import-safe en
// Node: nada de window/document/fetch en el cuerpo del módulo, solo dentro de las
// funciones que arranca el navegador.
// =============================================================================

import { el } from "./dom.js";
import { currentUser, getToken, getUsers, colorOf } from "../auth.js";

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/eco";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

async function api(action, payload = {}) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, token: getToken(), ...payload }),
    });
    return await res.json();
  } catch {
    return { ok: false, error: "Sin conexión." };
  }
}

const SR = () => (typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null);
const fmtTime = (iso) => {
  try { return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

let mounted = false;
let panelOpen = false;
let rec = null, listening = false, finalText = "", interim = "";

/** Monta el micro flotante una sola vez. Llamar tras login, desde mount(). */
export function ensureEco() {
  if (mounted || typeof document === "undefined") return;
  mounted = true;

  const fab = el("button", {
    class: "eco-fab", title: "EC · Eco — nota de voz",
    html: micSVG() + '<span class="eco-badge" style="display:none">0</span>',
    onClick: togglePanel,
  });
  const panel = el("div", { class: "eco-panel", style: "display:none" });
  document.body.appendChild(fab);
  document.body.appendChild(panel);

  refreshInbox(); // trae la bandeja para pintar el contador, aunque el panel esté cerrado
}

function togglePanel() {
  panelOpen = !panelOpen;
  const panel = document.querySelector(".eco-panel");
  document.querySelector(".eco-fab")?.classList.toggle("on", panelOpen);
  if (!panel) return;
  panel.style.display = panelOpen ? "flex" : "none";
  if (panelOpen) { renderPanel(); refreshInbox(); refreshSent(); }
  else stopRec();
}

// —— Estado de la bandeja ——————————————————————————————————————————————————————
let inbox = [];
async function refreshInbox() {
  if (!getToken()) return;
  const r = await api("inbox");
  if (r && r.ok) { inbox = r.ecos || []; paintBadge(); if (panelOpen) renderPanel(); }
}

// Mis ecos enviados (con su veredicto) → la métrica norte: ¿llegan claros?
let sent = [];
async function refreshSent() {
  if (!getToken()) return;
  const r = await api("sent");
  if (r && r.ok) { sent = r.ecos || []; if (panelOpen) renderPanel(); }
}
function clarity() {
  const judged = sent.filter((e) => e.verdict);
  return { clear: judged.filter((e) => e.verdict === "clear").length, judged: judged.length };
}
function unreadCount() { return inbox.filter((e) => !e.read_at).length; }
function paintBadge() {
  const b = document.querySelector(".eco-badge");
  if (!b) return;
  const n = unreadCount();
  b.textContent = String(n);
  b.style.display = n ? "flex" : "none";
}

// —— Panel ————————————————————————————————————————————————————————————————————
function renderPanel() {
  const panel = document.querySelector(".eco-panel");
  if (!panel) return;
  while (panel.firstChild) panel.removeChild(panel.firstChild);

  const me = currentUser();
  // El equipo se identifica por APODO (aka): los ecos se dirigen por aka y nadie
  // ve el nombre real de otro. Usamos el aka tanto para mostrar como para enviar.
  const akaOf = (u) => u.aka || u.name;
  const myAka = me ? (me.aka || me.name) : "";
  const others = getUsers().filter((u) => (u.colorOnly ? u.role : true) && akaOf(u) && akaOf(u) !== myAka);

  // Cabecera + métrica norte (¿tus ecos llegan claros?)
  panel.appendChild(el("div", { class: "eco-head" }, [
    el("span", { class: "eco-title", text: "EC · Eco" }),
    el("button", { class: "eco-x", text: "✕", title: "Cerrar", onClick: togglePanel }),
  ]));
  const c = clarity();
  panel.appendChild(el("p", { class: "eco-clarity", text:
    c.judged ? `Tus ecos llegan claros: ${c.clear}/${c.judged}` : "Claridad: aún sin señal. Marca abajo los que recibas." }));

  // —— Enviar ——
  const status = el("p", { class: "eco-status" });
  const transcript = el("textarea", { class: "eco-transcript", placeholder: "Aprieta el micro y habla… (o escribe aquí)", rows: "4" });

  let toName = others[0] ? akaOf(others[0]) : "";
  const toSel = el("select", { class: "eco-to" },
    others.length
      ? others.map((u) => el("option", { value: akaOf(u), text: akaOf(u) }))
      : [el("option", { value: "", text: "— sin compañero —" })]);
  toSel.addEventListener("change", () => { toName = toSel.value; });

  const recBtn = el("button", { class: "eco-rec", html: micSVG(), title: "Grabar" });
  const hasSR = !!SR();
  if (!hasSR) { recBtn.disabled = true; recBtn.title = "Tu navegador no transcribe voz (usa Chrome). Puedes escribir la nota."; }
  recBtn.addEventListener("click", () => toggleRec(transcript, recBtn, status));

  const sendBtn = el("button", { class: "eco-send btn-primary", text: "Enviar a " + (toName || "…") });
  toSel.addEventListener("change", () => { sendBtn.textContent = "Enviar a " + (toSel.value || "…"); });
  sendBtn.addEventListener("click", async () => {
    const text = (transcript.value || "").trim();
    if (!text) { status.textContent = "La nota está vacía."; return; }
    if (!toSel.value) { status.textContent = "No hay compañero a quien enviar."; return; }
    stopRec();
    sendBtn.disabled = true; status.textContent = "Destilando y entregando…";
    const r = await api("send", { to: toSel.value, transcript: text });
    sendBtn.disabled = false;
    if (r && r.ok) {
      transcript.value = ""; finalText = ""; interim = "";
      status.textContent = r.ai ? "Entregado, resumido por Eco." : "Entregado (resumen básico: falta la clave de Gemini).";
    } else {
      status.textContent = (r && r.error) || "No se pudo entregar.";
    }
  });

  panel.appendChild(el("div", { class: "eco-compose" }, [
    el("div", { class: "eco-row" }, [
      el("span", { class: "eco-lbl", text: "Para" }), toSel, recBtn,
    ]),
    transcript,
    status,
    sendBtn,
  ]));

  // —— Recibidos ——
  panel.appendChild(el("div", { class: "eco-sub", text: "Recibidos" }));
  const list = el("div", { class: "eco-list" });
  if (!inbox.length) {
    list.appendChild(el("p", { class: "eco-empty", text: "Nada por ahora. Cuando tu compañero te mande algo, aparece aquí." }));
  } else {
    inbox.forEach((e) => list.appendChild(ecoCard(e)));
  }
  panel.appendChild(list);
}

function ecoCard(e) {
  const unread = !e.read_at;
  const head = el("div", { class: "eco-card-head" }, [
    el("span", { class: "eco-dot", style: `background:${colorOf(e.from_name) || "var(--accent)"}` }),
    el("span", { class: "eco-from", text: e.from_name }),
    el("span", { class: "eco-when", text: fmtTime(e.created_at) }),
  ]);
  const resumen = el("p", { class: "eco-resumen", text: e.resumen || "" });
  const chips = el("div", { class: "eco-chips" },
    (e.keywords || []).map((k) => el("span", { class: "eco-chip", text: k })));
  const children = [head, resumen];
  if ((e.keywords || []).length) children.push(chips);
  if (e.raw && e.raw !== e.resumen) {
    children.push(el("details", { class: "eco-raw" }, [
      el("summary", { text: "Ver original" }),
      el("p", { text: e.raw }),
    ]));
  }
  // Veredicto de un clic: la señal de eficiencia que el receptor devuelve.
  children.push(el("div", { class: "eco-verdict" }, [
    vBtn("clear", "Claro", e), vBtn("ask", "Tengo que preguntar", e),
  ]));
  const card = el("div", { class: `eco-card ${unread ? "unread" : ""}` }, children);
  if (unread) {
    // Marcar leído al abrir/tocar la tarjeta.
    card.addEventListener("click", async () => {
      if (!e.read_at) {
        e.read_at = new Date().toISOString();
        card.classList.remove("unread");
        paintBadge();
        await api("read", { id: e.id });
      }
    }, { once: true });
  }
  return card;
}

function vBtn(val, label, e) {
  const b = el("button", { class: `eco-vbtn ${e.verdict === val ? "on" : ""}`, text: label });
  b.addEventListener("click", async (ev) => {
    ev.stopPropagation(); // no dispares el "marcar leído" de la tarjeta
    e.verdict = val;
    if (!e.read_at) e.read_at = new Date().toISOString();
    paintBadge();
    renderPanel();
    await api("verdict", { id: e.id, verdict: val });
  });
  return b;
}

// —— Dictado (Web Speech API) ——————————————————————————————————————————————————
function toggleRec(transcript, btn, status) {
  if (listening) { stopRec(); btn.classList.remove("on"); status.textContent = ""; return; }
  const Ctor = SR();
  if (!Ctor) return;
  finalText = transcript.value ? transcript.value + " " : "";
  interim = "";
  rec = new Ctor();
  rec.lang = "es-ES";
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (ev) => {
    interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) finalText += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    transcript.value = (finalText + interim).replace(/\s+/g, " ").trimStart();
  };
  rec.onerror = (ev) => {
    if (ev.error === "not-allowed" || ev.error === "service-not-allowed")
      status.textContent = "Permite el micrófono en el navegador para grabar.";
    stopRec(); btn.classList.remove("on");
  };
  rec.onend = () => { if (listening) { try { rec.start(); } catch { /* reinicio benigno */ } } };
  try { rec.start(); listening = true; btn.classList.add("on"); status.textContent = "Escuchando…"; }
  catch { status.textContent = "No se pudo iniciar el micrófono."; }
}

function stopRec() {
  listening = false;
  try { rec && rec.stop(); } catch { /* ya parado */ }
  rec = null;
  document.querySelector(".eco-rec")?.classList.remove("on");
}

function micSVG() {
  return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>';
}
