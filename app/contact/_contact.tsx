"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ts, tsS, serif, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { OtherCorners } from "../_lib/other-corners";
import { sendContactEmail } from "./actions";
import { SiteFooter } from "../_lib/site-footer";

const en = {
  eyebrow: "Write to the studio",
  h1a: "Write to",
  h1b: "the studio.",
  lead:
    "We respond personally to every message that fits. The first cycle of MMXXVI is open.",
  fields: {
    name: "Name",
    email: "Email",
    brand: "Company · brand · project",
    room: "Where you reach your customer today (in a sentence)",
    msg: "What you're trying to do",
    when: "When you'd like to begin",
    scaleLabel: "Scale of the brand",
    scaleHint: "Optional. Helps us read the message with the right weight.",
    scaleOptions: [
      "Under 1M customers",
      "1–10M customers",
      "10–100M customers",
      "100M+ customers",
      "Enterprise · B2B at scale",
    ],
  },
  submit: "Send to the studio",
  sending: "Sending…",
  privacy:
    "Every message is read by the studio. studio@xnlab.io is open in parallel.",
  okSent: "Received. A confirmation is on its way to your inbox. The studio replies personally.",
  okMailto: "Email opened — check your mail client.",
  back: "← Home",
  admission: {
    label: "Before you write",
    cycleLabel: "Cycle MMXXVI",
    cycleWindow: "January — 30 June MMXXVI",
    cycleStatus: "Open.",
    cycleNote:
      "Cycles close at six brands. We do not stretch the studio to make a seventh fit.",
    notServedLabel: "We do not work with",
    notServed: [
      "Brands whose primary logic is volume or commodity pricing.",
      "Categories that cannot be addressed in long form — crypto, gambling, fast fashion.",
      "Briefs framed as RFPs, pitches, or competitive tenders.",
    ],
    discoveryLabel: "How an engagement begins",
    discovery:
      "Discoveries are extended by the studio, not requested. Forty-five minutes, by invitation, recorded by the studio and never published. If we both recognise the work, a partner-signed proposal follows within seven days.",
    referral:
      "Most new conversations arrive through an existing brand. A CEO, a CMO, a founder, a programme director. A line of context — who pointed you, what you have read of ours — helps the studio reply with weight.",
  },
  dossier: {
    eyebrow: "Not ready to write yet",
    title: "Request the studio dossier.",
    body: "A short document. How the studio operates, the six surfaces we work across, a ledger of recent engagements. Sent personally by the studio.",
    cta: "Request the dossier",
  },
  reading: {
    eyebrow: "Want the studio to read first",
    title: "A short reading.",
    body: "Five questions. Three minutes. The studio reads your answers and replies in person when the work suggests a fit.",
    cta: "Take the reading",
  },
};
const es = {
  eyebrow: "Escribe al estudio",
  h1a: "Escribe al",
  h1b: "estudio.",
  lead:
    "Respondemos personalmente a cada mensaje que encaja. El primer ciclo de MMXXVI está abierto.",
  fields: {
    name: "Nombre",
    email: "Email",
    brand: "Empresa · marca · proyecto",
    room: "Por dónde llegas hoy a tu cliente (en una frase)",
    msg: "Qué intentas hacer",
    when: "Cuándo te gustaría empezar",
    scaleLabel: "Escala de la marca",
    scaleHint: "Opcional. Nos ayuda a leer el mensaje con el peso adecuado.",
    scaleOptions: [
      "Menos de 1M de clientes",
      "1–10M de clientes",
      "10–100M de clientes",
      "100M+ de clientes",
      "Enterprise · B2B a escala",
    ],
  },
  submit: "Enviar al estudio",
  sending: "Enviando…",
  privacy:
    "Cada mensaje lo lee el estudio. studio@xnlab.io permanece abierto en paralelo.",
  okSent: "Recibido. Te llega una confirmación al inbox. El estudio responde en persona.",
  okMailto: "Email abierto — revisa tu cliente de correo.",
  back: "← Inicio",
  admission: {
    label: "Antes de escribir",
    cycleLabel: "Ciclo MMXXVI",
    cycleWindow: "Enero — 30 de junio MMXXVI",
    cycleStatus: "Abierto.",
    cycleNote:
      "Los ciclos cierran a seis marcas. No estiramos el estudio para que entre una séptima.",
    notServedLabel: "No trabajamos con",
    notServed: [
      "Marcas cuya lógica principal es el volumen o el precio commodity.",
      "Categorías que no pueden dirigirse en formato largo — cripto, juego online, fast fashion.",
      "Encargos planteados como RFPs, pitches o concursos.",
    ],
    discoveryLabel: "Cómo se abre un encargo",
    discovery:
      "El discovery lo extiende el estudio, no se solicita. Cuarenta y cinco minutos, por invitación, grabado por el estudio y nunca publicado. Si los dos reconocemos el trabajo, llega una propuesta firmada por un socio en siete días.",
    referral:
      "La mayoría de conversaciones nuevas llegan por recomendación de una marca activa. Un CEO, un CMO, un fundador, un director de programa. Una línea de contexto — quién te apuntó, qué has leído nuestro — ayuda al estudio a responder con peso.",
  },
  dossier: {
    eyebrow: "Aún no es momento de escribir",
    title: "Pide el dossier del estudio.",
    body: "Un documento corto. Cómo opera el estudio, las seis superficies en las que trabajamos, un registro de los encargos recientes. Lo envía el estudio en persona.",
    cta: "Pedir el dossier",
  },
  reading: {
    eyebrow: "Si prefieres que el estudio lea primero",
    title: "Una lectura breve.",
    body: "Cinco preguntas. Tres minutos. El estudio lee tus respuestas y responde en persona cuando el trabajo apunta a un encaje.",
    cta: "Hacer la lectura",
  },
};

