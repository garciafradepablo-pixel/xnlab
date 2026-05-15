// PLACEHOLDER CONTENT — replace these three entries with real projects before launch.
// Names, locations and copy here are internal study drafts, not real clients.
// To add/edit a project: add an entry to `projects` below. Slugs become URLs at /work/<slug>.

export type Discipline =
  | "Hospitality Systems"
  | "Nightlife Atmospheres"
  | "Emotional Architecture"
  | "Living Identities";

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
  body: { en: string[]; es: string[] };
  pullQuote?: { en: string; es: string };
  credits: { role: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: "hospitality-atmosphere-study",
    number: "001",
    title: "Hospitality Atmosphere Study",
    discipline: "Hospitality Systems",
    year: "2025",
    location: { en: "Studio Draft · Internal", es: "Borrador de Estudio · Interno" },
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
    body: {
      en: [
        "We approach hospitality not as architecture, but as memory — a sequence of atmospheres designed to make a guest feel before they are ever spoken to.",
        "This study explores heavy material, dim incandescence and acoustic silence as the primary tools of identity. The threshold is the first sentence; the corridor is the second.",
        "The goal is presence: a space that is remembered as a feeling rather than described as a place.",
      ],
      es: [
        "Abordamos la hospitalidad no como arquitectura, sino como memoria — una secuencia de atmósferas diseñadas para hacer sentir antes de que se les dirija una palabra.",
        "Este estudio explora material denso, incandescencia tenue y silencio acústico como herramientas primarias de identidad. El umbral es la primera frase; el pasillo es la segunda.",
        "El objetivo es presencia: un espacio que se recuerda como sensación, no se describe como lugar.",
      ],
    },
    pullQuote: {
      en: "Atmospheres designed to be remembered, not described.",
      es: "Atmósferas diseñadas para ser recordadas, no descritas.",
    },
    credits: [
      { role: "Direction", value: "XNLAB" },
      { role: "Status", value: "Internal study — 2025" },
    ],
  },
  {
    slug: "nightlife-visual-system",
    number: "002",
    title: "Nightlife Visual System",
    discipline: "Nightlife Atmospheres",
    year: "2025",
    location: { en: "Studio Draft · Internal", es: "Borrador de Estudio · Interno" },
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
    body: {
      en: [
        "Nightlife is the discipline where cultural energy is most visible. We design it as a complete visual system, not a logo applied to flyers.",
        "Every gesture is intentional: the door, the lighting cue at midnight, the typography on the wristband, the soundtrack of the bathroom. None of them shout — together they remember.",
        "The system treats darkness as the canvas and restraint as the loudest tool available.",
      ],
      es: [
        "La vida nocturna es la disciplina donde la energía cultural es más visible. La diseñamos como sistema visual completo, no como un logo sobre flyers.",
        "Cada gesto es intencional: la puerta, la pauta de luz a medianoche, la tipografía de la pulsera, la banda sonora del baño. Ninguno grita — juntos recuerdan.",
        "El sistema trata la oscuridad como lienzo y la contención como la herramienta más ruidosa que existe.",
      ],
    },
    pullQuote: {
      en: "Restraint, used loudly.",
      es: "Contención, usada en voz alta.",
    },
    credits: [
      { role: "Direction", value: "XNLAB" },
      { role: "Status", value: "Internal study — 2025" },
    ],
  },
  {
    slug: "architectural-identity",
    number: "003",
    title: "Architectural Identity",
    discipline: "Emotional Architecture",
    year: "2024",
    location: { en: "Studio Draft · Internal", es: "Borrador de Estudio · Interno" },
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
    body: {
      en: [
        "We treat architecture as the first layer of emotion. Before the brand, before the music, before the menu — the geometry of a space already speaks.",
        "This study isolates three variables: the depth of shadow, the temperature of stone, and the rhythm of openings. Each is tuned until the space feels inevitable.",
        "The result is not minimal. It is concentrated.",
      ],
      es: [
        "Tratamos la arquitectura como la primera capa de emoción. Antes de la marca, antes de la música, antes del menú — la geometría del espacio ya habla.",
        "Este estudio aísla tres variables: la profundidad de la sombra, la temperatura de la piedra y el ritmo de las aberturas. Cada una se afina hasta que el espacio se sienta inevitable.",
        "El resultado no es mínimo. Es concentrado.",
      ],
    },
    pullQuote: {
      en: "Not minimal. Concentrated.",
      es: "No es minimalista. Es concentrado.",
    },
    credits: [
      { role: "Direction", value: "XNLAB" },
      { role: "Status", value: "Internal study — 2024" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
