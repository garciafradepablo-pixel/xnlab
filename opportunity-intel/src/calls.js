// =============================================================================
// calls.js — La Caja Negra Comercial: forma del registro de llamada + análisis
// determinista de transcripciones.
//
// Dos responsabilidades, ambas PURAS (sin DOM, sin red, testeables):
//
//   newCall(leadId, fields)      — fabrica un registro de llamada con TODOS los
//                                  campos de la caja negra, listo para guardar
//                                  en el documento compartido (store.upsertCall).
//
//   analyzeTranscript(text, ctx) — lee una transcripción y devuelve un análisis
//                                  estructurado: resumen, dolores, objeciones,
//                                  señales de compra/pérdida, siguiente paso,
//                                  tres scores y un mensaje de seguimiento.
//
// El análisis es DETERMINISTA y honesto: no inventa: extrae lo que el texto
// dice usando el vocabulario comercial del estudio. Es el respaldo de la edge
// function `call-analysis` (Gemini) — cuando hay clave, el LLM afina; cuando no,
// esto ya da un primer pase útil. Misma forma de salida en ambos casos.
// =============================================================================

let _seq = 0;
function callId() {
  // id estable y ordenable por tiempo; sufijo anti-colisión en ráfagas.
  return `call_${Date.now().toString(36)}_${(_seq++).toString(36)}`;
}

/**
 * @typedef {Object} CallRecord
 * @property {string} id
 * @property {string} leadId
 * @property {string} at            ISO de la llamada
 * @property {number} durationMin   duración en minutos
 * @property {string} channel       clave de models.CALL_CHANNELS
 * @property {string} result        clave de models.CALL_RESULTS
 * @property {string} transcript    transcripción completa (texto)
 * @property {string} audioUrl      opcional
 * @property {string} by            quién registró la llamada
 * @property {object} analysis      salida de analyzeTranscript (o del LLM)
 * @property {string} leadSector    foto del sector del lead (para agregados)
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/** Fabrica un registro de llamada con todos los campos de la caja negra. */
export function newCall(leadId, fields = {}) {
  const now = new Date().toISOString();
  return {
    id: fields.id || callId(),
    leadId: String(leadId || ""),
    at: fields.at || now,
    durationMin: Number(fields.durationMin) || 0,
    channel: fields.channel || "phone",
    result: fields.result || "connected",
    transcript: String(fields.transcript || ""),
    audioUrl: fields.audioUrl || null,
    by: fields.by || null,
    leadSector: fields.leadSector || null,
    analysis: fields.analysis || null,
    createdAt: fields.createdAt || now,
    updatedAt: now,
  };
}

// -----------------------------------------------------------------------------
// Léxico comercial — patrones para extraer señal de una transcripción.
// -----------------------------------------------------------------------------
// Cada entrada: [etiqueta canónica, [regex...]]. Las regex son tolerantes
// (minúsculas, sin acentos exigidos) porque las transcripciones son sucias.
const OBJECTIONS = [
  ["Precio / presupuesto", [/\bcaro\b/, /\bprecio\b/, /presupuesto/, /no.{0,6}podemos pagar/, /es mucho/, /demasiado/, /coste/]],
  ["Tengo que pensarlo", [/pensar(lo|me)?/, /dar(le|me) una vuelta/, /lo consulto/, /lo valoro/]],
  ["Ya tengo proveedor", [/ya (tengo|trabajo|trabajamos)/, /ya estamos con/, /tenemos (agencia|alguien|equipo)/]],
  ["No es el momento", [/no es el momento/, /\bahora no\b/, /m[aá]s adelante/, /el a[ñn]o que viene/, /despu[eé]s de verano/]],
  ["Falta de tiempo", [/no tengo tiempo/, /vamos liados/, /muy liado/, /sin tiempo/]],
  ["Necesito consultarlo", [/consultar(lo)? con/, /hablar con mi socio/, /lo veo con/, /decide (mi|el|la)/]],
  ["Dudas de resultado", [/y si no funciona/, /qu[eé] garant[ií]a/, /no s[eé] si/, /me da miedo/]],
  ["Mándame info", [/m[aá]ndame (info|algo|un email|un correo)/, /env[ií]ame (info|algo)/, /pasame (info|algo)/]],
];

