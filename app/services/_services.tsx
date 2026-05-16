"use client";
import Link from "next/link";
import Image from "next/image";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { LuxButton } from "../_lib/lux-button";
import { SectionMark } from "../_lib/ornaments";
import { WordmarkLink } from "../_lib/wordmark";
import { serviceDetails } from "../_lib/service-details";

const en = {
  eyebrow: "Systems",
  h1a: "Ways to enter",
  h1b: "the lab.",
  lead:
    "Start with a focused system or build a complete visual world. We work in fixed-scope projects, never by the hour. Every engagement is quoted, signed and delivered as a coherent system — designed to make a brand impossible to scroll past.",
  outcomesLabel: "Outcome",
  forLabel: "Built for",
  servicesLabel: "Systems offer · 2026",
  services: [
    {
      number: "01",
      name: "Campaign System",
      price: "From €5,000",
      duration: "2–3 weeks",
      summary:
        "A focused burst across digital surfaces — for openings, launches and drops.",
      includes: [
        "Campaign concept and direction.",
        "Hero visuals and motion key frames.",
        "Two to three campaign micro-pages.",
        "Headline copy in EN/ES.",
        "Launch handover and rollout calendar.",
      ],
      outcome: "A brand event that feels designed end-to-end.",
      forWhom: "Openings · Launches · Drops · One-off cultural moments.",
    },
    {
      number: "02",
      name: "Digital Atmosphere",
      price: "From €10,000",
      duration: "4–6 weeks",
      summary:
        "A cinematic single-page world for the brand. The home, in the most literal sense.",
      includes: [
        "Art direction and motion language.",
        "Single-page cinematic build (Next.js).",
        "Copy in EN/ES — headlines, sections, CTA.",
        "SEO, OG image, structured data.",
        "Analytics, deploy and handover.",
      ],
      outcome: "A digital home that finally matches the physical one.",
      forWhom: "Restaurants · Boutique hotels · Studios · Artists.",
    },
    {
      number: "03",
      name: "Brand World",
      price: "From €25,000",
      duration: "8–12 weeks",
      summary:
        "A complete multi-page system. Visual language, motion, copy, technical build, launch.",
      includes: [
        "Brand direction and atmosphere brief.",
        "Multi-page system (6–12 routes).",
        "Identity surfaces: marks, type, palette, motion.",
        "Full copy direction in EN/ES.",
        "Technical build, SEO, structured data.",
        "Launch direction and post-launch tuning.",
      ],
      outcome: "A brand that walks into the room before the founder does.",
      forWhom: "Hotel groups · Cultural venues · Architecture studios · Wellness brands.",
      featured: true,
    },
    {
      number: "04",
      name: "Visual Engine",
      price: "From €4,000 / month",
      duration: "Monthly · 6-month minimum",
      summary:
        "Continuous creative system — campaigns, updates, visual production and AI direction.",
      includes: [
        "One campaign per month, end-to-end.",
        "Visual production: imagery, motion, copy.",
        "AI-assisted direction and asset extension.",
        "Site updates and surface refinement.",
        "Monthly direction call and report.",
      ],
      outcome: "A brand that ships culture, not posts.",
      forWhom: "Brands in flight that need continuous direction, not deliverables.",
    },
    {
      number: "05",
      name: "SEO & Conversion Layer",
      price: "From €1,500",
      duration: "1–2 weeks",
      summary: "SEO, analytics, structured data, conversion tuning, technical refinement.",
      includes: [
        "Technical SEO audit and fixes.",
        "Structured data and metadata system.",
        "Analytics, Search Console and dashboards.",
        "Conversion and clarity tuning.",
        "Performance and accessibility pass.",
      ],
      outcome: "Direction the search engines, AIs and humans all read clearly.",
      forWhom: "Brands with a beautiful site that is not yet found.",
    },
    {
      number: "06",
      name: "Perception Upgrade Sprint",
      price: "From €2,500 – €4,000",
      duration: "2–4 weeks",
      summary:
        "Two-to-four-week intensive on an existing brand — direction, copy, surfaces, motion.",
      includes: [
        "Diagnosis of the perception gap.",
        "Targeted re-direction across key surfaces.",
        "Headline copy and CTA rewrite.",
        "Motion and visual upgrades on existing pages.",
        "Final report and onward roadmap.",
      ],
      outcome: "An existing brand pulled forward without a full rebuild.",
      forWhom: "Brands with a working site that is no longer at the level of the product.",
    },
  ],
  approachL: "How it works",
  approachH1: "Direction first.",
  approachH2: "Then everything else.",
  approachBody: [
    "Every engagement starts with a perception gap — the distance between what the brand feels like in the room, and what it feels like on a screen. We close it.",
    "We do not sell hours. We do not sell content. We sell direction, and we build the surfaces that carry it.",
  ],
  pillars: [
    {
      title: "Diagnose",
      body: "We identify the perception gap between the brand experienced and the brand seen.",
    },
    {
      title: "Direct",
      body: "We set one direction: tone, atmosphere, copy, motion, visual system.",
    },
    {
      title: "Build",
      body: "We build the surfaces — site, campaign, system — under that direction.",
    },
    {
      title: "Activate",
      body: "We launch, measure, tune and stay through the first month.",
    },
  ],
  faqsH: "Practical notes.",
  faqs: [
    {
      q: "How do you bill?",
      a:
        "Fixed-scope projects, paid in milestones (typically 40% / 30% / 30%). Monthly engagements bill in advance.",
    },
    {
      q: "Do you work with agencies in-house?",
      a:
        "Yes. We collaborate with internal marketing and brand teams. We are happy to white-label when the relationship asks for it.",
    },
    {
      q: "Languages?",
      a: "We deliver in English and Spanish, native. Other languages on request.",
    },
    {
      q: "Stack?",
      a:
        "Next.js, modern motion, AI-enhanced production. Hosted on Vercel by default. Open to existing stacks.",
    },
  ],
  closingH: "Apply for a project.",
  closingBody:
    "Every engagement is selected. Tell us what you are building, when it opens, and what level you want it to feel at.",
  cta: "Start a project",
  back: "← Home",
  featuredLabel: "Most chosen",
  fromLabel: "Investment",
};

