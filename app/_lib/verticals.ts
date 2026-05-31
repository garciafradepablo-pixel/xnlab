// VERTICALS — the applied layer of the studio.
//
// The model the user set: the SIX SURFACES (the orbs) are a universal
// spine — every brand reaches its customer through the same six. What
// changes is the INDUSTRY. A clinic, a restaurant, a property agency
// and a hotel all have the same six surfaces; what each surface *means*
// is what differs. So this file holds the constant spine (SURFACES)
// once, and each vertical supplies six "applied" lines indexed to it.
//
// This is what powers /for/[vertical] — one template, infinite
// industry pages, each with its own SEO, all sharing the orb framework.
// New verticals are added by appending one object here. Hospitality is
// the first case of the system (migrated from the old bespoke
// /hospitality page; that URL now 301s to /for/hospitality).
//
// Six surface slugs stay locked to AGENTS.md §8. Verticals are a
// SEPARATE axis and may grow freely. No pricing anywhere (§5b).

export type Bi = { en: string; es: string };

export type VerticalSlug = "hospitality" | "clinics" | "restaurants" | "real-estate";

// The universal spine. The `slug` ties each surface back to its world
// (/worlds/<slug>) so the applied page and the canonical world stay in
// one vocabulary. `n` is the editorial number shown in the UI.
export const SURFACES: { n: string; slug: string; label: Bi }[] = [
  { n: "01", slug: "product", label: { en: "Product", es: "Producto" } },
  { n: "02", slug: "owned-digital", label: { en: "Owned Digital", es: "Digital Propio" } },
  { n: "03", slug: "retail-physical", label: { en: "Retail & Physical", es: "Retail y Físico" } },
  { n: "04", slug: "customer-operations", label: { en: "Customer Operations", es: "Operaciones de Cliente" } },
  { n: "05", slug: "communication", label: { en: "Communication", es: "Comunicación" } },
  { n: "06", slug: "community-culture", label: { en: "Community & Culture", es: "Comunidad y Cultura" } },
];

export type Vertical = {
  slug: VerticalSlug;
  order: number;
  name: Bi;
  tagline: Bi; // short sub-types line — for nav rows and index cards
  // hero
  eyebrow: Bi;
  h1a: Bi;
  h1b: Bi; // serif-italic accent
  strap: Bi;
  // 001 — the perception gap
  gapLabel: Bi;
  gapH1a: Bi;
  gapH1b: Bi; // serif-italic accent
  gapIntro: Bi;
  symptoms: Bi[]; // exactly 6
  gapResolve: Bi;
  // 002 — the six surfaces applied (indexed to SURFACES, exactly 6)
  surfacesLabel: Bi;
  surfacesH1b: Bi; // serif-italic accent; "Six surfaces." is the constant lead
  surfacesIntro: Bi;
  applied: Bi[]; // exactly 6, indexed to SURFACES
  // closing CTA
  ctaH: Bi;
  ctaLine: Bi;
  // SEO
  seoTitle: string;
  seoDesc: string;
  keywords: string[];
};

