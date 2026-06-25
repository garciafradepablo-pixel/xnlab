"use client";
import { useState } from "react";
import { useDiet, today } from "../_lib/store";
import { computeAlerts, weightTrend } from "../_lib/nutrition";
import type { LogEntry, Score } from "../_lib/types";
import { Card, Pill, SectionTitle, Segmented } from "./ui";

const SCORES: { value: Score; label: string }[] = [1, 2, 3, 4, 5].map((n) => ({ value: n as Score, label: String(n) }));

export function Tracking() {
  const { state, upsertLog } = useDiet();
  const existing = state.log.find((e) => e.date === today());

  const [weight, setWeight] = useState<string>(existing?.weight != null ? String(existing.weight) : "");
  const [hunger, setHunger] = useState<Score>(existing?.hunger ?? 3);
  const [energy, setEnergy] = useState<Score>(existing?.energy ?? 3);
  const [digestion, setDigestion] = useState<Score>(existing?.digestion ?? 3);
  const [sleep, setSleep] = useState<Score>(existing?.sleep ?? 3);
  const [trained, setTrained] = useState<boolean>(existing?.trained ?? false);
  const [comment, setComment] = useState<string>(existing?.comment ?? "");
  const [saved, setSaved] = useState(false);

  const trend = weightTrend(state.log);
  const alerts = computeAlerts(state);

  function save() {
    const entry: LogEntry = {
      date: today(),
      weight: weight.trim() === "" ? null : Number(weight.replace(",", ".")),
      hunger,
      energy,
      digestion,
      sleep,
      trained,
      comment: comment.trim(),
    };
    upsertLog(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const history = [...state.log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Seguimiento" sub="Registra cómo va el día. Una entrada por fecha." />

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

      {trend && (
        <Card className="!p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-wide text-[var(--dc-muted)]">Tendencia de peso</span>
            <span className={`text-[16px] font-bold ${trend.delta >= 0 ? "text-[var(--dc-green)]" : "text-[var(--dc-orange)]"}`}>
              {trend.delta >= 0 ? "+" : ""}
              {trend.delta} kg
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[var(--dc-muted)]">{trend.first} kg → {trend.last} kg registrado</p>
        </Card>
      )}

      <Card>
        <label className="text-[12px] font-bold uppercase tracking-wide text-[var(--dc-muted)]">Peso de hoy (kg)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="62.0"
          className="mt-2 w-full rounded-2xl border border-[var(--dc-border-strong)] bg-[var(--dc-chip)] px-4 py-3 text-[20px] font-bold text-[var(--dc-text)] outline-none placeholder:text-[var(--dc-muted)]"
        />

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Hambre" value={hunger} onChange={setHunger} />
          <Field label="Energía" value={energy} onChange={setEnergy} />
          <Field label="Digestión" value={digestion} onChange={setDigestion} />
          <Field label="Sueño" value={sleep} onChange={setSleep} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[var(--dc-text)]">¿Entrenaste hoy?</span>
          <button
            type="button"
            onClick={() => setTrained((v) => !v)}
            className={`rounded-full px-5 py-2 text-[14px] font-bold transition-colors ${
              trained ? "bg-[var(--dc-green)] text-black" : "bg-[var(--dc-chip)] text-[var(--dc-muted)]"
            }`}
          >
            {trained ? "Sí" : "No"}
          </button>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentario libre…"
          rows={3}
          className="mt-5 w-full resize-none rounded-2xl border border-[var(--dc-border-strong)] bg-[var(--dc-chip)] px-4 py-3 text-[15px] text-[var(--dc-text)] outline-none placeholder:text-[var(--dc-muted)]"
        />

        <button
          type="button"
          onClick={save}
          className="mt-4 w-full rounded-2xl bg-[var(--dc-green)] py-4 text-[16px] font-bold text-black transition-transform active:scale-[0.98]"
        >
          {saved ? "Guardado ✓" : "Guardar registro"}
        </button>
      </Card>

      {history.length > 0 && (
        <Card className="!p-4">
          <h3 className="mb-3 text-[15px] font-bold uppercase tracking-wide text-[var(--dc-muted)]">Historial</h3>
          <ul className="flex flex-col gap-3">
            {history.map((e) => (
              <li key={e.date} className="flex items-center justify-between gap-2 border-b border-[var(--dc-border)] pb-2 last:border-0 last:pb-0">
                <div>
                  <span className="text-[14px] font-semibold text-[var(--dc-text)]">{e.date}</span>
                  {e.comment && <p className="text-[12px] text-[var(--dc-muted)]">{e.comment}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {e.trained && <Pill tone="green">entrenó</Pill>}
                  {e.weight != null && <span className="text-[15px] font-bold text-[var(--dc-text)]">{e.weight} kg</span>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: Score; onChange: (v: Score) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[var(--dc-text)]">{label}</span>
        <span className="text-[12px] text-[var(--dc-muted)]">1–5</span>
      </div>
      <Segmented options={SCORES} value={value} onChange={(v) => onChange(v as Score)} />
    </div>
  );
}
