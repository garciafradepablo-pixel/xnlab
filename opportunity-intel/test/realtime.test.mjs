// Tests del cliente de Realtime (broadcast) con un WebSocket FALSO: protocolo
// puro (encode/decode) + ciclo de vida (join, en vivo, nudge entrante/saliente,
// cierre). Cero red. El diseño es aditivo: aquí verificamos que el contrato con
// el servidor de Supabase es el correcto y que degrada bien.

import {
  realtimeUrl, channelTopic, encodeJoin, encodeHeartbeat, encodeBroadcast,
  decode, isBroadcast, createRealtime,
} from "../src/realtime.js";

let passed = 0, failed = 0;
function ok(c, m) { if (c) { passed++; } else { failed++; console.error("FAIL:", m); } }
function eq(a, b, m) { ok(a === b, `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// ---- URL y topic ------------------------------------------------------------
{
  const u = realtimeUrl("abc123", "sb_pub key/+");
  ok(u.startsWith("wss://abc123.supabase.co/realtime/v1/websocket?"), "URL del transporte ws");
  ok(u.includes("apikey=sb_pub%20key%2F%2B"), "clave url-encoded");
  ok(u.includes("vsn=1.0.0"), "versión del protocolo");
  eq(channelTopic("default"), "realtime:connect:default", "topic del canal");
}

// ---- protocolo: encoders y decode ------------------------------------------
{
  const join = decode(encodeJoin("realtime:connect:default", 3));
  eq(join.event, "phx_join", "evento de unión");
  eq(join.topic, "realtime:connect:default", "topic en el join");
  eq(join.ref, "3", "ref como string");
  eq(join.payload.config.broadcast.self, false, "no recibimos nuestros propios broadcasts");

  const hb = decode(encodeHeartbeat(7));
  eq(hb.topic, "phoenix", "heartbeat al topic phoenix");
  eq(hb.event, "heartbeat", "evento heartbeat");

  const bc = decode(encodeBroadcast("realtime:connect:default", 9, 3, "nudge", { by: "Pablo" }));
  eq(bc.event, "broadcast", "evento broadcast");
  eq(bc.payload.type, "broadcast", "envoltorio type broadcast");
  eq(bc.payload.event, "nudge", "subevento nudge");
  eq(bc.payload.payload.by, "Pablo", "carga del nudge");

  ok(decode("no-json{") === null, "decode tolera basura → null");
  ok(isBroadcast({ event: "broadcast", payload: { event: "nudge" } }, "nudge"), "isBroadcast detecta el evento");
  ok(!isBroadcast({ event: "phx_reply" }, "nudge"), "isBroadcast descarta lo que no es");
}

// ---- ciclo de vida con WebSocket falso -------------------------------------
class FakeWS {
  constructor(url) { this.url = url; this.readyState = 0; this.sent = []; FakeWS.last = this; }
  send(s) { this.sent.push(s); }
  close() { this.readyState = 3; if (this.onclose) this.onclose({}); }
  _open() { this.readyState = 1; if (this.onopen) this.onopen({}); }
  _recv(obj) { if (this.onmessage) this.onmessage({ data: JSON.stringify(obj) }); }
}

{
  const signals = [], statuses = [];
  const rt = createRealtime({
    url: "wss://x", channel: "realtime:connect:default", WebSocketImpl: FakeWS,
    onSignal: (p) => signals.push(p), onStatus: (s) => statuses.push(s),
  });
  rt.start();
  const ws = FakeWS.last;
  ok(ws && ws.url === "wss://x", "abre el socket en start()");
  ok(statuses.includes("connecting"), "estado connecting al abrir");

  ws._open();
  const join = decode(ws.sent[0]);
  eq(join.event, "phx_join", "al abrir envía el join");

  ok(!rt.isLive(), "aún no está en vivo sin confirmación");
  rt.nudge({ by: "Pablo" });
  eq(ws.sent.length, 1, "no emite nudge antes de unirse al canal");

  ws._recv({ event: "phx_reply", ref: join.ref, payload: { status: "ok" } });
  ok(rt.isLive(), "tras phx_reply ok, en vivo");
  ok(statuses.includes("live"), "emite estado live");

  ws._recv({ event: "broadcast", payload: { event: "nudge", payload: { by: "Javi" } } });
  eq(signals.length, 1, "recibe el nudge ajeno");
  eq(signals[0].by, "Javi", "con su carga");

  rt.nudge({ by: "Pablo" });
  const last = decode(ws.sent[ws.sent.length - 1]);
  eq(last.event, "broadcast", "ahora sí emite broadcast");
  eq(last.payload.payload.by, "Pablo", "con el remitente");

  ws.close();
  ok(statuses.includes("down"), "al cerrarse, estado down");
  ok(!rt.isLive(), "ya no está en vivo");

  rt.stop(); // no debe lanzar
  ok(true, "stop() limpio");
}

// ---- sin WebSocket disponible: no rompe (degradación) -----------------------
{
  const rt = createRealtime({ url: "wss://x", channel: "c", WebSocketImpl: null });
  rt.start();
  ok(!rt.isLive(), "sin WebSocket no conecta pero no lanza");
  rt.nudge({});
  rt.stop();
  ok(true, "degrada con elegancia");
}

console.log(`realtime.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
