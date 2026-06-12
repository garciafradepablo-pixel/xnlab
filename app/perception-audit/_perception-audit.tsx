"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Label, Dust, Commentary, useLang } from "../_lib/atoms";
import { Nav } from "../_lib/nav";
import { SiteFooter } from "../_lib/site-footer";
import { SURFACES } from "../_lib/verticals";

// /perception-audit — the commercial entry product. The diagnosis that
// opens every engagement. Sells the gap-mapping, not an opinion. No
// price on the public surface (AGENTS.md §5b): "by application, fee
// disclosed after fit review". The one verb is "Apply for an Audit",
// which lands on /contact (the canonical inquiry route, §5c).

const copy = {
  en: {
    eyebrow: "Perception Audit · The entry",
    h1a: "See the gap",
    h1b: "before the market does.",
    strap:
      "The diagnosis every engagement begins with. We map the distance between what your brand is worth in the room and what the market reads online — surface by surface — and hand you the fastest path to closing it.",
    cta: "Apply for an Audit",
    ctaNote: "By application. Fee disclosed after fit review, and credited against a Sprint if the work continues.",
    whatLabel: "001 — What it is",
    whatH: "Not an opinion. A diagnosis.",
    whatBody:
      "Most studios open with a pitch. We open with a reading. The Audit is a structured analysis of how your brand is actually perceived across every surface a customer meets before they ever walk in — and where that perception is quietly costing you bookings, trust and price.",
    whoLabel: "002 — Who it's for",
    whoBody:
      "Brands that already win in person. The room is full, the reviews are kind, the work is real — and online the brand reads smaller than it is. Hospitality, clinics, restaurants, property, wellness, nightlife, retail and culture-led businesses with something true to defend.",
    analyseLabel: "003 — What we analyse",
    analyseH: "Six surfaces.",
    analyseHb: "One reading.",
    analyseIntro:
      "Every brand reaches its customer across the same six surfaces. We read each one as the customer does, then measure it against what the brand is actually worth.",
    receiveLabel: "004 — What you receive",
    receiveH: "A document you can act on Monday.",
    receive: [
      "A perception map — how the brand reads today, surface by surface.",
      "The primary gap — the one distance between value and perception that costs the most.",
      "Value leaks — where trust, desire and price are quietly lost.",
      "Quick wins — what can be corrected in days, before any engagement.",
      "Recommended direction — the move, named and prioritised.",
      "A roadmap — what a Sprint or Cycle would resolve, in order.",
      "A 45–60 minute reading session with the studio.",
    ],
    durLabel: "005 — Duration & outcome",
    durH: "Five to ten working days.",
    durBody:
      "You apply. We confirm fit. The reading runs across your surfaces and returns as a document and a session. By the end you can see what the market sees — and you know exactly what to do about it, with or without us.",
    finalH: "Start with the reading.",
    finalBody:
      "We accept a limited number of audits per cycle. Every one is selected. Tell us the brand and the surface that worries you most.",
    backHome: "← Home",
  },
  es: {
    eyebrow: "Perception Audit · La entrada",
    h1a: "Ve la distancia",
    h1b: "antes que el mercado.",
    strap:
      "El diagnóstico con el que empieza cada encargo. Cartografiamos la distancia entre lo que tu marca vale en la sala y lo que el mercado lee online — superficie a superficie — y te entregamos el camino más rápido para cerrarla.",
    cta: "Solicitar un Audit",
    ctaNote: "Por solicitud. La cuota se comunica tras el fit review, y se acredita contra un Sprint si el trabajo continúa.",
    whatLabel: "001 — Qué es",
    whatH: "No una opinión. Un diagnóstico.",
    whatBody:
      "La mayoría de estudios abren con una propuesta. Nosotros abrimos con una lectura. El Audit es un análisis estructurado de cómo se percibe tu marca de verdad en cada superficie que un cliente encuentra antes de entrar — y dónde esa percepción te está costando reservas, confianza y precio en silencio.",
    whoLabel: "002 — Para quién",
    whoBody:
      "Marcas que ya ganan en persona. La sala está llena, las reseñas son amables, el trabajo es real — y online la marca se lee más pequeña de lo que es. Hostelería, clínicas, restaurantes, inmobiliaria, wellness, ocio nocturno, retail y negocios culture-led con algo verdadero que defender.",
    analyseLabel: "003 — Qué analizamos",
    analyseH: "Seis superficies.",
    analyseHb: "Una lectura.",
    analyseIntro:
      "Toda marca llega a su cliente por las mismas seis superficies. Leemos cada una como la lee el cliente, y la medimos contra lo que la marca vale de verdad.",
    receiveLabel: "004 — Qué recibes",
    receiveH: "Un documento accionable el lunes.",
    receive: [
      "Un mapa de percepción — cómo se lee la marca hoy, superficie a superficie.",
      "El gap principal — la distancia entre valor y percepción que más cuesta.",
      "Fugas de valor — dónde se pierden confianza, deseo y precio en silencio.",
      "Quick wins — lo que se corrige en días, antes de cualquier encargo.",
      "Dirección recomendada — el movimiento, nombrado y priorizado.",
      "Una hoja de ruta — lo que resolvería un Sprint o un Ciclo, en orden.",
      "Una sesión de lectura de 45–60 minutos con el estudio.",
    ],
    durLabel: "005 — Duración y resultado",
    durH: "De cinco a diez días hábiles.",
    durBody:
      "Solicitas. Confirmamos el encaje. La lectura recorre tus superficies y vuelve como documento y sesión. Al final ves lo que ve el mercado — y sabes exactamente qué hacer, con nosotros o sin nosotros.",
    finalH: "Empieza por la lectura.",
    finalBody:
      "Aceptamos un número limitado de audits por ciclo. Cada uno se selecciona. Dinos la marca y la superficie que más te preocupa.",
    backHome: "← Inicio",
  },
};

