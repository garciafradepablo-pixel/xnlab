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
  const db = new Map(); // name_lower → {name,color,password,role,token}
  let down = false;
  let tokenSeq = 0;
  return {
    setDown: (v) => { down = v; },
    seed: (name, password, color, role = "editor") => db.set(name.toLowerCase(), { name, color, password, role, token: null }),
    db,
    remoteRegister: async (name, password, color) => {
      if (down) throw new Error("offline");
      if (db.has(name.toLowerCase())) return { ok: false, error: "Ya existe un usuario con ese nombre." };
      // El primer usuario del workspace nace admin (como el servidor real).
      const role = db.size === 0 ? "admin" : "editor";
      const token = `tok-${++tokenSeq}`;
      db.set(name.toLowerCase(), { name, color, password, role, token });
      return { ok: true, user: { name, color, role, token } };
    },
    remoteLogin: async (name, password) => {
      if (down) throw new Error("offline");
      const u = db.get(String(name).toLowerCase());
      if (!u) return { ok: false, error: "Usuario no encontrado." };
      if (u.password !== password) return { ok: false, error: "Contraseña incorrecta." };
      u.token = `tok-${++tokenSeq}`;
      return { ok: true, user: { name: u.name, color: u.color, role: u.role, token: u.token } };
    },
    remoteMe: async (token) => {
      if (down) throw new Error("offline");
      const u = [...db.values()].find((x) => x.token === token);
      return u ? { ok: true, user: { name: u.name, color: u.color, role: u.role } } : { ok: false, error: "Sesión no válida." };
    },
    remoteSetRole: async (token, targetName, role) => {
      if (down) throw new Error("offline");
      const caller = [...db.values()].find((x) => x.token === token);
      if (!caller) return { ok: false, error: "Sesión no válida." };
      if (caller.role !== "admin") return { ok: false, error: "Solo un ADMIN puede cambiar roles." };
      const tgt = db.get(String(targetName).toLowerCase());
      if (!tgt) return { ok: false, error: "Usuario objetivo no encontrado." };
      tgt.role = role;
      return { ok: true, user: { name: tgt.name, role: tgt.role } };
    },
    remoteList: async () => (down ? [] : [...db.values()].map((u) => ({ name: u.name, color: u.color, role: u.role }))),
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

// ── RBAC: rol y token de sesión ──────────────────────────────────────────────
globalThis.localStorage.removeItem("oi:users");
globalThis.localStorage.removeItem("oi:session");
const RB = fakeRemote();
auth.__setRemote(RB);

// 7. El PRIMER usuario nace admin y la sesión guarda rol + token.
await auth.createUserAsync("Jefa", "clave1234", "#3fb950");
const jefaLogin = await auth.loginAsync("Jefa", "clave1234");
ok(jefaLogin.ok && jefaLogin.user.role === "admin", "el primer usuario entra como admin");
ok(auth.currentRole() === "admin", "currentRole() = admin");
ok(typeof auth.getToken() === "string" && auth.getToken().length > 0, "hay token de sesión tras login");

// 8. Un segundo usuario nace editor (no admin).
const RB2alt = await auth.createUserAsync("Curra", "clave5678", "#f0883e");
ok(RB2alt.ok, "se crea el segundo usuario");
ok(RB.db.get("curra").role === "editor", "el segundo usuario nace editor");

// 9. setUserRole: el admin (sesión actual = Jefa) puede degradar a Curra a viewer.
await auth.loginAsync("Jefa", "clave1234"); // asegura sesión admin
const sr = await auth.setUserRole("Curra", "viewer");
ok(sr.ok, "admin cambia el rol de Curra a viewer");
ok(RB.db.get("curra").role === "viewer", "el servidor refleja el rol viewer");

// 10. Un no-admin NO puede cambiar roles (el servidor lo rechaza).
await auth.loginAsync("Curra", "clave5678"); // ahora la sesión es de un viewer
ok(auth.currentRole() === "viewer", "Curra entra como viewer");
const srBad = await auth.setUserRole("Jefa", "viewer");
ok(!srBad.ok, "un viewer NO puede cambiar roles (servidor lo rechaza)");
ok(RB.db.get("jefa").role === "admin", "Jefa sigue siendo admin");

// 11. refreshSession trae el rol actualizado del servidor (un admin me ascendió).
RB.db.get("curra").role = "analyst"; // simula que un admin cambió el rol en el servidor
const rs = await auth.refreshSession();
ok(rs.ok && rs.role === "analyst", "refreshSession trae el rol nuevo del servidor");
ok(auth.currentRole() === "analyst", "currentRole() refleja el rol revalidado");

// 12. availableColors: un color ya elegido desaparece del catálogo de firmas.
const usedNow = new Set(auth.getUsers().map((u) => u.color));
const free = auth.availableColors();
ok(free.every((c) => !usedNow.has(c)), "availableColors() excluye todo color ya en uso");
ok(!free.includes("#3fb950") && !free.includes("#f0883e"), "los colores tomados no se ofrecen a nuevos usuarios");
ok(auth.SIGNATURE_COLORS.filter((c) => !usedNow.has(c)).length === free.length, "ofrece exactamente los colores libres");
ok(!usedNow.has(auth.nextFreeColor()) || free.length === 0, "nextFreeColor() devuelve un color libre");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
