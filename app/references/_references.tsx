"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";

type Ref = {
  category: { en: string; es: string };
  name: string;
  by?: string;
  meta?: string;
  note: { en: string; es: string };
};

const refs: Ref[] = [
  {
    category: { en: "Book", es: "Libro" },
    name: "In Praise of Shadows",
    by: "Junichiro Tanizaki",
    meta: "1933",
    note: {
      en: "On the dignity of darkness, lacquer, and rooms that breathe slowly. The closest a book comes to the studio's tone.",
      es: "Sobre la dignidad de la oscuridad, la laca y las habitaciones que respiran despacio. El libro más cercano al tono del estudio.",
    },
  },
  {
    category: { en: "Architect", es: "Arquitecto" },
    name: "Peter Zumthor",
    meta: "Switzerland",
    note: {
      en: "The Thermes at Vals taught us that a material can be a sentence. Atmosphere as the primary medium.",
      es: "Las termas de Vals nos enseñaron que un material puede ser una frase. La atmósfera como medio primario.",
    },
  },
  {
    category: { en: "Architect", es: "Arquitecto" },
    name: "John Pawson",
    meta: "UK",
    note: {
      en: "Permission to remove everything until only the necessary remains — and then to remove a little more.",
      es: "Permiso para quitar todo hasta que quede solo lo necesario — y luego quitar un poco más.",
    },
  },
  {
    category: { en: "Film", es: "Cine" },
    name: "In the Mood for Love",
    by: "Wong Kar-wai",
    meta: "2000",
    note: {
      en: "The discipline of restraint at 24 frames per second. Every gesture a system, every silence a paragraph.",
      es: "La disciplina de la contención a 24 cuadros por segundo. Cada gesto un sistema, cada silencio un párrafo.",
    },
  },
  {
    category: { en: "Film", es: "Cine" },
    name: "Stalker",
    by: "Andrei Tarkovsky",
    meta: "1979",
    note: {
      en: "On waiting, on weather inside a frame, on rooms that change you. A masterclass in atmosphere as architecture.",
      es: "Sobre la espera, sobre el clima dentro de un encuadre, sobre habitaciones que te cambian. Una clase magistral de atmósfera como arquitectura.",
    },
  },
  {
    category: { en: "Hotel", es: "Hotel" },
    name: "Aman",
    meta: "Global",
    note: {
      en: "How a hospitality system can be the same idea — silence, ritual, restraint — translated across thirty very different rooms.",
      es: "Cómo un sistema de hospitalidad puede ser la misma idea — silencio, ritual, contención — traducida a treinta habitaciones muy distintas.",
    },
  },
  {
    category: { en: "Artist", es: "Artista" },
    name: "James Turrell",
    meta: "USA",
    note: {
      en: "The work is the light, not the object. We design rooms with the same logic.",
      es: "La obra es la luz, no el objeto. Diseñamos espacios con la misma lógica.",
    },
  },
  {
    category: { en: "Artist", es: "Artista" },
    name: "Hiroshi Sugimoto",
    meta: "Japan",
    note: {
      en: "Long exposures of empty theatres. A study in how presence accumulates over time without anyone present.",
      es: "Largas exposiciones de teatros vacíos. Un estudio sobre cómo la presencia se acumula con el tiempo sin que nadie esté presente.",
    },
  },
  {
    category: { en: "Perfumer", es: "Perfumista" },
    name: "Comme des Garçons Parfums",
    meta: "Japan / France",
    note: {
      en: "Perfumes as concepts (tar, incense, copper). Permission to make a building smell like an idea.",
      es: "Perfumes como conceptos (alquitrán, incienso, cobre). Permiso para hacer que un edificio huela a una idea.",
    },
  },
  {
    category: { en: "Designer", es: "Diseñador" },
    name: "Phoebe Philo at Céline",
    meta: "2008–2018",
    note: {
      en: "A complete brand world built on restraint, weight and quiet. The model for how a system can feel inevitable.",
      es: "Un mundo de marca completo construido sobre contención, peso y calma. El modelo de cómo un sistema puede sentirse inevitable.",
    },
  },
  {
    category: { en: "Book", es: "Libro" },
    name: "The Poetics of Space",
    by: "Gaston Bachelard",
    meta: "1957",
    note: {
      en: "On corners, drawers, attics — the architecture of intimacy. Required reading for anyone designing rooms people remember.",
      es: "Sobre rincones, cajones, áticos — la arquitectura de la intimidad. Lectura obligada para cualquiera que diseñe espacios que se recuerden.",
    },
  },
  {
    category: { en: "Director", es: "Director" },
    name: "Roger Deakins",
    meta: "Cinematographer",
    note: {
      en: "Light treated as material. A lesson for everyone who works in three dimensions, not only film.",
      es: "La luz tratada como material. Una lección para todo el que trabaja en tres dimensiones, no solo en cine.",
    },
  },
];

const en = {
  eyebrow: "Library · 001",
  h1a: "What informs",
  h1b: "the work.",
  lead:
    "Not a portfolio of references — a small library of the books, architects, films, hotels and makers we return to. Read as a map of the studio's interior.",
  closing: "These names do not represent our work. They feed it.",
  back: "← Home",
};

const es = {
  eyebrow: "Biblioteca · 001",
  h1a: "Lo que informa",
  h1b: "el trabajo.",
  lead:
    "No es un portfolio de referencias — es una pequeña biblioteca de los libros, arquitectos, películas, hoteles y autores a los que volvemos. Léelo como un mapa del interior del estudio.",
  closing: "Estos nombres no representan nuestro trabajo. Lo alimentan.",
  back: "← Inicio",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function References() {
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
        <nav style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 clamp(20px,5vw,56px)" }}>
          <WordmarkLink />
          <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{t.back}</Link>
          <button onClick={() => setLang(lang === "en" ? "es" : "en")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
          </button>
        </nav>
      </header>

      <section style={{ position: "relative", padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(56px,8vw,96px)", maxWidth: 1120, margin: "0 auto" }}>
        <Dust count={8} opacity={0.06} />
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
        {refs.map((r, i) => (
          <R key={r.name} delay={0.03 * i}>
            <article
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(20px,3vw,40px)",
                padding: "clamp(28px,3.5vw,52px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={labelStyle}>{r.category[lang]}</p>
                {r.meta && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{r.meta}</p>
                )}
              </div>
              <div style={{ maxWidth: 720 }}>
                <h2
                  style={{
                    fontSize: "clamp(1.4rem,2.4vw,2.2rem)",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "white",
                    textShadow: tsS,
                    marginBottom: r.by ? 6 : "clamp(14px,1.6vw,22px)",
                  }}
                >
                  {r.name}
                </h2>
                {r.by && (
                  <p
                    style={{
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: "clamp(1.05rem,1.4vw,1.3rem)",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: "clamp(14px,1.6vw,22px)",
                    }}
                  >
                    {r.by}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "clamp(0.98rem,1.2vw,1.12rem)",
                    lineHeight: 1.72,
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 300,
                  }}
                >
                  {r.note[lang]}
                </p>
              </div>
            </article>
          </R>
        ))}
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
              margin: "0 auto",
              textShadow: tsS,
            }}
          >
            {t.closing}
          </p>
        </R>
      </section>
    </main>
  );
}
