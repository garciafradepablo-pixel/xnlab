"use client";
import { SUPPLEMENTS } from "../_data/supplements";
import { useDiet } from "../_lib/store";
import { Card, Check, Pill, SectionTitle } from "./ui";

export function Supplements() {
  const { state, toggleSupp } = useDiet();
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle title="Suplementos" sub="Checklist diario. Los marcados como condicionales solo si hacen falta." />
      {SUPPLEMENTS.map((s) => {
        const checked = !!state.supps[s.id];
        return (
          <Card key={s.id} className="!p-4">
            <div className="flex items-center gap-3">
              <Check checked={checked} onClick={() => toggleSupp(s.id)} label={`Marcar ${s.name}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-[16px] font-semibold text-[var(--dc-text)] ${checked ? "line-through decoration-[var(--dc-muted)]" : ""}`}>
                    {s.name}
                  </p>
                  {s.conditional && <Pill tone="muted">si hace falta</Pill>}
                </div>
                <p className="text-[12px] text-[var(--dc-muted)]">{s.timing}</p>
              </div>
              <span className="shrink-0 text-[14px] font-bold text-[var(--dc-text)]">{s.dose}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
