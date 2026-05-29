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

  // ── Segunda tanda (alta puntuación) — verificados 2026-05-29 ──────────────
  mkReal({
    id: "r-higueron-south",
    company: "Higuerón Real Estate — South Residences",
    sector: "realestate",
    subsector: "Branded residences de lujo (Costa del Sol)",
    city: "Fuengirola",
    region: "Andalucía",
    website: "https://higueronresortrealestate.com/es/south-residences/",
    instagram: null,
    linkedin: "company/higueron-resort",
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Javier Rodríguez", role: "CEO, Higuerón Resort", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow G,
    // decisor G, presupuesto G, encaje G, brutal G
    S: "GGYYXGGGGG",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: [
      "https://brainsre.news/higueron-real-estate-destina-80-millones-a-164-viviendas-en-la-costa-del-sol-en-formato-branded-residences/",
      "https://www.idealista.com/en/news/luxury-real-estate-in-spain/2025/05/23/844527-south-residences-these-are-the-164-branded-residences-by-higueron-real-estate",
      "https://higueronresortrealestate.com/en/about-us/",
    ],
    evidence: [
      ev("transitionSignal", "press", "Brains RE", "Lanza South Residences: 164 viviendas branded en Fuengirola, inversión de 80 M€; primera fase de 140 ya completada, entrega en mayo.", 3, "https://brainsre.news/higueron-real-estate-destina-80-millones-a-164-viviendas-en-la-costa-del-sol-en-formato-branded-residences/"),
      ev("economicCapacity", "press", "Idealista", "Viviendas de 400.000 € a 2,2 M€; inversión de 80 M€; respaldo de resort 5 estrellas — capacidad muy alta.", 3, "https://www.idealista.com/en/news/luxury-real-estate-in-spain/2025/05/23/844527-south-residences-these-are-the-164-branded-residences-by-higueron-real-estate"),
      ev("whyNow", "press", "Idealista", "Proyecto presentado en 2025 con primera fase entregándose ahora — fase de venta/posicionamiento activa.", 3, "https://www.idealista.com/en/news/luxury-real-estate-in-spain/2025/05/23/844527-south-residences-these-are-the-164-branded-residences-by-higueron-real-estate"),
      ev("reachableDecisionMaker", "directory", "Higuerón (web oficial)", "Dirección identificada: Javier Rodríguez (CEO) y Ricardo Rodríguez (board, Real Estate & Resort).", 2, "https://higueronresortrealestate.com/en/about-us/"),
      ev("strategicFit", "inference", "Análisis", "Branded residences = proyecto visualmente rico, caso de estudio premium ideal para XN.", 2, "https://brainsre.news/higueron-real-estate-destina-80-millones-a-164-viviendas-en-la-costa-del-sol-en-formato-branded-residences/"),
    ],
    tensions: ["price_communication", "ambition_maturity", "visibility_conversion"],
    thesis: "This company is likely under-monetising an €80M branded-residences launch because it has not yet solved (verify) the project's own brand world and international sales narrative.",
    summary: "Higuerón lanza South Residences: 164 branded residences (400k–2,2 M€, 80 M€ de inversión) en Fuengirola, con la primera fase entregándose ahora y CEO identificado. Transición, capacidad, timing y decisor verificados; la profundidad de marca del proyecto es lo que queda por confirmar.",
    whyNow: "Proyecto de 80 M€ presentado en 2025 con primera fase entregándose ahora — la fase de venta internacional necesita posicionamiento ya.",
    whyBeforeOthers: "Combinación rara: capacidad muy alta, lanzamiento real, decisor con nombre y enorme potencial de caso de estudio. Lead XN de primer nivel.",
    blindSpot: "En branded residences el mundo de marca del proyecto ES el motor de velocidad de venta, no un coste.",
    firstLever: "Verificar el sistema de marca de South Residences; proponer mundo de marca + narrativa comercial internacional.",
    callOpening: "Javier, South Residences con 80 millones y entrega de la primera fase es un momentazo. La venta internacional se juega en la percepción — ¿cómo estáis construyendo el mundo de marca del proyecto?",
    objection: "Tenemos el respaldo del resort y su marca.",
    objectionResponse: "El resort da contexto; la promoción necesita su propia narrativa para el comprador internacional. Eso es lo que sube el precio de cierre. Empezamos por una pieza.",
    reasonsNotToCall: ["Gran operador, puede tener agencia.", "Ciclo de venta largo.", "Profundidad de marca del proyecto sin confirmar."],
    invalidators: ["South Residences ya tiene un sistema de marca propio fuerte.", "Hay una agencia contratada para el lanzamiento."],
  }),

  mkReal({
    id: "r-tragaluz",
    company: "Grupo Tragaluz",
    sector: "hospitality",
    subsector: "Grupo de restauración premium (diseño)",
    city: "Madrid",
    region: "Madrid",
    website: "https://grupotragaluz.com/",
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Rosa Mª Esteva & Tomás Tarruella", role: "Fundadores", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow G,
    // decisor G, presupuesto Y, encaje G, brutal Y
    S: "GGYYXGGYGY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: [
      "https://www.pressdigital.es/articulo/economia/2025-02-06/5171539-grupo-tragaluz-prosigue-expansion-apertura-nuevo-restaurante-madrid",
      "https://grupotragaluz.com/",
    ],
    evidence: [
      ev("transitionSignal", "press", "Press Digital", "Prosigue su expansión con la apertura de un nuevo restaurante (Tragaluz) en el barrio Salamanca de Madrid, sumándose a Bar Tomate, Bosco de Lobos y Luzi Bombón.", 3, "https://www.pressdigital.es/articulo/economia/2025-02-06/5171539-grupo-tragaluz-prosigue-expansion-apertura-nuevo-restaurante-madrid"),
      ev("economicCapacity", "press", "Press Digital", "Grupo consolidado (fundado 1987) con presencia en Barcelona, Madrid, Mallorca y Costa Brava; restauración premium de diseño.", 3, "https://www.pressdigital.es/articulo/economia/2025-02-06/5171539-grupo-tragaluz-prosigue-expansion-apertura-nuevo-restaurante-madrid"),
      ev("whyNow", "press", "Press Digital", "Apertura reciente en Madrid (2025) — visibilidad nueva que llenar y consolidar marca.", 2, "https://www.pressdigital.es/articulo/economia/2025-02-06/5171539-grupo-tragaluz-prosigue-expansion-apertura-nuevo-restaurante-madrid"),
      ev("reachableDecisionMaker", "directory", "Grupo Tragaluz (web)", "Fundadores identificados: Rosa Mª Esteva y Tomás Tarruella; web de grupo con reservas y contacto.", 2, "https://grupotragaluz.com/"),
      ev("strategicFit", "inference", "Análisis", "Grupo de diseño y prestigio — caso de estudio de marca muy atractivo.", 2, "https://grupotragaluz.com/"),
    ],
    tensions: ["expansion_systems", "quality_perception", "visibility_conversion"],
    thesis: "This company is likely under-leveraging a design-led brand across an expanding multi-city group because it has not yet solved (verify) a unified digital/reservation experience that matches its venues.",
    summary: "Grupo Tragaluz (fundado 1987, restauración premium de diseño) sigue expandiéndose en Madrid con un nuevo Tragaluz en Salamanca. Expansión, escala y fundadores verificados; el encaje entre la marca de diseño y la experiencia digital/reservas es la palanca a confirmar.",
    whyNow: "Apertura reciente en Madrid (2025) — momento de consolidar marca y captación con cada nuevo local.",
    whyBeforeOthers: "Grupo premium consolidado, fundadores con nombre y expansión real — alto encaje de caso de estudio.",
    blindSpot: "La marca de diseño que define sus locales puede no estar igual de cuidada en la experiencia digital y de reserva.",
    firstLever: "Auditar la experiencia digital/reservas frente al nivel de diseño de los locales; unificarla.",
    callOpening: "El nuevo Tragaluz en Salamanca tiene una pinta espectacular. El diseño de vuestros locales es marca de la casa — ¿la web y la reserva están al mismo nivel?",
    objection: "Llevamos desde 1987, sabemos de marca.",
    objectionResponse: "Sin duda, y por eso la experiencia digital merece estar a la altura del local. Os enseño dónde se pierde esa coherencia en el paso a la reserva.",
    reasonsNotToCall: ["Grupo grande, probable marketing interno.", "Márgenes de restauración.", "Hueco digital sin confirmar."],
    invalidators: ["Ya tienen una experiencia digital unificada y a nivel.", "Equipo interno lo gestiona."],
  }),

  mkReal({
    id: "r-lamucca-makaa",
    company: "Grupo Lamucca — Makáá",
    sector: "hospitality",
    subsector: "Restaurante rooftop premium (hotel)",
    city: "Madrid",
    region: "Madrid",
    website: "https://lamucca.es/",
    instagram: null,
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Dirección de grupo (por identificar)", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow G,
    // decisor X, presupuesto Y, encaje G, brutal Y
    S: "GGYYXGXYGY",
    offer: "web_funnel",
    researchedAt: "2026-05-29",
    sources: ["https://restauracionnews.com/2025/12/grupo-lamucca-makaa-hotel-thompson/"],
    evidence: [
      ev("transitionSignal", "press", "Restauración News", "Grupo Lamucca abre Makáá en la azotea del Hotel Thompson Madrid — nuevo concepto rooftop premium.", 3, "https://restauracionnews.com/2025/12/grupo-lamucca-makaa-hotel-thompson/"),
      ev("whyNow", "press", "Restauración News", "Apertura muy reciente (dic 2025) en un hotel de marca internacional — máxima visibilidad ahora.", 3, "https://restauracionnews.com/2025/12/grupo-lamucca-makaa-hotel-thompson/"),
      ev("economicCapacity", "press", "Restauración News", "Concepto rooftop premium dentro del Hotel Thompson (Hyatt) — ticket alto, eventos.", 2, "https://restauracionnews.com/2025/12/grupo-lamucca-makaa-hotel-thompson/"),
    ],
    tensions: ["expansion_systems", "visibility_conversion"],
    thesis: "This company is likely leaving high-ticket rooftop events on the table because it has not yet solved (verify) a reservation/events capture worthy of a brand-hotel rooftop.",
    summary: "Grupo Lamucca abre Makáá, rooftop premium en el Hotel Thompson (Hyatt) de Madrid, en diciembre de 2025. Apertura, ubicación premium y timing verificados; falta identificar al decisor y confirmar la captación de eventos.",
    whyNow: "Rooftop recién abierto (dic 2025) en hotel de marca internacional — visibilidad y demanda de eventos en su pico.",
    whyBeforeOthers: "Apertura premium muy fresca con timing inmejorable; el decisor aún por identificar lo deja algo por debajo de los leads con contacto cerrado.",
    blindSpot: "Un rooftop de marca-hotel atrae eventos de alto ticket que se pierden si la captación no está montada.",
    firstLever: "Identificar a la dirección de Lamucca; auditar la captación de reservas/eventos del rooftop.",
    callOpening: "Makáá en la azotea del Thompson es de lo mejor que ha abierto en Madrid. Con esa visibilidad, ¿cómo estáis capturando los eventos privados de alto ticket?",
    objection: "El hotel nos trae el flujo.",
    objectionResponse: "El hotel trae paso; los eventos privados de alto ticket se ganan con una captación propia. Os enseño cuántos se escapan sin ella.",
    reasonsNotToCall: ["Grupo con estructura, posible equipo interno.", "Decisor sin identificar.", "Hueco de eventos sin confirmar."],
    invalidators: ["Ya tienen captación de eventos montada.", "El hotel gestiona toda la comercialización."],
  }),

  // ── Tanda salud + growth (el mayor objetivo del brief) — 2026-05-29 ───────
  mkReal({
    id: "r-olistic",
    company: "Olistic",
    sector: "growth",
    subsector: "Marca healthtech / wellness capilar (DTC + omnicanal)",
    city: "Madrid",
    region: "Madrid",
    website: null,
    instagram: "@olistic.science",
    linkedin: "company/olistic-science",
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Pablo Nueno", role: "Co-fundador / CEO", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow G,
    // decisor G, presupuesto Y, encaje G, brutal G
    S: "GGYYXGGYGG",
    offer: "xn_transformation",
    researchedAt: "2026-05-29",
    sources: [
      "https://emprendedores.es/casos-de-exito/lista-emprendedores/las-mejores-startups-de-salud-de-2025/",
    ],
    evidence: [
      ev("transitionSignal", "funding", "Emprendedores", "Cerró Serie A de 27 M€ con respaldo de top VCs europeos para impulsar el crecimiento; marca de bienestar capilar para hombre y mujer.", 3, "https://emprendedores.es/casos-de-exito/lista-emprendedores/las-mejores-startups-de-salud-de-2025/"),
      ev("economicCapacity", "funding", "Emprendedores", "27 M€ levantados — capacidad económica muy alta para invertir en marca y crecimiento.", 3, "https://emprendedores.es/casos-de-exito/lista-emprendedores/las-mejores-startups-de-salud-de-2025/"),
      ev("whyNow", "funding", "Emprendedores", "Capital de Serie A destinado explícitamente a impulsar el crecimiento — despliegue ahora.", 2, "https://emprendedores.es/casos-de-exito/lista-emprendedores/las-mejores-startups-de-salud-de-2025/"),
      ev("reachableDecisionMaker", "press", "Emprendedores", "Cofundadores identificados: Pablo Nueno y Pedro Luis González (fundada 2020, estrategia omnicanal).", 2, "https://emprendedores.es/casos-de-exito/lista-emprendedores/las-mejores-startups-de-salud-de-2025/"),
      ev("strategicFit", "inference", "Análisis", "Marca de consumo con ambición europea = caso de marca premium ideal para XN.", 2, "https://emprendedores.es/casos-de-exito/lista-emprendedores/las-mejores-startups-de-salud-de-2025/"),
    ],
    tensions: ["growth_structure", "ambition_maturity", "expansion_systems"],
    thesis: "This company is likely scaling spend on a €27M raise faster than it has solidified (verify) a brand system able to carry an omnichannel European expansion.",
    summary: "Olistic, marca de wellness capilar, cerró una Serie A de 27 M€ con top VCs europeos para crecer en omnicanal. Financiación, capacidad y cofundadores verificados; la madurez del sistema de marca para el salto europeo es lo que queda por confirmar. Lead de crecimiento de primer nivel.",
    whyNow: "Serie A de 27 M€ desplegándose ahora para crecer — el fundamento de marca debe sostener la expansión europea.",
    whyBeforeOthers: "Financiación muy fuerte, cofundadores con nombre y mandato de marca de consumo — encaje XN excelente.",
    blindSpot: "Escalar canales con una marca aún no sistematizada produce inconsistencia, no equity de marca.",
    firstLever: "Contactar a Pablo Nueno; proponer un sistema de marca para la expansión omnicanal europea.",
    callOpening: "Pablo, enhorabuena por la Serie A. Antes de pisar el acelerador en Europa, ¿el sistema de marca está listo para sostener todos esos canales o se irá definiendo sobre la marcha?",
    objection: "Tenemos equipo de marca interno.",
    objectionResponse: "Perfecto, y rinde más sobre una base estratégica clara. Montamos la base, vuestro equipo ejecuta rápido y consistente en cada mercado.",
    reasonsNotToCall: ["VCs pueden imponer agencia.", "Ancho de banda del fundador tras la ronda.", "Web/contacto directo sin confirmar."],
    invalidators: ["Ya tienen un estudio de marca contratado.", "El sistema de marca ya está consolidado."],
  }),

  mkReal({
    id: "r-egos",
    company: "Clínica EGOS",
    sector: "health",
    subsector: "Cirugía y medicina estética (cadena en expansión)",
    city: "Barcelona",
    region: "Cataluña",
    website: "https://www.clinicaegos.com/",
    instagram: "@clinicaegos",
    linkedin: "company/clinica-egos",
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Santiago Elvira & Tiago Gomes", role: "Fundadores (cirujanos plásticos)", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow G,
    // decisor G, presupuesto Y, encaje Y, brutal Y
    S: "GGYYXGGYYY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: ["https://www.clinicaegos.com/noticias/economista-30-centros/"],
    evidence: [
      ev("transitionSignal", "press", "Clínica EGOS / El Economista", "Alcanza 30 clínicas antes de fin de 2025 (22 operativas + 8 aperturas en Sevilla, Alicante, Málaga, Córdoba y Tenerife); triplicó tamaño en dos años.", 3, "https://www.clinicaegos.com/noticias/economista-30-centros/"),
      ev("economicCapacity", "press", "El Economista", "Cadena de cirugía estética en expansión nacional acelerada — capacidad y músculo de inversión.", 2, "https://www.clinicaegos.com/noticias/economista-30-centros/"),
      ev("whyNow", "press", "El Economista", "Ocho aperturas simultáneas en 2025 — fase de expansión intensa que necesita consistencia de marca ya.", 3, "https://www.clinicaegos.com/noticias/economista-30-centros/"),
      ev("reachableDecisionMaker", "press", "El Economista", "Fundadores identificados: cirujanos plásticos Santiago Elvira y Tiago Gomes (Barcelona).", 2, "https://www.clinicaegos.com/noticias/economista-30-centros/"),
    ],
    tensions: ["expansion_systems", "quality_perception", "visibility_conversion"],
    thesis: "This company is likely diluting brand and patient-acquisition consistency because it has not yet solved (verify) a system to support eight simultaneous openings.",
    summary: "EGOS, cadena de cirugía estética fundada por los cirujanos Santiago Elvira y Tiago Gomes, llega a 30 clínicas en 2025 con 8 aperturas simultáneas. Expansión, fundadores y timing verificados; la consistencia de marca y captación de pacientes a esa velocidad es la palanca a confirmar.",
    whyNow: "Ocho aperturas a la vez en 2025 — la consistencia de marca y la captación se tensionan justo ahora.",
    whyBeforeOthers: "Expansión muy rápida, fundadores médicos con nombre y sector premium — encaje sólido.",
    blindSpot: "Abrir ocho clínicas a la vez sin un sistema de marca y captación replicable multiplica la inconsistencia.",
    firstLever: "Contactar a los fundadores; auditar la consistencia de marca + captación replicable entre sedes.",
    callOpening: "Santiago, abrir ocho clínicas a la vez es un ritmo brutal. ¿Tenéis un sistema de marca y captación replicable para que cada apertura nueva arranque igual de fuerte?",
    objection: "Tenemos un equipo de marketing centralizado.",
    objectionResponse: "Justo por eso: a ese ritmo, el equipo necesita un sistema replicable, no improvisar clínica a clínica. Os enseño dónde se pierde consistencia.",
    reasonsNotToCall: ["Cadena con marketing interno consolidado.", "Posible agencia ya contratada.", "Hueco de consistencia sin confirmar."],
    invalidators: ["Ya operan un sistema de marca replicable entre sedes.", "Equipo interno cubre la expansión."],
  }),

  mkReal({
    id: "r-berezo",
    company: "Clínica Elena Berezo",
    sector: "health",
    subsector: "Medicina estética avanzada (premium, independiente)",
    city: "Madrid",
    region: "Madrid",
    website: null,
    instagram: "@elenaberezo",
    linkedin: null,
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: "Elena Berezo", role: "Fundadora / Directora médica", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow Y,
    // decisor G, presupuesto Y, encaje G, brutal Y
    S: "GGYYXYGYGY",
    offer: "reposition",
    researchedAt: "2026-05-29",
    sources: ["https://theobjective.com/lifestyle/belleza/2025-11-24/elena-berezo-medicina-estetica/"],
    evidence: [
      ev("transitionSignal", "press", "The Objective", "La clínica (Velázquez 115, Madrid) se ha expandido a Salamanca y Sevilla, consolidándose como referente en estética avanzada.", 3, "https://theobjective.com/lifestyle/belleza/2025-11-24/elena-berezo-medicina-estetica/"),
      ev("economicCapacity", "press", "The Objective", "Tratamientos de alto nivel facial y corporal en ubicación premium (Velázquez) — ticket y margen altos.", 2, "https://theobjective.com/lifestyle/belleza/2025-11-24/elena-berezo-medicina-estetica/"),
      ev("reachableDecisionMaker", "press", "The Objective", "Fundadora identificada y cara visible de la marca: Elena Berezo.", 3, "https://theobjective.com/lifestyle/belleza/2025-11-24/elena-berezo-medicina-estetica/"),
      ev("strategicFit", "inference", "Análisis", "Marca personal premium con expansión multi-ciudad = caso de marca atractivo.", 2, "https://theobjective.com/lifestyle/belleza/2025-11-24/elena-berezo-medicina-estetica/"),
    ],
    tensions: ["quality_perception", "ambition_maturity", "visibility_conversion"],
    thesis: "This company is likely under-leveraging a strong personal brand across a multi-city expansion because it has not yet solved (verify) the brand-system and digital experience the new locations demand.",
    summary: "La clínica de Elena Berezo (medicina estética avanzada, Velázquez 115) se ha expandido a Salamanca y Sevilla con la fundadora como cara visible. Expansión, capacidad y decisora verificadas; el sistema de marca/digital para sostener varias sedes es la palanca a confirmar.",
    whyNow: "Expansión reciente a Salamanca y Sevilla — el momento de sistematizar marca y captación antes de seguir creciendo.",
    whyBeforeOthers: "Decisora con nombre y marca personal fuerte, sector premium e independiente — encaje muy limpio para 01.",
    blindSpot: "Una marca personal potente puede no estar sistematizada para funcionar igual en tres ciudades.",
    firstLever: "Contactar a Elena Berezo; sistematizar marca + experiencia digital entre sedes.",
    callOpening: "Elena, enhorabuena por Salamanca y Sevilla. Tu marca personal es muy fuerte — ¿está montada para funcionar igual de bien en cada ciudad nueva, también en la web?",
    objection: "La marca soy yo, funciona sola.",
    objectionResponse: "Exacto, y por eso hay que sistematizarla para que escale contigo y no dependa de tu presencia en cada sede. Eso es lo que montamos.",
    reasonsNotToCall: ["Marca muy personalista, posible recelo a sistematizar.", "Web/contacto directo sin confirmar."],
    invalidators: ["Ya tienen un sistema de marca multi-sede.", "La expansión está pausada."],
  }),

  mkReal({
    id: "r-ginefiv",
    company: "Ginefiv",
    sector: "health",
    subsector: "Reproducción asistida / fertilidad (clínica insignia)",
    city: "Madrid",
    region: "Madrid",
    website: "https://www.ginefiv.com/",
    instagram: "@ginefiv",
    linkedin: "company/ginefiv",
    googleMaps: null,
    phone: null,
    email: null,
    dm: { name: null, role: "Dirección médica (por identificar)", linkedin: null },
    // transición G, econ G, tensión Y, palanca Y, dolor X, whyNow G,
    // decisor X, presupuesto G, encaje G, brutal Y
    S: "GGYYXGXGGY",
    offer: "web_funnel",
    researchedAt: "2026-05-29",
    sources: ["https://www.ginefiv.com/notas-de-prensa/ginefiv-inaugura-una-nueva-clinica-de-reproduccion-asistida-de-altas-prestaciones-en-madrid/"],
    evidence: [
      ev("transitionSignal", "press", "Ginefiv (nota de prensa)", "Inaugura nueva clínica de altas prestaciones en Madrid — la mayor del grupo — con sistemas de IA y algoritmos predictivos.", 3, "https://www.ginefiv.com/notas-de-prensa/ginefiv-inaugura-una-nueva-clinica-de-reproduccion-asistida-de-altas-prestaciones-en-madrid/"),
      ev("economicCapacity", "press", "Ginefiv", "Reproducción asistida = tratamiento de muy alto ticket, paciente de ciclos repetidos; +35 años de trayectoria.", 3, "https://www.ginefiv.com/notas-de-prensa/ginefiv-inaugura-una-nueva-clinica-de-reproduccion-asistida-de-altas-prestaciones-en-madrid/"),
      ev("whyNow", "press", "Ginefiv", "Inauguración reciente de la mayor clínica del grupo — necesita captación de pacientes para una decisión muy meditada.", 2, "https://www.ginefiv.com/notas-de-prensa/ginefiv-inaugura-una-nueva-clinica-de-reproduccion-asistida-de-altas-prestaciones-en-madrid/"),
      ev("budgetPriority", "inference", "Análisis", "La captación de pacientes de fertilidad afecta directamente a ingresos muy altos por ciclo.", 2, "https://www.ginefiv.com/notas-de-prensa/ginefiv-inaugura-una-nueva-clinica-de-reproduccion-asistida-de-altas-prestaciones-en-madrid/"),
    ],
    tensions: ["growth_structure", "quality_perception", "visibility_conversion"],
    thesis: "This company is likely under-acquiring high-value fertility patients for a new flagship because it has not yet solved (verify) the trust-content and patient-journey its high-consideration decision demands.",
    summary: "Ginefiv inauguró en Madrid la mayor clínica del grupo, de altas prestaciones y con IA. Apertura insignia, capacidad muy alta y prioridad de presupuesto verificadas; falta identificar al decisor y confirmar el journey de captación de pacientes de fertilidad.",
    whyNow: "Acaban de inaugurar su mayor clínica — la captación de pacientes para una decisión tan meditada se juega ahora.",
    whyBeforeOthers: "Ticket por paciente muy alto y apertura insignia reciente; el decisor por identificar lo deja algo por debajo de los leads con contacto cerrado.",
    blindSpot: "El paciente de fertilidad investiga durante meses — sin contenido de confianza y journey, la clínica es invisible en la fase de decisión.",
    firstLever: "Identificar a la dirección médica; auditar el journey de paciente de fertilidad y el contenido de confianza.",
    callOpening: "Acabáis de inaugurar la mayor clínica del grupo — enhorabuena. La paciente de fertilidad investiga durante meses; ¿la web la acompaña en esa decisión o solo la anuncia?",
    objection: "Tenemos demanda de sobra y lista de espera.",
    objectionResponse: "Entonces hablemos de la paciente adecuada, no de más volumen. Una web bien hecha selecciona y prepara, no solo capta.",
    reasonsNotToCall: ["Grupo grande, probable marketing interno.", "Decisor sin identificar.", "Sensibilidad médica en el contenido."],
    invalidators: ["Ya tienen journey y contenido de confianza dedicados.", "La nueva clínica ya está a plena capacidad."],
  }),
];

export default RESEARCHED;
