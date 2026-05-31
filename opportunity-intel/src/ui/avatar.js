// =============================================================================
// avatar.js — Motor de personalización del perfil (Connect).
//
// Da a cada usuario un avatar propio y vivo: foto (subida y centrada en este
// dispositivo), o cualquier emoji de tu teclado, o un símbolo geométrico; con
// color de fondo, color del símbolo y un efecto. Es más rico que el "avatar"
// de 8 caracteres que viaja al servidor — por eso la parte pesada (foto, fondo,
// efecto, encuadre) vive SOLO en este dispositivo (localStorage, como las notas
// privadas), sin subir ninguna foto a ningún servidor. Lo ligero (el emoji o el
// símbolo elegido) sí sincroniza por el campo `avatar` de siempre, para que tus
// compañeros te reconozcan en sus pantallas.
//
// Diseño honesto: para OTRO usuario solo conocemos lo que el servidor comparte
// (nombre, color de firma, emoji). Para TI, el perfil local completo.
// =============================================================================

import { el } from "./dom.js";

// — Almacén local del perfil enriquecido (por usuario, este dispositivo) ——————
const KEY = (name) => `oi:profile:${String(name || "").trim().toLowerCase()}`;

/** Lee el perfil enriquecido local (o {} si no hay / no se puede). */
export function getProfile(name) {
  try { return JSON.parse(localStorage.getItem(KEY(name)) || "null") || {}; }
  catch { return {}; }
}
/** Mezcla y guarda un parche en el perfil local. Devuelve el perfil resultante. */
export function saveProfile(name, patch) {
  const p = { ...getProfile(name), ...patch };
  try { localStorage.setItem(KEY(name), JSON.stringify(p)); } catch { /* cuota */ }
  return p;
}

// — Biblioteca de símbolos geométricos (nivel ejecutivo, sobrios) ——————————————
export const SYMBOLS = [
  "◆", "◇", "◈", "❖", "✦", "✧", "★", "☆", "▲", "△", "▼", "▽",
  "●", "○", "◉", "◎", "■", "□", "◼", "◻", "⬢", "⬡", "⬣", "⬟",
  "⚡", "✺", "✹", "✸", "❂", "✚", "✜", "❉", "❋", "⟡", "⟐", "◬",
];

// — Paleta de fondos: sólidos vivos + degradados (creatividad, no sólo firma) ——
export const SOLIDS = [
  "#4a9eff", "#3fb950", "#c9a227", "#8b7bd8", "#f0883e", "#ec6cb9",
  "#2dd4bf", "#f04747", "#0e0f12", "#5b6472", "#e6c200", "#ff5c8a",
  "#22c55e", "#0ea5e9", "#a855f7", "#fb7185", "#14b8a6", "#f59e0b",
];
export const GRADIENTS = [
  "linear-gradient(135deg,#f0883e,#ec6cb9)",
  "linear-gradient(135deg,#4a9eff,#8b7bd8)",
  "linear-gradient(135deg,#2dd4bf,#3fb950)",
  "linear-gradient(135deg,#c9a227,#f04747)",
  "linear-gradient(135deg,#0ea5e9,#a855f7)",
  "linear-gradient(135deg,#fb7185,#f59e0b)",
  "linear-gradient(160deg,#1f2430,#3a4356)",
  "radial-gradient(circle at 30% 30%,#8b7bd8,#0e0f12)",
];

// — Efectos del avatar (se aplican con clases CSS; "infinitos" por combinación) —
export const EFFECTS = [
  { key: "none", label: "Liso" },
  { key: "ring", label: "Anillo" },
  { key: "glow", label: "Halo" },
  { key: "pulse", label: "Latido" },
  { key: "relief", label: "Relieve" },
  { key: "stroke", label: "Borde" },
];

