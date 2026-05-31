"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ts, tsS, serif, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { SiteFooter } from "../_lib/site-footer";
import { applyToNetwork, type NetworkTrack } from "./actions";

// ---------------------------------------------------------------
// The network — a collaborator capture window. The rest of the site
// speaks to clients; this surface speaks to the people the studio might
// work *with*: distribution, systems, creation, direction. One door,
// four disciplines, each reading only its own track. Copy is built from
// the same vocabulary as the dossier, condensed to the register a
// prospective collaborator would read. Translation favours meaning over
// lexical mirror — see AGENTS.md.
// ---------------------------------------------------------------

type Lang = "en" | "es";

type Track = {
  id: NetworkTrack;
  num: string;
  tag: string; // selector chip
  name: string; // panel title
  role: string;
  lead: string;
  need: string[];
  sectors: string;
  levels: string;
  skills: string[];
  why: string;
};

type Copy = {
  back: string;
  eyebrow: string;
  h1a: string;
  h1b: string;
  lead: string;
  selectorLabel: string;
  selectorNote: string;
  roleLabel: string;
  needLabel: string;
  sectorsLabel: string;
  levelsLabel: string;
  skillsLabel: string;
  whyLabel: string;
  formEyebrow: string;
  trackChip: string;
  emailLabel: string;
  emailPlaceholder: string;
  capLabel: string;
  capPlaceholder: string;
  submit: string;
  sending: string;
  fineprint: string;
  successBadge: string;
  successH: string;
  successBody: string;
  again: string;
  mailtoCta: string;
  errors: { validation: string; rate: string; send: string };
  tracks: Track[];
};

