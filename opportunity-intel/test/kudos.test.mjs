// Tests de kudos.js (reconocimiento) + roundtrip en store.js.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();
globalThis.localStorage.setItem("oi:users", JSON.stringify([{ name: "Tester", color: "#4a9eff", role: "admin", token: "tok-admin" }]));
globalThis.localStorage.setItem("oi:session", JSON.stringify({ name: "Tester", role: "admin", token: "tok-admin" }));

import { createKudo, kudosFor, kudosCount } from "../src/kudos.js";
const store = await import("../src/store.js");

let passed = 0, failed = 0;
function ok(c, m) { if (c) { passed++; } else { failed++; console.error("FAIL:", m); } }
function eq(a, b, m) { ok(a === b, `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// ---- crear ------------------------------------------------------------------
{
  const k = createKudo({ to: "Javi", from: "Pablo", note: "Gran cierre con Arzábal" });
  ok(k && k.id.startsWith("kudo_"), "id con prefijo");
  eq(k.to, "Javi", "destinatario");
  eq(k.from, "Pablo", "firmante");
  ok(!!k.at, "sella la fecha");
  ok(createKudo({ to: "  " }) === null, "sin destino → null");
}

// ---- lecturas ---------------------------------------------------------------
{
  const list = [
    createKudo({ to: "Javi", from: "Pablo", note: "a", }),
    createKudo({ to: "Pablo", from: "Javi", note: "b" }),
    createKudo({ to: "Javi", from: "Pablo", note: "c" }),
  ];
  eq(kudosFor(list, "Javi").length, 2, "filtra por destinatario");
  eq(kudosCount(list, "Javi"), 2, "cuenta los de Javi");
  eq(kudosCount(list, "Nadie"), 0, "cero si no hay");
}

// ---- store: persistencia + roundtrip de sync --------------------------------
{
  store.resetAll();
  eq(store.getKudos().length, 0, "store arranca sin kudos");
  store.addKudo(createKudo({ to: "Javi", from: "Pablo", note: "x" }));
  store.addKudo(createKudo({ to: "Javi", from: "Pablo", note: "y" }));
  eq(store.getKudos().length, 2, "guarda dos");

  const json = store.exportState();
  ok(json.includes("kudos"), "exportState incluye kudos");

  store.resetAll();
  store.importState(json);
  eq(store.getKudos().length, 2, "importa los kudos");
  // merge no duplica por id
  store.importState(json);
  eq(store.getKudos().length, 2, "re-importar no duplica (merge por id)");
}

console.log(`kudos.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
