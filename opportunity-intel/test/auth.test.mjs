// =============================================================================
// auth.test.mjs — Cuentas durables en backend con caché local (Fase 1, auth).
// Verifica la lógica de auth.js con una capa remota FALSA (sin red).
//
// Contrato actual:
//   - El nombre de registro es NOMBRE + APELLIDO (dos palabras), en MAYÚSCULAS.
//   - El email es obligatorio al registrar (localización/contacto del admin).
//   - El equipo se identifica por APODO (aka). currentUser().name = aka;
//     currentUser().realName = NOMBRE + APELLIDO; también expone email/photo.
//   - El apodo por defecto = nombre de pila.
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

// Apodo por defecto = nombre de pila (como el servidor real).
const firstName = (n) => { const w = String(n).trim().split(/\s+/)[0] || ""; return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""; };

// ── Remoto FALSO: un "servidor" en memoria, controlable y sin red. ───────────
function fakeRemote() {
  const db = new Map(); // name_lower → {name,aka,email,color,password,role,token,avatar,photo}
  let down = false;
  let tokenSeq = 0;
  const norm = (s) => String(s).trim().replace(/\s+/g, " ").toUpperCase();
  return {
    setDown: (v) => { down = v; },
    seed: (name, password, color, role = "editor") =>
      db.set(norm(name).toLowerCase(), { name: norm(name), aka: firstName(name), email: `${firstName(name).toLowerCase()}@xn.lab`, color, password, role, token: null, avatar: null, photo: null }),
    db,
    remoteRegister: async (name, password, color, _invite, email) => {
      if (down) throw new Error("offline");
      const nm = norm(name);
      if (db.has(nm.toLowerCase())) return { ok: false, error: "Ya existe un usuario con ese nombre." };
      const role = db.size === 0 ? "admin" : "editor";
      const token = `tok-${++tokenSeq}`;
      const u = { name: nm, aka: firstName(nm), email: String(email || "").toLowerCase(), color, password, role, token, avatar: null, photo: null };
      db.set(nm.toLowerCase(), u);
      return { ok: true, user: { name: u.name, aka: u.aka, email: u.email, color, role, avatar: null, photo: null, token } };
    },
    remoteLogin: async (name, password) => {
      if (down) throw new Error("offline");
      const u = db.get(norm(name).toLowerCase());
      if (!u) return { ok: false, error: "Usuario no encontrado." };
      if (u.password !== password) return { ok: false, error: "Contraseña incorrecta." };
      u.token = `tok-${++tokenSeq}`;
      return { ok: true, user: { name: u.name, aka: u.aka, email: u.email, color: u.color, role: u.role, avatar: u.avatar, photo: u.photo, token: u.token } };
    },
    remoteMe: async (token) => {
      if (down) throw new Error("offline");
      const u = [...db.values()].find((x) => x.token === token);
      return u ? { ok: true, user: { name: u.name, aka: u.aka, email: u.email, color: u.color, role: u.role, avatar: u.avatar, photo: u.photo } } : { ok: false, error: "Sesión no válida." };
    },
    remoteSetRole: async (token, targetName, role) => {
      if (down) throw new Error("offline");
      const caller = [...db.values()].find((x) => x.token === token);
      if (!caller) return { ok: false, error: "Sesión no válida." };
      if (caller.role !== "admin") return { ok: false, error: "Solo un ADMIN puede cambiar roles." };
      const tgt = db.get(norm(targetName).toLowerCase());
      if (!tgt) return { ok: false, error: "Usuario objetivo no encontrado." };
      tgt.role = role;
      return { ok: true, user: { name: tgt.name, role: tgt.role } };
    },
    remoteSetProfile: async (token, { aka, email, photo } = {}) => {
      if (down) throw new Error("offline");
      const u = [...db.values()].find((x) => x.token === token);
      if (!u) return { ok: false, error: "Sesión no válida." };
      if (aka !== undefined) u.aka = String(aka).trim();
      if (email !== undefined) u.email = String(email).trim().toLowerCase();
      if (photo !== undefined) u.photo = photo || null;
      return { ok: true, user: { aka: u.aka, email: u.email, photo: u.photo } };
    },
    // El admin ve nombre real + email; el resto, solo apodos.
    remoteList: async (token) => {
      if (down) return [];
      const caller = token ? [...db.values()].find((x) => x.token === token) : null;
      const isAdmin = caller?.role === "admin";
      return [...db.values()].map((u) => isAdmin
        ? { name: u.name, aka: u.aka, email: u.email, color: u.color, role: u.role, avatar: u.avatar, photo: u.photo }
        : { name: u.aka, aka: u.aka, color: u.color, role: u.role, avatar: u.avatar, photo: u.photo });
    },
  };
}

const R = fakeRemote();
auth.__setRemote(R);

// 1. Crear cuenta → va al backend y se cachea en local (nombre+apellido+email).
const c = await auth.createUserAsync("Pablo García", "secreto1", "#3fb950", null, "pablo@xn.lab");
ok(c.ok, "crea la cuenta en el backend");
ok(auth.getUsers().some((u) => u.name === "PABLO GARCÍA"), "queda cacheada en local (nombre real en MAYÚSCULAS)");