// — Emojis por categorías (como el teclado de WhatsApp) + buscador ——————————————
// Cada item: [emoji, "palabras clave para buscar"]. Curado y amplio; para lo que
// falte, el panel ofrece un campo libre donde pegar CUALQUIER emoji de tu móvil.
export const EMOJI_CATEGORIES = [
  { key: "caras", label: "Caras", icon: "😀", items: [
    ["😀","feliz sonrisa grin"],["😄","risa feliz"],["😁","sonrisa dientes"],["😆","risa carcajada"],
    ["😅","risa sudor nervios"],["😂","llorar risa lol"],["🤣","carcajada suelo"],["🙂","leve sonrisa"],
    ["😉","guino ojo"],["😊","ruborizado feliz"],["😇","angel santo"],["🥰","amor corazones"],
    ["😍","enamorado ojos corazon"],["😘","beso"],["😋","delicioso lengua"],["😎","gafas cool sol"],
    ["🤩","estrella alucina wow"],["🥳","fiesta celebracion"],["🤔","pensar duda"],["🤨","ceja escepticismo"],
    ["😐","neutral serio"],["😏","picaro sonrisa"],["😬","mueca incomodo"],["🙄","ojos blanco harto"],
    ["😴","dormir sueno"],["🤯","explota mente wow"],["😱","grito miedo"],["🥵","calor sudor"],
    ["🥶","frio hielo"],["😤","resoplar enfado"],["😢","triste lagrima"],["😭","llorar fuerte"],
    ["😡","enfado rojo ira"],["🤬","insulto enfado"],["🤗","abrazo"],["🤫","silencio shh"],
    ["🫡","saludo militar respeto"],["🥲","lagrima sonrisa"],["😶‍🌫️","niebla nube"],["🤤","baba antojo"],
  ]},
  { key: "gestos", label: "Gestos", icon: "👍", items: [
    ["👍","bien like pulgar arriba"],["👎","mal dislike pulgar abajo"],["👌","ok perfecto"],["✌️","paz victoria"],
    ["🤞","suerte cruzar dedos"],["🤝","trato acuerdo mano"],["👏","aplauso bravo"],["🙌","celebrar manos arriba"],
    ["🙏","gracias rezar favor"],["💪","fuerza musculo"],["🫶","amor manos corazon"],["👋","hola adios saludo"],
    ["🤙","llamame surf"],["✊","puno fuerza"],["👊","puneta golpe"],["🫰","dinero dedos amor"],
    ["☝️","arriba indice"],["👆","arriba senalar"],["👇","abajo senalar"],["👉","derecha senalar"],
    ["🖐️","mano cinco"],["✋","alto mano"],["🤲","ofrecer manos"],["🫵","tu senalar"],
  ]},
  { key: "personas", label: "Personas", icon: "🧑", items: [
    ["🧑‍💻","programador tech ordenador"],["👨‍💻","programador hombre"],["👩‍💻","programadora mujer"],["🧑‍🎨","artista diseno"],
    ["🧑‍🚀","astronauta espacio"],["🦸","superheroe"],["🧑‍🍳","cocinero chef"],["🕵️","detective espia"],
    ["🤵","traje elegante"],["👔","corbata negocio"],["🧠","cerebro mente inteligencia"],["👁️","ojo ver"],
    ["🦾","brazo robot biónico"],["🤖","robot ia bot"],["👤","silueta usuario anonimo"],["👥","usuarios equipo"],
  ]},
  { key: "animales", label: "Animales", icon: "🐬", items: [
    ["🐬","delfin eco"],["🐋","ballena connect"],["🐳","ballena chorro"],["🦈","tiburon"],
    ["🦅","aguila ave"],["🦉","buho sabio"],["🦊","zorro"],["🐺","lobo"],
    ["🦁","leon"],["🐯","tigre"],["🐻","oso"],["🐼","panda"],
    ["🐉","dragon"],["🦄","unicornio"],["🐝","abeja"],["🦋","mariposa"],
    ["🦜","loro ave color"],["🦚","pavo real"],["🐢","tortuga"],["🐙","pulpo"],
    ["🦂","escorpion"],["🦓","cebra"],["🦌","ciervo"],["🐈","gato"],
  ]},
  { key: "comida", label: "Comida", icon: "🍣", items: [
    ["🍣","sushi japones"],["🍜","ramen sopa"],["🍕","pizza"],["🍔","hamburguesa"],
    ["🌮","taco"],["🥑","aguacate"],["🍷","vino copa"],["🍸","cocktail copa"],
    ["🍹","cocktail tropical"],["🥂","brindis champan"],["☕","cafe"],["🍫","chocolate"],
    ["🍓","fresa"],["🍋","limon"],["🌶️","picante chile"],["🧉","mate infusion"],
  ]},
  { key: "actividad", label: "Activos", icon: "🚀", items: [
    ["🚀","cohete lanzar despegue"],["🔥","fuego fire tendencia"],["⚡","rayo energia"],["✨","brillo magia"],
    ["💡","idea bombilla"],["🎯","diana objetivo foco"],["🏆","trofeo ganar"],["🥇","oro medalla"],
    ["📈","subida grafico crecer"],["💰","dinero saco"],["💎","diamante premium"],["🧩","pieza puzzle"],
    ["🛠️","herramientas construir"],["⚙️","engranaje config"],["🧪","laboratorio probeta"],["🔭","telescopio vision"],
    ["🎨","arte paleta"],["🎬","cine claqueta direccion"],["📡","antena senal radar"],["🛰️","satelite"],
    ["⏱️","cronometro tiempo"],["🗝️","llave clave"],["🧭","brujula direccion"],["🌐","mundo web global"],
  ]},
  { key: "simbolos", label: "Símbolos", icon: "💠", items: [
    ["💠","diamante azul"],["🔷","rombo azul"],["🔶","rombo naranja"],["🔱","tridente"],
    ["⭐","estrella"],["🌟","estrella brillo"],["💫","mareo estrella"],["❤️","corazon rojo"],
    ["🧡","corazon naranja"],["💛","corazon amarillo"],["💚","corazon verde"],["💙","corazon azul"],
    ["💜","corazon morado"],["🖤","corazon negro"],["🤍","corazon blanco"],["♾️","infinito"],
    ["✅","check ok"],["☑️","casilla check"],["⚜️","flor lis heraldica"],["♻️","reciclar"],
  ]},
  { key: "naturaleza", label: "Cielo", icon: "🌙", items: [
    ["🌙","luna noche"],["🌕","luna llena"],["☀️","sol dia"],["🌈","arcoiris"],
    ["🌊","ola mar"],["🏔️","montana nieve"],["🌋","volcan"],["🪐","planeta saturno"],
    ["🌍","tierra mundo"],["🌌","galaxia via lactea"],["❄️","copo nieve frio"],["🍃","hoja viento"],
  ]},
];

