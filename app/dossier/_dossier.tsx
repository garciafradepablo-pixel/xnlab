"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ts, tsS, serif, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { requestDossier } from "./actions";
import { SiteFooter } from "../_lib/site-footer";

// ---------------------------------------------------------------
// Copy — EN / ES
// The dossier is built from the same vocabulary as the rest of the
// site, condensed into the register a partner would read in a private
// memo. Translation favours meaning over lexical mirror — see AGENTS.md.
// ---------------------------------------------------------------

const en = {
  back: "← Home",
  gate: {
    eyebrow: "Studio dossier · MMXXVI",
    h1a: "A short document.",
    h1b: "Sent by the studio.",
    lead:
      "How the studio operates, the six surfaces we work across, the position on AI, the discovery protocol. Released as a private read for visitors considering an engagement. The first cycle of MMXXVI is open. Cycles close at six brands.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    submit: "Request the dossier",
    sending: "Sending…",
    fineprint:
      "We send the dossier to your inbox and you read it here, in the studio's voice. No newsletter. studio@xnlab.io receives a copy.",
    errors: {
      validation: "Please enter a valid email.",
      rate: "The studio has already received this request. Try again in a moment.",
      send: "Connection to the studio failed. Write to studio@xnlab.io instead.",
    },
  },
  unlocked: {
    badge: "Unlocked",
    confirm: "A copy has been sent to your inbox.",
  },
  doc: {
    cover: {
      meta: "XNLAB · STUDIO DOSSIER",
      cycle: "Cycle MMXXVI",
      sub: "In Selection",
    },
    sections: [
      {
        num: "I",
        title: "The studio",
        body: [
          "XNLAB is an anonymous atelier founded in MMXXII. We design the atmosphere between a brand and its customer — the part of the work that is no longer content and not yet operations, and that decides whether a brand is recognised or remembered.",
          "Six brands per cycle. Twelve-month windows. No pitches, no RFPs, no competitive tenders. Engagements begin by invitation after a forty-five minute discovery extended by the studio.",
        ],
      },
      {
        num: "II",
        title: "The thesis",
        body: [
          "At the scale our clients operate at, reach is solved. Millions of customers, hundreds of touchpoints, six or seven owned surfaces. The next move is no longer about being seen. It is about being inevitable.",
          "Brands stop being recognised when the surfaces stop sounding like the same hand. The product opens with one tempo. The store opens with another. The support email speaks in a third voice. Each surface is competent in isolation. None of them compound.",
          "Atmosphere is what compounds them. Calibrated across the six surfaces a modern company reaches its customer through, it turns reach into memory.",
        ],
      },
      {
        num: "III",
        title: "The six surfaces",
        intro:
          "A modern brand touches its customer in six places, each with its own physics. We direct all six as one operating system.",
        surfaces: [
          {
            n: "01",
            name: "Product",
            note: "The app, hardware, software. The first sentence the brand speaks, every day. Sustained warmth, daily contact.",
          },
          {
            n: "02",
            name: "Owned Digital",
            note: "Web, marketing site, account, dashboard. Surfaces the customer chose to look at. Considered reading, patient return.",
          },
          {
            n: "03",
            name: "Retail & Physical",
            note: "Stores, branches, pop-ups, events. Threshold, light, material, sound. The brand at full body weight.",
          },
          {
            n: "04",
            name: "Customer Operations",
            note: "Onboarding, support, post-sale. The brand judged where the marketing cannot reach. The atmosphere of being answered, not handled.",
          },
          {
            n: "05",
            name: "Communication",
            note: "Paid, owned, earned. Authority that earns the next read instead of demanding it.",
          },
          {
            n: "06",
            name: "Community & Culture",
            note: "Partnerships, programs, advocacy. The brand carried by rooms it does not own.",
          },
        ],
      },
      {
        num: "IV",
        title: "The six systems",
        intro:
          "Six instruments we deploy across the six surfaces. Each is a focused intervention; together, the operating spine of a brand built to be remembered.",
        systems: [
          {
            n: "01",
            name: "Atmosphere Systems",
            note: "Light, sound, material, motion and pacing, directed as one operating system across product, screen and room.",
          },
          {
            n: "02",
            name: "Cultural Presence",
            note: "The conditions that turn a brand from a sender into a cultural reference.",
          },
          {
            n: "03",
            name: "Experiential Identity",
            note: "Identity engineered for what the customer does, not for what they read.",
          },
          {
            n: "04",
            name: "Digital Amplification",
            note: "Surfaces and editorial pacing that carry the brand's atmosphere into search, social and press.",
          },
          {
            n: "05",
            name: "Brand Worldbuilding",
            note: "Universe design across products, channels, territories and partners, held by one creative spine.",
          },
          {
            n: "06",
            name: "Brand Perception Audit",
            note: "Audit, diagnosis and re-direction for brands whose scale has outpaced their presence.",
          },
        ],
      },
      {
        num: "V",
        title: "On AI",
        body: [
          "AI has made the cost of producing visual content collapse. It has not made the cost of producing memorable visual content collapse. The two are not the same thing, and the premium category is the first to feel the difference.",
          "We treat the model as a production crew run by a director, not as a content factory. The studio sets the world — palette, atmosphere, copy register, motion language, what the brand will not do. The AI extends that world across the formats the brand could not otherwise reach.",
          "This is the position we take into MMXXVI and beyond: the studio extended by the model under a discipline the model alone cannot supply. As the next category of intelligent systems arrives — agentic, embodied, ambient — the same rule applies. Direction is the scarce resource. We are the direction.",
        ],
      },
      {
        num: "VI",
        title: "How an engagement begins",
        body: [
          "Discoveries are extended by the studio, not requested. Forty-five minutes, by invitation, recorded by the studio and never published. If we both recognise the work, a partner-signed proposal follows within seven days.",
          "Most new conversations arrive through an existing brand. A CEO, a CMO, a founder, a programme director. A line of context — who pointed you, what you have read of ours — helps the studio reply with weight.",
        ],
      },
      {
        num: "VII",
        title: "We do not work with",
        list: [
          "Brands whose primary logic is volume or commodity pricing.",
          "Categories that cannot be addressed in long form — crypto, gambling, fast fashion.",
          "Briefs framed as RFPs, pitches or competitive tenders.",
        ],
      },
      {
        num: "VIII",
        title: "Cycle MMXXVI",
        kvs: [
          ["Capacity", "Six brands per cycle"],
          ["Remaining", "One place"],
          ["Entry", "By appointment"],
        ],
      },
    ],
    closing: {
      lineA: "Reach the studio.",
      lineB: "studio@xnlab.io",
      cta: "Write a full message",
      sig: "— XNLAB · MMXXVI",
    },
  },
};

