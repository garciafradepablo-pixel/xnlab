"use client";
import { motion } from "framer-motion";
import { R, Label, serif, ts, tsS, Dust, Commentary } from "./atoms";
import { worlds } from "./worlds";

// STANDING — the home page's commercial-gravity beat. Sits between the
// constellation of worlds (002) and the Signals of Execution. It is
// the answer to the unspoken visitor question — "are you actually
// busy, or just well-designed?" — without naming a single client.
//
// What it shows, in this order:
//   ── Aggregate roster of brands currently under direction, anonymized
//      by sector + scope + territory (the dossier high-end firms send
//      before any name is exchanged).
//   ── Cycle window with explicit remaining capacity (scarcity, real).
//   ── Two trust lines: referral ratio + tenure (MMXXII).
//
// Voice: dossier, not catalogue. Numerals in roman. Sector lines pull
// the matching world's accent for the leading dot so the section
// remains keyed to the same six-colour vocabulary the rest of the
// studio reads in. No photographs, no logos — the restraint IS the
// signal.

type Entry = {
  index: string;
  sector: { en: string; es: string };
  scope: { en: string; es: string };
  territory: { en: string; es: string };
  // Slug of the world whose accent signs the row.
  worldSlug: typeof worlds[number]["slug"];
};

const ENGAGEMENTS: Entry[] = [
  {
    index: "R/01",
    sector: { en: "Global brand", es: "Marca global" },
    scope: {
      en: "Two surfaces under extended direction",
      es: "Dos superficies bajo dirección prolongada",
    },
    territory: { en: "Europe · MENA", es: "Europa · MENA" },
    worldSlug: "product",
  },
  {
    index: "R/02",
    sector: { en: "Category leader", es: "Líder de categoría" },
    scope: {
      en: "One identity in rework",
      es: "Una identidad en rediseño",
    },
    territory: { en: "Western Europe", es: "Europa Occidental" },
    worldSlug: "communication",
  },
  {
    index: "R/03",
    sector: { en: "Heritage house", es: "Casa patrimonial" },
    scope: {
      en: "One brand world in atmosphere rework",
      es: "Un universo de marca en rediseño",
    },
    territory: { en: "Iberia", es: "Iberia" },
    worldSlug: "retail-physical",
  },
  {
    index: "R/04",
    sector: { en: "Hospitality (applied)", es: "Hostelería (aplicado)" },
    scope: {
      en: "Two properties · vertical study",
      es: "Dos propiedades · estudio vertical",
    },
    territory: { en: "Iberia", es: "Iberia" },
    worldSlug: "community-culture",
  },
  {
    index: "R/05",
    sector: { en: "Cultural institution", es: "Institución cultural" },
    scope: {
      en: "One programmatic platform · launch",
      es: "Una plataforma programática · lanzamiento",
    },
    territory: { en: "Q3 MMXXVI", es: "T3 MMXXVI" },
    worldSlug: "owned-digital",
  },
];

// Practice ledger — eight operating facts. Hand-curated, deliberately
// short. The valuation move here is not bragging about scale; it's
// publishing the kind of operational legibility (minimum, retainer,
// settlement, languages, network) that only mature practices have. A
// brand director or CMO reads this and immediately places XNLAB next to
// strategy advisories, not next to design vendors.
type LedgerEntry = { label: { en: string; es: string }; value: { en: string; es: string } };

const LEDGER: LedgerEntry[] = [
  {
    label: { en: "Minimum engagement", es: "Encargo mínimo" },
    value: { en: "Twelve weeks", es: "Doce semanas" },
  },
  {
    label: { en: "Average engagement", es: "Encargo medio" },
    value: { en: "Thirty-two weeks", es: "Treinta y dos semanas" },
  },
  {
    label: { en: "Retainer engagements", es: "Retainer" },
    value: {
      en: "Twelve to thirty-six months",
      es: "De doce a treinta y seis meses",
    },
  },
  {
    label: { en: "Currencies served", es: "Divisas" },
    value: { en: "EUR · USD · GBP · AED", es: "EUR · USD · GBP · AED" },
  },
  {
    label: { en: "Languages of operation", es: "Idiomas de trabajo" },
    value: { en: "EN · ES · FR · AR", es: "ES · EN · FR · AR" },
  },
  {
    label: { en: "Studio response", es: "Respuesta del estudio" },
    value: {
      en: "Forty-eight hours, signed by the studio",
      es: "Cuarenta y ocho horas, firmada por el estudio",
    },
  },
  {
    label: { en: "Network", es: "Red" },
    value: {
      en: "Direction in-house · execution across a vetted network of specialists",
      es: "Dirección interna · ejecución a través de una red vetada de especialistas",
    },
  },
];

