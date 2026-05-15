"use client";
import Link from "next/link";
import Image from "next/image";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { LuxButton } from "../_lib/lux-button";
import { SectionMark } from "../_lib/ornaments";
import { WordmarkLink } from "../_lib/wordmark";

const en = {
  eyebrow: "Process",
  h1a: "Diagnose. Direct.",
  h1b: "Build. Activate.",
  lead:
    "Every engagement moves through four movements. The poetry stays. The commercial substance is explicit: a perception gap to close, a business objective to hit, an audience to direct at, and a system to launch and tune.",
  movements: [
    {
      number: "01",
      title: "Diagnose",
      body: [
        "Every project begins by naming the perception gap — the distance between what the brand feels like in the room, and what it feels like on a screen.",
        "We sit with you, the place and the numbers. We ask what the brand wants to make people feel, what business objective it is hired to hit, and who exactly it is hired to move.",
        "The output of this movement is a written brief: perception gap, business objective, primary audience, tone of voice, one single direction.",
      ],
    },
    {
      number: "02",
      title: "Direct",
      body: [
        "We translate the diagnosis into one visual hypothesis — atmosphere, palette, motion, copy register, conversion structure.",
        "This is not a moodboard. It is a tuning fork: one note the rest of the system aligns to, including the way the page asks the visitor to act.",
        "We agree the direction in writing before a single screen is built. Everything that follows is execution of this one decision.",
      ],
    },
    {
      number: "03",
      title: "Build",
      body: [
        "Identity, copy, motion, code. Each is built as part of the same body, never as separate deliverables.",
        "Visual system, technical implementation, structured data, performance and accessibility are designed together. We use AI to extend production where it raises the level, never to dilute the direction.",
        "We move quickly inside the agreed direction, and we discard everything that is not on the line.",
      ],
    },
    {
      number: "04",
      title: "Activate",
      body: [
        "Delivery is not the end. We launch, we instrument, we read the first weeks of behaviour, and we tune.",
        "Launch direction, analytics setup, SEO finalisation, first-iteration adjustments and a written report close every engagement. From there, brands either step away or stay on a monthly Visual Engine.",
      ],
    },
  ],
  deliverablesLabel: "What you receive",
  deliverablesH: "Tangible outputs.",
  deliverablesIntro:
    "Each engagement results in a coherent set of artefacts — built to launch and to last, not to be filed away.",
  deliverables: [
    "Written brief: perception gap, objective, audience, direction.",
    "Visual identity system: marks, typography, palette, motion.",
    "Copy direction in EN/ES across surfaces.",
    "Technical build, structured data, SEO, analytics.",
    "Launch direction and conversion structure.",
    "Post-launch tuning across the first month.",
  ],
  closingH: "Worlds are not built fast.",
  closingBody:
    "If you have a brand that wants to be felt — a hotel, a club, an architecture, an identity — we would like to hear about it.",
  cta: "Apply for a project",
  back: "← Home",
};

