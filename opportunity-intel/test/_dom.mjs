// =============================================================================
// _dom.mjs — Shim de DOM sin cabeza, cero dependencias, para ui.test.mjs.
//
// Monta un `document`/`window` mínimos pero suficientes para que app.js (y dom.js)
// rendericen el shell, naveguen zonas/subpestañas, abran overlays y disparen
// handlers de click — sin navegador ni jsdom. No pretende ser un DOM completo:
// cubre exactamente la superficie que usa la UI (ver grep en el commit).
//
// Selectores soportados: por clase (.x), por etiqueta (div), id (#x) y combinador
// descendiente con espacios (".subtabs .tab"). querySelectorAll devuelve un Array.
// =============================================================================

class TextNode {
  constructor(text) { this.nodeType = 3; this.data = String(text); this.parentNode = null; }
  get textContent() { return this.data; }
  set textContent(v) { this.data = String(v); }
}

class ClassList {
  constructor(el) { this.el = el; }
  _set() { return new Set((this.el.getAttribute("class") || "").split(/\s+/).filter(Boolean)); }
  _save(s) { this.el.setAttribute("class", [...s].join(" ")); }
  add(...cs) { const s = this._set(); cs.forEach((c) => s.add(c)); this._save(s); }
  remove(...cs) { const s = this._set(); cs.forEach((c) => s.delete(c)); this._save(s); }
  toggle(c, force) { const s = this._set(); const has = s.has(c); const on = force === undefined ? !has : !!force; if (on) s.add(c); else s.delete(c); this._save(s); return on; }
  contains(c) { return this._set().has(c); }
}

class Event {
  constructor(type, opts = {}) {
    this.type = type; this.bubbles = opts.bubbles !== false;
    this.target = null; this.currentTarget = null;
    this._stop = false; this._stopNow = false; this.defaultPrevented = false;
  }
  stopPropagation() { this._stop = true; }
  stopImmediatePropagation() { this._stop = true; this._stopNow = true; }
  preventDefault() { this.defaultPrevented = true; }
}

class El {
  constructor(tag) {
    this.nodeType = 1;
    this.tagName = String(tag || "div").toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.attrs = {};
    this._listeners = {};
    this.style = {};
    this.dataset = {};
    this.value = "";
    this.checked = false;
    this.classList = new ClassList(this);
  }

  // — atributos —
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  get className() { return this.attrs.class || ""; }
  set className(v) { this.attrs.class = String(v); }
  get id() { return this.attrs.id || ""; }
  set id(v) { this.attrs.id = String(v); }

  // — árbol —
  get children() { return this.childNodes.filter((n) => n.nodeType === 1); }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  appendChild(node) { if (node.parentNode) node.parentNode.removeChild(node); node.parentNode = this; this.childNodes.push(node); return node; }
  append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? new TextNode(n) : n); }
  prepend(node) { if (node.parentNode) node.parentNode.removeChild(node); node.parentNode = this; this.childNodes.unshift(node); return node; }
  insertBefore(node, ref) {
    if (node.parentNode) node.parentNode.removeChild(node);
    const i = ref ? this.childNodes.indexOf(ref) : -1;
    if (i < 0) this.childNodes.push(node); else this.childNodes.splice(i, 0, node);
    node.parentNode = this; return node;
  }
  removeChild(node) { const i = this.childNodes.indexOf(node); if (i >= 0) { this.childNodes.splice(i, 1); node.parentNode = null; } return node; }
  replaceChild(neo, old) { const i = this.childNodes.indexOf(old); if (i >= 0) { this.childNodes[i] = neo; neo.parentNode = this; old.parentNode = null; } return old; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }

  // — contenido —
  get textContent() { return this.childNodes.map((n) => n.textContent).join(""); }
  set textContent(v) { this.childNodes = []; if (v !== "" && v != null) this.appendChild(new TextNode(v)); }
  get innerHTML() { return this._html || ""; }
  set innerHTML(html) { this._html = String(html); this.childNodes = []; for (const n of parseHTML(String(html))) this.appendChild(n); }

  // — eventos —
  addEventListener(type, fn) { (this._listeners[type] ||= []).push(fn); }
  removeEventListener(type, fn) { const a = this._listeners[type]; if (a) this._listeners[type] = a.filter((f) => f !== fn); }
  dispatchEvent(ev) {
    ev.target = ev.target || this;
    let node = this;
    while (node) {
      const ls = node._listeners[ev.type];
      if (ls) { ev.currentTarget = node; for (const fn of [...ls]) { try { fn.call(node, ev); } catch (e) { throw e; } if (ev._stopNow) break; } }
      if (ev._stop || ev.bubbles === false) break;
      node = node.parentNode;
    }
    return !ev.defaultPrevented;
  }
  click() { this.dispatchEvent(new Event("click")); }
  focus() {} blur() {} select() {} scrollIntoView() {}

  // — consultas —
  matches(sel) { return matchesAny(this, sel); }
  contains(node) { for (let n = node; n; n = n.parentNode) if (n === this) return true; return false; }
  querySelector(sel) { return queryAll(this, sel)[0] || null; }
  querySelectorAll(sel) { return queryAll(this, sel); }
}

