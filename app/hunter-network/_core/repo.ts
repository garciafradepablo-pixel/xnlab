// ---------------------------------------------------------------------------
// Hunter Network (HN) — Operational Core v1 · persistence seam
//
// `HNRepository` is the interface the whole module talks to. v1 ships an
// in-memory implementation seeded from seed.ts; when HN gets a real database
// (Supabase/Postgres), implement the same interface against it and nothing in
// the UI changes. This is the extraction seam that lets HN become a standalone
// product later.
//
// v1 persistence reality: a module-level singleton store. It survives within a
// single server process but resets on cold start — acceptable for an internal
// operating console with seeded data, and the same trade-off the rest of this
// repo already makes (see /network and /contact rate-limit Maps). No PII is
// written to disk.
// ---------------------------------------------------------------------------

import type {
  Campaign,
  CommercialAccessEvaluation,
  DecisionLogEntry,
  Hunter,
  HNSettings,
  Lead,
  TestCall,
} from "./types";
import { DEFAULT_SETTINGS } from "./settings";
import { SEED } from "./seed";

// The full dataset shape the repository owns.
export interface HNData {
  hunters: Hunter[];
  evaluations: CommercialAccessEvaluation[];
  testCalls: TestCall[];
  campaigns: Campaign[];
  leads: Lead[];
  decisionLog: DecisionLogEntry[];
  settings: HNSettings;
}

// Read-only repository contract for v1. Mutations will be added per-section in
// later phases (and routed through server actions); the read surface is enough
// to render every screen of the Overview and the list/profile views.
export interface HNRepository {
  getAll(): HNData;
  getHunters(): Hunter[];
  getHunter(id: string): Hunter | undefined;
  getEvaluations(): CommercialAccessEvaluation[];
  getEvaluationsForHunter(hunterId: string): CommercialAccessEvaluation[];
  getTestCalls(): TestCall[];
  getTestCallsForHunter(hunterId: string): TestCall[];
  getCampaigns(): Campaign[];
  getCampaign(id: string): Campaign | undefined;
  getLeads(): Lead[];
  getLeadsForCampaign(campaignId: string): Lead[];
  getLeadsForHunter(hunterId: string): Lead[];
  getDecisionLog(): DecisionLogEntry[];
  getDecisionLogForHunter(hunterId: string): DecisionLogEntry[];
  getSettings(): HNSettings;

  // --- Mutations -----------------------------------------------------------
  // Used by server actions and the autonomous engine. Kept narrow on purpose:
  // the engine mutates the same store the UI reads, so a tick taken while you
  // sleep is visible on next render. A real DB implementation backs these with
  // transactions; the in-memory one mutates arrays in place.
  upsertHunter(hunter: Hunter): void;
  upsertEvaluation(ev: CommercialAccessEvaluation): void;
  addTestCall(call: TestCall): void;
  upsertCampaign(c: Campaign): void;
  upsertLead(lead: Lead): void;
  addDecisionLog(entry: DecisionLogEntry): void;
  nextId(prefix: string): string;
}

// In-memory implementation. Holds one mutable dataset; reads return it (or
// filtered slices). Kept deliberately simple — no indexing — because v1 data
// volume is tiny and clarity beats premature optimisation.
class InMemoryRepository implements HNRepository {
  private data: HNData;

  constructor(seed: () => Omit<HNData, "settings">, settings: HNSettings) {
    this.data = { ...seed(), settings };
  }

  getAll(): HNData {
    return this.data;
  }
  getHunters() {
    return this.data.hunters;
  }
  getHunter(id: string) {
    return this.data.hunters.find((h) => h.id === id);
  }
  getEvaluations() {
    return this.data.evaluations;
  }
  getEvaluationsForHunter(hunterId: string) {
    return this.data.evaluations.filter((e) => e.hunter_id === hunterId);
  }
  getTestCalls() {
    return this.data.testCalls;
  }
  getTestCallsForHunter(hunterId: string) {
    return this.data.testCalls.filter((c) => c.hunter_id === hunterId);
  }
  getCampaigns() {
    return this.data.campaigns;
  }
  getCampaign(id: string) {
    return this.data.campaigns.find((c) => c.id === id);
  }
  getLeads() {
    return this.data.leads;
  }
  getLeadsForCampaign(campaignId: string) {
    return this.data.leads.filter((l) => l.campaign_id === campaignId);
  }
  getLeadsForHunter(hunterId: string) {
    return this.data.leads.filter((l) => l.assigned_hunter_id === hunterId);
  }
  getDecisionLog() {
    return this.data.decisionLog;
  }
  getDecisionLogForHunter(hunterId: string) {
    return this.data.decisionLog.filter((d) => d.hunter_id === hunterId);
  }
  getSettings() {
    return this.data.settings;
  }

  // --- Mutations -----------------------------------------------------------

  private idCounter = 0;

  upsertHunter(hunter: Hunter) {
    const i = this.data.hunters.findIndex((h) => h.id === hunter.id);
    if (i >= 0) this.data.hunters[i] = hunter;
    else this.data.hunters.push(hunter);
  }
  upsertEvaluation(ev: CommercialAccessEvaluation) {
    const i = this.data.evaluations.findIndex((e) => e.id === ev.id);
    if (i >= 0) this.data.evaluations[i] = ev;
    else this.data.evaluations.push(ev);
  }
  addTestCall(call: TestCall) {
    this.data.testCalls.push(call);
  }
  upsertCampaign(c: Campaign) {
    const i = this.data.campaigns.findIndex((x) => x.id === c.id);
    if (i >= 0) this.data.campaigns[i] = c;
    else this.data.campaigns.push(c);
  }
  upsertLead(lead: Lead) {
    const i = this.data.leads.findIndex((l) => l.id === lead.id);
    if (i >= 0) this.data.leads[i] = lead;
    else this.data.leads.push(lead);
  }
  addDecisionLog(entry: DecisionLogEntry) {
    this.data.decisionLog.push(entry);
  }
  nextId(prefix: string) {
    return `${prefix}_g${++this.idCounter}_${Date.now().toString(36)}`;
  }
}

// Module-level singleton. Next can evaluate a module more than once across
// route segments in dev; pin the instance to globalThis so seeded state is
// shared and stable within a server process.
const globalForHN = globalThis as unknown as { __hnRepo?: HNRepository };

export const hnRepo: HNRepository =
  globalForHN.__hnRepo ?? new InMemoryRepository(() => SEED, DEFAULT_SETTINGS);

if (!globalForHN.__hnRepo) globalForHN.__hnRepo = hnRepo;