const en: Copy = {
  back: "← Home",
  eyebrow: "The network · MMXXVI",
  h1a: "A studio is a",
  h1b: "small group of hands.",
  lead: "XNLAB is an anonymous atelier founded in MMXXII. We direct the atmosphere between a brand and its customer across six surfaces, with the model as a production crew under a director — never a content factory. For MMXXVI the studio is building its network by discipline. This is the door. Choose the hand you are, read what the studio looks for, and leave the work you bring.",
  selectorLabel: "Choose your discipline",
  selectorNote: "You see only your track. The studio reads each one apart.",
  roleLabel: "Who this is",
  needLabel: "What the studio looks for",
  sectorsLabel: "Where it applies",
  levelsLabel: "Levels",
  skillsLabel: "Signals",
  whyLabel: "Why it exists",
  formEyebrow: "Leave your request",
  trackChip: "Track",
  emailLabel: "Email",
  emailPlaceholder: "you@domain.com",
  capLabel: "What you bring / what you ask for",
  capPlaceholder: "Two or three lines: what you can do, the level you work at, what you would want from the studio.",
  submit: "Send to the studio",
  sending: "Sending…",
  fineprint: "A person reads it, tagged by discipline. No newsletter. studio@xnlab.io receives a copy and replies when a cycle opens a place.",
  successBadge: "Received",
  successH: "The studio has it.",
  successBody: "Your request is in, tagged to your track. We reply when the work suggests a fit — not before.",
  again: "Send another",
  mailtoCta: "Open an email to the studio",
  errors: {
    validation: "Add a valid email and a couple of lines.",
    rate: "The studio already has this request. Try again in a moment.",
    send: "Connection to the studio failed. Write to studio@xnlab.io.",
  },
  tracks: [
    {
      id: "distribution",
      num: "01",
      tag: "Sales",
      name: "Distribution",
      role: "Sellers, business development, the people who open and close.",
      lead: "The studio's way of selling is its own product: diagnosis before pitch, a private discovery, a partner-signed engagement. Distribution carries that method to the brands that should know it.",
      need: [
        "You sell consultative, long-cycle work — not volume, not discounts.",
        "You hold a room of founders and C-levels without raising your voice.",
        "You bring a network in premium categories, or the discipline to build one.",
      ],
      sectors: "Premium, considered categories — hospitality, clinics, retail, real estate, design-led brands.",
      levels: "From senior closer to network principal. By engagement, not headcount.",
      skills: ["Consultative selling", "C-level access", "Discovery", "Long-cycle pipeline", "Premium categories"],
      why: "The studio sells by appointment. Distribution is how the appointment finds the right table.",
    },
    {
      id: "systems",
      num: "02",
      tag: "Tech",
      name: "Systems",
      role: "Engineers, data, infrastructure, applied AI.",
      lead: "The studio directs the model; it does not worship it. Systems builds the surfaces and the pipelines that carry a brand's atmosphere into product, search and operations — and keeps the AI under direction, never loose.",
      need: [
        "You ship production code, not demos — web, data, or applied AI.",
        "You treat the model as a crew you direct, not a button you press.",
        "You care how a thing feels to use, not only that it runs.",
      ],
      sectors: "Owned digital, product surfaces, customer operations, internal tooling.",
      levels: "From senior engineer to systems lead. Per project.",
      skills: ["TypeScript / Next", "Data & pipelines", "Applied AI under direction", "Infrastructure", "Product sense"],
      why: "Direction is the scarce resource. Systems is how direction reaches the machine.",
    },
    {
      id: "creation",
      num: "03",
      tag: "Creative",
      name: "Creation",
      role: "Creative direction, design, motion, copy, brand.",
      lead: "Atmosphere is light, sound, material, motion and pacing directed as one. Creation is the hand that sets the world — palette, register, what the brand will not do — so the model can extend it without diluting it.",
      need: [
        "You direct a world, not a deliverable — palette, tone, restraint.",
        "You set a system tight enough that AI extends it instead of eroding it.",
        "Your taste survives contact with scale.",
      ],
      sectors: "Identity, owned digital, retail and physical, communication, worldbuilding.",
      levels: "From senior designer to creative director. Per engagement.",
      skills: ["Art / creative direction", "Motion & sound", "Editorial copy", "Identity systems", "AI as crew"],
      why: "AI made content cheap, not memorable. Creation is the difference.",
    },
    {
      id: "direction",
      num: "04",
      tag: "Strategy & People",
      name: "Direction",
      role: "Strategy, operations, people — the ones who read the numbers.",
      lead: "Behind the atmosphere is an operation: who joins, how a cycle runs, what the figures say. Direction reads the data the others produce and keeps the studio's discipline intact as it grows.",
      need: [
        "You move between strategy, operations and people without dropping any.",
        "You read figures and turn them into decisions, not dashboards.",
        "You protect a standard under pressure to lower it.",
      ],
      sectors: "Studio operations, cycle planning, talent, partner relationships, analysis.",
      levels: "From operator to studio director. Per engagement.",
      skills: ["Strategy", "Operations", "People & talent", "Analysis", "Cycle planning"],
      why: "Someone has to read what everyone else makes. Direction is that someone.",
    },
  ],
};