export default function PerceptionAudit() {
  const [lang, setLang] = useLang();
  const t = copy[lang];
  const navT = {
    nw: lang === "en" ? "Worlds" : "Mundos",
    nse: lang === "en" ? "Systems" : "Sistemas",
    na: lang === "en" ? "Contact" : "Contacto",
  };

  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <Nav lang={lang} set={setLang} t={navT} />

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "min(72svh, 760px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(116px,17vh,200px) clamp(20px,5vw,64px) clamp(48px,7vh,88px)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 56% at 50% 30%, rgba(232,183,131,0.06) 0%, rgba(180,110,40,0.015) 40%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={6} opacity={0.05} />
        <div style={{ position: "relative", zIndex: 5, maxWidth: 880 }}>
          <R>
            <Label style={{ marginBottom: "clamp(18px,2.2vw,28px)" }}>{t.eyebrow}</Label>
            <h1
              style={{
                fontSize: "clamp(2.3rem,5.4vw,5.2rem)",
                fontWeight: 400,
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                textShadow: tsS,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              <W text={t.h1a} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.78)", fontSize: "1.2em" }}>
                <W text={t.h1b} delay={0.12} />
              </span>
            </h1>
          </R>
          <R delay={0.28}>
            <p
              style={{
                margin: "clamp(24px,3vw,38px) auto 0",
                maxWidth: 680,
                fontSize: "clamp(0.98rem,1.3vw,1.18rem)",
                lineHeight: 1.66,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 300,
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {t.strap}
            </p>
          </R>
          <R delay={0.42}>
            <div
              style={{
                marginTop: "clamp(34px,4vw,54px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(12px,1.6vw,18px)",
              }}
            >
              <AuditButton href="/contact" label={t.cta} />
              <p
                style={{
                  margin: 0,
                  maxWidth: 480,
                  fontSize: "clamp(10px,0.85vw,11px)",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.42)",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                  textAlign: "center",
                }}
              >
                {t.ctaNote}
              </p>
            </div>
          </R>
        </div>
      </section>

      {/* WHAT IT IS + WHO FOR */}
      <section style={{ padding: "clamp(44px,5.5vw,84px) clamp(20px,5vw,64px)", position: "relative" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gap: "clamp(36px,5vw,72px)",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          <Block label={t.whatLabel} h={t.whatH} body={t.whatBody} />
          <Block label={t.whoLabel} body={t.whoBody} />
        </div>
      </section>

      {/* WHAT WE ANALYSE — six surfaces */}
      <section style={{ padding: "clamp(48px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 78% 58% at 50% 0%, rgba(232,183,131,0.025) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={4} opacity={0.035} />
        <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.6vw,52px)" }}>
            <Label style={{ marginBottom: 8 }}>{t.analyseLabel}</Label>
            <h2
              style={{
                fontSize: "clamp(1.8rem,3.6vw,3.4rem)",
                fontWeight: 400,
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                textShadow: tsS,
                marginTop: "clamp(12px,2vw,24px)",
              }}
            >
              <W text={t.analyseH} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>
                <W text={t.analyseHb} delay={0.1} />
              </span>
            </h2>
            <Commentary delay={0.22}>{t.analyseIntro}</Commentary>
          </R>
          <div
            style={{
              display: "grid",
              gap: 0,
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              marginTop: "clamp(24px,3vw,40px)",
            }}
          >
            {SURFACES.map((s, i) => (
              <R key={s.slug} delay={0.05 * i}>
                <div
                  style={{
                    position: "relative",
                    padding: "clamp(22px,2.4vw,32px) clamp(18px,2vw,28px)",
                    minHeight: 120,
                    height: "100%",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.34em", color: "rgba(232,183,131,0.6)" }}>{s.n}</span>
                  <h3
                    style={{
                      margin: "clamp(12px,1.4vw,18px) 0 0",
                      fontSize: "clamp(1.05rem,1.4vw,1.32rem)",
                      fontWeight: 400,
                      lineHeight: 1.16,
                      letterSpacing: "-0.02em",
                      color: "white",
                    }}
                  >
                    {s.label[lang]}
                  </h3>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU RECEIVE */}
      <section style={{ padding: "clamp(48px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gap: "clamp(32px,4.6vw,64px)",
          }}
          className="grid-cols-1 md:grid-cols-[minmax(200px,300px)_1fr]"
        >
          <div>
            <R><Label>{t.receiveLabel}</Label></R>
            <R delay={0.1}>
              <h2
                style={{
                  marginTop: "clamp(12px,1.6vw,20px)",
                  fontSize: "clamp(1.5rem,2.4vw,2.3rem)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "white",
                  textShadow: tsS,
                }}
              >
                {t.receiveH}
              </h2>
            </R>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {t.receive.map((line, i) => (
              <R key={line} delay={0.05 * i}>
                <li
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "clamp(16px,1.8vw,24px)",
                    padding: "clamp(14px,1.8vw,22px) 0",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: i === t.receive.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    fontSize: "clamp(0.98rem,1.18vw,1.1rem)",
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 300,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      minWidth: 26,
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.28em",
                      color: "rgba(232,183,131,0.6)",
                      paddingTop: 4,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              </R>
            ))}
          </ul>
        </div>
      </section>

      {/* DURATION & OUTCOME */}
      <section style={{ padding: "clamp(48px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 52% at 50% 50%, rgba(216,147,42,0.035) 0%, transparent 64%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <Label style={{ marginBottom: "clamp(16px,2vw,24px)" }}>{t.durLabel}</Label>
            <h2
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.6rem,3.2vw,2.7rem)",
                lineHeight: 1.16,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-0.01em",
                textShadow: tsS,
                margin: 0,
              }}
            >
              {t.durH}
            </h2>
          </R>
          <R delay={0.2}>
            <p
              style={{
                marginTop: "clamp(20px,2.6vw,32px)",
                fontSize: "clamp(0.95rem,1.22vw,1.12rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.62)",
                fontWeight: 300,
                maxWidth: 640,
                marginLeft: "auto",
                marginRight: "auto",
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {t.durBody}
            </p>
          </R>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "clamp(56px,7vw,120px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 88% 68% at 50% 42%, rgba(216,147,42,0.05) 0%, rgba(180,110,40,0.012) 38%, transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={6} opacity={0.05} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2
              style={{
                fontSize: "clamp(2rem,4.4vw,4.2rem)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                textShadow: tsS,
                margin: 0,
              }}
            >
              <W text={t.finalH} delay={0} />
            </h2>
          </R>
          <R delay={0.2}>
            <p
              style={{
                marginTop: "clamp(22px,2.8vw,34px)",
                fontSize: "clamp(0.92rem,1.22vw,1.08rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 300,
                maxWidth: 620,
                marginLeft: "auto",
                marginRight: "auto",
                textShadow: ts,
              }}
            >
              {t.finalBody}
            </p>
          </R>
          <R delay={0.34}>
            <div style={{ marginTop: "clamp(32px,4vw,52px)", display: "flex", justifyContent: "center" }}>
              <AuditButton href="/contact" label={t.cta} />
            </div>
          </R>
          <R delay={0.5}>
            <div style={{ marginTop: "clamp(28px,3.2vw,40px)" }}>
              <Link
                href="/"
                style={{
                  fontSize: "clamp(10px,0.85vw,11px)",
                  fontWeight: 500,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "color 0.4s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(232,183,131,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
              >
                {t.backHome}
              </Link>
            </div>
          </R>
        </div>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}

function Block({ label, h, body }: { label: string; h?: string; body: string }) {
  return (
    <div>
      <R><Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{label}</Label></R>
      {h && (
        <R delay={0.1}>
          <h2
            style={{
              margin: "0 0 clamp(14px,1.8vw,22px)",
              fontSize: "clamp(1.4rem,2.2vw,2.1rem)",
              fontWeight: 400,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "white",
              textShadow: tsS,
            }}
          >
            {h}
          </h2>
        </R>
      )}
      <R delay={0.18}>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(0.95rem,1.18vw,1.08rem)",
            lineHeight: 1.74,
            color: "rgba(255,255,255,0.68)",
            fontWeight: 300,
            maxWidth: 460,
          }}
        >
          {body}
        </p>
      </R>
    </div>
  );
}

function AuditButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px clamp(28px,3vw,42px)",
        fontSize: "clamp(11px,0.95vw,12.5px)",
        fontWeight: 500,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: "#060606",
        textDecoration: "none",
        background: "#f5e9d4",
        borderRadius: 999,
        transition:
          "background 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "0 16px 40px -18px rgba(232,183,131,0.6), 0 0 0 1px rgba(232,183,131,0.2) inset",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 24px 58px -20px rgba(232,183,131,0.8), 0 0 0 1px rgba(232,183,131,0.34) inset";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f5e9d4";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 16px 40px -18px rgba(232,183,131,0.6), 0 0 0 1px rgba(232,183,131,0.2) inset";
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 24px 58px -20px rgba(232,183,131,0.8), 0 0 0 1px rgba(232,183,131,0.34) inset";
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "#f5e9d4";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 16px 40px -18px rgba(232,183,131,0.6), 0 0 0 1px rgba(232,183,131,0.2) inset";
      }}
    >
      {label}
    </Link>
  );
}
