// The XNLAB universe. Six World Cores orbiting a Central Core.
// Each Core has a material, an energy and a movement personality.
// This file is canonical. Edit here and it propagates through the site.

export type WorldSlug =
  | "hospitality-experience"
  | "nightlife-cultural-events"
  | "luxury-lifestyle-brands"
  | "architecture-spatial-design"
  | "music-cultural-artists"
  | "cultural-digital-worlds";

export type World = {
  slug: WorldSlug;
  number: string; // "01"..."06"
  // Optional path to a transparent PNG that represents this Core.
  // Default expectation: /images/worlds/<slug>.png
  // If absent, the Orb component falls back to a CSS gradient sphere.
  image?: string;
  // The visible color and gradient stops used for the placeholder orb,
  // dust particles, accents and any tinted overlays on that world's page.
  color: {
    name: string;
    hex: string; // dominant accent
    core: string; // bright core of the radial gradient
    mid: string; // mid stop
    deep: string; // outer fade (close to background dark)
    glow: string; // box-shadow glow rgba
  };
  // Movement personality. Used by the orb to give each Core its own
  // behaviour: nightlife vibrates, architecture is almost still, etc.
  motion: {
    breatheScale: [number, number]; // [from, to]
    breatheDuration: number; // seconds
    drift: number; // px of subtle x/y drift
    pulse: "still" | "slow" | "drift" | "vibrate" | "wave" | "refract";
  };
  title: { en: string; es: string };
  // Commercial doorway line — one direct sentence describing the kind of
  // brands this Core is built for. Used on the /worlds index card,
  // CircleOfWorlds hover, and the top of /worlds/[slug]. Sits between
  // the poetic essence and the longer body — bridges lore and offer.
  pitch: { en: string; es: string };
  essence: { en: string; es: string };
  material: { en: string; es: string };
  energy: { en: string; es: string };
  practice: { en: string[]; es: string[] };
  body: { en: string[]; es: string[] };
  // Optional cinematic discipline imagery — the full-bleed atmosphere card
  // that used to live on the home page. Each Core that owns a discipline
  // carries it here, so the home stays minimal and the World page is whole.
  discipline?: {
    image: string;
    imagePosition?: string;
    title: { en: string; es: string };
    copy: { en: string; es: string };
  };
};

