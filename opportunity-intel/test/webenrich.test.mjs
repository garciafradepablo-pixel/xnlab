// webenrich.test.mjs — Enriquecimiento web HONESTO (Tanda 5).

const { safeUrl, extractWebSignals, enrichmentSummary } = await import("../src/webenrich.js");
const { buildLead } = await import("../src/newlead.js");
const { scoreOpportunity } = await import("../src/scoring.js");
const { decide, evidenceQuality } = await import("../src/decision.js");
const { applyVerifications } = await import("../src/store.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("webenrich.test.mjs");

// === safeUrl: normalización segura + rechazo de protocolos peligrosos ===
ok(safeUrl("acme.com") === "https://acme.com/", "añade https y normaliza a origen");
ok(safeUrl("http://x.com/a/b") === "http://x.com/", "respeta http y recorta a origen");
ok(safeUrl("HTTPS://WWW.X.COM") === "https://www.x.com/", "host en minúsculas");
ok(safeUrl("javascript:alert(1)") === null, "rechaza javascript:");
ok(safeUrl("data:text/html,x") === null, "rechaza data:");
ok(safeUrl("file:///etc/passwd") === null, "rechaza file:");
ok(safeUrl("ftp://x.com") === null, "rechaza ftp:");
ok(safeUrl("") === null && safeUrl(null) === null, "vacío → null");

const SRC = { url: "https://lead.com/", fetched_at: "2026-06-12T00:00:00Z" };

// === Contacto/acceso: email directo + nombre → verde; genérico → amarillo ===
const founderPage = { readable: true, ...SRC, title: "Acme", visible_text: "Nuestro fundador Marta Ruiz. Escríbele a marta@acme.com" };
const fv = extractWebSignals(founderPage).verifications.find((v) => v.filter === "reachableDecisionMaker");
ok(fv && fv.level === "green" && fv.url === SRC.url && fv.snippet, "decisor con nombre + email directo → verde citado");
const infoPage = { readable: true, ...SRC, visible_text: "Contacto: info@acme.com", links: ["/contacto"] };
const iv = extractWebSignals(infoPage).verifications.find((v) => v.filter === "reachableDecisionMaker");
ok(iv && iv.level === "yellow", "email genérico/contacto → amarillo (canal, sin nombre)");
const noContact = extractWebSignals({ readable: true, ...SRC, visible_text: "Bienvenidos" });
ok(noContact.pains.includes("Sin contacto visible en la home"), "sin contacto → dolor, no verde");

// === Services / premium: detecta si el texto lo contiene ===
const sp = extractWebSignals({ readable: true, ...SRC, visible_text: "Servicios premium de lujo para clínicas", links: ["/servicios"] });
ok(sp.verifications.some((v) => v.filter === "strategicFit" && v.level === "yellow"), "servicios visibles → strategicFit amarillo");
ok(sp.verifications.some((v) => v.filter === "economicCapacity" && v.level === "yellow"), "copy premium → economicCapacity amarillo (indicio, no verde)");

// === Timing: NO se inventa si no aparece; verde solo con fecha explícita ===
const noTiming = extractWebSignals({ readable: true, ...SRC, visible_text: "Somos una agencia creativa" });
ok(!noTiming.verifications.some((v) => v.filter === "whyNow"), "sin señal de momento → no inventa whyNow");
const dated = extractWebSignals({ readable: true, ...SRC, visible_text: "Próxima apertura en marzo 2026 de nuestra nueva sede" });
const dv = dated.verifications.find((v) => v.filter === "whyNow");
ok(dv && dv.level === "green", "apertura con fecha explícita → whyNow verde");
const vague = extractWebSignals({ readable: true, ...SRC, visible_text: "Coming soon, próximamente abrimos" });
const vv = vague.verifications.find((v) => v.filter === "whyNow");
ok(vv && vv.level === "yellow", "apertura sin fecha → whyNow amarillo (indicio)");

// === Fetch fallido: estado failed, sin verificaciones, sin penalizar ===
const failResult = extractWebSignals({ readable: false, note: "No pudimos leer su web." });
ok(failResult.status === "failed" && failResult.verifications.length === 0, "fetch fallido → failed, sin señales");
ok(/no se pudo verificar/i.test(enrichmentSummary(failResult)), "summary honesto en fallo");

// === Desconocidos siguen grises (no se generan verificaciones de la nada) ===
const empty = extractWebSignals({ readable: true, ...SRC, visible_text: "x" });
ok(empty.verifications.every((v) => v.level === "yellow" || v.level === "green"), "solo verde/amarillo; nada gris fabricado");
ok(!empty.verifications.some((v) => v.filter === "budgetPriority"), "filtros sin señal NO aparecen (siguen grises en el motor)");

// === Enriquecimiento con evidencia explícita mejora evidence quality ===
const lead = buildLead({ company: "Acme", website: "https://acme.com", sector: "growth" });
const before = evidenceQuality(lead, scoreOpportunity(lead));
const rich = extractWebSignals({ readable: true, url: "https://acme.com/", fetched_at: SRC.fetched_at,
  visible_text: "Fundadora Marta Ruiz, marta@acme.com. Servicios premium. Próxima apertura marzo 2026.", links: ["/servicios", "/contacto"] });
const verifs = rich.verifications.map((v) => ({ ...v, auto: true, srcLabel: "Lectura de su web", at: "2026-06-12T00:00:00Z" }));
const enriched = applyVerifications(lead, verifs);
const after = evidenceQuality(enriched, scoreOpportunity(enriched));
ok(after.confirmed > before.confirmed, "evidencia citada sube las confirmadas");
ok(after.score > before.score, "evidence quality mejora con web real");

// === Lead importado NO pasa a ACT_NOW solo por tener web ===
const importedLead = buildLead({ company: "Sin Datos SL", website: "https://x.com", sector: "growth" });
const mild = extractWebSignals({ readable: true, url: "https://x.com/", fetched_at: SRC.fetched_at, visible_text: "Servicios para empresas. info@x.com" });
const mildEnriched = applyVerifications(importedLead, mild.verifications.map((v) => ({ ...v, auto: true })));
ok(decide(mildEnriched, scoreOpportunity(mildEnriched)).decision !== "ACT_NOW", "web con indicios débiles no fuerza ACT_NOW");

// === Funciona con la respuesta MÍNIMA (solo title + signals), sin campos ricos ===
const minimal = extractWebSignals({ readable: true, url: "https://m.com/", title: "Hotel Mar", signals: { hiring: true, opening: false, booking: true } });
ok(minimal.status === "success" && minimal.verifications.length > 0, "degrada con honestidad ante la respuesta mínima (pre-redeploy)");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
