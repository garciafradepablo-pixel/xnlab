// =============================================================================
// macma-engine.js — MACMA CORE · el motor de lectura. PURO (sin DOM, sin red).
//
// Lee la materia prima (biografía, conflictos) y devuelve un MODELO: diez
// dimensiones puntuadas, patrones observados, el análisis de un conflicto y el
// reto del día. Hoy es heurística — léxicos y plantillas. Mañana es IA: la forma
// de la salida ya está pensada para que un modelo la rellene sin tocar la UI.
// Los puntos de cambio están marcados con // [IA].
//
// REGLA CRÍTICA (no negociable): esto NUNCA afirma una verdad sobre la persona.
// No diagnostica. Habla de "patrones observados", "tendencias", "lecturas",
// "probables fortalezas", "riesgos potenciales". El sistema ayuda a reflexionar;
// no define la identidad. Toda copia que salga de aquí respeta ese registro.
// =============================================================================

// Las diez dimensiones del orbe. `key` es estable; `label` es lo que se ve.
export const DIMENSIONS = [
  { key: "vision",        label: "Visión",                short: "VIS" },
  { key: "execution",     label: "Ejecución",             short: "EJE" },
  { key: "communication", label: "Comunicación",          short: "COM" },
  { key: "leadership",    label: "Liderazgo",             short: "LID" },
  { key: "resilience",    label: "Resiliencia",           short: "RES" },
  { key: "creativity",    label: "Creatividad",           short: "CRE" },
  { key: "emotional",     label: "Regulación emocional",  short: "EMO" },
  { key: "discipline",    label: "Disciplina",            short: "DIS" },
  { key: "learning",      label: "Velocidad de aprendizaje", short: "APR" },
  { key: "conflict",      label: "Gestión de conflictos", short: "CON" },
];
export const DIM_BY_KEY = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d]));

// Normaliza: minúsculas, sin acentos. Para casar léxico sin pelearse con tildes.
function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Léxico por dimensión: señales en español. No pretende ser exhaustivo — es un
// proxy honesto mientras no haya IA. Cada acierto suma evidencia para esa lectura.
const LEXICON = {
  vision:        ["vision", "futuro", "estrategia", "direccion", "proposito", "rumbo", "largo plazo", "imaginar", "anticipar", "donde voy", "objetivo", "meta", "construir", "mision"],
  execution:     ["ejecutar", "entregar", "lanzar", "terminar", "rapido", "hecho", "shippear", "envie", "cerre", "construi", "hice", "monte", "puse en marcha", "resultados", "plazo"],
  communication: ["comunicar", "explicar", "escuchar", "hablar", "escribi", "dije", "mensaje", "conversacion", "claridad", "transmitir", "contar", "feedback", "presentar"],
  leadership:    ["liderar", "equipo", "lidere", "dirigir", "decidi", "responsabilidad", "delegar", "contrate", "despedi", "gente a mi cargo", "guiar", "referente", "ejemplo"],
  resilience:    ["resiliencia", "aguante", "caer", "levantar", "perseverar", "no rendi", "superar", "fracaso", "crisis", "presion", "seguir", "volver a empezar", "duro", "resistir"],
  creativity:    ["crear", "idea", "original", "imaginar", "inventar", "diseñar", "diseno", "arte", "novedoso", "experimentar", "conecte ideas", "diferente", "intuicion"],
  emotional:     ["calma", "frustracion", "rabia", "miedo", "ansiedad", "respirar", "controlar", "emocion", "sentir", "tranquilo", "exploto", "perdi los nervios", "regular", "paciencia"],
  discipline:    ["disciplina", "rutina", "constancia", "habito", "todos los dias", "cada dia", "metodico", "orden", "sistema", "consistente", "levantarme", "repetir", "rigor"],
  learning:      ["aprender", "aprendi", "estudie", "leer", "curioso", "rapido", "asimilar", "nuevo", "entender", "investigar", "mejorar", "iterar", "experimento", "me forme"],
  conflict:      ["conflicto", "discusion", "socio", "negociar", "tension", "desacuerdo", "resolver", "mediar", "pelea", "acuerdo", "confrontar", "malentendido", "enfrentamiento"],
};

