// =============================================================================
// posits.js — El Muelle. Gadgets asíncronos entre el equipo. NO es un chat.
//
// Un posit es un gesto de un toque, no un mensaje: un sello que lanzas sobre un
// lead ("🔥 ciérralo", "👀 míralo"), un relevo con el que el CEO quita carga, o
// una potencia con la que la reconoce. Se lee de un vistazo y se archiva de un
// gesto. Rueda sobre el sync compartido que ya existe — sin servidor en directo,
// sin coste, sin tener que coincidir. El walkie-talkie del equipo, pero en cosas.
//
// Sin dependencias del módulo de app (sin ciclos): todo lo de fuera entra por
// parámetros (me, openLead, rerender, leadName). Así es testeable en aislamiento.
// =============================================================================

import { el } from "./dom.js";
import * as store from "../store.js";
import * as auth from "../auth.js";

// Catálogo de sellos. Glifo + una palabra: la palabra es etiqueta del gadget, no
// texto libre. Quien recibe entiende la intención sin leer un párrafo.
export const SELLOS = [
  { glyph: "🔥", label: "Ciérralo", tone: "hot" },
  { glyph: "👀", label: "Míralo", tone: "look" },
  { glyph: "⚡", label: "Urge", tone: "hot" },
  { glyph: "👏", label: "Bien", tone: "good" },
  { glyph: "🤝", label: "Es tuyo", tone: "hand" },
  { glyph: "🧊", label: "Enfríalo", tone: "cool" },
];

// Sellos exclusivos del CEO: el objetivo 3 hecho botón. Quitar carga y potenciar.
export const CEO_SELLOS = [
  { glyph: "🪂", label: "Te lo quito", tone: "relief", kind: "relevo" },
  { glyph: "🚀", label: "Te potencio", tone: "boost", kind: "potencia" },
];

function uid() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Compañeros a los que puedes lanzar un posit (todos menos tú). */
export function recipients(me) {
  return auth.getUsers().map((u) => u.name).filter((n) => n && n !== me);
}

/** Posits dirigidos a mí, vivos (sin archivar), del más reciente al más antiguo. */
export function inbox(me) {
  return store.getPosits().filter((p) => p.to === me && !p.archivedAt);
}

/** Posits que he lanzado yo, vivos. */
export function outbox(me) {
  return store.getPosits().filter((p) => p.from === me && !p.archivedAt);
}

/** Cuántos posits tengo sin ver (lo que enciende el punto del muelle). */
export function unread(me) {
  return inbox(me).filter((p) => !p.seenAt).length;
}

/** Lanza un posit. from = yo, sello de tiempo = ahora. */
export function fling({ kind = "sello", glyph, label, tone, to, leadId = null }, me) {
  return store.savePosit({
    id: uid(),
    kind,
    from: me,
    to,
    glyph,
    label,
    tone: tone || null,
    leadId,
    createdAt: new Date().toISOString(),
  });
}

// ---- Racha (Pulso): la obsesión hecha número ---------------------------------
// Días seguidos en que has movido algo en la app — un sello, un cambio de estado,
// un resultado registrado. No se inventa: se deriva de tu rastro real de trabajo.
function activityDays(me) {
  const days = new Set();
  const add = (iso) => { if (iso) days.add(String(iso).slice(0, 10)); };
  for (const o of store.getLearning()) if (o.by === me) add(o.createdAt);
  for (const r of Object.values(store.getTracking())) if (r.by === me) add(r.updatedAt);
  for (const p of store.getPosits()) if (p.from === me) add(p.createdAt);
  return days;
}

