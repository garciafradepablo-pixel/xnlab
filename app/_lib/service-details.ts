// Canonical detail copy for each XNLAB system / engagement.
// This file is the single source of truth for /services/[slug] detail pages.
// Slugs match the URL segment under /services/<slug>.

export type ServiceDetail = {
  slug:
    | "campaign-system"
    | "digital-atmosphere"
    | "brand-world"
    | "visual-engine"
    | "seo-conversion-layer"
    | "perception-upgrade-sprint";
  number: string;
  // Linked World Core slug, when one Core naturally anchors the
  // service. Used for atmosphere tinting on the detail hero.
  worldSlug?: string;
  // Cinematic full-bleed image for the detail hero.
  heroImage: string;
  heroImagePosition?: string;
  title: { en: string; es: string };
  tagline: { en: string; es: string };
  // 1–2 sentence commercial lead under the hero.
  lead: { en: string; es: string };
  // Specs strip shown under the lead: duration, scope shape, price range.
  duration: { en: string; es: string };
  scope: { en: string; es: string };
  price: { en: string; es: string };
  // Three to four longer paragraphs that describe what this system is,
  // who it is for, and why it converts.
  body: { en: string[]; es: string[] };
  // Tangible deliverables.
  includes: { en: string[]; es: string[] };
  // One-sentence promise.
  outcome: { en: string; es: string };
  // Who this is built for.
  audience: { en: string; es: string };
  // Cross-references — which other systems often follow this one.
  pairsWith: Array<ServiceDetail["slug"]>;
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "campaign-system",
    number: "01",
    worldSlug: "nightlife-cultural-events",
    heroImage: "/images/04_sensorium_blue.jpg",
    heroImagePosition: "center 38%",
    title: {
      en: "Campaign System",
      es: "Campaign System",
    },
    tagline: {
      en: "One launch. One coherent atmosphere across every surface.",
      es: "Un lanzamiento. Una atmósfera coherente en cada superficie.",
    },
    lead: {
      en:
        "A focused burst of cinematic direction for an opening, a launch or a cultural moment. We design the campaign as a single emotional event — every surface tuned to the same note.",
      es:
        "Una intervención cinematográfica enfocada para una apertura, un lanzamiento o un momento cultural. Diseñamos la campaña como un único evento emocional — cada superficie afinada a la misma nota.",
    },
    duration: { en: "2–3 weeks", es: "2–3 semanas" },
    scope: { en: "Fixed scope · One campaign", es: "Alcance cerrado · Una campaña" },
    price: { en: "From €5,000", es: "Desde €5.000" },
    body: {
      en: [
        "The Campaign System is built for brands with a real cultural moment to defend: a hotel reopening, a club season launch, an artist drop, a perfume release, a venue debut. The window is short. The visual signal must be unmistakable across every surface a guest, follower or critic touches.",
        "We start with the perception gap: what does the brand want people to feel on the day of the launch, and what would make them remember it a week later. From that one direction we derive every artefact — the hero image, the headline, the social grid, the micro-page, the door, the first frame of the first reel.",
        "Nothing is generic. Everything reads as one campaign, not a folder of assets.",
      ],
      es: [
        "Campaign System está pensado para marcas con un momento cultural real que sostener: la reapertura de un hotel, el arranque de temporada de un club, el lanzamiento de un artista, la salida de un perfume, el debut de un local. La ventana es corta. La señal visual tiene que ser inconfundible en cada superficie que toque un cliente, un seguidor o un crítico.",
        "Empezamos por el gap de percepción: qué queremos que sienta la gente el día del lanzamiento, y qué les haría recordarlo una semana después. De esa única dirección derivamos cada pieza — la imagen principal, el titular, la cuadrícula de redes, la micro-página, la puerta, el primer cuadro del primer reel.",
        "Nada es genérico. Todo se lee como una sola campaña, no como una carpeta de activos.",
      ],
    },
    includes: {
      en: [
        "Campaign concept and direction.",
        "Hero visuals and key motion frames.",
        "Two to three campaign micro-pages.",
        "Headline copy in EN/ES.",
        "Launch handover and rollout calendar.",
      ],
      es: [
        "Concepto y dirección de campaña.",
        "Visuales principales y fotogramas clave de animación.",
        "Dos a tres micro-páginas de campaña.",
        "Redacción de titulares en EN/ES.",
        "Entrega y calendario de lanzamiento.",
      ],
    },
    outcome: {
      en: "A brand event that feels designed end-to-end.",
      es: "Un evento de marca que se siente diseñado de principio a fin.",
    },
    audience: {
      en: "Openings · Launches · Drops · Cultural moments.",
      es: "Aperturas · Lanzamientos · Drops · Momentos culturales.",
    },
    pairsWith: ["digital-atmosphere", "visual-engine"],
  },
  {
    slug: "digital-atmosphere",
    number: "02",
    worldSlug: "hospitality-experience",
    heroImage: "/images/03_emotional_curtains.jpg",
    heroImagePosition: "center 42%",
    title: {
      en: "Digital Atmosphere",
      es: "Atmósfera Digital",
    },
    tagline: {
      en: "A cinematic single-page world. The home, in the most literal sense.",
      es: "Un mundo cinematográfico de una sola página. La casa, en sentido literal.",
    },
    lead: {
      en:
        "The digital surface where a brand finally feels like itself. One page, one atmosphere, every detail directed — for hotels, restaurants, studios and artists whose physical presence already converts but whose website does not yet match.",
      es:
        "La superficie digital donde una marca por fin se siente como es. Una página, una atmósfera, cada detalle dirigido — para hoteles, restaurantes, estudios y artistas cuya presencia física ya convierte pero cuya web aún no está a la altura.",
    },
    duration: { en: "4–6 weeks", es: "4–6 semanas" },
    scope: { en: "Fixed scope · Single-page system", es: "Alcance cerrado · Sistema de una sola página" },
    price: { en: "From €10,000", es: "Desde €10.000" },
    body: {
      en: [
        "Most premium brands lose money at the booking step. The room is beautiful, the dinner is unforgettable, the perfume is poetic — and the website is a generic template that breaks the spell. Digital Atmosphere closes that gap.",
        "We design and build one cinematic single-page surface — slow motion, deep colour, atmospheric type, perfectly tuned conversion structure. It loads fast, it reads like film, and it reduces the cognitive distance between curiosity and booking.",
        "Every element is direction first, production second. Copy, motion, image, code — built by the same hand, under one direction.",
      ],
      es: [
        "La mayoría de las marcas premium pierden dinero en el paso de la reserva. La habitación es bellísima, la cena es inolvidable, el perfume es poesía — y la web es una plantilla genérica que rompe el hechizo. Digital Atmosphere cierra esa distancia.",
        "Diseñamos y construimos una sola superficie cinematográfica de una página — animación lenta, color profundo, tipografía atmosférica, una estructura de conversión perfectamente afinada. Carga rápido, se lee como cine, y reduce la distancia mental entre la curiosidad y la reserva.",
        "Cada elemento es dirección primero, producción después. Copy, animación, imagen, código — construidos por la misma mano, bajo una sola dirección.",
      ],
    },
    includes: {
      en: [
        "Art direction and motion language.",
        "Single-page cinematic build (Next.js).",
        "Copy in EN/ES — headlines, sections, CTA.",
        "SEO, OG image, structured data.",
        "Analytics, deploy and handover.",
      ],
      es: [
        "Dirección de arte y lenguaje de animación.",
        "Desarrollo cinematográfico de una sola página (Next.js).",
        "Redacción en EN/ES — titulares, secciones, llamadas a la acción.",
        "SEO, imagen para redes y datos estructurados.",
        "Analítica, puesta en producción y traspaso.",
      ],
    },
    outcome: {
      en: "A digital home that finally matches the physical one.",
      es: "Un hogar digital al fin a la altura del físico.",
    },
    audience: {
      en: "Restaurants · Boutique hotels · Studios · Artists.",
      es: "Restaurantes · Hoteles boutique · Estudios · Artistas.",
    },
    pairsWith: ["seo-conversion-layer", "visual-engine"],
  },
  {
    slug: "brand-world",
    number: "03",
    worldSlug: "luxury-lifestyle-brands",
    heroImage: "/images/05_identity_chrome.jpg",
    heroImagePosition: "center 45%",
    title: {
      en: "Brand World",
      es: "Mundo de Marca",
    },
    tagline: {
      en: "A complete multi-page system. Visual language, motion, copy, build, launch.",
      es: "Un sistema multipágina completo. Lenguaje visual, animación, redacción, desarrollo y lanzamiento.",
    },
    lead: {
      en:
        "The full XNLAB engagement. A brand world for premium luxury, lifestyle, architecture or cultural groups — built as one universe across identity, motion, sites, campaigns and surfaces, with the direction held by a single hand from end to end.",
      es:
        "El encargo XNLAB completo. Un mundo de marca para grupos premium de lujo, lifestyle, arquitectura o cultura — construido como un universo único en identidad, animación, sitios, campañas y superficies, con la dirección sostenida por una sola mano de principio a fin.",
    },
    duration: { en: "8–12 weeks", es: "8–12 semanas" },
    scope: { en: "Fixed scope · 6–12 page system", es: "Alcance cerrado · Sistema de 6–12 páginas" },
    price: { en: "From €25,000", es: "Desde €25.000" },
    body: {
      en: [
        "Brand World is built for the brands that have outgrown a template, a freelancer or a generic agency. They have presence in the room, they have a real audience, and they have a budget — but their visual system does not yet hold across every surface they appear on.",
        "We define one direction (atmosphere, tone, palette, motion, voice) and apply it across the brand's full digital surface — multi-page site, identity, motion language, campaign system, content rules and launch architecture. Everything lives in the same world.",
        "This is the engagement where the studio earns its name. We do not ship deliverables, we ship a coherent world the brand can grow into for years.",
      ],
      es: [
        "Brand World está pensado para marcas que ya han superado la plantilla, el freelance o la agencia genérica. Tienen presencia en la sala, tienen audiencia real y tienen presupuesto — pero su sistema visual aún no sostiene en cada superficie en la que aparecen.",
        "Definimos una sola dirección (atmósfera, tono, paleta, animación, voz) y la aplicamos en la totalidad de la superficie digital de la marca — sitio multipágina, identidad, lenguaje de animación, sistema de campañas, reglas de contenido y arquitectura de lanzamiento. Todo vive en el mismo mundo.",
        "Es el encargo donde el estudio se gana su nombre. No entregamos entregables sueltos, entregamos un mundo coherente al que la marca puede crecer durante años.",
      ],
    },
    includes: {
      en: [
        "Brand direction and atmosphere brief.",
        "Multi-page system (6–12 routes).",
        "Identity surfaces: marks, type, palette, motion.",
        "Full copy direction in EN/ES.",
        "Technical build, SEO, structured data.",
        "Launch direction and post-launch tuning.",
      ],
      es: [
        "Dirección de marca y brief atmosférico.",
        "Sistema multipágina (6–12 secciones).",
        "Superficies de identidad: marca, tipografía, paleta, animación.",
        "Dirección completa de redacción en EN/ES.",
        "Desarrollo técnico, SEO y datos estructurados.",
        "Dirección de lanzamiento y afinado posterior.",
      ],
    },
    outcome: {
      en: "A brand that walks into the room before the founder does.",
      es: "Una marca que entra en la sala antes que el fundador.",
    },
    audience: {
      en: "Hotel groups · Cultural venues · Architecture studios · Wellness houses.",
      es: "Grupos hoteleros · Espacios culturales · Estudios de arquitectura · Marcas de wellness.",
    },
    pairsWith: ["visual-engine", "campaign-system"],
  },
  {
    slug: "visual-engine",
    number: "04",
    worldSlug: "cultural-digital-worlds",
    heroImage: "/images/06_spatial_green.jpg",
    heroImagePosition: "center 40%",
    title: {
      en: "Visual Engine",
      es: "Motor Visual",
    },
    tagline: {
      en: "A continuous creative system. One campaign per month, end to end.",
      es: "Un sistema creativo continuo. Una campaña al mes, de principio a fin.",
    },
    lead: {
      en:
        "Monthly creative direction for brands in flight. We deliver one campaign each month — visuals, motion, copy, AI-extended production — under the same single direction. No agency-style account layers, no random freelancers, no drift.",
      es:
        "Dirección creativa mensual para marcas en marcha. Entregamos una campaña al mes — visuales, animación, redacción, producción extendida con IA — bajo la misma dirección. Sin capas de agencia, sin freelancers sueltos, sin deriva.",
    },
    duration: { en: "Monthly · 6-month minimum", es: "Mensual · 6 meses mínimo" },
    scope: { en: "Recurring · One campaign per month", es: "Recurrente · Una campaña al mes" },
    price: { en: "From €4,000 / month", es: "Desde €4.000 / mes" },
    body: {
      en: [
        "Premium brands lose direction the moment they go from one big launch to a stream of small ones. Visual Engine is for the brands that have already invested in a Brand World and now need to keep shipping cultural moments without diluting the system.",
        "Every month we direct one campaign end to end — concept, visuals, motion, copy, micro-page or social grid, deploy. We use AI to extend production where it raises the level, never to dilute the direction.",
        "The studio stays on the brand. The brand stays on direction. The output stays on world.",
      ],
      es: [
        "Las marcas premium pierden dirección en el momento en que pasan de un lanzamiento grande a un flujo de lanzamientos pequeños. Visual Engine es para las marcas que ya han invertido en un Brand World y ahora necesitan seguir publicando momentos culturales sin diluir el sistema.",
        "Cada mes dirigimos una campaña de principio a fin — concepto, visuales, animación, redacción, micro-página o cuadrícula social, despliegue. Usamos IA para extender la producción cuando eleva el nivel, nunca para diluir la dirección.",
        "El estudio se queda dentro de la marca. La marca se queda dentro de la dirección. La salida se queda dentro del mundo.",
      ],
    },
    includes: {
      en: [
        "One campaign per month, end-to-end.",
        "Visual production: imagery, motion, copy.",
        "AI-assisted direction and asset extension.",
        "Site updates and surface refinement.",
        "Monthly direction call and report.",
      ],
      es: [
        "Una campaña al mes, de principio a fin.",
        "Producción visual: imagen, animación, redacción.",
        "Dirección asistida por IA y extensión de activos.",
        "Actualizaciones del sitio y refinamiento de superficies.",
        "Llamada mensual de dirección e informe.",
      ],
    },
    outcome: {
      en: "A brand that ships culture, not posts.",
      es: "Una marca que envía cultura, no posts.",
    },
    audience: {
      en: "Brands in flight that need continuous direction, not deliverables.",
      es: "Marcas en marcha que necesitan dirección continua, no entregables sueltos.",
    },
    pairsWith: ["brand-world", "campaign-system"],
  },
  {
    slug: "seo-conversion-layer",
    number: "05",
    worldSlug: "architecture-spatial-design",
    heroImage: "/images/07_sculptural_white.jpg",
    heroImagePosition: "center 55%",
    title: {
      en: "SEO & Conversion Layer",
      es: "SEO y Conversión",
    },
    tagline: {
      en: "For existing websites that look good, but are not being found, understood or converted.",
      es: "Para sitios existentes que se ven bien, pero que aún no se encuentran, no se entienden o no convierten.",
    },
    lead: {
      en:
        "A surgical pass on an existing site. We fix the technical SEO, the structured data, the analytics, the conversion structure and the clarity layer — so search engines, AI systems and humans can all read the brand the same way.",
      es:
        "Una pasada quirúrgica sobre un sitio existente. Arreglamos el SEO técnico, los datos estructurados, la analítica, la estructura de conversión y la capa de claridad — para que motores de búsqueda, sistemas de IA y humanos lean la marca de la misma forma.",
    },
    duration: { en: "1–2 weeks", es: "1–2 semanas" },
    scope: { en: "Fixed scope · Existing site", es: "Alcance cerrado · Sitio existente" },
    price: { en: "From €1,500", es: "Desde €1.500" },
    body: {
      en: [
        "Most premium sites are beautiful and invisible at the same time. The atmosphere is there, but the search engines do not see it, the AI assistants do not understand it, the analytics is half wired, and the conversion path is full of polite friction.",
        "We do not redesign the brand. We add a precise infrastructure layer underneath — technical SEO, structured data for AI parsing, analytics dashboards, conversion clarity, performance and accessibility. The brand's atmosphere stays intact; its readability and findability multiply.",
      ],
      es: [
        "La mayoría de los sitios premium son bellos e invisibles al mismo tiempo. La atmósfera está, pero los buscadores no la ven, los asistentes de IA no la entienden, la analítica está a medias, y el camino de conversión está lleno de fricciones educadas.",
        "No rediseñamos la marca. Añadimos una capa de infraestructura precisa por debajo — SEO técnico, datos estructurados para que la IA pueda leer, paneles de analítica, claridad de conversión, rendimiento y accesibilidad. La atmósfera de la marca queda intacta; su legibilidad y su capacidad de ser encontrada se multiplican.",
      ],
    },
    includes: {
      en: [
        "Technical SEO audit and fixes.",
        "Structured data and metadata system.",
        "Analytics, Search Console and dashboards.",
        "Conversion and clarity tuning.",
        "Performance and accessibility refinement.",
      ],
      es: [
        "Auditoría técnica de SEO y correcciones.",
        "Datos estructurados y sistema de metadatos.",
        "Analítica, Search Console y paneles.",
        "Afinado de conversión y claridad.",
        "Repaso de rendimiento y accesibilidad.",
      ],
    },
    outcome: {
      en: "Direction that search engines, AI systems and humans can all read clearly.",
      es: "Dirección que buscadores, sistemas de IA y humanos pueden leer con la misma claridad.",
    },
    audience: {
      en: "Brands with a beautiful site that is not yet found, understood or converted.",
      es: "Marcas con un buen sitio que aún no se encuentra, no se entiende o no convierte.",
    },
    pairsWith: ["perception-upgrade-sprint", "digital-atmosphere"],
  },
  {
    slug: "perception-upgrade-sprint",
    number: "06",
    worldSlug: "music-cultural-artists",
    heroImage: "/images/08_reflective_table.jpg",
    heroImagePosition: "center 45%",
    title: {
      en: "Perception Upgrade Sprint",
      es: "Sprint de Mejora de Percepción",
    },
    tagline: {
      en: "A focused upgrade for brands whose digital presence no longer matches the level of the product.",
      es: "Una mejora enfocada para marcas cuya presencia digital ya no está a la altura del producto.",
    },
    lead: {
      en:
        "Two to four weeks. One sharp commercial diagnosis, one tight redirection, one report. For brands with a working site that has fallen behind the brand itself — without forcing a full rebuild.",
      es:
        "De dos a cuatro semanas. Un diagnóstico comercial preciso, una redirección puntual, un informe. Para marcas con un sitio que funciona pero que se ha quedado atrás de la marca misma — sin forzar una reconstrucción completa.",
    },
    duration: { en: "2–4 weeks", es: "2–4 semanas" },
    scope: { en: "Fixed scope · Targeted upgrade", es: "Alcance cerrado · Mejora puntual" },
    price: { en: "From €2,500 – €4,000", es: "Desde €2.500 – €4.000" },
    body: {
      en: [
        "Some brands do not need a new site — they need to be pulled forward. The product has matured, the audience has matured, but the digital surface still speaks in the brand's old voice. A full rebuild is overkill; doing nothing is the slow leak.",
        "We diagnose the perception gap precisely, redirect the key surfaces, rewrite the headlines and CTAs, upgrade the motion language, and hand back a written roadmap for what to do next. Two to four weeks. One direction. No noise.",
      ],
      es: [
        "Algunas marcas no necesitan un sitio nuevo — necesitan que las empujen hacia adelante. El producto ha madurado, la audiencia ha madurado, pero la superficie digital sigue hablando con la voz vieja de la marca. Reconstruir es excesivo; no hacer nada es la fuga lenta.",
        "Diagnosticamos el gap de percepción con precisión, redirigimos las superficies clave, reescribimos titulares y llamadas a la acción, subimos el nivel del lenguaje de animación, y devolvemos una hoja de ruta escrita para lo siguiente. De dos a cuatro semanas. Una dirección. Sin ruido.",
      ],
    },
    includes: {
      en: [
        "Perception gap diagnosis.",
        "Targeted redirection across key surfaces.",
        "Headline and CTA rewrite.",
        "Motion and visual upgrades on existing pages.",
        "Final report and onward roadmap.",
      ],
      es: [
        "Diagnóstico del gap de percepción.",
        "Redirección puntual en superficies clave.",
        "Reescritura de titulares y llamadas a la acción.",
        "Mejoras de animación y visuales en páginas existentes.",
        "Informe final y hoja de ruta.",
      ],
    },
    outcome: {
      en: "An existing brand pulled forward without a full rebuild.",
      es: "Una marca existente impulsada sin necesidad de reconstruir todo.",
    },
    audience: {
      en: "Brands with a working site that is no longer at the level of the product.",
      es: "Marcas con un sitio que funciona pero que ya no está a la altura del producto.",
    },
    pairsWith: ["seo-conversion-layer", "brand-world"],
  },
];

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return serviceDetails.find((s) => s.slug === slug);
}
