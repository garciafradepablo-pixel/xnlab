// productivity.test.mjs — Marcador de productividad/competitividad (puro).
import { buildLeaderboard, WEIGHTS } from "../src/productivity.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("productivity.test.mjs");

const users = [
  { name: "Pablo", color: "#c9a227" },
  { name: "Javi", color: "#4a9eff" },
  { name: "Sara", color: "#3fb950" },
];

const tracking = {
  a: { status: "interested", by: "Pablo" },
  b: { status: "meeting_booked", by: "Pablo" },
  c: { status: "called", by: "Javi" },
};
const learning = [
  { source: "crm", outcome: "won", by: "Pablo" },
  { source: "crm", outcome: "meeting_booked", by: "Pablo" },
  { source: "crm", outcome: "interested", by: "Javi" },
  { outcome: "won", by: null }, // sin autor → no cuenta
];
const msgStats = { javi: { name: "Javi", count: 10 } };

const board = buildLeaderboard(tracking, learning, users, msgStats);

ok(board.length === 3, "incluye a todo el equipo, aunque alguien tenga 0");
ok(board[0].name === "Pablo", "lidera quien cierra/reúne (Pablo)");

const pablo = board.find((r) => r.name === "Pablo");
ok(pablo.won === 1, "cuenta los cierres firmados");
ok(pablo.meetings === 1, "cuenta las reuniones firmadas");
ok(pablo.worked === 2, "cuenta las empresas tocadas (tracking por autor)");
const expected = Math.round((1 * WEIGHTS.won + 1 * WEIGHTS.meetings + 0 * WEIGHTS.interested + 2 * WEIGHTS.worked + 0 * WEIGHTS.messages) * 10) / 10;
ok(pablo.score === expected, `score de Pablo = ${expected} (fue ${pablo.score})`);

const javi = board.find((r) => r.name === "Javi");
ok(javi.messages === 10, "suma la actividad de mensajería");
ok(javi.interested === 1, "cuenta interesados firmados");

const sara = board.find((r) => r.name === "Sara");
ok(sara && sara.score === 0, "quien no ha hecho nada aparece con 0");

ok(buildLeaderboard({}, [], [], {}).length === 0, "sin datos → marcador vacío");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