const es = {
  back: "← Inicio",
  gate: {
    eyebrow: "Dossier del estudio · MMXXVI",
    h1a: "Un documento corto.",
    h1b: "Lo envía el estudio.",
    lead:
      "Cómo opera el estudio, las seis superficies en las que trabajamos, la posición sobre IA, el protocolo de discovery. Se entrega como lectura privada a quienes consideran abrir un encargo. El primer ciclo de MMXXVI está abierto. Los ciclos cierran a seis marcas.",
    emailLabel: "Email",
    emailPlaceholder: "tu@empresa.com",
    submit: "Pedir el dossier",
    sending: "Enviando…",
    fineprint:
      "Te enviamos el dossier al inbox y lo lees aquí, en la voz del estudio. No es newsletter. studio@xnlab.io recibe una copia.",
    errors: {
      validation: "Introduce un email válido.",
      rate: "El estudio ya ha recibido esta petición. Vuelve a probar en un momento.",
      send: "La conexión con el estudio ha fallado. Escribe a studio@xnlab.io.",
    },
  },
  unlocked: {
    badge: "Abierto",
    confirm: "Se ha enviado una copia a tu inbox.",
  },
  doc: {
    cover: {
      meta: "XNLAB · DOSSIER DEL ESTUDIO",
      cycle: "Ciclo MMXXVI",
      sub: "En selección",
    },
    sections: [
      {
        num: "I",
        title: "El estudio",
        body: [
          "XNLAB es un atelier anónimo fundado en MMXXII. Diseñamos la atmósfera entre una marca y su cliente — la parte del trabajo que ya no es contenido y que aún no es operaciones, y que decide si una marca se reconoce o se recuerda.",
          "Seis marcas por ciclo. Ventanas de doce meses. Sin pitches, sin RFPs, sin concursos. Los encargos se abren por invitación tras un discovery de cuarenta y cinco minutos que extiende el estudio.",
        ],
      },
      {
        num: "II",
        title: "La tesis",
        body: [
          "A la escala a la que operan nuestros clientes, el alcance está resuelto. Millones de clientes, cientos de touchpoints, seis o siete superficies propias. El siguiente movimiento ya no consiste en ser visto. Consiste en volverse inevitable.",
          "Las marcas dejan de reconocerse cuando sus superficies dejan de sonar a la misma mano. El producto abre con un tempo. La tienda abre con otro. El email de soporte habla con una tercera voz. Cada superficie es competente por separado. Ninguna compone con las demás.",
          "La atmósfera es lo que las compone. Calibrada en las seis superficies por las que una empresa moderna toca a su cliente, convierte el alcance en memoria.",
        ],
      },
      {
        num: "III",
        title: "Las seis superficies",
        intro:
          "Una marca moderna toca a su cliente en seis lugares, cada uno con su propia física. Dirigimos los seis como un solo sistema operativo.",
        surfaces: [
          {
            n: "01",
            name: "Producto",
            note: "App, hardware, software. La primera frase que la marca pronuncia cada día. Calidez sostenida, contacto diario.",
          },
          {
            n: "02",
            name: "Digital Propio",
            note: "Web, sitio editorial, cuenta, dashboard. Superficies a las que el cliente decidió mirar. Lectura considerada, regreso paciente.",
          },
          {
            n: "03",
            name: "Retail y Físico",
            note: "Tiendas, sucursales, pop-ups, eventos. Umbral, luz, material, sonido. La marca con su peso completo encima.",
          },
          {
            n: "04",
            name: "Operaciones de Cliente",
            note: "Onboarding, soporte, postventa. La marca juzgada donde el marketing no llega. La atmósfera de ser respondido, no procesado.",
          },
          {
            n: "05",
            name: "Comunicación",
            note: "Pagado, propio, ganado. Autoridad que se gana la siguiente lectura en vez de exigirla.",
          },
          {
            n: "06",
            name: "Comunidad y Cultura",
            note: "Partnerships, programas, advocacy. La marca sostenida por salas que no le pertenecen.",
          },
        ],
      },
      {
        num: "IV",
        title: "Los seis sistemas",
        intro:
          "Seis instrumentos que desplegamos sobre las seis superficies. Cada uno una intervención enfocada; juntos, la columna operativa de una marca construida para ser recordada.",
        systems: [
          {
            n: "01",
            name: "Sistemas de Atmósfera",
            note: "Luz, sonido, material, animación y ritmo, dirigidos como un solo sistema operativo entre producto, pantalla y sala.",
          },
          {
            n: "02",
            name: "Presencia Cultural",
            note: "Las condiciones que convierten a una marca emisora en referencia cultural.",
          },
          {
            n: "03",
            name: "Identidad Experiencial",
            note: "Identidad construida para lo que el cliente hace, no para lo que lee.",
          },
          {
            n: "04",
            name: "Amplificación Digital",
            note: "Superficies y ritmo editorial que llevan la atmósfera de la marca a la búsqueda, las redes y la prensa.",
          },
          {
            n: "05",
            name: "Brand Worldbuilding",
            note: "Diseño de universo a través de productos, canales, territorios y socios, sostenido por una sola columna creativa.",
          },
          {
            n: "06",
            name: "Auditoría de Percepción de Marca",
            note: "Auditoría, diagnóstico y re-dirección para marcas cuya escala se ha adelantado a su presencia.",
          },
        ],
      },
      {
        num: "V",
        title: "Sobre IA",
        body: [
          "La IA ha hundido el coste de producir contenido visual. No ha hundido el coste de producir contenido visual memorable. No son lo mismo, y la categoría premium es la primera en notar la diferencia.",
          "Tratamos al modelo como un equipo de producción a las órdenes de un director, no como una fábrica de contenido. El estudio fija el mundo — paleta, atmósfera, registro de copy, lenguaje de animación, lo que la marca no hará. La IA extiende ese mundo a los formatos a los que la marca no podría llegar de otra manera.",
          "Esta es la posición con la que entramos en MMXXVI y más allá: el estudio extendido por el modelo bajo una disciplina que el modelo por sí solo no puede aportar. Cuando llegue la siguiente categoría de sistemas inteligentes — agéntica, encarnada, ambiental — la regla se mantiene. La dirección es el recurso escaso. Nosotros somos la dirección.",
        ],
      },
      {
        num: "VI",
        title: "Cómo se abre un encargo",
        body: [
          "El discovery lo extiende el estudio, no se solicita. Cuarenta y cinco minutos, por invitación, grabado por el estudio y nunca publicado. Si los dos reconocemos el trabajo, llega una propuesta firmada por un socio en siete días.",
          "La mayoría de conversaciones nuevas llegan por recomendación de una marca activa. Un CEO, un CMO, un fundador, un director de programa. Una línea de contexto — quién te apuntó, qué has leído nuestro — ayuda al estudio a responder con peso.",
        ],
      },
      {
        num: "VII",
        title: "No trabajamos con",
        list: [
          "Marcas cuya lógica principal es el volumen o el precio commodity.",
          "Categorías que no pueden dirigirse en formato largo — cripto, juego online, fast fashion.",
          "Encargos planteados como RFPs, pitches o concursos.",
        ],
      },
      {
        num: "VIII",
        title: "Ciclo MMXXVI",
        kvs: [
          ["Capacidad", "Seis marcas por ciclo"],
          ["Disponible", "Una plaza"],
          ["Entrada", "Por cita previa"],
        ],
      },
    ],
    closing: {
      lineA: "Escribe al estudio.",
      lineB: "studio@xnlab.io",
      cta: "Escribir un mensaje completo",
      sig: "— XNLAB · MMXXVI",
    },
  },
};

