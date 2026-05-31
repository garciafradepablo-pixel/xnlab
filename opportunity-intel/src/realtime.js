// =============================================================================
// realtime.js — Cliente MÍNIMO de Supabase Realtime (broadcast), sin deps.
//
// Propósito: propagación <1 s entre Pablo y Javi. NO transporta datos — solo un
// "nudge" (alguien acaba de cambiar algo) por un canal de broadcast, que es
// pub/sub puro entre clientes: sin tabla, sin RLS. Preserva el modelo de
// seguridad (el cliente solo lleva la clave publishable; la fuente durable
// sigue siendo la Edge Function). Al recibir el nudge, el cliente hace
// pullSharedState() y trae lo nuevo.
//
// ADITIVO y degradable: si el websocket no conecta (red, política, server), el
// sondeo adaptativo sigue siendo el suelo. Por eso todo va protegido y
// reconecta con backoff. La capa de protocolo (encode/decode) es pura y
// testeable; el ciclo de vida acepta un WebSocket inyectable para tests.
// =============================================================================

const VSN = "1.0.0";

/** URL del transporte websocket de Realtime para un proyecto. */
export function realtimeUrl(ref, key) {
  return `wss://${ref}.supabase.co/realtime/v1/websocket?apikey=${encodeURIComponent(key)}&vsn=${VSN}`;
}

/** Topic del canal de un workspace (formato Phoenix de Supabase: `realtime:<canal>`). */
export function channelTopic(workspace = "default") {
  return `realtime:connect:${workspace}`;
}

// ---- Protocolo Phoenix (puro) ----------------------------------------------

export function encodeJoin(topic, ref) {
  return JSON.stringify({
    topic, event: "phx_join", ref: String(ref), join_ref: String(ref),
    payload: { config: { broadcast: { self: false, ack: false }, presence: { key: "" } } },
  });
}
export function encodeHeartbeat(ref) {
  return JSON.stringify({ topic: "phoenix", event: "heartbeat", ref: String(ref), payload: {} });
}
export function encodeBroadcast(topic, ref, joinRef, event, payload) {
  return JSON.stringify({
    topic, event: "broadcast", ref: String(ref), join_ref: String(joinRef),
    payload: { type: "broadcast", event, payload },
  });
}
export function decode(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}
/** ¿Es un broadcast del evento `event`? */
export function isBroadcast(msg, event) {
  return !!msg && msg.event === "broadcast" && !!msg.payload && msg.payload.event === event;
}

// ---- Cliente (ciclo de vida) -----------------------------------------------

/**
 * Crea el cliente. No conecta hasta `.start()`. Callbacks: `onSignal(payload)`
 * cuando llega un nudge ajeno; `onStatus(s)` con "connecting"|"live"|"down".
 */
export function createRealtime({ url, channel, WebSocketImpl, onSignal, onStatus } = {}) {
  const WS = WebSocketImpl || (typeof WebSocket !== "undefined" ? WebSocket : null);
  let ws = null, refN = 0, joinRef = "1", hbTimer = null, reTimer = null;
  let attempts = 0, alive = true, joined = false;

  const nextRef = () => String(++refN);
  const status = (s) => { try { onStatus && onStatus(s); } catch { /* */ } };

  function open() {
    if (!WS || !alive) return;
    status("connecting");
    try { ws = new WS(url); } catch { scheduleReconnect(); return; }
    ws.onopen = () => {
      attempts = 0;
      joinRef = nextRef();
      send(encodeJoin(channel, joinRef));
      startHeartbeat();
    };
    ws.onmessage = (ev) => {
      const msg = decode(typeof ev.data === "string" ? ev.data : (ev.data == null ? "" : String(ev.data)));
      if (!msg) return;
      // Confirmación de unión al canal → ya estamos en vivo.
      if (msg.event === "phx_reply" && String(msg.ref) === joinRef) {
        const ok = !msg.payload || msg.payload.status === "ok" || msg.payload.status === undefined;
        if (ok) { joined = true; status("live"); }
        return;
      }
      if (isBroadcast(msg, "nudge")) { try { onSignal && onSignal((msg.payload && msg.payload.payload) || {}); } catch { /* */ } }
    };
    ws.onclose = () => { joined = false; stopHeartbeat(); status("down"); scheduleReconnect(); };
    ws.onerror = () => { try { ws && ws.close && ws.close(); } catch { /* */ } };
  }

  function send(s) {
    try { if (ws && ws.readyState === 1) ws.send(s); } catch { /* */ }
  }
  function startHeartbeat() {
    stopHeartbeat();
    hbTimer = setInterval(() => send(encodeHeartbeat(nextRef())), 25000);
    if (hbTimer && hbTimer.unref) hbTimer.unref();
  }
  function stopHeartbeat() { if (hbTimer) clearInterval(hbTimer); hbTimer = null; }
  function scheduleReconnect() {
    if (!alive || reTimer) return;
    attempts++;
    const delay = Math.min(30000, 1000 * 2 ** Math.min(attempts, 5)); // 2s…30s
    reTimer = setTimeout(() => { reTimer = null; open(); }, delay);
    if (reTimer && reTimer.unref) reTimer.unref();
  }

  return {
    start() { if (WS) open(); return this; },
    /** Avisa al equipo de que algo cambió (no envía datos, solo el nudge). */
    nudge(payload = {}) { if (joined) send(encodeBroadcast(channel, nextRef(), joinRef, "nudge", payload)); },
    isLive() { return joined; },
    stop() {
      alive = false; stopHeartbeat();
      if (reTimer) { clearTimeout(reTimer); reTimer = null; }
      try { ws && ws.close && ws.close(); } catch { /* */ }
    },
  };
}
