// =============================================================================
// researched.js — REAL, researched opportunities (Spain).
//
// The production counterpart to the synthetic `seed.js`. Every entry is a real
// company with a press-verified *moment* and, as of the 2026-05-29 pass, a
// verified decision maker + contact channel. Each carries at least THREE
// evidence points with real, working citation URLs.
//
// The discipline is absolute: "No evidence = do not claim it." Signals we could
// NOT verify (on-site tension, active pain, exact budget priority) are kept
// GREY/yellow on purpose — the live WebsiteAdapter (bin/run.mjs --enrich) and a
// human close those gaps. A real, half-verified moment SHOULD score below the
// synthetic all-green archetypes. That is correct, not a bug.
//
// ── How to add more ─────────────────────────────────────────────────────────
//   1. Live connectors (automated):  node bin/run.mjs --enrich
//      Wire discovery (Google Places / directories) ahead of it to build the
//      ~1,000 candidate pool, then curate survivors into here.
//   2. Manual research (analyst): follow the protocol below; keep a lead only
//      if it clears the 3-cited-evidence bar.
//
// ── Research protocol (per lead) ────────────────────────────────────────────
//   • Transition signal — a dated press/opening/expansion/funding source.
//   • Why now — the date of that source is the timing hook.
//   • Economic capacity — multi-location / premium / funding amount, cited.
//   • Decision maker — named founder/CEO/owner + a real LinkedIn/contact, cited.
//   • Tension / pain / lever — VERIFY before claiming. Fetch the site (stale
//     copyright? no booking CTA? not responsive?); read reviews. If you cannot
//     verify, set the signal to GREY and the evidence tier low — do not invent.
//
// ── Entry shape (same schema as seed.js) ────────────────────────────────────
//   Signal shorthand `S` is the 10-char string mapping to models.FILTER_KEYS in
//   order; codes G/Y/R/X = green/yellow/red/grey. Order:
//     transition, economicCapacity, visibleTension, actionableLever,
//     activePain, whyNow, reachableDecisionMaker, budgetPriority,
//     strategicFit, brutalFinalFilter
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

// ── Evidence helper — a real citation URL is REQUIRED for researched leads. ──
export const ev = (filter, type, source, note, tier, url) => {
  if (!url) {
    console.warn(`[researched] evidence on "${filter}" has no citation URL — it must not ship.`);
  }
  return { filter, type, source, note, tier, url: url || null };
};

// ── Normalise a researched row. `synthetic` is false; carries provenance. ──
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

