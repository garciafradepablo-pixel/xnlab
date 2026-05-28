"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMounted, useLang } from "./atoms";
import { sendContactEmail } from "../contact/actions";

// Invitation — the studio's lead capture, done as a premium invitation
// rather than an aggressive popup. It earns its appearance: it never
// fires on load, only after the visitor has engaged (deep scroll on
// mobile, exit-intent on desktop), once per session, and it is always
// one keystroke / one click away from dismissal.
//
// The hook is high-value, not a discount: the MMXXVI dossier + the
// founding cycle. It frames scarcity honestly (six brands per cycle,
// by selection) so it sells exclusivity without lying. On submit it
// reuses the contact server action — the studio is notified and the
// visitor gets the same signed auto-confirmation, so a popup lead is
// a real lead, not a list entry.
//
// Suppressed on /contact and /dossier (the visitor is already
// converting there) and for prefers-reduced-motion users who opt out
// of non-essential motion — they still have the footer and /contact.

const KEY = "xn-invitation-seen";
const SCROLL_TRIGGER = 0.55; // fraction of the page scrolled
const MIN_DWELL_MS = 6000; // never before six seconds of presence

const COPY = {
  en: {
    eyebrow: "By invitation · Founding cycle MMXXVI",
    h: "Take the studio with you.",
    sub: "The MMXXVI dossier — the method, the six surfaces, and how the founding cycle is selected. Sent privately, signed by the studio. Six brands per cycle.",
    placeholder: "Your email",
    cta: "Send me the dossier",
    sending: "Sending…",
    dismiss: "Not now",
    close: "Close invitation",
    sentH: "It's on its way.",
    sentSub: "Check your inbox — the dossier and a note from the studio. We reply personally when the work suggests a fit.",
    errEmail: "A valid email, please.",
    errSend: "Couldn't send just now — write to studio@xnlab.io and we'll open the dossier for you.",
  },
  es: {
    eyebrow: "Por invitación · Ciclo fundador MMXXVI",
    h: "Llévate el estudio contigo.",
    sub: "El dossier MMXXVI — el método, las seis superficies y cómo se selecciona el ciclo fundador. Enviado en privado, firmado por el estudio. Seis marcas por ciclo.",
    placeholder: "Tu email",
    cta: "Enviadme el dossier",
    sending: "Enviando…",
    dismiss: "Ahora no",
    close: "Cerrar invitación",
    sentH: "Va en camino.",
    sentSub: "Revisa tu bandeja — el dossier y una nota del estudio. Respondemos en persona cuando el trabajo apunta a un encaje.",
    errEmail: "Un email válido, por favor.",
    errSend: "No se pudo enviar ahora — escribe a studio@xnlab.io y te abrimos el dossier.",
  },
};

const EMAIL_RE = /^[^\s<>@]{1,64}@[^\s<>@.]{1,63}(?:\.[^\s<>@.]{1,63})+$/;

