"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";

// Latest entry first. Editing this list publishes new posts.
// Date format: ISO (YYYY-MM-DD). Page formats per locale.
type Entry = {
  date: string;
  sections: {
    label: { en: string; es: string };
    body: { en: string[]; es: string[] };
  }[];
};

const entries: Entry[] = [
  {
    date: "2026-05-15",
    sections: [
      {
        label: { en: "In the studio", es: "En el estudio" },
        body: {
          en: [
            "Two atmosphere studies on the table. One is a small hotel on a coast we are not yet at liberty to name; the other is an architectural identity for a cultural foundation we have been listening to for six months. Both feel like they are about silence — which is suspicious, and worth following.",
            "We have begun designing the visual physics for our own universe — the Central Core and six World Cores. The web is the first surface to receive it.",
          ],
          es: [
            "Dos estudios de atmósfera sobre la mesa. Uno es un hotel pequeño en una costa que aún no podemos nombrar; el otro es una identidad arquitectónica para una fundación cultural a la que llevamos escuchando seis meses. Los dos parecen tratar sobre el silencio — lo cual es sospechoso, y vale la pena seguirlo.",
            "Hemos empezado a diseñar la física visual de nuestro propio universo — el Núcleo Central y los seis Núcleos del mundo. La web es la primera superficie en recibirlo.",
          ],
        },
      },
      {
        label: { en: "Reading", es: "Leyendo" },
        body: {
          en: [
            "Junichiro Tanizaki — In Praise of Shadows. Re-read every two years; never the same book twice.",
            "A monograph on Carlo Scarpa. The mortar joints are the project.",
          ],
          es: [
            "Junichiro Tanizaki — Elogio de la sombra. Releído cada dos años; nunca el mismo libro dos veces.",
            "Una monografía sobre Carlo Scarpa. Las juntas del mortero son el proyecto.",
          ],
        },
      },
      {
        label: { en: "Listening", es: "Escuchando" },
        body: {
          en: [
            "Caterina Barbieri's last record on repeat in the late hours.",
            "An unreleased ambient sketch from a friend, recorded inside an empty church in Sicily.",
          ],
          es: [
            "El último disco de Caterina Barbieri en bucle en las horas tardías.",
            "Un boceto ambient inédito de un amigo, grabado dentro de una iglesia vacía en Sicilia.",
          ],
        },
      },
      {
        label: { en: "Observing", es: "Observando" },
        body: {
          en: [
            "A small restaurant in Cádiz that has refused to put its menu online for fifteen years and still has a six-week waitlist. There is a brief in that.",
            "How a single material — bronze, here — can hold a room together when nothing else agrees.",
          ],
          es: [
            "Un pequeño restaurante en Cádiz que lleva quince años negándose a poner su carta online y sigue con seis semanas de lista de espera. Hay un brief en eso.",
            "Cómo un solo material — bronce, aquí — puede sostener una habitación cuando nada más se pone de acuerdo.",
          ],
        },
      },
    ],
  },
];

const ui = {
  en: {
    eyebrow: "Now",
    h1a: "Currently in",
    h1b: "the studio.",
    lead: "A short note from inside Xnlab Studio. What we are working on, reading, listening to and observing — updated when there is something worth saying.",
    updated: "Last update",
    back: "← Home",
    cta: "Reach out",
  },
  es: {
    eyebrow: "Ahora",
    h1a: "Actualmente en",
    h1b: "el estudio.",
    lead: "Una nota breve desde dentro de Xnlab Studio. En qué trabajamos, qué leemos, qué escuchamos y qué observamos — actualizado cuando hay algo que valga la pena decir.",
    updated: "Última actualización",
    back: "← Inicio",
    cta: "Escríbenos",
  },
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

function formatDate(iso: string, lang: "en" | "es") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Now() {
  const [lang, setLang] = useLang();
  const t = ui[lang];
  const latest = entries[0];

  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "#060606",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
        position: "relative",
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
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(48px,7vw,96px)",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.05} />
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
          <p style={{ marginTop: "clamp(28px,3.5vw,44px)", fontSize: "clamp(1rem,1.3vw,1.18rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.7)", fontWeight: 300, maxWidth: 720, textShadow: ts }}>
            {t.lead}
          </p>
        </R>
        <R delay={0.45}>
          <p style={{ marginTop: "clamp(24px,3vw,40px)", fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            {t.updated} · {formatDate(latest.date, lang)}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(72px,10vw,140px)", maxWidth: 1120, margin: "0 auto" }}>
        {latest.sections.map((s, i) => (
          <R key={s.label.en} delay={0.04 * i}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(40px,5vw,72px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(160px,220px)_1fr]"
            >
              <p style={labelStyle}>{s.label[lang]}</p>
              <div style={{ maxWidth: 720 }}>
                {s.body[lang].map((p, j) => (
                  <p
                    key={j}
                    style={{
                      marginBottom: j === s.body[lang].length - 1 ? 0 : "1.1em",
                      fontSize: "clamp(1.02rem,1.3vw,1.22rem)",
                      lineHeight: 1.72,
                      color: "rgba(255,255,255,0.78)",
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

      <section style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <R>
          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.7rem",
              padding: "0.95rem clamp(1.4rem,3vw,2.6rem)",
              fontSize: "clamp(10px,0.85vw,12px)",
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#060606",
              textDecoration: "none",
              background: "white",
              borderRadius: 100,
              transition: "background 0.4s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.88)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            {t.cta}
          </Link>
        </R>
      </section>
    </main>
  );
}
