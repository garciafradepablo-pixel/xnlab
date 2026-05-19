"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { SiteFooter } from "../_lib/site-footer";

const en = {
  eyebrow: "Colophon",
  h1a: "Notes on this",
  h1b: "object.",
  lead: "A studio is also the materials it chose. Below: the studio, the type, the platform, and a brief word on data.",
  sections: [
    {
      label: "Studio",
      rows: [
        ["Commercial mark", "Xnlab Studio"],
        ["Wordmark", "XNLAB"],
        ["Practice founded", "MMXXII"],
                        ["Languages", "EN · ES · FR · AR"],
        ["Currencies", "EUR · USD · GBP · AED"],
        ["Current cycle", "MMXXVI · January — June · Open"],
        ["Discovery", "Forty-five minutes · by invitation"],
        ["Accountability", "Partner-signed · single point"],
        ["Contact", "studio@xnlab.io"],
        ["Availability", "By appointment only"],
      ],
    },
    {
      label: "Typography",
      rows: [
        ["Sans", "Inter — Rasmus Andersson"],
        ["Serif", "Cormorant Garamond — Catharsis Fonts"],
        ["Licenses", "SIL Open Font License 1.1"],
      ],
    },
    {
      label: "Platform",
      rows: [
        ["Framework", "Next.js 16 (App Router)"],
        ["Motion", "Framer Motion"],
        ["Hosting", "Vercel — Edge"],
        ["Image optimisation", "Next.js Image with AVIF/WebP"],
      ],
    },
    {
      label: "Imagery",
      rows: [
        ["Source", "Internal studio references and placeholders"],
        ["Direction", "Atmospheric, cinematic, dark"],
      ],
    },
  ],
  privacyLabel: "Privacy",
  privacy: [
    "We use Vercel Analytics — anonymous, cookieless, GDPR-friendly. No third-party trackers, no advertising pixels, no profile building.",
    "Our contact form delivers your message directly to studio@xnlab.io. We never share your details and do not use them for anything else.",
    "Legal basis for processing is your consent, given when you submit the form. Messages are kept only as long as needed to attend the enquiry — typically until the project closes or you ask us to delete them. Hosting is provided by Vercel (USA, EU–US Data Privacy Framework); transactional email by Resend (USA, same framework). No other processors involved.",
    "You may request access, rectification, deletion, restriction, portability or object to the processing of your data at studio@xnlab.io. You also have the right to complain to the Spanish Data Protection Agency (AEPD) at aepd.es.",
  ],
  termsLabel: "Use",
  terms: [
    "All writing, imagery and visual systems on this site are © Xnlab Studio unless otherwise attributed.",
    "If you would like to reference or quote our work, we are easy to reach.",
  ],
  updated: "Last updated",
  back: "← Home",
};

