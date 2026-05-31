// Tests de presencia en vivo: módulo puro presence.js (poda por TTL, upsert,
// merge por latido más reciente, lista activa) + roundtrip en store.js (la
// presencia viaja por export/importState y se poda al fusionar).
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();
globalThis.localStorage.setItem("oi:users", JSON.stringify([{ name: "Tester", color: "#4a9eff", role: "admin", token: "tok-admin" }]));
globalThis.localStorage.setItem("oi:session", JSON.stringify({ name: "Tester", role: "admin", token: "tok-admin" }));

import {
  prunePresence, upsertPresence, mergePresence, activePresence, PRESENCE_TTL,
} from "../src/presence.js";
const store = await import("../src/store.js");

let passed = 0, failed = 0;
function ok(cond, msg) { if (cond) { passed++; } else { failed++; console.error("FAIL:", msg); } }
function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

const NOW = 1_700_000_000_000;

// ---- prune: caduca lo viejo, conserva lo fresco -----------------------------
{
  const map = {
    Pablo: { name: "Pablo", at: NOW - 1000 },
    Javi: { name: "Javi", at: NOW - (PRESENCE_TTL + 5000) }, // pasado de TTL
  };
  const p = prunePresence(map, NOW);
  ok(p.Pablo, "conserva al activo");
  ok(!p.Javi, "elimina al caducado");
  eq(Object.keys(prunePresence({}, NOW)).length, 0, "mapa vacío → vacío");
}

// ---- upsert: añade/actualiza por nombre, sella `at` -------------------------
{
  let map = upsertPresence({}, { name: "Pablo", color: "#fff", view: "studio" }, NOW);
  eq(map.Pablo.view, "studio", "guarda la vista");
  eq(map.Pablo.at, NOW, "sella el latido");
  map = upsertPresence(map, { name: "Pablo", color: "#fff", view: "crm" }, NOW + 100);
  eq(Object.keys(map).length, 1, "no duplica por nombre");
  eq(map.Pablo.view, "crm", "actualiza la vista");
  eq(upsertPresence(map, { name: "  " }, NOW), map, "nombre vacío → sin cambios");
}

// ---- merge: gana el latido más reciente, poda el resultado ------------------
{
  const a = { Pablo: { name: "Pablo", view: "studio", at: NOW - 1000 } };
  const b = {
    Pablo: { name: "Pablo", view: "crm", at: NOW }, // más nuevo
    Javi: { name: "Javi", view: "today", at: NOW - 2000 },
    Vieja: { name: "Vieja", at: NOW - (PRESENCE_TTL + 1) }, // caduca al fusionar
  };
  const m = mergePresence(a, b, NOW);
  eq(m.Pablo.view, "crm", "el latido más reciente gana");
  ok(m.Javi, "incorpora a Javi");
  ok(!m.Vieja, "poda al caducado en el merge");
}

// ---- activePresence: ordena, excluye, filtra caducados ----------------------
{
  const map = {
    Zoe: { name: "Zoe", at: NOW },
    Ana: { name: "Ana", at: NOW },
    Yo: { name: "Yo", at: NOW },
  };
  const list = activePresence(map, { now: NOW, exclude: "Yo" });
  eq(list.length, 2, "excluye a 'Yo'");
  eq(list[0].name, "Ana", "orden alfabético");
}

// ---- store: setPresence + getPresence (podado) + roundtrip de sync ----------
{
  store.resetAll();
  eq(Object.keys(store.getPresence()).length, 0, "store arranca sin presencia");
  store.setPresence({ name: "Pablo", color: "#abc", view: "studio" });
  store.setPresence({ name: "Javi", color: "#def", view: "crm" });
  eq(Object.keys(store.getPresence()).length, 2, "dos presentes");

  const json = store.exportState();
  ok(json.includes("presence"), "exportState incluye presence");

  // Otro navegador importa: ve a ambos.
  store.resetAll();
  store.importState(json);
  eq(Object.keys(store.getPresence()).length, 2, "importa la presencia");

  // clearPresence quita a uno.
  store.clearPresence("Pablo");
  ok(!store.getPresence().Pablo, "clearPresence elimina al usuario");
  ok(store.getPresence().Javi, "el otro sigue presente");
}

console.log(`presence.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