type FormState = {
  name: string;
  email: string;
  brand: string;
  room: string;
  msg: string;
  when: string;
  scale: string;
};

const empty: FormState = {
  name: "",
  email: "",
  brand: "",
  room: "",
  msg: "",
  when: "",
  scale: "",
};

function buildMailto(f: FormState) {
  const subject = `XNLAB — ${f.brand || f.name || "Enquiry"}`;
  const lines = [
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    f.brand ? `Company / brand / project: ${f.brand}` : null,
    f.room ? `Where they reach the customer: ${f.room}` : null,
    f.scale ? `Scale: ${f.scale}` : null,
    f.when ? `Timeline: ${f.when}` : null,
    "",
    f.msg,
  ].filter(Boolean) as string[];
  const body = lines.join("\n");
  const qs = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:studio@xnlab.io?${qs}`;
}

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "16px 0",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(255,255,255,0.18)",
  color: "white",
  fontFamily: "inherit",
  fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
  fontWeight: 300,
  letterSpacing: "0.01em",
  outline: "none",
  transition: "border-color 0.3s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.38em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 4,
};

export default function Contact() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  const [form, setForm] = useState<FormState>(empty);
  const [gotcha, setGotcha] = useState("");
  const [sentMode, setSentMode] = useState<null | "sent" | "mailto">(null);
  const [sending, setSending] = useState(false);
  const upd =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.msg || sending) return;
    setSending(true);
    try {
      const result = await sendContactEmail({ ...form, lang, _gotcha: gotcha });
      if (result.ok) {
        setSentMode("sent");
        return;
      }
      if (result.useMailto) {
        window.location.href = buildMailto(form);
        setSentMode("mailto");
      }
    } catch {
      window.location.href = buildMailto(form);
      setSentMode("mailto");
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

      <section
        style={{
          position: "relative",
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(48px,7vw,96px)",
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />
        <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.6rem,7vw,6.4rem)",
            fontWeight: 400,
            lineHeight: 0.94,
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
          <span>{t.h1a}</span>
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.18em" }}>
            {t.h1b}
          </span>
        </h1>
        <R delay={0.2}>
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(1rem,1.3vw,1.18rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 300,
              maxWidth: 620,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>
      </section>

      {/* ADMISSION — what high-end firms hand a prospect before letting
          them write the first line. Cycle window with explicit
          remaining capacity (real scarcity), sectors not served
          (selectivity by exclusion is a stronger signal than a list of
          what we do), and the discovery protocol. Sits between the
          lead and the form so the visitor reads the conditions before
          deciding whether they qualify. */}
      <section
        aria-labelledby="admission-heading"
        style={{
          padding: "0 clamp(24px,7vw,96px) clamp(40px,5vw,72px)",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <R delay={0.28}>
          <div
            style={{
              position: "relative",
              padding: "clamp(28px,3.4vw,44px) clamp(24px,3vw,40px)",
              border: "1px solid rgba(255,255,255,0.07)",
              background:
                "linear-gradient(180deg, rgba(232,183,131,0.025) 0%, rgba(4,3,2,0.4) 100%)",
            }}
          >
            <h2
              id="admission-heading"
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(232,183,131,0.78)",
                margin: 0,
                marginBottom: "clamp(20px,2.4vw,32px)",
              }}
            >
              {t.admission.label}
            </h2>

            <div
              className="grid-cols-1 md:grid-cols-[1fr_1.2fr]"
              style={{
                display: "grid",
                gap: "clamp(24px,3vw,44px)",
                alignItems: "start",
              }}
            >
              {/* Cycle status block — same vocabulary as the Standing
                  panel on the home, so a returning visitor sees the
                  same studio they read about. */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
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
                      ...labelStyle,
                      color: "rgba(232,183,131,0.9)",
                      marginBottom: 0,
                    }}
                  >
                    {t.admission.cycleLabel}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(1.5rem,2.4vw,2.2rem)",
                    fontWeight: 400,
                    lineHeight: 1.05,
                    letterSpacing: "-0.01em",
                    color: "white",
                    margin: "0 0 4px",
                    textShadow: tsS,
                  }}
                >
                  {t.admission.cycleStatus}
                </p>
                <p
                  style={{
                    fontSize: "clamp(0.88rem,1.05vw,1rem)",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 300,
                    margin: "0 0 18px",
                  }}
                >
                  {t.admission.cycleWindow}
                </p>
                {/* Capacity meter — 5/6 filled, mirrors Standing */}
                <div
                  aria-label={lang === "en" ? "Five of six places taken" : "Cinco de seis plazas ocupadas"}
                  role="img"
                  style={{ display: "flex", gap: 6, marginBottom: 16 }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      style={{
                        flex: 1,
                        height: 4,
                        background:
                          i < 5
                            ? "rgba(232,183,131,0.7)"
                            : "rgba(255,255,255,0.08)",
                        boxShadow:
                          i < 5 ? "0 0 8px rgba(232,183,131,0.45)" : "none",
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {t.admission.cycleNote}
                </p>
              </div>

              {/* Conditions block — sectors not served + discovery. The
                  exclusion list is the single most expensive piece of
                  copy on the page. */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 12 }}>
                  {t.admission.notServedLabel}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    marginBottom: "clamp(22px,2.6vw,32px)",
                  }}
                >
                  {t.admission.notServed.map((line, i) => (
                    <li
                      key={i}
                      style={{
                        position: "relative",
                        padding: "8px 0 8px 22px",
                        fontSize: "clamp(0.9rem,1.1vw,1.02rem)",
                        lineHeight: 1.6,
                        color: "rgba(255,255,255,0.78)",
                        fontWeight: 300,
                        borderTop:
                          i === 0
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
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
                          background: "rgba(232,183,131,0.55)",
                        }}
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                <p style={{ ...labelStyle, marginBottom: 8 }}>
                  {t.admission.discoveryLabel}
                </p>
                <p
                  style={{
                    fontSize: "clamp(0.92rem,1.1vw,1.04rem)",
                    lineHeight: 1.72,
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 300,
                    margin: "0 0 14px",
                  }}
                >
                  {t.admission.discovery}
                </p>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(0.95rem,1.12vw,1.08rem)",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                  }}
                >
                  {t.admission.referral}
                </p>
              </div>
            </div>
          </div>
        </R>
      </section>

      <section
        style={{
          padding: "0 clamp(24px,7vw,96px) clamp(80px,10vw,140px)",
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "clamp(28px,3vw,40px)" }}>
          <div style={{ display: "grid", gap: "clamp(28px,3vw,40px)" }} className="grid-cols-1 md:grid-cols-2">
            <R>
              <label style={labelStyle} htmlFor="name">{t.fields.name}</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={upd("name")}
                required
                autoComplete="name"
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
              />
            </R>
            <R delay={0.05}>
              <label style={labelStyle} htmlFor="email">{t.fields.email}</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={upd("email")}
                required
                autoComplete="email"
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
              />
            </R>
          </div>

          <R delay={0.1}>
            <label style={labelStyle} htmlFor="brand">{t.fields.brand}</label>
            <input
              id="brand"
              name="brand"
              value={form.brand}
              onChange={upd("brand")}
              autoComplete="organization"
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
            />
          </R>

          <R delay={0.12}>
            <label style={labelStyle} htmlFor="room">{t.fields.room}</label>
            <input
              id="room"
              name="room"
              value={form.room}
              onChange={upd("room")}
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
            />
          </R>

          <R delay={0.14}>
            <label style={labelStyle} htmlFor="msg">{t.fields.msg}</label>
            <textarea
              id="msg"
              name="msg"
              value={form.msg}
              onChange={upd("msg")}
              required
              rows={6}
              style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.65, paddingTop: 14, paddingBottom: 14 }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
            />
          </R>

          <R delay={0.16}>
            <label style={labelStyle} htmlFor="when">{t.fields.when}</label>
            <input
              id="when"
              name="when"
              value={form.when}
              onChange={upd("when")}
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
            />
          </R>

          {/* Scale — optional. Five pill toggles. Lets the studio read
              the message with the right weight without ever asking for
              a budget. Empty default; the lead does not have to commit. */}
          <R delay={0.18}>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ ...labelStyle, marginBottom: 14 }}>{t.fields.scaleLabel}</legend>
              <div
                role="radiogroup"
                aria-label={t.fields.scaleLabel}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px 10px",
                  marginTop: 4,
                }}
              >
                {t.fields.scaleOptions.map((opt) => {
                  const active = form.scale === opt;
                  return (
                    <label
                      key={opt}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.55rem 0.95rem",
                        fontSize: "clamp(11px,0.85vw,12.5px)",
                        fontWeight: 400,
                        letterSpacing: "0.02em",
                        color: active ? "white" : "rgba(255,255,255,0.62)",
                        background: active ? "rgba(232,183,131,0.16)" : "transparent",
                        border: `1px solid ${active ? "rgba(232,183,131,0.6)" : "rgba(255,255,255,0.14)"}`,
                        borderRadius: 100,
                        cursor: "pointer",
                        transition: "background 0.3s, border-color 0.3s, color 0.3s",
                      }}
                    >
                      <input
                        type="radio"
                        name="scale"
                        value={opt}
                        checked={active}
                        onChange={() => setForm((f) => ({ ...f, scale: opt }))}
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          padding: 0,
                          margin: -1,
                          overflow: "hidden",
                          clip: "rect(0,0,0,0)",
                          whiteSpace: "nowrap",
                          border: 0,
                        }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                {t.fields.scaleHint}
              </p>
            </fieldset>
          </R>

          <R delay={0.22}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(20px,3vw,40px)", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.42)", maxWidth: 480 }}>{t.privacy}</p>
              <motion.button
                type="submit"
                disabled={sending || sentMode !== null}
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
                  cursor: sending || sentMode !== null ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  opacity: sending || sentMode !== null ? 0.7 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                {sending ? t.sending : t.submit}
              </motion.button>
            </div>
          </R>

          {/* Honeypot — invisible to humans, irresistible to bots */}
          <div aria-hidden style={{ position: "absolute", left: "-9999px", top: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
              Leave this empty
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={gotcha}
                onChange={(e) => setGotcha(e.target.value)}
              />
            </label>
          </div>

          {sentMode !== null && (
            <motion.p
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {sentMode === "sent" ? t.okSent : t.okMailto}
            </motion.p>
          )}
        </form>
      </section>

      {/* Reading CTA removed from /contact per AGENTS §5 — one verb
          dominant per page. Form is the verb; dossier is the single
          alternative (atelier-coded, passive). The /reading route
          itself remains accessible directly and from the footer for
          visitors who arrive via search. */}

      {/* Dossier — second funnel entry. For visitors not ready to write
          a full message, a one-click mailto requesting the studio's
          dossier. Doubles top-of-funnel without diluting the form. */}
      <section
        aria-labelledby="dossier-heading"
        style={{
          padding: "clamp(28px,3.4vw,48px) clamp(24px,7vw,96px) clamp(36px,4.4vw,64px)",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <R>
          <div
            style={{
              position: "relative",
              padding: "clamp(28px,3.4vw,44px) clamp(24px,3vw,40px)",
              border: "1px solid rgba(255,255,255,0.07)",
              background:
                "linear-gradient(180deg, rgba(232,183,131,0.018) 0%, rgba(4,3,2,0.4) 100%)",
              display: "grid",
              gap: "clamp(20px,2.4vw,32px)",
              alignItems: "center",
            }}
            className="grid-cols-1 md:grid-cols-[1.4fr_auto]"
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(232,183,131,0.78)",
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                {t.dossier.eyebrow}
              </p>
              <h2
                id="dossier-heading"
                style={{
                  margin: 0,
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.5rem,2.4vw,2.2rem)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  color: "white",
                  textShadow: tsS,
                }}
              >
                {t.dossier.title}
              </h2>
              <p
                style={{
                  marginTop: 14,
                  fontSize: "clamp(0.94rem,1.1vw,1.04rem)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.66)",
                  fontWeight: 300,
                  maxWidth: 620,
                }}
              >
                {t.dossier.body}
              </p>
            </div>
            <Link
              href="/dossier"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "0.85rem 1.6rem",
                fontSize: "clamp(10px,0.85vw,12px)",
                fontWeight: 500,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(232,183,131,0.92)",
                textDecoration: "none",
                border: "1px solid rgba(232,183,131,0.5)",
                background: "rgba(232,183,131,0.04)",
                borderRadius: 999,
                whiteSpace: "nowrap",
                transition: "background 0.45s, border-color 0.45s, color 0.45s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.04)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.5)";
                e.currentTarget.style.color = "rgba(232,183,131,0.92)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                e.currentTarget.style.color = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.04)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.5)";
                e.currentTarget.style.color = "rgba(232,183,131,0.92)";
              }}
            >
              {t.dossier.cta}
              <span aria-hidden style={{ fontSize: 14 }}>→</span>
            </Link>
          </div>
        </R>
      </section>

      <OtherCorners lang={lang} exclude="contact" />
        <SiteFooter lang={lang} />
    </main>
  );
}