const es = {
  eyebrow: "Método",
  h1a: "Diagnosticar. Dirigir.",
  h1b: "Construir. Activar.",
  lead:
    "Cada encargo se mueve en cuatro movimientos. La poética se mantiene. La sustancia comercial es explícita: un gap de percepción que cerrar, un objetivo de negocio que cumplir, una audiencia hacia la que dirigir y un sistema que lanzar y afinar.",
  movements: [
    {
      number: "01",
      title: "Diagnosticar",
      body: [
        "Todo proyecto empieza nombrando el gap de percepción — la distancia entre cómo se siente la marca en la sala y cómo se siente en pantalla.",
        "Nos sentamos contigo, con el lugar y con los números. Preguntamos qué quiere hacer sentir la marca, qué objetivo de negocio está contratada para cumplir y a quién está contratada para mover.",
        "El resultado de este movimiento es un brief escrito: gap de percepción, objetivo de negocio, audiencia primaria, tono y una sola dirección.",
      ],
    },
    {
      number: "02",
      title: "Dirigir",
      body: [
        "Traducimos el diagnóstico en una sola hipótesis visual — atmósfera, paleta, movimiento, registro de copy, estructura de conversión.",
        "No es un moodboard. Es un diapasón: una nota a la que se alinea el resto del sistema, incluida la manera en que la página pide al visitante que actúe.",
        "Cerramos por escrito la dirección antes de construir una sola pantalla. Todo lo que sigue es ejecución de esa decisión.",
      ],
    },
    {
      number: "03",
      title: "Construir",
      body: [
        "Identidad, copy, movimiento, código. Cada cosa se construye como parte del mismo cuerpo, nunca como entregables separados.",
        "Sistema visual, build técnico, datos estructurados, rendimiento y accesibilidad se diseñan juntos. Usamos IA para extender producción cuando eleva el nivel, nunca para diluir la dirección.",
        "Avanzamos rápido dentro de la dirección acordada y descartamos todo lo que no esté en línea.",
      ],
    },
    {
      number: "04",
      title: "Activar",
      body: [
        "La entrega no es el final. Lanzamos, instrumentamos, leemos las primeras semanas de comportamiento y afinamos.",
        "Dirección de lanzamiento, configuración de analítica, cierre de SEO, primera iteración y un informe escrito cierran cada encargo. Después, las marcas se van o se quedan en un Motor Visual mensual.",
      ],
    },
  ],
  deliverablesLabel: "Lo que recibes",
  deliverablesH: "Salidas tangibles.",
  deliverablesIntro:
    "Cada colaboración resulta en un conjunto coherente de piezas — construidas para lanzar y para durar, no para archivar.",
  deliverables: [
    "Brief escrito: gap de percepción, objetivo, audiencia, dirección.",
    "Sistema de identidad visual: marca, tipografía, paleta, movimiento.",
    "Dirección de copy en EN/ES en todas las superficies.",
    "Build técnico, datos estructurados, SEO, analítica.",
    "Dirección de lanzamiento y estructura de conversión.",
    "Afinado post-lanzamiento durante el primer mes.",
  ],
  closingH: "Los mundos no se construyen rápido.",
  closingBody:
    "Si tienes una marca que quiere ser sentida — un hotel, un club, una arquitectura, una identidad — nos gustaría saber de ella.",
  cta: "Aplicar para un proyecto",
  back: "← Inicio",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function Process() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "#060606",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(4,3,2,0.92)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        <nav
          style={{
            maxWidth: 1600,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            padding: "0 clamp(20px,5vw,56px)",
          }}
        >
          <WordmarkLink />
          <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
          </button>
        </nav>
      </header>

      <section
        style={{
          position: "relative",
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(60px,9vw,120px)",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        {/* Warm radial backdrop for the hero */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(70,45,20,0.5) 0%, rgba(22,14,8,0.22) 38%, transparent 72%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Dust count={14} opacity={0.08} />
        <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.6rem,7.5vw,7.4rem)",
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: "-0.055em",
            textShadow: tsS,
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "0.18em",
          }}
        >
          <W text={t.h1a} delay={0} />
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.18em" }}>
            <W text={t.h1b} delay={0.14} />
          </span>
        </h1>
        <R delay={0.3}>
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(1rem,1.35vw,1.22rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.74)",
              fontWeight: 300,
              maxWidth: 760,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(48px,8vw,120px)", maxWidth: 1120, margin: "0 auto" }}>
        {t.movements.map((m, i) => (
          <R key={m.number} delay={0.05 * i}>
            <div
              style={{
                display: "grid",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(40px,5vw,72px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="grid-cols-1 md:grid-cols-[minmax(120px,180px)_1fr]"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(2rem,3.6vw,3.4rem)",
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {m.number}
                </p>
                <p style={labelStyle}>{m.title}</p>
              </div>
              <div style={{ maxWidth: 720 }}>
                <h2
                  style={{
                    fontSize: "clamp(1.8rem,3.6vw,3.4rem)",
                    fontWeight: 400,
                    lineHeight: 1.04,
                    letterSpacing: "-0.045em",
                    color: "white",
                    textShadow: tsS,
                    marginBottom: "clamp(20px,2.5vw,32px)",
                  }}
                >
                  {m.title}
                </h2>
                {m.body.map((p, j) => (
                  <p
                    key={j}
                    style={{
                      marginBottom: j === m.body.length - 1 ? 0 : "1.2em",
                      fontSize: "clamp(1rem,1.22vw,1.12rem)",
                      lineHeight: 1.72,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 300,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </R>
        ))}
      </section>

      <SectionMark />

      {/* Atmospheric image break — bridge between movements and deliverables */}
      <section style={{ position: "relative", minHeight: "clamp(48svh,58vh,68svh)", overflow: "hidden" }}>
        <Image
          src="/images/08_reflective_table.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(6,6,6,1) 0%, rgba(4,3,2,0.18) 18%, rgba(4,3,2,0.45) 60%, rgba(6,6,6,1) 100%)",
          }}
        />
        <Dust count={8} opacity={0.07} />
        <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "clamp(55svh,68vh,78svh)", padding: "0 clamp(24px,5vw,72px)", textAlign: "center" }}>
          <R>
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.6rem,3.6vw,3.4rem)",
                lineHeight: 1.22,
                color: "rgba(255,255,255,0.86)",
                maxWidth: 1000,
                textShadow: tsS,
              }}
            >
              {lang === "en"
                ? "“We do not finish a project. We tune it until the room agrees with itself.”"
                : "“No terminamos un proyecto. Lo afinamos hasta que la habitación se pone de acuerdo consigo misma.”"}
            </p>
          </R>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(72px,10vw,140px) clamp(24px,7vw,96px)",
          maxWidth: 1120,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "clamp(36px,5vw,72px)",
          }}
          className="grid-cols-1 md:grid-cols-[minmax(160px,220px)_1fr]"
        >
          <R>
            <p style={labelStyle}>{t.deliverablesLabel}</p>
          </R>
          <div>
            <R>
              <h2
                style={{
                  fontSize: "clamp(1.8rem,3.6vw,3.4rem)",
                  fontWeight: 400,
                  lineHeight: 1.02,
                  letterSpacing: "-0.045em",
                  color: "white",
                  textShadow: tsS,
                  marginBottom: "clamp(20px,2.5vw,32px)",
                }}
              >
                {t.deliverablesH}
              </h2>
            </R>
            <R delay={0.08}>
              <p
                style={{
                  fontSize: "clamp(1rem,1.22vw,1.12rem)",
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 300,
                  marginBottom: "clamp(28px,3.5vw,44px)",
                  maxWidth: 640,
                }}
              >
                {t.deliverablesIntro}
              </p>
            </R>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {t.deliverables.map((d, i) => (
                <R key={d} delay={0.04 * i}>
                  <li
                    style={{
                      padding: "clamp(14px,1.8vw,22px) 0",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: "clamp(1.05rem,1.6vw,1.5rem)",
                      lineHeight: 1.3,
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
                    {d}
                  </li>
                </R>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(80px,11vw,160px) clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        <Dust count={6} opacity={0.06} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2
              style={{
                fontSize: "clamp(2rem,5vw,4.4rem)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                color: "white",
                textShadow: tsS,
              }}
            >
              {t.closingH}
            </h2>
          </R>
          <R delay={0.2}>
            <p
              style={{
                marginTop: "clamp(20px,2.5vw,32px)",
                fontSize: "clamp(0.95rem,1.22vw,1.1rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 300,
                textShadow: ts,
              }}
            >
              {t.closingBody}
            </p>
          </R>
          <R delay={0.32}>
            <div style={{ marginTop: "clamp(32px,4vw,52px)" }}>
              <LuxButton href="/contact" variant="solid" arrow={false}>{t.cta}</LuxButton>
            </div>
          </R>
        </div>
      </section>
    </main>
  );
}