// El ángulo de una entrada empuja sus dimensiones afines (un relato de liderazgo
// es evidencia de liderazgo aunque no diga "lidere").
const ANGLE_BIAS = {
  "leadership":   ["leadership", "communication", "conflict"],
  "failure":      ["resilience", "learning"],
  "success":      ["execution", "vision"],
  "relationship": ["communication", "conflict", "emotional"],
  "fear":         ["emotional", "resilience"],
  "ambition":     ["vision", "discipline"],
  "life-event":   ["resilience", "learning"],
};

const BASELINE = 38; // sin evidencia, una lectura neutra-baja: no se presume nada.
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/**
 * Puntúa la biografía en las diez dimensiones. Devuelve lecturas 0–100 sobre una
 * base neutra, más la confianza (cuánta materia prima sostiene la lectura).
 * [IA] Sustituible por una llamada al modelo que devuelva la misma forma.
 *
 * @returns {{ scores:Object, confidence:number, level:string, words:number, evidence:number }}
 */
export function scoreBiography(bios = []) {
  const scores = {};
  for (const d of DIMENSIONS) scores[d.key] = BASELINE;

  let words = 0;
  let evidence = 0;
  const text = bios.map((b) => " " + norm(b.text)).join(" ");
  words = text.split(/\s+/).filter(Boolean).length;

  // Señales léxicas: cada acierto empuja su dimensión (con techo por dimensión).
  for (const d of DIMENSIONS) {
    let hits = 0;
    for (const term of LEXICON[d.key]) {
      const t = norm(term);
      let idx = text.indexOf(t);
      while (idx !== -1) { hits++; idx = text.indexOf(t, idx + t.length); }
    }
    evidence += hits;
    // Rendimiento decreciente: las primeras señales pesan más que las décimas.
    const lift = Math.min(50, Math.round(18 * Math.log2(1 + hits)));
    scores[d.key] = clamp(BASELINE + lift);
  }

  // Sesgo por ángulo: cada entrada empuja sus dimensiones afines.
  for (const b of bios) {
    for (const k of ANGLE_BIAS[b.kind] || []) scores[k] = clamp(scores[k] + 4);
  }

  // Auto-conocimiento: contar la propia historia, en variedad de ángulos, eleva
  // suavemente todo el modelo — quien se observa, se regula mejor. Efecto leve.
  const variety = new Set(bios.map((b) => b.kind)).size;
  const selfLift = Math.min(8, variety * 1.5);
  for (const d of DIMENSIONS) scores[d.key] = clamp(scores[d.key] + selfLift);

  // Confianza: función de cuánta materia prima hay. No es una nota de la persona;
  // es cuánto puede "ver" el espejo. ~450 palabras ≈ lectura razonablemente firme.
  const confidence = clamp(Math.round((words / 450) * 100), 0, 100);
  const level = confidence < 25 ? "baja" : confidence < 60 ? "media" : "alta";

  return { scores, confidence, level, words, evidence };
}

