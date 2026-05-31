"use client";
// ---------------------------------------------------------------------------
// Hunter Network (HN) — Overview · the command center
//
// The state of the network at a glance, plus the live operations feed. The
// engine runs autonomously (one tick = one step of the whole funnel + commerce
// loop); this screen renders the snapshot and can advance/auto-run ticks so the
// operator can "leave it running and watch the operations live."
//
// Everything here is a projection of repo state through the server actions —
// no business logic in the component.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../_lib/atoms";
import { SiteFooter } from "../_lib/site-footer";
import { HNShell } from "./_components/shell";
import { Badge, Card, RiskLabel, ScoreBar, SectionLabel, StatCard, Table, Td, Th, toneColor, type Tone } from "./_components/primitives";
import { brandRiskTone, campaignRiskTone, evalStatusTone, hunterStatusTone, levelTone } from "./_components/tone";
import {
  BRAND_RISK_LABEL,
  CAMPAIGN_RISK_LABEL,
  EVAL_STATUS_LABEL,
  HN_COPY,
  HUNTER_STATUS_LABEL,
  LEVEL_LABEL,
} from "./_core/i18n";
import type { OpEvent, OpEventKind } from "./_core/events";
import { getOverviewSnapshot, tick, type OverviewSnapshot } from "./actions";

export default function Overview({ initial }: { initial: OverviewSnapshot }) {
  const [lang] = useLang();
  const t = HN_COPY[lang];
  const [snap, setSnap] = useState<OverviewSnapshot>(initial);
  const [running, setRunning] = useState(false);
  const [auto, setAuto] = useState(false);
  const autoRef = useRef(false);

  const runOne = useCallback(async () => {
    setRunning(true);
    try {
      setSnap(await tick());
    } finally {
      setRunning(false);
    }
  }, []);

  // Auto-run loop — the "operate while you sleep" mode. Each step advances the
  // engine one tick, then pauses, so the feed scrolls at a watchable pace.
  useEffect(() => {
    autoRef.current = auto;
    if (!auto) return;
    let cancelled = false;
    const loop = async () => {
      while (!cancelled && autoRef.current) {
        await tick().then((s) => !cancelled && setSnap(s));
        await new Promise((r) => setTimeout(r, 2500));
      }
    };
    loop();
    return () => {
      cancelled = true;
    };
  }, [auto]);

  // Light refresh of the read snapshot when idle, so external ticks show up.
  useEffect(() => {
    if (auto || running) return;
    const id = setInterval(() => {
      getOverviewSnapshot().then(setSnap);
    }, 10000);
    return () => clearInterval(id);
  }, [auto, running]);

  const s = snap.stats;

  // The 11 command-center figures, in the brief's order, each toned.
  const cards: { key: keyof typeof s; tone: Tone }[] = [
    { key: "total_hunters", tone: "neutral" },
    { key: "pending_candidates", tone: "info" },
    { key: "pending_access_evaluations", tone: "info" },
    { key: "active_evaluations", tone: "warn" },
    { key: "approved_hunters", tone: "good" },
    { key: "rejected_candidates", tone: "bad" },
    { key: "average_score", tone: "accent" },
    { key: "active_campaigns", tone: "good" },
    { key: "assigned_leads", tone: "neutral" },
    { key: "meetings_booked", tone: "good" },
    { key: "brand_risk_alerts", tone: s.brand_risk_alerts > 0 ? "bad" : "neutral" },
  ];

  return (
    <>
      <HNShell active="overview" mode={snap.mode}>
        {/* Heading */}
        <header style={{ marginBottom: "clamp(24px,3vw,40px)" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,3.4vw,2.6rem)", fontWeight: 400, letterSpacing: "-0.03em", margin: 0 }}>{t.ov.title}</h1>
          <p style={{ marginTop: 10, fontSize: "clamp(0.95rem,1.1vw,1.05rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", fontWeight: 300, maxWidth: 620 }}>{t.ov.subtitle}</p>
        </header>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "clamp(10px,1.2vw,14px)", marginBottom: "clamp(28px,3.4vw,44px)" }}>
          {cards.map(({ key, tone }) => (
            <StatCard key={key} label={t.ov.stats[key]} value={fmt(s[key], key)} tone={tone} />
          ))}
        </div>

        {/* Live feed + side lists */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "clamp(16px,2vw,28px)", alignItems: "start" }} className="hn-ov-grid">
          <LiveFeed t={t} events={snap.events} running={running} auto={auto} onTick={runOne} onToggleAuto={() => setAuto((a) => !a)} />
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px,2vw,24px)" }}>
            <RiskyList t={t} lang={lang} hunters={snap.riskyHunters} />
            <TopList t={t} lang={lang} hunters={snap.topHunters} />
          </div>
        </div>

        {/* Wide lists below */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "clamp(16px,2vw,28px)", marginTop: "clamp(20px,2.4vw,32px)" }}>
          <RecentCandidates t={t} lang={lang} hunters={snap.recentCandidates} />
          <ReviewList t={t} lang={lang} snap={snap} />
          <ActiveCampaigns t={t} lang={lang} snap={snap} />
        </div>

        <style>{`@media (max-width: 900px){.hn-ov-grid{grid-template-columns:minmax(0,1fr) !important}}`}</style>
      </HNShell>
      <SiteFooter lang={lang} />
    </>
  );
}