// — Motor de selectores (clase / etiqueta / id / descendiente con espacios) —
function matchesSimple(node, simple) {
  if (!node || node.nodeType !== 1) return false;
  const tokens = simple.match(/[.#]?[\w-]+|\*/g) || [];
  for (const t of tokens) {
    if (t === "*") continue;
    if (t[0] === ".") { if (!node.classList.contains(t.slice(1))) return false; }
    else if (t[0] === "#") { if (node.id !== t.slice(1)) return false; }
    else if (node.tagName.toLowerCase() !== t.toLowerCase()) return false;
  }
  return true;
}
function matchesChain(node, simples) {
  let i = simples.length - 1;
  if (!matchesSimple(node, simples[i])) return false;
  i--;
  let anc = node.parentNode;
  while (i >= 0 && anc) {
    if (anc.nodeType === 1 && matchesSimple(anc, simples[i])) i--;
    anc = anc.parentNode;
  }
  return i < 0;
}
function matchesAny(node, sel) {
  return sel.split(",").map((s) => s.trim().split(/\s+/)).some((sim) => matchesChain(node, sim));
}
function queryAll(root, sel) {
  const groups = sel.split(",").map((s) => s.trim().split(/\s+/).filter(Boolean));
  const out = [];
  const walk = (node) => {
    for (const c of node.childNodes) {
      if (c.nodeType !== 1) continue;
      if (groups.some((g) => matchesChain(c, g))) out.push(c);
      walk(c);
    }
  };
  walk(root);
  return out;
}

// — Parser HTML mínimo: extrae texto y nodos <tag attr="..."> para innerHTML —
const VOID = new Set(["br", "img", "hr", "input", "meta", "link"]);
function parseHTML(html) {
  const out = []; const stack = []; const top = () => stack[stack.length - 1];
  const push = (n) => { (top() ? top().childNodes : out).push(n); if (top()) n.parentNode = top(); };
  const re = /<\/?([a-zA-Z0-9]+)((?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[3] != null) { const txt = m[3].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); if (txt) push(new TextNode(txt)); continue; }
    const tag = m[1].toLowerCase(); const closing = m[0][1] === "/";
    if (closing) { if (top() && top().tagName.toLowerCase() === tag) stack.pop(); continue; }
    const el = new El(tag);
    const attrRe = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g; let a;
    while ((a = attrRe.exec(m[2] || ""))) el.setAttribute(a[1], a[2] ?? a[3] ?? a[4] ?? "");
    push(el);
    if (!VOID.has(tag) && m[0][m[0].length - 2] !== "/") stack.push(el);
  }
  return out;
}

// — Document / Window globales —
export function installDOM() {
  const documentElement = new El("html");
  const body = new El("body");
  const head = new El("head");
  documentElement.appendChild(head);
  documentElement.appendChild(body);

  const document = {
    documentElement, body, head,
    createElement: (t) => new El(t),
    createTextNode: (t) => new TextNode(t),
    createDocumentFragment: () => new El("fragment"),
    _listeners: {},
    addEventListener(type, fn) { (this._listeners[type] ||= []).push(fn); },
    removeEventListener(type, fn) { const a = this._listeners[type]; if (a) this._listeners[type] = a.filter((f) => f !== fn); },
    dispatchEvent(ev) { ev.target = ev.target || document; for (const fn of [...(this._listeners[ev.type] || [])]) fn.call(document, ev); return true; },
    querySelector(sel) { return queryAll(documentElement, sel)[0] || null; },
    querySelectorAll(sel) { return queryAll(documentElement, sel); },
    getElementById(id) { return queryAll(documentElement, "#" + id)[0] || null; },
  };

  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };

  const location = { href: "https://test.local/", search: "", hash: "", pathname: "/", reload() {}, assign() {}, replace() {} };
  const win = {
    document, localStorage, location,
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    scrollTo() {}, alert() {}, confirm: () => true, prompt: () => null,
  };
  win.window = win; win.self = win; win.globalThis = globalThis;

  const g = globalThis;
  g.window = win;
  g.document = document;
  g.localStorage = localStorage;
  g.location = location;
  try { if (!g.navigator) g.navigator = { userAgent: "node-dom-shim", language: "es", clipboard: { writeText: async () => {} } }; } catch { /* navigator es solo-lectura en Node: ya existe, sirve */ }
  g.Event = Event;
  g.Node = El;
  g.HTMLElement = El;
  g.requestAnimationFrame = win.requestAnimationFrame;
  g.cancelAnimationFrame = win.cancelAnimationFrame;
  g.getComputedStyle = win.getComputedStyle;
  g.matchMedia = win.matchMedia;
  if (typeof g.alert !== "function") g.alert = win.alert;
  if (typeof g.confirm !== "function") g.confirm = win.confirm;
  if (typeof g.prompt !== "function") g.prompt = win.prompt;

  return { document, window: win };
}