const es: Copy = {
  back: "← Inicio",
  eyebrow: "La red · MMXXVI",
  h1a: "Un estudio es un",
  h1b: "grupo pequeño de manos.",
  lead: "XNLAB es un atelier anónimo fundado en MMXXII. Dirigimos la atmósfera entre una marca y su cliente en seis superficies, con el modelo como equipo de producción a las órdenes de un director — nunca como fábrica de contenido. Para MMXXVI el estudio construye su red por disciplina. Esta es la puerta. Elige la mano que eres, lee qué busca el estudio y deja el trabajo que traes.",
  selectorLabel: "Elige tu disciplina",
  selectorNote: "Solo ves tu track. El estudio lee cada uno por separado.",
  roleLabel: "Quién es",
  needLabel: "Qué busca el estudio",
  sectorsLabel: "Dónde se aplica",
  levelsLabel: "Niveles",
  skillsLabel: "Señales",
  whyLabel: "Por qué existe",
  formEyebrow: "Deja tu petición",
  trackChip: "Track",
  emailLabel: "Email",
  emailPlaceholder: "tu@dominio.com",
  capLabel: "Qué traes / qué pides",
  capPlaceholder: "Dos o tres líneas: qué sabes hacer, a qué nivel trabajas, qué querrías del estudio.",
  submit: "Enviar al estudio",
  sending: "Enviando…",
  fineprint: "Lo lee una persona, etiquetado por disciplina. Sin newsletter. studio@xnlab.io recibe una copia y responde cuando un ciclo abre plaza.",
  successBadge: "Recibido",
  successH: "El estudio lo tiene.",
  successBody: "Tu petición está dentro, etiquetada a tu track. Respondemos cuando el trabajo apunta a un encaje — no antes.",
  again: "Enviar otra",
  mailtoCta: "Abrir un email al estudio",
  errors: {
    validation: "Añade un email válido y un par de líneas.",
    rate: "El estudio ya tiene esta petición. Vuelve a probar en un momento.",
    send: "La conexión con el estudio ha fallado. Escribe a studio@xnlab.io.",
  },
  tracks: [
    {
      id: "distribution",
      num: "01",
      tag: "Ventas",
      name: "Distribución",
      role: "Vendedores, desarrollo de negocio, quienes abren y cierran.",
      lead: "La forma de vender del estudio es su propio producto: diagnóstico antes que pitch, un discovery privado, un encargo firmado por un socio. Distribución lleva ese método a las marcas que deberían conocerlo.",
      need: [
        "Vendes trabajo consultivo y de ciclo largo — ni volumen ni descuentos.",
        "Sostienes una sala de fundadores y direcciones sin levantar la voz.",
        "Traes red en categorías premium, o la disciplina para construirla.",
      ],
      sectors: "Categorías premium y meditadas — hostelería, clínicas, retail, inmobiliario, marcas con criterio de diseño.",
      levels: "De closer sénior a principal de red. Por encargo, no por plantilla.",
      skills: ["Venta consultiva", "Acceso a dirección", "Discovery", "Pipeline de ciclo largo", "Categorías premium"],
      why: "El estudio vende por cita. Distribución es cómo la cita encuentra la mesa correcta.",
    },
    {
      id: "systems",
      num: "02",
      tag: "Tech",
      name: "Sistemas",
      role: "Ingeniería, datos, infraestructura, IA aplicada.",
      lead: "El estudio dirige el modelo; no lo idolatra. Sistemas construye las superficies y las tuberías que llevan la atmósfera de una marca al producto, la búsqueda y la operación — y mantiene la IA bajo dirección, nunca suelta.",
      need: [
        "Pones código en producción, no demos — web, datos o IA aplicada.",
        "Tratas al modelo como un equipo que diriges, no un botón que pulsas.",
        "Te importa cómo se siente al usarse, no solo que funcione.",
      ],
      sectors: "Digital propio, superficies de producto, operación de cliente, herramienta interna.",
      levels: "De ingeniero sénior a líder de sistemas. Por proyecto.",
      skills: ["TypeScript / Next", "Datos y tuberías", "IA aplicada bajo dirección", "Infraestructura", "Criterio de producto"],
      why: "La dirección es el recurso escaso. Sistemas es cómo la dirección llega a la máquina.",
    },
    {
      id: "creation",
      num: "03",
      tag: "Creativo",
      name: "Creación",
      role: "Dirección creativa, diseño, animación, copy, marca.",
      lead: "La atmósfera es luz, sonido, material, movimiento y ritmo dirigidos como uno solo. Creación es la mano que fija el mundo — paleta, registro, lo que la marca no hará — para que el modelo lo extienda sin diluirlo.",
      need: [
        "Diriges un mundo, no un entregable — paleta, tono, contención.",
        "Fijas un sistema tan preciso que la IA lo extiende en vez de erosionarlo.",
        "Tu criterio aguanta el contacto con la escala.",
      ],
      sectors: "Identidad, digital propio, retail y físico, comunicación, worldbuilding.",
      levels: "De diseñador sénior a director creativo. Por encargo.",
      skills: ["Dirección de arte", "Movimiento y sonido", "Copy editorial", "Sistemas de identidad", "IA como equipo"],
      why: "La IA abarató el contenido, no la memoria. Creación es la diferencia.",
    },
    {
      id: "direction",
      num: "04",
      tag: "Estrategia y personas",
      name: "Dirección",
      role: "Estrategia, operaciones, personas — quienes leen las cifras.",
      lead: "Detrás de la atmósfera hay una operación: quién entra, cómo corre un ciclo, qué dicen los números. Dirección lee los datos que producen los demás y mantiene intacta la disciplina del estudio mientras crece.",
      need: [
        "Te mueves entre estrategia, operaciones y personas sin soltar ninguna.",
        "Lees cifras y las conviertes en decisiones, no en cuadros de mando.",
        "Proteges un estándar cuando todo empuja a bajarlo.",
      ],
      sectors: "Operación del estudio, planificación de ciclos, talento, relación con socios, análisis.",
      levels: "De operador a director de estudio. Por encargo.",
      skills: ["Estrategia", "Operaciones", "Personas y talento", "Análisis", "Planificación de ciclos"],
      why: "Alguien tiene que leer lo que los demás hacen. Dirección es ese alguien.",
    },
  ],
};

