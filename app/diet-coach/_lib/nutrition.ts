import { MEALS, TARGETS } from "../_data/meals";
import type { AdjustLevel, DietState, LogEntry } from "./types";

// "Comí menos / normal / más" scales a meal's contribution.
export const ADJUST_FACTOR: Record<AdjustLevel, number> = {
  menos: 0.6,
  normal: 1,
  mas: 1.4,
};

export function mealTotals(mealId: string): { kcal: number; protein: number } {
  const meal = MEALS.find((m) => m.id === mealId);
  if (!meal) return { kcal: 0, protein: 0 };
  return meal.foods.reduce(
    (acc, f) => ({ kcal: acc.kcal + f.kcal, protein: acc.protein + f.protein }),
    { kcal: 0, protein: 0 },
  );
}

// Sum only the meals checked as done, applying their adjust factor.
export function dayTotals(state: DietState): { kcal: number; protein: number } {
  let kcal = 0;
  let protein = 0;
  for (const meal of MEALS) {
    const entry = state.meals[meal.id];
    if (!entry?.done) continue;
    const base = mealTotals(meal.id);
    const f = ADJUST_FACTOR[entry.adjust];
    kcal += base.kcal * f;
    protein += base.protein * f;
  }
  return { kcal: Math.round(kcal), protein: Math.round(protein) };
}

export type DayStatus = "Por debajo" | "En rango" | "Excelente";

export function dayStatus(kcal: number): DayStatus {
  if (kcal < TARGETS.kcalMin) return "Por debajo";
  if (kcal <= TARGETS.kcalMax) return "En rango";
  return "Excelente";
}

export type Alert = { id: string; tone: "warn" | "info"; text: string };

// Coaching rules — surface gentle, specific nudges.
export function computeAlerts(state: DietState): Alert[] {
  const alerts: Alert[] = [];
  const { kcal, protein } = dayTotals(state);
  const anyMealDone = Object.values(state.meals).some((m) => m?.done);

  if (anyMealDone && protein < TARGETS.proteinMin) {
    alerts.push({
      id: "protein",
      tone: "warn",
      text: `Proteína por debajo de ${TARGETS.proteinMin} g (${protein} g). Añade atún, huevos o un batido.`,
    });
  }
  if (anyMealDone && kcal < TARGETS.kcalMin) {
    alerts.push({
      id: "kcal",
      tone: "warn",
      text: `Calorías por debajo de ${TARGETS.kcalMin} kcal (${kcal}). Suma carbohidratos o grasas densas.`,
    });
  }

  // Weight stall — no increase over ~14 days.
  if (weightStalled(state.log)) {
    alerts.push({
      id: "stall",
      tone: "warn",
      text: "El peso no sube desde hace 14 días → sube 200–300 kcal/día.",
    });
  }

  // Digestion low several days running.
  if (digestionLow(state.log)) {
    alerts.push({
      id: "digestion",
      tone: "info",
      text: "Digestión baja varios días → reduce grasa, revisa lácteos o divide las comidas.",
    });
  }

  return alerts;
}

function withWeight(log: LogEntry[]): { date: string; weight: number }[] {
  return log
    .filter((e): e is LogEntry & { weight: number } => typeof e.weight === "number")
    .map((e) => ({ date: e.date, weight: e.weight as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86_400_000);
}

export function weightStalled(log: LogEntry[]): boolean {
  const w = withWeight(log);
  if (w.length < 2) return false;
  const latest = w[w.length - 1];
  // earliest entry at least 14 days before the latest
  const old = w.find((e) => daysBetween(e.date, latest.date) >= 14);
  if (!old) return false;
  return latest.weight <= old.weight;
}

export function digestionLow(log: LogEntry[]): boolean {
  const recent = log
    .filter((e) => typeof e.digestion === "number")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  return recent.length >= 3 && recent.every((e) => (e.digestion ?? 5) <= 2);
}

export function weightTrend(log: LogEntry[]): { first: number; last: number; delta: number } | null {
  const w = withWeight(log);
  if (w.length < 1) return null;
  const first = w[0].weight;
  const last = w[w.length - 1].weight;
  return { first, last, delta: Math.round((last - first) * 10) / 10 };
}