type Lang = "en" | "es";
type Copy = typeof en;

// Section discriminator helpers — sections vary in shape (body / list /
// surfaces / systems / kvs). Keeping the union narrow keeps the render
// site simple and lint-clean.
type Section = Copy["doc"]["sections"][number];
type SurfaceSection = Extract<Section, { surfaces: unknown }>;
type SystemSection = Extract<Section, { systems: unknown }>;
type BodySection = Extract<Section, { body: unknown }>;
type ListSection = Extract<Section, { list: unknown }>;
type KvsSection = Extract<Section, { kvs: unknown }>;

const STORAGE_KEY = "xn-dossier-unlocked";

// useSyncExternalStore helpers — server snapshot is always `false` (no
// sessionStorage on the server), client snapshot reads the gate flag.
// No subscription needed: the value only flips via setExplicitUnlocked
// during submit, never from an external source.
const subscribeNoop = () => () => {};
const getPersistedUnlocked = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};
const getPersistedUnlockedServer = () => false;

export default function Dossier() {
  const [lang, setLang] = useLang();
  const t: Copy = lang === "en" ? en : es;
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explicitUnlocked, setExplicitUnlocked] = useState(false);
  const [confirmShown, setConfirmShown] = useState(false);

  // Restore prior unlock so repeat visits skip the gate. Session storage,
  // not localStorage — the dossier is a per-session courtesy, not a
  // permanent entitlement. The read happens via useSyncExternalStore so
  // server renders the gate (false) and the client transitions cleanly
  // to the unlocked state without a setState-in-effect cascade.
  const persistedUnlocked = useSyncExternalStore(
    subscribeNoop,
    getPersistedUnlocked,
    getPersistedUnlockedServer,
  );
  const unlocked = persistedUnlocked || explicitUnlocked;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await requestDossier({ email, lang });
      if (result.ok) {
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        setExplicitUnlocked(true);
        setConfirmShown(true);
        return;
      }
      if (result.reason === "validation") setError(t.gate.errors.validation);
      else if (result.reason === "rate_limited") setError(t.gate.errors.rate);
      else setError(t.gate.errors.send);
    } catch {
      setError(t.gate.errors.send);
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
      <DossierHeader lang={lang} setLang={setLang} t={t} />

      <AnimatePresence mode="wait">
        {!unlocked ? (
          <Gate
            key="gate"
            t={t}
            email={email}
            setEmail={setEmail}
            sending={sending}
            error={error}
            onSubmit={onSubmit}
          />
        ) : (
          <Document key="doc" t={t} confirmShown={confirmShown} />
        )}
      </AnimatePresence>
        <SiteFooter lang={lang} />
    </main>
  );
}

