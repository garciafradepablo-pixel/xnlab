// calls.test.mjs — Caja Negra Comercial: registro de llamada + análisis (puro).

const { newCall, analyzeTranscript } = await import("../src/calls.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("calls.test.mjs");

// --- newCall: forma completa de la caja negra ---
const c = newCall("lead_1", { channel: "whatsapp", durationMin: 12, transcript: "hola" });
ok(!!c.id && c.id.startsWith("call_"), "nace con id de llamada");
ok(c.leadId === "lead_1", "guarda el lead");
ok(c.channel === "whatsapp" && c.durationMin === 12, "canal y duración");
ok(c.result === "connected", "resultado por defecto: conectó");
ok(!!c.createdAt && !!c.updatedAt, "timestamps");
ok(newCall("x", { durationMin: "no-numero" }).durationMin === 0, "duración no numérica → 0");
ok(newCall("a").id !== newCall("a").id, "ids únicos en ráfaga");

// --- analyzeTranscript: vacío es honesto, no inventa ---
const empty = analyzeTranscript("");
ok(empty.scores.interest === 0 && empty.scores.fit === 0 && empty.scores.close === 0, "sin texto → scores 0 (no sabemos)");
ok(Array.isArray(empty.pains) && empty.pains.length === 0, "sin texto → sin dolores");

// --- transcripción CALIENTE: dolor + interés + decisor + urgencia ---
const hot = analyzeTranscript(
  "La verdad es que nuestra web es muy antigua y no transmite lo que somos. " +
  "Me interesa mucho, ¿cuándo podríamos empezar? Yo decido aquí, lo necesito para ya. Mándame la propuesta.",
  { leadName: "Marta López", sector: "health" }
);
ok(hot.pains.includes("Marca / web desfasada"), "detecta el dolor de marca/web");
ok(hot.scores.interest >= 70, "interés alto con señales de compra");
ok(hot.authority === "Decide en la llamada", "detecta autoridad de decisión");
ok(hot.urgency === "alta", "detecta urgencia alta");
ok(hot.scores.close >= 60, "probabilidad de cierre alta");
ok(hot.followUp.includes("Marta"), "el mensaje de seguimiento usa el nombre");
ok(hot.buySignals.length > 0, "captura señales de compra literales");
ok(typeof hot.nextStep === "string" && hot.nextStep.length > 0, "recomienda siguiente paso");

// --- transcripción FRÍA: objeción + pérdida ---
const cold = analyzeTranscript(
  "Uf, lo veo muy caro y ahora no es el momento. Tengo que consultarlo con mi socio. No me interesa la verdad."
);
ok(cold.objections.includes("Precio / presupuesto"), "detecta objeción de precio");
ok(cold.objections.includes("No es el momento"), "detecta objeción de momento");
ok(cold.authority === "Tiene que consultar a un tercero", "detecta decisor delegado");
ok(cold.lossSignals.length > 0, "captura señales de pérdida");
ok(cold.scores.interest < 50, "interés bajo cuando domina el rechazo");

// --- presupuesto mencionado ---
const money = analyzeTranscript("Tengo unos 5000 € para esto este año.");
ok(money.budget && /5000/.test(money.budget), "extrae presupuesto mencionado");

// --- determinismo ---
const a1 = JSON.stringify(analyzeTranscript("me interesa, mándame la propuesta"));
const a2 = JSON.stringify(analyzeTranscript("me interesa, mándame la propuesta"));
ok(a1 === a2, "mismo texto → mismo análisis (determinista)");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
