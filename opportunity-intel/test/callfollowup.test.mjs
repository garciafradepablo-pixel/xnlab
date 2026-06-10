// callfollowup.test.mjs — Follow-ups automáticos desde llamadas (lógica pura).

const { parseFollowUpDate, buildFollowUpTask, dueFollowupTasks } = await import("../src/callfollowup.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("callfollowup.test.mjs");

// Fecha de referencia fija (miércoles 10 jun 2026), inyectada para determinismo.
const REF = new Date(2026, 5, 10);
const pad = (x) => String(x).padStart(2, "0");
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const plus = (n) => { const d = new Date(2026, 5, 10); d.setDate(d.getDate() + n); return fmt(d); };

// --- parseFollowUpDate: formas relativas ---
ok(parseFollowUpDate("te llamo mañana sin falta", REF) === plus(1), "mañana → +1 día");
ok(parseFollowUpDate("hablamos pasado mañana", REF) === plus(2), "pasado mañana → +2 días");
ok(parseFollowUpDate("lo vemos hoy mismo", REF) === plus(0), "hoy → +0");
ok(parseFollowUpDate("la semana que viene te cuento", REF) === plus(7), "semana que viene → +7");
ok(parseFollowUpDate("llámame en 3 días", REF) === plus(3), "en 3 días → +3");
ok(parseFollowUpDate("en una semana lo retomamos", REF) === plus(7), "en una semana → +7");
ok(parseFollowUpDate("en 2 semanas", REF) === plus(14), "en 2 semanas → +14");

// día de la semana: próxima ocurrencia estricta (1..7 días), y es el día pedido
const lunes = parseFollowUpDate("nos vemos el lunes", REF);
const dLunes = new Date(lunes + "T00:00:00");
ok(dLunes.getDay() === 1, "el lunes → cae en lunes");
ok(lunes > fmt(REF) && lunes <= plus(7), "el lunes → próxima ocurrencia dentro de 7 días");

// fecha explícita
ok(parseFollowUpDate("quedamos el 25/12", REF) === "2026-12-25", "fecha explícita dd/mm");
ok(parseFollowUpDate("el 03-07-2026 te llamo", REF) === "2026-07-03", "fecha explícita dd-mm-yyyy");

// --- honestidad: sin fecha clara → null, y "por la mañana" NO es un día ---
ok(parseFollowUpDate("me lo pienso y ya te digo", REF) === null, "sin fecha → null (no inventa)");
ok(parseFollowUpDate("", REF) === null, "texto vacío → null");
ok(parseFollowUpDate("te llamo por la mañana", REF) === null, "'por la mañana' (franja) no es un día");
ok(parseFollowUpDate("mañana por la mañana", REF) === plus(1), "'mañana por la mañana' sí es +1 día");

// --- buildFollowUpTask: llamada con follow-up crea tarea ---
const call = {
  id: "call_x1", leadId: "lead_9", by: "Pablo",
  transcript: "Perfecto, llámame el lunes que lo comento con mi socio.",
  analysis: { nextStep: "Llamar el lunes con el decisor", urgency: "alta", closeProbability: 72, objections: ["Necesito consultarlo"] },
};
const lead = { id: "lead_9", company: "Bodega Norte" };
const t = buildFollowUpTask(call, lead, { refDate: REF });
ok(t && t.type === "follow_up", "crea tarea de tipo follow_up");
ok(t.leadId === "lead_9" && t.callId === "call_x1", "asocia lead y llamada");
ok(t.id === "fu_call_x1", "id determinista por llamada");
ok(t.status === "todo", "nace pendiente (todo)");
ok(t.priority === "alta", "prioridad inferida de la urgencia/cierre");
ok(t.title.includes("Bodega Norte"), "título claro con la empresa");
ok(t.note === "Llamar el lunes con el decisor", "guarda el siguiente paso como nota");
const td = new Date(t.dueDate + "T00:00:00");
ok(td.getDay() === 1, "fecha de la tarea cae en lunes");

// --- llamada SIN follow-up no crea tarea ---
const noDate = buildFollowUpTask(
  { id: "call_x2", leadId: "l", transcript: "lo dejamos pendiente", analysis: { nextStep: "Esperar" } },
  { company: "X" }, { refDate: REF }
);
ok(noDate === null, "sin fecha clara → no crea tarea");

// --- la fecha explícita del análisis (LLM) manda sobre el texto ---
const llm = buildFollowUpTask(
  { id: "c3", leadId: "l", transcript: "mañana", analysis: { followUpDate: "2026-09-01" } },
  { company: "Y" }, { refDate: REF }
);
ok(llm.dueDate === "2026-09-01", "followUpDate explícito del análisis tiene prioridad");

// --- guardar dos veces / editar no duplica (id estable → upsert) ---
const t1 = buildFollowUpTask(call, lead, { refDate: REF });
const t2 = buildFollowUpTask({ ...call, transcript: "mejor el lunes, te confirmo" }, lead, { refDate: REF });
ok(t1.id === t2.id, "misma llamada → mismo id (upsert, no duplica)");

// --- dueFollowupTasks: aparece en Hoy/Agenda; ordena por fecha; ignora hechas ---
const tasks = [
  { id: "fu_a", type: "follow_up", status: "todo", dueDate: "2026-06-08" },
  { id: "fu_b", type: "follow_up", status: "todo", dueDate: "2026-06-10" },
  { id: "fu_c", type: "follow_up", status: "done", dueDate: "2026-06-09" },
  { id: "fu_future", type: "follow_up", status: "todo", dueDate: "2026-06-20" },
  { id: "plain", type: undefined, status: "todo", dueDate: "2026-06-09" },
];
const due = dueFollowupTasks(tasks, "2026-06-10");
ok(due.map((x) => x.id).join(",") === "fu_a,fu_b", "trae solo follow-ups pendientes que tocan hoy/vencidos, ordenados");
ok(!due.some((x) => x.id === "fu_c"), "ignora las hechas");
ok(!due.some((x) => x.id === "fu_future"), "no adelanta las futuras");

// --- no rompe llamadas/tareas viejas: tarea sin type ni dueDate se ignora limpio ---
ok(dueFollowupTasks([{ id: "old", status: "todo" }], "2026-06-10").length === 0, "tarea antigua sin campos nuevos no estorba");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
