"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ts, tsS, serif, W, R, Label, Dust, Commentary, useLang } from "../_lib/atoms";
import { Nav } from "../_lib/nav";
import { AtelierStar } from "../_lib/ornaments";
import { SiteFooter } from "../_lib/site-footer";

// /hospitality — applied vertical for premium hospitality founders.
// Path B (brand × customer × channel) stays canonical at /. This page
// is the dedicated room for hotel, restaurant, nightlife, wellness,
// cultural and immersive operators — the strategic atmosphere system
// expressed in the language they read in. AGENTS.md §8 honoured:
// hospitality is an applied vertical, not promoted back to the home.

const en = {
  // nav copy reuses the global keys
  nw: "Worlds",
  nse: "Systems",
  na: "Contact",

  // hero
  heroEyebrow: "Applied vertical · Hospitality · MMXXVI",
  heroH1a: "Atmosphere systems for",
  heroH1b: "modern hospitality.",
  heroStrap:
    "Hotels. Restaurants. Nightlife. Wellness. Cultural. Immersive. Six rooms, one studio.",
  heroStamp: "Cycle MMXXVI · One hospitality place remains. By appointment.",

  // 001 — the perception gap
  gapLabel: "001 — The perception gap",
  gapH1a: "Your room is full.",
  gapH1b: "Your image online is half a room below it.",
  gapIntro:
    "The hospitality operators we work with already win the room. The booking calendar is healthy. The reviews are kind. The press writes. The problem lives one layer up, in the gap between how the venue feels at the door and how it reads on a screen. That gap is what we close.",
  gapSymptoms: [
    "Your venue is full. Your reservation page reads like a calendar.",
    "Press writes about you. Your owned digital sounds like a chain.",
    "Your repeat rate is high. Word of mouth says the food, not the room.",
    "Your reviews praise specific dishes. None of them describes a feeling.",
    "Your social is consistent. The atmosphere across surfaces is not yet whole.",
    "You are remembered locally. You are not yet a cultural destination.",
  ],
  gapResolve:
    "What we resolve. The distance between filling a venue and being inevitable. Closed surface by surface, the venue stops competing for bookings and starts holding memory.",

  // 002 — why atmosphere becomes demand
  physicsLabel: "002 — The physics of demand",
  physicsH1a: "Hospitality competes",
  physicsH1b: "for memory.",
  physicsBody: [
    "Bookings follow memory. Memory follows atmosphere. A venue that earns a feeling earns a return.",
    "Atmosphere is the only surface that travels home with the guest. The wine list does not. The menu does not. The architecture does not. What the room felt like, does.",
    "When the atmosphere of the room and the atmosphere of the screen become the same atmosphere, demand stops being marketed and starts being remembered.",
  ],

  // 003 — the six rooms
  roomsLabel: "003 — Six rooms",
  roomsH1a: "Six rooms.",
  roomsH1b: "One studio.",
  roomsIntro:
    "Hospitality is six different rooms, each with its own gravity. The studio works across all six, calibrated to operator, hour and guest. Each room is its own atmosphere system. Together, they share one creative spine.",
  rooms: [
    {
      n: "01",
      anchor: "hotels",
      title: "Hotels & Resorts",
      atmosphere: "The room is the first sentence the brand speaks.",
      outcome:
        "When the threshold, corridor, room and terrace each carry their own beat, the guest is inside the brand before they have opened the door.",
    },
    {
      n: "02",
      anchor: "restaurants",
      title: "Restaurants & Bars",
      atmosphere: "The table is the second room of the restaurant.",
      outcome:
        "The first sightline does the work before the first dish arrives. The guest decides what the night will be before they have read the menu.",
    },
    {
      n: "03",
      anchor: "nightlife",
      title: "Nightlife Venues",
      atmosphere: "After midnight, the architecture is alive.",
      outcome:
        "Door, light cue, sound floor and staff register tuned for the seven-hour arc. The venue holds its shape from nine to four without a single decision left to chance.",
    },
    {
      n: "04",
      anchor: "wellness",
      title: "Wellness Destinations",
      atmosphere: "Silence is the primary service.",
      outcome:
        "Light filtered, sound dampened, palette quieted, typography unhurried. The guest remembers what the room did not ask of them.",
    },
    {
      n: "05",
      anchor: "cultural",
      title: "Cultural Hospitality",
      atmosphere: "Hospitality as the room next to the work.",
      outcome:
        "Museum cafes, gallery dining, library bars, residency programs. Materials echo the institution. The afternoon reads as one event, not two.",
    },
    {
      n: "06",
      anchor: "immersive",
      title: "Immersive & Experiential",
      atmosphere: "A room that means the same thing in seven cities.",
      outcome:
        "Pop-ups, residencies and traveling concepts engineered with a fixed core and a refractive surface. The concept reads as native in cities it has never visited.",
    },
  ],

  // 004 — the cycle
  cycleLabel: "Cycle MMXXVI",
  cycleH1a: "Six movements,",
  cycleH1b: "one cycle.",
  cycleIntro:
    "Every hospitality engagement moves through the same six beats. Directed, not project-managed. The studio carries the work. The operator decides at the points that decide.",
  cycleSteps: [
    {
      n: "I",
      title: "Fit & Scope",
      line: "The studio confirms the venue belongs in the cycle, the scope and the rhythm. No proposal is written until both sides recognise the work.",
    },
    {
      n: "II",
      title: "Diagnosis",
      line: "The perception gap is mapped. Threshold, corridor, room, table, screen. Where the venue is, where the guest reads it, where the two diverge.",
    },
    {
      n: "III",
      title: "Direction",
      line: "Atmosphere, register and tempo are presented. Direction is approved before a single surface is built.",
    },
    {
      n: "IV",
      title: "Build",
      line: "The agreed surfaces are produced under the studio's signature. Internal review checkpoints, no operator micromanagement.",
    },
    {
      n: "V",
      title: "Activation",
      line: "Opening, relaunch or seasonal pivot is directed. The venue enters the world with the atmosphere it was designed with.",
    },
    {
      n: "VI",
      title: "Tuning",
      line: "For eligible cycles, the studio stays through the first month. Behaviour is read. Light, sound and pace are tuned until the room breathes on its own.",
    },
  ],
  cycleClose:
    "Cycles are fixed-scope and partner-signed. Approvals on time keep the cycle moving.",

  // 005 — standing / cohort
  standingLabel: "002.5 — Cohort",
  standingH1a: "First hospitality cohort,",
  standingH1b: "open.",
  standingSub:
    "The studio has not yet published its hospitality engagements. Direction begins when the work is recognised. What we publish about a venue rests on its permission, not on ours.",
  standingNote:
    "Cycles close at six venues. We do not stretch the studio to make a seventh fit.",
  standingTrust:
    "New engagements arrive through introduction. The studio replies in writing, signed, within forty-eight hours.",
  ledgerLabel: "How the studio operates",
  ledger: [
    { l: "Minimum engagement", v: "Twelve weeks" },
    { l: "Retainer engagements", v: "Twelve to thirty-six months" },
    { l: "Currencies served", v: "EUR · USD · GBP" },
    { l: "Languages of operation", v: "EN · ES" },
    { l: "Studio response", v: "Forty-eight hours, signed by the studio" },
    { l: "Network", v: "Direction in-house · execution across a vetted network of specialists" },
  ],

  // 006 — flagship
  flagshipLabel: "Applied study · 001",
  flagshipEyebrow: "Hospitality Atmosphere Study",
  flagshipH1a: "Atmospheres",
  flagshipH1b: "designed to be remembered.",
  flagshipBody:
    "First applied piece from the laboratory. A study on how threshold, corridor, room and table compound into the emotional weight of a venue's physical surface. The full piece moves through Perception, Direction, System, Surfaces and Result.",
  flagshipCta: "Read the study",

  // 007 — selective close
  selectiveLabel: "Selectivity",
  selectiveBody: [
    "We accept a limited number of hospitality operators per cycle. Every engagement is selected.",
    "Briefs framed as RFPs, pitches or competitive tenders fall outside this practice. So do venues whose primary logic is volume or commodity pricing.",
  ],

  // closing
  closeH: "Write to the studio.",
  closeBody:
    "If you operate a hotel, restaurant, nightlife venue, wellness destination, cultural hospitality or immersive concept, and the next move is the one that turns reach into memory, we would like to hear about it.",
  closeCta: "Begin",
  back: "← Home",
};

