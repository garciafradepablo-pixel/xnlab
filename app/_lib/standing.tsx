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

// First cycle of MMXXVI is open. No engagements are published.
// Direction begins when the work is recognised — the roster will
// fill itself only with names the studio carries with their permission.
const ENGAGEMENTS: Entry[] = [];

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
    label: { en: "Retainer engagements", es: "Retainer" },
    value: {
      en: "Twelve to thirty-six months",
      es: "De doce a treinta y seis meses",
    },
  },
  {
    label: { en: "Currencies served", es: "Divisas" },
    value: { en: "EUR · USD · GBP · AUD · THB", es: "EUR · USD · GBP · AUD · THB" },
  },
  {
    label: { en: "Languages of operation", es: "Idiomas de trabajo" },
    value: { en: "EN · ES", es: "ES · EN" },
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
    label: "002.5 — Position",
    h1a: "First cycle,",
    h1b: "in selection.",
    sub: "The roster is published when the work is recognised. What appears here rests on the brand's permission, not on ours.",
    rosterLabel: "Currently",
    cycleLabel: "Cycle MMXXVI",
    cycleStatus: "First cycle, in selection.",
    cycleNote:
      "Cycles close at six brands. We do not stretch the studio to make a seventh fit.",
    trust1:
      "New engagements arrive through introduction. Reply in writing, signed, within forty-eight hours.",
    trust2:
      "Practice founded MMXXII · By appointment.",
    ledgerLabel: "How the studio operates",
    signature:
      "Every engagement is partner-signed. Single point of accountability. Written deliverables only. The studio does not present decks.",
    closed: "Closed",
    open: "In Selection",
  },
  es: {
    label: "002.5 — Posición",
    h1a: "Primer ciclo,",
    h1b: "en selección.",
    sub: "El roster se publica cuando el trabajo se reconoce. Lo que aparece aquí depende del permiso de la marca, no del nuestro.",
    rosterLabel: "Actualmente",
    cycleLabel: "Ciclo MMXXVI",
    cycleStatus: "Primer ciclo, en selección.",
    cycleNote:
      "Los ciclos cierran a seis marcas. No estiramos el estudio para que entre una séptima.",
    trust1:
      "Los encargos nuevos llegan por presentación. Respuesta por escrito, firmada, en cuarenta y ocho horas.",
    trust2:
      "Práctica fundada en MMXXII · Solo con cita previa.",
    ledgerLabel: "Cómo opera el estudio",
    signature:
      "Cada encargo lo firma un socio del estudio. Un único punto de responsabilidad. Entregables escritos. El estudio no presenta decks.",
    closed: "Cerrado",
    open: "En selección",
  },
};

export function Standing({ lang }: { lang: "en" | "es" }) {
  const t = COPY[lang];

  return (
    <section
      id="standing"
      style={{
        position: "relative",
        padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      <Dust count={5} opacity={0.05} />
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
          {/* Roster — only renders when ENGAGEMENTS is non-empty.
              In the first cycle (no published engagements) we show a
              single italic line instead of a label sitting above a
              blank list. Honesty over scaffolding. */}
          <div>
            {ENGAGEMENTS.length === 0 ? (
              <div
                style={{
                  border: "1px solid rgba(232,183,131,0.18)",
                  background:
                    "linear-gradient(180deg, rgba(232,183,131,0.04) 0%, rgba(4,3,2,0.4) 100%)",
                  padding: "clamp(24px,3vw,36px) clamp(20px,2.4vw,30px)",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: "rgba(232,183,131,0.78)",
                    margin: 0,
                    marginBottom: 14,
                  }}
                >
                  {lang === "en" ? "The founding cycle" : "El ciclo fundador"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(1.15rem,1.5vw,1.42rem)",
                    lineHeight: 1.38,
                    color: "rgba(255,255,255,0.86)",
                    letterSpacing: "-0.005em",
                    textShadow: tsS,
                  }}
                >
                  {lang === "en"
                    ? "MMXXVI is the studio's founding cycle — the first partners are being selected now."
                    : "MMXXVI es el ciclo fundador del estudio — los primeros socios se seleccionan ahora."}
                </p>
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: "clamp(0.92rem,1.1vw,1rem)",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.52)",
                    fontWeight: 300,
                  }}
                >
                  {lang === "en"
                    ? "There is no roster to parade — and that is the opening. Brands that enter now are founding partners, chosen before the studio has a queue. Their names will appear here, with their permission."
                    : "No hay roster que exhibir — y ahí está la oportunidad. Las marcas que entran ahora son socias fundadoras, elegidas antes de que el estudio tenga cola. Sus nombres aparecerán aquí, con su permiso."}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
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
