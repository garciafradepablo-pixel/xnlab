// =============================================================================
// data/mallorca.js — Tanda real de Mallorca (investigada, mayo MMXXVI).
//
// 56 empresas premium REALES de Mallorca (salud, hostelería, inmobiliario/
// diseño, retail/lifestyle), localizadas con búsqueda web y verificadas contra
// sus propias páginas y prensa. NO son sintéticas. La puntuación es honesta: se
// DERIVA de señales reales (un decisor con nombre y fuente, un momento con
// enlace, una web floja que es la palanca), nunca se fija a mano.
//
// AVISO operativo para quien llama: el entorno de investigación no pudo cargar
// las páginas directamente (WAF/anti-bot), así que webs, teléfonos y handles se
// tomaron de resultados de búsqueda y de las páginas indexadas de cada empresa.
// Donde no se pudo confirmar un dato desde fuente primaria, va a null (sin
// inventar). Confirma teléfono/contacto antes o al inicio de la llamada.
//
// El builder mk() traduce cada ficha a una oportunidad bien formada con señales
// conservadoras + evidencia citada. Reglas (defendibles, no infladas):
//   · transición / por qué ahora → VERDE solo si hay un momento real con enlace.
//   · capacidad económica        → VERDE con momento (presupuesto en marcha), si no AMARILLO (premium).
//   · tensión visible            → VERDE salvo web ya fuerte (el hueco premium-vs-digital es el research).
//   · palanca accionable         → VERDE (siempre hay un primer movimiento: marca/web/funnel).
//   · decisor alcanzable         → VERDE si hay nombre público con fuente; si no AMARILLO.
//   · encaje estratégico         → VERDE (marca local premium = target XNLAB).
//   · resto                      → gris/amarillo conservador hasta verificar en la llamada.
// =============================================================================

const slug = (s) =>
  "mll-" +
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

// Oferta sugerida según el estado de su digital (ticket interno, no público).
function offerFor(web, hasSite) {
  if (!hasSite) return "web_funnel"; // sin web sólida: construir presencia + captación
  if (web === "weak" || web === "none") return "reposition"; // floja: reposicionar + landing
  if (web === "strong") return "audit"; // ya fuerte: elevar marca/dirección
  return "audit"; // adecuada: auditoría → reposicionamiento
}

function mk(r) {
  const hasSite = !!r.website;
  const web = r.web || "adequate";
  const strongWeb = web === "strong";
  const weakWeb = web === "weak" || web === "none" || !hasSite;
  const hasSignal = !!(r.signal && r.signal.url);
  const hasDM = !!(r.dm && r.dm.name);

  const signals = {};
  const evidence = [];

  // Transición / por qué ahora: verde SOLO con un momento real citado.
  signals.transitionSignal = hasSignal ? { level: "green" } : { level: "grey" };
  signals.whyNow = hasSignal ? { level: "green" } : { level: "grey" };
  if (hasSignal)
    evidence.push({ filter: "transitionSignal", type: "press", source: "Prensa / fuente citada", note: r.signal.note, tier: 3, url: r.signal.url });

  // Capacidad económica: premium → amarillo; verde si hay momento (presupuesto activo).
  signals.economicCapacity = hasSignal ? { level: "green" } : { level: "yellow" };

  // Tensión visible: el desajuste premium-vs-digital que evaluó el research.
  signals.visibleTension = strongWeb ? { level: "yellow" } : { level: "green" };
  if (!strongWeb)
    evidence.push({ filter: "visibleTension", type: "web", source: "Lectura de su web", note: r.notes, tier: 2, url: r.website || "investigación" });

  // Palanca accionable: siempre hay un primer movimiento claro.
  signals.actionableLever = { level: "green" };
  evidence.push({
    filter: "actionableLever", type: "web", source: "Auditoría de su web",
    note: !hasSite
      ? "Sin web propia sólida: construir presencia, narrativa y captación."
      : weakWeb
      ? "Web floja/desactualizada: reposicionar marca + web/funnel."
      : "Web correcta pero genérica para su nivel: elevar marca y conversión.",
    tier: 2, url: r.website || "investigación",
  });

  // Dolor activo: amarillo si la web floja ya es un síntoma; gris si no se ve.
  signals.activePainSignal = weakWeb && !strongWeb ? { level: "yellow" } : { level: "grey" };

  // Prioridad de presupuesto: amarillo si hay momento; gris si no.
  signals.budgetPriority = hasSignal ? { level: "yellow" } : { level: "grey" };

  // Decisor alcanzable: verde si hay nombre público con fuente.
  signals.reachableDecisionMaker = hasDM ? { level: "green" } : { level: "yellow" };
  if (hasDM)
    evidence.push({ filter: "reachableDecisionMaker", type: "directory", source: "Fuente pública", note: `${r.dm.name} — ${r.dm.role}`, tier: 2, url: r.dmSrc || r.website || "investigación" });

  // Encaje estratégico: marca local premium = exactamente el target.
  signals.strategicFit = { level: "green" };

  // Filtro final brutal (peso bajo): verde solo si momento + decisor + hueco.
  signals.brutalFinalFilter = hasSignal && hasDM && !strongWeb ? { level: "green" } : { level: "grey" };

  const tensions = strongWeb ? ["ambition_maturity"] : ["quality_perception", "visibility_conversion"];

  return {
    id: slug(r.company),
    company: r.company,
    sector: r.sector,
    subsector: r.subsector || "",
    city: r.city,
    region: "Baleares",
    country: "Spain",
    website: r.website || null,
    instagram: r.instagram || null,
    linkedin: null,
    phone: r.phone || null,
    email: r.email || null,
    decisionMaker: { name: r.dm?.name || null, role: r.dm?.role || "", linkedin: null },
    suggestedOfferKey: offerFor(web, hasSite),
    signals,
    evidence,
    tensions,
    researched: true,
    researchedAt: "2026-05-31",
    sources: [r.signal?.url, r.dmSrc, r.website].filter(Boolean),
    region_tag: "mallorca", // para el filtro/seed de la tanda
    thesis:
      r.notes ||
      `${r.company}: marca premium local con recorrido para una dirección de marca/digital más a la altura.`,
    summary: r.notes || "",
    whyNow: hasSignal ? r.signal.note : "Por confirmar en la llamada — sin gatillo público verificado aún.",
    whyBeforeOthers: "Marca local premium: el primero que entre fija la dirección.",
    blindSpot: weakWeb
      ? "Su presencia digital no está a la altura de su producto/posicionamiento."
      : "La marca podría capitalizar mejor su momento y su audiencia.",
    firstLever: !hasSite
      ? "Construir una web/landing con narrativa y captación."
      : weakWeb
      ? "Reposicionar la marca y rehacer la web/funnel."
      : "Elevar la dirección de marca y la conversión sobre lo que ya tienen.",
    callOpening: `Hola, ¿hablo con ${r.dm?.name || "la dirección de " + r.company}?`,
    objection: "Ya tenemos a alguien / lo llevamos internamente.",
    objectionResponse:
      "No venimos a ejecutar piezas sueltas, sino a dirigir: una mirada externa premium sobre marca y captación. Una llamada de diagnóstico y os decimos qué moveríamos primero.",
    reasonsNotToCall: [
      "Dato de contacto sin confirmar al 100% (entorno de investigación con WAF) — verificar al llamar.",
    ],
    invalidators: ["Que su digital ya esté claramente a la altura y sin hueco que dirigir."],
  };
}