const es = {
  nw: "Mundos",
  nse: "Sistemas",
  na: "Contacto",

  heroEyebrow: "Vertical aplicado · Hostelería · MMXXVI",
  heroH1a: "Sistemas de atmósfera para",
  heroH1b: "hostelería moderna.",
  heroStrap:
    "Hoteles. Restaurantes. Vida nocturna. Wellness. Cultural. Inmersivo. Seis salas, un estudio.",
  heroStamp: "Ciclo MMXXVI · Queda una plaza hostelera. Solo con cita previa.",

  gapLabel: "001 — El gap de percepción",
  gapH1a: "Tu sala está llena.",
  gapH1b: "Tu imagen online queda media sala por debajo.",
  gapIntro:
    "Los operadores hosteleros con los que trabajamos ya ganan la sala. La reserva es sólida. Las reseñas son amables. La prensa escribe. El problema vive una capa más arriba, en el gap entre cómo se siente el local en la puerta y cómo se lee en una pantalla. Ese gap es el que cerramos.",
  gapSymptoms: [
    "Tu sala está llena. Tu página de reservas se lee como un calendario.",
    "La prensa habla de ti. Tu digital propio suena a cadena.",
    "Tu tasa de repetición es alta. El boca a boca habla de la comida, no de la sala.",
    "Tus reseñas elogian platos concretos. Ninguna describe una sensación.",
    "Tus redes son consistentes. La atmósfera entre superficies aún no es completa.",
    "Te recuerdan en la zona. Aún no eres destino cultural.",
  ],
  gapResolve:
    "Lo que resolvemos. La distancia entre llenar un local y volverse inevitable. Cerrada superficie a superficie, el local deja de competir por reservas y empieza a sostener memoria.",

  physicsLabel: "002 — La física de la demanda",
  physicsH1a: "La hostelería compite",
  physicsH1b: "por la memoria.",
  physicsBody: [
    "La reserva sigue a la memoria. La memoria sigue a la atmósfera. Un local que se gana una sensación se gana un regreso.",
    "La atmósfera es la única superficie que vuelve a casa con el huésped. La carta no. La arquitectura no. Lo que la sala hizo sentir, sí.",
    "Cuando la atmósfera de la sala y la atmósfera de la pantalla son la misma atmósfera, la demanda deja de venderse y empieza a recordarse.",
  ],

  roomsLabel: "003 — Seis salas",
  roomsH1a: "Seis salas.",
  roomsH1b: "Un estudio.",
  roomsIntro:
    "La hostelería son seis salas distintas, cada una con su propia gravedad. El estudio trabaja en las seis, calibradas a operador, hora y huésped. Cada sala es su propio sistema de atmósfera. Juntas, comparten una sola columna creativa.",
  rooms: [
    {
      n: "01",
      anchor: "hotels",
      title: "Hoteles y Resorts",
      atmosphere: "La habitación es la primera frase que pronuncia la marca.",
      outcome:
        "Cuando umbral, pasillo, habitación y terraza cargan cada uno su propio compás, el huésped está dentro de la marca antes de abrir la puerta.",
    },
    {
      n: "02",
      anchor: "restaurants",
      title: "Restaurantes y Bares",
      atmosphere: "La mesa es la segunda sala del restaurante.",
      outcome:
        "La primera línea de vista hace el trabajo antes de que llegue el primer plato. El huésped decide la noche antes de leer la carta.",
    },
    {
      n: "03",
      anchor: "nightlife",
      title: "Vida Nocturna",
      atmosphere: "Pasada la medianoche, la arquitectura está viva.",
      outcome:
        "Puerta, pauta lumínica, suelo sonoro y registro del personal afinados al arco de siete horas. El local sostiene su forma de las nueve a las cuatro sin una sola decisión al azar.",
    },
    {
      n: "04",
      anchor: "wellness",
      title: "Destinos de Wellness",
      atmosphere: "El silencio es el servicio principal.",
      outcome:
        "Luz filtrada, sonido atenuado, paleta serenada, tipografía sin prisa. El huésped recuerda lo que la sala no le pidió.",
    },
    {
      n: "05",
      anchor: "cultural",
      title: "Hospitalidad Cultural",
      atmosphere: "Hospitalidad como la sala junto a la obra.",
      outcome:
        "Cafeterías de museo, restauración en galerías, bares de biblioteca, programas de residencia. Los materiales hacen eco de la institución. La tarde se lee como un solo evento, no como dos.",
    },
    {
      n: "06",
      anchor: "immersive",
      title: "Inmersivo y Experiencial",
      atmosphere: "Una sala que significa lo mismo en siete ciudades.",
      outcome:
        "Pop-ups, residencias y conceptos itinerantes con núcleo fijo y superficie refractiva. El concepto se lee como nativo en ciudades en las que nunca ha estado.",
    },
  ],

  cycleLabel: "Ciclo MMXXVI",
  cycleH1a: "Seis movimientos,",
  cycleH1b: "un ciclo.",
  cycleIntro:
    "Cada encargo hostelero atraviesa los mismos seis compases. Dirigido, no gestionado como proyecto. El estudio sostiene el trabajo. El operador decide en los puntos que deciden.",
  cycleSteps: [
    {
      n: "I",
      title: "Encaje y alcance",
      line: "El estudio confirma que el local pertenece al ciclo, el alcance y el ritmo. No se redacta propuesta hasta que las dos partes reconocen el trabajo.",
    },
    {
      n: "II",
      title: "Diagnóstico",
      line: "Se cartografía el gap de percepción. Umbral, pasillo, sala, mesa, pantalla. Dónde está el local, dónde lo lee el huésped, dónde divergen.",
    },
    {
      n: "III",
      title: "Dirección",
      line: "Se presentan atmósfera, registro y tempo. La dirección se aprueba antes de construir una sola superficie.",
    },
    {
      n: "IV",
      title: "Build",
      line: "Las superficies acordadas se producen bajo la firma del estudio. Revisiones internas, sin micromanagement del operador.",
    },
    {
      n: "V",
      title: "Activación",
      line: "Apertura, relanzamiento o cambio de temporada se dirigen. El local entra al mundo con la atmósfera con la que fue diseñado.",
    },
    {
      n: "VI",
      title: "Tuning",
      line: "Para ciclos elegibles, el estudio acompaña durante el primer mes. Se lee el comportamiento. Luz, sonido y ritmo se afinan hasta que la sala respira sola.",
    },
  ],
  cycleClose:
    "Los ciclos son fixed-scope y firmados por un socio del estudio. Las aprobaciones a tiempo mantienen el ciclo en movimiento.",

  standingLabel: "002.5 — Cohorte",
  standingH1a: "Primera cohorte hostelera,",
  standingH1b: "abierta.",
  standingSub:
    "El estudio aún no ha publicado sus encargos hosteleros. La dirección empieza cuando el trabajo se reconoce. Lo que publicamos sobre un local depende de su permiso, no del nuestro.",
  standingNote:
    "Los ciclos cierran a seis locales. No estiramos el estudio para que entre un séptimo.",
  standingTrust:
    "Los encargos nuevos llegan por presentación. El estudio responde por escrito, firmado, dentro de cuarenta y ocho horas.",
  ledgerLabel: "Cómo opera el estudio",
  ledger: [
    { l: "Encargo mínimo", v: "Doce semanas" },
    { l: "Retainer", v: "De doce a treinta y seis meses" },
    { l: "Divisas", v: "EUR · USD · GBP" },
    { l: "Idiomas de trabajo", v: "ES · EN" },
    { l: "Respuesta del estudio", v: "Cuarenta y ocho horas, firmada por el estudio" },
    { l: "Red", v: "Dirección interna · ejecución a través de una red vetada de especialistas" },
  ],

  flagshipLabel: "Estudio aplicado · 001",
  flagshipEyebrow: "Estudio de Atmósfera Hostelera",
  flagshipH1a: "Atmósferas",
  flagshipH1b: "diseñadas para ser recordadas.",
  flagshipBody:
    "Primera pieza aplicada del laboratorio. Un estudio sobre cómo umbral, pasillo, habitación y mesa componen el peso emocional de la superficie física de un local. La pieza completa atraviesa Percepción, Dirección, Sistema, Superficies y Resultado.",
  flagshipCta: "Leer el estudio",

  selectiveLabel: "Selectividad",
  selectiveBody: [
    "Aceptamos un número limitado de operadores hosteleros por ciclo. Cada encargo se selecciona.",
    "Encargos planteados como RFPs, pitches o concursos quedan fuera de la práctica. También locales cuya lógica principal es el volumen o el precio commodity.",
  ],

  closeH: "Escribe al estudio.",
  closeBody:
    "Si operas un hotel, restaurante, local nocturno, destino de wellness, hospitalidad cultural o concepto inmersivo, y el siguiente movimiento es el que convierte el alcance en memoria, nos gustaría saber de él.",
  closeCta: "Empezar",
  back: "← Inicio",
};

