"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ts, tsS, serif, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { SiteFooter } from "../_lib/site-footer";
import { sendReading } from "./actions";

const en = {
  eyebrow: "A short reading",
  h1a: "Five questions.",
  h1b: "Three minutes.",
  lead:
    "The studio reads, then replies in person when the work suggests a fit. No proposal is written until both sides recognise the work.",
  questions: {
    role: {
      label: "Where you direct from",
      hint: "Optional. Helps us read the message with the right weight.",
      options: [
        "CMO · Brand director",
        "CEO · Founder",
        "Head of digital · product",
        "Head of customer experience",
        "Programme · cultural director",
        "Other",
      ],
    },
    scale: {
      label: "The brand's scale",
      hint: "Optional.",
      options: [
        "Under 1M customers",
        "1–10M customers",
        "10–100M customers",
        "100M+ customers",
        "Enterprise · B2B at scale",
      ],
    },
    surface: {
      label: "The surface closest to the gap",
      hint: "Pick one. The studio works across all six.",
      options: [
        "Product",
        "Owned Digital",
        "Retail & Physical",
        "Customer Operations",
        "Communication",
        "Community & Culture",
        "The whole brand",
      ],
    },
    gap: {
      label: "The gap, in one line",
      hint: "What the brand is. What the customer reads. Where the two diverge.",
    },
    timing: {
      label: "When you would want to begin",
      options: [
        "This quarter",
        "This year",
        "Listening · no urgency",
        "Open",
      ],
    },
  },
  emailLabel: "Email",
  emailHint:
    "Where the studio replies. Read by a person, not an automated inbox.",
  submit: "Send the reading",
  sending: "Sending…",
  privacy:
    "Used to reply. Never sold, never enrolled in a list. studio@xnlab.io is open in parallel.",
  okSent:
    "Received. A confirmation is on its way to your inbox. The studio replies personally.",
  okMailto: "Email opened — check your mail client.",
  back: "← Home",
};

const es = {
  eyebrow: "Una lectura breve",
  h1a: "Cinco preguntas.",
  h1b: "Tres minutos.",
  lead:
    "El estudio lee, después responde en persona cuando el trabajo apunta a un encaje. No se redacta propuesta hasta que las dos partes reconocen el trabajo.",
  questions: {
    role: {
      label: "Desde dónde diriges",
      hint: "Opcional. Nos ayuda a leer con el peso adecuado.",
      options: [
        "CMO · Director de marca",
        "CEO · Fundador",
        "Director de digital · producto",
        "Director de experiencia de cliente",
        "Director de programa · cultural",
        "Otro",
      ],
    },
    scale: {
      label: "Escala de la marca",
      hint: "Opcional.",
      options: [
        "Menos de 1M de clientes",
        "1–10M de clientes",
        "10–100M de clientes",
        "100M+ de clientes",
        "Enterprise · B2B a escala",
      ],
    },
    surface: {
      label: "La superficie más cerca del gap",
      hint: "Elige una. El estudio trabaja en las seis.",
      options: [
        "Producto",
        "Digital Propio",
        "Retail y Físico",
        "Operaciones de Cliente",
        "Comunicación",
        "Comunidad y Cultura",
        "La marca entera",
      ],
    },
    gap: {
      label: "El gap, en una línea",
      hint: "Qué es la marca. Qué lee el cliente. Dónde divergen.",
    },
    timing: {
      label: "Cuándo te gustaría empezar",
      options: [
        "Este trimestre",
        "Este año",
        "Escuchando · sin urgencia",
        "Abierto",
      ],
    },
  },
  emailLabel: "Email",
  emailHint:
    "Donde responde el estudio. Lo lee una persona, no una bandeja automática.",
  submit: "Enviar la lectura",
  sending: "Enviando…",
  privacy:
    "Sólo se usa para responder. No se vende, no se inscribe en ninguna lista. studio@xnlab.io permanece abierto en paralelo.",
  okSent:
    "Recibido. Te llega una confirmación al inbox. El estudio responde en persona.",
  okMailto: "Email abierto — revisa tu cliente de correo.",
  back: "← Inicio",
};

type FormState = {
  email: string;
  role: string;
  scale: string;
  surface: string;
  gap: string;
  timing: string;
};

const empty: FormState = {
  email: "",
  role: "",
  scale: "",
  surface: "",
  gap: "",
  timing: "",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.38em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
  marginBottom: 14,
};

const hintStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: 11,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.4)",
  fontWeight: 300,
};