const es = {
  eyebrow: "Sistemas",
  h1a: "Cómo entrar",
  h1b: "al laboratorio.",
  lead:
    "Empieza con un sistema enfocado o construye un mundo visual completo. Trabajamos por proyectos con alcance cerrado, nunca por horas. Cada encargo se cotiza, se firma y se entrega como un sistema coherente — diseñado para que tu marca sea imposible de ignorar.",
  outcomesLabel: "Resultado",
  forLabel: "Para",
  servicesLabel: "Oferta de sistemas · 2026",
  services: [
    {
      number: "01",
      name: "Campaign System",
      price: "Desde €5.000",
      duration: "2–3 semanas",
      summary:
        "Una intervención breve y precisa en superficies digitales: aperturas, lanzamientos y momentos culturales puntuales.",
      includes: [
        "Concepto y dirección de campaña.",
        "Visuales principales y fotogramas clave de animación.",
        "Dos o tres micro-páginas de campaña.",
        "Redacción de titulares en EN/ES.",
        "Entrega y calendario de lanzamiento.",
      ],
      outcome: "Un evento de marca que se siente diseñado de principio a fin.",
      forWhom: "Aperturas · Lanzamientos · Drops · Momentos culturales.",
    },
    {
      number: "02",
      name: "Atmósfera Digital",
      price: "Desde €10.000",
      duration: "4–6 semanas",
      summary:
        "Un mundo cinematográfico de una sola página: el lugar donde tu marca vive online.",
      includes: [
        "Dirección de arte y lenguaje de movimiento.",
        "Desarrollo cinematográfico de una sola página (Next.js).",
        "Redacción en EN/ES — titulares, secciones, llamadas a la acción.",
        "SEO, imagen para redes sociales y datos estructurados.",
        "Analítica, puesta en producción y traspaso final.",
      ],
      outcome: "Un hogar digital al fin a la altura del físico.",
      forWhom: "Restaurantes · Hoteles boutique · Estudios · Artistas.",
    },
    {
      number: "03",
      name: "Mundo de Marca",
      price: "Desde €25.000",
      duration: "8–12 semanas",
      summary:
        "Un sistema multipágina completo: lenguaje visual, movimiento, redacción, desarrollo técnico y lanzamiento.",
      includes: [
        "Dirección de marca y brief atmosférico.",
        "Sistema multipágina (6–12 secciones).",
        "Superficies de identidad: marca, tipografía, paleta, movimiento.",
        "Dirección completa de redacción en EN/ES.",
        "Desarrollo técnico, SEO y datos estructurados.",
        "Dirección de lanzamiento y afinado posterior.",
      ],
      outcome: "Una marca que entra en la sala antes que el fundador.",
      forWhom: "Grupos hoteleros · Lugares culturales · Estudios de arquitectura · Marcas wellness.",
      featured: true,
    },
    {
      number: "04",
      name: "Motor Visual",
      price: "Desde €4.000 / mes",
      duration: "Mensual · 6 meses mínimo",
      summary:
        "Sistema creativo continuo: campañas, actualizaciones, producción visual y dirección asistida por IA.",
      includes: [
        "Una campaña al mes, de principio a fin.",
        "Producción visual: imagen, movimiento, redacción.",
        "Dirección y extensión de activos asistida por IA.",
        "Actualizaciones del sitio y refinamiento de superficies.",
        "Llamada mensual de dirección e informe.",
      ],
      outcome: "Una marca que envía cultura, no posts.",
      forWhom: "Marcas en marcha que necesitan dirección continua, no entregables sueltos.",
    },
    {
      number: "05",
      name: "SEO y Conversión",
      price: "Desde €1.500",
      duration: "1–2 semanas",
      summary:
        "SEO, analítica, datos estructurados, optimización de conversión y refinamiento técnico.",
      includes: [
        "Auditoría técnica de SEO y correcciones.",
        "Sistema de metadatos y datos estructurados.",
        "Analítica, Search Console y paneles.",
        "Optimización de conversión y claridad.",
        "Repaso de rendimiento y accesibilidad.",
      ],
      outcome: "Una dirección que motores, IAs y humanos leen con la misma claridad.",
      forWhom: "Marcas con un buen sitio que aún no atrae el tráfico que merece.",
    },
    {
      number: "06",
      name: "Sprint de Mejora de Percepción",
      price: "Desde €2.500 – €4.000",
      duration: "2–4 semanas",
      summary:
        "Intensivo de dos a cuatro semanas sobre una marca existente: dirección, redacción, superficies y movimiento.",
      includes: [
        "Diagnóstico del gap de percepción.",
        "Re-dirección puntual en superficies clave.",
        "Reescritura de titulares y llamadas a la acción.",
        "Mejoras de movimiento y visuales en páginas existentes.",
        "Informe final y hoja de ruta.",
      ],
      outcome: "Una marca existente impulsada sin necesidad de rehacer todo.",
      forWhom: "Marcas con un sitio que funciona pero ya no está a la altura del producto.",
    },
  ],
  approachL: "Cómo funciona",
  approachH1: "Dirección primero.",
  approachH2: "Lo demás después.",
  approachBody: [
    "Cada encargo empieza por un gap de percepción — la distancia entre cómo se siente la marca en la sala y cómo se siente en pantalla. Lo cerramos.",
    "No vendemos horas. No vendemos contenido. Vendemos dirección, y construimos las superficies que la sostienen.",
  ],
  pillars: [
    {
      title: "Diagnosticar",
      body: "Identificamos el gap de percepción entre la marca vivida y la marca vista.",
    },
    {
      title: "Dirigir",
      body: "Fijamos una sola dirección: tono, atmósfera, redacción, movimiento, sistema visual.",
    },
    {
      title: "Construir",
      body: "Construimos las superficies — sitio, campaña, sistema — bajo esa dirección.",
    },
    {
      title: "Activar",
      body: "Lanzamos, medimos, afinamos y nos quedamos durante el primer mes.",
    },
  ],
  faqsH: "Notas prácticas.",
  faqs: [
    {
      q: "¿Cómo facturáis?",
      a:
        "Proyectos con alcance cerrado, pagados por hitos (típicamente 40% / 30% / 30%). Los encargos mensuales se facturan por adelantado.",
    },
    {
      q: "¿Trabajáis con equipos internos o agencias?",
      a:
        "Sí. Colaboramos con equipos internos de marca y marketing. Trabajamos en marca blanca cuando la relación lo requiere.",
    },
    {
      q: "¿Idiomas de entrega?",
      a: "Entregamos en inglés y español, ambos nativos. Otros idiomas bajo petición.",
    },
    {
      q: "¿Stack técnico?",
      a:
        "Next.js, animación moderna y producción asistida por IA. Alojamiento por defecto en Vercel. Abiertos a integrar stacks existentes.",
    },
  ],
  closingH: "Solicitar un proyecto.",
  closingBody:
    "Cada encargo se selecciona. Cuéntanos qué construyes, cuándo abre y a qué altura quieres que se sienta.",
  cta: "Iniciar un proyecto",
  back: "← Inicio",
  featuredLabel: "Más elegido",
  fromLabel: "Inversión",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function Services() {
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
          <Link
            href="/"
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
            }}
          >
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
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
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(70,45,20,0.45) 0%, rgba(22,14,8,0.22) 38%, transparent 72%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Dust count={14} opacity={0.08} />
        <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>{t.servicesLabel}</p>
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
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0,
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

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(48px,8vw,120px)", maxWidth: 1200, margin: "0 auto" }}>
        {t.services.map((s, i) => {
          const slug = serviceDetails[i]?.slug;
          return (
          <R key={s.number} delay={0.04 * i}>
            <article
              style={{
                display: "grid",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(40px,5vw,72px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
              }}
              className="grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              {slug && (
                <Link
                  href={`/services/${slug}`}
                  aria-label={s.name}
                  style={{ position: "absolute", inset: 0, zIndex: 1 }}
                />
              )}
              {s.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "clamp(28px,3.4vw,48px)",
                    right: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    border: "1px solid rgba(232,183,131,0.45)",
                    background: "rgba(232,183,131,0.08)",
                    color: "#e8b783",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    borderRadius: 999,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#e8b783",
                      boxShadow: "0 0 10px 1px rgba(232,183,131,0.7)",
                    }}
                  />
                  {t.featuredLabel}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(2rem,3.6vw,3.4rem)",
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {s.number}
                </p>
                <p style={labelStyle}>{s.duration}</p>
              </div>
              <div style={{ maxWidth: 820 }}>
                <h2
                  style={{
                    fontSize: "clamp(1.8rem,3.4vw,3rem)",
                    fontWeight: 400,
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                    color: "white",
                    textShadow: tsS,
                    marginBottom: "clamp(20px,2.4vw,28px)",
                  }}
                >
                  {s.name}
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    paddingBottom: "clamp(22px,2.8vw,32px)",
                    marginBottom: "clamp(26px,3vw,36px)",
                    borderBottom: "1px solid rgba(232,183,131,0.18)",
                  }}
                >
                  <p style={{ ...labelStyle, color: "rgba(232,183,131,0.6)" }}>{t.fromLabel}</p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: "clamp(2.4rem,4.8vw,4.4rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.025em",
                      color: "#e8b783",
                      textShadow: "0 1px 24px rgba(232,183,131,0.18)",
                    }}
                  >
                    {s.price}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: "clamp(1rem,1.22vw,1.12rem)",
                    lineHeight: 1.72,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 300,
                    marginBottom: "clamp(28px,3vw,36px)",
                  }}
                >
                  {s.summary}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "clamp(28px,3vw,36px)" }}>
                  {s.includes.map((line, j) => (
                    <li
                      key={j}
                      style={{
                        padding: "clamp(10px,1.2vw,14px) 0",
                        borderTop: j === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        fontSize: "clamp(0.95rem,1.14vw,1.05rem)",
                        lineHeight: 1.55,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 300,
                      }}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    display: "grid",
                    gap: "clamp(16px,2vw,28px)",
                  }}
                  className="grid-cols-1 md:grid-cols-2"
                >
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 8 }}>{t.outcomesLabel}</p>
                    <p
                      style={{
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: "clamp(1rem,1.3vw,1.18rem)",
                        lineHeight: 1.45,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      {s.outcome}
                    </p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 8 }}>{t.forLabel}</p>
                    <p
                      style={{
                        fontSize: "clamp(0.95rem,1.14vw,1.05rem)",
                        lineHeight: 1.55,
                        color: "rgba(255,255,255,0.6)",
                        fontWeight: 300,
                      }}
                    >
                      {s.forWhom}
                    </p>
                  </div>
                </div>
                {slug && (
                  <div style={{ marginTop: "clamp(28px,3vw,40px)", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2, pointerEvents: "none" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: "rgba(232,183,131,0.85)",
                      }}
                    >
                      {lang === "en" ? "Read the system" : "Leer el sistema"}
                    </span>
                    <span
                      style={{
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: 18,
                        color: "#e8b783",
                      }}
                    >
                      →
                    </span>
                  </div>
                )}
              </div>
            </article>
          </R>
          );
        })}
      </section>

      <SectionMark />

      <section style={{ position: "relative", minHeight: "clamp(48svh,58vh,68svh)", overflow: "hidden" }}>
        <Image
          src="/images/05_identity_chrome.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 40%" }}
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
        <div
          style={{
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "clamp(55svh,68vh,78svh)",
            padding: "0 clamp(24px,5vw,72px)",
            textAlign: "center",
          }}
        >
          <R>
            <p style={{ ...labelStyle, marginBottom: 18 }}>{t.approachL}</p>
            <h2
              style={{
                fontSize: "clamp(2rem,4.6vw,4.4rem)",
                fontWeight: 400,
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
                color: "white",
                textShadow: tsS,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              <W text={t.approachH1} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.18em" }}>
                <W text={t.approachH2} delay={0.14} />
              </span>
            </h2>
          </R>
          <R delay={0.25}>
            <div style={{ maxWidth: 720, margin: "clamp(24px,3vw,36px) auto 0" }}>
              {t.approachBody.map((p, j) => (
                <p
                  key={j}
                  style={{
                    marginBottom: j === t.approachBody.length - 1 ? 0 : "1em",
                    fontSize: "clamp(0.98rem,1.22vw,1.12rem)",
                    lineHeight: 1.72,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 300,
                    textShadow: ts,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          </R>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(72px,10vw,140px) clamp(24px,7vw,96px)",
          maxWidth: 1200,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "clamp(20px,2.5vw,32px)",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {t.pillars.map((p, i) => (
            <R key={p.title} delay={0.05 * i}>
              <div
                style={{
                  padding: "clamp(28px,3vw,40px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>{String(i + 1).padStart(2, "0")}</p>
                  <h3
                    style={{
                      fontSize: "clamp(1.4rem,2vw,1.9rem)",
                      fontWeight: 400,
                      lineHeight: 1.1,
                      letterSpacing: "-0.025em",
                      color: "white",
                      marginBottom: 14,
                    }}
                  >
                    {p.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "clamp(0.98rem,1.18vw,1.1rem)",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 300,
                  }}
                >
                  {p.body}
                </p>
              </div>
            </R>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "clamp(56px,8vw,120px) clamp(24px,7vw,96px)",
          maxWidth: 1120,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <R>
          <h2
            style={{
              fontSize: "clamp(1.8rem,3.4vw,3rem)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              color: "white",
              textShadow: tsS,
              marginBottom: "clamp(32px,4vw,52px)",
            }}
          >
            {t.faqsH}
          </h2>
        </R>
        <dl style={{ margin: 0 }}>
          {t.faqs.map((f, i) => (
            <R key={f.q} delay={0.04 * i}>
              <div
                style={{
                  display: "grid",
                  gap: "clamp(8px,1.5vw,20px)",
                  padding: "clamp(24px,3vw,36px) 0",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
                className="grid-cols-1 md:grid-cols-[minmax(220px,320px)_1fr]"
              >
                <dt
                  style={{
                    fontSize: "clamp(1rem,1.2vw,1.12rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    color: "white",
                  }}
                >
                  {f.q}
                </dt>
                <dd
                  style={{
                    fontSize: "clamp(0.98rem,1.18vw,1.1rem)",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {f.a}
                </dd>
              </div>
            </R>
          ))}
        </dl>
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