// 1b. Validaciones del nuevo contrato.
const noSurname = await auth.createUserAsync("Solo", "secreto1", "#c9a227", null, "x@xn.lab");
ok(!noSurname.ok && /apellido/i.test(noSurname.error), "exige NOMBRE y APELLIDO");
const noEmail = await auth.createUserAsync("Sin Email", "secreto1", "#c9a227", null, "");
ok(!noEmail.ok && /email/i.test(noEmail.error), "exige email válido");

// 2. Duplicado lo detecta el backend (mismo nombre, distinta caja).
const dup = await auth.createUserAsync("pablo garcía", "otra1234", null, null, "otro@xn.lab");
ok(!dup.ok && /existe/i.test(dup.error), "rechaza duplicado (backend)");

// 3. EL CASO REAL: la cuenta existe en el servidor pero NO en este navegador.
globalThis.localStorage.removeItem("oi:users"); // simula otro navegador
ok(!auth.getUsers().length, "este 'navegador' arranca sin cuentas locales");
R.seed("Pablo García", "secreto1", "#3fb950"); // pero en el servidor sí existe
const lr = await auth.loginAsync("Pablo García", "secreto1");
ok(lr.ok && lr.user.color === "#3fb950", "el backend recupera la cuenta y entra");
ok(auth.currentUser()?.name === "Pablo", "deja sesión iniciada y se ve por su apodo");
ok(auth.currentUser()?.realName === "PABLO GARCÍA", "guarda el nombre real para el admin");
ok(auth.getUsers().some((u) => u.name === "PABLO GARCÍA"), "y la cachea en local para la próxima");

// 4. Contraseña incorrecta: el backend manda.
auth.logout();
const bad = await auth.loginAsync("Pablo García", "mal");
ok(!bad.ok && /incorrecta/i.test(bad.error), "rechaza contraseña incorrecta");

// 5. Sin red: si la cuenta está cacheada en local, se entra igual (offline).
R.setDown(true);
const off = await auth.loginAsync("Pablo García", "secreto1");
ok(off.ok, "offline + cuenta cacheada → entra en local");
R.setDown(false);

// 6. syncRemoteColors mezcla colores de otros sin romper nada (firma por apodo).
R.seed("Javi Borrás", "javi1234", "#8b7bd8");
await auth.syncRemoteColors();
ok(auth.colorOf("Javi") === "#8b7bd8", "trae el color de firma de Javi (por apodo) para teñir su trabajo");

// ── RBAC: rol y token de sesión ──────────────────────────────────────────────
globalThis.localStorage.removeItem("oi:users");
globalThis.localStorage.removeItem("oi:session");
const RB = fakeRemote();
auth.__setRemote(RB);

// 7. El PRIMER usuario nace admin y la sesión guarda rol + token.
await auth.createUserAsync("Jefa Suprema", "clave1234", "#3fb950", null, "jefa@xn.lab");
const jefaLogin = await auth.loginAsync("Jefa Suprema", "clave1234");
ok(jefaLogin.ok && jefaLogin.user.role === "admin", "el primer usuario entra como admin");
ok(auth.currentRole() === "admin", "currentRole() = admin");
ok(typeof auth.getToken() === "string" && auth.getToken().length > 0, "hay token de sesión tras login");

// 7b. setProfile: el usuario cambia su apodo y email en cualquier momento.
const sp = await auth.setProfile({ aka: "Capitana", email: "capitana@xn.lab" });
ok(sp.ok && auth.currentUser()?.aka === "Capitana", "setProfile cambia el apodo");
ok(auth.currentUser()?.email === "capitana@xn.lab", "setProfile cambia el email");

// 8. Un segundo usuario nace editor (no admin).
const seg = await auth.createUserAsync("Curra Costa", "clave5678", "#f0883e", null, "curra@xn.lab");
ok(seg.ok, "se crea el segundo usuario");
ok(RB.db.get("curra costa").role === "editor", "el segundo usuario nace editor");

// 9. setUserRole: el admin (sesión actual = Jefa) puede degradar a Curra a viewer.
await auth.loginAsync("Jefa Suprema", "clave1234"); // asegura sesión admin
const sr = await auth.setUserRole("CURRA COSTA", "viewer");
ok(sr.ok, "admin cambia el rol de Curra a viewer");
ok(RB.db.get("curra costa").role === "viewer", "el servidor refleja el rol viewer");

// 10. Un no-admin NO puede cambiar roles (el servidor lo rechaza).
await auth.loginAsync("Curra Costa", "clave5678"); // ahora la sesión es de un viewer
ok(auth.currentRole() === "viewer", "Curra entra como viewer");
const srBad = await auth.setUserRole("JEFA SUPREMA", "viewer");
ok(!srBad.ok, "un viewer NO puede cambiar roles (servidor lo rechaza)");
ok(RB.db.get("jefa suprema").role === "admin", "Jefa sigue siendo admin");

// 11. refreshSession trae el rol actualizado del servidor (un admin me ascendió).
RB.db.get("curra costa").role = "analyst"; // simula que un admin cambió el rol
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

// 13. colorOwners: cada color cogido sabe a qué usuario pertenece (para bloquearlo).
const owners = auth.colorOwners();
ok([...usedNow].every((c) => owners.has(c)), "todo color en uso tiene dueño conocido");
ok(free.every((c) => !owners.has(c)), "los colores libres no tienen dueño");
const someTaken = "#3fb950";
ok(auth.getUsers().some((u) => u.color === someTaken && u.name === owners.get(someTaken)),
   "el dueño de un color cogido es un usuario real que lo firma");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
