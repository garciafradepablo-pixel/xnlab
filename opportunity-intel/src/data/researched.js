// =============================================================================
// researched.js — REAL, researched opportunities (Spain).
//
// This dataset is intentionally EMPTY until populated with genuinely verified,
// cited leads. It is the production counterpart to the synthetic `seed.js`.
//
// Why empty? The system's first rule is absolute: "No evidence = do not claim
// it." A real lead may only be added here once it carries at least THREE
// concrete evidence points, each with a real, working citation URL. Inventing
// plausible-looking entries would violate the exact discipline the tool exists
// to enforce — so this file ships empty rather than fabricated.
//
// ── How to populate ─────────────────────────────────────────────────────────
// Two honest paths, no fabrication:
//
//   1. Live connectors (automated). Run discovery + enrichment with real
//      sources and API keys; the WebsiteAdapter already works against any
//      reachable URL:
//          node bin/run.mjs --enrich
//      Wire discovery (Google Places / directories) ahead of it to build the
//      ~1,000 candidate pool, then export and curate the survivors into here.
//
//   2. Manual research (analyst). For each candidate, follow the protocol
//      below and only keep it if it clears the 3-evidence bar.
//
// ── Research protocol (per lead) ────────────────────────────────────────────
//   • Transition signal — find a dated press/opening/expansion/funding source.
//   • Why now — the date of that source is the timing hook.
//   • Economic capacity — multi-location / premium / funding amount, cited.
//   • Decision maker — named founder/CEO/owner + a real LinkedIn/contact.
//   • Tension / pain / lever — VERIFY before claiming. Fetch the site (stale
//     copyright? no booking CTA? not responsive?); read reviews. If you cannot
//     verify, set the signal to GREY and the evidence tier low — do not invent.
//   Be conservative: a real lead with three solid citations and several greys
//   SHOULD score below the synthetic all-green archetypes. That is correct.
//
// ── Entry shape (same schema as seed.js) ────────────────────────────────────
//   Use the helper below. Signal shorthand `S` is the 10-char string mapping to
//   models.FILTER_KEYS in order; codes G/Y/R/X = green/yellow/red/grey.
//
//   mkReal({
//     id, company, sector, subsector, city, region,
//     website, instagram, linkedin, googleMaps, phone, email,
//     dm: { name, role, linkedin },
//     S: "YGX GYR ...",            // be conservative; grey what you can't verify
//     evidence: [ ev("transitionSignal","press","El Diario",
//                    "Abrió segunda sede en …, mar 2025", 3,
//                    "https://real-source.example/article") , … ],   // ≥3, real URLs
//     tensions: ["growth_structure", …],
//     thesis, summary, whyNow, whyBeforeOthers, blindSpot, firstLever,
//     offer: "reposition", callOpening, objection, objectionResponse,
//     reasonsNotToCall: [...], invalidators: [...],
//     researchedAt: "2026-05-29", sources: ["https://…", "https://…"],
//   })
// =============================================================================

import { FILTER_KEYS } from "../models.js";

const CODE = { G: "green", Y: "yellow", R: "red", X: "grey" };

function expandSignals(s) {
  const out = {};
  const chars = String(s || "").replace(/\s/g, "").split("");
  FILTER_KEYS.forEach((key, i) => {
    out[key] = { level: CODE[chars[i]] || "grey" };
  });
  return out;
}

/** Evidence helper — a real citation URL is REQUIRED for researched leads. */
export const ev = (filter, type, source, note, tier, url) => {
  if (!url) {
    // Loud signal during development that an entry is missing its citation.
    console.warn(`[researched] evidence on "${filter}" has no citation URL — it must not ship.`);
  }
  return { filter, type, source, note, tier, url: url || null };
};

/** Normalise a researched row. `synthetic` is false; carries provenance. */
export function mkReal(row) {
  const { S, dm, offer, researchedAt, sources, ...rest } = row;
  return {
    country: "Spain",
    synthetic: false,
    researched: true,
    researchedAt: researchedAt || null,
    sources: sources || [],
    signals: expandSignals(S),
    decisionMaker: dm,
    suggestedOfferKey: offer,
    ...rest,
  };
}

