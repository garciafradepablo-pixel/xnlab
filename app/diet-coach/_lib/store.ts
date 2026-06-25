"use client";
import { createContext, useContext } from "react";
import { useCallback as useCb, useEffect, useMemo, useRef, useState } from "react";
import type { AdjustLevel, DietState, LogEntry, Theme } from "./types";

const STORAGE_KEY = "dc-os-v1";
const VERSION = 1;

function today(): string {
  // Local calendar day, YYYY-MM-DD.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function freshState(): DietState {
  return {
    version: VERSION,
    date: today(),
    weightCurrent: 62,
    weightGoal: 77,
    theme: "dark",
    meals: {},
    supps: {},
    water: 0,
    shop: {},
    log: [],
  };
}

// Roll the daily fields over to a new day, keeping weight, theme,
// shopping and the tracking log.
function rollDay(state: DietState): DietState {
  return { ...state, date: today(), meals: {}, supps: {}, water: 0 };
}

function load(): DietState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = { ...freshState(), ...(JSON.parse(raw) as Partial<DietState>) };
    return parsed.date === today() ? parsed : rollDay(parsed);
  } catch {
    return freshState();
  }
}

export type DietApi = {
  state: DietState;
  toggleMeal: (id: string) => void;
  setMealAdjust: (id: string, adjust: AdjustLevel) => void;
  toggleSupp: (id: string) => void;
  addWater: (ml: number) => void;
  toggleShop: (duration: number, itemId: string) => void;
  resetShop: (duration: number) => void;
  setWeights: (current: number, goal: number) => void;
  upsertLog: (entry: LogEntry) => void;
  resetDay: () => void;
  toggleTheme: () => void;
};

export function useDietState(): DietApi {
  const [state, setState] = useState<DietState>(freshState);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount (client only) to avoid SSR mismatch.
  useEffect(() => {
    setState(load());
    hydrated.current = true;
  }, []);

  // Persist after every change, but only once hydrated.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [state]);

  const toggleMeal = useCb((id: string) => {
    setState((s) => {
      const cur = s.meals[id] ?? { done: false, adjust: "normal" as AdjustLevel };
      return { ...s, meals: { ...s.meals, [id]: { ...cur, done: !cur.done } } };
    });
  }, []);

  const setMealAdjust = useCb((id: string, adjust: AdjustLevel) => {
    setState((s) => {
      const cur = s.meals[id] ?? { done: false, adjust: "normal" as AdjustLevel };
      return { ...s, meals: { ...s.meals, [id]: { ...cur, adjust } } };
    });
  }, []);

  const toggleSupp = useCb((id: string) => {
    setState((s) => ({ ...s, supps: { ...s.supps, [id]: !s.supps[id] } }));
  }, []);

  const addWater = useCb((ml: number) => {
    setState((s) => ({ ...s, water: Math.max(0, s.water + ml) }));
  }, []);

  const toggleShop = useCb((duration: number, itemId: string) => {
    setState((s) => {
      const key = String(duration);
      const bucket = s.shop[key] ?? {};
      return { ...s, shop: { ...s.shop, [key]: { ...bucket, [itemId]: !bucket[itemId] } } };
    });
  }, []);

  const resetShop = useCb((duration: number) => {
    setState((s) => ({ ...s, shop: { ...s.shop, [String(duration)]: {} } }));
  }, []);

  const setWeights = useCb((current: number, goal: number) => {
    setState((s) => ({ ...s, weightCurrent: current, weightGoal: goal }));
  }, []);

  const upsertLog = useCb((entry: LogEntry) => {
    setState((s) => {
      const rest = s.log.filter((e) => e.date !== entry.date);
      const log = [...rest, entry].sort((a, b) => a.date.localeCompare(b.date));
      // Keep the dashboard weight in sync with the latest logged weight.
      const weightCurrent = entry.weight ?? s.weightCurrent;
      return { ...s, log, weightCurrent };
    });
  }, []);

  const resetDay = useCb(() => {
    setState((s) => ({ ...s, date: today(), meals: {}, supps: {}, water: 0 }));
  }, []);

  const toggleTheme = useCb(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : ("dark" as Theme) }));
  }, []);

  return useMemo(
    () => ({
      state,
      toggleMeal,
      setMealAdjust,
      toggleSupp,
      addWater,
      toggleShop,
      resetShop,
      setWeights,
      upsertLog,
      resetDay,
      toggleTheme,
    }),
    [state, toggleMeal, setMealAdjust, toggleSupp, addWater, toggleShop, resetShop, setWeights, upsertLog, resetDay, toggleTheme],
  );
}

export const DietContext = createContext<DietApi | null>(null);

export function useDiet(): DietApi {
  const ctx = useContext(DietContext);
  if (!ctx) throw new Error("useDiet must be used within DietContext");
  return ctx;
}

export { today };
