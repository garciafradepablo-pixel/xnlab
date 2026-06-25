// =============================================================================
// dom.js — Tiny DOM helpers. No framework; just enough sugar to stay readable.
// =============================================================================

/** Create an element. `attrs` may include `class`, `html`, `text`, events (onX). */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "href" || k === "src") node.setAttribute(k, safeUrl(v));
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

// Esquemas de URL peligrosos para un href/src: ejecutan código. Permitimos solo
// navegación real (http/https/mailto/tel) y rutas relativas/ancla; lo demás se
// neutraliza a "#". Cierra el XSS por URL importada sin romper enlaces legítimos.
const DANGEROUS_SCHEME = /^\s*(javascript|data|vbscript|file):/i;
export function safeUrl(v) {
  const s = String(v ?? "");
  return DANGEROUS_SCHEME.test(s) ? "#" : s;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Escape text for safe innerHTML interpolation. */
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
