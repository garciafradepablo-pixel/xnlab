// Tests de growth.js: fortalezas (nivel 1–5), frenos ("perezas") con recorrido
// open→working→closed, cierre de freno → nueva potencia, y resumen/impulso.
import {
  emptyProfile, addStrength, setStrengthLevel, removeStrength,
  addFriction, setFrictionStatus, advanceFriction, removeFriction,
  closeFrictionToStrength, summary, FRICTION_STATUS,
  logCritical, setCriticalLevel, removeCritical, criticalSummary, criticalPrompt, weeklyCriticalPrompt, CRITICAL_PROMPTS,
} from "../src/growth.js";

let passed = 0, failed = 0;
function ok(c, m) { if (c) { passed++; } else { failed++; console.error("FAIL:", m); } }
function eq(a, b, m) { ok(a === b, `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// ---- fortalezas -------------------------------------------------------------
{
  let p = emptyProfile("Pablo");
  eq(p.owner, "Pablo", "perfil del dueño");
  p = addStrength(p, "Dirección creativa", 4);
  eq(p.strengths.length, 1, "añade fortaleza");
  eq(p.strengths[0].level, 4, "guarda el nivel");
  p = addStrength(p, "   "); // vacío
  eq(p.strengths.length, 1, "ignora etiqueta vacía");
  const id = p.strengths[0].id;
  p = setStrengthLevel(p, id, 9);
  eq(p.strengths[0].level, 5, "nivel se limita a 5");
  p = setStrengthLevel(p, id, 0);
  eq(p.strengths[0].level, 1, "nivel se limita a 1");
  p = removeStrength(p, id);
  eq(p.strengths.length, 0, "elimina fortaleza");
}

// ---- frenos: recorrido open→working→closed ----------------------------------
{
  let p = emptyProfile("Javi");
  p = addFriction(p, "Me cuesta cerrar propuestas a tiempo", "tiende a perfeccionar");
  eq(p.frictions.length, 1, "añade freno");
  eq(p.frictions[0].status, "open", "nace detectado");
  const id = p.frictions[0].id;

  p = advanceFriction(p, id);
  eq(p.frictions[0].status, "working", "avanza a 'en ello'");
  p = advanceFriction(p, id);
  eq(p.frictions[0].status, "closed", "avanza a 'superado'");
  ok(!!p.frictions[0].closedAt, "sella la fecha de cierre");
  p = advanceFriction(p, id);
  eq(p.frictions[0].status, "closed", "no pasa de superado");

  p = setFrictionStatus(p, id, "working");
  ok(!p.frictions[0].closedAt, "reabrir limpia el sello de cierre");
  p = setFrictionStatus(p, id, "inventado");
  eq(p.frictions[0].status, "working", "estado inválido se ignora");
}

// ---- cerrar freno → nueva potencia ------------------------------------------
{
  let p = emptyProfile("Pablo");
  p = addFriction(p, "Evito las llamadas en frío");
  const fid = p.frictions[0].id;
  p = closeFrictionToStrength(p, fid, "Apertura de llamadas en frío", 2);
  eq(p.frictions[0].status, "closed", "el freno queda superado");
  eq(p.strengths.length, 1, "nace una fortaleza");
  eq(p.strengths[0].label, "Apertura de llamadas en frío", "con la etiqueta dada");
  eq(p.strengths[0].bornFrom, "Evito las llamadas en frío", "deja traza de su origen");
  // sin etiqueta usa una por defecto
  p = addFriction(p, "Procrastino el papeleo");
  const fid2 = p.frictions[1].id;
  p = closeFrictionToStrength(p, fid2, "");
  ok(p.strengths[1].label.includes("Superé:"), "etiqueta por defecto al cerrar");
}

// ---- resumen / impulso ------------------------------------------------------
{
  let p = emptyProfile("Pablo");
  eq(summary(p).momentum, 0, "sin frenos → impulso 0");
  p = addStrength(p, "A", 4); p = addStrength(p, "B", 2);
  eq(summary(p).avgLevel, 3, "nivel medio");
  p = addFriction(p, "f1"); p = addFriction(p, "f2"); p = addFriction(p, "f3"); p = addFriction(p, "f4");
  p = setFrictionStatus(p, p.frictions[0].id, "closed");
  p = setFrictionStatus(p, p.frictions[1].id, "working");
  const s = summary(p);
  eq(s.strengths, 2, "cuenta fortalezas");
  eq(s.open, 2, "frenos abiertos");
  eq(s.working, 1, "frenos en curso");
  eq(s.closed, 1, "frenos superados");
  eq(s.momentum, 25, "impulso = superados/total (1/4)");
}

// ---- pensamiento crítico ----------------------------------------------------
{
  let p = emptyProfile("Pablo");
  ok(p.critical && p.critical.level === 1, "el perfil nace con pensamiento crítico nivel 1");
  eq(criticalSummary(p).total, 0, "sin retos al inicio");

  p = logCritical(p, { kind: "assumption", note: "Asumí que el cliente quería web; no lo confirmé" });
  eq(p.critical.log.length, 1, "registra un reto");
  eq(p.critical.log[0].kind, "assumption", "guarda el tipo");
  p = logCritical(p, { kind: "ojo" }); // tipo inválido → assumption
  eq(p.critical.log[0].kind, "assumption", "tipo inválido cae a 'supuesto'");
  p = logCritical(p, { kind: "contrarian" });
  eq(p.critical.level, 2, "cada 3 retos sube un nivel (3→2)");

  const id = p.critical.log[0].id;
  p = removeCritical(p, id);
  eq(p.critical.log.length, 2, "elimina un reto");
  ok(p.critical.level === 2, "el nivel alcanzado no baja al borrar");

  p = setCriticalLevel(p, 9);
  eq(p.critical.level, 5, "nivel se limita a 5");

  // resumen integra el pensamiento crítico
  eq(summary(p).critical.level, 5, "summary expone el nivel crítico");

  // provocación estable por día e index válido
  ok(CRITICAL_PROMPTS.includes(criticalPrompt(new Date("2026-06-01"))), "la provocación sale del set");
  eq(criticalPrompt(new Date("2026-06-01")), criticalPrompt(new Date("2026-06-01")), "misma fecha → misma provocación");

  // reto SEMANAL: igual toda la semana (compartido), distinto a la siguiente.
  ok(CRITICAL_PROMPTS.includes(weeklyCriticalPrompt(new Date("2026-06-01"))), "el reto semanal sale del set");
  let mon = new Date("2026-06-01T12:00:00Z");
  while (mon.getUTCDay() !== 1) mon = new Date(mon.getTime() + 86400000); // localiza un lunes
  const sun = new Date(mon.getTime() + 6 * 86400000);
  const nextMon = new Date(mon.getTime() + 7 * 86400000);
  eq(weeklyCriticalPrompt(mon), weeklyCriticalPrompt(sun), "lunes→domingo de la misma semana → mismo reto");
  ok(weeklyCriticalPrompt(mon) !== weeklyCriticalPrompt(nextMon), "la semana siguiente → reto distinto");
}

console.log(`growth.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
