// ---------------------------------------------------------------------------
// Hunter Network (HN) — port adapters
//
// Two worlds behind one set of interfaces (ports.ts):
//
//   shadow* — the hidden virtual world. Deterministic, reproducible, free.
//             Models the real market faithfully so that engine output is the
//             same shape and distribution it would be live.
//   live*   — real money / real telephony / real lead source. STUBS in v1:
//             they refuse with `not_configured` because the integrations do not
//             exist in this repo yet. Declaring them fixes the contract so the
//             real implementation drops in without touching the engine.
//
// Parity contract: the engine calls the SAME methods regardless of mode. Only
// the object behind the port differs. Switching HN_MODE swaps the bundle.
// ---------------------------------------------------------------------------

import type {
  ContactAttempt,
  ContactResult,
  ExecutionPort,
  HNMode,
  MarketPort,
  PortBundle,
  WalletEntry,
  WalletPort,
} from "./ports";
import type { Campaign, CallOutcome, Lead, TestCallScores } from "./types";
import { hashSeed, mulberry32 } from "./rng";

// --- Shadow market ----------------------------------------------------------
// Resolves a contact attempt into a realistic outcome from the hunter's quality
// and the campaign's difficulty, deterministically. Higher hunter total_score
// and reliability → better outcomes; higher campaign risk → harder.
class ShadowMarket implements MarketPort {
  readonly mode: HNMode = "shadow";

  resolveContact(attempt: ContactAttempt, seed: number): ContactResult {
    const rnd = mulberry32(hashSeed(attempt.lead.id, attempt.hunter.id, seed));
    const r = rnd();

    // Skill in [0,1] from hunter headline score + reliability.
    const skill = (attempt.hunter.total_score / 100) * 0.7 + (attempt.hunter.reliability_score / 100) * 0.3;
    // Difficulty penalty by campaign risk band.
    const riskPenalty = { low: 0, medium: 0.08, high: 0.16, premium: 0.24 }[attempt.campaign.campaign_risk_level];
    const p = Math.max(0.05, Math.min(0.95, skill - riskPenalty));

    // Outcome ladder keyed off how far the draw beats the success probability.
    let outcome: CallOutcome;
    if (r < 0.12) outcome = "no_answer";
    else if (r < p * 0.35) outcome = "meeting_booked";
    else if (r < p * 0.6) outcome = "interested";
    else if (r < p * 0.9) outcome = "conversation_started";
    else if (r < 0.92) outcome = "not_interested";
    else outcome = "callback_requested";

    // Derive a gradable score block from skill, with bounded jitter.
    const base = Math.max(0, Math.min(10, skill * 10 + (rnd() - 0.5) * 1.5));
    const dim = (d: number) => Math.max(0, Math.min(10, Math.round((base + d) * 10) / 10));
    const scores: TestCallScores = {
      voice_score: dim(0),
      clarity_score: dim(0.3),
      energy_score: dim(-0.3),
      naturalness_score: dim(0),
      respect_score: dim(0.6),
      conversation_control_score: dim(-0.4),
      product_understanding_score: dim(0.1),
      qualification_questions_score: dim(-0.6),
      objection_handling_score: dim(-0.5),
      meeting_close_score: dim(outcome === "meeting_booked" ? 0.8 : -0.8),
      brand_care_score: dim(0.4),
      crm_accuracy_score: dim(0),
      discipline_score: dim(0.3),
    };

    return {
      outcome,
      scores,
      recording_url: null,
      duration_seconds: 120 + Math.round(rnd() * 240),
      notes: `[shadow] resultado simulado · p=${p.toFixed(2)} · draw=${r.toFixed(2)}`,
    };
  }

  generateLeads(campaign: Campaign, seed: number): Omit<Lead, "id" | "created_at" | "updated_at">[] {
    const rnd = mulberry32(hashSeed("demand", campaign.id, seed));
    // 0–2 fresh leads per tick, biased by campaign being active.
    const n = campaign.status === "active" ? Math.floor(rnd() * 3) : 0;
    return Array.from({ length: n }, (_, i) => ({
      campaign_id: campaign.id,
      company_name: `Lead simulado ${campaign.id}-${seed}-${i}`,
      contact_name: "Contacto",
      role: "Decisor",
      phone: "+34 900 000 000",
      email: "lead@example.com",
      website: "",
      sector: campaign.niche,
      country: campaign.market_country,
      city: "",
      status: "new" as const,
      assigned_hunter_id: null,
      call_result: "",
      next_action: "Asignar y contactar.",
      last_contacted_at: null,
      notes: "[shadow] demanda generada",
    }));
  }
}

// --- Shadow execution -------------------------------------------------------
class ShadowExecution implements ExecutionPort {
  readonly mode: HNMode = "shadow";
  async placeCall(attempt: ContactAttempt) {
    return { ok: true, ref: `shadow-call-${attempt.lead.id}` };
  }
  async bookMeeting(lead: Lead) {
    return { ok: true, ref: `shadow-meet-${lead.id}` };
  }
}

// --- Shadow wallet ----------------------------------------------------------
// A simulated euro ledger. Mirrors exactly what the real wallet would record,
// so P&L in shadow equals P&L in live for the same decisions. No real money.
class ShadowWallet implements WalletPort {
  readonly mode: HNMode = "shadow";
  private _balance = 0;
  private entries: WalletEntry[] = [];
  async record(entry: WalletEntry) {
    this.entries.push(entry);
    this._balance += entry.kind === "cost" ? -Math.abs(entry.amount) : Math.abs(entry.amount);
    return { ok: true, balance: this._balance };
  }
  balance() {
    return this._balance;
  }
}

// --- Live stubs (OFF in v1) -------------------------------------------------
// Same interfaces, real intent — but disabled. Each throws so that flipping the
// flag without wiring real integrations fails loudly instead of silently doing
// nothing. This is the seam where Stripe / telephony / real lead feeds attach.
const NOT_CONFIGURED = "hn_live_not_configured";

class LiveMarket implements MarketPort {
  readonly mode: HNMode = "live";
  resolveContact(): ContactResult {
    throw new Error(NOT_CONFIGURED);
  }
  generateLeads(): Omit<Lead, "id" | "created_at" | "updated_at">[] {
    throw new Error(NOT_CONFIGURED);
  }
}
class LiveExecution implements ExecutionPort {
  readonly mode: HNMode = "live";
  async placeCall(): Promise<{ ok: boolean; ref: string }> {
    throw new Error(NOT_CONFIGURED);
  }
  async bookMeeting(): Promise<{ ok: boolean; ref: string }> {
    throw new Error(NOT_CONFIGURED);
  }
}
class LiveWallet implements WalletPort {
  readonly mode: HNMode = "live";
  async record(): Promise<{ ok: boolean; balance: number }> {
    throw new Error(NOT_CONFIGURED);
  }
  balance() {
    return 0;
  }
}

// --- Bundle factory ---------------------------------------------------------
// The only place mode is read. Everything downstream is mode-agnostic.
export function makePortBundle(mode: HNMode): PortBundle {
  if (mode === "live") {
    return { mode, market: new LiveMarket(), execution: new LiveExecution(), wallet: new LiveWallet() };
  }
  return { mode: "shadow", market: new ShadowMarket(), execution: new ShadowExecution(), wallet: new ShadowWallet() };
}

// HN_MODE resolves from env, defaulting to the safe world. Live requires an
// explicit opt-in that does not exist yet — the stubs guarantee it can't move
// real money even if the flag is flipped by accident.
export function resolveMode(): HNMode {
  return process.env.HN_MODE === "live" ? "live" : "shadow";
}