const PAINS = [
  ["Captación floja", [/no (nos )?(llegan|entran) clientes/, /pocos clientes/, /no (capt|vend)/, /no convierte/, /no genera/]],
  ["Marca / web desfasada", [/web (antigua|vieja|mala|cutre|desfasada)/, /la marca no/, /imagen (vieja|antigua|pobre)/, /no transmite/, /no refleja/]],
  ["Caos operativo", [/(somos un|es un) caos/, /todo a mano/, /manual/, /descontrol/, /sin sistema/, /se nos escapa/]],
  ["Crecimiento sin estructura", [/crecemos pero/, /no damos abasto/, /se nos queda (corto|peque)/, /no escalamos/]],
  ["Falta de diferenciación", [/somos uno m[aá]s/, /todos (igual|parecidos)/, /no destacamos/, /competencia (barata|fuerte)/]],
  ["Tiempo / saturación", [/no llego a todo/, /sin tiempo/, /saturad/, /quemad/, /agobiad/]],
];

const BUY_SIGNALS = [
  /me interesa/, /me encaja/, /me gusta/, /\bperfecto\b/, /suena bien/, /me convence/,
  /cu[aá]ndo (podr[ií]amos|empezamos|empezar[ií]amos)/, /c[oó]mo seguimos/, /qu[eé] necesit[aá]is de m[ií]/,
  /m[aá]ndame (la )?propuesta/, /env[ií]ame (la )?propuesta/, /pas[aá]me presupuesto/, /quiero verlo/, /vamos a ello/,
  /cu[aá]nto (cuesta|costar[ií]a|ser[ií]a)/, /reun[ií]?monos/, /agendamos/, /apunta mi/,
];

const LOSS_SIGNALS = [
  /no me interesa/, /no es para (m[ií]|nosotros)/, /d[eé]jalo/, /olv[ií]dalo/, /no gracias/,
  /no tenemos presupuesto/, /no hay dinero/, /no es prioridad/, /ya te (llamo|digo) yo/, /no insistas/,
  /muy caro/, /no lo veo/, /paso/,
];

const AUTHORITY_DELEGATES = [/mi socio/, /mi jefe/, /el due[ñn]o/, /la due[ñn]a/, /tengo que consultar/, /lo decide/, /no decido yo/];
const AUTHORITY_OWNER = [/yo decido/, /soy el (due[ñn]o|responsable|gerente|ceo)/, /la decisi[oó]n es m[ií]a/, /aqu[ií] mando yo/];

// Servicios del estudio (para detectar demanda real en la conversación).
const SERVICE_HINTS = [
  ["Web / Landing", [/\bweb\b/, /landing/, /p[aá]gina/, /sitio/]],
  ["Marca / Branding", [/marca/, /branding/, /logo/, /identidad/, /rebrand/]],
  ["Contenido", [/contenido/, /redes/, /instagram/, /v[ií]deo/, /fotos/, /reels/]],
  ["Automatización", [/automat/, /\bcrm\b/, /embudo/, /funnel/, /flujo/]],
  ["Dirección creativa", [/direcci[oó]n/, /estrategia/, /posicionamiento/, /atm[oó]sfera/]],
];

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function countMatches(text, regexes) {
  let n = 0;
  for (const re of regexes) if (re.test(text)) n++;
  return n;
}
// Extrae frases literales del cliente alrededor de las señales (citas reales).
function literalQuotes(rawSentences, normSentences, regexes, max = 3) {
  const out = [];
  for (let i = 0; i < normSentences.length && out.length < max; i++) {
    if (regexes.some((re) => re.test(normSentences[i]))) {
      const q = rawSentences[i].trim();
      if (q && q.length <= 180) out.push(q);
    }
  }
  return out;
}

/**
 * Analiza una transcripción y devuelve el dossier estructurado de la llamada.
 * Determinista: misma entrada → misma salida. No inventa nada que no esté en el
 * texto; cuando no hay señal, lo dice ("sin señal clara").
 *
 * @param {string} text  transcripción
 * @param {object} [ctx] { leadName, sector, classification } para el mensaje
 * @returns {object} análisis estructurado (forma estable, compartida con el LLM)
 */
