"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ts, tsS, serif, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { SiteFooter } from "../_lib/site-footer";
import { applyToHunterNetwork } from "./actions";

// ---------------------------------------------------------------
// Hunter Network — the public door. The rest of the site speaks to clients;
// /network speaks to studio collaborators; THIS surface speaks to one audience
// only: prospective evaluated sellers (hunters). It states the model — selective,
// performance-based, brand-first — and opens the application.
//
// Language discipline (brief): no guaranteed employment, no guaranteed income,
// no "pay to work". The principle is fixed: payment buys an evaluation,
// performance buys campaigns. Brand protection over volume. Bilingual EN/ES,
// translated for meaning (AGENTS.md rule 6). Anonymous studio, MMXXII/MMXXVI,
// no published prices (rule 5b).
// ---------------------------------------------------------------

type Lang = "en" | "es";

type Step = { num: string; title: string; body: string };
type Level = { name: string; access: string };

type Copy = {
  back: string;
  eyebrow: string;
  h1a: string;
  h1b: string;
  lead: string;
  // not/​is framing
  notLabel: string;
  notList: string[];
  isLabel: string;
  isList: string[];
  // principle banner
  principleLabel: string;
  principleH: string;
  principleSub: string;
  // how it works
  howLabel: string;
  steps: Step[];
  // levels
  levelsLabel: string;
  levelsNote: string;
  levels: Level[];
  // application form
  formEyebrow: string;
  formH: string;
  formLead: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  whatsappLabel: string;
  whatsappPlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  marketsLabel: string;
  marketsPlaceholder: string;
  expLabel: string;
  expPlaceholder: string;
  submit: string;
  sending: string;
  fineprint: string;
  successBadge: string;
  successH: string;
  successBody: string;
  again: string;
  mailtoCta: string;
  errors: { validation: string; rate: string; send: string };
};

const en: Copy = {
  back: "← Home",
  eyebrow: "Hunter Network · MMXXVI",
  h1a: "The brand is protected",
  h1b: "before the volume.",
  lead: "Hunter Network is a private, performance-based network of evaluated remote Spanish-speaking sellers. It is not a job board and not a teleoperator pool. Candidates do not pay for work — they access a Commercial Access Evaluation, and only those who prove they can represent a brand professionally reach real campaigns. This is the door.",
  notLabel: "What it is not",
  notList: [
    "Not a call center, not a job board.",
    "Not a cheap teleoperator pool.",
    "Not a training academy.",
    "Not a pay-to-work platform.",
  ],
  isLabel: "What it is",
  isList: [
    "A private network of evaluated sellers.",
    "Access earned through a controlled evaluation.",
    "Campaign eligibility set by performance level.",
    "A standard that protects the brands represented.",
  ],
  principleLabel: "The principle",
  principleH: "Payment does not buy access to good clients.",
  principleSub: "Performance buys access to better campaigns.",
  howLabel: "How access works",
  steps: [
    { num: "01", title: "Application", body: "You apply and leave a short audio presentation. A person reviews it — not an automated inbox." },
    { num: "02", title: "Commercial Access Evaluation", body: "If there is a fit, you enter the evaluation: a set of controlled test calls on simulated or test leads, never a real brand yet." },
    { num: "03", title: "Scoring & review", body: "Each call is scored across voice, control, qualification, objection handling, the close and — above all — brand care. Calls are reviewed by an operator." },
    { num: "04", title: "Classification", body: "Your final score sets your performance level. The level — not the payment — decides which campaigns you can represent." },
    { num: "05", title: "Campaign access", body: "Qualified hunters receive campaigns matched to their level. Stronger performance unlocks higher-value campaigns. Underperformance or brand risk removes access." },
  ],
  levelsLabel: "Performance levels",
  levelsNote: "Level is earned, reviewed, and revisable. Partner is by invitation only.",
  levels: [
    { name: "Trainee", access: "Practice campaigns only." },
    { name: "Junior", access: "Low-risk campaigns." },
    { name: "Active", access: "Standard real campaigns." },
    { name: "Hunter", access: "High-value campaigns." },
    { name: "Partner", access: "Premium campaigns or team leadership." },
  ],
  formEyebrow: "Apply to the network",
  formH: "Leave your application.",
  formLead: "If your commercial instinct is real, the studio wants to see it. A person reads every application and replies when the evaluation has a place that fits. No guarantees of work or income — only a fair evaluation.",
  nameLabel: "Name",
  namePlaceholder: "First and last name",
  emailLabel: "Email",
  emailPlaceholder: "you@domain.com",
  whatsappLabel: "WhatsApp",
  whatsappPlaceholder: "+34 …",
  countryLabel: "Country",
  countryPlaceholder: "Where you are based",
  marketsLabel: "What you sell / your markets",
  marketsPlaceholder: "Sectors, products, the kind of client you close.",
  expLabel: "Your commercial instinct",
  expPlaceholder: "A few lines: what you sell, how you open and close, the level you work at, and why a brand could trust you in front of its customer.",
  submit: "Send application",
  sending: "Sending…",
  fineprint: "A person reads it, tagged to Hunter Network. No newsletter. studio@xnlab.io receives a copy and replies when the evaluation has a place. Payment, if any, only unlocks the evaluation — never campaign access.",
  successBadge: "Received",
  successH: "The network has it.",
  successBody: "Your application is in. If the studio sees a fit, you will be invited to the Commercial Access Evaluation. We reply when the work suggests it — not before.",
  again: "Send another",
  mailtoCta: "Open an email to the studio",
  errors: {
    validation: "Add a valid email, your markets, and a couple of lines.",
    rate: "The network already has this application. Try again in a moment.",
    send: "Connection to the studio failed. Write to studio@xnlab.io.",
  },
};