function DossierHeader({
  lang,
  setLang,
  t,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Copy;
}) {
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
  );
}

function Gate({
  t,
  email,
  setEmail,
  sending,
  error,
  onSubmit,
}: {
  t: Copy;
  email: string;
  setEmail: (v: string) => void;
  sending: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.38em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
    marginBottom: 4,
  };
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(80px,10vw,140px)",
        maxWidth: 880,
        margin: "0 auto",
      }}
    >
      <Dust count={8} opacity={0.06} />
      <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>
        {t.gate.eyebrow}
      </p>
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
          margin: 0,
        }}
      >
        <span>{t.gate.h1a}</span>
        <span
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.7)",
            fontSize: "1.2em",
          }}
        >
          {t.gate.h1b}
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
          {t.gate.lead}
        </p>
      </R>

      <form onSubmit={onSubmit} noValidate style={{ marginTop: "clamp(40px,5vw,72px)" }}>
        <R delay={0.3}>
          <label htmlFor="dossier-email" style={labelStyle}>
            {t.gate.emailLabel}
          </label>
          <input
            id="dossier-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.gate.emailPlaceholder}
            autoComplete="email"
            required
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)")}
          />
        </R>

        <R delay={0.4}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "clamp(20px,3vw,40px)",
              flexWrap: "wrap",
              marginTop: "clamp(28px,3vw,40px)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.42)",
                maxWidth: 460,
                margin: 0,
              }}
            >
              {t.gate.fineprint}
            </p>
            <motion.button
              type="submit"
              disabled={sending || !email}
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
                cursor: sending || !email ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                opacity: sending || !email ? 0.55 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {sending ? t.gate.sending : t.gate.submit}
            </motion.button>
          </div>
        </R>

        {error && (
          <motion.p
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              marginTop: 20,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,150,120,0.85)",
            }}
          >
            {error}
          </motion.p>
        )}
      </form>
    </motion.section>
  );
}