// ── The researched pilot (6 real Spanish leads, verified 2026-05-29) ─────────
// Each has: a press-verified moment, a verified decision maker + contact, and a
// real website (so --enrich can actually audit it). Unverified signals — the
// on-site tension, active pain, exact budget priority — stay grey/yellow for the
// live adapter and the analyst to confirm. See each card's Verification block.
export const RESEARCHED = [
  mkReal({
    id: "r-casa-limonero",
    company: "La Casa del Limonero",
    sector: "hospitality",
    subsector: "Boutique luxury hotel (15th-c palace)",
    city: "Sevilla",
    region: "Andalucía",
    website: "https://www.hotelcasalimonero.com/",
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: "+34 955 44 00 70",
    email: null,
    dm: { name: "Martina Cam", role: "Owner / Director", linkedin: null },
    // transition G, econ G, tension X, lever Y, pain X, whyNow G,
    // reachableDM G (named owner + phone, cited), budget Y, fit G, brutal Y
    S: "GGXYXGGYGY",
    offer: "web_funnel",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html",
      "https://www.nuevoestilo.es/hoteles/a64574151/hotel-casa-del-limonero-barrio-de-santa-cruz-en-sevilla/",
      "https://www.hotelcasalimonero.com/",
    ],
    evidence: [
      ev("transitionSignal", "press", "Hosteltur", "Abrió en marzo de 2025: hotel boutique de lujo en una casa-palacio del s.XV (barrio Santa Cruz, Sevilla), 14 habitaciones tras reforma integral.", 3, "https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html"),
      ev("economicCapacity", "press", "Nuevo Estilo", "Casa-palacio del s.XV con galería de arte, spa con hammam y piscina — posicionamiento de lujo, ADR elevado.", 2, "https://www.nuevoestilo.es/hoteles/a64574151/hotel-casa-del-limonero-barrio-de-santa-cruz-en-sevilla/"),
      ev("whyNow", "press", "Hosteltur", "Apertura reciente — primera temporada alta completa por delante; momento óptimo para captación directa.", 2, "https://www.hosteltur.com/173311_diez-noticias-que-marcaron-el-ano-en-el-ambito-hotelero.html"),
      ev("reachableDecisionMaker", "press", "Nuevo Estilo", "Propietaria y directora identificada: Martina Cam (francesa, adquirió el inmueble en 2015, lleva 30 años en Sevilla). Teléfono publicado del hotel.", 2, "https://www.nuevoestilo.es/hoteles/a64574151/hotel-casa-del-limonero-barrio-de-santa-cruz-en-sevilla/"),
    ],
    tensions: ["quality_perception", "visibility_conversion"],
    thesis: "This company is likely leaking margin to OTAs because it has not yet solved (verify) a direct-booking experience worthy of a newly-opened luxury palace hotel.",
    summary: "A 14-room luxury boutique hotel opened in a 15th-century Seville palace in March 2025, owned and directed by Martina Cam. The opening, premium positioning and decision maker are verified; the booking-flow quality and OTA dependence still need an on-site check (the site has a reservations page — verify how well it converts).",
    whyNow: "Abrió en primavera de 2025 — primera temporada alta completa por delante; la ventana para dominar la reserva directa es ahora.",
    whyBeforeOthers: "A genuinely premium, fresh-opening hospitality moment with a named, reachable owner and obvious case-study value.",
    blindSpot: "Newly-opened luxury hotels often default to OTA dependence; direct-booking margin is the quiet lever.",
    firstLever: "Audit the existing booking flow vs OTAs; if it under-converts, a direct-booking experience and brand story for the palace.",
    callOpening: "Martina, enhorabuena por la apertura en Santa Cruz — un palacio del XV con 14 habitaciones es una joya. ¿Cómo está funcionando la reserva directa frente a las OTAs esta primera temporada?",
    objection: "Estamos recién abiertos, ahora no es el momento.",
    objectionResponse: "Justo por eso: la primera temporada fija vuestra dependencia de OTAs para años. Un mini-audit de 15 minutos os dice cuánto se va en comisión.",
    reasonsNotToCall: ["Just opened — may lack bandwidth.", "Could already use a hospitality marketing partner.", "On-site booking quality not yet verified."],
    invalidators: ["They already run a strong, high-converting direct-booking engine.", "An agency is already engaged for the launch."],
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
    linkedin: "company/foodiefame",
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Jesús Muñoz", role: "Founder / CEO", linkedin: "in/jmmunoz" },
    S: "GGXYXGGYGY",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.elpublicista.es/anunciantes/foodiefame-cierra-ronda-seed-800-000-para-acelerar-expansion",
      "https://restauracionnews.com/2025/07/foodiefame-ronda-seed/",
      "https://www.linkedin.com/in/jmmunoz/",
    ],
    evidence: [
      ev("transitionSignal", "funding", "El Publicista", "Cerró ronda Seed de 800.000€ (jul 2025), co-liderada por N Ventures, Pascual Innoventures y Lukkap; planea lanzar marcas propias y entrar en retail/comida preparada.", 3, "https://www.elpublicista.es/anunciantes/foodiefame-cierra-ronda-seed-800-000-para-acelerar-expansion"),
      ev("economicCapacity", "press", "Restauración News", "Superó 500.000€ de ingresos en sus primeros 9 meses y prevé triplicarlos en 2025.", 2, "https://restauracionnews.com/2025/07/foodiefame-ronda-seed/"),
      ev("whyNow", "funding", "El Publicista", "Post-ronda: despliegue de capital en nuevas marcas y líneas — momento de fijar marca y posicionamiento.", 2, "https://www.elpublicista.es/anunciantes/foodiefame-cierra-ronda-seed-800-000-para-acelerar-expansion"),
      ev("reachableDecisionMaker", "linkedin", "LinkedIn", "Fundador y CEO identificado: Jesús Muñoz (ex-FoodBox, Eat Out Group, Avanza Food, Deliveroo); perfil de LinkedIn público.", 2, "https://www.linkedin.com/in/jmmunoz/"),
    ],
    tensions: ["growth_structure", "ambition_maturity", "expansion_systems"],
    thesis: "This company is likely about to spend its raise on execution before it has solved (verify) the brand/positioning foundation its new proprietary lines need.",
    summary: "A foodtech brand-house closed an €800k seed in mid-2025 and is launching its first proprietary brands and retail lines, led by founder/CEO Jesús Muñoz. Funding, expansion and decision maker are verified; the brand-system maturity of the new lines still needs a look.",
    whyNow: "El capital de la ronda (mediados de 2025) se está desplegando en nuevas marcas ahora — el fundamento debería fijarse antes del gasto.",
    whyBeforeOthers: "Funded + actively expanding + reachable founder + a creative brand mandate = high upside and a natural XN-scope conversation.",
    blindSpot: "Launching multiple consumer brands without a unifying system produces inconsistency, not equity.",
    firstLever: "Reach Jesús Muñoz; propose a brand/positioning system for the new proprietary lines.",
    callOpening: "Jesús, enhorabuena por la ronda. Antes de lanzar las marcas propias, ¿tenéis ya un sistema de marca sobre el que ejecutar o se irá definiendo sobre la marcha?",
    objection: "Tenemos equipo creativo interno.",
    objectionResponse: "Perfecto — ese equipo rinde más sobre una base estratégica clara. Nosotros montamos la base, ellos ejecutan rápido.",
    reasonsNotToCall: ["Investors may have a preferred agency.", "Founder bandwidth post-raise.", "Brand-system gap not yet confirmed."],
    invalidators: ["A brand studio is already engaged.", "A unifying brand system already exists for the new lines."],
  }),

  mkReal({
    id: "r-arzabal",
    company: "Grupo Arzábal",
    sector: "hospitality",
    subsector: "Premium restaurant group",
    city: "Madrid",
    region: "Madrid",
    website: "https://www.grupoarzabal.com/",
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Iván Morales & Álvaro Castellanos", role: "Founders / owners", linkedin: null },
    S: "GGXYXGGYGY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.consumidorglobal.com/alimentacion/grupo-arzabal-15-anos-trayectoria-gastronomica-prometedora-apertura-en-bernabeu_12855_102.html",
      "https://restauracionnews.com/2023/07/grupo-arzabal-empresa/",
      "https://www.grupoarzabal.com/",
    ],
    evidence: [
      ev("transitionSignal", "press", "Consumidor Global", "Abrió Arzábal Bernabéu (dic 2024/2025): local de dos plantas con cocina abierta, barra gastronómica, charcutería y comedor de 100 plazas con vistas al estadio.", 3, "https://www.consumidorglobal.com/alimentacion/grupo-arzabal-15-anos-trayectoria-gastronomica-prometedora-apertura-en-bernabeu_12855_102.html"),
      ev("economicCapacity", "press", "Restauración News", "Grupo consolidado: facturó 16,7M€ (2022) y 17,6M€ (2023), 240 empleados, 5 locales en zonas emblemáticas de Madrid.", 3, "https://restauracionnews.com/2023/07/grupo-arzabal-empresa/"),
      ev("whyNow", "press", "Consumidor Global", "Apertura emblemática reciente (Bernabéu) — visibilidad y aforo nuevos que llenar.", 2, "https://www.consumidorglobal.com/alimentacion/grupo-arzabal-15-anos-trayectoria-gastronomica-prometedora-apertura-en-bernabeu_12855_102.html"),
      ev("reachableDecisionMaker", "press", "Consumidor Global", "Fundadores y propietarios identificados: Iván Morales y Álvaro Castellanos (desde 2009). Web de grupo con contacto.", 2, "https://www.consumidorglobal.com/alimentacion/grupo-arzabal-15-anos-trayectoria-gastronomica-prometedora-apertura-en-bernabeu_12855_102.html"),
    ],
    tensions: ["expansion_systems", "visibility_conversion"],
    thesis: "This company is likely under-monetising high-ticket private events at a new 100-seat flagship because it has not yet solved (verify) a dedicated events-capture funnel beyond table reservations.",
    summary: "An established Madrid group (€17.6M turnover, 240 staff, founders Iván Morales & Álvaro Castellanos) opened a 100-seat Bernabéu flagship. Opening, scale and decision makers are verified; the site has table reservations, so the real question to verify is the high-ticket events-capture funnel.",
    whyNow: "Acaban de abrir un buque insignia grande — llenar mesas y eventos privados es una palanca de ingresos inmediata.",
    whyBeforeOthers: "Consolidated, premium group with verified founders and a fresh large-format opening — credible capacity and timing.",
    blindSpot: "Table reservations are handled; the high-margin private-events pipeline for a venue with stadium views may not be.",
    firstLever: "Audit the events/private-dining capture path (not table booking); propose a dedicated funnel for the flagship.",
    callOpening: "Arzábal Bernabéu con 100 plazas y vistas al estadio es un pelotazo. Las reservas de mesa las tenéis montadas — ¿y los eventos privados de alto ticket, cómo los estáis capturando?",
    objection: "Tenemos lleno sin esfuerzo.",
    objectionResponse: "El servicio de mesa sí; los eventos privados de alto ticket se pierden si la captación no está montada aparte. Os enseño dónde.",
    reasonsNotToCall: ["Established group likely has in-house marketing.", "Events funnel gap not yet confirmed."],
    invalidators: ["They already run a dedicated events funnel.", "An in-house team owns events capture."],
  }),

  mkReal({
    id: "r-gastroportal-manero",
    company: "Grupo GastroPortal (marca Manero)",
    sector: "hospitality",
    subsector: "Growing premium restaurant brand",
    city: "Alicante",
    region: "Comunidad Valenciana",
    website: "https://www.grupogastroportal.com/",
    instagram: null,
    linkedin: "company/grupo-gastroportal",
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Carlos Bosch", role: "Founder / CEO", linkedin: null },
    S: "GYXYXYGYGY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/",
      "https://www.revistarestauradores.com/single-post/tras-el-nuevo-manero-balmis-de-alicante-el-grupo-gastroportal-desembarca-en-lisboa",
      "https://www.grupogastroportal.com/",
    ],
    evidence: [
      ev("transitionSignal", "press", "Revista Restauradores", "Tras el nuevo Manero Balmis en Alicante, el grupo desembarca en Lisboa — expansión nacional e internacional en marcha.", 3, "https://www.revistarestauradores.com/single-post/tras-el-nuevo-manero-balmis-de-alicante-el-grupo-gastroportal-desembarca-en-lisboa"),
      ev("economicCapacity", "press", "Gastroeconomy", "Marca Manero con 6 restaurantes entre Madrid y Alicante; concepto de 'tapas de lujo' en expansión.", 2, "https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/"),
      ev("whyNow", "press", "Revista Restauradores", "Apertura reciente (Balmis) + salto a Lisboa — momento de consolidar la marca antes de más aperturas.", 2, "https://www.revistarestauradores.com/single-post/tras-el-nuevo-manero-balmis-de-alicante-el-grupo-gastroportal-desembarca-en-lisboa"),
      ev("reachableDecisionMaker", "press", "Gastroeconomy", "Fundador y CEO identificado: Carlos Bosch; web corporativa (grupogastroportal.com) y LinkedIn de empresa.", 2, "https://www.gastroeconomy.com/2025/09/agenda-de-aperturas-de-nuevos-restaurantes-del-otono-2025/"),
    ],
    tensions: ["growth_structure", "ambition_maturity"],
    thesis: "This company is likely scaling a brand faster than its brand system because it has not yet solved (verify) consistent positioning across a multi-city, now international expansion.",
    summary: "GastroPortal is expanding Manero across Alicante, Madrid and now Lisbon under founder/CEO Carlos Bosch. Expansion and decision maker are verified; whether brand consistency holds across cities (and into Portugal) is the open question.",
    whyNow: "Expansión multi-ciudad más el salto internacional a Lisboa — el momento de fijar la consistencia de marca antes de más aperturas.",
    whyBeforeOthers: "A named, reachable founder, a corporate site to audit, and real (now cross-border) growth.",
    blindSpot: "Each new city — especially a new country — dilutes a brand that hasn't been systematised.",
    firstLever: "Reach Carlos Bosch; audit brand consistency across Manero locations before the Lisbon launch sets a divergent tone.",
    callOpening: "Carlos, Manero está creciendo fuerte — Alicante, Madrid y ahora Lisboa. Con el salto internacional, ¿cómo mantenéis la marca igual de afilada en todas?",
    objection: "Cada local tiene su propia vida.",
    objectionResponse: "Esa es la trampa del crecimiento: lo que da carácter local no debe romper el sistema de marca. Y cruzando frontera, más. Os enseño cómo compatibilizar ambos.",
    reasonsNotToCall: ["Restaurant margins can be tight.", "May have in-house brand resource.", "Brand-consistency gap not yet confirmed."],
    invalidators: ["A brand system is already in place across locations.", "Expansion paused."],
  }),

  mkReal({
    id: "r-promora",
    company: "Promora (Impulsa by Promora)",
    sector: "realestate",
    subsector: "Luxury residential agency / developer",
    city: "Madrid",
    region: "Madrid",
    website: "https://www.promora.com/",
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: "+34 91 650 42 42",
    email: null,
    dm: { name: "Carlos Morón Fernández", role: "Director, Promora La Moraleja", linkedin: null },
    S: "GGXYXYGYYX",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera",
      "https://www.promora.com/es/contacto/inmobiliaria-la-moraleja",
    ],
    evidence: [
      ev("transitionSignal", "press", "Idealista", "La inmobiliaria de lujo más antigua de La Moraleja (desde 1975) lanzó 'Impulsa by Promora', un modelo de expansión que rompe con la lógica clásica.", 3, "https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera"),
      ev("economicCapacity", "press", "Idealista", "Especialista en residencial de lujo con ~50 años de trayectoria en la zona más exclusiva de Madrid.", 2, "https://www.idealista.com/news/inmobiliario/vivienda/2026/04/23/893968-tres-meses-y-una-casa-asi-conquista-espana-la-inmobiliaria-de-lujo-con-mas-solera"),
      ev("reachableDecisionMaker", "directory", "Promora (web oficial)", "Director identificado: Carlos Morón Fernández (oficina La Moraleja); teléfono y dirección publicados.", 2, "https://www.promora.com/es/contacto/inmobiliaria-la-moraleja"),
    ],
    tensions: ["price_communication", "ambition_maturity"],
    thesis: "This company is likely launching a new line without a matching brand narrative because it has not yet solved (verify) the positioning for 'Impulsa by Promora'.",
    summary: "A ~50-year luxury La Moraleja agency launched a new expansion model, 'Impulsa by Promora', with director Carlos Morón Fernández reachable. The launch, pedigree and contact are verified; whether the new line has its own brand system is not.",
    whyNow: "Acaban de lanzar una nueva submarca — la ventana para definir su posicionamiento está abierta.",
    whyBeforeOthers: "High capacity, a genuine new-line launch, and a named contact — though established players often already have agencies.",
    blindSpot: "A new expansion model needs its own narrative, not the parent's by default.",
    firstLever: "Reach the La Moraleja office; assess whether 'Impulsa' has a distinct brand system.",
    callOpening: "El lanzamiento de Impulsa by Promora es un cambio de modelo grande. ¿La nueva línea tiene su propia narrativa de marca o hereda la de Promora?",
    objection: "Llevamos 50 años, sabemos de marca.",
    objectionResponse: "Sin duda — por eso un modelo nuevo merece una narrativa propia y no una extensión por defecto. Es justo donde aportamos.",
    reasonsNotToCall: ["Established agency may have a partner.", "Long sales cycles.", "Whether Impulsa lacks its own system is unconfirmed."],
    invalidators: ["Impulsa already has a distinct brand system.", "An agency is engaged."],
  }),

  mkReal({
    id: "r-sierra-blanca",
    company: "Sierra Blanca Estates",
    sector: "realestate",
    subsector: "Luxury residential developer",
    city: "Marbella",
    region: "Andalucía",
    website: "https://sierrablancaestates.com/",
    instagram: null,
    linkedin: "company/sierra-blanca-estates-developments",
    googleMaps: null,
    phone: "+34 952 82 93 13",
    email: "realty@sierrablancaestates.com",
    dm: { name: "Carlos & Luis Rodríguez", role: "Co-directors (founder's sons)", linkedin: null },
    S: "GGXYXYGYYX",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: [
      "https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/",
      "https://sierrablancaestates.com/es/la-empresa/",
      "https://sierrablancaestates.com/contact/",
    ],
    evidence: [
      ev("transitionSignal", "press", "Brains Real Estate News", "Plan de inversión de 500 millones de euros en residencial de lujo (Marbella / Costa del Sol).", 3, "https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/"),
      ev("economicCapacity", "press", "Brains RE", "Volumen de inversión de 500M€ en alta gama; proyectos como EPIC Marbella (Fendi Casa) y Karl Lagerfeld Villas — capacidad muy alta.", 3, "https://brainsre.news/la-promotora-sierra-blanca-invertira-500-millones-en-residencial-de-lujo-hasta-2025/"),
      ev("reachableDecisionMaker", "directory", "Sierra Blanca Estates (web oficial)", "Empresa familiar dirigida por Pedro Rodríguez (fundador) y sus hijos Carlos y Luis Rodríguez; teléfono y email corporativos publicados.", 2, "https://sierrablancaestates.com/es/la-empresa/"),
    ],
    tensions: ["price_communication", "expansion_systems"],
    thesis: "This company is likely launching multiple luxury projects whose individual brand worlds are not yet solved (verify) at the pace of its €500M pipeline.",
    summary: "A Marbella luxury developer with a €500M pipeline (EPIC Marbella by Fendi Casa, Karl Lagerfeld Villas), family-led by the Rodríguez brothers, with corporate contact published. Capacity, pipeline and decision makers are verified; per-project brand depth is the open question — and they clearly invest in brand (Fendi, Lagerfeld), so fit is conservative.",
    whyNow: "Un pipeline activo de 500 M€ implica nuevos proyectos entrando en fase de venta que necesitan posicionamiento.",
    whyBeforeOthers: "Exceptional economic capacity, verified family leadership and a real multi-project pipeline — the strongest capacity signal in the pilot.",
    blindSpot: "At pipeline scale, each project's brand world is a sales-velocity lever, not a cost.",
    firstLever: "Reach the Rodríguez direction; target a single flagship project's brand world as an entry point.",
    callOpening: "Con un pipeline de 500 millones en residencial de lujo, cada proyecto se juega la velocidad de venta en su presentación. ¿Cómo abordáis la marca proyecto a proyecto?",
    objection: "Trabajamos con marcas internacionales (Fendi, Lagerfeld).",
    objectionResponse: "Perfecto para el sello del producto; nosotros entramos en el mundo de marca y la narrativa comercial de un proyecto concreto, que es lo que sube el precio de cierre. Empezamos por uno.",
    reasonsNotToCall: ["Already invests heavily in brand (Fendi/Lagerfeld) — may not need us.", "Enterprise sales cycle.", "Per-project gap unconfirmed."],
    invalidators: ["Each project already has a strong, distinct brand world.", "Locked into an agency/brand roster."],
  }),
];

export default RESEARCHED;
