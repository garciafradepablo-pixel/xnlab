// =============================================================================
// roles.js — Modelo de roles y permisos (RBAC), fuente única de verdad.
//
// Primera capa RBAC, sólida y testeable. La MISMA matriz se replica en las Edge
// Functions (servidor) para que el refuerzo no dependa de ocultar botones: el
// cliente esconde lo que no puedes hacer (UX), pero el servidor devuelve 403 si
// tu rol no tiene el permiso (seguridad real).
//
// Seis roles, jerarquizados por importancia (no todos acceden a lo mismo ni
// tienen la misma "ventana de trabajo personal"):
//   admin   — gobierna: usuarios, roles, secretos, calibración, borrado, TODO.
//   hr      — recursos humanos: personas, talento y COMPENSACIÓN (define el
//             reparto), invita creativos; ve la economía. No opera el pipeline.
//   sales   — vendedor: opera y CIERRA (leads, CRM, discovery, follow-ups),
//             mete proyectos con su importe; invita. No define el reparto.
//   editor  — opera/produce: leads, CRM, discovery, enriquecimiento, cierres.
//   analyst — calificador/informativo: lectura + estadísticas + export +
//             auditoría + ve la economía. No edita nada.
//   viewer  — solo lectura: ranking, dossier, evidencias, estadísticas.
//
// Acciones (capabilities). "write" es la llave maestra de mutación de la mesa
// compartida (CRM, notas, verificaciones, leads): el servidor la exige para
// aceptar un `save`. Capas del sistema de agencia:
//   projects_view — ver proyectos y su economía (márgenes, reparto).
//   projects      — crear/editar proyectos (importe, costes, cliente).
//   reparto       — definir el reparto: pool, participaciones, compensación.
//   manage_talent — gestionar el talento (perfiles de creativos, captación).
//   invite        — generar enlaces de invitación (acoger gente nueva).
// =============================================================================

export const ROLES = ["admin", "hr", "sales", "editor", "analyst", "viewer"];
export const DEFAULT_ROLE = "editor"; // equipo pequeño y de confianza; admin puede bajar
export const FALLBACK_ROLE = "viewer"; // rol desconocido → el más restrictivo

export const ROLE_LABEL = {
  admin: "ADMIN",
  hr: "RR. HH.",
  sales: "VENTAS",
  editor: "EDITOR",
  analyst: "ANALYST",
  viewer: "VIEWER",
};

// Descripción corta (para el selector de rol — diferencia su alcance).
export const ROLE_DESC = {
  admin: "Gobierna todo: equipo, roles, economía y reparto.",
  hr: "Personas, talento y reparto. Invita y compensa.",
  sales: "Vende y cierra. Mete proyectos e invita.",
  editor: "Produce: leads, CRM, descubrimiento y cierres.",
  analyst: "Lectura, estadísticas y auditoría. No edita.",
  viewer: "Solo lectura del estado y las estadísticas.",
};

// Jerarquía por importancia (mayor = más arriba). Ordena badges y listas, y
// sirve de peso por defecto para la importancia en el reparto.
export const RANK = { admin: 100, hr: 70, sales: 70, editor: 50, analyst: 30, viewer: 10 };

// Matriz rol × capacidad. Mantener en paralelo con la copia de las Edge Functions.
const MATRIX = {
  admin: [
    "read", "write", "crm", "discover", "enrich", "followup", "close",
    "export", "stats", "manage_users", "manage_roles", "secrets",
    "calibration", "hard_delete", "audit",
    "projects_view", "projects", "reparto", "manage_talent", "invite",
  ],
  hr: [
    "read", "stats", "export", "audit",
    "projects_view", "reparto", "manage_talent", "invite",
  ],
  sales: [
    "read", "write", "crm", "discover", "enrich", "followup", "close",
    "export", "stats", "projects_view", "projects", "invite",
  ],
  editor: [
    "read", "write", "crm", "discover", "enrich", "followup", "close",
    "export", "stats",
  ],
  analyst: ["read", "stats", "export", "audit", "projects_view"],
  viewer: ["read", "stats"],
};

const SETS = Object.fromEntries(Object.entries(MATRIX).map(([r, caps]) => [r, new Set(caps)]));

/** Normaliza un rol entrante a uno conocido (desconocido → viewer). */
export function normalizeRole(role) {
  return ROLES.includes(role) ? role : FALLBACK_ROLE;
}

/** Importancia/jerarquía del rol (mayor = más arriba). Desconocido → viewer. */
export function roleRank(role) {
  return RANK[normalizeRole(role)] ?? RANK.viewer;
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
