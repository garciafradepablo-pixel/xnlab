// importer.test.mjs — Muelle Import/Export vendible (Tanda 4), todo local y honesto.

const { parseLeads, rowToLeadInput, findDuplicates, normDomain } = await import("../src/importer.js");
const { buildLead } = await import("../src/newlead.js");
const { scoreOpportunity } = await import("../src/scoring.js");
const { decide } = await import("../src/decision.js");
const { buildBrief, briefToMarkdown } = await import("../src/brief.js");
const { toDecisionCSV } = await import("../src/export.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("importer.test.mjs");

// === Parser: cabeceras EN ===
const en = parseLeads("company,website,industry,city,notes\nAcme Health,acme.com,Dental Clinics,Madrid,growing fast");
ok(en.hadHeader && en.total === 1, "EN: detecta cabecera y una fila");
ok(en.rows[0].company === "Acme Health" && en.rows[0].website === "https://acme.com", "EN: empresa + web normalizada");
ok(en.rows[0].sector === "Dental Clinics" && en.rows[0].city === "Madrid", "EN: sector y ciudad");
ok(en.fields.recognized.includes("company") && en.fields.recognized.includes("website"), "EN: campos reconocidos");

// === Parser: cabeceras ES ===
const es = parseLeads("empresa;web;sector;ciudad;notas\nBodega Norte;https://bodeganorte.es;Hostelería premium;Bilbao;reseñas buenas");
ok(es.rows[0].company === "Bodega Norte" && es.rows[0].website === "https://bodeganorte.es", "ES: empresa + web");
ok(es.rows[0].sector === "Hostelería premium" && es.rows[0].notes === "reseñas buenas", "ES: sector y notas libres");

// === Campos faltantes: no se inventan ===
const sparse = parseLeads("empresa,ciudad\nSolo Nombre,Valencia");
ok(sparse.rows[0].website === "" && sparse.rows[0].sector === "" && sparse.rows[0].notes === "", "faltantes quedan vacíos, no inventados");
ok(sparse.fields.missing.includes("website") && sparse.fields.missing.includes("sector"), "marca los campos que faltan");
ok(sparse.rows[0]._missing.includes("website"), "por fila, marca lo que falta");

// === URL detectada aunque no haya cabecera de web ===
const urlInline = parseLeads("nombre,extra\nFoo Inc,https://foo.io");
ok(urlInline.rows[0].website === "https://foo.io", "detecta URL en celda sin cabecera de web");

// === Sin cabecera: lista simple de nombres (+URL si la hay) ===
const headerless = parseLeads("Clínica Sur\nHotel Mar, hotelmar.com\nStartup X");
ok(!headerless.hadHeader && headerless.total === 3, "sin cabecera: tres leads");
ok(headerless.rows[1].company === "Hotel Mar" && headerless.rows[1].website === "https://hotelmar.com", "sin cabecera: separa nombre y URL");

// === normDomain ===
ok(normDomain("https://www.Acme.com/path?x=1") === "acme.com", "normaliza dominio (sin www/protocolo/ruta)");

// === Duplicados ===
const existing = [{ company: "Acme Health", website: "http://acme.com" }, { company: "Otra SL", website: "" }];
const dups = findDuplicates(en.rows.concat([{ company: "Otra SL", website: "" }]), existing);
ok(dups[0].dup && dups[0].reason === "website", "detecta duplicado por website (dominio)");
ok(dups[1].dup && dups[1].reason === "name", "detecta posible duplicado por nombre");
ok(findDuplicates([{ company: "Nueva", website: "nueva.com" }], existing)[0].dup === false, "no marca duplicado cuando no lo es");

// === Decisión: importado con poca info NO queda ACT_NOW ===
const lead = buildLead(rowToLeadInput(sparse.rows[0])); // solo nombre + ciudad
const scored = scoreOpportunity(lead);
const dec = decide(lead, scored);
ok(dec.decision !== "ACT_NOW", "lead importado pobre nunca es ACT_NOW por defecto");
ok(["NEEDS_EVIDENCE", "ENRICH", "WATCH", "NO_ACCESS", "KILL", "OVER_SERVED"].includes(dec.decision), "cae en decisión conservadora");
ok(dec.evidenceQuality.confirmed === 0, "desconocidos no cuentan como confirmados");

// === Sector crudo conservado (no se pierde, alimenta lentes) ===
ok(rowToLeadInput({ sector: "Longevity clinic" }).subsector === "Longevity clinic", "sector crudo preservado en subsector");
ok(rowToLeadInput({ sector: "Dental Clinics" }).sector === "health", "sector del motor inferido por palabra clave");
ok(rowToLeadInput({ sector: "" }).sector === "growth", "sin sector → growth conservador");

// === Las notas NO se vuelven evidencia confirmada ===
const withNotes = buildLead(rowToLeadInput({ company: "X", notes: "el dueño me dijo que crecen mucho" }));
ok((withNotes.evidence || []).length === 0, "las notas pegadas no crean evidencia (honestidad)");

// === Export CSV de decisión ===
const csv = toDecisionCSV([{ ...lead, scores: scored }], {});
const head = csv.split("\n")[0];
ok(/OCI/.test(head) && /Decisión/.test(head) && /ValorEstratégico/.test(head) && /KillReasons/.test(head), "CSV incluye OCI/decisión/tag/kill reasons");
ok(/CalidadEvidencia/.test(head) && /AcciónRecomendada/.test(head) && /ÁnguloEntrada/.test(head), "CSV incluye evidencia/acción/ángulo");
ok(csv.split("\n").length === 2, "CSV exporta la fila aunque falten campos");

// === Brief Markdown: no inventa lo desconocido ===
const brief = buildBrief(lead, scored, dec);
const md = briefToMarkdown(brief, "es");
ok(md.startsWith("# Opportunity Brief"), "Markdown con cabecera de brief");
ok(/No se sabe/.test(md), "lo desconocido se dice 'No se sabe', no se inventa");
ok(briefToMarkdown(brief, "en").includes("Unknown"), "variante EN usa 'Unknown'");
ok(briefToMarkdown(buildBrief({ company: "Y" }, {}, decide({ company: "Y" }, {}))).length > 0, "el brief MD funciona aunque falte casi todo");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
