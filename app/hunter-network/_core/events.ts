// ---------------------------------------------------------------------------
// Hunter Network (HN) — operation event stream
//
// The live feed. Every autonomous action the engine takes appends one event
// here, append-only. Leaving the Overview open and watching this scroll is how
// the operator "sees the operations live" while the network runs overnight.
//
// In shadow these are simulated operations; in live they would be the same
// events from real actions. Same shape either way — parity holds at the feed
// level too, so a recorded shadow night is indistinguishable in structure from
// a live one.
// ---------------------------------------------------------------------------

import type { HNMode } from "./ports";

export type OpEventKind =
  | "tick_started"
  | "lead_generated"
  | "lead_assigned"
  | "call_placed"
  | "call_scored"
  | "meeting_booked"
  | "lead_closed"
  | "evaluation_progressed"
  | "evaluation_decided"
  | "hunter_reclassified"
  | "brand_risk_flagged"
  | "wallet_movement"
  | "tick_completed"
  | "blocked";

export interface OpEvent {
  id: string;
  tick: number;
  mode: HNMode;
  kind: OpEventKind;
  hunter_id: string | null;
  campaign_id: string | null;
  lead_id: string | null;
  // Human-readable one-liner shown in the feed, e.g.
  // "hnt_7 · llamada puntuada 84.2 · meeting_booked".
  message: string;
  // Optional numeric payload (score, amount…) for compact rendering.
  value: number | null;
  created_at: string;
}

// Ring buffer so an unattended overnight run can't grow memory without bound.
const MAX_EVENTS = 1000;

const globalForEvents = globalThis as unknown as {
  __hnEvents?: OpEvent[];
  __hnTick?: number;
};

export function eventLog(): OpEvent[] {
  return (globalForEvents.__hnEvents ??= []);
}

export function currentTick(): number {
  return (globalForEvents.__hnTick ??= 0);
}

export function setTick(n: number): void {
  globalForEvents.__hnTick = n;
}

let counter = 0;

export function emit(e: Omit<OpEvent, "id" | "created_at">): OpEvent {
  const log = eventLog();
  const event: OpEvent = {
    ...e,
    id: `op_${e.tick}_${counter++}`,
    created_at: new Date().toISOString(),
  };
  log.push(event);
  if (log.length > MAX_EVENTS) log.splice(0, log.length - MAX_EVENTS);
  return event;
}

// Most-recent-first slice for the feed.
export function recentEvents(limit = 60): OpEvent[] {
  const log = eventLog();
  return log.slice(Math.max(0, log.length - limit)).reverse();
}