function Document({ t, confirmShown }: { t: Copy; confirmShown: boolean }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        padding: "clamp(120px,16vh,180px) clamp(24px,7vw,96px) clamp(80px,10vw,140px)",
        maxWidth: 880,
        margin: "0 auto",
      }}
    >
      {confirmShown && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          role="status"
          aria-live="polite"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "0.45rem 0.9rem",
            border: "1px solid rgba(232,183,131,0.5)",
            borderRadius: 999,
            background: "rgba(232,183,131,0.06)",
            color: "rgba(232,183,131,0.92)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            marginBottom: "clamp(24px,3vw,36px)",
          }}
        >
          <span aria-hidden style={{ display: "flex", width: 6, height: 6, borderRadius: 999, background: "#e8b783" }} />
          {t.unlocked.badge} · {t.unlocked.confirm}
        </motion.div>
      )}

      {/* Cover */}
      <div
        style={{
          borderTop: "1px solid rgba(232,183,131,0.25)",
          borderBottom: "1px solid rgba(232,183,131,0.25)",
          padding: "clamp(28px,3vw,40px) 0",
          marginBottom: "clamp(40px,5vw,72px)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(232,183,131,0.85)",
            marginBottom: 14,
          }}
        >
          {t.doc.cover.meta}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(1.8rem,3.2vw,3.2rem)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "white",
            textShadow: tsS,
          }}
        >
          {t.doc.cover.cycle}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: "clamp(0.9rem,1.05vw,1rem)",
            color: "rgba(255,255,255,0.55)",
            fontWeight: 300,
          }}
        >
          {t.doc.cover.sub}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(40px,5vw,72px)" }}>
        {t.doc.sections.map((s) => (
          <SectionBlock key={s.num} section={s} />
        ))}
      </div>

      {/* Closing — single CTA, no stacking. No hard divider; the
          AmbientBackdrop carries the transition. */}
      <div
        style={{
          marginTop: "clamp(56px,7vw,96px)",
          paddingTop: "clamp(28px,3vw,40px)",
          textAlign: "left",
        }}
      >
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(1.4rem,2.2vw,2rem)",
            lineHeight: 1.15,
            color: "white",
            margin: 0,
            textShadow: tsS,
          }}
        >
          {t.doc.closing.lineA}
        </p>
        <a
          href="mailto:studio@xnlab.io"
          style={{
            display: "inline-block",
            marginTop: 12,
            fontSize: "clamp(1.05rem,1.3vw,1.18rem)",
            color: "rgba(232,183,131,0.92)",
            textDecoration: "none",
            letterSpacing: "0.02em",
            borderBottom: "1px solid rgba(232,183,131,0.45)",
            paddingBottom: 2,
          }}
        >
          {t.doc.closing.lineB}
        </a>

        <div
          style={{
            marginTop: "clamp(32px,4vw,48px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "0.85rem 1.6rem",
              fontSize: "clamp(10px,0.85vw,12px)",
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#060606",
              background: "white",
              border: "none",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            {t.doc.closing.cta}
            <span aria-hidden style={{ fontSize: 14 }}>→</span>
          </Link>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {t.doc.closing.sig}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

function SectionBlock({ section }: { section: Section }) {
  return (
    <article>
      <header style={{ marginBottom: "clamp(16px,2vw,24px)" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(232,183,131,0.75)",
            marginRight: 12,
          }}
        >
          {section.num}
        </span>
        <h2
          style={{
            display: "inline",
            fontSize: "clamp(1.2rem,1.8vw,1.6rem)",
            fontWeight: 400,
            letterSpacing: "-0.015em",
            color: "white",
            margin: 0,
          }}
        >
          {section.title}
        </h2>
      </header>

      {"body" in section &&
        (section as BodySection).body.map((p: string, i: number) => (
          <p
            key={i}
            style={{
              fontSize: "clamp(0.98rem,1.18vw,1.08rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.78)",
              fontWeight: 300,
              margin: "0 0 14px",
              maxWidth: 720,
            }}
          >
            {p}
          </p>
        ))}

      {"intro" in section && section.intro && (
        <p
          style={{
            fontSize: "clamp(0.96rem,1.15vw,1.05rem)",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.66)",
            fontWeight: 300,
            margin: "0 0 22px",
            maxWidth: 720,
          }}
        >
          {section.intro}
        </p>
      )}

      {"surfaces" in section && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(section as SurfaceSection).surfaces.map(
            (s: { n: string; name: string; note: string }) => (
              <SurfaceOrSystemRow key={s.n} n={s.n} name={s.name} note={s.note} />
            ),
          )}
        </ul>
      )}

      {"systems" in section && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(section as SystemSection).systems.map(
            (s: { n: string; name: string; note: string }) => (
              <SurfaceOrSystemRow key={s.n} n={s.n} name={s.name} note={s.note} />
            ),
          )}
        </ul>
      )}

      {"list" in section && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {(section as ListSection).list.map((line: string, i: number) => (
            <li
              key={i}
              style={{
                position: "relative",
                padding: "10px 0 10px 22px",
                fontSize: "clamp(0.94rem,1.12vw,1.04rem)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.78)",
                fontWeight: 300,
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
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
      )}

      {"kvs" in section && (
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            gap: "10px 28px",
            margin: 0,
            paddingTop: 6,
          }}
        >
          {(section as KvsSection).kvs.map((pair) => {
            const k = pair[0];
            const v = pair[1];
            return (
              <div key={k} style={{ display: "contents" }}>
                <dt
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {k}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontSize: "clamp(0.94rem,1.1vw,1.02rem)",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 300,
                  }}
                >
                  {v}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </article>
  );
}

function SurfaceOrSystemRow({ n, name, note }: { n: string; name: string; note: string }) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "48px 200px 1fr",
        gap: "clamp(12px,2vw,28px)",
        alignItems: "baseline",
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
      className="dossier-row"
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.34em",
          color: "rgba(232,183,131,0.7)",
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontSize: "clamp(0.98rem,1.18vw,1.08rem)",
          color: "white",
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: "clamp(0.92rem,1.08vw,1.02rem)",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.68)",
          fontWeight: 300,
        }}
      >
        {note}
      </span>
    </li>
  );
}
