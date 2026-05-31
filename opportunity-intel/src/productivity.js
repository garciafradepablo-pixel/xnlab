// =============================================================================
// productivity.js — Productividad y competitividad interna (cálculo puro).
//
// "Una batalla real entre trabajadores que mida productividad y eficiencia."
// No inventamos métricas nuevas: leemos lo que el equipo YA deja firmado en la
// mesa compartida — cada cambio de estado, cada resultado y cada lead llevan el
// autor (`by`). De ahí sale un marcador honesto, no una vanity metric.
//
// Señales (por persona):
//   worked    — empresas que ha tocado (cambios de estado firmados por él/ella)
//   meetings  — reuniones conseguidas (outcome meeting_booked)
//   won       — cierres (outcome won)
//   interested— interesados levantados (outcome interested)
//   messages  — actividad en mensajería interna (del panel de chat)
//
// score = won·5 + meetings·3 + interested·1 + worked·0.5 + messages·0.1
// Pesa el resultado (cerrar, reunir) por encima del mero movimiento: la batalla
// premia eficiencia, no ruido.
// =============================================================================

const norm = (s) => String(s || "").trim().toLowerCase();

const WEIGHTS = { won: 5, meetings: 3, interested: 1, worked: 0.5, messages: 0.1 };

/**
 * Construye el marcador.
 * @param {Object} tracking  store.getTracking()  → { id: { status, by, ... } }
 * @param {Array}  learning  store.getLearning()  → [ { source, outcome, by } ]
 * @param {Array}  users     [{ name, color, avatar }]
 * @param {Object} msgStats  { name_lower: { name, count } }
 * @returns {Array<{name,color,avatar,worked,meetings,won,interested,messages,score}>}
 */
export function buildLeaderboard(tracking, learning, users = [], msgStats = {}) {
  const rows = new Map(); // name_lower -> row
  const seed = (name) => {
    const k = norm(name);
    if (!k) return null;
    if (!rows.has(k)) rows.set(k, { name: name || k, color: null, avatar: null, worked: 0, meetings: 0, won: 0, interested: 0, messages: 0, score: 0 });
    return rows.get(k);
  };

  // Todo el equipo aparece, aunque su marcador sea 0 (la batalla los incluye).
  for (const u of users || []) {
    const r = seed(u && u.name);
    if (r) { r.color = u.color || r.color; r.avatar = u.avatar || r.avatar; }
  }

  // worked: empresas tocadas (un registro de tracking por empresa, con autor).
  for (const rec of Object.values(tracking || {})) {
    if (!rec || !rec.by) continue;
    const r = seed(rec.by);
    if (r) r.worked++;
  }

  // meetings / won / interested: resultados decisivos firmados por su autor.
  for (const o of learning || []) {
    if (!o || !o.by) continue;
    const r = seed(o.by);
    if (!r) continue;
    if (o.outcome === "won") r.won++;
    else if (o.outcome === "meeting_booked") r.meetings++;
    else if (o.outcome === "interested") r.interested++;
  }

  // messages: actividad en mensajería interna.
  for (const [k, v] of Object.entries(msgStats || {})) {
    const r = seed((v && v.name) || k);
    if (r) r.messages += (v && v.count) || 0;
  }

  for (const r of rows.values()) {
    r.score = Math.round(
      (r.won * WEIGHTS.won + r.meetings * WEIGHTS.meetings + r.interested * WEIGHTS.interested +
        r.worked * WEIGHTS.worked + r.messages * WEIGHTS.messages) * 10,
    ) / 10;
  }

  return [...rows.values()].sort((a, b) => b.score - a.score || b.won - a.won || a.name.localeCompare(b.name));
}

export { WEIGHTS };
