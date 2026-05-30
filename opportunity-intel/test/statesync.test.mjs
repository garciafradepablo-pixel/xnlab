// Tests del estado compartido (store.js + statesync) con un servidor fake en
// memoria. Verifica: subir/bajar estado entre "navegadores", fusión no
// destructiva, resolución de conflicto sin perder datos, e indicador de sync.
import * as store from "../src/store.js";

let passed = 0, failed = 0;
function ok(cond, msg) { if (cond) { passed++; } else { failed++; console.error("FAIL:", msg); } }

// Servidor compartido fake: un único documento {data, rev} con control optimista.
function makeServer() {
  const srv = { data: null, rev: 0, throwOnSave: false };
  return {
    srv,
    remoteLoadState: async () => ({ ok: true, data: srv.data, rev: srv.rev }),
    remoteSaveState: async (data, rev, _by) => {
      if (srv.throwOnSave) throw new Error("offline");
      if (srv.rev !== (Number(rev) || 0)) {
        return { ok: false, conflict: true, data: srv.data, rev: srv.rev };
      }
      srv.data = JSON.parse(JSON.stringify(data)); // copia, como haría la red
      srv.rev += 1;
      return { ok: true, rev: srv.rev };
    },
  };
}

await (async function run() {
  const server = makeServer();
  store.__setStateRemote(server);

  // —— Navegador A: arranca sync (servidor vacío) y crea datos ——————————————
  store.resetAll();
  store.stopSharedSync(); // control manual: nada de timers en el test
  const startRes = await store.pullSharedState(); // == lo que hace startSharedSync
  ok(startRes.ok, "pull inicial contra servidor vacío devuelve ok");
  ok(server.srv.rev >= 1, "tras el primer pull se sube un snapshot (migración)");

  store.setStatus("lead-1", "interested");
  store.saveUserLead({ id: "u1", company: "ACME", signals: {} });
  store.addVerification("lead-1", "transition", "green", "vi su web", "http://acme.test");
  const pushA = await store.pushSharedState();
  ok(pushA.ok, "navegador A sube su estado");
  ok(store.getSyncState() === "synced", "indicador en 'synced' tras subir");
  ok(server.srv.data && server.srv.data.tracking["lead-1"], "el servidor guarda el tracking de A");

  // —— Navegador B: localStorage vacío, baja el estado compartido ———————————
  store.resetAll(); // simula otro navegador (cache local limpia + rev a 0)
  ok(store.getRecord("lead-1").status === "not_called", "B arranca sin datos locales");
  const pullB = await store.pullSharedState();
  ok(pullB.ok, "B baja el estado compartido");
  ok(store.getRecord("lead-1").status === "interested", "B ve el estado CRM de A");
  ok(store.getUserLeads().some((l) => l.id === "u1"), "B ve el lead añadido por A");
  ok(store.getLeadVerifications("lead-1").length === 1, "B ve la verificación de A");

  // —— Conflicto: otro cliente escribió entre medias; no se pierde nada ——————
  // Simula una escritura ajena directa en el servidor (sube rev sin avisar a B).
  const ajeno = JSON.parse(JSON.stringify(server.srv.data));
  ajeno.tracking["lead-2"] = { status: "rejected", notes: "", updatedAt: new Date().toISOString(), by: "otro" };
  server.srv.data = ajeno;
  server.srv.rev += 1; // ahora el rev local de B está desfasado

  store.setStatus("lead-3", "interested"); // cambio local de B sin sincronizar
  const pushConflict = await store.pushSharedState();
  ok(pushConflict.ok, "push con conflicto se resuelve y acaba en ok");
  ok(store.getRecord("lead-2").status === "rejected", "B incorpora el cambio ajeno (no lo pisa)");
  ok(server.srv.data.tracking["lead-3"], "el cambio local de B sobrevive al conflicto");
  ok(server.srv.data.tracking["lead-2"], "el cambio ajeno sobrevive al conflicto");

  // —— Offline: el guardado falla, datos locales intactos, indicador 'offline' —
  server.srv.throwOnSave = true;
  const before = store.getRecord("lead-3").status;
  const pushOffline = await store.pushSharedState();
  ok(!pushOffline.ok, "sin red, el push devuelve no-ok");
  ok(store.getSyncState() === "offline", "indicador en 'offline' al fallar la red");
  ok(store.getRecord("lead-3").status === before, "los datos locales no se pierden sin red");
  server.srv.throwOnSave = false;

  // —— El indicador notifica a sus suscriptores ————————————————————————————
  let notified = null;
  const unsub = store.onSyncState((s) => { notified = s; });
  await store.pushSharedState();
  ok(notified === "synced", "onSyncState notifica el estado 'synced'");
  unsub();

  console.log(`${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
})();
