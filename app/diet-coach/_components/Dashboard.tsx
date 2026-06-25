"use client";
import { MEALS, TARGETS } from "../_data/meals";
import { SUPPLEMENTS } from "../_data/supplements";
import { useDiet } from "../_lib/store";
import { computeAlerts, dayStatus, dayTotals } from "../_lib/nutrition";
import { Card, ProgressBar, Stat, Pill } from "./ui";

export function Dashboard({ onGo }: { onGo: (tab: string) => void }) {
  const { state, addWater } = useDiet();
  const { kcal, protein } = dayTotals(state);
  const status = dayStatus(kcal);
  const alerts = computeAlerts(state);

  const mealsDone = MEALS.filter((m) => state.meals[m.id]?.done).length;
  const suppsCore = SUPPLEMENTS.filter((s) => !s.conditional);
  const suppsDone = SUPPLEMENTS.filter((s) => state.supps[s.id]).length;
  const waterPct = Math.min(100, Math.round((state.water / TARGETS.waterMl) * 100));

  const statusTone = status === "Por debajo" ? "orange" : "green";

  return (
    <div className="flex flex-col gap-4">
      {/* Weight header */}
      <Card>
        <div className="flex items-end justify-between">
          <Stat label="Peso actual" value={String(state.weightCurrent)} unit="kg" />
          <div className="flex flex-col items-center px-2">
            <span className="text-[11px] uppercase tracking-wide text-[var(--dc-muted)]">faltan</span>
            <span className="text-[18px] font-bold text-[var(--dc-orange)]">
              {Math.max(0, Math.round((state.weightGoal - state.weightCurrent) * 10) / 10)} kg
            </span>
          </div>
          <Stat label="Objetivo" value={String(state.weightGoal)} unit="kg" tone="green" />
        </div>
      </Card>

      {/* Day status banner */}
      <Card className="!p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[12px] uppercase tracking-wide text-[var(--dc-muted)]">Estado del día</span>
            <p className={`text-[22px] font-bold ${statusTone === "green" ? "text-[var(--dc-green)]" : "text-[var(--dc-orange)]"}`}>{status}</p>
          </div>
          <Pill tone={statusTone}>{kcal} kcal</Pill>
        </div>
      </Card>

      {/* Macros */}
      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <Stat label="Calorías" value={String(kcal)} unit="kcal" tone={kcal >= TARGETS.kcalMin ? "green" : "orange"} />
          <span className="text-[13px] text-[var(--dc-muted)]">objetivo {TARGETS.kcalMin}–{TARGETS.kcalMax}</span>
        </div>
        <ProgressBar value={kcal} max={4400} bandMin={TARGETS.kcalMin} bandMax={TARGETS.kcalMax} tone={kcal >= TARGETS.kcalMin ? "green" : "orange"} />

        <div className="mb-4 mt-6 flex items-baseline justify-between">
          <Stat label="Proteína" value={String(protein)} unit="g" tone={protein >= TARGETS.proteinMin ? "green" : "orange"} />
          <span className="text-[13px] text-[var(--dc-muted)]">objetivo {TARGETS.proteinMin}–{TARGETS.proteinMax}</span>
        </div>
        <ProgressBar value={protein} max={220} bandMin={TARGETS.proteinMin} bandMax={TARGETS.proteinMax} tone={protein >= TARGETS.proteinMin ? "green" : "orange"} />
      </Card>

      {/* Quick tiles */}
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => onGo("plan")} className="text-left">
          <Card className="!p-4 h-full">
            <span className="text-[12px] uppercase tracking-wide text-[var(--dc-muted)]">Comidas</span>
            <p className="mt-1 text-[26px] font-bold text-[var(--dc-text)]">
              {mealsDone}<span className="text-[16px] text-[var(--dc-muted)]">/{MEALS.length}</span>
            </p>
          </Card>
        </button>
        <button type="button" onClick={() => onGo("supps")} className="text-left">
          <Card className="!p-4 h-full">
            <span className="text-[12px] uppercase tracking-wide text-[var(--dc-muted)]">Suplementos</span>
            <p className="mt-1 text-[26px] font-bold text-[var(--dc-text)]">
              {suppsDone}<span className="text-[16px] text-[var(--dc-muted)]">/{suppsCore.length}+</span>
            </p>
          </Card>
        </button>
      </div>

      {/* Water */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[12px] uppercase tracking-wide text-[var(--dc-muted)]">Agua</span>
            <p className="text-[22px] font-bold text-[var(--dc-text)]">
              {(state.water / 1000).toFixed(1)} <span className="text-[14px] text-[var(--dc-muted)]">/ {(TARGETS.waterMl / 1000).toFixed(1)} L</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addWater(-250)}
              className="h-11 w-11 rounded-full border border-[var(--dc-border-strong)] text-[20px] font-bold text-[var(--dc-muted)]"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => addWater(250)}
              className="h-11 w-11 rounded-full bg-[var(--dc-green)] text-[20px] font-bold text-black"
            >
              +
            </button>
          </div>
        </div>
        <ProgressBar value={state.water} max={TARGETS.waterMl} tone="green" />
        <p className="mt-2 text-[12px] text-[var(--dc-muted)]">{waterPct}% · +250 ml por vaso</p>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border px-4 py-3 text-[13px] font-medium ${
                a.tone === "warn"
                  ? "border-[var(--dc-orange)] bg-[var(--dc-orange-soft)] text-[var(--dc-orange)]"
                  : "border-[var(--dc-border)] bg-[var(--dc-chip)] text-[var(--dc-text)]"
              }`}
            >
              {a.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