const COPY = {
  en: {
    label: "002.5 — Standing",
    h1a: "What the studio holds,",
    h1b: "right now.",
    sub: "An anonymized roster of brands currently under direction. A dossier, not a portfolio — every name we direct trades on quiet.",
    rosterLabel: "Currently under direction",
    cycleLabel: "Cycle MMXXVI",
    cycleWindow: "January — June",
    cycleStatus: "One place remains.",
    cycleNote:
      "Cycles close at six brands. We do not stretch the studio to make a seventh fit.",
    trust1:
      "Most new engagements arrive through an existing brand — a CEO, a CMO, a founder, a programme director.",
    trust2:
      "Practice founded MMXXII · Marbella · Madrid · By appointment.",
    ledgerLabel: "How the studio operates",
    signature:
      "Every engagement is partner-signed. Single point of accountability. Written deliverables only — the studio does not present decks.",
    closed: "Closed",
    open: "Open",
  },
  es: {
    label: "002.5 — Posición",
    h1a: "Lo que el estudio tiene",
    h1b: "en sus manos ahora.",
    sub: "Un censo anónimo de marcas bajo dirección. Un dossier, no un portfolio — cada nombre que dirigimos opera en silencio.",
    rosterLabel: "Actualmente bajo dirección",
    cycleLabel: "Ciclo MMXXVI",
    cycleWindow: "Enero — junio",
    cycleStatus: "Queda una plaza.",
    cycleNote:
      "Los ciclos cierran a seis marcas. No estiramos el estudio para que entre una séptima.",
    trust1:
      "La mayoría de los nuevos encargos llega por recomendación de una marca activa — un CEO, un CMO, un fundador, un director de programa.",
    trust2:
      "Práctica fundada en MMXXII · Marbella · Madrid · Solo con cita previa.",
    ledgerLabel: "Cómo opera el estudio",
    signature:
      "Cada encargo lo firma un socio del estudio. Un único punto de responsabilidad. Entregables escritos — el estudio no presenta decks.",
    closed: "Cerrado",
    open: "Abierto",
  },
};