function PillRow({
  options,
  active,
  onPick,
  name,
}: {
  options: string[];
  active: string;
  onPick: (v: string) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} style={{ display: "flex", flexWrap: "wrap", gap: "8px 10px", marginTop: 4 }}>
      {options.map((opt) => {
        const on = active === opt;
        return (
          <label
            key={opt}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "0.6rem 1rem",
              fontSize: "clamp(11px,0.85vw,12.5px)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: on ? "white" : "rgba(255,255,255,0.62)",
              background: on ? "rgba(232,183,131,0.16)" : "transparent",
              border: `1px solid ${on ? "rgba(232,183,131,0.6)" : "rgba(255,255,255,0.14)"}`,
              borderRadius: 100,
              cursor: "pointer",
              transition: "background 0.3s, border-color 0.3s, color 0.3s",
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={on}
              onChange={() => onPick(opt)}
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
  );
}

export default function Reading() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  const [form, setForm] = useState<FormState>(empty);
  const [gotcha, setGotcha] = useState("");
  const [sentMode, setSentMode] = useState<null | "sent" | "mailto">(null);
  const [sending, setSending] = useState(false);

  const set = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || sending) return;
    setSending(true);
    try {
      const result = await sendReading({ ...form, lang, _gotcha: gotcha });
      if (result.ok) {
        setSentMode("sent");
        return;
      }
      if (result.useMailto) {
        const subject = encodeURIComponent("XNLAB — Reading");
        const body = encodeURIComponent(
          [
            `Email: ${form.email}`,
            form.role ? `Role: ${form.role}` : null,
            form.scale ? `Scale: ${form.scale}` : null,
            form.surface ? `Surface: ${form.surface}` : null,
            form.timing ? `Timing: ${form.timing}` : null,
            "",
            form.gap ? `Gap:\n${form.gap}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        );
        window.location.href = `mailto:studio@xnlab.io?subject=${subject}&body=${body}`;
        setSentMode("mailto");
      }
    } catch {
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
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(40px,6vw,80px)",
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />
        <p style={{ ...labelStyle, color: "rgba(232,183,131,0.78)", letterSpacing: "0.42em", marginBottom: 28 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.4rem,6vw,5.4rem)",
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            textShadow: tsS,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0,
            margin: 0,
          }}
        >
          <span>{t.h1a}</span>
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.72)", fontSize: "1.2em" }}>
            {t.h1b}
          </span>
        </h1>
        <R delay={0.2}>
          <p
            style={{
              marginTop: "clamp(28px,3.4vw,44px)",
              fontSize: "clamp(1rem,1.3vw,1.18rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.72)",
              fontWeight: 300,
              maxWidth: 620,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(80px,10vw,140px)", maxWidth: 880, margin: "0 auto" }}>
        <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "clamp(40px,4.4vw,64px)" }}>
          {/* Q1 — role */}
          <R>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={labelStyle}>{t.questions.role.label}</legend>
              <PillRow
                options={t.questions.role.options}
                active={form.role}
                onPick={set("role")}
                name="role"
              />
              <p style={hintStyle}>{t.questions.role.hint}</p>
            </fieldset>
          </R>

          {/* Q2 — scale */}
          <R delay={0.04}>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={labelStyle}>{t.questions.scale.label}</legend>
              <PillRow
                options={t.questions.scale.options}
                active={form.scale}
                onPick={set("scale")}
                name="scale"
              />
              <p style={hintStyle}>{t.questions.scale.hint}</p>
            </fieldset>
          </R>

          {/* Q3 — surface */}
          <R delay={0.08}>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={labelStyle}>{t.questions.surface.label}</legend>
              <PillRow
                options={t.questions.surface.options}
                active={form.surface}
                onPick={set("surface")}
                name="surface"
              />
              <p style={hintStyle}>{t.questions.surface.hint}</p>
            </fieldset>
          </R>

          {/* Q4 — gap (textarea) */}
          <R delay={0.12}>
            <label style={labelStyle} htmlFor="gap">{t.questions.gap.label}</label>
            <textarea
              id="gap"
              name="gap"
              value={form.gap}
              onChange={(e) => set("gap")(e.target.value)}
              rows={3}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.18)",
                color: "white",
                fontFamily: "inherit",
                fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                fontWeight: 300,
                letterSpacing: "0.01em",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
            />
            <p style={hintStyle}>{t.questions.gap.hint}</p>
          </R>

          {/* Q5 — timing */}
          <R delay={0.16}>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={labelStyle}>{t.questions.timing.label}</legend>
              <PillRow
                options={t.questions.timing.options}
                active={form.timing}
                onPick={set("timing")}
                name="timing"
              />
            </fieldset>
          </R>

          {/* Email + submit — the closing window */}
          <R delay={0.22}>
            <div
              style={{
                marginTop: "clamp(12px,1.6vw,20px)",
                padding: "clamp(28px,3.4vw,44px) clamp(24px,3vw,40px)",
                border: "1px solid rgba(232,183,131,0.22)",
                background:
                  "linear-gradient(180deg, rgba(232,183,131,0.04) 0%, rgba(4,3,2,0.4) 100%)",
              }}
            >
              <label style={{ ...labelStyle, color: "rgba(232,183,131,0.85)", letterSpacing: "0.42em" }} htmlFor="email">
                {t.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 0",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.22)",
                  color: "white",
                  fontFamily: "inherit",
                  fontSize: "clamp(1rem,1.2vw,1.18rem)",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(232,183,131,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.22)")}
              />
              <p style={hintStyle}>{t.emailHint}</p>
              <div
                style={{
                  marginTop: "clamp(24px,3vw,40px)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "clamp(20px,3vw,40px)",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: 0 }}>
                  {t.privacy}
                </p>
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
            </div>
          </R>

          {/* Honeypot */}
          <div aria-hidden style={{ position: "absolute", left: "-9999px", top: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
              Leave this empty
              <input type="text" tabIndex={-1} autoComplete="off" value={gotcha} onChange={(e) => setGotcha(e.target.value)} />
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
                textAlign: "center",
              }}
            >
              {sentMode === "sent" ? t.okSent : t.okMailto}
            </motion.p>
          )}
        </form>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}
