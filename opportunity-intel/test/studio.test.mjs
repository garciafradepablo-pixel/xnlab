// =============================================================================
// studio.test.mjs — Proyectos y talento en la mesa compartida + render de las
// vistas de Estudio para un ADMIN (humo). Cubre CRUD con lápidas, el merge
// "lo más reciente por id gana" y que Proyectos/Talento monten sin lanzar.
// =============================================================================

import { installDOM } from "./_dom.mjs";
installDOM();

const store = await import("../src/store.js");
const auth = await import("../src/auth.js");
const { mount } = await import("../src/ui/app.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("studio.test.mjs");

// Pizarra limpia de proyectos/talento.
store.importState(JSON.stringify({ _format: "opportunity-intel/state", projects: [], creatives: [] }), { replace: true });

// — Proyectos: alta, edición, participaciones, borrado con lápida —
const p = store.saveProject({ name: "Clínica Norte", client: "Grupo N", revenue: 12000, costs: 3000, poolPct: 0.4 });
ok(p && p.id && p.revenue === 12000, "saveProject crea con id e importe");
store.saveProject({ id: p.id, participants: [{ name: "Pablo", aportacion: 10, skill: 1, importance: 2 }] });
ok(store.getProjects()[0].participants.length === 1, "se guardan las participaciones");
ok(store.getProjects().length === 1, "el proyecto está vivo");
store.removeProject(p.id);
ok(store.getProjects().length === 0, "removeProject lo oculta (lápida)");
ok(JSON.parse(store.exportState()).projects.some((x) => x.id === p.id && x.deleted), "la lápida se exporta para propagar el borrado");

// — Talento: perfil por nombre (id = minúsculas), edición y merge —
store.saveCreative({ name: "Javi", discipline: "Dirección de arte", skills: ["3D", "branding"], importance: 1.5 });
ok(store.getCreative("javi").skills.length === 2, "saveCreative guarda el perfil por nombre");
ok(store.getCreative("JAVI").discipline === "Dirección de arte", "getCreative no distingue mayúsculas");

// Merge: una versión entrante más reciente gana; una más vieja no pisa.
store.importState(JSON.stringify({ _format: "opportunity-intel/state", creatives: [
  { id: "javi", name: "Javi", discipline: "Nuevo", importance: 3, updatedAt: "2999-01-01T00:00:00.000Z" },
] }), { replace: false });
ok(store.getCreative("javi").discipline === "Nuevo", "el merge adopta la versión más reciente");
store.importState(JSON.stringify({ _format: "opportunity-intel/state", creatives: [
  { id: "javi", name: "Javi", discipline: "Viejo", updatedAt: "2000-01-01T00:00:00.000Z" },
] }), { replace: false });
ok(store.getCreative("javi").discipline === "Nuevo", "una versión más vieja no pisa la más nueva");

// — Render de Estudio para un ADMIN (humo) —
// Siembra una sesión admin directa en localStorage (sin red).
const NS = "oi:";
localStorage.setItem(`${NS}users`, JSON.stringify([
  { name: "Jefa", color: "#cba24a", role: "admin", hash: "x", token: "t-admin" },
  { name: "Vendedor", color: "#3fb950", role: "sales" },
]));
localStorage.setItem(`${NS}session`, JSON.stringify({ name: "Jefa", role: "admin", token: "t-admin" }));
ok(auth.currentRole() === "admin", "sesión admin sembrada");

const root = document.createElement("div");
try {
  await mount(root);
  // Navega a la zona Estudio → Proyectos.
  const byText = (sel, re) => root.querySelectorAll(sel).find((t) => re.test(t.textContent));
  const estudio = byText(".zone", /Estudio/i);
  ok(estudio != null, "el admin ve la zona Estudio");
  if (estudio) {
    estudio.click();
    const proj = byText(".tab", /Proyect/i);
    ok(proj != null, "Estudio ofrece la subpestaña Proyectos");
    if (proj) { proj.click(); ok(root.querySelector(".proj-list") != null, "Proyectos renderiza la lista"); }
    const talent = byText(".tab", /Talento/i);
    if (talent) { talent.click(); ok(root.querySelector(".talent-list") != null, "Talento renderiza el roster"); }
  }
  // El equipo (Usuarios) sigue disponible para el admin.
  const team = byText(".zone", /Equipo/i);
  ok(team != null, "el admin ve la zona Equipo");
} catch (e) { ok(false, "montar/abrir Estudio como admin no debe lanzar: " + e.message); }

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
