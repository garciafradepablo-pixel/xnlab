"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ts, tsS, serif, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { SiteFooter } from "../_lib/site-footer";
import { applyToHunterNetwork, enquireAsCompany } from "./actions";

// ---------------------------------------------------------------
// Hunter Network — the public door. A two-sided network, not a recruitment
// page: hunters on one side, the companies that buy their performance on the
// other. The surface states the standard, proves it (the real scorecard, the
// wall), shows the network is live, and opens both doors.
//
// Language discipline (brief): no guaranteed employment, no guaranteed income,
// no "pay to work", no published prices (rule 5b). The principle is fixed:
// payment buys an evaluation, performance buys campaigns; the brand is
// protected before the volume. Bilingual EN/ES, translated for meaning
// (AGENTS.md rule 6). Anonymous studio, MMXXII/MMXXVI.
// ---------------------------------------------------------------

type Lang = "en" | "es";
type Audience = "hunter" | "company";

const ACCENT = "rgba(232,183,131"; // warm gold — XNLAB trust accent (editorial)
const VIVID = "rgba(255,138,76"; // vivid amber — the attention/CTA accent. Used
// sparingly on the public capture surface so the page grabs the eye and gives a
// dominant call to action, while the dark premium base keeps the trust register.

export default function HunterNetworkPage() {
  const [lang, setLang] = useLang();
  const [audience, setAudience] = useState<Audience>("hunter");
  const t = COPY[lang];

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
          padding: "clamp(120px,15vh,180px) clamp(24px,7vw,96px) clamp(56px,7vw,96px)",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />

        <LiveStatusStrip t={t} />

        {/* Hero — same edge for both audiences */}
        <p style={eyebrowStyle}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.4rem,6.2vw,5.4rem)",
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
          <p style={{ marginTop: "clamp(26px,3.2vw,40px)", fontSize: "clamp(1rem,1.3vw,1.16rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.72)", fontWeight: 300, maxWidth: 680, textShadow: ts }}>
            {t.lead}
          </p>
        </R>

        {/* One-minute promise — the whole journey, scannable in a glance.
            Only shown on the hunter side; the company side has its own value row. */}
        {audience === "hunter" && (
          <R delay={0.28}>
            <JourneyRow t={t} />
          </R>
        )}

        {/* Dominant CTA — the page must give one obvious action. */}
        <R delay={0.34}>
          <div style={{ marginTop: "clamp(28px,3.4vw,44px)", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <a href="#apply" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "1rem clamp(1.6rem,3.4vw,2.8rem)", fontSize: "clamp(11px,0.9vw,13px)", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#1a0d04", background: `linear-gradient(100deg, ${VIVID},1) 0%, ${ACCENT},1) 100%)`, border: "none", borderRadius: 100, textDecoration: "none", boxShadow: `0 8px 40px ${VIVID},0.35)`, whiteSpace: "nowrap" }}>
              {audience === "hunter" ? t.ctaHunter : t.ctaCompany} →
            </a>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.01em" }}>{t.ctaNote}</span>
          </div>
        </R>

        {/* Audience selector — the two faces of the network */}
        <R delay={0.4}>
          <AudienceSelector audience={audience} setAudience={setAudience} t={t} />
        </R>

        <AnimatePresence mode="wait">
          {audience === "hunter" ? (
            <motion.div key="hunter" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <HunterFace lang={lang} t={t} />
            </motion.div>
          ) : (
            <motion.div key="company" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <CompanyFace lang={lang} t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}

// --- Live status strip — honest heartbeat, no exposed or faked data ---------

function LiveStatusStrip({ t }: { t: Copy }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % t.pulse.length), 3200);
    return () => clearInterval(id);
  }, [t.pulse.length]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "clamp(26px,3.2vw,40px)", flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: "#7fd0a0", boxShadow: "0 0 10px rgba(127,208,160,0.7)", animation: "hnpulse 1.6s infinite" }} />
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(127,208,160,0.9)" }}>{t.statusLabel}</span>
      </span>
      <span aria-hidden style={{ width: 1, height: 12, background: "rgba(255,255,255,0.14)" }} />
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.01em" }}
        >
          {t.pulse[i]}
        </motion.span>
      </AnimatePresence>
      <style>{`@keyframes hnpulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
}

// --- Audience selector ------------------------------------------------------

function AudienceSelector({ audience, setAudience, t }: { audience: Audience; setAudience: (a: Audience) => void; t: Copy }) {
  return (
    <div style={{ marginTop: "clamp(44px,5.5vw,76px)" }}>
      <p style={{ ...labelStyle, marginBottom: "clamp(14px,1.8vw,20px)" }}>{t.audienceLabel}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(10px,1.4vw,16px)" }}>
        {(["hunter", "company"] as Audience[]).map((a) => {
          const on = a === audience;
          const c = t.audience[a];
          return (
            <button
              key={a}
              type="button"
              onClick={() => setAudience(a)}
              aria-pressed={on}
              style={{
                textAlign: "left",
                padding: "clamp(18px,2vw,24px)",
                borderRadius: 14,
                cursor: "pointer",
                background: on ? `${ACCENT},0.07)` : "rgba(255,255,255,0.02)",
                border: on ? `1px solid ${ACCENT},0.5)` : "1px solid rgba(255,255,255,0.1)",
                transition: "border-color 0.3s, background 0.3s",
                color: "inherit",
                fontFamily: "inherit",
              }}
            >
              <span style={{ display: "block", fontSize: "clamp(1.1rem,1.5vw,1.35rem)", fontWeight: 400, letterSpacing: "-0.015em", color: "white" }}>{c.title}</span>
              <span style={{ display: "block", marginTop: 8, fontSize: "clamp(0.85rem,1vw,0.95rem)", lineHeight: 1.5, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{c.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// HUNTER FACE — sellers
// ============================================================================

function HunterFace({ lang, t }: { lang: Lang; t: Copy }) {
  return (
    <>
      {/* Not / Is */}
      <R delay={0.1}>
        <div style={{ marginTop: "clamp(44px,5.5vw,76px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(20px,3vw,44px)" }}>
          <NotIs label={t.h.notLabel} list={t.h.notList} tone="mute" />
          <NotIs label={t.h.isLabel} list={t.h.isList} tone="accent" />
        </div>
      </R>

      {/* Principle banner */}
      <PrincipleBanner t={t} />

      {/* The scorecard — proof of the standard */}
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <R delay={0.1}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(18px,2.2vw,28px)" }}>
            <p style={{ ...labelStyle, margin: 0 }}>{t.h.scoreLabel}</p>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 400 }}>{t.h.scoreNote}</p>
          </div>
        </R>
        <R delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "clamp(8px,1vw,12px)" }}>
            {t.h.dimensions.map((d) => (
              <div key={d} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", fontSize: "clamp(0.82rem,0.95vw,0.92rem)", color: "rgba(255,255,255,0.72)", fontWeight: 300 }}>{d}</div>
            ))}
          </div>
        </R>
        {/* Thresholds */}
        <R delay={0.2}>
          <div style={{ marginTop: "clamp(20px,2.4vw,32px)", display: "flex", flexWrap: "wrap", gap: "clamp(8px,1vw,12px)" }}>
            {t.h.thresholds.map((th) => (
              <span key={th.label} style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "0.5rem 0.9rem", borderRadius: 999, border: `1px solid ${ACCENT},0.28)`, background: `${ACCENT},0.04)` }}>
                <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: `${ACCENT},0.95)`, fontWeight: 500 }}>{th.range}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>{th.label}</span>
              </span>
            ))}
          </div>
        </R>
      </div>

      {/* The wall — what keeps you out */}
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <R delay={0.1}>
          <p style={{ ...labelStyle, marginBottom: "clamp(14px,1.8vw,22px)", color: "rgba(230,120,110,0.8)" }}>{t.h.wallLabel}</p>
        </R>
        <R delay={0.15}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: "1px solid rgba(230,120,110,0.18)" }}>
            {t.h.wall.map((line, i) => (
              <li key={i} style={{ position: "relative", padding: "13px 0 13px 24px", fontSize: "clamp(0.95rem,1.14vw,1.06rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.72)", fontWeight: 300, borderBottom: "1px solid rgba(230,120,110,0.12)" }}>
                <span aria-hidden style={{ position: "absolute", left: 0, top: "calc(50% - 6px)", color: "rgba(230,120,110,0.75)", fontSize: 13, lineHeight: 1 }}>✕</span>
                {line}
              </li>
            ))}
          </ul>
        </R>
      </div>

      {/* How access works */}
      <HowItWorks label={t.h.howLabel} steps={t.h.steps} />

      {/* Levels */}
      <Levels label={t.h.levelsLabel} note={t.h.levelsNote} levels={t.h.levels} />

      {/* Application */}
      <HunterApplication lang={lang} t={t} />
    </>
  );
}

function HunterApplication({ lang, t }: { lang: Lang; t: Copy }) {
  const [v, setV] = useState({ name: "", email: "", whatsapp: "", country: "", markets: "", experience: "", gotcha: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailto, setMailto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const f = t.h.form;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.email || !v.markets || !v.experience || sending) return;
    setSending(true); setError(null); setMailto(null);
    try {
      const res = await applyToHunterNetwork({ ...v, lang, _gotcha: v.gotcha });
      if (res.ok) { setSubmitted(true); return; }
      if (res.useMailto) {
        const subject = `Hunter Network — ${v.name || v.email}`;
        const body = `${f.nameLabel}: ${v.name}\n${f.emailLabel}: ${v.email}\n${f.whatsappLabel}: ${v.whatsapp}\n${f.countryLabel}: ${v.country}\n${f.marketsLabel}: ${v.markets}\n\n${v.experience}`;
        setMailto(`mailto:studio@xnlab.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setError(f.errors.send);
      } else setError(res.reason === "rate_limited" ? f.errors.rate : f.errors.validation);
    } catch { setError(f.errors.send); } finally { setSending(false); }
  };

  const disabled = sending || !v.email || !v.markets || !v.experience;

  return (
    <div id="apply" style={{ marginTop: "clamp(64px,8vw,120px)" }}>
      {submitted ? (
        <Success badge={f.successBadge} h={f.successH} body={f.successBody} again={f.again} onAgain={() => { setSubmitted(false); setV({ ...v, experience: "" }); }} />
      ) : (
        <form onSubmit={onSubmit} noValidate style={formStyle}>
          <FormHead eyebrow={f.formEyebrow} h={f.formH} lead={f.formLead} />
          <div style={twoCol}>
            <Field id="hn-name" label={f.nameLabel}><input id="hn-name" type="text" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder={f.namePlaceholder} autoComplete="name" style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
            <Field id="hn-email" label={f.emailLabel}><input id="hn-email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} placeholder={f.emailPlaceholder} autoComplete="email" required style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <div style={{ ...twoCol, marginTop: "clamp(24px,3vw,36px)" }}>
            <Field id="hn-wa" label={f.whatsappLabel}><input id="hn-wa" type="tel" value={v.whatsapp} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} placeholder={f.whatsappPlaceholder} autoComplete="tel" style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
            <Field id="hn-country" label={f.countryLabel}><input id="hn-country" type="text" value={v.country} onChange={(e) => setV({ ...v, country: e.target.value })} placeholder={f.countryPlaceholder} autoComplete="country-name" style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <div style={{ marginTop: "clamp(24px,3vw,36px)" }}>
            <Field id="hn-markets" label={f.marketsLabel}><input id="hn-markets" type="text" value={v.markets} onChange={(e) => setV({ ...v, markets: e.target.value })} placeholder={f.marketsPlaceholder} required style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <div style={{ marginTop: "clamp(24px,3vw,36px)" }}>
            <Field id="hn-exp" label={f.expLabel}><textarea id="hn-exp" value={v.experience} onChange={(e) => setV({ ...v, experience: e.target.value })} placeholder={f.expPlaceholder} rows={4} required style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <Honeypot value={v.gotcha} onChange={(val) => setV({ ...v, gotcha: val })} />
          <SubmitRow fineprint={f.fineprint} label={sending ? f.sending : f.submit} disabled={disabled} />
          <FormError error={error} mailto={mailto} cta={f.mailtoCta} />
        </form>
      )}
    </div>
  );
}

