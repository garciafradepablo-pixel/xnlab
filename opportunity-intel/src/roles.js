// =============================================================================
// roles.js — Modelo de roles y permisos (RBAC), fuente única de verdad.
//
// Primera capa RBAC, sólida y testeable. La MISMA matriz se replica en las Edge
// Functions (servidor) para que el refuerzo no dependa de ocultar botones: el
// cliente esconde lo que no puedes hacer (UX), pero el servidor devuelve 403 si
// tu rol no tiene el permiso (seguridad real).
//
// Cuatro roles:
//   admin   — gobierna: usuarios, roles, secretos, calibración crítica, borrado.
//   editor  — opera: leads, CRM, discovery, enriquecimiento, follow-ups, cierres.
//   viewer  — solo lectura: ranking, dossier, evidencias, playbook, estadísticas.
//   analyst — lectura + estadísticas + export + auditoría. No edita CRM.
//
// Acciones (capabilities). "write" es la llave maestra de mutación de la mesa
// compartida (CRM, notas, verificaciones, leads): el servidor la exige para
// aceptar un `save` del estado compartido.
// =============================================================================

export const ROLES = ["admin", "editor", "viewer", "analyst"];
export const DEFAULT_ROLE = "editor"; // equipo pequeño y de confianza; admin puede bajar
export const FALLBACK_ROLE = "viewer"; // rol desconocido → el más restrictivo

export const ROLE_LABEL = {
  admin: "ADMIN",
  editor: "EDITOR",
  viewer: "VIEWER",
  analyst: "ANALYST",
};

// Matriz rol × capacidad. Mantener en paralelo con la copia de las Edge Functions.
const MATRIX = {
  admin: [
    "read", "write", "crm", "discover", "enrich", "followup", "close",
    "export", "stats", "manage_users", "manage_roles", "secrets",
    "calibration", "hard_delete", "audit",
  ],
  editor: [
    "read", "write", "crm", "discover", "enrich", "followup", "close",
    "export", "stats",
  ],
  viewer: ["read", "stats"],
  analyst: ["read", "stats", "export", "audit"],
};

const SETS = Object.fromEntries(Object.entries(MATRIX).map(([r, caps]) => [r, new Set(caps)]));

/** Normaliza un rol entrante a uno conocido (desconocido → viewer). */
export function normalizeRole(role) {
  return ROLES.includes(role) ? role : FALLBACK_ROLE;
}

/** ¿Puede `role` ejecutar `action`? Rol desconocido cae a viewer (restrictivo). */
export function can(role, action) {
  const set = SETS[role] || SETS[FALLBACK_ROLE];
  return set.has(action);
}

/** Atajo: ¿el rol puede mutar la mesa compartida (CRM/leads/notas/verif.)? */
export function isWriter(role) {
  return can(role, "write");
}

/** Etiqueta visible del rol (para el badge). */
export function roleLabel(role) {
  return ROLE_LABEL[role] || ROLE_LABEL[FALLBACK_ROLE];
}
