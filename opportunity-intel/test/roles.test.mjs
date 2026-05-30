// =============================================================================
// roles.test.mjs — Matriz de permisos RBAC (pura). Cubre los 4 casos exigidos.
// =============================================================================

import { can, isWriter, normalizeRole, roleLabel, ROLES, DEFAULT_ROLE } from "../src/roles.js";

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

// 6. Etiquetas y catálogo.
ok(roleLabel("admin") === "ADMIN" && roleLabel("analyst") === "ANALYST", "etiquetas correctas");
ok(roleLabel("xxx") === "VIEWER", "etiqueta de rol desconocido = VIEWER");
ok(ROLES.length === 4 && DEFAULT_ROLE === "editor", "catálogo de 4 roles, default editor");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