export const worlds: World[] = [
  {
    slug: "hospitality-experience",
    number: "01",
    image: "/images/worlds/hospitality-experience.png",
    color: {
      name: "Amber Gold",
      hex: "#d8932a",
      core: "rgba(255,200,120,0.95)",
      mid: "rgba(190,110,40,0.7)",
      deep: "rgba(40,18,8,1)",
      glow: "rgba(216,147,42,0.45)",
    },
    motion: { breatheScale: [1, 1.04], breatheDuration: 7.5, drift: 4, pulse: "slow" },
    title: { en: "Hospitality & Experience", es: "Hospitalidad y Experiencia" },
    pitch: {
      en: "Warm, sensory atmospheres for restaurants, hotels and immersive dining.",
      es: "Atmósferas cálidas y sensoriales para restaurantes, hoteles y experiencias gastronómicas.",
    },
    essence: {
      en: "Where warmth becomes architecture.",
      es: "Donde la calidez se hace arquitectura.",
    },
    material: {
      en: "Translucent amber crystal with warm copper reflections.",
      es: "Cristal de ámbar translúcido con reflejos cálidos de cobre.",
    },
    energy: {
      en: "Human atmosphere. Firelight. Wine. Tactile elegance. Rooms that slow you down.",
      es: "Atmósfera humana. Luz de fuego. Vino. Elegancia táctil. Espacios que te ralentizan.",
    },
    practice: {
      en: [
        "Hotel brand systems and atmospheric direction.",
        "Restaurant identity, menu design, sensory programmes.",
        "Hospitality launch and opening-night calibration.",
      ],
      es: [
        "Sistemas de marca para hoteles y dirección atmosférica.",
        "Identidad de restaurante, diseño de carta, programas sensoriales.",
        "Lanzamiento hostelero y calibración de la noche de apertura.",
      ],
    },
    body: {
      en: [
        "Hospitality is the discipline of being remembered. Not for what was served, but for how the room felt when the guest walked in and how the air still felt the next morning.",
        "We design this Core as a sequence of atmospheres — threshold, corridor, room, table — each tuned to one feeling. Materials are heavy. Light is low and warm. Silence is part of the menu.",
      ],
      es: [
        "La hospitalidad es la disciplina de ser recordados. No por lo que se sirvió, sino por cómo se sintió la habitación cuando el huésped entró, y cómo seguía sintiéndose el aire a la mañana siguiente.",
        "Diseñamos este Core como una secuencia de atmósferas — umbral, pasillo, habitación, mesa — cada una afinada a una sensación. Los materiales son pesados. La luz, baja y cálida. El silencio forma parte de la carta.",
      ],
    },
    discipline: {
      image: "/images/03_emotional_curtains.jpg",
      imagePosition: "center 42%",
      title: {
        en: "Hospitality Experience",
        es: "Hospitalidad y Experiencia",
      },
      copy: {
        en: "Atmospheres designed to be remembered.",
        es: "Atmósferas diseñadas para ser recordadas.",
      },
    },
  },
  {
    slug: "nightlife-cultural-events",
    number: "02",
    image: "/images/worlds/nightlife-cultural-events.png",
    color: {
      name: "Electric Violet",
      hex: "#7a3dff",
      core: "rgba(170,110,255,0.95)",
      mid: "rgba(110,40,210,0.75)",
      deep: "rgba(20,8,40,1)",
      glow: "rgba(140,70,255,0.5)",
    },
    motion: { breatheScale: [1, 1.05], breatheDuration: 3.4, drift: 7, pulse: "vibrate" },
    title: { en: "Nightlife & Cultural Events", es: "Vida nocturna y Eventos culturales" },
    pitch: {
      en: "High-voltage visual systems for venues, parties, launches and nightlife culture.",
      es: "Sistemas visuales de alto voltaje para locales, fiestas, lanzamientos y cultura de noche.",
    },
    essence: {
      en: "Where presence becomes voltage.",
      es: "Donde la presencia se hace voltaje.",
    },
    material: {
      en: "Ultraviolet liquid glass with energetic particles in slow orbit.",
      es: "Vidrio líquido ultravioleta con partículas energéticas en órbita lenta.",
    },
    energy: {
      en: "Pulse. Smoke. Rave energy. Adrenaline. Architecture that only exists after midnight.",
      es: "Pulso. Humo. Energía rave. Adrenalina. Arquitectura que solo existe pasada la medianoche.",
    },
    practice: {
      en: [
        "Club and venue identity systems.",
        "Event direction, lineup graphic language, wristband design.",
        "Atmospheric programming — light, sound and motion as one system.",
      ],
      es: [
        "Sistemas de identidad para clubs y locales.",
        "Dirección de eventos, lenguaje gráfico de lineup, diseño de pulseras.",
        "Programación atmosférica — luz, sonido y movimiento como un solo sistema.",
      ],
    },
    body: {
      en: [
        "Nightlife is the discipline where cultural energy is most visible. We design it as a complete visual system, not a logo applied to flyers. Every gesture is intentional: the door, the lighting cue at midnight, the typography on the wristband, the soundtrack of the bathroom.",
        "None of these elements shouts. Together they remember. The system treats darkness as the canvas and restraint as the loudest tool available.",
      ],
      es: [
        "La vida nocturna es la disciplina donde la energía cultural es más visible. La diseñamos como un sistema visual completo, no como un logo aplicado a flyers. Cada gesto es intencional: la puerta, la pauta de luz a medianoche, la tipografía de la pulsera, la banda sonora del baño.",
        "Ninguno de esos elementos grita. Juntos recuerdan. El sistema trata la oscuridad como lienzo y la contención como la herramienta más ruidosa que existe.",
      ],
    },
    discipline: {
      image: "/images/04_sensorium_blue.jpg",
      imagePosition: "center 40%",
      title: {
        en: "Nightlife & Cultural Events",
        es: "Vida nocturna y Eventos culturales",
      },
      copy: {
        en: "Dark, cinematic environments for cultural energy.",
        es: "Entornos oscuros y cinematográficos para la energía cultural.",
      },
    },
  },
  {
    slug: "luxury-lifestyle-brands",
    number: "03",
    image: "/images/worlds/luxury-lifestyle-brands.png",
    color: {
      name: "Ivory Pearl",
      hex: "#e8e2d2",
      core: "rgba(245,238,222,0.95)",
      mid: "rgba(196,180,150,0.6)",
      deep: "rgba(40,32,24,1)",
      glow: "rgba(232,226,210,0.3)",
    },
    motion: { breatheScale: [1, 1.018], breatheDuration: 10, drift: 2, pulse: "still" },
    title: { en: "Luxury & Lifestyle Brands", es: "Lujo y Estilo de vida" },
    pitch: {
      en: "Soft, refined worlds for premium products, beauty, fashion and lifestyle brands.",
      es: "Mundos suaves y refinados para producto premium, belleza, moda y marcas de lifestyle.",
    },
    essence: {
      en: "Where silence becomes language.",
      es: "Donde el silencio se hace lenguaje.",
    },
    material: {
      en: "Soft pearl ceramic with champagne silver reflections.",
      es: "Cerámica de perla suave con reflejos plata champán.",
    },
    energy: {
      en: "Fashion. Perfume. Editorial restraint. Premium minimalism. The discipline of leaving things out.",
      es: "Moda. Perfume. Contención editorial. Minimalismo premium. La disciplina de dejar fuera.",
    },
    practice: {
      en: [
        "Fashion brand identity and seasonal direction.",
        "Perfume packaging, narrative and olfactory direction.",
        "Editorial design and lookbook systems.",
      ],
      es: [
        "Identidad de marca de moda y dirección estacional.",
        "Packaging de perfume, narrativa y dirección olfativa.",
        "Diseño editorial y sistemas de lookbook.",
      ],
    },
    body: {
      en: [
        "Lifestyle and fashion brands compete in attention; the ones that endure compete in restraint. This Core is the discipline of removing — typography, palette, gesture — until what remains is inevitable.",
        "The result is not minimal. It is concentrated. A single material chosen well outranks a system of patterns chosen quickly.",
      ],
      es: [
        "Las marcas de moda y lifestyle compiten en atención; las que perduran compiten en contención. Este Core es la disciplina de quitar — tipografía, paleta, gesto — hasta que lo que queda sea inevitable.",
        "El resultado no es minimalista. Es concentrado. Un solo material elegido bien gana a un sistema de patrones elegidos rápido.",
      ],
    },
    discipline: {
      image: "/images/05_identity_chrome.jpg",
      imagePosition: "center 45%",
      title: {
        en: "Luxury & Lifestyle Brands",
        es: "Lujo y Estilo de vida",
      },
      copy: {
        en: "Brand worlds for premium fashion, beauty and lifestyle houses.",
        es: "Mundos de marca para casas premium de moda, belleza y lifestyle.",
      },
    },
  },
  {
    slug: "architecture-spatial-design",
    number: "04",
    image: "/images/worlds/architecture-spatial-design.png",
    color: {
      name: "Mineral Stone Grey",
      hex: "#8a8a86",
      core: "rgba(190,190,180,0.85)",
      mid: "rgba(110,108,100,0.55)",
      deep: "rgba(28,28,26,1)",
      glow: "rgba(160,160,150,0.25)",
    },
    motion: { breatheScale: [1, 1.012], breatheDuration: 14, drift: 1, pulse: "still" },
    title: { en: "Architecture & Spatial Design", es: "Arquitectura y Diseño Espacial" },
    pitch: {
      en: "Quiet, material-driven atmospheres for interiors, architecture and spatial identity.",
      es: "Atmósferas silenciosas, dirigidas por el material, para interiorismo, arquitectura e identidad espacial.",
    },
    essence: {
      en: "Where weight becomes meaning.",
      es: "Donde el peso se hace sentido.",
    },
    material: {
      en: "Polished stone and graphite mineral surfaces.",
      es: "Piedra pulida y superficies minerales de grafito.",
    },
    energy: {
      en: "Structure. Brutalist elegance. Natural light. Concrete. Silence in three dimensions.",
      es: "Estructura. Elegancia brutalista. Luz natural. Hormigón. Silencio en tres dimensiones.",
    },
    practice: {
      en: [
        "Architectural brand systems for studios and developers.",
        "Spatial identity for cultural and residential projects.",
        "Material curation and lighting direction.",
      ],
      es: [
        "Sistemas de marca arquitectónica para estudios y promotores.",
        "Identidad espacial para proyectos culturales y residenciales.",
        "Dirección de materiales y dirección lumínica.",
      ],
    },
    body: {
      en: [
        "Architecture is the first layer of emotion. Before the brand, before the music, before the menu — the geometry of a space already speaks. This Core treats that geometry as a sentence and our job as editing it.",
        "We isolate three variables on every project: the depth of shadow, the temperature of the material, and the rhythm of the openings. Tuned together, the space feels inevitable.",
      ],
      es: [
        "La arquitectura es la primera capa de emoción. Antes de la marca, antes de la música, antes del menú — la geometría del espacio ya habla. Este Core trata esa geometría como una frase y nuestro trabajo como editarla.",
        "Aislamos tres variables en cada proyecto: la profundidad de la sombra, la temperatura del material y el ritmo de las aberturas. Afinadas juntas, el espacio se siente inevitable.",
      ],
    },
    discipline: {
      image: "/images/07_sculptural_white.jpg",
      imagePosition: "center 60%",
      title: {
        en: "Architecture & Spatial Design",
        es: "Arquitectura y Diseño Espacial",
      },
      copy: {
        en: "Spaces shaped through silence, light and material.",
        es: "Espacios moldeados por el silencio, la luz y el material.",
      },
    },
  },
  {
    slug: "music-cultural-artists",
    number: "05",
    image: "/images/worlds/music-cultural-artists.png",
    color: {
      name: "Midnight Indigo",
      hex: "#2c3a8a",
      core: "rgba(120,140,255,0.92)",
      mid: "rgba(50,70,180,0.7)",
      deep: "rgba(8,10,32,1)",
      glow: "rgba(80,110,220,0.4)",
    },
    motion: { breatheScale: [1, 1.03], breatheDuration: 8.5, drift: 6, pulse: "wave" },
    title: { en: "Music & Cultural Artists", es: "Música y Artistas Culturales" },
    pitch: {
      en: "Cinematic identity systems for artists, releases, visualizers and emotional campaigns.",
      es: "Sistemas de identidad cinematográfica para artistas, lanzamientos, visualizers y campañas emocionales.",
    },
    essence: {
      en: "Where emotion becomes form.",
      es: "Donde la emoción se hace forma.",
    },
    material: {
      en: "Deep blue nebula glass with subtle light waves moving across the surface.",
      es: "Vidrio nebular azul profundo con ondas de luz sutiles cruzando la superficie.",
    },
    energy: {
      en: "Nostalgia. Cinematic mood. Artistic identity. The late-hour register where music remembers itself.",
      es: "Nostalgia. Tono cinematográfico. Identidad artística. La hora tardía donde la música se recuerda.",
    },
    practice: {
      en: [
        "Artist visual identity and album direction.",
        "Tour aesthetic and stage atmosphere.",
        "Music venue branding and atmospheric programming.",
      ],
      es: [
        "Identidad visual de artistas y dirección de álbum.",
        "Estética de gira y atmósfera de escenario.",
        "Identidad de salas y locales musicales con programación atmosférica.",
      ],
    },
    body: {
      en: [
        "Music is the discipline where atmosphere arrives without permission. An artist's identity has to hold under the same conditions: in a record sleeve, in a 9-second clip, in a stadium, in a bedroom at 3am.",
        "This Core treats the artist as a world — sound, image, gesture, silence — and builds a system robust enough to carry them across every context they will be heard in.",
      ],
      es: [
        "La música es la disciplina donde la atmósfera llega sin permiso. La identidad de un artista tiene que sostener en las mismas condiciones: en la portada de un disco, en un clip de 9 segundos, en un estadio, en un dormitorio a las 3 de la mañana.",
        "Este Core trata al artista como un mundo — sonido, imagen, gesto, silencio — y construye un sistema lo bastante robusto para llevarlo a través de cada contexto en el que se le escuche.",
      ],
    },
  },
  {
    slug: "cultural-digital-worlds",
    number: "06",
    image: "/images/worlds/cultural-digital-worlds.png",
    color: {
      name: "Iridescent Cyan",
      hex: "#46d6ce",
      core: "rgba(120,255,240,0.95)",
      mid: "rgba(50,180,180,0.65)",
      deep: "rgba(8,28,32,1)",
      glow: "rgba(80,220,210,0.45)",
    },
    motion: { breatheScale: [1, 1.06], breatheDuration: 5, drift: 5, pulse: "refract" },
    title: { en: "Cultural & Digital Worlds", es: "Mundos Culturales y Digitales" },
    pitch: {
      en: "Futuristic, fluid systems for digital brands, avatars, campaigns and online presence.",
      es: "Sistemas futuristas y fluidos para marcas digitales, avatares, campañas y presencia online.",
    },
    essence: {
      en: "Where worlds mutate.",
      es: "Donde los mundos mutan.",
    },
    material: {
      en: "Holographic refractive crystal with liquid glitches that appear and dissolve.",
      es: "Cristal holográfico refractivo con glitches líquidos que aparecen y se disuelven.",
    },
    energy: {
      en: "Internet culture. AI-native atmosphere. Digital dimensions. Mutation as material.",
      es: "Cultura de internet. Atmósfera nativa de IA. Dimensiones digitales. La mutación como material.",
    },
    practice: {
      en: [
        "Digital identity systems for cultural brands and platforms.",
        "AI-native visual direction and generative aesthetics.",
        "Internet-native campaign worlds.",
      ],
      es: [
        "Sistemas de identidad digital para marcas culturales y plataformas.",
        "Dirección visual nativa de IA y estética generativa.",
        "Mundos de campaña nativos de internet.",
      ],
    },
    body: {
      en: [
        "The digital Core is the only one that mutates while you look at it. Internet culture moves faster than the systems built to describe it. Our work in this Core is generative by design — visual languages capable of evolving without losing themselves.",
        "We build identities that hold their core while their surface refracts. AI as material. Glitches as gestures. Anomalies as features, not failures.",
      ],
      es: [
        "El Core digital es el único que muta mientras lo miras. La cultura de internet se mueve más rápido que los sistemas construidos para describirla. Nuestro trabajo en este Core es generativo por diseño — lenguajes visuales capaces de evolucionar sin perderse a sí mismos.",
        "Construimos identidades que mantienen su núcleo mientras su superficie se refracta. La IA como material. Los glitches como gestos. Las anomalías como rasgos, no como fallos.",
      ],
    },
  },
];

