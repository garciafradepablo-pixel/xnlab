// ---------------------------------------------------------------------------
// Hunter Network (HN) — enum → visual tone mapping
//
// One place that decides what colour each status/level/risk reads as, so badges
// stay consistent across every section. Kept separate from primitives so it can
// be imported by server components without pulling in "use client".
// ---------------------------------------------------------------------------

import type {
  BrandRiskLevel,
  CampaignRiskLevel,
  CampaignStatus,
  EvaluationStatus,
  HunterLevel,
  HunterStatus,
  LeadStatus,
} from "../_core/types";
import type { Tone } from "./primitives";

export function brandRiskTone(r: BrandRiskLevel): Tone {
  return r === "low" ? "good" : r === "medium" ? "warn" : "bad";
}

export function levelTone(l: HunterLevel): Tone {
  if (l === "none") return "neutral";
  if (l === "partner" || l === "hunter") return "accent";
  if (l === "active") return "good";
  return "info";
}

export function hunterStatusTone(s: HunterStatus): Tone {
  switch (s) {
    case "partner":
    case "hunter":
      return "accent";
    case "active":
      return "good";
    case "junior":
    case "trainee":
    case "in_evaluation":
    case "under_review":
    case "ready_for_evaluation":
      return "info";
    case "not_qualified":
    case "suspended":
    case "banned":
      return "bad";
    default:
      return "neutral";
  }
}

export function evalStatusTone(s: EvaluationStatus): Tone {
  switch (s) {
    case "completed":
      return "good";
    case "in_progress":
    case "ready":
      return "info";
    case "failed":
    case "cancelled":
      return "bad";
    case "under_review":
      return "warn";
    default:
      return "neutral";
  }
}

export function campaignStatusTone(s: CampaignStatus): Tone {
  return s === "active" ? "good" : s === "draft" ? "neutral" : s === "paused" ? "warn" : "neutral";
}

export function campaignRiskTone(r: CampaignRiskLevel): Tone {
  return r === "low" ? "good" : r === "medium" ? "warn" : r === "premium" ? "accent" : "bad";
}

export function leadStatusTone(s: LeadStatus): Tone {
  switch (s) {
    case "closed_won":
    case "meeting_booked":
      return "good";
    case "interested":
      return "info";
    case "no_answer":
    case "callback_requested" as LeadStatus:
      return "warn";
    case "not_interested":
    case "closed_lost":
    case "do_not_contact":
    case "invalid":
      return "bad";
    default:
      return "neutral";
  }
}