const ACCENT = "rgba(232,183,131";

export default function NetworkWindow() {
  const [lang, setLang] = useLang();
  const t: Copy = lang === "en" ? en : es;

  const [activeId, setActiveId] = useState<NetworkTrack | null>(null);
  const [email, setEmail] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [gotcha, setGotcha] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailto, setMailto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const active = activeId ? t.tracks.find((tr) => tr.id === activeId) ?? null : null;

  const select = (id: NetworkTrack) => {
    setActiveId(id);
    setSubmitted(false);
    setError(null);
    setMailto(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !email || !capabilities || sending) return;
    setSending(true);
    setError(null);
    setMailto(null);
    try {
      const res = await applyToNetwork({ email, track: activeId, capabilities, lang, _gotcha: gotcha });
      if (res.ok) {
        setSubmitted(true);
        return;
      }
      if (res.useMailto) {
        const name = active?.name ?? activeId;
        const subject = `XNLAB · Network — ${name}`;
        const body = `${t.emailLabel}: ${email}\n${t.trackChip}: ${name}\n\n${capabilities}`;
        setMailto(`mailto:studio@xnlab.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setError(t.errors.send);
      } else if (res.reason === "rate_limited") {
        setError(t.errors.rate);
      } else {
        setError(t.errors.validation);
      }
    } catch {
      setError(t.errors.send);
    } finally {
      setSending(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <NetworkHeader lang={lang} setLang={setLang} t={t} />

      <section
        style={{
          position: "relative",
          padding: "clamp(130px,17vh,190px) clamp(24px,7vw,96px) clamp(56px,7vw,96px)",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />

        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: `${ACCENT},0.75)`,
            marginBottom: 28,
            position: "relative",
            zIndex: 5,
          }}
        >
          {t.eyebrow}
        </p>

        <h1
          style={{
            fontSize: "clamp(2.4rem,6.4vw,5.6rem)",
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            textShadow: tsS,
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            margin: 0,
          }}
        >
          <span>{t.h1a}</span>
          <span
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.2em",
            }}
          >
            {t.h1b}
          </span>
        </h1>

        <R delay={0.2}>
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(1rem,1.3vw,1.16rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 300,
              maxWidth: 640,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>

        {/* Discipline selector */}
        <R delay={0.3}>
          <div style={{ marginTop: "clamp(48px,6vw,84px)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: "clamp(18px,2.2vw,26px)",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                {t.selectorLabel}
              </p>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 340 }}>
                {t.selectorNote}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
                gap: "clamp(10px,1.4vw,16px)",
              }}
            >
              {t.tracks.map((tr) => {
                const on = tr.id === activeId;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => select(tr.id)}
                    aria-pressed={on}
                    style={{
                      textAlign: "left",
                      padding: "clamp(16px,1.8vw,22px)",
                      borderRadius: 14,
                      cursor: "pointer",
                      background: on ? `${ACCENT},0.07)` : "rgba(255,255,255,0.02)",
                      border: on ? `1px solid ${ACCENT},0.5)` : "1px solid rgba(255,255,255,0.1)",
                      transition: "border-color 0.3s, background 0.3s",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.34em",
                        color: on ? `${ACCENT},0.85)` : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {tr.num}
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: 12,
                        fontSize: "clamp(1.05rem,1.4vw,1.25rem)",
                        fontWeight: 400,
                        letterSpacing: "-0.015em",
                        color: "white",
                      }}
                    >
                      {tr.name}
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {tr.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </R>

        {/* Track panel + capture */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id + (submitted ? "-done" : "")}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: "clamp(40px,5vw,72px)" }}
            >
              {submitted ? (
                <Success t={t} onAgain={() => { setSubmitted(false); setCapabilities(""); }} />
              ) : (
                <TrackPanel
                  t={t}
                  track={active}
                  email={email}
                  setEmail={setEmail}
                  capabilities={capabilities}
                  setCapabilities={setCapabilities}
                  gotcha={gotcha}
                  setGotcha={setGotcha}
                  sending={sending}
                  error={error}
                  mailto={mailto}
                  onSubmit={onSubmit}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}

function NetworkHeader({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: Copy }) {
  return (
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
          aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
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
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.34em",
        textTransform: "uppercase",
        color: `${ACCENT},0.7)`,
        marginBottom: "clamp(10px,1.4vw,16px)",
      }}
    >
      {children}
    </span>
  );
}

function TrackPanel({
  t,
  track,
  email,
  setEmail,
  capabilities,
  setCapabilities,
  gotcha,
  setGotcha,
  sending,
  error,
  mailto,
  onSubmit,
}: {
  t: Copy;
  track: Track;
  email: string;
  setEmail: (v: string) => void;
  capabilities: string;
  setCapabilities: (v: string) => void;
  gotcha: string;
  setGotcha: (v: string) => void;
  sending: boolean;
  error: string | null;
  mailto: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const fieldStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "14px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    color: "white",
    fontFamily: "inherit",
    fontSize: "clamp(0.95rem,1.18vw,1.08rem)",
    fontWeight: 300,
    letterSpacing: "0.01em",
    outline: "none",
    transition: "border-color 0.3s",
  };

  return (
    <div>
      {/* Cover line */}
      <div
        style={{
          borderTop: `1px solid ${ACCENT},0.25)`,
          paddingTop: "clamp(24px,3vw,36px)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: `${ACCENT},0.85)`,
            marginBottom: 12,
          }}
        >
          {track.num} · {track.tag}
        </div>
        <h2
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(2rem,4vw,3.4rem)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "white",
            textShadow: tsS,
            margin: 0,
          }}
        >
          {track.name}
        </h2>
        <p
          style={{
            marginTop: "clamp(20px,2.4vw,30px)",
            fontSize: "clamp(0.98rem,1.2vw,1.1rem)",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.78)",
            fontWeight: 300,
            maxWidth: 680,
          }}
        >
          {track.lead}
        </p>
      </div>

      {/* Who this is */}
      <Block label={t.roleLabel}>
        <p style={readingStyle}>{track.role}</p>
      </Block>

      {/* What the studio looks for */}
      <Block label={t.needLabel}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {track.need.map((line, i) => (
            <li
              key={i}
              style={{
                position: "relative",
                padding: "11px 0 11px 22px",
                fontSize: "clamp(0.95rem,1.14vw,1.05rem)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 300,
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: "calc(50% - 0.5px)",
                  width: 12,
                  height: 1,
                  background: `${ACCENT},0.55)`,
                }}
              />
              {line}
            </li>
          ))}
        </ul>
      </Block>

      {/* Sectors + levels — two columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "clamp(20px,3vw,44px)",
          marginTop: "clamp(28px,3.4vw,44px)",
        }}
      >
        <div>
          <FieldLabel>{t.sectorsLabel}</FieldLabel>
          <p style={readingStyle}>{track.sectors}</p>
        </div>
        <div>
          <FieldLabel>{t.levelsLabel}</FieldLabel>
          <p style={readingStyle}>{track.levels}</p>
        </div>
      </div>

      {/* Signals — chips */}
      <Block label={t.skillsLabel}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(8px,1vw,12px)" }}>
          {track.skills.map((s) => (
            <span
              key={s}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                fontSize: "clamp(11px,0.9vw,13px)",
                color: "rgba(255,255,255,0.72)",
                fontWeight: 300,
                letterSpacing: "0.01em",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </Block>

      {/* Why it exists — editorial aside */}
      <div style={{ marginTop: "clamp(28px,3.4vw,44px)" }}>
        <FieldLabel>{t.whyLabel}</FieldLabel>
        <p
          style={{
            margin: 0,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(1.15rem,1.7vw,1.5rem)",
            lineHeight: 1.4,
            color: `${ACCENT},0.88)`,
            textShadow: ts,
            maxWidth: 640,
            textWrap: "balance",
          }}
        >
          {track.why}
        </p>
      </div>

      {/* Capture form */}
      <form
        onSubmit={onSubmit}
        noValidate
        style={{
          marginTop: "clamp(44px,5.5vw,76px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "clamp(32px,4vw,52px)",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            margin: "0 0 6px",
          }}
        >
          {t.formEyebrow}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", margin: "0 0 clamp(24px,3vw,36px)" }}>
          {t.trackChip}: <span style={{ color: `${ACCENT},0.85)` }}>{track.name}</span>
        </p>

        <label htmlFor="net-email">
          <FieldLabel>{t.emailLabel}</FieldLabel>
        </label>
        <input
          id="net-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          required
          style={fieldStyle}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
          onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
        />

        <div style={{ marginTop: "clamp(28px,3vw,40px)" }}>
          <label htmlFor="net-cap">
            <FieldLabel>{t.capLabel}</FieldLabel>
          </label>
          <textarea
            id="net-cap"
            value={capabilities}
            onChange={(e) => setCapabilities(e.target.value)}
            placeholder={t.capPlaceholder}
            rows={4}
            required
            style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
          />
        </div>

        {/* Honeypot — visually hidden, off the tab order */}
        <input
          type="text"
          name="company_extra"
          value={gotcha}
          onChange={(e) => setGotcha(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "clamp(20px,3vw,40px)",
            flexWrap: "wrap",
            marginTop: "clamp(28px,3vw,40px)",
          }}
        >
          <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.42)", maxWidth: 480, margin: 0 }}>
            {t.fineprint}
          </p>
          <motion.button
            type="submit"
            disabled={sending || !email || !capabilities}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "0.95rem clamp(1.4rem,3vw,2.6rem)",
              fontSize: "clamp(10px,0.85vw,12px)",
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#060606",
              background: "white",
              border: "none",
              borderRadius: 100,
              cursor: sending || !email || !capabilities ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              opacity: sending || !email || !capabilities ? 0.55 : 1,
              transition: "opacity 0.3s",
            }}
          >
            {sending ? t.sending : t.submit}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginTop: 20 }}
          >
            <p
              role="alert"
              aria-live="polite"
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,150,120,0.85)",
                margin: 0,
              }}
            >
              {error}
            </p>
            {mailto && (
              <a
                href={mailto}
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  fontSize: 12,
                  letterSpacing: "0.02em",
                  color: `${ACCENT},0.9)`,
                  textDecoration: "none",
                  borderBottom: `1px solid ${ACCENT},0.45)`,
                  paddingBottom: 2,
                }}
              >
                {t.mailtoCta} →
              </a>
            )}
          </motion.div>
        )}
      </form>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "clamp(28px,3.4vw,44px)" }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

const readingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(0.96rem,1.16vw,1.06rem)",
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.78)",
  fontWeight: 300,
  maxWidth: 680,
};

function Success({ t, onAgain }: { t: Copy; onAgain: () => void }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${ACCENT},0.25)`,
        paddingTop: "clamp(28px,3.4vw,44px)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "0.45rem 0.9rem",
          border: `1px solid ${ACCENT},0.5)`,
          borderRadius: 999,
          background: `${ACCENT},0.06)`,
          color: `${ACCENT},0.92)`,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          marginBottom: "clamp(20px,2.6vw,32px)",
        }}
      >
        <span aria-hidden style={{ display: "flex", width: 6, height: 6, borderRadius: 999, background: "#e8b783" }} />
        {t.successBadge}
      </div>
      <h2
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: "clamp(1.8rem,3.4vw,2.8rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "white",
          textShadow: tsS,
          margin: 0,
        }}
      >
        {t.successH}
      </h2>
      <p
        style={{
          marginTop: "clamp(16px,2vw,24px)",
          fontSize: "clamp(0.98rem,1.2vw,1.1rem)",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.74)",
          fontWeight: 300,
          maxWidth: 580,
        }}
      >
        {t.successBody}
      </p>
      <button
        type="button"
        onClick={onAgain}
        style={{
          marginTop: "clamp(28px,3vw,40px)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "inherit",
        }}
      >
        {t.again} →
      </button>
    </div>
  );
}