// Contenido curado por dimensión: cómo se nombra cada lectura en cada papel.
// Registro siempre tentativo — "tiende a", "probable", "podría".
const DIM_COPY = {
  vision: {
    strength: "Lees el largo plazo: tiendes a ver hacia dónde va algo antes que el resto.",
    bottleneck: "La visión podría adelantarse a la ejecución: ves el destino, cuesta el siguiente paso concreto.",
    blindSpot: "Asumir que los demás ven el futuro que tú ya ves.",
    risk: "Vender el horizonte y dejar sin aterrizar el primer kilómetro.",
    skill: "Traducir visión a un primer paso medible esta semana.",
  },
  execution: {
    strength: "Conviertes intención en entrega: lo que decides, tiende a salir.",
    bottleneck: "El impulso de entregar podría comerse la pausa para pensar el qué.",
    blindSpot: "Confundir movimiento con progreso.",
    risk: "Ejecutar rápido en la dirección equivocada.",
    skill: "Antes de lanzar, una pregunta: ¿esto es lo correcto o solo lo siguiente?",
  },
  communication: {
    strength: "Sabes transmitir: tiendes a hacer entendible lo complejo.",
    bottleneck: "La comunicación bajo frustración: cuando aprieta, el mensaje podría endurecerse.",
    blindSpot: "Creer que lo dicho una vez quedó entendido.",
    risk: "Que la prisa por avanzar deje a la gente sin contexto.",
    skill: "Escucha estratégica: tres preguntas antes de defender tu posición.",
  },
  leadership: {
    strength: "Tiendes a sostener el peso cuando hay que decidir y dar la cara.",
    bottleneck: "Delegar de verdad: soltar sin retomar a mitad.",
    blindSpot: "Asumir que el equipo se mueve a tu velocidad.",
    risk: "Convertirte en el cuello de botella de tus propias decisiones.",
    skill: "Delegar una tarea por completo — incluido el derecho a hacerla distinta.",
  },
  resilience: {
    strength: "Probable fortaleza: te caes y vuelves. El golpe no te define.",
    bottleneck: "Aguantar podría volverse aguantar de más, sin pedir relevo.",
    blindSpot: "Confundir resistir con avanzar.",
    risk: "Normalizar un desgaste que ya no es heroico, solo costoso.",
    skill: "Nombrar en voz alta un punto de apoyo que necesitas esta semana.",
  },
  creativity: {
    strength: "Conectas ideas que otros ven separadas: tiendes a lo original.",
    bottleneck: "Muchas ideas abiertas, pocas cerradas hasta el final.",
    blindSpot: "Enamorarte de la idea nueva y abandonar la que ya funcionaba.",
    risk: "Dispersar energía entre frentes a medio terminar.",
    skill: "Cerrar una idea por completo antes de empezar la siguiente.",
  },
  emotional: {
    strength: "Lectura: cierta capacidad de mantener la calma cuando sube la temperatura.",
    bottleneck: "La regulación bajo presión: la emoción podría tomar el volante en caliente.",
    blindSpot: "Decidir en el pico emocional y llamarlo intuición.",
    risk: "Que una reacción en caliente cueste una relación en frío.",
    skill: "Ante una reacción fuerte, una pausa de respiración antes de responder.",
  },
  discipline: {
    strength: "Probable constancia: apareces aunque no haya chispa ese día.",
    bottleneck: "La disciplina podría volverse rigidez cuando el plan ya no sirve.",
    blindSpot: "Repetir el sistema sin revisar si sigue siendo el correcto.",
    risk: "Optimizar con rigor una rutina que ya no lleva a ningún sitio.",
    skill: "Revisar un hábito y preguntarte si aún te sirve o solo te tranquiliza.",
  },
  learning: {
    strength: "Tiendes a asimilar rápido y a iterar sobre lo aprendido.",
    bottleneck: "Aprender mucho podría sustituir a aplicar lo aprendido.",
    blindSpot: "Coleccionar conocimiento sin convertirlo en cambio.",
    risk: "Estudiar el siguiente método en vez de terminar con el actual.",
    skill: "Aplicar hoy una sola cosa que aprendiste esta semana.",
  },
  conflict: {
    strength: "Tiendes a entrar al desacuerdo en vez de esquivarlo.",
    bottleneck: "La gestión del conflicto: resolver podría confundirse con imponer.",
    blindSpot: "Asumir tu versión de los hechos como la versión.",
    risk: "Ganar la discusión y perder la relación.",
    skill: "Separar el hecho de tu interpretación antes de la próxima conversación difícil.",
  },
};

/**
 * Lee patrones a partir de las puntuaciones y la biografía. Devuelve la lámina
 * del Módulo 3: fortalezas, cuello de botella, riesgo oculto, oportunidad, punto
 * ciego y la siguiente habilidad. Lenguaje siempre tentativo. [IA] sustituible.
 */
export function analyzePatterns(scoreResult, bios = []) {
  const { scores, level } = scoreResult;
  const ranked = DIMENSIONS.slice().sort((a, b) => scores[b.key] - scores[a.key]);
  const top = ranked.slice(0, 2);
  const low = ranked[ranked.length - 1];
  const secondLow = ranked[ranked.length - 2];

  const tentative = level === "baja"; // poca materia → lo decimos abiertamente.

  return {
    confidenceLevel: level,
    tentative,
    strengths: top.map((d) => ({ key: d.key, label: d.label, line: DIM_COPY[d.key].strength })),
    bottleneck: { key: low.key, label: low.label, line: DIM_COPY[low.key].bottleneck },
    blindSpot: { key: low.key, label: low.label, line: DIM_COPY[low.key].blindSpot },
    risk: { key: secondLow.key, label: secondLow.label, line: DIM_COPY[secondLow.key].risk },
    opportunity: { key: secondLow.key, label: secondLow.label, line: `Margen de crecimiento en ${secondLow.label.toLowerCase()}: hoy es lo menos visible en tu relato.` },
    nextSkill: { key: low.key, label: low.label, line: DIM_COPY[low.key].skill },
  };
}