export function getWorld(slug: string): World | undefined {
  return worlds.find((w) => w.slug === slug);
}

// Universe mythology — the shared language across all Cores.
export const mythology = {
  centralCore: {
    en: {
      name: "The Central Core",
      essence: "The origin. The laboratory. The intelligence.",
      body: [
        "At the centre of the universe lives a dark crimson sphere of liquid obsidian glass. A metallic X is forged inside it — not placed on top, but suspended in the energy that holds the Core together.",
        "The Central Core is the studio. It observes the worlds, records what they teach, and feeds the laboratory that makes them.",
      ],
    },
    es: {
      name: "El Núcleo Central",
      essence: "El origen. El laboratorio. La inteligencia.",
      body: [
        "En el centro del universo vive una esfera carmesí oscura de vidrio de obsidiana líquida. Una X metálica está forjada dentro — no puesta encima, sino suspendida en la energía que sostiene el Núcleo.",
        "El Núcleo Central es el estudio. Observa los mundos, registra lo que enseñan y alimenta el laboratorio que los construye.",
      ],
    },
  },
  orun: {
    name: "ORUN",
    role: { en: "Observer of worlds", es: "Observador de mundos" },
    body: {
      en: [
        "ORUN watches from inside the Central Core. It does not intervene; it records. Every project the studio enters passes through ORUN's silence first.",
        "When ORUN is present, the room becomes more accurate to itself.",
      ],
      es: [
        "ORUN observa desde dentro del Núcleo Central. No interviene; registra. Cada proyecto al que entra el estudio pasa primero por el silencio de ORUN.",
        "Cuando ORUN está presente, el espacio se vuelve más fiel a sí mismo.",
      ],
    },
  },
  chio: {
    name: "CHIO",
    role: { en: "Reactive creature of the anomalies", es: "Criatura reactiva de las anomalías" },
    body: {
      en: [
        "When a world becomes unstable, fractures appear in its Core and release shards. CHIO finds these fragments.",
        "Each shard transforms it. New forms, new gestures, new energies emerge. CHIO is how the studio remembers what the worlds taught us — not as a record, but as a body that keeps changing.",
      ],
      es: [
        "Cuando un mundo se vuelve inestable, aparecen fracturas en su Núcleo y liberan fragmentos. CHIO encuentra esos fragmentos.",
        "Cada fragmento la transforma. Surgen nuevas formas, nuevos gestos, nuevas energías. CHIO es la manera en que el estudio recuerda lo que los mundos nos enseñaron — no como un registro, sino como un cuerpo que sigue cambiando.",
      ],
    },
  },
  anomalies: {
    en: {
      title: "Anomalies",
      body: [
        "Worlds are not stable. When a Core is pushed beyond its rhythm — too much pressure, too fast, too far — fractures appear. Light leaks. Shards form.",
        "We treat these moments not as errors but as material. The shards are how the universe evolves.",
      ],
    },
    es: {
      title: "Anomalías",
      body: [
        "Los mundos no son estables. Cuando se empuja un Núcleo más allá de su ritmo — demasiada presión, demasiado rápido, demasiado lejos — aparecen fracturas. La luz se escapa. Se forman fragmentos.",
        "Tratamos esos momentos no como errores sino como material. Los fragmentos son la forma en que el universo evoluciona.",
      ],
    },
  },
};
