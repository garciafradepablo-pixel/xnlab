"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { Magnetic } from "../_lib/chrome";
import { WordmarkLink } from "../_lib/wordmark";
import { sendContactEmail } from "./actions";

const en = {
  eyebrow: "Application · 007",
  h1a: "Apply for",
  h1b: "a project.",
  lead:
    "Every engagement is selected. We work with a small number of brands each year and quote per project. Tell us what you are building, when it opens, and what level you want it to feel at.",
  fields: {
    name: "Name",
    email: "Email",
    brand: "Brand / Project",
    website: "Website or Instagram",
    world: "Industry",
    projectType: "Project type",
    timeline: "Timeline",
    budget: "Estimated investment",
    msg: "Tell us more",
  },
  worlds: [
    "Hospitality & Experience",
    "Nightlife & Cultural Events",
    "Luxury & Lifestyle Brands",
    "Architecture & Spatial Design",
    "Music & Cultural Artists",
    "Cultural & Digital Worlds",
    "Wellness",
    "Other",
  ],
  projectTypes: [
    "Campaign System (single launch)",
    "Digital Atmosphere (single-page)",
    "Brand World (multi-page)",
    "Visual Engine (monthly)",
    "Technical / Growth Add-on",
    "Upgrade Sprint",
    "Not sure yet",
  ],
  timelines: [
    "Within 1 month",
    "1–3 months",
    "3–6 months",
    "6+ months",
    "Flexible / Exploratory",
  ],
  budgets: [
    "€5,000 – €10,000",
    "€10,000 – €25,000",
    "€25,000 – €50,000",
    "€50,000+",
    "Monthly system (€4,000+/mo)",
    "Not sure yet",
  ],
  submit: "Apply for a project →",
  sending: "Transmitting…",
  privacy:
    "Every application is read by the studio. We respond when there is a real match. studio@xnlab.io.",
  okSent: "Received. We will respond when the right time arrives.",
  okMailto: "Email opened — check your mail client.",
  back: "← Home",
  studioLabel: "Studio",
  studioInfo: ["By application only", "studio@xnlab.io"],
};
const es = {
  eyebrow: "Aplicación · 007",
  h1a: "Aplicar para",
  h1b: "un proyecto.",
  lead:
    "Cada encargo se selecciona. Trabajamos con un número reducido de marcas al año y cotizamos por proyecto. Cuéntanos qué construyes, cuándo abre y a qué altura quieres que se sienta.",
  fields: {
    name: "Nombre",
    email: "Email",
    brand: "Marca / Proyecto",
    website: "Web o Instagram",
    world: "Industria",
    projectType: "Tipo de proyecto",
    timeline: "Plazo",
    budget: "Inversión estimada",
    msg: "Cuéntanos más",
  },
  worlds: [
    "Hospitality & Experience",
    "Nightlife & Cultural Events",
    "Luxury & Lifestyle Brands",
    "Architecture & Spatial Design",
    "Music & Cultural Artists",
    "Cultural & Digital Worlds",
    "Wellness",
    "Otro",
  ],
  projectTypes: [
    "Campaign System (lanzamiento puntual)",
    "Atmósfera Digital (una sola página)",
    "Mundo de Marca (multipágina)",
    "Motor Visual (mensual)",
    "Técnico / Crecimiento",
    "Sprint de Mejora",
    "Aún no lo tengo claro",
  ],
  timelines: [
    "En menos de 1 mes",
    "1–3 meses",
    "3–6 meses",
    "6+ meses",
    "Flexible / Exploratorio",
  ],
  budgets: [
    "€5.000 – €10.000",
    "€10.000 – €25.000",
    "€25.000 – €50.000",
    "€50.000+",
    "Sistema mensual (€4.000+/mes)",
    "Aún no lo tengo claro",
  ],
  submit: "Aplicar para un proyecto →",
  sending: "Transmitiendo…",
  privacy:
    "Cada aplicación la lee el estudio. Respondemos cuando hay un match real. studio@xnlab.io.",
  okSent: "Recibido. Responderemos cuando llegue el momento adecuado.",
  okMailto: "Email abierto — revisa tu cliente de correo.",
  back: "← Inicio",
  studioLabel: "Estudio",
  studioInfo: ["Solo por aplicación", "studio@xnlab.io"],
};