const es = {
  eyebrow: "Colofón",
  h1a: "Notas sobre este",
  h1b: "objeto.",
  lead: "Un estudio también son los materiales que eligió. Abajo: el estudio, la tipografía, la plataforma y una nota breve sobre datos.",
  sections: [
    {
      label: "Estudio",
      rows: [
        ["Marca comercial", "Xnlab Studio"],
        ["Logotipo", "XNLAB"],
        ["Práctica fundada", "MMXXII"],
                        ["Idiomas", "ES · EN · FR · AR"],
        ["Divisas", "EUR · USD · GBP · AED"],
        ["Ciclo actual", "MMXXVI · enero — junio · Abierto"],
        ["Discovery", "Cuarenta y cinco minutos · por invitación"],
        ["Responsabilidad", "Firmado por un socio · punto único"],
        ["Contacto", "studio@xnlab.io"],
        ["Disponibilidad", "Solo con cita previa"],
      ],
    },
    {
      label: "Tipografía",
      rows: [
        ["Sans", "Inter — Rasmus Andersson"],
        ["Serif", "Cormorant Garamond — Catharsis Fonts"],
        ["Licencia", "SIL Open Font License 1.1"],
      ],
    },
    {
      label: "Plataforma",
      rows: [
        ["Framework", "Next.js 16 (App Router)"],
        ["Movimiento", "Framer Motion"],
        ["Hosting", "Vercel — Edge"],
        ["Optimización de imagen", "Next.js Image con AVIF/WebP"],
      ],
    },
    {
      label: "Imagen",
      rows: [
        ["Fuente", "Referencias internas del estudio y placeholders"],
        ["Dirección", "Atmosférico, cinematográfico, oscuro"],
      ],
    },
  ],
  privacyLabel: "Privacidad",
  privacy: [
    "Usamos Vercel Analytics — anónimo, sin cookies, compatible con RGPD. Sin rastreadores de terceros, sin píxeles publicitarios, sin construcción de perfiles.",
    "Nuestro formulario de contacto entrega tu mensaje directamente a studio@xnlab.io. No compartimos tus datos ni los usamos para nada más.",
    "La base legal del tratamiento es tu consentimiento, otorgado al enviar el formulario. Los mensajes se conservan únicamente el tiempo necesario para atender la consulta — habitualmente hasta el cierre del proyecto o hasta que solicites su supresión. El alojamiento lo presta Vercel (EE.UU., Marco de Privacidad de Datos UE–EE.UU.); el envío de correo, Resend (EE.UU., mismo marco). No intervienen otros encargados.",
    "Puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oponerte al tratamiento de tus datos en studio@xnlab.io. También puedes presentar reclamación ante la Agencia Española de Protección de Datos (AEPD) en aepd.es.",
  ],
  termsLabel: "Uso",
  terms: [
    "Toda la escritura, imagen y sistemas visuales en este sitio son © Xnlab Studio salvo atribución contraria.",
    "Si quieres referenciar o citar nuestro trabajo, somos fáciles de localizar.",
  ],
  updated: "Última actualización",
  back: "← Inicio",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function Imprint() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  const now = new Date();
  const updated = now.toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
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
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(56px,8vw,96px)",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Dust count={6} opacity={0.06} />
        <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.4rem,7vw,6.8rem)",
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
              fontSize: "clamp(0.98rem,1.3vw,1.18rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 300,
              maxWidth: 720,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(60px,9vw,120px)", maxWidth: 1120, margin: "0 auto" }}>
        {t.sections.map((s, i) => (
          <R key={s.label} delay={0.05 * i}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(24px,3vw,40px)",
                padding: "clamp(32px,4vw,56px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              <p style={labelStyle}>{s.label}</p>
              <dl style={{ display: "grid", gridTemplateColumns: "minmax(120px,180px) 1fr", rowGap: 12, columnGap: 24, margin: 0 }}>
                {s.rows.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt style={{ fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{k}</dt>
                    <dd style={{ fontSize: "clamp(0.95rem,1.18vw,1.1rem)", color: "rgba(255,255,255,0.78)", fontWeight: 300, margin: 0 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </R>
        ))}
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(40px,6vw,80px)", maxWidth: 1120, margin: "0 auto" }}>
        {[
          { label: t.privacyLabel, paragraphs: t.privacy },
          { label: t.termsLabel, paragraphs: t.terms },
        ].map((b, i) => (
          <R key={b.label} delay={0.05 * i}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(24px,3vw,40px)",
                padding: "clamp(32px,4vw,56px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              <p style={labelStyle}>{b.label}</p>
              <div style={{ maxWidth: 680 }}>
                {b.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    style={{
                      marginBottom: j === b.paragraphs.length - 1 ? 0 : "1.1em",
                      fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                      lineHeight: 1.72,
                      color: "rgba(255,255,255,0.72)",
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

      <section style={{ padding: "clamp(48px,7vw,80px) clamp(24px,7vw,96px) clamp(80px,10vw,140px)", maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          {t.updated} — {updated}
        </p>
      </section>
        <SiteFooter lang={lang} />
    </main>
  );
}