const es: Copy = {
  back: "← Inicio",
  eyebrow: "Hunter Network · MMXXVI",
  h1a: "La marca se protege",
  h1b: "antes que el volumen.",
  lead: "Hunter Network es una red privada, basada en rendimiento, de vendedores remotos hispanohablantes evaluados. No es una bolsa de empleo ni un pool de teleoperadores. El candidato no paga por trabajar — accede a una Evaluación de Acceso Comercial, y solo quien demuestra que sabe representar una marca con profesionalidad llega a las campañas reales. Esta es la puerta.",
  notLabel: "Lo que no es",
  notList: [
    "No es un call center ni una bolsa de empleo.",
    "No es un pool barato de teleoperadores.",
    "No es una academia de formación.",
    "No es una plataforma de pagar para trabajar.",
  ],
  isLabel: "Lo que es",
  isList: [
    "Una red privada de vendedores evaluados.",
    "Acceso ganado mediante una evaluación controlada.",
    "Elegibilidad de campaña según nivel de rendimiento.",
    "Un estándar que protege a las marcas representadas.",
  ],
  principleLabel: "El principio",
  principleH: "El pago no da acceso a buenos clientes.",
  principleSub: "El rendimiento da acceso a mejores campañas.",
  howLabel: "Cómo se accede",
  steps: [
    { num: "01", title: "Candidatura", body: "Te presentas y dejas un breve audio. Lo revisa una persona, no una bandeja automática." },
    { num: "02", title: "Evaluación de Acceso Comercial", body: "Si hay encaje, entras en la evaluación: un conjunto de llamadas de prueba controladas sobre leads simulados o de prueba, nunca todavía una marca real." },
    { num: "03", title: "Puntuación y revisión", body: "Cada llamada se puntúa en voz, control, cualificación, manejo de objeciones, cierre y — sobre todo — cuidado de la marca. Las llamadas las revisa un operador." },
    { num: "04", title: "Clasificación", body: "Tu score final fija tu nivel de rendimiento. El nivel — no el pago — decide qué campañas puedes representar." },
    { num: "05", title: "Acceso a campañas", body: "Los hunters cualificados reciben campañas según su nivel. Mejor rendimiento abre campañas de más valor. El bajo rendimiento o el riesgo de marca retiran el acceso." },
  ],
  levelsLabel: "Niveles de rendimiento",
  levelsNote: "El nivel se gana, se revisa y es revisable. Partner es solo por invitación.",
  levels: [
    { name: "Trainee", access: "Solo campañas de práctica." },
    { name: "Junior", access: "Campañas de bajo riesgo." },
    { name: "Activo", access: "Campañas reales estándar." },
    { name: "Hunter", access: "Campañas de alto valor." },
    { name: "Partner", access: "Campañas premium o liderazgo de equipo." },
  ],
  formEyebrow: "Solicita entrar en la red",
  formH: "Deja tu candidatura.",
  formLead: "Si tu instinto comercial es real, el estudio quiere verlo. Una persona lee cada candidatura y responde cuando la evaluación tiene una plaza que encaja. Sin promesas de trabajo ni de ingresos — solo una evaluación justa.",
  nameLabel: "Nombre",
  namePlaceholder: "Nombre y apellido",
  emailLabel: "Email",
  emailPlaceholder: "tu@dominio.com",
  whatsappLabel: "WhatsApp",
  whatsappPlaceholder: "+34 …",
  countryLabel: "País",
  countryPlaceholder: "Dónde resides",
  marketsLabel: "Qué vendes / tus mercados",
  marketsPlaceholder: "Sectores, productos, el tipo de cliente que cierras.",
  expLabel: "Tu instinto comercial",
  expPlaceholder: "Unas líneas: qué vendes, cómo abres y cierras, a qué nivel trabajas y por qué una marca podría confiarte su cliente.",
  submit: "Enviar candidatura",
  sending: "Enviando…",
  fineprint: "Lo lee una persona, etiquetado a Hunter Network. Sin newsletter. studio@xnlab.io recibe una copia y responde cuando la evaluación tiene plaza. El pago, si lo hay, solo desbloquea la evaluación — nunca el acceso a campañas.",
  successBadge: "Recibido",
  successH: "La red lo tiene.",
  successBody: "Tu candidatura está dentro. Si el estudio ve un encaje, recibirás una invitación a la Evaluación de Acceso Comercial. Respondemos cuando el trabajo lo sugiere — no antes.",
  again: "Enviar otra",
  mailtoCta: "Abrir un email al estudio",
  errors: {
    validation: "Añade un email válido, tus mercados y un par de líneas.",
    rate: "La red ya tiene esta candidatura. Vuelve a probar en un momento.",
    send: "La conexión con el estudio ha fallado. Escribe a studio@xnlab.io.",
  },
};