export function Standing({ lang }: { lang: "en" | "es" }) {
  const t = COPY[lang];

  return (
    <section
      id="standing"
      style={{
        position: "relative",
        padding: "clamp(40px,4.8vw,72px) clamp(20px,5vw,64px) clamp(32px,4vw,56px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      <Dust count={8} opacity={0.05} />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,183,131,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.4vw,48px)" }}>
          <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.label}</Label>
          <h2
            style={{
              fontSize: "clamp(1.8rem,3.6vw,3.6rem)",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.045em",
              textShadow: tsS,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            <span>{t.h1a}</span>
            <span
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.18em",
              }}
            >
              {t.h1b}
            </span>
          </h2>
          <Commentary delay={0.18}>{t.sub}</Commentary>
        </R>

        <div
          className="grid-cols-1 lg:grid-cols-[1.45fr_1fr]"
          style={{
            display: "grid",
            gap: "clamp(28px,3.6vw,60px)",
            marginTop: "clamp(24px,3vw,40px)",
            alignItems: "start",
          }}
        >
          {/* Roster */}
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.42)",
                marginBottom: "clamp(14px,1.6vw,22px)",
              }}
            >
              {t.rosterLabel}
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {ENGAGEMENTS.map((e, i) => {
                const world = worlds.find((w) => w.slug === e.worldSlug);
                const c = world?.color.hex ?? "#e8b783";
                return (
                  <R key={e.index} delay={0.05 * i}>
                    <li
                      style={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "minmax(56px,72px) 1fr auto",
                        gap: "clamp(14px,1.8vw,24px)",
                        padding: "clamp(18px,2.2vw,28px) clamp(8px,1vw,12px) clamp(18px,2.2vw,28px) clamp(20px,2.4vw,28px)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        borderBottom:
                          i === ENGAGEMENTS.length - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                        alignItems: "baseline",
                      }}
                      className="md:items-baseline"
                    >
                      {/* Accent dot drawn from the world's colour */}
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: "clamp(6px,0.8vw,10px)",
                          top: "calc(50% - 3px)",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: c,
                          boxShadow: `0 0 10px ${c}88`,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.34em",
                          color: "rgba(232,183,131,0.55)",
                        }}
                      >
                        {e.index}
                      </span>
                      <span
                        style={{
                          fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.85)",
                          fontWeight: 300,
                          letterSpacing: "-0.005em",
                          textShadow: ts,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                            color: "white",
                            marginRight: "0.9em",
                          }}
                        >
                          {e.sector[lang]}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>
                          {e.scope[lang]}
                        </span>
                      </span>
                      <span
                        className="hidden md:inline"
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.4)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.territory[lang]}
                      </span>
                    </li>
                  </R>
                );
              })}
            </ol>
          </div>

          {/* Cycle status panel */}
          <R delay={0.22}>
            <aside
              style={{
                position: "relative",
                padding: "clamp(22px,2.6vw,32px)",
                border: "1px solid rgba(232,183,131,0.22)",
                background:
                  "linear-gradient(180deg, rgba(232,183,131,0.04) 0%, rgba(4,3,2,0.4) 100%)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "clamp(16px,1.8vw,22px)",
                }}
              >
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.25, 1] }}
                  transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#e8b783",
                    boxShadow: "0 0 12px 1px rgba(232,183,131,0.65)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.38em",
                    textTransform: "uppercase",
                    color: "rgba(232,183,131,0.9)",
                  }}
                >
                  {t.open}
                </span>
              </div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 6,
                }}
              >
                {t.cycleLabel}
              </p>
              <p
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.6rem,2.6vw,2.4rem)",
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: "-0.01em",
                  color: "white",
                  margin: "0 0 4px",
                  textShadow: tsS,
                }}
              >
                {t.cycleStatus}
              </p>
              <p
                style={{
                  fontSize: "clamp(0.9rem,1.05vw,1rem)",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 300,
                  margin: "0 0 18px",
                }}
              >
                {t.cycleWindow}
              </p>
              {/* Capacity meter — pulls from ENGAGEMENTS.length so the
                  bar always matches the dossier above. 6 cells total
                  because the cycle holds six brands. */}
              <div
                aria-hidden
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => {
                  const filled = i < ENGAGEMENTS.length;
                  return (
                    <span
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        background: filled ? "rgba(232,183,131,0.7)" : "rgba(255,255,255,0.08)",
                        boxShadow: filled ? "0 0 8px rgba(232,183,131,0.45)" : "none",
                      }}
                    />
                  );
                })}
              </div>
              <p
                style={{
                  fontSize: 11,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                {t.cycleNote}
              </p>
            </aside>
          </R>
        </div>

        {/* Trust lines — referral ratio + tenure. A discreet hairline
            below, the kind of single-sentence facts that elite firms
            drop near the bottom of a capabilities deck. */}
        <R delay={0.32}>
          <div
            style={{
              marginTop: "clamp(28px,3.2vw,44px)",
              paddingTop: "clamp(20px,2.4vw,32px)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "grid",
              gap: "clamp(8px,1vw,14px)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "clamp(0.9rem,1.1vw,1.02rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.62)",
                fontWeight: 300,
                letterSpacing: "0.005em",
              }}
            >
              {t.trust1}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(0.85rem,1vw,0.95rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.42)",
                fontWeight: 300,
              }}
            >
              {t.trust2}
            </p>
          </div>
        </R>

        {/* Practice ledger — the studio's operating facts in a tight
            two/four-column hairline grid. Minimums, retainer windows,
            tenure, currencies, languages, response time, and the size
            of the execution network. Reads like the inside cover of a
            firm's engagement brief, not a marketing block. */}
        <R delay={0.44}>
          <div
            style={{
              marginTop: "clamp(32px,3.8vw,56px)",
              paddingTop: "clamp(24px,2.8vw,40px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(232,183,131,0.7)",
                textAlign: "center",
                marginBottom: "clamp(20px,2.4vw,32px)",
              }}
            >
              {t.ledgerLabel}
            </p>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "clamp(20px,2.4vw,36px) clamp(28px,3.4vw,48px)",
                margin: 0,
              }}
            >
              {LEDGER.map((entry) => (
                <div
                  key={entry.label.en}
                  style={{
                    position: "relative",
                    paddingTop: "clamp(12px,1.4vw,16px)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <dt
                    style={{
                      fontSize: 9.5,
                      fontWeight: 500,
                      letterSpacing: "0.36em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.42)",
                      marginBottom: 8,
                    }}
                  >
                    {entry.label[lang]}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      fontSize: "clamp(0.92rem,1.1vw,1.04rem)",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.82)",
                      fontWeight: 300,
                      letterSpacing: "-0.005em",
                      textShadow: ts,
                    }}
                  >
                    {entry.value[lang]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </R>

        {/* Practice signature — the single editorial line that names
            the studio's operating posture. Partner-signed, single
            accountability, written-only. This is the "we are a firm,
            not an agency" anchor. Italic serif so it reads as the
            studio's own voice, not as marketing copy. */}
        <R delay={0.56}>
          <p
            style={{
              margin: "clamp(28px,3vw,40px) auto 0",
              maxWidth: 760,
              textAlign: "center",
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "clamp(1rem,1.22vw,1.18rem)",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.72)",
              fontWeight: 400,
              letterSpacing: "-0.005em",
              textShadow: ts,
              textWrap: "balance",
            }}
          >
            {t.signature}
          </p>
        </R>
      </div>
    </section>
  );
}