// ---- Conflictos -------------------------------------------------------------
// Marcadores para separar lo que se afirma como hecho de lo que se infiere.
const FACT_MARKERS = ["dijo", "dije", "escribio", "escribi", "envio", "envie", "firmo", "firme", "acordamos", "prometio", "prometi", "llamo", "llame", "pago", "cobro", "el lunes", "el martes", "ayer", "la semana", "en la reunion", "por escrito", "%", "euros", "€"];
const ASSUMPTION_MARKERS = ["creo", "supongo", "seguramente", "parece", "imagino", "asumo", "siempre", "nunca", "deberia", "da la sensacion", "intuyo", "me da que", "obviamente", "claramente", "todo el mundo", "seguro que"];
const EMOTION_WORDS = {
  "frustracion": "frustración", "frustrad": "frustración", "rabia": "rabia", "enfad": "enfado", "miedo": "miedo",
  "ansiedad": "ansiedad", "ansios": "ansiedad", "decepcion": "decepción", "resentimiento": "resentimiento",
  "orgullo": "orgullo", "culpa": "culpa", "verguenza": "vergüenza", "traicion": "sensación de traición",
  "agotad": "agotamiento", "cansad": "cansancio", "dolid": "dolor", "ignorad": "sentirse ignorado",
};
const OPERATIONAL_WORDS = {
  "plazo": "plazos", "dinero": "dinero", "equity": "reparto / equity", "reparto": "reparto", "rol": "roles",
  "recurso": "recursos", "decision": "quién decide", "prioridad": "prioridades", "carga": "reparto de carga",
  "cliente": "cliente", "producto": "producto", "tiempo": "tiempo", "presupuesto": "presupuesto", "contrato": "contrato",
};

