// =============================================================================
// customsectors.js — Sectores definibles desde la app (Fase 8).
//
// El usuario puede crear sectores nuevos (tatuaje, música, fitness…) sin tocar
// código. Cada sector custom lleva: clave, etiqueta, consultas de descubrimiento
// (para que el agente sepa qué buscar) y una lente (qué filtros pesan más).
//
// Se guardan en localStorage y se fusionan con los 4 sectores base en tiempo de
// ejecución. La lente custom alimenta el mismo motor de scoring que las base, y
// las consultas alimentan al agente — versatilidad total, sin desplegar.
// =============================================================================

import { SECTORS } from "./models.js";
import { FILTER_KEYS } from "./models.js";

const NS = "oi:";
const KEY = `${NS}customSectors`;

const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };

function read() { try { const r = storage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function write(v) { try { storage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } }

// Clave url-safe a partir de la etiqueta ("Tatuaje premium" → "tatuaje-premium").
function slugify(label) {
  return String(label || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || `sector-${Date.now().toString(36)}`;
}

const flatLens = () => Object.fromEntries(FILTER_KEYS.map((k) => [k, 1]));

/** @returns {Array<{key,label,custom:true,queries:string[],lens:object}>} */
export function getCustomSectors() {
  return read().map((s) => ({ ...s, custom: true }));
}

/** Todos los sectores: base + custom (sin duplicar clave). */
export function allSectors() {
  const base = SECTORS.map((s) => ({ ...s, custom: false }));
  const keys = new Set(base.map((s) => s.key));
  return [...base, ...getCustomSectors().filter((s) => !keys.has(s.key))];
}

export function sectorByKey(key) {
  return allSectors().find((s) => s.key === key) || null;
}

/**
 * Crea un sector custom.
 * @param {string} label    nombre visible (ej. "Tatuaje")
 * @param {string[]} queries consultas de descubrimiento (ej. ["estudio tatuaje","tattoo studio"])
 * @param {object} [lens]    multiplicadores por filtro (1.0 = normal); opcional
 * @returns {{ok, error?, key?}}
 */
export function addCustomSector(label, queries = [], lens = null) {
  const name = String(label || "").trim();
  if (name.length < 2) return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  const key = slugify(name);
  const existing = allSectors();
  if (existing.some((s) => s.key === key)) return { ok: false, error: "Ya existe un sector con ese nombre." };
  const cleanQueries = (Array.isArray(queries) ? queries : String(queries).split(","))
    .map((q) => String(q).trim()).filter(Boolean).slice(0, 6);
  const cleanLens = lens && typeof lens === "object" ? { ...flatLens(), ...lens } : flatLens();
  const all = read();
  all.push({ key, label: name, queries: cleanQueries.length ? cleanQueries : [name], lens: cleanLens });
  write(all);
  return { ok: true, key };
}

export function removeCustomSector(key) {
  write(read().filter((s) => s.key !== key));
}

/** Consultas de descubrimiento de un sector (base no tiene; custom sí). */
export function queriesFor(key) {
  const s = getCustomSectors().find((x) => x.key === key);
  return s ? s.queries : null;
}

/** Lente de un sector custom (o null si es base/no existe). */
export function customLensFor(key) {
  const s = getCustomSectors().find((x) => x.key === key);
  return s ? s.lens : null;
}