type FormState = {
  name: string;
  email: string;
  brand: string;
  website: string;
  world: string;
  projectType: string;
  timeline: string;
  budget: string;
  msg: string;
};

const empty: FormState = {
  name: "",
  email: "",
  brand: "",
  website: "",
  world: "",
  projectType: "",
  timeline: "",
  budget: "",
  msg: "",
};

function buildMailto(f: FormState) {
  const subject = `XNLAB Application — ${f.world || "General"} — ${f.name || "Unknown"}`;
  const lines = [
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    f.brand ? `Brand / Project: ${f.brand}` : null,
    f.website ? `Website / Instagram: ${f.website}` : null,
    `Industry: ${f.world || "—"}`,
    f.projectType ? `Project type: ${f.projectType}` : null,
    f.timeline ? `Timeline: ${f.timeline}` : null,
    f.budget ? `Estimated investment: ${f.budget}` : null,
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
  const upd = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.msg || sending) return;
    setSending(true);
    try {
      const result = await sendContactEmail({ ...form, _gotcha: gotcha });
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
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(48px,7vw,96px)",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />
        <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.6rem,7vw,7rem)",
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
            <W text={t.h1b} delay={0.12} />
          </span>
        </h1>
        <R delay={0.3}>
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(1rem,1.3vw,1.18rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 300,
              maxWidth: 700,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>
      </section>

      <section
        style={{
          padding: "0 clamp(24px,7vw,96px) clamp(80px,10vw,140px)",
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(48px,6vw,96px)",
          gridTemplateColumns: "1fr",
        }}
      >
        <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "clamp(28px,3vw,40px)" }}>
          <div style={{ display: "grid", gap: "clamp(28px,3vw,40px)", gridTemplateColumns: "1fr 1fr" }} className="grid-cols-1 md:grid-cols-2">
            <R>
              <label style={labelStyle} htmlFor="name">
                {t.fields.name}
              </label>
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
              <label style={labelStyle} htmlFor="email">
                {t.fields.email}
              </label>
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

          <div style={{ display: "grid", gap: "clamp(28px,3vw,40px)", gridTemplateColumns: "1fr 1fr" }} className="grid-cols-1 md:grid-cols-2">
            <R delay={0.1}>
              <label style={labelStyle} htmlFor="brand">
                {t.fields.brand}
              </label>
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
            <R delay={0.11}>
              <label style={labelStyle} htmlFor="website">
                {t.fields.website}
              </label>
              <input
                id="website"
                name="website"
                value={form.website}
                onChange={upd("website")}
                autoComplete="url"
                placeholder="@username · website.com"
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
              />
            </R>
          </div>

          <div style={{ display: "grid", gap: "clamp(28px,3vw,40px)", gridTemplateColumns: "1fr 1fr" }} className="grid-cols-1 md:grid-cols-2">
            <R delay={0.12}>
              <label style={labelStyle} htmlFor="world">
                {t.fields.world}
              </label>
              <select
                id="world"
                name="world"
                value={form.world}
                onChange={upd("world")}
                style={{
                  ...fieldStyle,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  cursor: "pointer",
                  backgroundImage:
                    "linear-gradient(45deg,transparent 50%,rgba(255,255,255,0.5) 50%),linear-gradient(135deg,rgba(255,255,255,0.5) 50%,transparent 50%)",
                  backgroundPosition: "calc(100% - 14px) 22px, calc(100% - 8px) 22px",
                  backgroundSize: "6px 6px",
                  backgroundRepeat: "no-repeat",
                  color: form.world ? "white" : "rgba(255,255,255,0.45)",
                }}
              >
                <option value="" style={{ background: "#060606" }}>—</option>
                {t.worlds.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#060606" }}>{opt}</option>
                ))}
              </select>
            </R>
            <R delay={0.13}>
              <label style={labelStyle} htmlFor="budget">
                {t.fields.budget}
              </label>
              <select
                id="budget"
                name="budget"
                value={form.budget}
                onChange={upd("budget")}
                style={{
                  ...fieldStyle,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  cursor: "pointer",
                  backgroundImage:
                    "linear-gradient(45deg,transparent 50%,rgba(255,255,255,0.5) 50%),linear-gradient(135deg,rgba(255,255,255,0.5) 50%,transparent 50%)",
                  backgroundPosition: "calc(100% - 14px) 22px, calc(100% - 8px) 22px",
                  backgroundSize: "6px 6px",
                  backgroundRepeat: "no-repeat",
                  color: form.budget ? "white" : "rgba(255,255,255,0.45)",
                }}
              >
                <option value="" style={{ background: "#060606" }}>—</option>
                {t.budgets.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#060606" }}>{opt}</option>
                ))}
              </select>
            </R>
          </div>

          <div style={{ display: "grid", gap: "clamp(28px,3vw,40px)", gridTemplateColumns: "1fr 1fr" }} className="grid-cols-1 md:grid-cols-2">
            <R delay={0.135}>
              <label style={labelStyle} htmlFor="projectType">
                {t.fields.projectType}
              </label>
              <select
                id="projectType"
                name="projectType"
                value={form.projectType}
                onChange={upd("projectType")}
                style={{
                  ...fieldStyle,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  cursor: "pointer",
                  backgroundImage:
                    "linear-gradient(45deg,transparent 50%,rgba(255,255,255,0.5) 50%),linear-gradient(135deg,rgba(255,255,255,0.5) 50%,transparent 50%)",
                  backgroundPosition: "calc(100% - 14px) 22px, calc(100% - 8px) 22px",
                  backgroundSize: "6px 6px",
                  backgroundRepeat: "no-repeat",
                  color: form.projectType ? "white" : "rgba(255,255,255,0.45)",
                }}
              >
                <option value="" style={{ background: "#060606" }}>—</option>
                {t.projectTypes.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#060606" }}>{opt}</option>
                ))}
              </select>
            </R>
            <R delay={0.138}>
              <label style={labelStyle} htmlFor="timeline">
                {t.fields.timeline}
              </label>
              <select
                id="timeline"
                name="timeline"
                value={form.timeline}
                onChange={upd("timeline")}
                style={{
                  ...fieldStyle,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  cursor: "pointer",
                  backgroundImage:
                    "linear-gradient(45deg,transparent 50%,rgba(255,255,255,0.5) 50%),linear-gradient(135deg,rgba(255,255,255,0.5) 50%,transparent 50%)",
                  backgroundPosition: "calc(100% - 14px) 22px, calc(100% - 8px) 22px",
                  backgroundSize: "6px 6px",
                  backgroundRepeat: "no-repeat",
                  color: form.timeline ? "white" : "rgba(255,255,255,0.45)",
                }}
              >
                <option value="" style={{ background: "#060606" }}>—</option>
                {t.timelines.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#060606" }}>{opt}</option>
                ))}
              </select>
            </R>
          </div>

          <R delay={0.14}>
            <label style={labelStyle} htmlFor="msg">
              {t.fields.msg}
            </label>
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

          <R delay={0.18}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(20px,3vw,40px)", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.42)", maxWidth: 480 }}>{t.privacy}</p>
              <Magnetic>
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
              </Magnetic>
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

        <R delay={0.05}>
          <div
            style={{
              display: "grid",
              gap: "clamp(24px,3vw,40px)",
              gridTemplateColumns: "1fr",
              paddingTop: "clamp(48px,6vw,80px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
            className="md:grid-cols-[minmax(160px,220px)_1fr]"
          >
            <p style={labelStyle}>{t.studioLabel}</p>
            <div>
              {t.studioInfo.map((line, i) => {
                const isEmail = line.includes("@");
                return isEmail ? (
                  <a
                    key={i}
                    href={`mailto:${line}`}
                    style={{
                      display: "block",
                      fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                      lineHeight: 2,
                      color: "rgba(255,255,255,0.78)",
                      textDecoration: "none",
                      fontWeight: 300,
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.78)")}
                  >
                    {line}
                  </a>
                ) : (
                  <p
                    key={i}
                    style={{
                      fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                      lineHeight: 2,
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: 300,
                    }}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </R>
      </section>
    </main>
  );
}
