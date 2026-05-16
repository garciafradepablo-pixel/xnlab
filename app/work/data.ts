// Selected Studies — internal XNLAB visual systems.
// Each entry follows the Problem · Direction · System · Surfaces · Result
// editorial framework. Slugs become URLs at /work/<slug>.

export type Discipline =
  | "Hospitality Experience"
  | "Nightlife & Cultural Events"
  | "Luxury Lifestyle Brands"
  | "Architecture & Spatial Design"
  | "Music & Cultural Artists"
  | "Cultural Digital Worlds";

export type StudyChapter = {
  label: { en: string; es: string };
  body: { en: string; es: string };
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  discipline: Discipline;
  year: string;
  location: { en: string; es: string };
  hero: string;
  heroPosition?: string;
  gallery: { src: string; alt: string }[];
  excerpt: { en: string; es: string };
  // Five-part editorial framework — every study moves through these
  // beats so the studio's commercial thinking is visible.
  problem: { en: string; es: string };
  direction: { en: string; es: string };
  system: { en: string; es: string };
  surfaces: { en: string[]; es: string[] };
  result: { en: string; es: string };
  pullQuote?: { en: string; es: string };
  credits: { role: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: "hospitality-atmosphere-study",
    number: "001",
    title: "Hospitality Atmosphere Study",
    discipline: "Hospitality Experience",
    year: "2023",
    location: { en: "Studio Study · Internal", es: "Estudio Interno · Borrador" },
    hero: "/images/03_emotional_curtains.jpg",
    heroPosition: "center 42%",
    gallery: [
      { src: "/images/08_reflective_table.jpg", alt: "Reflective stone table in low ambient light" },
      { src: "/images/02_worldbuilding_floating.jpg", alt: "Floating chrome object in dust-lit space" },
    ],
    excerpt: {
      en: "An internal study on how curtain, light and material define the emotional weight of a luxury hospitality interior.",
      es: "Un estudio interno sobre cómo la cortina, la luz y el material definen el peso emocional de un interior de hospitalidad de lujo.",
    },
    problem: {
      en: "Premium hospitality interiors photograph beautifully but compete in the same visual register as their competitors. The room is unmistakable in person; on the website it dissolves into the same tier as everyone else.",
      es: "Los interiores de hospitalidad premium fotografían bien pero compiten en el mismo registro visual que sus competidores. La habitación es inconfundible en persona; en la web se disuelve en el mismo plano que los demás.",
    },
    direction: {
      en: "We approached hospitality not as architecture, but as memory — a sequence of atmospheres designed to make a guest feel before they are ever spoken to. The threshold is the first sentence; the corridor is the second.",
      es: "Abordamos la hospitalidad no como arquitectura, sino como memoria — una secuencia de atmósferas diseñadas para hacer sentir antes de que se les dirija una palabra. El umbral es la primera frase; el pasillo es la segunda.",
    },
    system: {
      en: "Heavy material, dim incandescence and acoustic silence as the primary tools of identity. A palette tuned to firelight and aged copper. A motion register that breathes at the pace of a guest who has just sat down.",
      es: "Material denso, incandescencia tenue y silencio acústico como herramientas primarias de identidad. Una paleta afinada a la luz de fuego y al cobre envejecido. Un registro de animación que respira al ritmo de un huésped que acaba de sentarse.",
    },
    surfaces: {
      en: [
        "Cinematic single-page site",
        "Booking flow with editorial pacing",
        "Sensory programme for opening night",
        "Atmospheric photography direction",
      ],
      es: [
        "Sitio cinematográfico de una sola página",
        "Flujo de reserva con ritmo editorial",
        "Programa sensorial para la noche de apertura",
        "Dirección de fotografía atmosférica",
      ],
    },
    result: {
      en: "A space that is remembered as a feeling rather than described as a place. The visual system holds the guest's attention at the same pace as the room itself.",
      es: "Un espacio que se recuerda como sensación, no se describe como lugar. El sistema visual sostiene la atención del huésped al mismo ritmo que la habitación.",
    },
    pullQuote: {
      en: "Atmospheres designed to be remembered, not described.",
      es: "Atmósferas diseñadas para ser recordadas, no descritas.",
    },
    credits: [
      { role: "Direction", value: "Xnlab Studio" },
      { role: "Status", value: "Internal study — 2023" },
    ],
  },
  {
    slug: "nightlife-visual-system",
    number: "002",
    title: "Nightlife Visual System",
    discipline: "Nightlife & Cultural Events",
    year: "2024",
    location: { en: "Studio Study · Internal", es: "Estudio Interno · Borrador" },
    hero: "/images/04_sensorium_blue.jpg",
    heroPosition: "center 40%",
    gallery: [
      { src: "/images/05_identity_chrome.jpg", alt: "Chrome identity element in blue ambient light" },
      { src: "/images/06_spatial_green.jpg", alt: "Spatial composition in saturated green" },
    ],
    excerpt: {
      en: "A nocturnal identity exercise — how a single colour temperature, repeated across surface and motion, becomes a venue's signature.",
      es: "Un ejercicio de identidad nocturna — cómo una sola temperatura de color, repetida en superficie y movimiento, se convierte en la firma de un local.",
    },
    problem: {
      en: "Most nightlife venues build identity as a logo applied to flyers, then watch that identity dissolve the moment the doors open. The room is the brand; the brand is rarely the room.",
      es: "La mayoría de los locales nocturnos construyen identidad como un logo aplicado a flyers, y luego ven cómo esa identidad se disuelve en el momento en que se abren las puertas. La sala es la marca; la marca casi nunca es la sala.",
    },
    direction: {
      en: "Treat the venue as a complete sensory programme — light, motion, sound, typography, gesture — held by a single visual decision applied at every layer. Darkness as the canvas, restraint as the loudest tool available.",
      es: "Tratar el local como un programa sensorial completo — luz, movimiento, sonido, tipografía, gesto — sostenido por una sola decisión visual aplicada en cada capa. La oscuridad como lienzo, la contención como la herramienta más ruidosa.",
    },
    system: {
      en: "One colour temperature anchors the universe. One typographic gesture repeats on the wristband, the door, the website and the first frame of every reel. Every operational call is also a brand call.",
      es: "Una sola temperatura de color ancla el universo. Un gesto tipográfico se repite en la pulsera, la puerta, la web y el primer cuadro de cada reel. Cada decisión operativa es también una decisión de marca.",
    },
    surfaces: {
      en: [
        "Door identity and entry sequence",
        "Wristband, lineup and event collateral",
        "Lighting cue programme",
        "Cinematic web presence and social grid",
      ],
      es: [
        "Identidad de puerta y secuencia de entrada",
        "Pulsera, lineup y piezas de evento",
        "Programa de pauta lumínica",
        "Presencia web cinematográfica y cuadrícula social",
      ],
    },
    result: {
      en: "A venue that is recognised in the dark. The visual system survives every context the night puts it through, from the door at one in the morning to the cover photo on Monday.",
      es: "Un local que se reconoce en la oscuridad. El sistema visual sobrevive a cada contexto al que la noche lo somete, desde la puerta a la una de la madrugada hasta la foto de portada del lunes.",
    },
    pullQuote: {
      en: "Restraint, used loudly.",
      es: "Contención, usada en voz alta.",
    },
    credits: [
      { role: "Direction", value: "Xnlab Studio" },
      { role: "Status", value: "Internal study — 2024" },
    ],
  },
  {
    slug: "architectural-identity",
    number: "003",
    title: "Architectural Identity",
    discipline: "Architecture & Spatial Design",
    year: "2025",
    location: { en: "Studio Study · Internal", es: "Estudio Interno · Borrador" },
    hero: "/images/07_sculptural_white.jpg",
    heroPosition: "center 60%",
    gallery: [
      { src: "/images/02_worldbuilding_floating.jpg", alt: "Sculptural object in volumetric light" },
      { src: "/images/01_hero_chrome.jpg", alt: "Chrome surface catching ambient glow" },
    ],
    excerpt: {
      en: "A study on shaping presence through silence, light and material — architecture as emotional infrastructure.",
      es: "Un estudio sobre cómo moldear presencia mediante silencio, luz y material — arquitectura como infraestructura emocional.",
    },
    problem: {
      en: "Architecture studios talk about light and material in the studio, then communicate online with the same generic templates as everyone else. The work is precise; the brand around it is not.",
      es: "Los estudios de arquitectura hablan de luz y material en su práctica, pero se comunican online con las mismas plantillas genéricas que los demás. El trabajo es preciso; la marca a su alrededor no lo es.",
    },
    direction: {
      en: "Treat architecture as the first layer of emotion. Before the brand, before the music, before the menu — the geometry of a space already speaks. Our job is to edit that sentence, not to add to it.",
      es: "Tratar la arquitectura como la primera capa de emoción. Antes de la marca, antes de la música, antes del menú — la geometría del espacio ya habla. Nuestro trabajo es editar esa frase, no añadir nada.",
    },
    system: {
      en: "Three variables held tight: the depth of shadow, the temperature of stone, the rhythm of openings. The brand system carries them through type, palette, motion and copy with the same restraint.",
      es: "Tres variables sostenidas con precisión: la profundidad de la sombra, la temperatura de la piedra, el ritmo de las aberturas. El sistema de marca las traslada a la tipografía, la paleta, el movimiento y la redacción con la misma contención.",
    },
    surfaces: {
      en: [
        "Studio identity and material palette",
        "Project archive with editorial pacing",
        "Cinematic web presence",
        "Print and exhibition direction",
      ],
      es: [
        "Identidad del estudio y paleta de materiales",
        "Archivo de proyecto con ritmo editorial",
        "Presencia web cinematográfica",
        "Dirección de impresión y exposición",
      ],
    },
    result: {
      en: "A studio that reads online the same way it reads in person — concentrated, never minimal, weighted by material rather than by decoration.",
      es: "Un estudio que se lee online igual que se lee en persona — concentrado, nunca minimalista, sostenido por el material y no por la decoración.",
    },
    pullQuote: {
      en: "Not minimal. Concentrated.",
      es: "No es minimalista. Es concentrado.",
    },
    credits: [
      { role: "Direction", value: "Xnlab Studio" },
      { role: "Status", value: "Internal study — 2025" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