export function Invitation() {
  const [lang] = useLang();
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "sending" | "sent">("form");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const t = COPY[lang];

  // Routes where the visitor is already converting — never interrupt.
  const suppressed = pathname === "/contact" || pathname === "/dossier";

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  }, []);

  const trigger = useCallback(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
      sessionStorage.setItem(KEY, "1");
    } catch {}
    setOpen(true);
  }, []);

  // Arm the triggers once mounted, after a minimum dwell, only if not
  // already seen this session and not on a converting route.
  useEffect(() => {
    if (!mounted || suppressed) return;
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
    } catch {
      return;
    }
    let armed = false;
    const arm = () => { armed = true; };
    const dwell = window.setTimeout(arm, MIN_DWELL_MS);

    // Desktop: exit-intent — cursor leaves through the top of the viewport.
    const onMouseOut = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };
    // Mobile + fallback: deep scroll past the threshold.
    const onScroll = () => {
      if (!armed) return;
      const se = document.scrollingElement || document.documentElement;
      const max = se.scrollHeight - se.clientHeight;
      if (max > 0 && se.scrollTop / max >= SCROLL_TRIGGER) trigger();
    };
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(dwell);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mounted, suppressed, trigger]);

  // Esc to close + focus the field on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => inputRef.current?.focus(), 360);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [open, dismiss]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    if (!EMAIL_RE.test(clean)) { setErr(t.errEmail); return; }
    setErr(null);
    setPhase("sending");
    try {
      const res = await sendContactEmail({
        name: "",
        email: clean,
        msg: "Founding-cycle invitation — requested the studio dossier via the site invitation.",
        lang,
      });
      if (res.ok) {
        setPhase("sent");
      } else {
        setPhase("form");
        setErr(t.errSend);
      }
    } catch {
      setPhase("form");
      setErr(t.errSend);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t.h}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) dismiss(); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(20px,5vw,48px)",
            background: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(6,5,8,0.72) 0%, rgba(4,3,6,0.9) 100%)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "relative",
              width: "min(520px, 100%)",
              padding: "clamp(28px,4vw,48px)",
              borderRadius: 20,
              border: "1px solid rgba(232,183,131,0.22)",
              background:
                "linear-gradient(180deg, rgba(20,16,14,0.96) 0%, rgba(10,8,9,0.98) 100%)",
              boxShadow:
                "0 40px 120px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(232,183,131,0.06) inset, 0 0 80px -40px rgba(232,183,131,0.3)",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {/* Warm atmospheric pool inside the card — same language as
                the site, so the invitation feels carved from it. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,150,90,0.12) 0%, rgba(180,110,40,0.03) 42%, transparent 72%)",
                pointerEvents: "none",
              }}
            />
            <button
              type="button"
              aria-label={t.close}
              onClick={dismiss}
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                fontSize: 18,
                lineHeight: 1,
                transition: "color 0.3s",
                zIndex: 2,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >
              ×
            </button>

            <div style={{ position: "relative", zIndex: 1 }}>
              {phase === "sent" ? (
                <>
                  <p style={eyebrowStyle}>{t.eyebrow}</p>
                  <h2 style={headingStyle}>{t.sentH}</h2>
                  <p style={subStyle}>{t.sentSub}</p>
                </>
              ) : (
                <>
                  <p style={eyebrowStyle}>{t.eyebrow}</p>
                  <h2 style={headingStyle}>{t.h}</h2>
                  <p style={subStyle}>{t.sub}</p>
                  <form onSubmit={onSubmit} style={{ marginTop: "clamp(20px,2.6vw,28px)" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (err) setErr(null); }}
                        placeholder={t.placeholder}
                        aria-label={t.placeholder}
                        disabled={phase === "sending"}
                        style={{
                          flex: "1 1 220px",
                          minWidth: 0,
                          padding: "13px 18px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.16)",
                          background: "rgba(255,255,255,0.04)",
                          color: "white",
                          fontSize: 14,
                          fontFamily: "inherit",
                          outline: "none",
                          transition: "border-color 0.3s",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,183,131,0.6)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
                      />
                      <button
                        type="submit"
                        disabled={phase === "sending"}
                        style={{
                          flex: "0 0 auto",
                          padding: "13px 26px",
                          borderRadius: 999,
                          border: "1px solid rgba(232,183,131,0.5)",
                          background: "rgba(232,183,131,0.14)",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          cursor: phase === "sending" ? "default" : "pointer",
                          transition: "background 0.4s, border-color 0.4s, transform 0.4s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (phase === "sending") return;
                          e.currentTarget.style.background = "rgba(232,183,131,0.24)";
                          e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(232,183,131,0.14)";
                          e.currentTarget.style.borderColor = "rgba(232,183,131,0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {phase === "sending" ? t.sending : t.cta}
                      </button>
                    </div>
                    {err && (
                      <p style={{ margin: "12px 0 0", fontSize: 12, color: "rgba(232,150,120,0.9)", lineHeight: 1.5 }}>{err}</p>
                    )}
                  </form>
                  <button
                    type="button"
                    onClick={dismiss}
                    style={{
                      marginTop: "clamp(16px,2vw,22px)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    {t.dismiss}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.34em",
  textTransform: "uppercase",
  color: "rgba(232,183,131,0.75)",
};
const headingStyle: React.CSSProperties = {
  margin: "clamp(14px,1.8vw,20px) 0 clamp(10px,1.4vw,16px)",
  fontSize: "clamp(1.5rem,3vw,2.1rem)",
  fontWeight: 400,
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
  color: "white",
};
const subStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(0.9rem,1.1vw,1rem)",
  lineHeight: 1.65,
  color: "rgba(255,255,255,0.62)",
  fontWeight: 300,
  maxWidth: 420,
  marginLeft: "auto",
  marginRight: "auto",
};
