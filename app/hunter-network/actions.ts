"use server";

// ---------------------------------------------------------------------------
// Hunter Network (HN) — server actions
//
// The bridge between the operator console and the autonomous engine. v1 exposes
// the read snapshot the dashboard renders, and a `tick` action that advances
// the network one step and returns the fresh snapshot + the events that step
// produced. Polling this on an interval is how "leave it running and watch the
// operations live" works without a websocket in v1.
//
// PARITY: the action picks the PortBundle from HN_MODE and hands it to the same
// engine. It never branches on mode itself — shadow and live take the identical
// path here.
// ---------------------------------------------------------------------------

import { hnRepo } from "./_core/repo";
import { makePortBundle, resolveMode } from "./_core/adapters";
import { runTick } from "./_core/engine";
import { recentEvents, type OpEvent } from "./_core/events";
import { buildOverview, riskyHunters, topHunters } from "./_core/logic";
import type { Hunter, OverviewStats, CommercialAccessEvaluation, Campaign } from "./_core/types";

export interface OverviewSnapshot {
  mode: "shadow" | "live";
  stats: OverviewStats;
  recentCandidates: Hunter[];
  evaluationsNeedingReview: CommercialAccessEvaluation[];
  topHunters: Hunter[];
  riskyHunters: Hunter[];
  activeCampaigns: Campaign[];
  events: OpEvent[];
}

// Build the full Overview projection from current repo state. Pure read.
export async function getOverviewSnapshot(): Promise<OverviewSnapshot> {
  const hunters = hnRepo.getHunters();
  const evaluations = hnRepo.getEvaluations();
  const campaigns = hnRepo.getCampaigns();
  const leads = hnRepo.getLeads();

  return {
    mode: resolveMode(),
    stats: buildOverview(hunters, evaluations, campaigns, leads),
    recentCandidates: [...hunters]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 6),
    evaluationsNeedingReview: evaluations.filter(
      (e) => e.evaluation_status === "under_review" || (e.evaluation_status === "in_progress" && e.completed_calls_count >= e.assigned_test_leads_count),
    ),
    topHunters: topHunters(hunters, 5),
    riskyHunters: riskyHunters(hunters).slice(0, 5),
    activeCampaigns: campaigns.filter((c) => c.status === "active"),
    events: recentEvents(40),
  };
}

// Advance the network one tick and return the fresh snapshot. This is the
// autonomous step — runs the same in shadow and live; live is gated by the
// stub adapters refusing until integrations exist.
export async function tick(): Promise<OverviewSnapshot> {
  const mode = resolveMode();
  const ports = makePortBundle(mode);
  try {
    await runTick(hnRepo, ports);
  } catch (e) {
    // Live stubs throw `hn_live_not_configured` on purpose. Surface nothing
    // destructive — just return the snapshot; the feed already shows the block.
    if (!(e instanceof Error) || e.message !== "hn_live_not_configured") throw e;
  }
  return getOverviewSnapshot();
}