export default function Hospitality() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  // Nav reuses the global copy. The Nav itself reads /worlds + /contact;
  // /hospitality lives as a deep entry, not in the top nav.
  const navT = { nw: t.nw, nse: t.nse, na: t.na };

  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <Nav lang={lang} set={setLang} t={navT} />

      {/* HERO — compact. No orb constellation (that belongs to the home).
          A brand stamp, a two-line cinematic heading, the vertical
          strapline, and a single status line. The AmbientBackdrop
          mounted globally carries the atmosphere. */}
      <section
        style={{
          position: "relative",
          minHeight: "min(86svh, 880px)",
          padding: "clamp(140px,18vh,200px) clamp(20px,5vw,64px) clamp(56px,7vw,96px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(216,147,42,0.07) 0%, rgba(180,110,40,0.02) 38%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={8} opacity={0.05} />
        <div style={{ position: "relative", zIndex: 5, maxWidth: 1080 }}>
          <R>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(20px,2.6vw,32px)" }}>
              <AtelierStar size={16} />
            </div>
            <Label style={{ marginBottom: "clamp(16px,2vw,24px)", color: "rgba(232,183,131,0.78)" }}>
              {t.heroEyebrow}
            </Label>
            <h1
              style={{
                fontSize: "clamp(2.6rem,6.4vw,6.2rem)",
                fontWeight: 400,
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                textShadow: tsS,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                margin: 0,
              }}
            >
              <W text={t.heroH1a} delay={0} />
              <span
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "1.2em",
                }}
              >
                <W text={t.heroH1b} delay={0.12} />
              </span>
            </h1>
          </R>
          <R delay={0.32}>
            <p
              style={{
                marginTop: "clamp(28px,3.4vw,44px)",
                fontSize: "clamp(0.98rem,1.22vw,1.14rem)",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.72)",
                fontWeight: 300,
                maxWidth: 720,
                marginLeft: "auto",
                marginRight: "auto",
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {t.heroStrap}
            </p>
          </R>
          <R delay={0.5}>
            <p
              style={{
                marginTop: "clamp(28px,3.2vw,40px)",
                fontSize: "clamp(10px,0.86vw,11.5px)",
                fontWeight: 500,
                letterSpacing: "0.36em",
                textTransform: "uppercase",
                color: "rgba(232,183,131,0.7)",
              }}
            >
              {t.heroStamp}
            </p>
          </R>
        </div>
      </section>

      {/* 001 — The perception gap */}
      <section
        id="gap"
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Dust count={5} opacity={0.04} />
        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.6vw,48px)" }}>
            <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.gapLabel}</Label>
            <h2
              style={{
                fontSize: "clamp(1.8rem,3.8vw,3.8rem)",
                fontWeight: 400,
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                textShadow: tsS,
                margin: 0,
              }}
            >
              <W text={t.gapH1a} delay={0} />{" "}
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.65)", fontSize: "1.2em" }}>
                <W text={t.gapH1b} delay={0.12} />
              </span>
            </h2>
            <Commentary delay={0.28}>{t.gapIntro}</Commentary>
          </R>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 0, gridTemplateColumns: "1fr" }} className="md:grid-cols-2">
            {t.gapSymptoms.map((p, i) => (
              <R key={p} delay={0.05 * i}>
                <li
                  style={{
                    position: "relative",
                    padding: "clamp(14px,1.8vw,22px) clamp(16px,2vw,24px) clamp(14px,1.8vw,22px) clamp(36px,3.4vw,48px)",
                    borderTop: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "clamp(0.95rem,1.1vw,1.08rem)",
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 300,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "clamp(14px,1.6vw,22px)",
                      top: "clamp(24px,2.7vw,36px)",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.34em",
                      color: "rgba(232,183,131,0.55)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p}
                </li>
              </R>
            ))}
          </ul>
          <R delay={0.4}>
            <p
              style={{
                marginTop: "clamp(28px,3vw,40px)",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.1rem,1.5vw,1.42rem)",
                lineHeight: 1.4,
                color: "rgba(232,183,131,0.82)",
                textAlign: "center",
                maxWidth: 720,
                marginLeft: "auto",
                marginRight: "auto",
                textWrap: "balance",
              }}
            >
              {t.gapResolve}
            </p>
          </R>
        </div>
      </section>

      {/* 002 — Why atmosphere becomes demand */}
      <section
        id="physics"
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 65% 50% at 18% 22%, rgba(216,147,42,0.04) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={4} opacity={0.035} />
        <div className="grid-cols-1 md:grid-cols-[minmax(180px,260px)_1fr]" style={{ display: "grid", gap: "clamp(28px,3.4vw,56px)", maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <Label style={{ marginBottom: "clamp(10px,1.4vw,18px)" }}>{t.physicsLabel}</Label>
            <h2
              style={{
                fontSize: "clamp(1.6rem,2.6vw,2.6rem)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                margin: 0,
                textShadow: tsS,
              }}
            >
              <W text={t.physicsH1a} delay={0} />
              <span style={{ display: "block", fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.72)", fontSize: "1.2em" }}>
                <W text={t.physicsH1b} delay={0.14} />
              </span>
            </h2>
          </R>
          <div style={{ maxWidth: 720 }}>
            {t.physicsBody.map((p, i) => (
              <R key={i} delay={0.1 + 0.05 * i}>
                <p
                  style={{
                    margin: i === 0 ? 0 : "clamp(14px,1.6vw,22px) 0 0",
                    fontSize: "clamp(1rem,1.24vw,1.18rem)",
                    lineHeight: 1.72,
                    color: i === 1 ? "rgba(232,183,131,0.82)" : "rgba(255,255,255,0.78)",
                    fontFamily: i === 1 ? serif : "inherit",
                    fontStyle: i === 1 ? "italic" : "normal",
                    fontWeight: 300,
                    textWrap: "balance",
                  }}
                >
                  {p}
                </p>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* 003 — Six rooms */}
      <section
        id="rooms"
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Dust count={4} opacity={0.035} />
        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(36px,4.4vw,64px)" }}>
            <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.roomsLabel}</Label>
            <h2
              style={{
                fontSize: "clamp(2rem,3.8vw,4rem)",
                fontWeight: 400,
                lineHeight: 0.94,
                letterSpacing: "-0.06em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                textShadow: tsS,
                margin: 0,
              }}
            >
              <W text={t.roomsH1a} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.65)", fontSize: "1.2em" }}>
                <W text={t.roomsH1b} delay={0.12} />
              </span>
            </h2>
            <R delay={0.24}>
              <p
                style={{
                  marginTop: "clamp(16px,2vw,26px)",
                  fontSize: "clamp(0.95rem,1.18vw,1.08rem)",
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.62)",
                  fontWeight: 300,
                  maxWidth: 640,
                  marginLeft: "auto",
                  marginRight: "auto",
                  textShadow: ts,
                }}
              >
                {t.roomsIntro}
              </p>
            </R>
          </R>
          <div
            style={{
              display: "grid",
              gap: 0,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              marginTop: "clamp(40px,5vw,72px)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {t.rooms.map((r, i) => (
              <R key={r.anchor} delay={0.05 * i}>
                <article
                  id={r.anchor}
                  style={{
                    position: "relative",
                    padding: "clamp(28px,3vw,40px) clamp(22px,2.4vw,32px) clamp(32px,3.4vw,44px)",
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    minHeight: 240,
                    height: "100%",
                    scrollMarginTop: "clamp(80px,12vh,120px)",
                    transition: "background 0.55s cubic-bezier(0.22,1,0.36,1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(232,183,131,0.05) 0%, transparent 70%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.34em",
                      color: "rgba(232,183,131,0.6)",
                    }}
                  >
                    {r.n}
                  </span>
                  <h3
                    style={{
                      margin: "clamp(12px,1.4vw,18px) 0 clamp(10px,1vw,14px)",
                      fontSize: "clamp(1.1rem,1.45vw,1.4rem)",
                      fontWeight: 400,
                      lineHeight: 1.18,
                      letterSpacing: "-0.02em",
                      color: "white",
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: "clamp(1rem,1.2vw,1.14rem)",
                      lineHeight: 1.42,
                      color: "rgba(232,183,131,0.78)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {r.atmosphere}
                  </p>
                  <p
                    style={{
                      margin: "clamp(14px,1.8vw,22px) 0 0",
                      fontSize: "clamp(0.92rem,1.1vw,1.02rem)",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.62)",
                      fontWeight: 300,
                    }}
                  >
                    {r.outcome}
                  </p>
                </article>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* 004 — Cycle */}
      <section
        id="cycle"
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,183,131,0.025) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={5} opacity={0.04} />
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.6vw,48px)" }}>
            <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.cycleLabel}</Label>
            <h2
              style={{
                fontSize: "clamp(1.7rem,3.6vw,3.6rem)",
                fontWeight: 400,
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                textShadow: tsS,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                margin: 0,
              }}
            >
              <W text={t.cycleH1a} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>
                <W text={t.cycleH1b} delay={0.12} />
              </span>
            </h2>
            <Commentary delay={0.22}>{t.cycleIntro}</Commentary>
          </R>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 0, gridTemplateColumns: "1fr" }} className="md:grid-cols-2">
            {t.cycleSteps.map((m, i) => (
              <R key={m.n} delay={0.05 * i}>
                <li
                  style={{
                    position: "relative",
                    padding: "clamp(20px,2.4vw,32px) clamp(20px,2.4vw,32px) clamp(20px,2.4vw,32px) clamp(56px,5vw,76px)",
                    borderTop: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "clamp(18px,2vw,28px)",
                      top: "clamp(22px,2.6vw,34px)",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.34em",
                      color: "rgba(232,183,131,0.62)",
                    }}
                  >
                    {m.n}
                  </span>
                  <h3
                    style={{
                      margin: "0 0 clamp(8px,1vw,12px)",
                      fontSize: "clamp(1rem,1.3vw,1.22rem)",
                      fontWeight: 400,
                      lineHeight: 1.18,
                      letterSpacing: "-0.018em",
                      color: "white",
                    }}
                  >
                    {m.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(0.92rem,1.1vw,1.02rem)",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.66)",
                      fontWeight: 300,
                    }}
                  >
                    {m.line}
                  </p>
                </li>
              </R>
            ))}
          </ol>
          <R delay={0.5}>
            <p
              style={{
                marginTop: "clamp(24px,2.8vw,40px)",
                fontSize: 11,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.42)",
                fontWeight: 300,
                maxWidth: 680,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              {t.cycleClose}
            </p>
          </R>
        </div>
      </section>

      {/* 005 — Cohort */}
      <section
        id="cohort"
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Dust count={5} opacity={0.04} />
        <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.4vw,48px)" }}>
            <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.standingLabel}</Label>
            <h2
              style={{
                fontSize: "clamp(1.8rem,3.6vw,3.6rem)",
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: "-0.045em",
                textShadow: tsS,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                margin: 0,
              }}
            >
              <span>{t.standingH1a}</span>
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>
                {t.standingH1b}
              </span>
            </h2>
            <Commentary delay={0.18}>{t.standingSub}</Commentary>
          </R>
          <div
            className="grid-cols-1 lg:grid-cols-[1.45fr_1fr]"
            style={{
              display: "grid",
              gap: "clamp(28px,3.6vw,60px)",
              marginTop: "clamp(24px,3vw,40px)",
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  border: "1px solid rgba(232,183,131,0.18)",
                  background: "linear-gradient(180deg, rgba(232,183,131,0.04) 0%, rgba(4,3,2,0.4) 100%)",
                  padding: "clamp(24px,3vw,36px) clamp(20px,2.4vw,30px)",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: "rgba(232,183,131,0.78)",
                    margin: 0,
                    marginBottom: 14,
                  }}
                >
                  {lang === "en" ? "Currently" : "Actualmente"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(1.15rem,1.5vw,1.42rem)",
                    lineHeight: 1.38,
                    color: "rgba(255,255,255,0.86)",
                    letterSpacing: "-0.005em",
                    textShadow: tsS,
                  }}
                >
                  {lang === "en"
                    ? "The first hospitality cohort of MMXXVI is in motion. Cycles close at six venues."
                    : "La primera cohorte hostelera de MMXXVI está en marcha. Los ciclos cierran a seis locales."}
                </p>
                <p style={{ margin: "14px 0 0", fontSize: "clamp(0.92rem,1.1vw,1rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>
                  {t.standingNote}
                </p>
                <p style={{ margin: "18px 0 0", fontSize: "clamp(0.92rem,1.1vw,1rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.68)", fontWeight: 300 }}>
                  {t.standingTrust}
                </p>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.42)",
                  marginBottom: "clamp(14px,1.6vw,22px)",
                }}
              >
                {t.ledgerLabel}
              </p>
              <dl style={{ margin: 0, padding: 0 }}>
                {t.ledger.map((row, i) => (
                  <R key={row.l} delay={0.04 * i}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(140px,180px) 1fr",
                        gap: "clamp(12px,1.6vw,24px)",
                        padding: "clamp(12px,1.6vw,18px) 0",
                        borderTop: i === 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <dt
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.32em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.45)",
                          margin: 0,
                        }}
                      >
                        {row.l}
                      </dt>
                      <dd
                        style={{
                          fontSize: "clamp(0.92rem,1.1vw,1.04rem)",
                          lineHeight: 1.5,
                          color: "rgba(255,255,255,0.78)",
                          fontWeight: 300,
                          margin: 0,
                        }}
                      >
                        {row.v}
                      </dd>
                    </div>
                  </R>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 006 — Flagship */}
      <section
        style={{
          position: "relative",
          minHeight: "64svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/images/03_emotional_curtains.jpg"
          alt="Hospitality Atmosphere Study — curtain, light and material composing the emotional weight of a luxury interior"
          fill
          sizes="100vw"
          quality={70}
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(6,4,2,0.85) 0%, rgba(6,4,2,0.42) 22%, rgba(6,4,2,0.18) 45%, rgba(6,4,2,0.55) 78%, rgba(6,4,2,0.92) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(40,18,8,0.32) 65%, rgba(6,4,2,0.62) 100%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={5} opacity={0.04} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 920, padding: "clamp(36px,5vw,72px) clamp(24px,5vw,72px)", textAlign: "center" }}>
          <R>
            <Label style={{ color: "rgba(232,183,131,0.78)", marginBottom: "clamp(16px,2vw,24px)" }}>
              {t.flagshipLabel}
            </Label>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.62)",
                marginBottom: "clamp(28px,3vw,40px)",
              }}
            >
              {t.flagshipEyebrow}
            </p>
            <h2
              style={{
                fontSize: "clamp(1.8rem,3.6vw,3.6rem)",
                fontWeight: 400,
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                textShadow: tsS,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              <W text={t.flagshipH1a} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.78)", fontSize: "1.2em" }}>
                <W text={t.flagshipH1b} delay={0.12} />
              </span>
            </h2>
          </R>
          <R delay={0.28}>
            <p
              style={{
                marginTop: "clamp(28px,3.4vw,44px)",
                fontSize: "clamp(0.98rem,1.22vw,1.12rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 300,
                maxWidth: 660,
                marginLeft: "auto",
                marginRight: "auto",
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {t.flagshipBody}
            </p>
          </R>
          <R delay={0.42}>
            <Link
              href="/studies/hospitality-atmosphere-study"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginTop: "clamp(36px,4.2vw,56px)",
                padding: "14px 28px",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "white",
                textDecoration: "none",
                border: "1px solid rgba(232,183,131,0.45)",
                background: "rgba(232,183,131,0.06)",
                borderRadius: 999,
                transition: "background 0.5s, border-color 0.5s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.06)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
              }}
            >
              {t.flagshipCta}
              <span aria-hidden style={{ fontSize: 14 }}>→</span>
            </Link>
          </R>
        </div>
      </section>

      {/* 007 — Selectivity */}
      <section
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Dust count={4} opacity={0.035} />
        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 5, textAlign: "center" }}>
          <R>
            <Label style={{ marginBottom: "clamp(14px,1.8vw,22px)" }}>{t.selectiveLabel}</Label>
          </R>
          {t.selectiveBody.map((p, i) => (
            <R key={i} delay={0.1 + 0.05 * i}>
              <p
                style={{
                  margin: i === 0 ? 0 : "clamp(14px,1.6vw,22px) 0 0",
                  fontSize: "clamp(0.98rem,1.22vw,1.12rem)",
                  lineHeight: 1.72,
                  color: i === 0 ? "rgba(232,183,131,0.78)" : "rgba(255,255,255,0.55)",
                  fontFamily: i === 0 ? serif : "inherit",
                  fontStyle: i === 0 ? "italic" : "normal",
                  fontWeight: 300,
                  textWrap: "balance",
                  maxWidth: 720,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {p}
              </p>
            </R>
          ))}
        </div>
      </section>

      {/* Closing — single dominant verb. Routes to /contact (canonical
          per AGENTS §5c). Label can read "Begin" / "Empezar" — URL stays. */}
      <section
        style={{
          padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(216,147,42,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={5} opacity={0.04} />
        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(14px,1.8vw,22px)" }}>
              <AtelierStar size={18} />
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem,4.6vw,4.6rem)",
                fontWeight: 400,
                lineHeight: 0.94,
                letterSpacing: "-0.06em",
                textShadow: tsS,
                margin: 0,
              }}
            >
              <W text={t.closeH} delay={0} />
            </h2>
            <p
              style={{
                marginTop: "clamp(24px,3vw,36px)",
                fontSize: "clamp(0.96rem,1.2vw,1.1rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.62)",
                fontWeight: 300,
                maxWidth: 720,
                marginLeft: "auto",
                marginRight: "auto",
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {t.closeBody}
            </p>
          </R>
          <R delay={0.32}>
            <div style={{ marginTop: "clamp(36px,4.2vw,56px)" }}>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0.95rem 2rem",
                  fontSize: "clamp(10px,0.85vw,12px)",
                  fontWeight: 500,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "#060606",
                  textDecoration: "none",
                  background: "white",
                  borderRadius: 100,
                  transition: "background 0.4s, transform 0.4s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.88)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {t.closeCta}
              </Link>
            </div>
          </R>
        </div>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}
