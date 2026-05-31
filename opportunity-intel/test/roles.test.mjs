// =============================================================================
// roles.test.mjs — Matriz de permisos RBAC (pura). Cubre los 4 casos exigidos.
// =============================================================================

import { can, isWriter, normalizeRole, roleLabel, roleRank, ROLES, DEFAULT_ROLE } from "../src/roles.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("roles.test.mjs");

// 1. VIEWER no puede mutar lead/CRM (solo lectura + estadísticas).
ok(!can("viewer", "write"), "viewer NO puede escribir (mutar la mesa)");
ok(!can("viewer", "crm"), "viewer NO puede mover el CRM");
ok(!can("viewer", "discover"), "viewer NO puede descubrir");
ok(!can("viewer", "enrich"), "viewer NO puede enriquecer");
ok(!can("viewer", "export"), "viewer NO puede exportar");
ok(can("viewer", "read"), "viewer SÍ puede leer");
ok(can("viewer", "stats"), "viewer SÍ ve estadísticas");
ok(!isWriter("viewer"), "isWriter(viewer) = false");

// 2. EDITOR opera leads/CRM pero no gobierna usuarios/roles/secretos.
ok(can("editor", "write"), "editor SÍ puede escribir");
ok(can("editor", "crm"), "editor SÍ mueve el CRM");
ok(can("editor", "discover") && can("editor", "enrich"), "editor SÍ descubre y enriquece");
ok(can("editor", "followup") && can("editor", "close"), "editor SÍ hace follow-ups y cierres");
ok(can("editor", "export"), "editor SÍ exporta");
ok(!can("editor", "manage_users"), "editor NO gestiona usuarios");
ok(!can("editor", "manage_roles"), "editor NO cambia roles");
ok(!can("editor", "secrets"), "editor NO toca secretos");
ok(!can("editor", "calibration"), "editor NO toca calibración crítica");
ok(!can("editor", "hard_delete"), "editor NO borra en duro");
ok(isWriter("editor"), "isWriter(editor) = true");

// 3. ADMIN gobierna: roles, borrado duro, export, usuarios, secretos, todo.
ok(can("admin", "manage_roles"), "admin SÍ cambia roles");
ok(can("admin", "manage_users"), "admin SÍ gestiona usuarios");
ok(can("admin", "hard_delete"), "admin SÍ borra en duro");
ok(can("admin", "export"), "admin SÍ exporta");
ok(can("admin", "secrets") && can("admin", "calibration"), "admin SÍ secretos y calibración");
ok(can("admin", "write") && can("admin", "crm"), "admin SÍ escribe y mueve CRM");
ok(can("admin", "audit"), "admin SÍ ve auditoría");

// 4. ANALYST ve/exporta estadísticas y auditoría, pero no edita CRM.
ok(can("analyst", "read"), "analyst SÍ lee");
ok(can("analyst", "stats"), "analyst SÍ ve estadísticas");
ok(can("analyst", "export"), "analyst SÍ exporta");
ok(can("analyst", "audit"), "analyst SÍ ve auditoría");
ok(!can("analyst", "write"), "analyst NO escribe (no edita CRM)");
ok(!can("analyst", "crm"), "analyst NO mueve el CRM");
ok(!can("analyst", "manage_roles"), "analyst NO cambia roles");
ok(!isWriter("analyst"), "isWriter(analyst) = false");

// 5. Robustez: rol desconocido cae al más restrictivo (viewer).
ok(normalizeRole("superuser") === "viewer", "rol desconocido → viewer");
ok(normalizeRole("admin") === "admin", "rol conocido se mantiene");
ok(!can("superuser", "write"), "rol inventado no puede escribir");
ok(!can(undefined, "write"), "rol indefinido no puede escribir");
ok(can(undefined, "read"), "rol indefinido aún puede leer (viewer)");

// 6. SALES (vendedor): opera y cierra, mete proyectos, invita; NO define reparto.
ok(can("sales", "write") && can("sales", "crm") && can("sales", "close"), "sales SÍ opera y cierra");
ok(can("sales", "projects") && can("sales", "projects_view"), "sales SÍ crea/ve proyectos");
ok(can("sales", "invite"), "sales SÍ invita");
ok(!can("sales", "reparto"), "sales NO define el reparto");
ok(!can("sales", "manage_talent"), "sales NO gestiona talento");
ok(!can("sales", "manage_roles"), "sales NO cambia roles");
ok(isWriter("sales"), "isWriter(sales) = true");

// 7. HR (recursos humanos): personas, talento y reparto; NO opera el pipeline.
ok(can("hr", "reparto"), "hr SÍ define el reparto");
ok(can("hr", "manage_talent"), "hr SÍ gestiona el talento");
ok(can("hr", "invite"), "hr SÍ invita");
ok(can("hr", "projects_view"), "hr SÍ ve la economía");
ok(can("hr", "stats") && can("hr", "export"), "hr SÍ estadísticas y export");
ok(!can("hr", "write") && !can("hr", "crm"), "hr NO opera la mesa/CRM");
ok(!can("hr", "projects"), "hr NO fija importes (eso es de ventas/admin)");
ok(!can("hr", "manage_roles"), "hr NO concede roles (evita escalada)");
ok(!isWriter("hr"), "isWriter(hr) = false");

// 8. Capa de agencia y restricciones cruzadas.
ok(can("admin", "reparto") && can("admin", "manage_talent") && can("admin", "projects"), "admin SÍ toda la capa de agencia");
ok(!can("editor", "projects_view"), "editor NO ve la economía (foco en producir)");
ok(can("analyst", "projects_view") && !can("analyst", "projects"), "analyst VE economía pero NO la edita");
ok(!can("viewer", "projects_view"), "viewer NO ve la economía");

// 9. Jerarquía por importancia (admin manda; viewer al fondo).
ok(roleRank("admin") > roleRank("hr"), "admin por encima de hr");
ok(roleRank("hr") >= roleRank("editor") && roleRank("sales") >= roleRank("editor"), "hr/sales por encima de editor");
ok(roleRank("editor") > roleRank("analyst") && roleRank("analyst") > roleRank("viewer"), "editor > analyst > viewer");
ok(roleRank("desconocido") === roleRank("viewer"), "rol desconocido pesa como viewer");

// 10. Etiquetas y catálogo.
ok(roleLabel("admin") === "ADMIN" && roleLabel("analyst") === "ANALYST", "etiquetas correctas");
ok(roleLabel("hr") === "RR. HH." && roleLabel("sales") === "VENTAS", "etiquetas de los roles nuevos");
ok(roleLabel("xxx") === "VIEWER", "etiqueta de rol desconocido = VIEWER");
ok(ROLES.length === 6 && DEFAULT_ROLE === "editor", "catálogo de 6 roles, default editor");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