// ── The researched pilot ────────────────────────────────────────────────────
// Press-VERIFIED *moments* (openings, funding, expansions) with real citation
// URLs, researched 2026-05-29 via web search. Honest limits of this pass:
// page fetching was blocked, so websites, contacts, reviews and on-site tension
// could NOT be verified — those signals are GREY and the first lever for every
// lead is "verify the site + find the decision maker". Scores are intentionally
// modest: a real moment with unverified tension is a hypothesis, not a closed
// case. Enrich (bin/run.mjs --enrich) before calling.
export const RESEARCHED = [
  mkReal({
    id: "r-casa-limonero",
    company: "La Casa del Limonero",
    sector: "hospitality",
    subsector: "Boutique luxury hotel (15th-c palace)",
    city: "Sevilla",
    region: "Andalucía",
    website: null,
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Owner / GM (to identify)", linkedin: null },
    S: "GGXYXGXYGY",
    offer: "web_funnel",
    researchedAt: "2026-05-29",
    sources: ["https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html"],
    evidence: [
      ev("transitionSignal", "press", "Hosteltur", "Abrió en marzo de 2025: hotel boutique de lujo en una casa-palacio del s.XV (barrio Santa Cruz, Sevilla), 14 habitaciones tras reforma integral.", 3, "https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html"),
      ev("whyNow", "press", "Hosteltur", "Apertura reciente — primera temporada alta completa por delante; momento óptimo para captación directa.", 2, "https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html"),
      ev("economicCapacity", "press", "Hosteltur", "Posicionamiento alta gama (casa-palacio, pequeña escala) implica ADR elevado y margen para invertir en marca/web.", 2, "https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html"),
    ],
    tensions: ["quality_perception", "visibility_conversion"],
    thesis: "This company is likely leaking margin to OTAs because it has not yet solved (verify) a direct-booking experience worthy of a newly-opened luxury palace hotel.",
    summary: "A 14-room luxury boutique hotel opened in a 15th-century Seville palace in March 2025. The opening and premium positioning are press-verified; the website, booking flow and contacts are not — so this is a strong moment awaiting enrichment.",
    whyNow: "Opened spring 2025 — first full high season ahead; the window to own direct booking is now.",
    whyBeforeOthers: "A genuinely premium, fresh-opening hospitality moment with obvious case-study value — strong on timing and capacity even before enrichment.",
    blindSpot: "Newly-opened luxury hotels often default to OTA dependence; direct-booking margin is the quiet lever.",
    firstLever: "Verify site + booking flow; if weak, a direct-booking experience and brand story for the palace.",
    callOpening: "Enhorabuena por la apertura en Santa Cruz — un palacio del XV con 14 habitaciones es una joya. ¿Cómo estáis gestionando la reserva directa frente a las OTAs esta primera temporada?",
    objection: "Estamos recién abiertos, ahora no es el momento.",
    objectionResponse: "Justo por eso: la primera temporada fija vuestra dependencia de OTAs para años. Un mini-audit de 15 minutos os dice cuánto se va en comisión.",
    reasonsNotToCall: ["Just opened — may lack bandwidth.", "Could already use a hospitality marketing partner.", "Contacts/website unverified."],
    invalidators: ["They already run a strong direct-booking engine.", "An agency is already engaged for the launch."],
  }),

  mkReal({
    id: "r-foodiefame",
    company: "FoodieFame",
    sector: "growth",
    subsector: "Funded foodtech / brand house",
    city: "Madrid",
    region: "Madrid",
    website: null,
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Founder / CEO (to identify)", linkedin: null },
    S: "GGXYXGXYGY",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.elpublicista.es/anunciantes/foodiefame-cierra-ronda-seed-800-000-para-acelerar-expansion",
      "https://restauracionnews.com/2025/07/foodiefame-ronda-seed/",
    ],
    evidence: [
      ev("transitionSignal", "funding", "El Publicista", "Cerró ronda Seed de 800.000€ (jul 2025), co-liderada por N Ventures, Pascual Innoventures y Lukkap; planea lanzar marcas propias y entrar en retail/comida preparada.", 3, "https://www.elpublicista.es/anunciantes/foodiefame-cierra-ronda-seed-800-000-para-acelerar-expansion"),
      ev("economicCapacity", "press", "Restauración News", "Superó 500.000€ de ingresos en sus primeros 9 meses y prevé triplicarlos en 2025.", 2, "https://restauracionnews.com/2025/07/foodiefame-ronda-seed/"),
      ev("whyNow", "funding", "El Publicista", "Post-ronda: despliegue de capital en nuevas marcas y líneas — momento de fijar marca y posicionamiento.", 2, "https://www.elpublicista.es/anunciantes/foodiefame-cierra-ronda-seed-800-000-para-acelerar-expansion"),
    ],
    tensions: ["growth_structure", "ambition_maturity", "expansion_systems"],
    thesis: "This company is likely about to spend its raise on execution before it has solved (verify) the brand/positioning foundation its new proprietary lines need.",
    summary: "A foodtech brand-house closed an €800k seed in mid-2025 and is launching its first proprietary brands and retail lines. The funding and expansion are press-verified; the brand maturity and contacts are not. A fundable post-raise moment.",
    whyNow: "Capital raised mid-2025 is being deployed into new brands now — the foundation should be set before the spend.",
    whyBeforeOthers: "Funded + actively expanding + creative brand mandate = high upside and a natural XN-scope conversation.",
    blindSpot: "Launching multiple consumer brands without a unifying system produces inconsistency, not equity.",
    firstLever: "Identify the founder; propose a brand/positioning system for the new proprietary lines.",
    callOpening: "Enhorabuena por la ronda. Antes de lanzar las marcas propias, ¿tenéis ya un sistema de marca sobre el que ejecutar o se irá definiendo sobre la marcha?",
    objection: "Tenemos equipo creativo interno.",
    objectionResponse: "Perfecto — ese equipo rinde más sobre una base estratégica clara. Nosotros montamos la base, ellos ejecutan rápido.",
    reasonsNotToCall: ["Investors may have a preferred agency.", "Founder bandwidth post-raise.", "Contacts unverified."],
    invalidators: ["A brand studio is already engaged.", "Brand system already exists."],
  }),

  mkReal({
    id: "r-arzabal",
    company: "Grupo Arzábal",
    sector: "hospitality",
    subsector: "Premium restaurant group",
    city: "Madrid",
    region: "Madrid",
    website: null,
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Founders / owners (to identify)", linkedin: null },
    S: "GGXYXGXYGY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: ["https://www.gastroeconomy.com/2025/01/agenda-de-aperturas-de-nuevos-restaurantes-en-2025/"],
    evidence: [
      ev("transitionSignal", "press", "Gastroeconomy", "Abrió Arzábal Bernabéu: local de dos plantas con cocina abierta, barra gastronómica, charcutería y comedor de 100 plazas con vistas al estadio.", 3, "https://www.gastroeconomy.com/2025/01/agenda-de-aperturas-de-nuevos-restaurantes-en-2025/"),
      ev("whyNow", "press", "Gastroeconomy", "Apertura emblemática reciente (2025) — visibilidad y aforo nuevos que llenar.", 2, "https://www.gastroeconomy.com/2025/01/agenda-de-aperturas-de-nuevos-restaurantes-en-2025/"),
      ev("economicCapacity", "press", "Gastroeconomy", "Grupo consolidado de Madrid con varios locales premium; nueva sede de gran formato.", 2, "https://www.gastroeconomy.com/2025/01/agenda-de-aperturas-de-nuevos-restaurantes-en-2025/"),
    ],
    tensions: ["expansion_systems", "visibility_conversion"],
    thesis: "This company is likely under-filling a large new venue's covers/events because it has not yet solved (verify) reservation and events capture for a 100-seat flagship.",
    summary: "An established Madrid restaurant group opened a 100-seat flagship with Bernabéu views in 2025. The opening and group scale are press-verified; the digital/reservation setup is not. A real expansion moment.",
    whyNow: "A large new flagship opened in 2025 — filling covers and events is an immediate revenue lever.",
    whyBeforeOthers: "Consolidated, premium group with a fresh large-format opening — credible capacity and timing.",
    blindSpot: "Group reputation can mask a thin events-capture funnel on a brand-new big venue.",
    firstLever: "Verify reservation/events flow; propose a capture funnel for the new flagship.",
    callOpening: "Arzábal Bernabéu con 100 plazas y vistas al estadio es un pelotazo. ¿Cómo estáis capturando reservas y eventos para el aforo nuevo?",
    objection: "Tenemos lleno sin esfuerzo.",
    objectionResponse: "El servicio sí; los eventos privados de alto ticket se pierden si la captación no está montada. Os enseño dónde.",
    reasonsNotToCall: ["Established group may have in-house marketing.", "Contacts unverified."],
    invalidators: ["They already run a strong events funnel.", "In-house team owns it."],
  }),

  mkReal({
    id: "r-gastroportal-manero",
    company: "GastroPortal (marca Manero)",
    sector: "hospitality",
    subsector: "Growing premium restaurant brand",
    city: "Alicante",
    region: "Comunidad Valenciana",
    website: null,
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Carlos Bosch", role: "Founder", linkedin: null },
    S: "GYXYXYYYGY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: ["https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/"],
    evidence: [
      ev("transitionSignal", "press", "Gastroeconomy", "GastroPortal crece con la marca Manero: ya un local en Alicante y dos en Madrid, con continuidad de aperturas prevista.", 2, "https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/"),
      ev("reachableDecisionMaker", "press", "Gastroeconomy", "Fundador y líder identificado por nombre: Carlos Bosch.", 2, "https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/"),
      ev("economicCapacity", "press", "Gastroeconomy", "Expansión multi-ciudad de la marca (Alicante + 2 Madrid) sugiere tracción y capacidad.", 2, "https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/"),
    ],
    tensions: ["growth_structure", "ambition_maturity"],
    thesis: "This company is likely scaling a brand faster than its brand system because it has not yet solved (verify) consistent positioning across a multi-city expansion.",
    summary: "GastroPortal is expanding the Manero brand across Alicante and Madrid under a named founder, Carlos Bosch. The expansion and the decision maker are press-verified; the brand consistency and contacts are not.",
    whyNow: "Multi-city expansion in progress — the moment to lock brand consistency before more openings.",
    whyBeforeOthers: "Has a NAMED, reachable founder (rare in this pass) plus real multi-city growth.",
    blindSpot: "Each new city dilutes a brand that hasn't been systematised.",
    firstLever: "Reach Carlos Bosch; audit brand consistency across the Manero locations.",
    callOpening: "Carlos, Manero está creciendo bien entre Alicante y Madrid. Con cada apertura nueva, ¿cómo mantenéis la marca igual de afilada en todas?",
    objection: "Cada local tiene su propia vida.",
    objectionResponse: "Esa es la trampa del crecimiento: lo que da carácter local no debe romper el sistema de marca. Os enseño cómo compatibilizar ambos.",
    reasonsNotToCall: ["Restaurant margins can be tight.", "LinkedIn/direct contact still to find."],
    invalidators: ["Brand system already in place.", "Expansion paused."],
  }),

  mkReal({
    id: "r-promora",
    company: "Promora (Impulsa by Promora)",
    sector: "realestate",
    subsector: "Luxury residential developer",
    city: "Madrid",
    region: "Madrid",
    website: null,
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Direction (to identify)", linkedin: null },
    S: "GGXYXYXYYX",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: ["https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera"],
    evidence: [
      ev("transitionSignal", "press", "Idealista", "La inmobiliaria de lujo más antigua de La Moraleja (+50 años) lanzó 'Impulsa by Promora', un modelo de expansión que rompe con la lógica clásica.", 3, "https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera"),
      ev("economicCapacity", "press", "Idealista", "Especialista en residencial de lujo con más de 50 años de trayectoria.", 2, "https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera"),
      ev("whyNow", "press", "Idealista", "Lanzamiento reciente de la línea 'Impulsa' — momento de definir su marca y narrativa.", 2, "https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera"),
    ],
    tensions: ["price_communication", "ambition_maturity"],
    thesis: "This company is likely launching a new line without a matching brand narrative because it has not yet solved (verify) the positioning for 'Impulsa by Promora'.",
    summary: "A 50-year luxury La Moraleja developer launched a new expansion model, 'Impulsa by Promora'. The launch and pedigree are press-verified; whether the new line has a brand system is not. A premium, established player — likely already has partners.",
    whyNow: "A new sub-brand just launched — the window to define its positioning is open.",
    whyBeforeOthers: "Very high capacity and a genuine new-line launch, though established players often already have agencies (hence conservative fit).",
    blindSpot: "A new expansion model needs its own narrative, not the parent's by default.",
    firstLever: "Identify direction; assess whether 'Impulsa' has a distinct brand system.",
    callOpening: "El lanzamiento de Impulsa by Promora es un cambio de modelo grande. ¿La nueva línea tiene su propia narrativa de marca o hereda la de Promora?",
    objection: "Llevamos 50 años, sabemos de marca.",
    objectionResponse: "Sin duda — por eso un modelo nuevo merece una narrativa propia y no una extensión por defecto. Es justo donde aportamos.",
    reasonsNotToCall: ["Established developer likely has an agency.", "Long sales cycles.", "Contacts unverified."],
    invalidators: ["Impulsa already has a distinct brand system.", "An agency is engaged."],
  }),

  mkReal({
    id: "r-sierra-blanca",
    company: "Sierra Blanca Estates",
    sector: "realestate",
    subsector: "Luxury residential developer",
    city: "Marbella",
    region: "Andalucía",
    website: null,
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Direction (to identify)", linkedin: null },
    S: "GGXYXYXYYX",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: ["https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/"],
    evidence: [
      ev("transitionSignal", "press", "Brains Real Estate News", "Plan de inversión de 500 millones de euros en residencial de lujo (Marbella / Costa del Sol).", 3, "https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/"),
      ev("economicCapacity", "press", "Brains RE", "Volumen de inversión de 500M€ en alta gama — capacidad económica muy alta.", 3, "https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/"),
      ev("whyNow", "press", "Brains RE", "Plan de expansión activo con pipeline de proyectos de lujo en marcha.", 2, "https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/"),
    ],
    tensions: ["price_communication", "expansion_systems"],
    thesis: "This company is likely launching multiple luxury projects whose individual brand worlds are not yet solved (verify) at the pace of its €500M pipeline.",
    summary: "A Marbella luxury developer with a €500M residential investment plan. The capacity and pipeline are press-verified; per-project branding and contacts are not. Very high economic potential; likely has existing partners.",
    whyNow: "An active €500M pipeline means new projects are entering sales phases that need positioning.",
    whyBeforeOthers: "Exceptional economic capacity and a real multi-project pipeline — the strongest capacity signal in the pilot.",
    blindSpot: "At pipeline scale, each project's brand world is a sales-velocity lever, not a cost.",
    firstLever: "Identify direction; target a single flagship project's brand world as an entry point.",
    callOpening: "Con un pipeline de 500 millones en residencial de lujo, cada proyecto se juega la velocidad de venta en su presentación. ¿Cómo abordáis la marca proyecto a proyecto?",
    objection: "Trabajamos con agencias internacionales.",
    objectionResponse: "Perfecto para campaña; nosotros entramos en el mundo de marca de un proyecto concreto, que es lo que sube el precio de cierre. Empezamos por uno.",
    reasonsNotToCall: ["Large developer almost certainly has agencies.", "Enterprise sales cycle.", "Contacts unverified."],
    invalidators: ["Each project already has a strong brand world.", "Locked into an agency roster."],
  }),
];

export default RESEARCHED;