/** Aplana todos los emojis a [emoji, keywords] para el buscador. */
export function allEmojis() {
  return EMOJI_CATEGORIES.flatMap((c) => c.items);
}

// — Luminancia: elige texto negro/blanco legible sobre un color sólido ————————
function lum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
const isSolidHex = (v) => /^#?[0-9a-f]{6}$/i.test(String(v || "").trim());
export function autoFg(bg) {
  if (!isSolidHex(bg)) return "#ffffff"; // degradados: blanco por defecto
  return lum(bg) > 0.62 ? "#0e0f12" : "#ffffff";
}

/**
 * Resuelve la "ficha de pintado" del avatar de un usuario.
 * @param {{name,color,avatar}} user
 * @param {{self?:boolean}} opts  self=true → usa el perfil local completo (tú).
 */
export function avatarSpec(user, { self = false } = {}) {
  const name = user?.name || "?";
  const initial = (name[0] || "?").toUpperCase();
  const sig = user?.color || "#4a9eff";
  if (self) {
    const p = getProfile(name);
    const glyph = (p.glyph != null ? p.glyph : (user?.avatar || "")) || "";
    const hasPhoto = p.mode === "photo" && p.photo;
    const bg = p.bg || sig;
    return {
      mode: hasPhoto ? "photo" : (glyph ? "glyph" : "initial"),
      glyph, photo: p.photo || "",
      pos: p.pos || { x: 50, y: 50, scale: 1 },
      bg, fg: p.fg || autoFg(bg),
      effect: p.effect || "none",
      initial, sig,
    };
  }
  // Otro usuario: solo lo que el servidor comparte (emoji/símbolo + color firma).
  const glyph = user?.avatar || "";
  return {
    mode: glyph ? "glyph" : "initial", glyph, photo: "",
    pos: { x: 50, y: 50, scale: 1 },
    bg: sig, fg: autoFg(sig), effect: "none", initial, sig,
  };
}

/**
 * Construye el nodo del avatar a partir de una ficha. Tamaño en px.
 * Un único renderizador para cabecera, perfil, equipo y entrada — coherente.
 */
export function avatarNode(spec, size = 22, extraClass = "") {
  const fx = spec.effect && spec.effect !== "none" ? ` av-fx-${spec.effect}` : "";
  const node = el("span", { class: `av${fx}${extraClass ? " " + extraClass : ""}` });
  const styles = [
    `width:${size}px`, `height:${size}px`, `border-radius:50%`,
    `display:flex`, `align-items:center`, `justify-content:center`,
    `flex:0 0 auto`, `overflow:hidden`, `position:relative`,
    `font-size:${Math.round(size * 0.5)}px`, `font-weight:800`, `line-height:1`,
    `background:${spec.bg}`,
  ];
  if (isSolidHex(spec.bg)) styles.push(`--av:${spec.bg}`);
  if (spec.mode === "photo" && spec.photo) {
    const sc = (spec.pos?.scale || 1) * 100;
    styles.push(
      `background-image:url(${spec.photo})`,
      `background-size:${sc}%`,
      `background-position:${spec.pos?.x ?? 50}% ${spec.pos?.y ?? 50}%`,
      `background-repeat:no-repeat`,
    );
  } else {
    styles.push(`color:${spec.fg}`);
    node.textContent = spec.glyph || spec.initial;
  }
  node.setAttribute("style", styles.join(";"));
  return node;
}

/** Atajo: nodo del avatar del usuario actual (perfil local completo). */
export function selfAvatarNode(user, size = 22, extraClass = "") {
  return avatarNode(avatarSpec(user, { self: true }), size, extraClass);
}
