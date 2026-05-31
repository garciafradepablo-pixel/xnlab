// ---------------------------------------------------------------------------
// Hunter Network (HN) — Operational Core v1 · ports (shadow/live parity seam)
//
// THE central design rule of HN's autonomy layer:
//
//   The operations engine and the business rules (logic.ts) are IDENTICAL in
//   shadow mode and live mode. Only the *adapters behind these ports* change.
//
// That is what guarantees the property the operator asked for: "the results
// must be the same if we remove the hidden virtual world or switch on the real
// wallet." The engine never learns which world it is in — it only ever talks to
// these interfaces. Swap the adapter, not the logic.
//
//   HN_MODE = "shadow"  → deterministic simulated market / execution / wallet.
//                          The hidden virtual world. Runs while you sleep.
//   HN_MODE = "live"     → real market feed / real call execution / real wallet.
//                          Behind an OFF flag in v1; adapters are stubs that
//                          refuse until the integrations exist.
//
// Nothing here touches money or a real phone line. `live` adapters are declared
// so the shape is fixed, and throw `not_configured` if invoked.
// ---------------------------------------------------------------------------

import type { Campaign, CallOutcome, Hunter, Lead, TestCallScores } from "./types";

export type HNMode = "shadow" | "live";

// --- MarketPort -------------------------------------------------------------
// Where leads and demand come from, and how a contact attempt resolves. In
// shadow this is a deterministic model; in live it is a real lead source +
// telephony outcome.
export interface ContactAttempt {
  lead: Lead;
  hunter: Hunter;
  campaign: Campaign;
}

export interface ContactResult {
  outcome: CallOutcome;
  // Optional scored dimensions when the attempt produced a gradable call
  // (test-call context). Real telephony would attach a recording instead; the
  // shadow world derives scores deterministically.
  scores?: TestCallScores;
  recording_url?: string | null;
  duration_seconds: number;
  notes: string;
}

export interface MarketPort {
  readonly mode: HNMode;
  // Resolve a single contact attempt into an outcome. Deterministic in shadow.
  resolveContact(attempt: ContactAttempt, seed: number): ContactResult;
  // Generate fresh inbound leads for a campaign (demand). Deterministic in
  // shadow; a real source in live. May return [] when no new demand this tick.
  generateLeads(campaign: Campaign, seed: number): Omit<Lead, "id" | "created_at" | "updated_at">[];
}

// --- ExecutionPort ----------------------------------------------------------
// Carries out a decided action in the world: place the call, send the booking,
// record the disposition. In shadow it just records the intent; in live it
// drives the real channel.
export interface ExecutionPort {
  readonly mode: HNMode;
  placeCall(attempt: ContactAttempt): Promise<{ ok: boolean; ref: string }>;
  bookMeeting(lead: Lead, hunter: Hunter): Promise<{ ok: boolean; ref: string }>;
}

// --- WalletPort -------------------------------------------------------------
// Money. Access fees in, commissions/P&L out. In shadow this is a ledger of
// simulated euros that mirrors exactly what the real wallet would do; in live
// it is the real payment + payout rails. Autonomy over this port is gated:
// nothing here moves real money in v1.
export interface WalletEntry {
  kind: "access_fee" | "commission" | "cost";
  amount: number;
  currency: string;
  ref: string;
  note: string;
}

export interface WalletPort {
  readonly mode: HNMode;
  record(entry: WalletEntry): Promise<{ ok: boolean; balance: number }>;
  balance(): number;
}

// A bundle the engine receives — one set of ports per run. The engine is
// constructed with whichever bundle matches HN_MODE.
export interface PortBundle {
  mode: HNMode;
  market: MarketPort;
  execution: ExecutionPort;
  wallet: WalletPort;
}
