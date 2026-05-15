"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { worlds } from "../_lib/worlds";

type Vignette = {
  worldSlug: typeof worlds[number]["slug"];
  title: { en: string; es: string };
  body: { en: string; es: string };
};

const vignettes: Vignette[] = [
  {
    worldSlug: "hospitality",
    title: { en: "The corridor before the room", es: "El pasillo antes de la habitación" },
    body: {
      en: "Wool underfoot. Light no brighter than a candle three rooms away. The wallpaper has been touched a thousand times and remembers each one. A guest who has not yet seen the room already knows how it will feel. The hotel has done its first work before anyone has spoken.",
      es: "Lana bajo los pies. Luz no más fuerte que una vela a tres habitaciones de distancia. El papel pintado ha sido tocado mil veces y recuerda cada una. Un huésped que aún no ha visto la habitación ya sabe cómo va a sentirse. El hotel ha hecho su primer trabajo antes de que nadie haya hablado.",
    },
  },
  {
    worldSlug: "nightlife",
    title: { en: "Three in the morning, second room", es: "Las tres de la mañana, segunda sala" },
    body: {
      en: "The bass has dropped two semitones since midnight. The smoke is no longer decoration — it is the air. Strangers are easier than they have been all year. The bouncer at the threshold did one thing perfectly: he decided this would be the kind of night you cannot describe tomorrow. He was right.",
      es: "El bajo ha bajado dos semitonos desde medianoche. El humo ya no es decoración — es el aire. Los desconocidos son más fáciles de lo que han sido en todo el año. El portero en el umbral hizo una cosa a la perfección: decidió que esta sería la clase de noche que mañana no podrás describir. Acertó.",
    },
  },
  {
    worldSlug: "lifestyle",
    title: { en: "Champagne paper, opened slowly", es: "Papel champán, abierto despacio" },
    body: {
      en: "There is one fold. Then another. The tissue inside has been pressed by a hand, not a machine. The bottle weighs more than it should. The label has been printed on the back so that when you tilt the glass, the brand reads itself to you in reverse. Restraint, made expensive.",
      es: "Hay un doblez. Después otro. El papel de seda interior ha sido prensado por una mano, no por una máquina. La botella pesa más de lo que debería. La etiqueta se ha impreso por detrás para que, al inclinar el vaso, la marca se lea a sí misma al revés. Contención, hecha cara.",
    },
  },
  {
    worldSlug: "architecture",
    title: { en: "Marble at the first light", es: "Mármol a primera luz" },
    body: {
      en: "Six in the morning. The stone has not yet been warmed by the day. The shadow of the column is a single dark line across the floor. There is no music, no voice, no movement. The room is doing its full work and asking nothing of you. Architecture, when good, is a room that does not need you.",
      es: "Las seis de la mañana. La piedra todavía no ha sido calentada por el día. La sombra de la columna es una sola línea oscura sobre el suelo. No hay música, no hay voz, no hay movimiento. La habitación está haciendo su trabajo completo y no te pide nada. La arquitectura, cuando es buena, es una habitación que no te necesita.",
    },
  },
  {
    worldSlug: "music",
    title: { en: "Last song of the album", es: "Última canción del álbum" },
    body: {
      en: "The reverb tail is longer than the song. The room where the record was made was old and small and could not be replaced. The artist who wrote the album never described what it was about and never had to. You drive home with it on and arrive at a different version of where you live.",
      es: "La cola de reverb es más larga que la canción. La habitación donde se grabó el disco era antigua y pequeña y no podía ser reemplazada. La artista que escribió el álbum nunca describió de qué iba y nunca tuvo que hacerlo. Conduces a casa con él puesto y llegas a una versión distinta del sitio donde vives.",
    },
  },
  {
    worldSlug: "digital",
    title: { en: "An interface that refracts", es: "Una interfaz que refracta" },
    body: {
      en: "The cursor leaves a fragment behind it. The page reorders itself slightly each time it is opened. The brand has not chosen a single typeface — it lets the system pick from a small family, and the choice becomes a signature. Identity here is not a logo. It is a behaviour you can recognise in the dark.",
      es: "El cursor deja un fragmento detrás de sí. La página se reordena ligeramente cada vez que se abre. La marca no ha elegido una sola tipografía — deja que el sistema elija dentro de una familia pequeña, y la elección se convierte en firma. La identidad aquí no es un logo. Es un comportamiento que puedes reconocer en la oscuridad.",
    },
  },
];

const en = {
  eyebrow: "Atmospheres · 001",
  h1a: "Sensory notes",
  h1b: "from the laboratory.",
  lead: "Six snapshots from the rooms, the hours and the surfaces we design. Not case studies. Not promises. Atmospheres, written down.",
  closing: "These are the moments we work for. We will know we have succeeded when one of them describes your project.",
  cta: "Bring us your atmosphere",
  back: "← Home",
  world: "World",
};

const es = {
  eyebrow: "Atmósferas · 001",
  h1a: "Notas sensoriales",
  h1b: "del laboratorio.",
  lead: "Seis instantáneas de las habitaciones, las horas y las superficies que diseñamos. No son case studies. No son promesas. Atmósferas, escritas.",
  closing: "Estos son los momentos para los que trabajamos. Sabremos que hemos tenido éxito cuando uno de ellos describa tu proyecto.",
  cta: "Tráenos tu atmósfera",
  back: "← Inicio",
  world: "Mundo",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

export default function Atmospheres() {
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
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(56px,8vw,100px)",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Dust count={10} opacity={0.06} />
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
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(72px,10vw,140px)", maxWidth: 1120, margin: "0 auto" }}>
        {vignettes.map((v, i) => {
          const world = worlds.find((w) => w.slug === v.worldSlug)!;
          return (
            <motion.article
              key={v.worldSlug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(48px,6vw,88px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(160px,220px)_1fr]"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: world.color.hex,
                  }}
                >
                  {t.world} {world.number} · {world.color.name}
                </p>
                <Link
                  href={`/worlds/${world.slug}`}
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  {world.title[lang]} →
                </Link>
              </div>
              <div style={{ maxWidth: 720 }}>
                <h2
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(1.6rem,2.8vw,2.6rem)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.015em",
                    color: "white",
                    textShadow: tsS,
                    marginBottom: "clamp(20px,2.5vw,32px)",
                  }}
                >
                  {v.title[lang]}
                </h2>
                <p
                  style={{
                    fontSize: "clamp(1.05rem,1.35vw,1.22rem)",
                    lineHeight: 1.78,
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 300,
                  }}
                >
                  {v.body[lang]}
                </p>
              </div>
            </motion.article>
          );
        })}
      </section>

      <section style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <R>
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "clamp(1.5rem,3vw,2.6rem)",
              lineHeight: 1.25,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 880,
              margin: "0 auto clamp(28px,3.5vw,44px)",
              textShadow: tsS,
            }}
          >
            {t.closing}
          </p>
        </R>
        <R delay={0.15}>
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
