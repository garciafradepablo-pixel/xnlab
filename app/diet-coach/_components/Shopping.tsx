"use client";
import { useState } from "react";
import { SHOP, SHOP_DURATIONS, scaleQty } from "../_data/shopping";
import type { Priority, ShopDuration } from "../_lib/types";
import { useDiet } from "../_lib/store";
import { Card, Check, Pill, SectionTitle, Segmented } from "./ui";

const PRIORITY_TONE: Record<Priority, "green" | "orange" | "muted"> = {
  imprescindible: "green",
  recomendable: "orange",
  opcional: "muted",
};

export function Shopping() {
  const { state, toggleShop, resetShop } = useDiet();
  const [days, setDays] = useState<ShopDuration>(7);
  const bucket = state.shop[String(days)] ?? {};

  const total = SHOP.reduce((n, c) => n + c.items.length, 0);
  const bought = Object.values(bucket).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Compra" sub="Cantidades ajustadas a la duración elegida." />

      <Segmented
        options={SHOP_DURATIONS.map((d) => ({ value: d, label: `${d}d` }))}
        value={days}
        onChange={(v) => setDays(v as ShopDuration)}
      />

      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] text-[var(--dc-muted)]">
          {bought}/{total} comprado · plan de {days} días
        </span>
        <button type="button" onClick={() => resetShop(days)} className="text-[12px] font-semibold text-[var(--dc-orange)]">
          Vaciar
        </button>
      </div>

      {SHOP.map((cat) => (
        <Card key={cat.id} className="!p-4">
          <h3 className="mb-3 text-[15px] font-bold uppercase tracking-wide text-[var(--dc-muted)]">{cat.name}</h3>
          <ul className="flex flex-col gap-3">
            {cat.items.map((item) => {
              const checked = !!bucket[item.id];
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <Check checked={checked} onClick={() => toggleShop(days, item.id)} label={`Comprado ${item.name}`} />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[15px] font-semibold text-[var(--dc-text)] ${checked ? "line-through decoration-[var(--dc-muted)]" : ""}`}>
                        {item.name}
                      </span>
                      <span className="shrink-0 text-[14px] font-bold text-[var(--dc-text)]">
                        {scaleQty(item.qtyBase, item.perDays, item.unit, days)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Pill tone={PRIORITY_TONE[item.priority]}>{item.priority}</Pill>
                      {item.alt && item.alt !== "—" && (
                        <span className="text-[12px] text-[var(--dc-muted)]">alt: {item.alt}</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
