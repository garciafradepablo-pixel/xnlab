"use client";
import { useState } from "react";
import { MEALS } from "../_data/meals";
import { useDiet } from "../_lib/store";
import { ADJUST_FACTOR, mealTotals } from "../_lib/nutrition";
import type { AdjustLevel } from "../_lib/types";
import { Card, Check, Pill, Segmented, SectionTitle } from "./ui";

const ADJUST_OPTS: { value: AdjustLevel; label: string }[] = [
  { value: "menos", label: "Comí menos" },
  { value: "normal", label: "Normal" },
  { value: "mas", label: "Comí más" },
];

export function MealPlan() {
  const { state, toggleMeal, setMealAdjust } = useDiet();
  const [open, setOpen] = useState<string | null>(MEALS[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle title="Plan de comidas" sub="Marca lo que comes. Ajusta la ración si comiste menos o más." />
      {MEALS.map((meal) => {
        const entry = state.meals[meal.id] ?? { done: false, adjust: "normal" as AdjustLevel };
        const base = mealTotals(meal.id);
        const f = ADJUST_FACTOR[entry.adjust];
        const kcal = Math.round(base.kcal * f);
        const protein = Math.round(base.protein * f);
        const isOpen = open === meal.id;
        return (
          <Card key={meal.id} className={`!p-4 ${entry.done ? "opacity-95" : ""}`}>
            <div className="flex items-center gap-3">
              <Check checked={entry.done} onClick={() => toggleMeal(meal.id)} label={`Marcar ${meal.name}`} />
              <button type="button" onClick={() => setOpen(isOpen ? null : meal.id)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <p className={`text-[16px] font-semibold text-[var(--dc-text)] ${entry.done ? "line-through decoration-[var(--dc-muted)]" : ""}`}>
                    {meal.name}
                  </p>
                  <p className="text-[12px] text-[var(--dc-muted)]">{meal.when}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="green">{protein} g</Pill>
                  <Pill tone="orange">{kcal} kcal</Pill>
                  <svg
                    className={`text-[var(--dc-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
            </div>

            {isOpen && (
              <div className="mt-4 border-t border-[var(--dc-border)] pt-3">
                <ul className="flex flex-col gap-2">
                  {meal.foods.map((food) => (
                    <li key={food.name} className="flex items-baseline justify-between gap-3">
                      <span className="text-[14px] text-[var(--dc-text)]">{food.name}</span>
                      <span className="shrink-0 text-[13px] text-[var(--dc-muted)]">{food.qty}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Segmented options={ADJUST_OPTS} value={entry.adjust} onChange={(v) => setMealAdjust(meal.id, v)} />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