export function analyzeTranscript(text, ctx = {}) {
  const raw = String(text || "").trim();
  const n = norm(raw);
  const rawSentences = raw.split(/(?<=[.!?\n])\s+/).filter(Boolean);
  const normSentences = rawSentences.map(norm);

  // --- objeciones y dolores (con cita literal cuando la hay) ---
  const objections = OBJECTIONS
    .map(([label, res]) => ({ label, hits: countMatches(n, res), quotes: literalQuotes(rawSentences, normSentences, res, 1) }))
    .filter((o) => o.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((o) => ({ label: o.label, quote: o.quotes[0] || null }));

  const pains = PAINS
    .map(([label, res]) => ({ label, hits: countMatches(n, res), quotes: literalQuotes(rawSentences, normSentences, res, 1) }))
    .filter((p) => p.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((p) => ({ label: p.label, quote: p.quotes[0] || null }));

  // --- señales de compra / pérdida ---
  const buy = countMatches(n, BUY_SIGNALS);
  const loss = countMatches(n, LOSS_SIGNALS);
  const buyQuotes = literalQuotes(rawSentences, normSentences, BUY_SIGNALS, 3);
  const lossQuotes = literalQuotes(rawSentences, normSentences, LOSS_SIGNALS, 3);

  // --- autoridad de decisión ---
  let authority = "Sin determinar";
  if (countMatches(n, AUTHORITY_OWNER) > 0) authority = "Decide en la llamada";
  else if (countMatches(n, AUTHORITY_DELEGATES) > 0) authority = "Tiene que consultar a un tercero";

  // --- presupuesto mencionado (números con € o k) ---
  const budgetMatch = raw.match(/(\d[\d.\s]{1,9})\s?(€|eur|euros|k\b)/i);
  const budget = budgetMatch ? budgetMatch[0].replace(/\s+/g, " ").trim() : null;

  // --- urgencia (gatillos temporales) ---
  const urgent = /(esta semana|cuanto antes|urgente|ya mismo|para (ya|hoy|ma[ñn]ana)|lo necesito (ya|para))/.test(n);
  const slow = /(m[aá]s adelante|el a[ñn]o que viene|despu[eé]s de|sin prisa|no corre prisa)/.test(n);
  const urgency = urgent ? "alta" : slow ? "baja" : "media";

  // --- servicios demandados ---
  const services = SERVICE_HINTS
    .filter(([, res]) => countMatches(n, res) > 0)
    .map(([label]) => label);

  // --- scores 0..100 (honestos: derivados de la señal real del texto) ---
  // Interés: compra empuja, pérdida hunde. Sin texto → 0 (no sabemos).
  const interest = raw ? clamp(50 + buy * 16 - loss * 22 + (urgent ? 8 : 0)) : 0;
  // Encaje: dolores accionables + servicios mencionados que sabemos resolver.
  const fit = raw ? clamp(40 + pains.length * 12 + services.length * 8 - (objections.some((o) => o.label === "Ya tengo proveedor") ? 14 : 0)) : 0;
  // Cierre: la conjunción de interés alto + autoridad + urgencia + poco rechazo.
  const close = raw ? clamp(
    Math.round((interest * 0.5 + fit * 0.2)) +
    (authority === "Decide en la llamada" ? 14 : authority === "Tiene que consultar a un tercero" ? -6 : 0) +
    (urgency === "alta" ? 10 : urgency === "baja" ? -8 : 0) +
    (budget ? 6 : 0) - loss * 10
  ) : 0;

  // --- siguiente paso recomendado ---
  const nextStep = recommendNextStep({ interest, close, objections, authority, urgency, raw });

  // --- "lo que no dice pero se infiere" (lectura entre líneas, marcada como tal) ---
  const inferred = inferUnsaid({ objections, pains, authority, buy, loss, services });

  // --- resumen ejecutivo ---
  const summary = buildSummary({ raw, rawSentences, pains, objections, buy, loss, services, urgency });

  // --- mensaje de seguimiento recomendado ---
  const followUp = buildFollowUp({ ctx, pains, services, nextStep, interest });

  return {
    engine: "local", // el LLM lo sobrescribe a "gemini" cuando responde
    summary,
    wants: services.length ? `Suena a necesidad de: ${services.join(", ")}.` : (pains[0] ? `Quiere resolver: ${pains[0].label.toLowerCase()}.` : "Intención aún difusa — sondear en el seguimiento."),
    pains: pains.map((p) => p.label),
    painQuotes: pains.filter((p) => p.quote).map((p) => ({ pain: p.label, quote: p.quote })),
    objections: objections.map((o) => o.label),
    objectionQuotes: objections.filter((o) => o.quote).map((o) => ({ objection: o.label, quote: o.quote })),
    buySignals: buyQuotes.length ? buyQuotes : (buy ? [`${buy} señal(es) de compra detectada(s)`] : []),
    lossSignals: lossQuotes.length ? lossQuotes : (loss ? [`${loss} señal(es) de pérdida detectada(s)`] : []),
    inferred,
    services,
    authority,
    budget,
    urgency,
    nextStep,
    followUp,
    scores: { interest, fit, close },
    closeProbability: close,
    learnings: buildLearnings({ objections, pains, buy, loss }),
  };
}

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function recommendNextStep({ interest, close, objections, authority, urgency, raw }) {
  if (!raw) return "Registrar la llamada y agendar el primer contacto real.";
  if (close >= 70) return "Enviar propuesta firmada hoy: el lead está caliente, no enfriar.";
  if (interest >= 60 && authority === "Tiene que consultar a un tercero") return "Pedir una segunda llamada con el decisor presente.";
  if (objections.some((o) => o.label === "Mándame info")) return "Enviar un one-pager breve y fijar fecha concreta de seguimiento (no dejar abierto).";
  if (objections.some((o) => o.label === "Precio / presupuesto")) return "Reencadenar a valor/retorno antes de hablar de número; ofrecer entrada acotada.";
  if (interest >= 50) return "Agendar reunión de diagnóstico con fecha cerrada.";
  if (urgency === "baja") return "Marcar seguimiento futuro con recordatorio; no forzar.";
  return "Seguimiento corto en 48–72h con un ángulo nuevo.";
}

function inferUnsaid({ objections, pains, authority, buy, loss, services }) {
  const out = [];
  if (objections.some((o) => o.label === "Tengo que pensarlo") && buy > 0) out.push("Interés real pero falta de urgencia: el freno es prioridad, no precio.");
  if (objections.some((o) => o.label === "Mándame info") && loss === 0) out.push("\"Mándame info\" suele ser un no educado salvo que fije fecha — forzar compromiso concreto.");
  if (authority === "Tiene que consultar a un tercero") out.push("No es el decisor final: la venta real ocurre en la conversación que tendrá sin nosotros — armarle el argumento.");
  if (pains.length && !services.length) out.push("Tiene dolor pero no sabe qué comprar: oportunidad de dirección, no de ejecución suelta.");
  if (!out.length) out.push("Sin lectura entre líneas relevante con la señal disponible.");
  return out;
}

function buildSummary({ raw, rawSentences, pains, objections, buy, loss }) {
  if (!raw) return "Llamada sin transcripción: registrar manualmente lo esencial.";
  const lead = rawSentences.slice(0, 2).join(" ").slice(0, 220);
  const bits = [];
  if (pains.length) bits.push(`dolor(es): ${pains.map((p) => p.label.toLowerCase()).join(", ")}`);
  if (objections.length) bits.push(`objeción(es): ${objections.map((o) => o.label.toLowerCase()).join(", ")}`);
  bits.push(`${buy} señal(es) de compra, ${loss} de pérdida`);
  return `${lead}${lead ? " — " : ""}${bits.join("; ")}.`;
}

function buildLearnings({ objections, pains, buy, loss }) {
  const out = [];
  if (objections[0]) out.push(`Preparar respuesta para la objeción "${objections[0].label}" antes de la próxima llamada del sector.`);
  if (pains[0] && buy > loss) out.push(`El dolor "${pains[0].label}" abre conversación: usarlo como gancho de apertura.`);
  if (loss > buy) out.push("El pitch perdió fuerza a mitad: revisar dónde se enfrió y endurecer la prueba de valor.");
  if (!out.length) out.push("Sin aprendizaje destacable: llamada de bajo contenido.");
  return out;
}

function buildFollowUp({ ctx, pains, services, nextStep, interest }) {
  const name = (ctx.leadName || "").trim();
  const hi = name ? `Hola ${name.split(" ")[0]},` : "Hola,";
  const painLine = pains[0]
    ? `me quedé con lo que comentabas sobre ${pains[0].label.toLowerCase()}.`
    : "gracias por el rato de hoy.";
  const valueLine = services.length
    ? `Donde más rápido te ayudaríamos es en ${services.slice(0, 2).join(" y ").toLowerCase()}.`
    : "Creo que hay un primer movimiento claro que mover sin gran inversión.";
  const close = interest >= 55
    ? "¿Te encaja que cerremos día para enseñártelo con tu caso delante?"
    : "Si te parece, te paso una idea concreta y tú me dices.";
  return `${hi} ${painLine} ${valueLine} ${close}`;
}
