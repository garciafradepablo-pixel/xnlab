// =============================================================================
// auth.test.mjs — Cuentas durables en backend con caché local (Fase 1, auth).
// Verifica la lógica de auth.js con una capa remota FALSA (sin red).
// =============================================================================

// Shim de localStorage para Node.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const auth = await import("../src/auth.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("auth.test.mjs");

// ── Remoto FALSO: un "servidor" en memoria, controlable y sin red. ───────────
function fakeRemote() {
  const db = new Map(); // name_lower → {name,color,password}
  let down = false;
  return {
    setDown: (v) => { down = v; },
    seed: (name, password, color) => db.set(name.toLowerCase(), { name, color, password }),
    remoteRegister: async (name, password, color) => {
      if (down) throw new Error("offline");
      if (db.has(name.toLowerCase())) return { ok: false, error: "Ya existe un usuario con ese nombre." };
      db.set(name.toLowerCase(), { name, color, password });
      return { ok: true, user: { name, color } };
    },
    remoteLogin: async (name, password) => {
      if (down) throw new Error("offline");
      const u = db.get(String(name).toLowerCase());
      if (!u) return { ok: false, error: "Usuario no encontrado." };
      if (u.password !== password) return { ok: false, error: "Contraseña incorrecta." };
      return { ok: true, user: { name: u.name, color: u.color } };
    },
    remoteList: async () => (down ? [] : [...db.values()].map((u) => ({ name: u.name, color: u.color }))),
  };
}

const R = fakeRemote();
auth.__setRemote(R);

// 1. Crear cuenta → va al backend y se cachea en local.
const c = await auth.createUserAsync("Pablo", "secreto1", "#3fb950");
ok(c.ok, "crea la cuenta en el backend");
ok(auth.getUsers().some((u) => u.name === "Pablo"), "queda cacheada en local");

// 2. Duplicado lo detecta el backend.
const dup = await auth.createUserAsync("pablo", "otra1234");
ok(!dup.ok && /existe/i.test(dup.error), "rechaza duplicado (backend)");

// 3. EL CASO REAL: la cuenta existe en el servidor pero NO en este navegador
//    (p.ej. navegador interno de WhatsApp). Login local fallaría; el backend la
//    recupera y la cachea.
globalThis.localStorage.removeItem("oi:users"); // simula otro navegador: sin cuentas locales
ok(!auth.getUsers().length, "este 'navegador' arranca sin cuentas locales");
R.seed("Pablo", "secreto1", "#3fb950"); // pero en el servidor sí existe
const lr = await auth.loginAsync("Pablo", "secreto1");
ok(lr.ok && lr.user.color === "#3fb950", "el backend recupera la cuenta y entra");
ok(auth.currentUser()?.name === "Pablo", "deja sesión iniciada");
ok(auth.getUsers().some((u) => u.name === "Pablo"), "y la cachea en local para la próxima");

// 4. Contraseña incorrecta: el backend manda.
auth.logout();
const bad = await auth.loginAsync("Pablo", "mal");
ok(!bad.ok && /incorrecta/i.test(bad.error), "rechaza contraseña incorrecta");

// 5. Sin red: si la cuenta está cacheada en local, se entra igual (offline).
R.setDown(true);
const off = await auth.loginAsync("Pablo", "secreto1");
ok(off.ok, "offline + cuenta cacheada → entra en local");
R.setDown(false);

// 5b. MIGRACIÓN de cuentas viejas: una cuenta que solo existía en local (de
//     antes del backend) se sube al servidor al entrar, y luego funciona en otro
//     navegador.
globalThis.localStorage.removeItem("oi:users");
const R2 = fakeRemote();
auth.__setRemote(R2);
auth.createUser("Vieja", "vieja1234", "#f0883e"); // SOLO local (API síncrona)
ok(!(await R2.remoteLogin("Vieja", "vieja1234")).ok, "no está en el servidor todavía");
const lv = await auth.loginAsync("Vieja", "vieja1234"); // entra por local + migra
ok(lv.ok, "entra con la cuenta local");
await auth.migrateLocalUser("Vieja", "vieja1234"); // fuerza la migración de forma determinista
ok((await R2.remoteLogin("Vieja", "vieja1234")).ok, "tras migrar, ya está en el servidor");

// 6. syncRemoteColors mezcla colores de otros sin romper nada.
auth.__setRemote(R);
R.seed("Javi", "javi1234", "#8b7bd8");
await auth.syncRemoteColors();
ok(auth.colorOf("Javi") === "#8b7bd8", "trae el color de firma de Javi para teñir su trabajo");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
