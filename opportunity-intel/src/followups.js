// =============================================================================
// followups.js — Secuencias de seguimiento multi-toque (Fase 6).
//
// Una sola llamada rara vez cierra. Tras un estado ABIERTO (no contesta, llamado
// sin cierre, requiere seguimiento, interesado), Connect propone el SIGUIENTE
// toque: canal + cuándo + un guion corto. Así no se cae ningún hilo — el hueco
// que Apollo/Lemlist cubren con volumen, nosotros lo cubrimos sin perder la
// selección de élite.
//
// Determinista y PURO (sin DOM): depende solo del estado y del tiempo desde el
// último movimiento (record.updatedAt). Testeable al 100%.
// =============================================================================

const H = 3600000;

// Cadencia por estado: toques en offset de horas desde el último cambio de
// estado. Cada toque: { afterH, channel, action, script }.
const CADENCE = {
  no_answer: [
    { afterH: 3,  channel: "Teléfono", action: "Reintentar en otra franja", script: "Llama a otra hora del día: si fue por la mañana, prueba a media tarde." },
    { afterH: 24, channel: "WhatsApp", action: "Mensaje breve con el motivo", script: "«Hola [nombre], te llamé desde 01. Quería comentarte una idea concreta sobre [su web/su momento]. ¿Cuándo te viene bien 10 min?»" },
    { afterH: 72, channel: "Email",    action: "Email con una observación de valor", script: "Asunto corto + una observación real sobre su web o su momento, y una sola pregunta de cierre. Sin adjuntos, sin presión." },
  ],
  called: [
    { afterH: 48, channel: "Email", action: "Resumen + siguiente paso", script: "«Gracias por la llamada. Te dejo en una línea lo que vi y el siguiente paso. ¿Te encaja [día/hora] para el diagnóstico?»" },
  ],
  follow_up: [
    { afterH: 48, channel: "Teléfono", action: "Segundo toque con ángulo nuevo", script: "No repitas el primer pitch: entra por una observación nueva (algo que viste desde la última vez)." },
    { afterH: 120, channel: "Email", action: "Último toque honesto", script: "«No quiero ser pesado: si no es el momento, lo dejo aquí y te escribo en unos meses. Si lo es, este es el siguiente paso.»" },
  ],
  interested: [
    { afterH: 24, channel: "WhatsApp", action: "Proponer día y hora concretos", script: "No preguntes «¿cuándo te viene bien?» — propón dos huecos concretos: «¿Mañana 10:00 o jueves 17:00 para el diagnóstico?»" },
  ],
};

const SETTLED = new Set(["meeting_booked", "rejected", "wrong_fit", "not_called"]);

/**
 * El siguiente toque pendiente para un lead, según su estado y el tiempo desde
 * el último movimiento. Devuelve null si el lead está resuelto o sin tocar.
 * @returns {{channel,action,script,step,total,dueAt,isDue}|null}
 */
export function nextFollowup(record = {}, now = Date.now()) {
  const status = record.status || "not_called";
  if (SETTLED.has(status) || !CADENCE[status]) return null;
  const steps = CADENCE[status];
  const since = record.updatedAt ? new Date(record.updatedAt).getTime() : now;

  // El toque recomendado es el ÚLTIMO cuyo momento ya llegó (el más vencido);
  // si ninguno ha llegado aún, es el primero (próximo, en el futuro).
  let idx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (now >= since + steps[i].afterH * H) idx = i;
  }
  const dueAt = since + steps[idx].afterH * H;
  const isDue = now >= dueAt;
  return { ...steps[idx], step: idx + 1, total: steps.length, dueAt, isDue };
}

/** Etiqueta humana del vencimiento ("vence ahora", "en 2 h", "hace 1 día"). */
export function dueLabel(dueAt, now = Date.now()) {
  const diff = dueAt - now;
  const past = diff < 0;
  const h = Math.abs(diff) / H;
  let txt;
  if (h < 1) txt = "ahora";
  else if (h < 24) txt = `${Math.round(h)} h`;
  else txt = `${Math.round(h / 24)} día${Math.round(h / 24) === 1 ? "" : "s"}`;
  if (h < 1) return "vence ahora";
  return past ? `hace ${txt}` : `en ${txt}`;
}

/**
 * Los seguimientos que tocan HOY: leads con un toque vencido. Ordena por el más
 * vencido primero. Cada item: { opp, fu } donde fu es el toque de nextFollowup.
 */
export function dueFollowups(opps = [], tracking = {}, now = Date.now()) {
  const out = [];
  for (const o of opps) {
    const fu = nextFollowup(tracking[o.id] || {}, now);
    if (fu && fu.isDue) out.push({ opp: o, fu });
  }
  out.sort((a, b) => a.fu.dueAt - b.fu.dueAt); // el más vencido primero
  return out;
}