/** Racha de días consecutivos con actividad, terminando hoy o ayer. */
export function streak(me) {
  const days = activityDays(me);
  if (!days.size) return 0;
  const dayStr = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const start = days.has(dayStr(today)) ? today : new Date(today.getTime() - 86400000);
  if (!days.has(dayStr(start))) return 0; // ni hoy ni ayer → racha rota
  let n = 0;
  const cursor = new Date(start);
  while (days.has(dayStr(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** Acciones tuyas registradas HOY (sellos lanzados, estados movidos, resultados).
 *  Es el combustible del Pulso: ver subir el número engancha a trabajar EN la app. */
export function actionsToday(me) {
  const today = new Date().toISOString().slice(0, 10);
  const isToday = (iso) => String(iso || "").slice(0, 10) === today;
  let n = 0;
  for (const o of store.getLearning()) if (o.by === me && isToday(o.createdAt)) n++;
  for (const r of Object.values(store.getTracking())) if (r.by === me && isToday(r.updatedAt)) n++;
  for (const p of store.getPosits()) if (p.from === me && isToday(p.createdAt)) n++;
  return n;
}

/** El reconocimiento más reciente que te ha dado el CEO (🚀 potencia). Persiste
 *  aunque se archive: el objetivo 3 deja huella, no se borra de un gesto. */
export function lastRecognition(me) {
  return store.getPosits().find((p) => p.to === me && p.kind === "potencia") || null;
}

// ---- Selector de sello: el gadget que lanzas desde donde trabajas ------------
// Popover ligero, anclado al cuerpo, glanceable. Un toque elige el sello; si hay
// más de un compañero, una fila de avatares elige a quién. Se cierra solo.
export function openSelloPicker({ leadId = null, leadName = "", me, isCeo = false, onSent }) {
  document.querySelector(".sello-pop")?.remove();
  const people = recipients(me);
  if (!people.length) {
    toast("Aún no hay compañero al que lanzar el posit.");
    return;
  }
  let target = people[0];

  const palette = [...SELLOS, ...(isCeo ? CEO_SELLOS : [])];
  const grid = el("div", { class: "sello-grid" });
  const sello = (s) =>
    el("button", {
      class: `sello sello-${s.tone || "look"}`,
      title: s.label,
      onClick: () => {
        fling({ kind: s.kind || "sello", glyph: s.glyph, label: s.label, tone: s.tone, to: target, leadId }, me);
        pop.remove();
        toast(`${s.glyph} ${s.label} → ${target}`);
        onSent?.();
      },
    }, [
      el("span", { class: "sello-glyph", text: s.glyph }),
      el("span", { class: "sello-label", text: s.label }),
    ]);
  palette.forEach((s) => grid.appendChild(sello(s)));

  const head = el("div", { class: "sello-head" }, [
    el("span", { class: "sello-ctx", text: leadName ? `Sobre ${leadName}` : "Posit al equipo" }),
    el("button", { class: "sello-x", text: "✕", title: "Cerrar", onClick: () => pop.remove() }),
  ]);

  const children = [head];
  if (people.length > 1) {
    const chips = el("div", { class: "sello-who" });
    const draw = () => {
      chips.innerHTML = "";
      people.forEach((n) => {
        chips.appendChild(el("button", {
          class: `who-chip${n === target ? " on" : ""}`,
          onClick: () => { target = n; draw(); },
        }, [avatar(n), el("span", { text: n })]));
      });
    };
    draw();
    children.push(chips);
  }
  children.push(grid);

  const pop = el("div", { class: "sello-pop" }, children);
  document.body.appendChild(pop);
  requestAnimationFrame(() => pop.classList.add("in"));
  // Cerrar al tocar fuera.
  setTimeout(() => {
    const off = (e) => {
      if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener("pointerdown", off); }
    };
    document.addEventListener("pointerdown", off);
  }, 0);
}

// ---- El Muelle: la vista de posits -------------------------------------------
export function positsView({ me, isCeo = false, openLead, rerender, leadName }) {
  const root = el("section", { class: "muelle" });

  const inb = inbox(me);
  const out = outbox(me);

  root.appendChild(el("div", { class: "muelle-head" }, [
    el("h2", { class: "muelle-title", text: "Muelle" }),
    el("p", { class: "muelle-sub", text: "Gestos del equipo. Un vistazo, no una bandeja. Tócalos para ir al lead; deslízalos para archivar." }),
    el("button", {
      class: "muelle-new",
      text: "＋ Lanzar posit",
      onClick: () => openSelloPicker({ me, isCeo, onSent: rerender }),
    }),
  ]));

  // Para ti.
  root.appendChild(el("h3", { class: "muelle-band", text: `Para ti${inb.length ? ` · ${inb.length}` : ""}` }));
  if (!inb.length) {
    root.appendChild(el("p", { class: "muelle-empty", text: "Limpio. Nadie te ha lanzado nada." }));
  } else {
    const stack = el("div", { class: "muelle-stack" });
    inb.forEach((p) => stack.appendChild(positCard(p, { me, openLead, rerender, leadName, incoming: true })));
    root.appendChild(stack);
  }

  // Enviados (tenue).
  if (out.length) {
    root.appendChild(el("h3", { class: "muelle-band faint", text: `Enviados · ${out.length}` }));
    const stack = el("div", { class: "muelle-stack faint" });
    out.forEach((p) => stack.appendChild(positCard(p, { me, openLead, rerender, leadName, incoming: false })));
    root.appendChild(stack);
  }

  return root;
}

function positCard(p, { me, openLead, rerender, leadName, incoming }) {
  const who = incoming ? p.from : p.to;
  const lead = p.leadId ? (leadName?.(p.leadId) || "un lead") : null;
  const fresh = incoming && !p.seenAt;

  const card = el("div", {
    class: `posit posit-${p.tone || "look"}${fresh ? " fresh" : ""}`,
    title: lead ? `Ir a ${lead}` : "",
    onClick: () => {
      if (incoming && !p.seenAt) store.markPosit(p.id, { seenAt: new Date().toISOString() });
      if (p.leadId && openLead) openLead(p.leadId);
      else rerender?.();
    },
  }, [
    el("span", { class: "posit-glyph", text: p.glyph }),
    el("div", { class: "posit-body" }, [
      el("span", { class: "posit-label", text: p.label }),
      el("span", { class: "posit-meta" }, [
        avatar(who),
        el("span", { class: "posit-who", text: incoming ? who : `→ ${who}` }),
        lead ? el("span", { class: "posit-lead", text: `· ${lead}` }) : null,
        el("span", { class: "posit-time", text: ago(p.createdAt) }),
      ]),
    ]),
    el("button", {
      class: "posit-arch",
      text: "✓",
      title: "Archivar",
      onClick: (e) => {
        e.stopPropagation();
        store.markPosit(p.id, { archivedAt: new Date().toISOString(), seenAt: p.seenAt || new Date().toISOString() });
        card.classList.add("gone");
        setTimeout(() => rerender?.(), 180);
      },
    }),
  ]);
  return card;
}

// ---- Piezas pequeñas ---------------------------------------------------------
function avatar(name) {
  const color = auth.colorOf?.(name) || "#888";
  return el("span", { class: "posit-av", text: (name || "?").slice(0, 1).toUpperCase(), style: `background:${color}` });
}

function ago(iso) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}

let toastTimer = null;
function toast(msg) {
  document.querySelector(".posit-toast")?.remove();
  const t = el("div", { class: "posit-toast", text: msg });
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("in"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove("in"); setTimeout(() => t.remove(), 250); }, 1800);
}