export const verticals: Vertical[] = [
  {
    slug: "hospitality",
    order: 1,
    name: { en: "Hospitality", es: "Hostelería" },
    tagline: { en: "Hotels, restaurants, nightlife, wellness.", es: "Hoteles, restaurantes, ocio, wellness." },
    eyebrow: { en: "Applied vertical · Hospitality", es: "Vertical aplicada · Hostelería" },
    h1a: { en: "Atmosphere systems for", es: "Sistemas de atmósfera para" },
    h1b: { en: "modern hospitality.", es: "la hostelería moderna." },
    strap: {
      en: "Hotels, restaurants, nightlife, wellness — the room a guest enters and the room they read about online, made one.",
      es: "Hoteles, restaurantes, ocio, wellness — la sala en la que entra un huésped y la sala que lee online, hechas una.",
    },
    gapLabel: { en: "001 — The perception gap", es: "001 — El gap de percepción" },
    gapH1a: { en: "Your room is full.", es: "Tu sala está llena." },
    gapH1b: { en: "Online it reads half a room below.", es: "Online se lee media sala por debajo." },
    gapIntro: {
      en: "The operators we work with already win the room. The calendar is healthy, the reviews are kind, the press writes. The gap lives one layer up — between how the venue feels at the door and how it reads on a screen. That gap is the work.",
      es: "Los operadores con los que trabajamos ya ganan la sala. La agenda está sana, las reseñas son amables, la prensa escribe. El gap vive una capa más arriba — entre cómo se siente el local en la puerta y cómo se lee en una pantalla. Ese gap es el trabajo.",
    },
    symptoms: [
      { en: "The venue is full. The reservation page reads like a spreadsheet.", es: "El local está lleno. La página de reservas parece una hoja de cálculo." },
      { en: "Press writes about you. The website sounds like a chain.", es: "La prensa escribe sobre ti. La web suena a cadena." },
      { en: "Guests rave in person. The feed looks like everyone else's.", es: "Los clientes te alaban en persona. El feed se ve como el de todos." },
      { en: "Reviews praise the dish. None of them describes a feeling.", es: "Las reseñas elogian el plato. Ninguna describe una sensación." },
      { en: "You're recommended locally. You're not yet a destination.", es: "Te recomiendan en tu ciudad. Aún no eres un destino." },
      { en: "You're known. You're not yet inevitable.", es: "Te conocen. Aún no eres inevitable." },
    ],
    gapResolve: {
      en: "What we resolve: the distance between filling a venue and being inevitable. Closed surface by surface, the venue stops competing for bookings and starts holding memory.",
      es: "Lo que resolvemos: la distancia entre llenar un local y ser inevitable. Cerrado superficie a superficie, el local deja de competir por reservas y empieza a sostener memoria.",
    },
    surfacesLabel: { en: "002 — Six surfaces, applied", es: "002 — Seis superficies, aplicadas" },
    surfacesH1b: { en: "One venue.", es: "Un local." },
    surfacesIntro: {
      en: "Every brand reaches its customer across the same six surfaces. Here is what each one becomes in hospitality — calibrated to operator, hour and guest, signed by one hand.",
      es: "Toda marca llega a su cliente por las mismas seis superficies. Esto es en lo que se convierte cada una en hostelería — calibrada a operador, hora y huésped, firmada por una sola mano.",
    },
    applied: [
      { en: "The stay, the meal, the night — the moment the guest came for, shaped from first sense to last.", es: "La estancia, la comida, la noche — el momento por el que vino el huésped, cuidado del primer sentido al último." },
      { en: "Booking flow, website, the room seen online — the first room a guest ever enters is a screen.", es: "Reserva, web, la habitación vista online — la primera habitación en la que entra un huésped es una pantalla." },
      { en: "Threshold, light, sound, material — the room that does the work before a word is spoken.", es: "Umbral, luz, sonido, material — la sala que hace el trabajo antes de decir una palabra." },
      { en: "Reservation to farewell — arrival, service and the goodbye that earns the next booking.", es: "De la reserva a la despedida — la llegada, el servicio y el adiós que gana la próxima reserva." },
      { en: "Press, social, the voice between visits — what the venue says while the guest is home.", es: "Prensa, redes, la voz entre visitas — lo que dice el local mientras el huésped está en casa." },
      { en: "Regulars, collaborations, the scene — the venue as an address people belong to.", es: "Habituales, colaboraciones, la escena — el local como una dirección a la que se pertenece." },
    ],
    ctaH: { en: "Build a venue that walks into the conversation before you do.", es: "Construye un local que entre en la conversación antes que tú." },
    ctaLine: { en: "We accept a limited number of hospitality brands per cycle. Every engagement is selected.", es: "Aceptamos un número limitado de marcas de hostelería por ciclo. Cada encargo se selecciona." },
    seoTitle: "Hospitality — Atmosphere Systems · XNLAB",
    seoDesc:
      "Atmosphere systems for hotels, restaurants, nightlife and wellness. The room a guest enters and the room they read about online, directed as one. By appointment.",
    keywords: [
      "hospitality atmosphere design",
      "hotel brand direction",
      "restaurant atmosphere systems",
      "nightlife venue branding",
      "wellness destination brand",
      "luxury hospitality creative direction",
      "boutique hotel brand studio",
      "XNLAB hospitality",
    ],
  },
  {
    slug: "clinics",
    order: 2,
    name: { en: "Clinics", es: "Clínicas" },
    tagline: { en: "Aesthetic, dental, medical, wellness.", es: "Estética, dental, médica, wellness." },
    eyebrow: { en: "Applied vertical · Clinics", es: "Vertical aplicada · Clínicas" },
    h1a: { en: "Atmosphere systems for", es: "Sistemas de atmósfera para" },
    h1b: { en: "private clinics.", es: "clínicas privadas." },
    strap: {
      en: "Aesthetic, dental, medical, wellness — the calm a patient feels in the chair, carried to every screen.",
      es: "Estética, dental, médica, wellness — la calma que siente el paciente en la camilla, llevada a cada pantalla.",
    },
    gapLabel: { en: "001 — The perception gap", es: "001 — El gap de percepción" },
    gapH1a: { en: "Patients trust you in the room.", es: "El paciente confía en ti en la consulta." },
    gapH1b: { en: "Online they can't tell you apart.", es: "Online no te distingue de los demás." },
    gapIntro: {
      en: "The clinics we work with deliver real results and real care. The chair is busy, the outcomes are good, the patients are loyal. The gap lives before the first appointment — in a digital presence that looks like every other clinic, when the care inside is anything but.",
      es: "Las clínicas con las que trabajamos dan resultados reales y trato real. La camilla está ocupada, los resultados son buenos, los pacientes son fieles. El gap vive antes de la primera cita — en una presencia digital que parece la de cualquier otra clínica, cuando el cuidado de dentro no se parece a ninguna.",
    },
    symptoms: [
      { en: "The chair is busy. The website looks like a template.", es: "La camilla está ocupada. La web parece una plantilla." },
      { en: "Your results are excellent. The booking page feels clinical, not calm.", es: "Tus resultados son excelentes. La página de reservas se siente clínica, no serena." },
      { en: "Patients refer friends. The first screen earns none of that trust.", es: "Los pacientes traen amigos. La primera pantalla no se gana esa confianza." },
      { en: "Your reviews are strong. Nothing online explains why you're different.", es: "Tus reseñas son sólidas. Nada online explica por qué eres diferente." },
      { en: "You're recommended by name. You're not yet the obvious choice.", es: "Te recomiendan por tu nombre. Aún no eres la opción obvia." },
      { en: "You're competent. You're not yet reassuring at first glance.", es: "Eres competente. Aún no transmites calma a primera vista." },
    ],
    gapResolve: {
      en: "What we resolve: the distance between giving great care and looking like you do before a patient walks in. Closed surface by surface, the clinic stops competing on price and starts being chosen on trust.",
      es: "Lo que resolvemos: la distancia entre dar un gran cuidado y parecerlo antes de que el paciente entre. Cerrado superficie a superficie, la clínica deja de competir por precio y empieza a elegirse por confianza.",
    },
    surfacesLabel: { en: "002 — Six surfaces, applied", es: "002 — Seis superficies, aplicadas" },
    surfacesH1b: { en: "One clinic.", es: "Una clínica." },
    surfacesIntro: {
      en: "Every brand reaches its customer across the same six surfaces. Here is what each one becomes for a clinic — where the feeling of safe hands has to arrive before the patient does.",
      es: "Toda marca llega a su cliente por las mismas seis superficies. Esto es en lo que se convierte cada una para una clínica — donde la sensación de estar en buenas manos tiene que llegar antes que el paciente.",
    },
    applied: [
      { en: "The treatment and the consultation — the calm, the competence and the result the patient feels.", es: "El tratamiento y la consulta — la calma, la competencia y el resultado que siente el paciente." },
      { en: "Booking, website, patient portal — where trust is won or lost before the first appointment.", es: "Reserva, web, portal del paciente — donde se gana o se pierde la confianza antes de la primera cita." },
      { en: "Waiting room, threshold, light and quiet — the space that says you are in safe hands.", es: "Sala de espera, umbral, luz y silencio — el espacio que dice que estás en buenas manos." },
      { en: "Intake, aftercare, follow-up — the timing that turns a procedure into a relationship.", es: "Admisión, postoperatorio, seguimiento — el ritmo que convierte un procedimiento en una relación." },
      { en: "Education, social, reputation — authority shown, never shouted.", es: "Divulgación, redes, reputación — autoridad mostrada, nunca gritada." },
      { en: "Referrals, testimonials, the patient circle — the quiet network that fills the calendar.", es: "Recomendaciones, testimonios, el círculo de pacientes — la red discreta que llena la agenda." },
    ],
    ctaH: { en: "Build a clinic patients trust before they walk in.", es: "Construye una clínica en la que el paciente confía antes de entrar." },
    ctaLine: { en: "We accept a limited number of clinics per cycle. Every engagement is selected.", es: "Aceptamos un número limitado de clínicas por ciclo. Cada encargo se selecciona." },
    seoTitle: "Clinics — Atmosphere Systems · XNLAB",
    seoDesc:
      "Atmosphere systems for private clinics — aesthetic, dental, medical, wellness. The calm and trust a patient feels in the chair, carried to every screen. By appointment.",
    keywords: [
      "clinic brand design",
      "aesthetic clinic branding",
      "dental clinic brand direction",
      "medical practice brand identity",
      "private clinic website design",
      "patient experience design",
      "wellness clinic atmosphere",
      "XNLAB clinics",
    ],
  },
  {
    slug: "restaurants",
    order: 3,
    name: { en: "Restaurants", es: "Restaurantes" },
    tagline: { en: "Fine dining, bistros, bars.", es: "Alta cocina, bistrós, bares." },
    eyebrow: { en: "Applied vertical · Restaurants", es: "Vertical aplicada · Restaurantes" },
    h1a: { en: "Atmosphere systems for", es: "Sistemas de atmósfera para" },
    h1b: { en: "restaurants.", es: "restaurantes." },
    strap: {
      en: "Fine dining, bistros, bars — the appetite that starts on a screen and the room that keeps it.",
      es: "Alta cocina, bistrós, bares — el apetito que empieza en una pantalla y la sala que lo sostiene.",
    },
    gapLabel: { en: "001 — The perception gap", es: "001 — El gap de percepción" },
    gapH1a: { en: "The dining room is full.", es: "La sala está llena." },
    gapH1b: { en: "The feed says nothing the food does.", es: "El feed no dice nada de lo que dice la comida." },
    gapIntro: {
      en: "The restaurants we work with already fill tables. The food is right, the regulars return, the local press is kind. The gap lives on the surfaces a diner meets before the first bite — a reservation page, a website, a feed that doesn't taste like the room.",
      es: "Los restaurantes con los que trabajamos ya llenan mesas. La comida está bien, los habituales vuelven, la prensa local es amable. El gap vive en las superficies que un comensal encuentra antes del primer bocado — una página de reservas, una web, un feed que no sabe a la sala.",
    },
    symptoms: [
      { en: "Tables are full. The reservation page reads like a form.", es: "Las mesas están llenas. La página de reservas parece un formulario." },
      { en: "The food is photographed. The brand around it is silent.", es: "La comida se fotografía. La marca a su alrededor está en silencio." },
      { en: "Regulars return. New guests can't picture the room online.", es: "Los habituales vuelven. El nuevo comensal no imagina la sala online." },
      { en: "Reviews praise the dish. None describe the evening.", es: "Las reseñas elogian el plato. Ninguna describe la velada." },
      { en: "You're a local favourite. You're not yet a reason to travel.", es: "Eres el favorito del barrio. Aún no eres motivo de viaje." },
      { en: "You're loved. You're not yet quoted.", es: "Te quieren. Aún no te citan." },
    ],
    gapResolve: {
      en: "What we resolve: the distance between a full room and a name worth travelling for. Closed surface by surface, the restaurant stops competing on the menu and starts being remembered for the evening.",
      es: "Lo que resolvemos: la distancia entre una sala llena y un nombre por el que se viaja. Cerrado superficie a superficie, el restaurante deja de competir por la carta y empieza a recordarse por la velada.",
    },
    surfacesLabel: { en: "002 — Six surfaces, applied", es: "002 — Seis superficies, aplicadas" },
    surfacesH1b: { en: "One table.", es: "Una mesa." },
    surfacesIntro: {
      en: "Every brand reaches its customer across the same six surfaces. Here is what each one becomes for a restaurant — where the evening has to be felt before the first plate lands.",
      es: "Toda marca llega a su cliente por las mismas seis superficies. Esto es en lo que se convierte cada una para un restaurante — donde la velada tiene que sentirse antes de que llegue el primer plato.",
    },
    applied: [
      { en: "The plate and the menu — the taste, the sequence, the moment the dish lands.", es: "El plato y la carta — el sabor, la secuencia, el momento en que llega el plato." },
      { en: "Reservations, website, the menu online — the appetite that begins on a screen.", es: "Reservas, web, la carta online — el apetito que empieza en una pantalla." },
      { en: "The dining room — light, acoustics, ceramic, the first sightline through the door.", es: "La sala — luz, acústica, cerámica, la primera mirada al cruzar la puerta." },
      { en: "Booking to table to goodbye — the service rhythm that decides the second visit.", es: "De la reserva a la mesa a la despedida — el ritmo de servicio que decide la segunda visita." },
      { en: "Social, press, the voice — the photograph that travels and the line that gets quoted.", es: "Redes, prensa, la voz — la fotografía que viaja y la frase que se cita." },
      { en: "Regulars, chefs, collaborations — the table as a cultural reference, not just a meal.", es: "Habituales, chefs, colaboraciones — la mesa como referencia cultural, no solo una comida." },
    ],
    ctaH: { en: "Build a restaurant people travel for.", es: "Construye un restaurante por el que se viaja." },
    ctaLine: { en: "We accept a limited number of restaurants per cycle. Every engagement is selected.", es: "Aceptamos un número limitado de restaurantes por ciclo. Cada encargo se selecciona." },
    seoTitle: "Restaurants — Atmosphere Systems · XNLAB",
    seoDesc:
      "Atmosphere systems for restaurants, bistros and bars. The appetite that starts on a screen and the room that keeps it, directed as one. By appointment.",
    keywords: [
      "restaurant branding",
      "restaurant brand direction",
      "fine dining brand identity",
      "restaurant website design",
      "bar and bistro atmosphere",
      "restaurant social media direction",
      "hospitality dining brand studio",
      "XNLAB restaurants",
    ],
  },
  {
    slug: "real-estate",
    order: 4,
    name: { en: "Real Estate", es: "Inmobiliaria" },
    tagline: { en: "Agencies, developers, luxury listings.", es: "Agencias, promotoras, propiedades de lujo." },
    eyebrow: { en: "Applied vertical · Real estate", es: "Vertical aplicada · Inmobiliaria" },
    h1a: { en: "Atmosphere systems for", es: "Sistemas de atmósfera para" },
    h1b: { en: "premium property.", es: "inmobiliarias de prestigio." },
    strap: {
      en: "Agencies, developers, luxury listings — the price bracket a buyer reads before the first viewing.",
      es: "Agencias, promotoras, propiedades de lujo — el rango de precio que un comprador lee antes de la primera visita.",
    },
    gapLabel: { en: "001 — The perception gap", es: "001 — El gap de percepción" },
    gapH1a: { en: "Your properties are premium.", es: "Tus propiedades son premium." },
    gapH1b: { en: "Your listings look like everyone's.", es: "Tus anuncios se ven como los de todos." },
    gapIntro: {
      en: "The agencies and developers we work with handle real value and real clients. The deals close, the portfolio is strong, the referrals come. The gap lives in the surfaces a buyer or seller meets first — listings, a website, a brochure that signals 'agency', not the calibre of the asset.",
      es: "Las agencias y promotoras con las que trabajamos manejan valor real y clientes reales. Las operaciones se cierran, el portfolio es fuerte, las recomendaciones llegan. El gap vive en las superficies que un comprador o vendedor encuentra primero — listados, una web, un dossier que dice 'agencia', no el nivel del activo.",
    },
    symptoms: [
      { en: "The portfolio is strong. The website looks like a portal.", es: "El portfolio es fuerte. La web parece un portal." },
      { en: "The property is worth millions. The listing reads like every other.", es: "La propiedad vale millones. El anuncio se lee como cualquier otro." },
      { en: "Your service is white-glove. The first email doesn't show it.", es: "Tu servicio es de guante blanco. El primer correo no lo demuestra." },
      { en: "Sellers trust you in person. Online they can't tell you apart.", es: "Los vendedores confían en ti en persona. Online no te distinguen." },
      { en: "You close high-value deals. You're not yet the name sellers ask for.", es: "Cierras operaciones de alto valor. Aún no eres el nombre que piden los vendedores." },
      { en: "You're established. You're not yet inevitable.", es: "Estás consolidada. Aún no eres inevitable." },
    ],
    gapResolve: {
      en: "What we resolve: the distance between handling premium property and looking premium before the first call. Closed surface by surface, the agency stops competing on listings and starts being chosen on standing.",
      es: "Lo que resolvemos: la distancia entre manejar propiedad premium y parecerlo antes de la primera llamada. Cerrado superficie a superficie, la agencia deja de competir por listados y empieza a elegirse por prestigio.",
    },
    surfacesLabel: { en: "002 — Six surfaces, applied", es: "002 — Seis superficies, aplicadas" },
    surfacesH1b: { en: "One name.", es: "Un nombre." },
    surfacesIntro: {
      en: "Every brand reaches its customer across the same six surfaces. Here is what each one becomes for a property brand — where the price bracket has to be read before the first viewing.",
      es: "Toda marca llega a su cliente por las mismas seis superficies. Esto es en lo que se convierte cada una para una marca inmobiliaria — donde el rango de precio tiene que leerse antes de la primera visita.",
    },
    applied: [
      { en: "The property and the viewing — the moment a buyer imagines a life inside the walls.", es: "La propiedad y la visita — el momento en que un comprador imagina una vida dentro." },
      { en: "Listings, website, the brochure online — where a buyer decides to call, or scrolls past.", es: "Listados, web, el dossier online — donde un comprador decide llamar, o sigue de largo." },
      { en: "Office, showroom, the staged property — the threshold that signals the price bracket.", es: "Oficina, showroom, la propiedad preparada — el umbral que anuncia el rango de precio." },
      { en: "Enquiry to viewing to closing — the responsiveness that holds a high-value deal together.", es: "De la consulta a la visita al cierre — la capacidad de respuesta que sostiene una operación de alto valor." },
      { en: "Portfolio, social, press — the authority that makes a seller choose you over the office next door.", es: "Portfolio, redes, prensa — la autoridad por la que un vendedor te elige antes que a la oficina de al lado." },
      { en: "Network, referrals, reputation — the name that opens doors before the agent does.", es: "Red, recomendaciones, reputación — el nombre que abre puertas antes que el agente." },
    ],
    ctaH: { en: "Build an agency sellers ask for by name.", es: "Construye una agencia que los vendedores piden por su nombre." },
    ctaLine: { en: "We accept a limited number of property brands per cycle. Every engagement is selected.", es: "Aceptamos un número limitado de marcas inmobiliarias por ciclo. Cada encargo se selecciona." },
    seoTitle: "Real Estate — Atmosphere Systems · XNLAB",
    seoDesc:
      "Atmosphere systems for premium property — agencies, developers, luxury listings. Look as premium as the asset before the first call. By appointment.",
    keywords: [
      "real estate branding",
      "luxury real estate brand direction",
      "property developer branding",
      "estate agency brand identity",
      "luxury property website design",
      "real estate marketing direction",
      "premium property brand studio",
      "XNLAB real estate",
    ],
  },
];

export function getVertical(slug: string): Vertical | undefined {
  return verticals.find((v) => v.slug === slug);
}