const ACCENT = "rgba(232,183,131";

export default function HunterNetworkPage() {
  const [lang, setLang] = useLang();
  const t: Copy = lang === "en" ? en : es;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [markets, setMarkets] = useState("");
  const [experience, setExperience] = useState("");
  const [gotcha, setGotcha] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailto, setMailto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !markets || !experience || sending) return;
    setSending(true);
    setError(null);
    setMailto(null);
    try {
      const res = await applyToHunterNetwork({ name, email, whatsapp, country, markets, experience, lang, _gotcha: gotcha });
      if (res.ok) {
        setSubmitted(true);
        return;
      }
      if (res.useMailto) {
        const subject = `Hunter Network — ${name || email}`;
        const body = `${t.nameLabel}: ${name}\n${t.emailLabel}: ${email}\n${t.whatsappLabel}: ${whatsapp}\n${t.countryLabel}: ${country}\n${t.marketsLabel}: ${markets}\n\n${experience}`;
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
      <HNHeader lang={lang} setLang={setLang} t={t} />

      <section
        style={{
          position: "relative",
          padding: "clamp(130px,17vh,190px) clamp(24px,7vw,96px) clamp(56px,7vw,96px)",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />

        <p style={eyebrowStyle}>{t.eyebrow}</p>

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
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>{t.h1b}</span>
        </h1>

        <R delay={0.2}>
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(1rem,1.3vw,1.16rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 300,
              maxWidth: 660,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>

        {/* Not / Is — two columns */}
        <R delay={0.3}>
          <div
            style={{
              marginTop: "clamp(48px,6vw,84px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "clamp(20px,3vw,44px)",
            }}
          >
            <NotIs label={t.notLabel} list={t.notList} tone="mute" />
            <NotIs label={t.isLabel} list={t.isList} tone="accent" />
          </div>
        </R>

        {/* Principle banner */}
        <R delay={0.2}>
          <div
            style={{
              marginTop: "clamp(56px,7vw,96px)",
              padding: "clamp(28px,4vw,52px)",
              borderRadius: 18,
              border: `1px solid ${ACCENT},0.25)`,
              background: `${ACCENT},0.04)`,
              textAlign: "center",
            }}
          >
            <p style={{ ...labelStyle, color: `${ACCENT},0.75)`, marginBottom: 18 }}>{t.principleLabel}</p>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(1.4rem,3vw,2.4rem)",
                fontWeight: 300,
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.55)",
                textWrap: "balance",
              }}
            >
              {t.principleH}
            </p>
            <p
              style={{
                margin: "14px 0 0",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.5rem,3.2vw,2.6rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: `${ACCENT},0.92)`,
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {t.principleSub}
            </p>
          </div>
        </R>

        {/* How it works */}
        <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
          <R delay={0.1}>
            <p style={labelStyle}>{t.howLabel}</p>
          </R>
          <div style={{ marginTop: "clamp(24px,3vw,40px)" }}>
            {t.steps.map((s, i) => (
              <R key={s.num} delay={0.05 * i}>
                <Step step={s} last={i === t.steps.length - 1} />
              </R>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
          <R delay={0.1}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(18px,2.2vw,26px)" }}>
              <p style={{ ...labelStyle, margin: 0 }}>{t.levelsLabel}</p>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 360 }}>{t.levelsNote}</p>
            </div>
          </R>
          <R delay={0.15}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {t.levels.map((lv, i) => (
                <div
                  key={lv.name}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "clamp(14px,1.8vw,20px) 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.18em", color: `${ACCENT},0.55)`, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: "clamp(1.05rem,1.6vw,1.35rem)", fontWeight: 400, color: "white", letterSpacing: "-0.01em" }}>{lv.name}</span>
                  </span>
                  <span style={{ fontSize: "clamp(0.9rem,1.1vw,1rem)", color: "rgba(255,255,255,0.6)", fontWeight: 300, textAlign: "right", maxWidth: 360 }}>{lv.access}</span>
                </div>
              ))}
            </div>
          </R>
        </div>

        {/* Application */}
        <div id="apply" style={{ marginTop: "clamp(64px,8vw,120px)" }}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="done" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <Success t={t} onAgain={() => { setSubmitted(false); setExperience(""); }} />
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <ApplicationForm
                  t={t}
                  values={{ name, email, whatsapp, country, markets, experience, gotcha }}
                  set={{ setName, setEmail, setWhatsapp, setCountry, setMarkets, setExperience, setGotcha }}
                  sending={sending}
                  error={error}
                  mailto={mailto}
                  onSubmit={onSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}

// --- Header -----------------------------------------------------------------

function HNHeader({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: Copy }) {
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
      <nav style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 clamp(20px,5vw,56px)" }}>
        <WordmarkLink />
        <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{t.back}</Link>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
          <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
        </button>
      </nav>
    </header>
  );
}

// --- Not / Is column --------------------------------------------------------

function NotIs({ label, list, tone }: { label: string; list: string[]; tone: "mute" | "accent" }) {
  const accent = tone === "accent";
  return (
    <div>
      <p style={{ ...labelStyle, color: accent ? `${ACCENT},0.75)` : "rgba(255,255,255,0.4)", marginBottom: "clamp(14px,1.8vw,20px)" }}>{label}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {list.map((line, i) => (
          <li
            key={i}
            style={{
              position: "relative",
              padding: "11px 0 11px 22px",
              fontSize: "clamp(0.95rem,1.14vw,1.05rem)",
              lineHeight: 1.6,
              color: accent ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.55)",
              fontWeight: 300,
              borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span aria-hidden style={{ position: "absolute", left: 0, top: "calc(50% - 0.5px)", width: 12, height: 1, background: accent ? `${ACCENT},0.55)` : "rgba(255,255,255,0.25)" }} />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Step -------------------------------------------------------------------

function Step({ step, last }: { step: Step; last: boolean }) {
  return (
    <div style={{ display: "flex", gap: "clamp(16px,2.4vw,32px)", paddingBottom: last ? 0 : "clamp(24px,3vw,40px)", marginBottom: last ? 0 : "clamp(24px,3vw,40px)", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ fontSize: "clamp(11px,1vw,13px)", letterSpacing: "0.18em", color: `${ACCENT},0.7)`, fontVariantNumeric: "tabular-nums", flexShrink: 0, paddingTop: 4 }}>{step.num}</span>
      <div>
        <h3 style={{ margin: 0, fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 400, letterSpacing: "-0.015em", color: "white" }}>{step.title}</h3>
        <p style={{ margin: "10px 0 0", fontSize: "clamp(0.95rem,1.14vw,1.06rem)", lineHeight: 1.65, color: "rgba(255,255,255,0.62)", fontWeight: 300, maxWidth: 620 }}>{step.body}</p>
      </div>
    </div>
  );
}

// --- Application form -------------------------------------------------------

type Values = { name: string; email: string; whatsapp: string; country: string; markets: string; experience: string; gotcha: string };
type Setters = {
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setWhatsapp: (v: string) => void;
  setCountry: (v: string) => void;
  setMarkets: (v: string) => void;
  setExperience: (v: string) => void;
  setGotcha: (v: string) => void;
};

function ApplicationForm({
  t,
  values,
  set,
  sending,
  error,
  mailto,
  onSubmit,
}: {
  t: Copy;
  values: Values;
  set: Setters;
  sending: boolean;
  error: string | null;
  mailto: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const field: React.CSSProperties = {
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
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)");
  const disabled = sending || !values.email || !values.markets || !values.experience;

  return (
    <form onSubmit={onSubmit} noValidate style={{ borderTop: `1px solid ${ACCENT},0.25)`, paddingTop: "clamp(32px,4vw,52px)" }}>
      <p style={{ ...labelStyle, color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>{t.formEyebrow}</p>
      <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(2rem,4vw,3.4rem)", lineHeight: 1, letterSpacing: "-0.02em", color: "white", textShadow: tsS, margin: "0 0 clamp(18px,2.4vw,28px)" }}>{t.formH}</h2>
      <p style={{ fontSize: "clamp(0.95rem,1.16vw,1.06rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.62)", fontWeight: 300, maxWidth: 640, margin: "0 0 clamp(28px,3.4vw,44px)" }}>{t.formLead}</p>

      {/* Name + email */}
      <div style={twoCol}>
        <Field id="hn-name" label={t.nameLabel}>
          <input id="hn-name" type="text" value={values.name} onChange={(e) => set.setName(e.target.value)} placeholder={t.namePlaceholder} autoComplete="name" style={field} onFocus={onFocus} onBlur={onBlur} />
        </Field>
        <Field id="hn-email" label={t.emailLabel}>
          <input id="hn-email" type="email" value={values.email} onChange={(e) => set.setEmail(e.target.value)} placeholder={t.emailPlaceholder} autoComplete="email" required style={field} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      {/* WhatsApp + country */}
      <div style={{ ...twoCol, marginTop: "clamp(24px,3vw,36px)" }}>
        <Field id="hn-wa" label={t.whatsappLabel}>
          <input id="hn-wa" type="tel" value={values.whatsapp} onChange={(e) => set.setWhatsapp(e.target.value)} placeholder={t.whatsappPlaceholder} autoComplete="tel" style={field} onFocus={onFocus} onBlur={onBlur} />
        </Field>
        <Field id="hn-country" label={t.countryLabel}>
          <input id="hn-country" type="text" value={values.country} onChange={(e) => set.setCountry(e.target.value)} placeholder={t.countryPlaceholder} autoComplete="country-name" style={field} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      {/* Markets */}
      <div style={{ marginTop: "clamp(24px,3vw,36px)" }}>
        <Field id="hn-markets" label={t.marketsLabel}>
          <input id="hn-markets" type="text" value={values.markets} onChange={(e) => set.setMarkets(e.target.value)} placeholder={t.marketsPlaceholder} required style={field} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      {/* Experience */}
      <div style={{ marginTop: "clamp(24px,3vw,36px)" }}>
        <Field id="hn-exp" label={t.expLabel}>
          <textarea id="hn-exp" value={values.experience} onChange={(e) => set.setExperience(e.target.value)} placeholder={t.expPlaceholder} rows={4} required style={{ ...field, resize: "vertical", lineHeight: 1.6 }} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      {/* Honeypot */}
      <input type="text" name="company_extra" value={values.gotcha} onChange={(e) => set.setGotcha(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(20px,3vw,40px)", flexWrap: "wrap", marginTop: "clamp(32px,4vw,48px)" }}>
        <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.42)", maxWidth: 520, margin: 0 }}>{t.fineprint}</p>
        <motion.button
          type="submit"
          disabled={disabled}
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
            cursor: disabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            opacity: disabled ? 0.55 : 1,
            transition: "opacity 0.3s",
          }}
        >
          {sending ? t.sending : t.submit}
        </motion.button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: 20 }}>
          <p role="alert" aria-live="polite" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,150,120,0.85)", margin: 0 }}>{error}</p>
          {mailto && (
            <a href={mailto} style={{ display: "inline-block", marginTop: 12, fontSize: 12, letterSpacing: "0.02em", color: `${ACCENT},0.9)`, textDecoration: "none", borderBottom: `1px solid ${ACCENT},0.45)`, paddingBottom: 2 }}>{t.mailtoCta} →</a>
          )}
        </motion.div>
      )}
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id}>
        <span style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.34em", textTransform: "uppercase", color: `${ACCENT},0.7)`, marginBottom: "clamp(10px,1.4vw,16px)" }}>{label}</span>
      </label>
      {children}
    </div>
  );
}

// --- Success ----------------------------------------------------------------

function Success({ t, onAgain }: { t: Copy; onAgain: () => void }) {
  return (
    <div style={{ borderTop: `1px solid ${ACCENT},0.25)`, paddingTop: "clamp(28px,3.4vw,44px)" }}>
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
      <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1.8rem,3.4vw,2.8rem)", lineHeight: 1.05, letterSpacing: "-0.02em", color: "white", textShadow: tsS, margin: 0 }}>{t.successH}</h2>
      <p style={{ marginTop: "clamp(16px,2vw,24px)", fontSize: "clamp(0.98rem,1.2vw,1.1rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.74)", fontWeight: 300, maxWidth: 580 }}>{t.successBody}</p>
      <button type="button" onClick={onAgain} style={{ marginTop: "clamp(28px,3vw,40px)", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontFamily: "inherit" }}>{t.again} →</button>
    </div>
  );
}

// --- shared style atoms -----------------------------------------------------

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.38em",
  textTransform: "uppercase",
  color: `${ACCENT},0.75)`,
  marginBottom: 28,
  position: "relative",
  zIndex: 5,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.38em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "clamp(20px,3vw,44px)",
};