// --- Live operations feed ---------------------------------------------------

const EVENT_TONE: Record<OpEventKind, Tone> = {
  tick_started: "neutral",
  lead_generated: "info",
  lead_assigned: "info",
  call_placed: "neutral",
  call_scored: "accent",
  meeting_booked: "good",
  lead_closed: "good",
  evaluation_progressed: "info",
  evaluation_decided: "accent",
  hunter_reclassified: "warn",
  brand_risk_flagged: "bad",
  wallet_movement: "warn",
  tick_completed: "neutral",
  blocked: "bad",
};

function LiveFeed({
  t,
  events,
  running,
  auto,
  onTick,
  onToggleAuto,
}: {
  t: (typeof HN_COPY)["en"];
  events: OpEvent[];
  running: boolean;
  auto: boolean;
  onTick: () => void;
  onToggleAuto: () => void;
}) {
  return (
    <Card pad={false} style={{ display: "flex", flexDirection: "column", minHeight: 360 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: auto ? "rgb(120,200,150)" : `rgba(${"232,183,131"},0.9)`, boxShadow: auto ? "0 0 10px rgba(120,200,150,0.7)" : "none", animation: auto ? "hnpulse 1.4s infinite" : "none" }} />
            <h2 style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.02em", margin: 0 }}>{t.ov.liveFeed}</h2>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "6px 0 0", maxWidth: 380 }}>{t.ov.liveFeedNote}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onToggleAuto} style={btnStyle(auto)}>
            {auto ? "■" : "▶"}
          </button>
          <button onClick={onTick} disabled={running || auto} style={{ ...btnStyle(false), opacity: running || auto ? 0.5 : 1, cursor: running || auto ? "not-allowed" : "pointer" }}>
            {running ? t.ov.running : t.ov.runTick}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 420, padding: "6px 0" }}>
        {events.length === 0 ? (
          <p style={{ padding: 18, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{t.ov.empty}</p>
        ) : (
          events.map((e) => <FeedRow key={e.id} event={e} />)
        )}
      </div>
      <style>{`@keyframes hnpulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </Card>
  );
}

function FeedRow({ event }: { event: OpEvent }) {
  const tone = EVENT_TONE[event.kind];
  const time = event.created_at.slice(11, 19);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 18px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <span style={{ fontSize: 10, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.3)", width: 56, flexShrink: 0 }}>{time}</span>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: toneColor(tone, 0.95), flexShrink: 0 }} />
      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.78)", flex: 1, minWidth: 0 }}>{event.message}</span>
      {event.value !== null && <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: toneColor(tone, 0.95) }}>{event.value.toFixed(1)}</span>}
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "0.45rem 0.9rem",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: 8,
    border: `1px solid ${active ? "rgba(120,200,150,0.5)" : "rgba(255,255,255,0.18)"}`,
    background: active ? "rgba(120,200,150,0.12)" : "rgba(255,255,255,0.04)",
    color: active ? "rgb(150,210,170)" : "white",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

// --- Side lists -------------------------------------------------------------

function RiskyList({ t, lang, hunters }: { t: (typeof HN_COPY)["en"]; lang: "en" | "es"; hunters: OverviewSnapshot["riskyHunters"] }) {
  return (
    <Card>
      <SectionLabel>{t.ov.riskyHunters}</SectionLabel>
      {hunters.length === 0 ? (
        <Empty t={t} />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {hunters.map((h) => (
            <li key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{h.name}</span>
              <RiskLabel label={BRAND_RISK_LABEL[lang][h.brand_risk_level]} tone={brandRiskTone(h.brand_risk_level)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TopList({ t, lang, hunters }: { t: (typeof HN_COPY)["en"]; lang: "en" | "es"; hunters: OverviewSnapshot["topHunters"] }) {
  return (
    <Card>
      <SectionLabel>{t.ov.topHunters}</SectionLabel>
      {hunters.length === 0 ? (
        <Empty t={t} />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {hunters.map((h, i) => (
            <li key={h.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", width: 16 }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
              <Badge tone={levelTone(h.level)}>{LEVEL_LABEL[lang][h.level]}</Badge>
              <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: `rgba(${"232,183,131"},0.95)`, minWidth: 38, textAlign: "right" }}>{h.total_score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RecentCandidates({ t, lang, hunters }: { t: (typeof HN_COPY)["en"]; lang: "en" | "es"; hunters: OverviewSnapshot["recentCandidates"] }) {
  return (
    <Card pad={false}>
      <div style={{ padding: "16px 18px 8px" }}>
        <SectionLabel>{t.ov.recentCandidates}</SectionLabel>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>{t.labels.status}</Th>
            <Th align="right">{t.labels.score}</Th>
          </tr>
        </thead>
        <tbody>
          {hunters.map((h) => (
            <tr key={h.id}>
              <Td>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ color: "white" }}>{h.name}</span>
                  <Badge tone={hunterStatusTone(h.status)}>{HUNTER_STATUS_LABEL[lang][h.status]}</Badge>
                </div>
              </Td>
              <Td align="right" style={{ width: 130 }}>
                <ScoreBar value={h.total_score} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function ReviewList({ t, lang, snap }: { t: (typeof HN_COPY)["en"]; lang: "en" | "es"; snap: OverviewSnapshot }) {
  const byId = new Map(snap.recentCandidates.concat(snap.topHunters, snap.riskyHunters).map((h) => [h.id, h.name]));
  return (
    <Card>
      <SectionLabel>{t.ov.needReview}</SectionLabel>
      {snap.evaluationsNeedingReview.length === 0 ? (
        <Empty t={t} />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {snap.evaluationsNeedingReview.map((e) => (
            <li key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{byId.get(e.hunter_id) ?? e.hunter_id}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{e.completed_calls_count}/{e.assigned_test_leads_count}</span>
                <Badge tone={evalStatusTone(e.evaluation_status)}>{EVAL_STATUS_LABEL[lang][e.evaluation_status]}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ActiveCampaigns({ t, lang, snap }: { t: (typeof HN_COPY)["en"]; lang: "en" | "es"; snap: OverviewSnapshot }) {
  return (
    <Card>
      <SectionLabel>{t.ov.activeCampaigns}</SectionLabel>
      {snap.activeCampaigns.length === 0 ? (
        <Empty t={t} />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {snap.activeCampaigns.map((c) => (
            <li key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.client_name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Badge tone="neutral">{LEVEL_LABEL[lang][c.minimum_level_required]}</Badge>
                <Badge tone={campaignRiskTone(c.campaign_risk_level)}>{CAMPAIGN_RISK_LABEL[lang][c.campaign_risk_level]}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Empty({ t }: { t: (typeof HN_COPY)["en"] }) {
  return <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>{t.ov.empty}</p>;
}

// Average score reads with one decimal; counts read as integers.
function fmt(value: number, key: string): string {
  return key === "average_score" ? value.toFixed(1) : String(value);
}
