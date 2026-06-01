import type { Lang } from "../store/universe";

/** Bilingual UI strings. Translate for meaning, not lexically. */
const S = {
  appName: { en: "Neural Cosmos", es: "Neural Cosmos" },
  navigate: { en: "Navigate", es: "Navegar" },
  move: { en: "Move", es: "Mover" },
  weave: { en: "Weave", es: "Tejer" },
  add: { en: "New body", es: "Cuerpo nuevo" },
  legend: { en: "Legend", es: "Leyenda" },
  inspector: { en: "Inspector", es: "Inspector" },
  loading: { en: "Forming the cosmos…", es: "Formando el cosmos…" },
  retry: { en: "Retry", es: "Reintentar" },
  errorTitle: { en: "The cosmos didn't load", es: "El cosmos no cargó" },
  close: { en: "Close", es: "Cerrar" },
  stage: { en: "Stage", es: "Etapa" },
  kind: { en: "Kind", es: "Tipo" },
  archetype: { en: "Archetype", es: "Arquetipo" },
  energy: { en: "Energy", es: "Energía" },
  color: { en: "Color", es: "Color" },
  advance: { en: "Advance", es: "Avanzar" },
  retreat: { en: "Retreat", es: "Retroceder" },
  enter: { en: "Enter cosmos", es: "Entrar al cosmos" },
  blackhole: { en: "Send to black hole", es: "Al agujero negro" },
  rebirth: { en: "Rebirth", es: "Renacer" },
  docs: { en: "Documents", es: "Documentos" },
  decisions: { en: "Decisions", es: "Decisiones" },
  history: { en: "History", es: "Historial" },
  details: { en: "Details", es: "Detalles" },
  addDoc: { en: "Add document", es: "Añadir documento" },
  addDecision: { en: "Add decision", es: "Añadir decisión" },
  title: { en: "Title", es: "Título" },
  body: { en: "Body", es: "Contenido" },
  rationale: { en: "Rationale", es: "Razonamiento" },
  save: { en: "Save", es: "Guardar" },
  name: { en: "Name", es: "Nombre" },
  create: { en: "Create", es: "Crear" },
  weaveHint: {
    en: "Tap two bodies to thread them",
    es: "Toca dos cuerpos para tejerlos",
  },
  moveHint: { en: "Drag a body to reposition", es: "Arrastra un cuerpo para moverlo" },
  navHint: {
    en: "Tap to inspect · hold to enter",
    es: "Toca para inspeccionar · mantén para entrar",
  },
  threadMeaning: { en: "Thread meaning", es: "Significado del hilo" },
  lifecycle: { en: "Life-cycle", es: "Ciclo de vida" },
  empty: { en: "Nothing here yet.", es: "Aún no hay nada aquí." },
  noChildCosmosLabel: {
    en: "no inner cosmos yet — creating…",
    es: "sin cosmos interno aún — creando…",
  },
  atlasHint: {
    en: "Atlas — intelligence force. Regions ready for analysis.",
    es: "Atlas — fuerza de inteligencia. Regiones listas para análisis.",
  },
} as const;

export type StringKey = keyof typeof S;
export const t = (key: StringKey, lang: Lang): string => S[key][lang];
