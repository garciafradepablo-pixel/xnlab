"use client";
import { EAT_OUT } from "../_data/eatingOut";
import { Card, Pill, SectionTitle } from "./ui";

export function EatingOut() {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Comidas fuera" sub="Opciones rápidas y altas en proteína · Tailandia." />
      {EAT_OUT.map((o) => (
        <Card key={o.id} className="!p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[16px] font-bold text-[var(--dc-text)]">{o.name}</h3>
          </div>
          <div className="mt-2 flex gap-2">
            <Pill tone="green">{o.protein} g prot</Pill>
            <Pill tone="orange">{o.kcal} kcal</Pill>
          </div>
          <dl className="mt-4 flex flex-col gap-3">
            <Row label="Pedir" tone="text" value={o.order} />
            <Row label="Añadir" tone="green" value={o.add} />
            <Row label="Evitar" tone="orange" value={o.avoid} />
          </dl>
        </Card>
      ))}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "text" | "green" | "orange" }) {
  const color = tone === "green" ? "text-[var(--dc-green)]" : tone === "orange" ? "text-[var(--dc-orange)]" : "text-[var(--dc-muted)]";
  return (
    <div className="flex gap-3">
      <dt className={`w-16 shrink-0 text-[12px] font-bold uppercase tracking-wide ${color}`}>{label}</dt>
      <dd className="flex-1 text-[14px] text-[var(--dc-text)]">{value}</dd>
    </div>
  );
}