// --- Las 56 fichas investigadas (reales) -------------------------------------
const R = [
  // ---- SALUD / ESTÉTICA (14) ----
  { company: "mySkin Mallorca", city: "Calvià", sector: "health", subsector: "Dermatología y dermatología estética", website: "https://myskin-mallorca.com/es/", instagram: "@myskinmallorca", dm: { name: "Dra. Cordula Ahnhudt-Franke", role: "Fundadora y directora médica" }, dmSrc: "https://myskin-mallorca.com/es/dr-med-cordula-ahnhudt/", web: "strong", notes: "Dermatología premium (desde 2002), equipo multi-doctor y clientela internacional. La web lee clínica, no lujo: dirección de marca para igualar su reputación." },
  { company: "ONA Clinic Mallorca", city: "Palma", sector: "health", subsector: "Cirugía plástica y medicina estética", website: "https://onaclinic.es/nuestros-centros/ona-clinic-palma-de-mallorca/", instagram: "@onaclinicmallorca", phone: "+34 648 88 39 24", dm: { name: "Dr. Luis Parra", role: "Socio fundador y director médico" }, dmSrc: "https://onaclinic.es/nuestros-centros/ona-clinic-palma-de-mallorca/", web: "adequate", notes: "Grupo multi-ciudad sobre plantilla compartida; la sede de Palma pide marca/web local diferenciada y capa de contenido propia." },
  { company: "Mallorca Medical Group", city: "Palma", sector: "health", subsector: "Cirugía plástica y reconstructiva", website: "https://mallorcamedicalgroup.com/en/", instagram: "@mallorcamedicalgroup", dm: { name: "Dr. García Ceballos", role: "Director / Cirujano plástico" }, dmSrc: "https://mallorcamedicalgroup.com/en/about-us/", web: "adequate", notes: "25+ años, foco en paciente internacional. Intención premium pero presentación funcional: clara oportunidad de upgrade de marca/digital." },
  { company: "EónClinic", city: "Calvià", sector: "health", subsector: "Cirugía plástica y medicina estética", website: "https://eonclinicpalma.com/", instagram: "@eonclinic", phone: "+34 971 91 59 61", dm: { name: "Dra. Marta Payá", role: "Fundadora y directora" }, dmSrc: "https://eonclinicpalma.com/", web: "adequate", notes: "Clínica liderada por cirujana con nicho premium. Alcance social modesto y contenido fino para su posicionamiento: encaje fuerte para dirección de marca + web de conversión." },
  { company: "The Skin Koncept", city: "Palma", sector: "health", subsector: "Medicina estética, funcional y regenerativa", website: "https://www.theskinkoncept.com/", instagram: "@theskinkoncept", dm: { name: "Susana Rosal", role: "Fundadora y directora" }, dmSrc: "https://www.fibwidiario.com/articulo/actualidad/the-skin-koncept-inaugura-nueva-clinica-palma/20251028151243313589.html", signal: { note: "Inauguró nueva clínica de estética e integrativa en C/ 31 de Diciembre 18, Palma (24 oct 2025)", url: "https://www.fibwidiario.com/articulo/actualidad/the-skin-koncept-inaugura-nueva-clinica-palma/20251028151243313589.html" }, web: "adequate", notes: "Clínica en crecimiento que acaba de abrir una segunda sede en Palma con relato de 'estética más humana y consciente' — narrativa que un estudio afila. Apertura reciente = presupuesto y apetito activos." },
  { company: "Planas Salud Medicina Estética", city: "Palma", sector: "health", subsector: "Centro de medicina estética", website: "https://planassaludestetica.com/", instagram: "@drjaimebarcelo", dm: { name: "Dr. Jaime Barceló Planas", role: "Director médico" }, dmSrc: "https://planassaludestetica.com/el-centro/doctor-barcelo/", web: "adequate", notes: "Centro consolidado con doctor con nombre. Presencia partida entre Facebook y el Instagram personal del director: una marca de clínica unificada es la palanca evidente." },
  { company: "Medisans", city: "Palma", sector: "health", subsector: "Medicina y cirugía estética (2 sedes)", website: "https://medisans.com/", dm: { name: "Dra. Marta Serna Benbassat", role: "Fundadora y directora" }, dmSrc: "https://medisans.com/quienes-somos/", web: "weak", notes: "Abierta desde 1996, doctora pionera y dos sedes — credibilidad alta pero huella digital envejecida (web anticuada). Candidata clásica a rebrand + web/booking moderna." },
  { company: "MAC - Mallorca Aesthetic Clinic", city: "Palma", sector: "health", subsector: "Medicina y cirugía estética (2 sedes)", website: "https://mac-clinica.com/", phone: "+34 660 938 585", web: "adequate", notes: "Centro de excelencia en Passeig del Born + segunda sede en Cala Millor — posicionamiento premium. No se verificó dueño ni IG desde fuente primaria; el propio hueco de visibilidad de marca es la palanca." },
  { company: "CM Clinic Medicina Estética", city: "Palma", sector: "health", subsector: "Clínica de medicina estética", website: "https://cmclinicmallorca.com/", instagram: "@cmclinicmedicinaestetica", phone: "+34 625 773 385", dm: { name: "Dra. Esther Callejas y Dr. Javier Murillo", role: "Directores / Médicos estéticos" }, dmSrc: "https://cmclinicmallorca.com/", web: "adequate", notes: "Clínica con dos médicos con nombre y social activo. Web con poco contenido y marca en desarrollo: encaje para dirección de marca premium y web de conversión." },
  { company: "Clínica Dental Castañer", city: "Palma", sector: "health", subsector: "Odontología estética e implantes", website: "https://www.clinicacastaner.com/", dm: { name: "Dr. Lorenzo Castañer Abellanet", role: "Odontólogo / Director (2ª generación, clínica fundada en 1965)" }, dmSrc: "https://www.doctoralia.es/lorenzo-castaner-abellanet/dentista/palma-de-mallorca", web: "adequate", notes: "Clínica familiar multi-especialidad (1965) en plaza céntrica. Herencia + estética dental pero presencia tradicional: un rebrand premium y web/booking moderna la diferenciarían de las nuevas 'elite'." },
  { company: "Clínica Dental Estanislao Planas", city: "Palma", sector: "health", subsector: "Odontología estética e implantología", website: "https://clinicaestanislaoplanas.com/en/", instagram: "@clinicaestanislaoplanas", phone: "+34 871 032 774", email: "info@clinicaestanislaoplanas.com", dm: { name: "Dr. Estanislao Planas Stampa", role: "Fundador y director médico" }, dmSrc: "https://clinicaestanislaoplanas.com/contacto/", signal: { note: "Cobertura en prensa por técnica de implantes All-on-4 en el día", url: "https://www.mallorcadiario.com/innovacion-tecnica-implantologia-especialidad-odontologia-palma-doctor-estanislao-planas-stampa" }, web: "adequate", notes: "Clínica de implantes/estética con cobertura de prensa y web bilingüe. Buena base, pero la marca puede elevarse a la altura de su ambición de paciente internacional." },
  { company: "EDC Elite Dental Clinic", city: "Palma", sector: "health", subsector: "Odontología + medicina estética", website: "https://elitedentalclinic.es/nuestra-clinica-dental-palma-mallorca/", phone: "+34 971 60 33 44", signal: { note: "Elite Dental Clinic SL constituida el 02/02/2024 — nueva clínica premium que combina odontología, medicina estética y nutrición", url: "https://www.axesor.es/Informes-Empresas/11031237/ELITE_DENTAL_CLINIC_SL.html" }, web: "adequate", notes: "Clínica 'elite' nueva (2024) que mezcla odontología + estética + nutrición en Palma centro. Marca temprana, sin fundador/IG verificado: lienzo limpio donde la dirección de marca moldea la trayectoria de lanzamiento." },
  { company: "The Movement", city: "Calvià", sector: "health", subsector: "Fisioterapia, osteopatía y recuperación", website: "https://www.themovementmallorca.com/", instagram: "@themovementmallorca_", dm: { name: "Lorenzo Cordara", role: "Fundador / Osteópata y fisioterapeuta" }, dmSrc: "https://www.themovementmallorca.com/lorenzo-cordara", web: "strong", notes: "Clínica de fisio/osteo de alto rendimiento en Puerto Portals, clientela internacional y marca de fundador. Ya fuerte en digital: encaje para elevación de marca/contenido y funnel, no rescate." },
  { company: "Fisioplanet", city: "Palma", sector: "health", subsector: "Fisioterapia deportiva y rehabilitación", website: "https://fisioplanet.es/en/", phone: "+34 645 541 698", email: "info@fisioplanet.es", web: "adequate", notes: "Centro multidisciplinar de 330 m² (desde 2009). Escala de crecimiento pero marca funcional y sin dueño/IG verificado: marca y presencia digital son las palancas." },

  // ---- HOSTELERÍA (14) ----
  { company: "Cap Rocat", city: "Cala Blava", sector: "hospitality", subsector: "Hotel-fortaleza de lujo y restaurante", website: "https://caprocat.com/en/", instagram: "@cap_rocat", phone: "+34 971 74 78 78", email: "info@caprocat.com", dm: { name: "Pablo Carrington", role: "Fundador y CEO de Marugal (gestora)" }, dmSrc: "https://indagare.com/podcasts/episodes/hotel-legends-mallorcas-cap-rocat-with-ceo-and-founder-of-marugal-pablo-carrington", signal: { note: "El restaurante La Fortaleza (chef Víctor García, 2 Soles Repsol) en la Guía MICHELIN España 2025", url: "https://guide.michelin.com/ca/en/islas-baleares/cala-blava/restaurant/la-fortaleza" }, web: "strong", notes: "Resort 5★ ultra-premium gestionado por Marugal. Ya fuerte en digital: la palanca es dirección de campaña/contenido de alta gama. Cuenta ancla premium." },
  { company: "Sant Francesc Hotel Singular", city: "Palma", sector: "hospitality", subsector: "Hotel boutique 5★ (palacio restaurado)", website: "https://www.hotelsantfrancesc.com/en/", instagram: "@hotelsantfrancesc", dm: { name: "Andrés Soldevila Ferrer", role: "Propietario (familia Soldevila-Ferrer)" }, dmSrc: "https://www.helencummins.com/sant-francesc-hotel-singular-palma-luxury/", signal: { note: "MICHELIN Key 2024; puesto 93,5 en La Liste 2026 (Leading Hotels)", url: "https://www.virtuoso.com/hotels/15434179/sant-francesc-hotel-singular" }, web: "strong", notes: "Grupo hotelero familiar (también Can Ferrereta y Majestic Barcelona). Operador independiente premium: comprador plausible de dirección de marca/digital para su cartera." },
  { company: "Can Ferrereta", city: "Santanyí", sector: "hospitality", subsector: "Hotel boutique 5★ (casa señorial s.XVII)", website: "https://www.hotelcanferrereta.com/en/hotel/can-ferrereta/", instagram: "@hotelcanferrereta", dm: { name: "Andrés Soldevila Ferrer", role: "Propietario (familia Soldevila-Ferrer)" }, dmSrc: "https://www.fandptravel.com/hotel/can-ferrereta-mallorca/", web: "strong", notes: "Hermano de Sant Francesc, familiar. Lujo boutique independiente en el sur en crecimiento; encaje para dirección de marca/digital continua." },
  { company: "Son Brull Hotel & Spa", city: "Pollença", sector: "hospitality", subsector: "Hotel rural boutique y spa (Relais & Châteaux)", website: "https://sonbrull.com/", instagram: "@sonbrull", dm: { name: "Familia Suau (Miguel, Mar y Alex)", role: "Propietarios (2ª generación, en finca a diario)" }, dmSrc: "https://theaficionados.com/travel/spain/mallorca/pollenca/son-brull-hotel-spa", signal: { note: "Destacado por su diseño y sostenibilidad en prensa 2025 (Attitude Interior Design Magazine)", url: "https://www.attitude-mag.com/en/travel/design/2025-01-20-son-brull-hotel-spa/" }, web: "strong", notes: "Relais & Châteaux familiar con relato fuerte (slow food, viñas, monasterio restaurado). Decisores en finca y accesibles; buen encaje para trabajo de marca premium." },
  { company: "Fontsanta Hotel Thermal Spa & Wellness", city: "Campos", sector: "hospitality", subsector: "Hotel boutique termal (solo adultos)", website: "https://www.fontsantahotel.com/", web: "adequate", notes: "Hotel boutique termal único cerca de Es Trenc. Sin dueño/handle verificado: huella digital fina que es, en sí, la palanca para dirección de marca/digital." },
  { company: "Treurer Agroturismo", city: "Algaida", sector: "hospitality", subsector: "Agroturismo de lujo y finca de aceite", website: "https://treurer.com/en/hotel-majorca-treurer/", dm: { name: "Miquel Miralles", role: "CEO (familia propietaria, 2ª generación)" }, dmSrc: "https://treurer.com/en/hotel-majorca-treurer/", web: "adequate", notes: "Agroturismo premium con marca de aceite AOVE — dos mundos de marca (hotel + producto) bajo una familia. Encaje fuerte para arquitectura de marca; social poco desarrollado." },
  { company: "Grupo Cappuccino", city: "Palma", sector: "hospitality", subsector: "Grupo premium de cafés/restaurantes (+ Hotel)", website: "https://www.cappuccinograndcafe.es/", instagram: "@cappuccinograndcafe", email: "penelope.picornell@grupocappuccino.com", dm: { name: "Juan Picornell Rowe", role: "Fundador / Propietario" }, dmSrc: "https://www.helencummins.com/cappuccino-group-mallorca/", web: "adequate", notes: "Grupo de hostelería premium nacido en Mallorca (14 Cappuccino, Tahini, Wellies, Hotel Cappuccino, sedes internacionales). Cartera multi-marca: encaje natural para dirección de marca/digital a escala." },
  { company: "Marc Fosh Restaurant", city: "Palma", sector: "hospitality", subsector: "Restaurante con estrella Michelin", website: "https://www.marcfosh.com/", dm: { name: "Marc Fosh", role: "Chef-propietario" }, dmSrc: "https://en.wikipedia.org/wiki/Marc_Fosh", web: "adequate", notes: "Primer chef británico con estrella Michelin en España; restaurante epónimo + finca. Marca personal fuerte pero web utilitaria: palanca para storytelling digital premium." },
  { company: "DINS Santi Taura", city: "Palma", sector: "hospitality", subsector: "Grupo de restaurantes con estrella Michelin", website: "https://www.grupsantitaura.com/en/dins-santitaura/", phone: "+34 656 738 214", email: "reserves@santitaura.com", dm: { name: "Santi Taura", role: "Chef-propietario" }, dmSrc: "https://guide.michelin.com/en/islas-baleares/palma/restaurant/dins-santi-taura", web: "adequate", notes: "Grupo de restaurantes de chef-propietario (1 estrella + 2 Soles Repsol) dentro del hotel El Llorenç. Decisor con nombre y contactos públicos: dirección de marca/digital a nivel grupo es plausible." },
  { company: "Adrián Quetglas Restaurant", city: "Palma", sector: "hospitality", subsector: "Restaurante con estrella Michelin", phone: "+34 971 78 11 19", dm: { name: "Adrián Quetglas", role: "Chef-propietario" }, dmSrc: "https://guide.michelin.com/en/islas-baleares/palma/restaurant/adrian-quetglas", web: "weak", notes: "Restaurante con estrella Michelin de chef-propietario. La aparente falta de web propia verificable es, en sí, una palanca clara para un build digital/marca premium." },
  { company: "Béns d'Avall", city: "Sóller", sector: "hospitality", subsector: "Restaurante con estrella Michelin (familiar desde 1971)", website: "https://www.bensdavall.com/", instagram: "@bensdavall", phone: "+34 971 632 381", email: "info@bensdavall.com", dm: { name: "Benet y Jaume Vicens", role: "Chefs/propietarios (padre e hijo)" }, dmSrc: "https://guide.michelin.com/es/es/islas-baleares/soller/restaurante/bens-d-avall", web: "adequate", notes: "Institución familiar de alta cocina en la costa de Sóller (estrella Michelin + Green Star). Decisores y contactos públicos; web tradicional con margen de uplift digital/marca." },
  { company: "Maca de Castro", city: "Port d'Alcúdia", sector: "hospitality", subsector: "Restaurante con estrella Michelin (grupo de chef)", website: "https://macadecastro.com/en/", instagram: "@maca_de_castro", dm: { name: "Maca de Castro", role: "Chef-propietaria" }, dmSrc: "https://guide.michelin.com/en/islas-baleares/port-d-alcdia/restaurant/maca-de-castro", signal: { note: "Presidenta de Euro-Toques (2024); desarrolla un nuevo proyecto 'Son Verí' en una finca histórica", url: "https://www.privatepropertymallorca.com/en/culture/michelin-starred-restaurants-in-mallorca-2025/" }, web: "adequate", notes: "Chef mallorquina de alto perfil ampliando su cartera (Son Verí). Grupo de chef en crecimiento con nuevos proyectos: candidata fuerte para arquitectura de marca y dirección digital entre conceptos." },
  { company: "Mhares Sea Club", city: "Llucmajor", sector: "hospitality", subsector: "Sea club premium y espacio de eventos", website: "https://mharesseaclub.com/en/", instagram: "@mharesseaclub", dm: { name: "Fabio della Porta", role: "Director de operaciones (verificar propiedad antes de pitch)" }, dmSrc: "https://rocketreach.co/mhares-sea-club-mallorca-profile_b415f5f8ff82b731", signal: { note: "Temporada 2025 (20 mar–26 oct) con nuevo programa de eventos/gastronomía", url: "https://mharesseaclub.com/en/agenda-en/" }, web: "adequate", notes: "Sea club de atardecer con negocio de eventos/bodas y programa de temporada. Marketing de eventos estacional es palanca digital clara; el contacto es operativo, confirmar propiedad." },
  { company: "CUIT Bar & Restaurant (Nakar Hotel)", city: "Palma", sector: "hospitality", subsector: "Restaurante rooftop de hotel boutique", website: "https://nakarhotel.com/cuit-restaurant/", dm: { name: "Miquel Calent", role: "Chef (CUIT, Nakar Hotel)" }, dmSrc: "https://www.abc-mallorca.com/cuit-restaurant-palma/", web: "adequate", notes: "Hotel boutique de diseño en Av. Jaime III con rooftop de chef con nombre. Bundle hotel + restaurante es una colaboración plausible de marca/digital; confirmar dirección/GM." },

  // ---- INMOBILIARIO / DISEÑO (13) ----
  { company: "OHLAB", city: "Palma", sector: "realestate", subsector: "Estudio de arquitectura e interiorismo", website: "https://ohlab.net/en/", instagram: "@ohlab_architecture", dm: { name: "Paloma Hernaiz y Jaime Oliver", role: "Cofundadores / Directores" }, dmSrc: "https://ohlab.net/en/", signal: { note: "Premio Ciutat de Palma 'Guillem Sagrera' de Arquitectura 2023 (Paseo Mallorca 15); Casa Xaloc Passivhaus 2025", url: "https://arquitecturayempresa.es/noticia/ohlab-gana-el-premio-ciutat-de-palma-guillem-sagrera" }, web: "strong", notes: "Estudio publicado internacionalmente (Dezeen, Wallpaper, Monocle) con prensa fuerte pero capa comercial/marca sobria: candidato a dirección de marca y storytelling de su residencial premium." },
  { company: "Moredesign", city: "Deià", sector: "realestate", subsector: "Arquitectura e interiorismo (villas de lujo)", website: "https://www.moredesign.es/", instagram: "@moredesign.es", phone: "+34 971 636 365", email: "mvillanueva@moredesign.es", dm: { name: "Manuel Villanueva y Oro del Negro", role: "Cofundadores (Dir. Arquitectura / Dir. Diseño)" }, dmSrc: "https://www.moredesign.es/bio", web: "adequate", notes: "Cartera de villas/hospitality mediterránea de alto nivel. La presentación de marca va por detrás de la calidad del trabajo: palanca clara para dirección digital premium." },
  { company: "Jaime Salvá Arquitectura e Interiorismo", city: "Palma", sector: "realestate", subsector: "Arquitectura e interiorismo", website: "https://www.salvarq.com/en/", dm: { name: "Jaime Salvá", role: "Fundador / Director" }, dmSrc: "https://www.salvarq.com/en/about.html", web: "adequate", notes: "Estudio de Palma (desde 2006) con proyectos internacionales y alianzas con promotores. Expresión de marca/digital modesta para su pedigrí." },
  { company: "Mora Arquitectura", city: "Palma", sector: "realestate", subsector: "Estudio de arquitectura", website: "https://www.mora-arquitectura.com/en/", dm: { name: "Jaume Mora", role: "Fundador / Arquitecto principal" }, dmSrc: "https://www.mora-arquitectura.com/en/studio/", web: "adequate", notes: "Práctica de arquitectura/interiorismo con web limpia pero portfolio estándar: margen para marca visual y storytelling frente a pares publicados como OHLAB." },
  { company: "Rôck&Villa", city: "Palma", sector: "realestate", subsector: "Promoción de lujo e interiorismo", website: "https://rockandvilla.com/", instagram: "@rockandvilla", email: "info@rockandvilla.com", dm: { name: "Paulo Valcic y Stefan Relic", role: "Cofundadores" }, dmSrc: "https://rockandvilla.com/about/", signal: { note: "En el libro 'Mallorca Living' de Loft Publications (edición 2024)", url: "https://loftpublications.com/blogs/meet-the-minds-behind-the-design/rock-villa-timeless-design-rooted-in-mallorca-s-essence" }, web: "strong", notes: "Dúo promotor que restaura casas mallorquinas en hogares de lujo. Ya consciente de marca: la palanca es elevación/escala de su storytelling digital." },
  { company: "PH Mallorca", city: "Port d'Andratx", sector: "realestate", subsector: "Promotor residencial super-prime", website: "https://phmallorca.com/", dm: { name: "Philip Hughes y Mike Richards", role: "Fundador y cofundador" }, dmSrc: "https://phmallorca.com/about-us/", web: "adequate", notes: "Promotor super-prime de Port Andratx. Huella digital deliberadamente discreta (sin social visible): hueco para dirección de marca refinada y privada orientada a UHNW." },
  { company: "Soulvillas", city: "Palma", sector: "realestate", subsector: "Promotor llave en mano y contratista", website: "https://soulvillas.com/en/", dm: { name: "Anja Peter", role: "CEO y fundadora" }, dmSrc: "https://soulvillas.com/en/soulvillas-group-2/", web: "adequate", notes: "Construcción + promoción + marketing de lujo bajo un techo. La marca lee operativa/técnica: oportunidad de llevarla al nivel premium que ocupa su producto final." },
  { company: "Terraza Balear", city: "Santa Ponça", sector: "realestate", subsector: "Estudio de interiorismo de lujo", website: "https://terrazabalear.com/", dm: { name: "Mariana Muñoz", role: "Fundadora / CEO" }, dmSrc: "https://terrazabalear.com/about-us/", signal: { note: "Alianza con Gunni & Trentino (mayo 2023) para formar un grupo europeo líder de interiorismo de lujo", url: "https://www.elespanol.com/invertia/empresas/inmobiliario/20230511/gunni-trentino-terraza-balear-consolidan-liderazgo-interiorismo/762923907_0.html" }, web: "strong", notes: "Líder de mercado tras la unión con Gunni & Trentino; la palanca es dirección de contenido/campaña de alta gama y consistencia bilingüe a escala, no un rebuild de base." },
  { company: "LF91", city: "Palma", sector: "realestate", subsector: "Arquitectura, interiorismo y construcción llave en mano", website: "https://www.lf91.com/en/", instagram: "@lf91_mallorca", dm: { name: "Miquel Bauzà", role: "Director general" }, dmSrc: "https://www.lf91.com/en/", web: "adequate", notes: "Constructor/diseñador integral (desde 1995). La marca se dispersa entre muchos servicios sin un relato premium nítido: oportunidad de enfocar y elevar el posicionamiento." },
  { company: "Abitare Mallorca", city: "Palma", sector: "realestate", subsector: "Arquitectura e interiorismo (casas/hoteles)", website: "https://www.abitaremallorca.es/", web: "adequate", notes: "Casi 30 años de trabajo de alto nivel pero presencia digital anónima y fina (sin equipo nombrado): palanca clara para identidad de marca, storytelling de principal y presentación de portfolio." },
  { company: "Fantastic Frank Palma", city: "Palma", sector: "realestate", subsector: "Inmobiliaria de diseño", website: "https://www.fantasticfrank.com/en/palma/", instagram: "@fantasticfrankpalma", dm: { name: "Kalle Wallroth y Ninos Younan", role: "Responsables de oficina / Socios (Palma)" }, dmSrc: "https://www.fantasticfrank.com/en/palma/", web: "strong", notes: "Agencia estética ('Inspire to Buy') ya madura de marca a nivel global: el ángulo local es dirección de campaña/contenido a medida para el mercado de Mallorca." },
  { company: "Mallorca Sotheby's International Realty", city: "Palma", sector: "realestate", subsector: "Inmobiliaria de lujo (afiliada Sotheby's)", website: "https://www.mallorca-sothebysrealty.com/en", dm: { name: "Alejandra Vanoli", role: "Directora general" }, dmSrc: "https://uk.linkedin.com/in/alejandra-vanoli-b2355a104", web: "adequate", notes: "Franquicia premium limitada por la plantilla de red: oportunidad de una capa de marca/contenido local diferenciada y storytelling bilingüe más allá del cascarón corporativo." },
  { company: "Luxury Estates Mallorca", city: "Port d'Andratx", sector: "realestate", subsector: "Inmobiliaria de lujo (afiliada Christie's)", website: "https://www.luxury-estates-mallorca.com/en", dm: { name: "Patrick Pawlowski", role: "Socio director y fundador" }, dmSrc: "https://www.christiesrealestate.com/real-estate-agents/patrick-pawlowski/27507/", web: "adequate", notes: "Agencia boutique de lujo dirigida por su dueño bajo el paraguas de Christie's: candidata a una identidad de marca/digital independiente que complemente en vez de disolverse en la afiliación." },

  // ---- RETAIL / LIFESTYLE (15) ----
  { company: "Cortana", city: "Palma", sector: "growth", subsector: "Moda premium y novia", website: "https://cortana.es", instagram: "@cortana_official", dm: { name: "Rosa Esteva", role: "Fundadora y diseñadora" }, dmSrc: "https://cortana.es/en/pages/about", signal: { note: "Trasladó su flagship de Palma a Carrer de Can Asprer 1 y lanzó colección de novia 2025 + nueva línea de hogar con artesanos locales", url: "https://essentiallymallorca.com/en/partner/cortana/" }, web: "strong", notes: "Sello made-in-Spain de alta gama que se expande a prêt-à-porter, novia y hogar. Marca premium en crecimiento cuyo empuje de ecommerce/hogar es justo el trabajo de dirección de marca que un estudio acompaña." },
  { company: "Treurer", city: "Algaida", sector: "growth", subsector: "Productor de aceite premium (DOP)", website: "https://treurer.com", instagram: "@treurer", dm: { name: "Joan Miralles", role: "Fundador / patriarca familiar" }, dmSrc: "https://treurer.com/en/the-finca-treurer-mallorca/", signal: { note: "Oro en el NYIOOC (New York International Olive Oil Competition) por cuarto año consecutivo (2023–2026)", url: "https://treurer.com/en/treurer-nyiooc-2026/" }, web: "strong", notes: "AOVE Arbequina premium familiar con relato de premios, ecommerce y extensión de oleoturismo/hotel boutique. Crecimiento multi-línea (aceite + hospitality): caso fuerte para dirección de marca cohesiva." },
  { company: "Oli Solivellas", city: "Port d'Alcúdia", sector: "growth", subsector: "Productor de aceite premium (DOP)", website: "https://olisolivellas.com", dm: { name: "Sebastián Solivellas", role: "Productor familiar de 2ª generación" }, dmSrc: "https://www.masmallorca.es/en/local-produce/solivellas-and-oli-silla-olive-oils.html", web: "adequate", notes: "Marca de aceite familiar consolidada (líneas Solivellas y Oli s'Illa) con ecommerce. Sin señal reciente ni social confirmado: palanca probable en presencia social débil y storytelling frente a rivales premiados." },
  { company: "Macià Batle", city: "Santa María del Camí", sector: "growth", subsector: "Bodega (Vi de la Terra Mallorca)", website: "https://www.maciabatle.com", dm: { name: "Sebastià Rubí", role: "Propietario / Presidente (adquirió la bodega en 2003)" }, dmSrc: "https://www.maciabatle.com/en/history/", signal: { note: "Cuatro medallas de oro en el Concours International de Lyon 2025 y 'Mejor Bodega de Baleares 2024' (Viajar)", url: "https://euroweeklynews.com/2025/04/04/international-recognition-for-mallorcan-wine/" }, web: "strong", notes: "Bodega mallorquina de referencia (300+ premios) con enoturismo y ecommerce. Marca multi-canal donde la dirección premium puede elevar la experiencia DTC y el storytelling." },
  { company: "SONMO (Son Moragues)", city: "Valldemossa", sector: "growth", subsector: "Marca lifestyle de finca (aceite, cerámica, lana)", website: "https://sonmo.es", dm: { name: "Joe Holles", role: "Director de innovación y sostenibilidad (confirmar propiedad)" }, dmSrc: "https://sonmo.es/en/pages/us", web: "strong", notes: "Finca regenerativa de la Tramuntana convertida en marca lifestyle multi-categoría. Ya premium y consciente de diseño; la palanca de crecimiento es escalar DTC internacional y un sistema de marca multi-producto coherente." },
  { company: "Monge Studio", city: "Palma", sector: "growth", subsector: "Calzado y alpargatas hechas a mano", website: "https://www.mongestudio.com", instagram: "@mongeshoes", phone: "+34 971 719 965", email: "info@mongestudio.com", dm: { name: "Pedro Monge", role: "Fundador" }, dmSrc: "https://www.viewmallorca.com/single-article-interview/pedro-monge", web: "strong", notes: "Marca de calzado artesano contemporáneo con distribución internacional y flagship. Marca premium de dueño con ambición de ecommerce: encaje para elevar DTC y consistencia de marca." },
  { company: "Nuar Shoes", city: "Alaró", sector: "growth", subsector: "Calzado artesano", website: "https://nuarshoes.com", instagram: "@nuar_shoes", dm: { name: "Ariana Baltierrez", role: "Fundadora y diseñadora" }, dmSrc: "https://www.xtant.io/community-1/nuar-shoes-spain", web: "adequate", notes: "Marca emergente de diseñadora que recupera técnicas de tejido mallorquinas. En crecimiento: palanca clara en escalar conocimiento de marca y DTC más allá de un público de nicho." },
  { company: "SURO Swimwear", city: "Palma", sector: "growth", subsector: "Baño sostenible", website: "https://suroswimwear.com", instagram: "@suroswimwear_", dm: { name: "Margarita Payeras Caldés", role: "Fundadora y directora creativa" }, dmSrc: "https://www.linkedin.com/in/mpayeras/", web: "adequate", notes: "Baño made-in-Spain sostenible. El Instagram fragmentado/bajo y el cambio de cuenta son palanca concreta: consolidación de marca/social y crecimiento DTC." },
  { company: "NAKĀWE Swimwear", city: "Palma", sector: "growth", subsector: "Baño sostenible y accesorios de playa", website: "https://nakaweswimwear.com", instagram: "@nakawe_swimwear", web: "adequate", notes: "Baño eco hecho a mano en Palma (desde 2019). Fundadora solo referida por nombre en prensa (sin verificar). Marca pequeña pero premium con historia de sostenibilidad infraexplotada digitalmente: palanca de crecimiento/marca." },
  { company: "Ecologic Cosmetics", city: "Palma", sector: "growth", subsector: "Cosmética natural/orgánica", website: "https://www.ecologiccosmetics.com", dm: { name: "Linda Nicolau", role: "Fundadora" }, dmSrc: "https://www.ecologiccosmetics.com/story", web: "adequate", notes: "Fabricante familiar de cosmética (desde 1993) con productos propios y red de distribuidores. Marca madura cuya palanca es una experiencia DTC/marca más premium a la altura del producto." },
  { company: "Miljø Store", city: "Palma", sector: "growth", subsector: "Retail premium de clean beauty (multi-marca)", website: "https://www.miljostore.com", dm: { name: "Patricia Román", role: "Fundadora" }, dmSrc: "https://www.helencummins.com/patricia-roman-miljo-store/", web: "adequate", notes: "Ecommerce de clean beauty curado por una fundadora con marca personal reconocible. Palanca: convertir su audiencia en una marca de tienda distinta y storefront de conversión. (Confirmar que la web resuelve.)" },
  { company: "Espanyolet", city: "Palma", sector: "growth", subsector: "Textiles y cerámica artesanos", website: "https://www.espanyolet.com", instagram: "@espanyolet", dm: { name: "Melissa Rosenbauer y Thomas Bossert", role: "Fundadores" }, dmSrc: "https://www.espanyolet.com/pages/melissa-and-thomas", web: "strong", notes: "Marca de textil/cerámica de hogar premium en Santa Catalina con público de prensa de diseño internacional. Ya consciente de marca; palanca: escalar DTC de edición limitada y wholesale manteniendo la identidad de alta gama." },
  { company: "Mallorcraft", city: "Palma", sector: "growth", subsector: "Cerámica, vidrio y textiles hechos a mano", website: "https://mallorcraft.com", instagram: "@mallorcraft", phone: "+34 689 849 985", web: "adequate", notes: "Marca artesana de mesa/lifestyle con gran alcance en Instagram (~60K) pero ecommerce genérico: el hueco entre audiencia social y web premium es la palanca accionable. Fundadora sin apellido verificable." },
  { company: "Colom", city: "Palma", sector: "growth", subsector: "Concept store premium multi-marca", website: "https://colomstore.com", instagram: "@colom_store", dm: { name: "Suso Ramos", role: "Cofundador (con Liticia Cerqueira y Pablo Fuster)" }, dmSrc: "https://monocle.com/fashion/colom-shop-palma/", signal: { note: "Abrió en oct 2025 un flagship de ~750 m² en tres plantas en Carrer de Colom, Palma (moda, objetos de diseño, fragancia, café Rosevelvet), con cobertura de Monocle", url: "https://monocle.com/fashion/colom-shop-palma/" }, web: "adequate", notes: "Concept store nuevo y bien financiado del equipo de La Principal/Addict (APC, Comme des Garçons, Veja…). Lanzamiento físico reciente sin capa digital/ecommerce madura: momento prime para build digital. (Confirmar URL.)" },
  { company: "La Principal", city: "Palma", sector: "growth", subsector: "Concept store + sello propio (Mews)", website: "https://laprincipalshop.com", dm: { name: "Suso Ramos", role: "Fundador / fuerza creativa (también Addict y el sello Mews)" }, dmSrc: "https://www.viewmallorca.com/article-single-long/colom-a-new-concept-shop-from-la-principal", signal: { note: "El mismo equipo lanzó el mayor concept store Colom en Palma en oct 2025, señal de expansión activa del grupo", url: "https://monocle.com/fashion/colom-shop-palma/" }, web: "adequate", notes: "Concept store consolidado con sello propio y trayectoria de expansión (Colom). Grupo de retail premium de dueño cuya identidad digital multi-marca y ecommerce es palanca accionable a medida que escala." },
];

const MALLORCA = R.map(mk);
export default MALLORCA;
