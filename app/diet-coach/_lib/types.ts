// Diet Coach OS — shared types.
// Everything is local-first: the whole app state lives in one
// localStorage record and is hydrated on the client.

export type AdjustLevel = "menos" | "normal" | "mas";

export type Priority = "imprescindible" | "recomendable" | "opcional";

export type Score = 1 | 2 | 3 | 4 | 5;

export type Theme = "dark" | "light";

export type ShopDuration = 3 | 4 | 7 | 14 | 30;

// --- Static plan shapes (hardcoded in _data) ---

export type FoodItem = {
  name: string;
  qty: string;
  kcal: number;
  protein: number;
};

export type Meal = {
  id: string;
  name: string;
  when: string;
  foods: FoodItem[];
};

export type Supplement = {
  id: string;
  name: string;
  dose: string;
  timing: string;
  // Conditional supplements are only taken "if needed" and are shown
  // muted so they don't read as a daily obligation.
  conditional?: boolean;
};

export type ShopItem = {
  id: string;
  name: string;
  // Base quantity for `perDays` days — scaled to the chosen duration.
  qtyBase: number;
  unit: string;
  perDays: number;
  priority: Priority;
  alt?: string;
};

export type ShopCategory = {
  id: string;
  name: string;
  items: ShopItem[];
};

export type EatOption = {
  id: string;
  name: string;
  order: string;
  add: string;
  avoid: string;
  protein: number;
  kcal: number;
};

// --- Mutable per-day / persisted state ---

export type LogEntry = {
  date: string; // YYYY-MM-DD
  weight: number | null;
  hunger: Score | null;
  energy: Score | null;
  digestion: Score | null;
  sleep: Score | null;
  trained: boolean;
  comment: string;
};

export type DietState = {
  version: number;
  date: string; // the day the daily fields belong to (YYYY-MM-DD)
  weightCurrent: number;
  weightGoal: number;
  theme: Theme;
  // daily, reset at midnight
  meals: Record<string, { done: boolean; adjust: AdjustLevel }>;
  supps: Record<string, boolean>;
  water: number; // ml consumed today
  // persistent
  shop: Record<string, Record<string, boolean>>; // `${duration}` -> itemId -> bought
  log: LogEntry[];
};