// ============================================================================
// COMPANY FACE — demand side
// ============================================================================

function CompanyFace({ lang, t }: { lang: Lang; t: Copy }) {
  return (
    <>
      <R delay={0.1}>
        <p style={{ marginTop: "clamp(44px,5.5vw,76px)", fontSize: "clamp(1rem,1.25vw,1.14rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.7)", fontWeight: 300, maxWidth: 680 }}>{t.c.lead}</p>
      </R>

      {/* What you get */}
      <div style={{ marginTop: "clamp(48px,6vw,84px)" }}>
        <R delay={0.1}><p style={{ ...labelStyle, marginBottom: "clamp(16px,2vw,24px)" }}>{t.c.getLabel}</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(14px,1.8vw,24px)" }}>
          {t.c.get.map((g, i) => (
            <R key={i} delay={0.05 * i}>
              <div style={{ padding: "clamp(18px,2vw,26px)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", height: "100%" }}>
                <h3 style={{ margin: 0, fontSize: "clamp(1.05rem,1.4vw,1.25rem)", fontWeight: 400, color: "white", letterSpacing: "-0.01em" }}>{g.title}</h3>
                <p style={{ margin: "10px 0 0", fontSize: "clamp(0.9rem,1.05vw,1rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>{g.body}</p>
              </div>
            </R>
          ))}
        </div>
      </div>

      {/* Principle still holds for clients: they get evaluated sellers, not warm bodies */}
      <PrincipleBanner t={t} clientLine={t.c.principleAside} />

      {/* How it works for companies */}
      <HowItWorks label={t.c.howLabel} steps={t.c.steps} />

      {/* Enquiry */}
      <CompanyEnquiry lang={lang} t={t} />
    </>
  );
}

function CompanyEnquiry({ lang, t }: { lang: Lang; t: Copy }) {
  const [v, setV] = useState({ company: "", name: "", email: "", market: "", offer: "", gotcha: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailto, setMailto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const f = t.c.form;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.email || !v.company || !v.offer || sending) return;
    setSending(true); setError(null); setMailto(null);
    try {
      const res = await enquireAsCompany({ ...v, lang, _gotcha: v.gotcha });
      if (res.ok) { setSubmitted(true); return; }
      if (res.useMailto) {
        const subject = `Hunter Network — ${v.company}`;
        const body = `${f.companyLabel}: ${v.company}\n${f.nameLabel}: ${v.name}\n${f.emailLabel}: ${v.email}\n${f.marketLabel}: ${v.market}\n\n${v.offer}`;
        setMailto(`mailto:studio@xnlab.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setError(f.errors.send);
      } else setError(res.reason === "rate_limited" ? f.errors.rate : f.errors.validation);
    } catch { setError(f.errors.send); } finally { setSending(false); }
  };

  const disabled = sending || !v.email || !v.company || !v.offer;

  return (
    <div id="apply" style={{ marginTop: "clamp(64px,8vw,120px)" }}>
      {submitted ? (
        <Success badge={f.successBadge} h={f.successH} body={f.successBody} again={f.again} onAgain={() => { setSubmitted(false); setV({ ...v, offer: "" }); }} />
      ) : (
        <form onSubmit={onSubmit} noValidate style={formStyle}>
          <FormHead eyebrow={f.formEyebrow} h={f.formH} lead={f.formLead} />
          <div style={twoCol}>
            <Field id="co-company" label={f.companyLabel}><input id="co-company" type="text" value={v.company} onChange={(e) => setV({ ...v, company: e.target.value })} placeholder={f.companyPlaceholder} autoComplete="organization" required style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
            <Field id="co-name" label={f.nameLabel}><input id="co-name" type="text" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder={f.namePlaceholder} autoComplete="name" style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <div style={{ ...twoCol, marginTop: "clamp(24px,3vw,36px)" }}>
            <Field id="co-email" label={f.emailLabel}><input id="co-email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} placeholder={f.emailPlaceholder} autoComplete="email" required style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
            <Field id="co-market" label={f.marketLabel}><input id="co-market" type="text" value={v.market} onChange={(e) => setV({ ...v, market: e.target.value })} placeholder={f.marketPlaceholder} style={fieldStyle} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <div style={{ marginTop: "clamp(24px,3vw,36px)" }}>
            <Field id="co-offer" label={f.offerLabel}><textarea id="co-offer" value={v.offer} onChange={(e) => setV({ ...v, offer: e.target.value })} placeholder={f.offerPlaceholder} rows={4} required style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }} onFocus={focusOn} onBlur={focusOff} /></Field>
          </div>
          <Honeypot value={v.gotcha} onChange={(val) => setV({ ...v, gotcha: val })} />
          <SubmitRow fineprint={f.fineprint} label={sending ? f.sending : f.submit} disabled={disabled} />
          <FormError error={error} mailto={mailto} cta={f.mailtoCta} />
        </form>
      )}
    </div>
  );
}

// ============================================================================
// Shared pieces
// ============================================================================

// The one-minute promise: the full member journey as a scannable row. Each
// node is a stage of what HN does for a hunter — train, evaluate, real work,
// agenda, pay by performance. The deep machinery (courses, exam, agenda,
// time-tracking) lives in the member portal; here it reads as the promise.
function JourneyRow({ t }: { t: Copy }) {
  return (
    <div style={{ marginTop: "clamp(28px,3.4vw,44px)", display: "flex", flexWrap: "wrap", gap: "clamp(8px,1vw,12px)", alignItems: "stretch" }}>
      {t.journey.map((j, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "clamp(12px,1.4vw,16px) clamp(14px,1.6vw,18px)", borderRadius: 12, border: `1px solid ${VIVID},0.22)`, background: `${VIVID},0.05)`, minWidth: 110 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>{j.icon}</span>
            <span style={{ fontSize: "clamp(0.8rem,0.95vw,0.9rem)", fontWeight: 500, color: "white", letterSpacing: "-0.005em" }}>{j.title}</span>
            <span style={{ fontSize: 11, lineHeight: 1.35, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{j.sub}</span>
          </div>
          {i < t.journey.length - 1 && <span aria-hidden style={{ color: `${VIVID},0.5)`, fontSize: 14 }} className="hn-journey-arrow">→</span>}
        </div>
      ))}
      <style>{`@media (max-width:680px){.hn-journey-arrow{display:none}}`}</style>
    </div>
  );
}

function PrincipleBanner({ t, clientLine }: { t: Copy; clientLine?: string }) {
  return (
    <R delay={0.2}>
      <div style={{ marginTop: "clamp(56px,7vw,96px)", padding: "clamp(28px,4vw,52px)", borderRadius: 18, border: `1px solid ${ACCENT},0.25)`, background: `${ACCENT},0.04)`, textAlign: "center" }}>
        <p style={{ ...labelStyle, color: `${ACCENT},0.75)`, marginBottom: 18 }}>{t.principleLabel}</p>
        <p style={{ margin: 0, fontSize: "clamp(1.4rem,3vw,2.4rem)", fontWeight: 300, lineHeight: 1.18, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.55)", textWrap: "balance" }}>{t.principleH}</p>
        <p style={{ margin: "14px 0 0", fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1.5rem,3.2vw,2.6rem)", lineHeight: 1.15, letterSpacing: "-0.01em", color: `${ACCENT},0.92)`, textShadow: ts, textWrap: "balance" }}>{t.principleSub}</p>
        {clientLine && <p style={{ margin: "20px auto 0", maxWidth: 520, fontSize: "clamp(0.9rem,1.05vw,1rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{clientLine}</p>}
      </div>
    </R>
  );
}

function HowItWorks({ label, steps }: { label: string; steps: Step[] }) {
  return (
    <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
      <R delay={0.1}><p style={labelStyle}>{label}</p></R>
      <div style={{ marginTop: "clamp(24px,3vw,40px)" }}>
        {steps.map((s, i) => (
          <R key={s.num} delay={0.05 * i}>
            <div style={{ display: "flex", gap: "clamp(16px,2.4vw,32px)", paddingBottom: i === steps.length - 1 ? 0 : "clamp(24px,3vw,40px)", marginBottom: i === steps.length - 1 ? 0 : "clamp(24px,3vw,40px)", borderBottom: i === steps.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "clamp(11px,1vw,13px)", letterSpacing: "0.18em", color: `${ACCENT},0.7)`, fontVariantNumeric: "tabular-nums", flexShrink: 0, paddingTop: 4 }}>{s.num}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 400, letterSpacing: "-0.015em", color: "white" }}>{s.title}</h3>
                <p style={{ margin: "10px 0 0", fontSize: "clamp(0.95rem,1.14vw,1.06rem)", lineHeight: 1.65, color: "rgba(255,255,255,0.62)", fontWeight: 300, maxWidth: 640 }}>{s.body}</p>
              </div>
            </div>
          </R>
        ))}
      </div>
    </div>
  );
}

function Levels({ label, note, levels }: { label: string; note: string; levels: Level[] }) {
  return (
    <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
      <R delay={0.1}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(18px,2.2vw,26px)" }}>
          <p style={{ ...labelStyle, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 11, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 360 }}>{note}</p>
        </div>
      </R>
      <R delay={0.15}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {levels.map((lv, i) => (
            <div key={lv.name} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20, padding: "clamp(14px,1.8vw,20px) 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
  );
}

function NotIs({ label, list, tone }: { label: string; list: string[]; tone: "mute" | "accent" }) {
  const accent = tone === "accent";
  return (
    <div>
      <p style={{ ...labelStyle, color: accent ? `${ACCENT},0.75)` : "rgba(255,255,255,0.4)", marginBottom: "clamp(14px,1.8vw,20px)" }}>{label}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {list.map((line, i) => (
          <li key={i} style={{ position: "relative", padding: "11px 0 11px 22px", fontSize: "clamp(0.95rem,1.14vw,1.05rem)", lineHeight: 1.6, color: accent ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.55)", fontWeight: 300, borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span aria-hidden style={{ position: "absolute", left: 0, top: "calc(50% - 0.5px)", width: 12, height: 1, background: accent ? `${ACCENT},0.55)` : "rgba(255,255,255,0.25)" }} />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- form atoms -------------------------------------------------------------

function HNHeader({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: Copy }) {
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,3,2,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}>
      <nav style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 clamp(20px,5vw,56px)" }}>
        <WordmarkLink />
        <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{t.back}</Link>
        <button onClick={() => setLang(lang === "en" ? "es" : "en")} aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
          <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
        </button>
      </nav>
    </header>
  );
}

function FormHead({ eyebrow, h, lead }: { eyebrow: string; h: string; lead: string }) {
  return (
    <>
      <p style={{ ...labelStyle, color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>{eyebrow}</p>
      <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(2rem,4vw,3.4rem)", lineHeight: 1, letterSpacing: "-0.02em", color: "white", textShadow: tsS, margin: "0 0 clamp(18px,2.4vw,28px)" }}>{h}</h2>
      <p style={{ fontSize: "clamp(0.95rem,1.16vw,1.06rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.62)", fontWeight: 300, maxWidth: 640, margin: "0 0 clamp(28px,3.4vw,44px)" }}>{lead}</p>
    </>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id}><span style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.34em", textTransform: "uppercase", color: `${ACCENT},0.7)`, marginBottom: "clamp(10px,1.4vw,16px)" }}>{label}</span></label>
      {children}
    </div>
  );
}

function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="text" name="company_extra" value={value} onChange={(e) => onChange(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />;
}

function SubmitRow({ fineprint, label, disabled }: { fineprint: string; label: string; disabled: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(20px,3vw,40px)", flexWrap: "wrap", marginTop: "clamp(32px,4vw,48px)" }}>
      <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.42)", maxWidth: 520, margin: 0 }}>{fineprint}</p>
      <motion.button type="submit" disabled={disabled} whileTap={{ scale: 0.98 }} style={{ padding: "0.95rem clamp(1.4rem,3vw,2.6rem)", fontSize: "clamp(10px,0.85vw,12px)", fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#060606", background: "white", border: "none", borderRadius: 100, cursor: disabled ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: disabled ? 0.55 : 1, transition: "opacity 0.3s" }}>{label}</motion.button>
    </div>
  );
}

function FormError({ error, mailto, cta }: { error: string | null; mailto: string | null; cta: string }) {
  if (!error) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: 20 }}>
      <p role="alert" aria-live="polite" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,150,120,0.85)", margin: 0 }}>{error}</p>
      {mailto && <a href={mailto} style={{ display: "inline-block", marginTop: 12, fontSize: 12, letterSpacing: "0.02em", color: `${ACCENT},0.9)`, textDecoration: "none", borderBottom: `1px solid ${ACCENT},0.45)`, paddingBottom: 2 }}>{cta} →</a>}
    </motion.div>
  );
}

function Success({ badge, h, body, again, onAgain }: { badge: string; h: string; body: string; again: string; onAgain: () => void }) {
  return (
    <div style={{ borderTop: `1px solid ${ACCENT},0.25)`, paddingTop: "clamp(28px,3.4vw,44px)" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0.45rem 0.9rem", border: `1px solid ${ACCENT},0.5)`, borderRadius: 999, background: `${ACCENT},0.06)`, color: `${ACCENT},0.92)`, fontSize: 10, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", marginBottom: "clamp(20px,2.6vw,32px)" }}>
        <span aria-hidden style={{ display: "flex", width: 6, height: 6, borderRadius: 999, background: "#e8b783" }} />
        {badge}
      </div>
      <h2 style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1.8rem,3.4vw,2.8rem)", lineHeight: 1.05, letterSpacing: "-0.02em", color: "white", textShadow: tsS, margin: 0 }}>{h}</h2>
      <p style={{ marginTop: "clamp(16px,2vw,24px)", fontSize: "clamp(0.98rem,1.2vw,1.1rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.74)", fontWeight: 300, maxWidth: 580 }}>{body}</p>
      <button type="button" onClick={onAgain} style={{ marginTop: "clamp(28px,3vw,40px)", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontFamily: "inherit" }}>{again} →</button>
    </div>
  );
}

const fieldStyle: React.CSSProperties = { display: "block", width: "100%", padding: "14px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.18)", color: "white", fontFamily: "inherit", fontSize: "clamp(0.95rem,1.18vw,1.08rem)", fontWeight: 300, letterSpacing: "0.01em", outline: "none", transition: "border-color 0.3s" };
const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)");
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)");
const formStyle: React.CSSProperties = { borderTop: `1px solid ${ACCENT},0.25)`, paddingTop: "clamp(32px,4vw,52px)" };
const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 500, letterSpacing: "0.38em", textTransform: "uppercase", color: `${ACCENT},0.75)`, marginBottom: 28, position: "relative", zIndex: 5 };
const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 500, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" };
const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "clamp(20px,3vw,44px)" };

// ============================================================================
// COPY — EN / ES, both audiences
// ============================================================================

type Step = { num: string; title: string; body: string };
type Level = { name: string; access: string };

type Copy = {
  back: string;
  eyebrow: string;
  h1a: string;
  h1b: string;
  lead: string;
  statusLabel: string;
  pulse: string[];
  journey: { icon: string; title: string; sub: string }[];
  ctaHunter: string;
  ctaCompany: string;
  ctaNote: string;
  audienceLabel: string;
  audience: Record<Audience, { title: string; sub: string }>;
  principleLabel: string;
  principleH: string;
  principleSub: string;
  h: {
    notLabel: string; notList: string[];
    isLabel: string; isList: string[];
    scoreLabel: string; scoreNote: string; dimensions: string[];
    thresholds: { range: string; label: string }[];
    wallLabel: string; wall: string[];
    howLabel: string; steps: Step[];
    levelsLabel: string; levelsNote: string; levels: Level[];
    form: HunterForm;
  };
  c: {
    lead: string;
    getLabel: string; get: { title: string; body: string }[];
    principleAside: string;
    howLabel: string; steps: Step[];
    form: CompanyForm;
  };
};

type HunterForm = {
  formEyebrow: string; formH: string; formLead: string;
  nameLabel: string; namePlaceholder: string;
  emailLabel: string; emailPlaceholder: string;
  whatsappLabel: string; whatsappPlaceholder: string;
  countryLabel: string; countryPlaceholder: string;
  marketsLabel: string; marketsPlaceholder: string;
  expLabel: string; expPlaceholder: string;
  submit: string; sending: string; fineprint: string;
  successBadge: string; successH: string; successBody: string; again: string; mailtoCta: string;
  errors: { validation: string; rate: string; send: string };
};

type CompanyForm = {
  formEyebrow: string; formH: string; formLead: string;
  companyLabel: string; companyPlaceholder: string;
  nameLabel: string; namePlaceholder: string;
  emailLabel: string; emailPlaceholder: string;
  marketLabel: string; marketPlaceholder: string;
  offerLabel: string; offerPlaceholder: string;
  submit: string; sending: string; fineprint: string;
  successBadge: string; successH: string; successBody: string; again: string; mailtoCta: string;
  errors: { validation: string; rate: string; send: string };
};

const en: Copy = {
  back: "← Home",
  eyebrow: "Hunter Network · MMXXVI",
  h1a: "Most who apply",
  h1b: "never reach a campaign.",
  lead: "Hunter Network is a private, performance-based network of evaluated remote Spanish-speaking sellers — and the companies that put them in front of their customers. Access is not bought. It is earned through a Commercial Access Evaluation, and the brand is protected before the volume. This is the door, on both sides.",
  statusLabel: "Network in operation",
  pulse: [
    "Candidates in evaluation right now.",
    "Calls being scored on thirteen dimensions.",
    "Campaigns matched to performance level.",
    "Brand-risk sellers held back from real brands.",
  ],
  journey: [
    { icon: "🎓", title: "Train", sub: "Sales training on the platform." },
    { icon: "🎧", title: "Evaluate", sub: "A real test call, scored." },
    { icon: "🎯", title: "Get matched", sub: "By your sales sector." },
    { icon: "💼", title: "Real work", sub: "Campaigns, not promises." },
    { icon: "📅", title: "Your agenda", sub: "Shifts and calls, organised." },
    { icon: "📈", title: "Get paid", sub: "By performance." },
  ],
  ctaHunter: "Start your evaluation",
  ctaCompany: "Book a discovery call",
  ctaNote: "Free to apply. Two minutes.",
  audienceLabel: "Choose your side",
  audience: {
    hunter: { title: "I sell", sub: "Apply to be evaluated and represent campaigns." },
    company: { title: "I need sales", sub: "Put evaluated sellers in front of your customers." },
  },
  principleLabel: "The principle",
  principleH: "Payment does not buy access to good clients.",
  principleSub: "Performance buys access to better campaigns.",
  h: {
    notLabel: "What it is not",
    notList: ["Not a call center, not a job board.", "Not a cheap teleoperator pool.", "Not a training academy.", "Not a pay-to-work platform."],
    isLabel: "What it is",
    isList: ["A private network of evaluated sellers.", "Access earned through a controlled evaluation.", "Campaign eligibility set by performance level.", "A standard that protects the brands represented."],
    scoreLabel: "What we score",
    scoreNote: "Every test call is graded across thirteen dimensions, 0–10, normalised to 100. Brand care is weighed as heavily as the close.",
    dimensions: ["Voice", "Clarity", "Energy", "Naturalness", "Respect", "Conversation control", "Product understanding", "Qualification", "Objection handling", "Meeting close", "Brand care", "CRM accuracy", "Discipline"],
    thresholds: [
      { range: "< 60", label: "Not qualified" },
      { range: "60–74", label: "Trainee" },
      { range: "75–84", label: "Junior" },
      { range: "85–94", label: "Active" },
      { range: "95 +", label: "Hunter" },
    ],
    wallLabel: "What keeps you out",
    wall: [
      "Pressure selling, or promising outside the script.",
      "Treating the brand as disposable to force a close.",
      "No-shows, low reliability, sloppy follow-up.",
      "A score below the floor — discipline does not bend.",
    ],
    howLabel: "How access works",
    steps: [
      { num: "01", title: "Application", body: "You apply and leave a short audio presentation. A person reviews it — not an automated inbox." },
      { num: "02", title: "Commercial Access Evaluation", body: "If there is a fit, you enter the evaluation: controlled test calls on simulated or test leads, never a real brand yet." },
      { num: "03", title: "Scoring & review", body: "Each call is scored across the thirteen dimensions and reviewed by an operator. Brand risk is flagged the moment it appears." },
      { num: "04", title: "Classification", body: "Your final score sets your performance level. The level — not the payment — decides which campaigns you can represent." },
      { num: "05", title: "Campaign access", body: "Qualified hunters receive campaigns matched to their level. Stronger performance unlocks higher-value campaigns; brand risk removes access." },
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
    form: {
      formEyebrow: "Apply to the network",
      formH: "Show us the instinct.",
      formLead: "If your commercial instinct is real, the studio wants to see it. A person reads every application and replies when the evaluation has a place that fits. No guarantees of work or income — only a fair evaluation.",
      nameLabel: "Name", namePlaceholder: "First and last name",
      emailLabel: "Email", emailPlaceholder: "you@domain.com",
      whatsappLabel: "WhatsApp", whatsappPlaceholder: "+34 …",
      countryLabel: "Country", countryPlaceholder: "Where you are based",
      marketsLabel: "What you sell / your markets", marketsPlaceholder: "Sectors, products, the kind of client you close.",
      expLabel: "Your commercial instinct", expPlaceholder: "A few lines: what you sell, how you open and close, the level you work at, and why a brand could trust you in front of its customer.",
      submit: "Send application", sending: "Sending…",
      fineprint: "A person reads it, tagged to Hunter Network. No newsletter. Payment, if any, only unlocks the evaluation — never campaign access.",
      successBadge: "Received", successH: "The network has it.", successBody: "Your application is in. If the studio sees a fit, you will be invited to the Commercial Access Evaluation. We reply when the work suggests it — not before.", again: "Send another", mailtoCta: "Open an email to the studio",
      errors: { validation: "Add a valid email, your markets, and a couple of lines.", rate: "The network already has this application. Try again in a moment.", send: "Connection to the studio failed. Write to studio@xnlab.io." },
    },
  },
  c: {
    lead: "You do not need more leads. You need meetings and sales from someone who represents your brand the way you would. Hunter Network places evaluated sellers — scored, classified, brand-safe — in front of the customers you want to reach. Anyone who would put your brand at risk never gets near it.",
    getLabel: "What you get",
    get: [
      { title: "Evaluated sellers, not warm bodies", body: "Every hunter on your campaign has passed a scored evaluation and clears the brand-risk bar. The standard is the product." },
      { title: "Matched to your stakes", body: "High-value campaigns go to high-performing hunters with low brand risk. The match respects what your brand can afford to lose." },
      { title: "Meetings and sales", body: "The engagement is built to produce qualified meetings and closes with decision-makers — not call volume." },
      { title: "Operator oversight", body: "Calls are reviewed, performance is tracked, and a seller who slips is pulled before they cost you a customer." },
    ],
    principleAside: "For your brand, this means the seller in front of your customer earned the right to be there.",
    howLabel: "How it works for companies",
    steps: [
      { num: "01", title: "Enquiry", body: "You tell us what you sell and who you want to reach. A person reviews it and arranges a discovery call when there is a fit." },
      { num: "02", title: "Discovery & fit", body: "We define the offer, the market, the script and the brand-risk band of the campaign — and what 'good' looks like for you." },
      { num: "03", title: "Matched hunters", body: "Evaluated sellers at the right level and brand-risk profile are assigned. Below-level sellers are never allowed near the campaign." },
      { num: "04", title: "Meetings & oversight", body: "Hunters work the campaign under operator review. You receive meetings and closes; risk is caught and removed early." },
    ],
    form: {
      formEyebrow: "Talk to the network",
      formH: "Tell us who you want to reach.",
      formLead: "A person reads every enquiry and replies to arrange a discovery call when there is a fit. What the engagement costs is discussed privately, after that call — never published here.",
      companyLabel: "Company", companyPlaceholder: "Your company or brand",
      nameLabel: "Your name", namePlaceholder: "Who we reply to",
      emailLabel: "Email", emailPlaceholder: "you@company.com",
      marketLabel: "Market", marketPlaceholder: "Country / language you sell into",
      offerLabel: "What you sell & who you want to reach", offerPlaceholder: "A few lines: the offer, the customer you want in front of you, and what a meeting or sale is worth to you.",
      submit: "Send enquiry", sending: "Sending…",
      fineprint: "Read by a person, tagged to Hunter Network. No pricing is exchanged here — engagements are partner-signed and discussed after a discovery call.",
      successBadge: "Received", successH: "The network has it.", successBody: "Your enquiry is in. If there is a fit, the studio replies to arrange a discovery call. Pricing is discussed privately, after that call.", again: "Send another", mailtoCta: "Open an email to the studio",
      errors: { validation: "Add your company, a valid email, and a couple of lines.", rate: "The network already has this enquiry. Try again in a moment.", send: "Connection to the studio failed. Write to studio@xnlab.io." },
    },
  },
};

const es: Copy = {
  back: "← Inicio",
  eyebrow: "Hunter Network · MMXXVI",
  h1a: "La mayoría de quien aplica",
  h1b: "no llega a una campaña.",
  lead: "Hunter Network es una red privada, basada en rendimiento, de vendedores remotos hispanohablantes evaluados — y las empresas que los ponen frente a sus clientes. El acceso no se compra. Se gana en una Evaluación de Acceso Comercial, y la marca se protege antes que el volumen. Esta es la puerta, por los dos lados.",
  statusLabel: "Red en operación",
  pulse: [
    "Candidatos en evaluación ahora mismo.",
    "Llamadas puntuándose en trece dimensiones.",
    "Campañas asignadas según nivel de rendimiento.",
    "Vendedores de riesgo apartados de marcas reales.",
  ],
  journey: [
    { icon: "🎓", title: "Fórmate", sub: "Formación de ventas en la plataforma." },
    { icon: "🎧", title: "Evalúate", sub: "Una llamada de prueba, puntuada." },
    { icon: "🎯", title: "Encaja", sub: "Por tu sector de venta." },
    { icon: "💼", title: "Trabajo real", sub: "Campañas, no promesas." },
    { icon: "📅", title: "Tu agenda", sub: "Jornadas y llamadas, organizadas." },
    { icon: "📈", title: "Cobra", sub: "Por rendimiento." },
  ],
  ctaHunter: "Empieza tu evaluación",
  ctaCompany: "Reserva una llamada",
  ctaNote: "Solicitar es gratis. Dos minutos.",
  audienceLabel: "Elige tu lado",
  audience: {
    hunter: { title: "Vendo", sub: "Solicita ser evaluado y representar campañas." },
    company: { title: "Necesito ventas", sub: "Pon vendedores evaluados frente a tus clientes." },
  },
  principleLabel: "El principio",
  principleH: "El pago no da acceso a buenos clientes.",
  principleSub: "El rendimiento da acceso a mejores campañas.",
  h: {
    notLabel: "Lo que no es",
    notList: ["No es un call center ni una bolsa de empleo.", "No es un pool barato de teleoperadores.", "No es una academia de formación.", "No es una plataforma de pagar para trabajar."],
    isLabel: "Lo que es",
    isList: ["Una red privada de vendedores evaluados.", "Acceso ganado en una evaluación controlada.", "Elegibilidad de campaña según nivel de rendimiento.", "Un estándar que protege a las marcas representadas."],
    scoreLabel: "Qué puntuamos",
    scoreNote: "Cada llamada de prueba se puntúa en trece dimensiones, 0–10, normalizadas a 100. El cuidado de la marca pesa tanto como el cierre.",
    dimensions: ["Voz", "Claridad", "Energía", "Naturalidad", "Respeto", "Control de conversación", "Conocimiento del producto", "Cualificación", "Manejo de objeciones", "Cierre de cita", "Cuidado de la marca", "Precisión en CRM", "Disciplina"],
    thresholds: [
      { range: "< 60", label: "No cualifica" },
      { range: "60–74", label: "Trainee" },
      { range: "75–84", label: "Junior" },
      { range: "85–94", label: "Activo" },
      { range: "95 +", label: "Hunter" },
    ],
    wallLabel: "Lo que te deja fuera",
    wall: [
      "Vender a presión o prometer fuera del guion.",
      "Tratar la marca como desechable para forzar un cierre.",
      "Faltar a citas, baja fiabilidad, seguimiento descuidado.",
      "Un score bajo el mínimo — la disciplina no se dobla.",
    ],
    howLabel: "Cómo se accede",
    steps: [
      { num: "01", title: "Candidatura", body: "Te presentas y dejas un breve audio. Lo revisa una persona, no una bandeja automática." },
      { num: "02", title: "Evaluación de Acceso Comercial", body: "Si hay encaje, entras en la evaluación: llamadas de prueba controladas sobre leads simulados o de prueba, nunca todavía una marca real." },
      { num: "03", title: "Puntuación y revisión", body: "Cada llamada se puntúa en las trece dimensiones y la revisa un operador. El riesgo de marca se marca en cuanto aparece." },
      { num: "04", title: "Clasificación", body: "Tu score final fija tu nivel de rendimiento. El nivel — no el pago — decide qué campañas puedes representar." },
      { num: "05", title: "Acceso a campañas", body: "Los hunters cualificados reciben campañas según su nivel. Mejor rendimiento abre campañas de más valor; el riesgo de marca retira el acceso." },
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
    form: {
      formEyebrow: "Solicita entrar en la red",
      formH: "Demuestra el instinto.",
      formLead: "Si tu instinto comercial es real, el estudio quiere verlo. Una persona lee cada candidatura y responde cuando la evaluación tiene una plaza que encaja. Sin promesas de trabajo ni de ingresos — solo una evaluación justa.",
      nameLabel: "Nombre", namePlaceholder: "Nombre y apellido",
      emailLabel: "Email", emailPlaceholder: "tu@dominio.com",
      whatsappLabel: "WhatsApp", whatsappPlaceholder: "+34 …",
      countryLabel: "País", countryPlaceholder: "Dónde resides",
      marketsLabel: "Qué vendes / tus mercados", marketsPlaceholder: "Sectores, productos, el tipo de cliente que cierras.",
      expLabel: "Tu instinto comercial", expPlaceholder: "Unas líneas: qué vendes, cómo abres y cierras, a qué nivel trabajas y por qué una marca podría confiarte su cliente.",
      submit: "Enviar candidatura", sending: "Enviando…",
      fineprint: "Lo lee una persona, etiquetado a Hunter Network. Sin newsletter. El pago, si lo hay, solo desbloquea la evaluación — nunca el acceso a campañas.",
      successBadge: "Recibido", successH: "La red lo tiene.", successBody: "Tu candidatura está dentro. Si el estudio ve un encaje, recibirás una invitación a la Evaluación de Acceso Comercial. Respondemos cuando el trabajo lo sugiere — no antes.", again: "Enviar otra", mailtoCta: "Abrir un email al estudio",
      errors: { validation: "Añade un email válido, tus mercados y un par de líneas.", rate: "La red ya tiene esta candidatura. Vuelve a probar en un momento.", send: "La conexión con el estudio ha fallado. Escribe a studio@xnlab.io." },
    },
  },
  c: {
    lead: "No necesitas más leads. Necesitas reuniones y ventas de alguien que represente tu marca como lo harías tú. Hunter Network pone vendedores evaluados — puntuados, clasificados, seguros para la marca — frente a los clientes que quieres alcanzar. Quien pondría tu marca en riesgo no se acerca a ella.",
    getLabel: "Qué obtienes",
    get: [
      { title: "Vendedores evaluados, no cuerpos calientes", body: "Cada hunter de tu campaña ha pasado una evaluación puntuada y supera el listón de riesgo de marca. El estándar es el producto." },
      { title: "Ajustado a lo que te juegas", body: "Las campañas de alto valor van a hunters de alto rendimiento y bajo riesgo de marca. El encaje respeta lo que tu marca puede permitirse perder." },
      { title: "Reuniones y ventas", body: "El encargo está construido para producir reuniones cualificadas y cierres con decisores — no volumen de llamadas." },
      { title: "Supervisión de operador", body: "Las llamadas se revisan, el rendimiento se sigue, y un vendedor que falla se retira antes de que te cueste un cliente." },
    ],
    principleAside: "Para tu marca esto significa que el vendedor frente a tu cliente se ganó el derecho a estar ahí.",
    howLabel: "Cómo funciona para empresas",
    steps: [
      { num: "01", title: "Consulta", body: "Nos cuentas qué vendes y a quién quieres alcanzar. Una persona lo revisa y concierta una llamada de descubrimiento cuando hay encaje." },
      { num: "02", title: "Descubrimiento y encaje", body: "Definimos la oferta, el mercado, el guion y la banda de riesgo de marca de la campaña — y qué es 'bueno' para ti." },
      { num: "03", title: "Hunters asignados", body: "Se asignan vendedores evaluados del nivel y perfil de riesgo adecuados. A los de nivel insuficiente nunca se les deja acercarse a la campaña." },
      { num: "04", title: "Reuniones y supervisión", body: "Los hunters trabajan la campaña bajo revisión de operador. Tú recibes reuniones y cierres; el riesgo se detecta y se retira pronto." },
    ],
    form: {
      formEyebrow: "Habla con la red",
      formH: "Dinos a quién quieres alcanzar.",
      formLead: "Una persona lee cada consulta y responde para concertar una llamada de descubrimiento cuando hay encaje. Lo que cuesta el encargo se trata en privado, después de esa llamada — nunca aquí.",
      companyLabel: "Empresa", companyPlaceholder: "Tu empresa o marca",
      nameLabel: "Tu nombre", namePlaceholder: "A quién respondemos",
      emailLabel: "Email", emailPlaceholder: "tu@empresa.com",
      marketLabel: "Mercado", marketPlaceholder: "País / idioma al que vendes",
      offerLabel: "Qué vendes y a quién quieres alcanzar", offerPlaceholder: "Unas líneas: la oferta, el cliente que quieres tener delante y cuánto vale para ti una reunión o una venta.",
      submit: "Enviar consulta", sending: "Enviando…",
      fineprint: "Lo lee una persona, etiquetado a Hunter Network. Aquí no se intercambian precios — los encargos se firman con un socio y se tratan tras una llamada de descubrimiento.",
      successBadge: "Recibido", successH: "La red lo tiene.", successBody: "Tu consulta está dentro. Si hay encaje, el estudio responde para concertar una llamada de descubrimiento. El precio se trata en privado, después de esa llamada.", again: "Enviar otra", mailtoCta: "Abrir un email al estudio",
      errors: { validation: "Añade tu empresa, un email válido y un par de líneas.", rate: "La red ya tiene esta consulta. Vuelve a probar en un momento.", send: "La conexión con el estudio ha fallado. Escribe a studio@xnlab.io." },
    },
  },
};

const COPY: Record<Lang, Copy> = { en, es };