function sentences(text) {
  return String(text || "")
    .split(/(?<=[.!?\n])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}
function hasAny(haystack, list) {
  const n = norm(haystack);
  return list.some((m) => n.includes(norm(m)));
}

/**
 * Analiza un conflicto descrito en texto libre. Devuelve la lámina del Módulo 4:
 * hechos confirmados, supuestos posibles, motores emocionales y operativos, el
 * malentendido probable, una conversación recomendada y una acción medible.
 *
 * Heurística honesta: separa frases por marcadores. El objetivo es CLARIDAD, no
 * validación. [IA] sustituible por un modelo que devuelva la misma estructura.
 */
export function analyzeConflict(text) {
  const raw = String(text || "").trim();
  if (raw.split(/\s+/).filter(Boolean).length < 12) {
    return { tooShort: true, hint: "Cuéntalo con un poco más de detalle: qué pasó, quién dijo o hizo qué, y qué sentiste. Cuanto más concreto, más útil el reflejo." };
  }
  const sents = sentences(raw);
  const facts = [];
  const assumptions = [];
  for (const s of sents) {
    const isAssumption = hasAny(s, ASSUMPTION_MARKERS);
    const isFact = hasAny(s, FACT_MARKERS);
    if (isAssumption && !isFact) assumptions.push(s);
    else if (isFact) facts.push(s);
  }
  // Si nada cayó como hecho, no inventamos: lo señalamos.
  const emotional = [...new Set(Object.entries(EMOTION_WORDS).filter(([k]) => norm(raw).includes(k)).map(([, v]) => v))];
  const operational = [...new Set(Object.entries(OPERATIONAL_WORDS).filter(([k]) => norm(raw).includes(k)).map(([, v]) => v))];

  const misunderstanding = assumptions.length
    ? "Hay al menos un punto que tratas como un hecho y que, mirado de cerca, es una interpretación. Ahí suele esconderse el malentendido: dos personas operando sobre supuestos distintos sin haberlos puesto sobre la mesa."
    : "No aparece un supuesto evidente en tu relato — lo que puede significar dos cosas: que el conflicto es genuinamente de hechos, o que el supuesto está tan asumido que ni se nombra. Vale la pena comprobar la segunda.";

  const otherParty = /socio|cofundador|cofounder/i.test(raw) ? "tu socio" : /equipo/i.test(raw) ? "tu equipo" : "la otra persona";
  const conversation = [
    `Abre sin acusación: "Quiero entender bien esto, no ganar la discusión."`,
    `Pon el hecho, no la interpretación: comparte lo que pasó${facts.length ? ' (lo que sí podéis verificar)' : ""} antes que lo que crees que significa.`,
    `Pregunta por su versión antes de dar la tuya: "¿Cómo lo viste tú?"`,
    emotional.length ? `Nombra lo que sientes sin cargarlo en ${otherParty}: "Esto me genera ${emotional[0]}", no "tú me haces sentir…".` : `Cierra acordando un siguiente paso concreto, no una sensación.`,
  ];
  const action = operational.length
    ? `Define, por escrito y antes de 72h, una decisión concreta sobre ${operational[0]}. Una frase, una fecha, una responsabilidad.`
    : `Agenda una conversación de 20 minutos en las próximas 48h con un solo objetivo: separar los hechos de los supuestos, juntos.`;

  return {
    tooShort: false,
    facts,
    assumptions,
    emotional,
    operational,
    misunderstanding,
    conversation,
    action,
    note: "Lectura para reflexionar, no un veredicto. Solo conoces tu lado del relato; el reflejo cambia cuando entra el otro.",
  };
}

// ---- Evolución diaria -------------------------------------------------------
// Un reto al día, determinista por usuario+fecha, sesgado al cuello de botella.
const CHALLENGE_POOL = {
  vision:        ["Escribe en una frase hacia dónde va tu proyecto. Enséñasela a alguien y mira si la entiende.", "Antes de decidir hoy, pregúntate si esto te acerca al destino o solo te ocupa."],
  execution:     ["Termina una sola cosa por completo antes de abrir la siguiente.", "Elige la tarea que llevas posponiendo y dale 25 minutos, ahora."],
  communication: ["Haz tres preguntas antes de defender tu posición en la próxima conversación.", "Explica una idea compleja a alguien y pídele que te la repita."],
  leadership:    ["Delega una tarea por completo — incluido el derecho a hacerla distinta a como tú la harías.", "Termina una conversación difícil que estás aplazando."],
  resilience:    ["Nombra en voz alta un punto de apoyo que necesitas esta semana, y pídelo.", "Reconoce un golpe reciente sin minimizarlo ni dramatizarlo. Solo nómbralo."],
  creativity:    ["Cierra una idea por completo hoy. Una, terminada, mejor que cinco abiertas.", "Conecta dos cosas que normalmente no juntas y escribe qué sale."],
  emotional:     ["Ante la próxima reacción fuerte, respira una vez antes de responder.", "Identifica qué emoción condujo tu última decisión importante."],
  discipline:    ["Haz hoy la cosa que harías si nadie te viera y nadie te aplaudiera.", "Revisa un hábito: ¿aún te sirve, o solo te tranquiliza?"],
  learning:      ["Aplica hoy una sola cosa que aprendiste esta semana. Aplícala, no la guardes.", "Enséñale a alguien algo que aprendiste hace poco."],
  conflict:      ["Separa, por escrito, el hecho de tu interpretación en un conflicto abierto.", "En el próximo desacuerdo, pregunta '¿cómo lo viste tú?' antes de dar tu versión."],
};
const GENERIC_CHALLENGES = [
  "Cuéntale a MACMA un momento que te marcó. El espejo ve más cuanto más le das.",
  "Describe un fracaso del que aprendiste. Sin la versión de LinkedIn.",
];

// Hash determinista pequeño (no criptográfico): mismo usuario+día → mismo reto.
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/**
 * El reto del día. Determinista por usuario+fecha; sesgado al cuello de botella
 * detectado. Con poca materia prima, invita a alimentar el modelo. [IA] sustituible.
 * @param {string} date  "YYYY-MM-DD"
 */
export function dailyChallenge(user, scoreResult, date) {
  const seed = hashStr(`${norm(user)}|${date}`);
  if (!scoreResult || scoreResult.words < 30) {
    return { text: GENERIC_CHALLENGES[seed % GENERIC_CHALLENGES.length], dimension: null };
  }
  const ranked = DIMENSIONS.slice().sort((a, b) => scoreResult.scores[a.key] - scoreResult.scores[b.key]);
  const dim = ranked[0]; // el cuello de botella: lo más bajo.
  const pool = CHALLENGE_POOL[dim.key] || GENERIC_CHALLENGES;
  return { text: pool[seed % pool.length], dimension: dim.key };
}
