// Editorial archive. NOT a blog — these are "lab records": cultural and
// aesthetic observations from inside the studio, written to SEO-rank for
// premium category queries (hospitality branding, atmospheric design, etc.)
// without ever reading as a marketing blog.
//
// To add a new entry: prepend an object to the records array below.
// Slugs become URLs at /lab-records/<slug>.

export type LabRecord = {
  slug: string;
  number: string; // "001", "002"...
  date: string; // ISO YYYY-MM-DD
  category: { en: string; es: string };
  // Linked World Core slug — for tinting and cross-linking. Optional.
  worldSlug?: string;
  title: { en: string; es: string };
  lead: { en: string; es: string };
  body: { en: string[]; es: string[] };
  // 1–3 short keywords / tags for footer + SEO. Plain strings.
  tags?: string[];
};

export const records: LabRecord[] = [
  {
    slug: "future-of-hospitality-branding-is-atmospheric",
    number: "001",
    date: "2026-05-12",
    category: { en: "Hospitality", es: "Hospitalidad" },
    worldSlug: "hospitality-experience",
    title: {
      en: "The future of hospitality branding is atmospheric.",
      es: "El futuro del branding hotelero es atmosférico.",
    },
    lead: {
      en: "The hotel that wins the next decade will not be the one with the loudest visual identity. It will be the one whose rooms still feel like themselves when the guest wakes up at four in the morning.",
      es: "El hotel que gane la próxima década no será el de la identidad visual más sonora. Será aquel cuyas habitaciones sigan sintiéndose a sí mismas cuando el huésped despierte a las cuatro de la mañana.",
    },
    body: {
      en: [
        "For thirty years, hospitality branding has been treated as a graphic problem. A logotype, a colour, a typeface, a website. The output sat on the surface of the building like a printed sticker. The building did its own work; the brand did its own work; the guest connected them only when looking at a billing statement.",
        "The new generation of operators — quiet, slow, often built by people who left larger groups — are designing in the opposite direction. They begin not with the mark but with the air. What does the corridor smell like at 7am? What note plays under the door of the room when the guest first enters? What weight does the doorknob have? Brand becomes an emergent property of these decisions. It is detected, not declared.",
        "We call this atmospheric branding. It is harder to specify in a deck and harder to enforce in a multi-site rollout. It demands designers willing to step outside the visual identity discipline and into spatial acoustics, lighting calibration, even material procurement. It also produces a kind of loyalty that traditional hospitality branding rarely achieves: not “I remember the logo,” but “I remember how I felt for the next three days.”",
        "There is a commercial argument hidden in this aesthetic one. Atmospheric brands compress the gap between marketing and operations into a single decision: every operational call is a brand call, and every brand call is an operational one. The economics improve quietly. Reviews improve more quickly than expected. Press, when it comes, treats the place as an idea rather than a property.",
        "For the next wave of boutique hotels, restaurants and members clubs, this is the work worth doing. The visual identity follows the atmosphere. The atmosphere follows the discipline. The discipline follows the question: what should this place feel like at four in the morning, when nobody is selling anything.",
      ],
      es: [
        "Durante treinta años el branding hotelero se ha tratado como un problema gráfico. Un logotipo, un color, una tipografía, una web. La salida quedaba en la superficie del edificio como una pegatina impresa. El edificio hacía su trabajo, la marca hacía el suyo, y el huésped los conectaba solo al mirar la factura.",
        "La nueva generación de operadores — callados, lentos, a menudo construidos por gente que dejó grupos más grandes — diseña en la dirección contraria. No empiezan por la marca sino por el aire. ¿A qué huele el pasillo a las 7am? ¿Qué nota suena bajo la puerta de la habitación cuando el huésped entra por primera vez? ¿Qué peso tiene la manilla? La marca se convierte en una propiedad emergente de esas decisiones. Se detecta, no se declara.",
        "Lo llamamos branding atmosférico. Es más difícil de especificar en una presentación y más difícil de hacer cumplir en una implementación con varios locales. Exige diseñadores capaces de salir de la disciplina de identidad visual y entrar en la acústica espacial, la calibración de luz, incluso la compra de materiales. Produce además un tipo de lealtad que el branding hotelero tradicional rara vez consigue: no “me acuerdo del logo” sino “me acuerdo de cómo me sentí durante los tres días siguientes”.",
        "Hay un argumento comercial escondido dentro de este argumento estético. Las marcas atmosféricas comprimen la distancia entre marketing y operaciones en una sola decisión: cada decisión operativa es una decisión de marca, y viceversa. La economía mejora en silencio. Las reseñas mejoran antes de lo esperado. La prensa, cuando llega, trata el sitio como una idea, no como una propiedad.",
        "Para la próxima ola de hoteles boutique, restaurantes y clubs privados, este es el trabajo que merece la pena. La identidad visual sigue a la atmósfera. La atmósfera sigue a la disciplina. La disciplina sigue a la pregunta: ¿cómo debería sentirse este sitio a las cuatro de la mañana, cuando nadie está vendiendo nada?",
      ],
    },
    tags: ["hospitality branding", "atmospheric design", "boutique hotel"],
  },
  {
    slug: "artists-no-longer-release-music-they-release-worlds",
    number: "002",
    date: "2026-05-08",
    category: { en: "Music", es: "Música" },
    worldSlug: "music-cultural-artists",
    title: {
      en: "Artists no longer release music. They release worlds.",
      es: "Los artistas ya no publican música. Publican mundos.",
    },
    lead: {
      en: "An album is no longer the unit of release. The unit is a coherent universe across sound, image, fashion, language, ritual and absence — held together by an identity system capable of surviving a fifteen-second clip.",
      es: "Un álbum ya no es la unidad de lanzamiento. La unidad es un universo coherente entre sonido, imagen, moda, lenguaje, ritual y ausencia — sostenido por un sistema de identidad capaz de sobrevivir a un clip de quince segundos.",
    },
    body: {
      en: [
        "Until recently, artist identity was managed by the record label, refreshed once per album cycle, and largely concentrated in the music itself. The branding existed to point at the music. The music did the work. Everything else — covers, videos, merch — circled the work as marketing.",
        "That model has inverted. Today the most defining artists are running coherent visual systems that operate across formats they cannot fully control: an unlisted teaser on someone else's account, a stadium shoot in a country they have never visited, a fan-made edit, a meme. Their identity has to survive every one of those contexts. The music is one surface among many.",
        "This means artists need worldbuilding, not branding. The system has to be deep enough to generate output that the artist did not commission. It must define not only typography and palette but also gesture vocabulary, sonic texture, photographic register, what the artist will not say, what their internet behaviour looks like, how their face is lit when they appear on someone else's stage. A coherent world generates fan content that still belongs to the artist.",
        "We see this most clearly in the new wave of cultural artists who are operating like cinematographers of their own existence: Rosalía, FKA twigs, Yves Tumor, Arca, the post-Frank Ocean generation. Their releases are not albums but chapters. Their visual systems persist across years, not seasons. Their identities behave like languages, not logos.",
        "The studio's role in this space is the same as in hospitality and architecture: to design the conditions under which the work becomes itself. Not the work — the field in which the work happens. The artist remains the artist. The world is what we build around them.",
      ],
      es: [
        "Hasta hace poco, la identidad del artista la gestionaba el sello, se refrescaba una vez por ciclo de álbum, y se concentraba sobre todo en la propia música. El branding existía para señalar la música. La música hacía el trabajo. Todo lo demás — portadas, videos, merch — orbitaba la obra como marketing.",
        "Ese modelo se ha invertido. Hoy los artistas más definitorios manejan sistemas visuales coherentes que operan en formatos que no pueden controlar del todo: un teaser sin publicar en la cuenta de otro, una sesión de estadio en un país en el que nunca han estado, una edición de un fan, un meme. Su identidad tiene que sobrevivir a cada uno de esos contextos. La música es una superficie entre muchas.",
        "Esto significa que los artistas necesitan worldbuilding, no branding. El sistema tiene que ser lo bastante profundo para generar piezas que el artista no encargó. Debe definir no solo tipografía y paleta sino vocabulario gestual, textura sonora, registro fotográfico, lo que el artista no va a decir, cómo es su comportamiento en internet, cómo está iluminada su cara cuando aparece en el escenario de otro. Un mundo coherente genera contenido de fans que sigue perteneciendo al artista.",
        "Lo vemos con más claridad en la nueva ola de artistas culturales que operan como cinematógrafos de su propia existencia: Rosalía, FKA twigs, Yves Tumor, Arca, la generación post-Frank Ocean. Sus lanzamientos no son álbumes sino capítulos. Sus sistemas visuales persisten a lo largo de años, no de temporadas. Sus identidades se comportan como lenguajes, no como logos.",
        "El papel del estudio en este espacio es el mismo que en hostelería o arquitectura: diseñar las condiciones bajo las cuales la obra se vuelve a sí misma. No la obra — el campo en el que ocurre la obra. El artista sigue siendo el artista. El mundo es lo que construimos a su alrededor.",
      ],
    },
    tags: ["artist identity", "music branding", "worldbuilding"],
  },
  {
    slug: "luxury-branding-is-becoming-cinematic",
    number: "003",
    date: "2026-04-30",
    category: { en: "Luxury", es: "Lujo" },
    worldSlug: "luxury-lifestyle-brands",
    title: {
      en: "Luxury branding is becoming cinematic.",
      es: "El branding de lujo se está volviendo cinematográfico.",
    },
    lead: {
      en: "The premium codes of the 2010s — heritage cues, sans-serif modernism, immaculate product photography — have flattened into stock. The brands defining the next decade are operating in film grammar, not graphic grammar.",
      es: "Los códigos premium de los 2010 — referencias heritage, modernismo sans-serif, fotografía de producto impecable — se han aplanado en stock. Las marcas que definen la próxima década operan en gramática de cine, no de diseño gráfico.",
    },
    body: {
      en: [
        "If you scroll any major fashion house's feed from 2024 onward, you will notice that the most rewarded posts are not product shots. They are atmospheres. A slow pan across a tablecloth. A model walking through a darkened corridor. A reflection in marble. The product appears, but it is no longer the protagonist.",
        "This is not a stylistic trend. It is a structural shift. The luxury consumer has been over-served by perfection and is now hungry for mood, suggestion and incompleteness — qualities that belong to cinema rather than to graphic design. Brands that figure out how to translate their identity into film grammar — lighting, pacing, sound, restraint — are pulling away from brands still optimising the perfect campaign image.",
        "Cinematic branding is harder than graphic branding because it requires duration. A still works at the speed of the eye. A scene works at the speed of breath. Designing at the speed of breath demands choosing what the viewer feels at second 3, at second 7, at second 12 — and how those decisions accumulate into a memory of the brand.",
        "The studios doing this best — and it is a small list — share three traits. They direct image and sound as one decision, not as two departments. They treat silence as a material. And they protect the brand from over-explaining itself: the cinematic brand never tells you what it is; it lets you decide.",
        "For lifestyle, perfume, fashion and editorial brands considering their next decade, the implication is operational. The team that defines the brand can no longer be only graphic designers. It has to include — or behave like — directors, cinematographers, sound designers and atmospheric thinkers. The graphic system continues to exist. It is no longer the centre.",
      ],
      es: [
        "Si haces scroll en el feed de cualquier casa de moda importante de 2024 en adelante, verás que los posts más premiados no son tomas de producto. Son atmósferas. Un panorámica lenta sobre un mantel. Una modelo caminando por un pasillo oscuro. Un reflejo en mármol. El producto aparece, pero ya no es el protagonista.",
        "No es una tendencia estilística. Es un cambio estructural. El consumidor de lujo está saturado de perfección y ahora tiene hambre de atmósfera, sugerencia y lo incompleto — cualidades que pertenecen al cine, no al diseño gráfico. Las marcas que descubren cómo traducir su identidad a gramática de cine — luz, ritmo, sonido, contención — se distancian de las que aún optimizan la imagen de campaña perfecta.",
        "El branding cinematográfico es más difícil que el branding gráfico porque exige duración. Una imagen fija funciona a la velocidad del ojo. Una escena funciona a la velocidad de la respiración. Diseñar a la velocidad de la respiración exige decidir qué siente el espectador en el segundo 3, en el segundo 7, en el segundo 12 — y cómo esas decisiones se acumulan en una memoria de la marca.",
        "Los estudios que lo hacen mejor — y es una lista corta — comparten tres rasgos. Dirigen imagen y sonido como una sola decisión, no como dos departamentos. Tratan el silencio como un material. Y protegen a la marca de sobre-explicarse: la marca cinematográfica nunca te dice lo que es; te deja decidir.",
        "Para marcas de lifestyle, perfume, moda y editorial que consideran su próxima década, la implicación es operativa. El equipo que define la marca ya no puede ser solo diseñadores gráficos. Tiene que incluir — o comportarse como — directores, cinematógrafos, diseñadores de sonido y pensadores atmosféricos. El sistema gráfico sigue existiendo. Ya no es el centro.",
      ],
    },
    tags: ["luxury branding", "cinematic identity", "fashion"],
  },
  {
    slug: "perception-gap-why-expensive-brands-look-cheap-online",
    number: "004",
    date: "2026-04-18",
    category: { en: "Brand Direction", es: "Dirección de Marca" },
    title: {
      en: "The perception gap: why expensive brands look cheap online.",
      es: "La distancia de percepción: por qué las marcas caras se ven baratas online.",
    },
    lead: {
      en: "The gap between how a brand feels in the room and how it feels on a screen is the silent tax most premium operators pay every day. It is rarely fixed by spending more on production.",
      es: "La distancia entre cómo se siente una marca en la sala y cómo se siente en pantalla es el impuesto silencioso que pagan a diario la mayoría de los operadores premium. Rara vez se cierra gastando más en producción.",
    },
    body: {
      en: [
        "Visit a great restaurant. Stay at a great hotel. Walk into a great showroom. The work is unmistakable. The light is right, the menu is restrained, the staff move like the room was choreographed around them. Then open the website. The website looks like every other website in the category. The perception of value collapses by 40% before a single dish has been ordered.",
        "This is the perception gap, and it is the single largest line of revenue leakage in the premium category. The product is excellent. The marketing budget is real. But the brand's digital surface is operating two tiers below its physical presence — and that is the surface the customer touches first, in a moment of cold attention, often at midnight.",
        "Closing the gap is not a matter of bigger photos or a darker theme. It is a matter of direction. Premium brands do not need a designer to make a website that looks expensive. They need a director willing to make decisions a designer alone cannot defend: which surface to reduce, which gesture to remove, what to leave silent so the rest of the page speaks.",
        "The brands that have closed their perception gap in the last three years share a small set of decisions: a single typographic register that survives every context, motion that breathes at the speed of the room rather than the speed of a sale, copy that does not explain the product because the product was chosen to not need explanation, and a conversion structure where the act of booking, buying or applying feels like the next breath in the same room rather than a clerical interruption.",
        "Closing the perception gap is rarely the most expensive item on a brand's budget. It is the most disciplined one. It costs less than another campaign cycle and produces more than another campaign cycle ever will.",
      ],
      es: [
        "Entra en un gran restaurante. Aloja en un gran hotel. Pasa por un gran showroom. El trabajo es inconfundible. La luz está bien, la carta está contenida, el personal se mueve como si la sala estuviera coreografiada alrededor de ellos. Luego abre la web. La web se parece a cualquier otra web del sector. La percepción de valor cae un 40% antes de que se haya pedido un solo plato.",
        "Esto es la distancia de percepción, y es la mayor línea de fuga de ingresos del sector premium. El producto es excelente. El presupuesto de marketing es real. Pero la superficie digital de la marca opera dos niveles por debajo de su presencia física — y esa es la superficie que el cliente toca primero, en un momento de atención fría, a menudo a medianoche.",
        "Cerrar esa distancia no es cuestión de fotos más grandes o un tema más oscuro. Es cuestión de dirección. Las marcas premium no necesitan un diseñador que haga una web que se vea cara. Necesitan un director dispuesto a tomar decisiones que un diseñador solo no puede defender: qué superficie reducir, qué gesto quitar, qué dejar en silencio para que el resto de la página hable.",
        "Las marcas que han cerrado su distancia de percepción en los últimos tres años comparten un conjunto reducido de decisiones: un solo registro tipográfico que sobrevive a cada contexto, una animación que respira a la velocidad de la sala y no a la velocidad de una venta, una redacción que no explica el producto porque el producto se eligió para no necesitar explicación, y una estructura de conversión donde reservar, comprar o solicitar se siente como la siguiente respiración en la misma sala y no como una interrupción burocrática.",
        "Cerrar la distancia de percepción rara vez es la partida más cara del presupuesto de una marca. Es la más disciplinada. Cuesta menos que otra campaña y produce más de lo que otra campaña producirá jamás.",
      ],
    },
    tags: ["perception gap", "premium brand", "creative direction"],
  },
  {
    slug: "digital-atmosphere-missing-layer-modern-websites",
    number: "005",
    date: "2026-04-02",
    category: { en: "Digital", es: "Digital" },
    worldSlug: "cultural-digital-worlds",
    title: {
      en: "Digital atmosphere: the missing layer of modern websites.",
      es: "Atmósfera digital: la capa que le falta a las webs modernas.",
    },
    lead: {
      en: "A website has copy, layout and motion. The brands defining the next decade are adding a fourth layer beneath them — atmosphere — and pulling away from anyone still working in three.",
      es: "Una web tiene texto, maquetación y animación. Las marcas que definen la próxima década están añadiendo una cuarta capa por debajo — atmósfera — y se separan de quien sigue trabajando solo con tres.",
    },
    body: {
      en: [
        "The web design industry organises itself around three deliverables: information, hierarchy and interaction. Everything is taught, tooled and reviewed from that triangle. The triangle works. It produces sites that function. It does not produce sites that are remembered.",
        "Atmosphere is the fourth layer. It is the colour temperature beneath the copy, the pace beneath the motion, the silence beneath the interaction. It is what makes the visitor's body relax — or tense — within three seconds of arrival, before any conscious reading of the content. It is the layer most websites do not have because most websites are built without anyone in the room whose job is to direct it.",
        "We see atmosphere best in the new generation of cultural sites. A perfumer's page that holds the visitor for forty seconds without a hero image. A hotel page where the booking module loads at the speed of a door opening, not the speed of a form. An artist's site that adjusts its sound depending on the hour of the day. These are not stylistic choices. They are atmospheric decisions made by a director who understood that the surface itself was the campaign.",
        "Atmosphere demands a different kind of brief. It cannot be approved as a moodboard. It cannot be specified as a component library. It is calibrated like lighting on a film set — adjusted in the room, not in the document. This is why most agencies do not deliver it: their process is built around documents.",
        "For brands considering the next phase of their digital presence, the question is no longer 'is the site responsive, fast and accessible'. Those are table stakes. The question is 'does the site have an atmosphere of its own — one a competitor cannot replicate by copying the layout'. Atmosphere is the only layer of a website that is not commoditised in 2026.",
      ],
      es: [
        "La industria del diseño web se organiza alrededor de tres entregables: información, jerarquía e interacción. Todo se enseña, herramienta y revisa desde ese triángulo. El triángulo funciona. Produce sitios que funcionan. No produce sitios que se recuerden.",
        "La atmósfera es la cuarta capa. Es la temperatura de color por debajo del texto, el ritmo por debajo de la animación, el silencio por debajo de la interacción. Es lo que hace que el cuerpo del visitante se relaje — o se tense — en los tres primeros segundos, antes de cualquier lectura consciente del contenido. Es la capa que la mayoría de las webs no tienen porque la mayoría de las webs se construyen sin alguien en la sala cuyo trabajo sea dirigirla.",
        "La atmósfera se ve mejor en la nueva generación de sitios culturales. La página de un perfumista que retiene al visitante durante cuarenta segundos sin una imagen principal. La página de un hotel donde el módulo de reserva carga a la velocidad de una puerta abriéndose, no a la velocidad de un formulario. El sitio de un artista que ajusta su sonido según la hora del día. No son decisiones estilísticas. Son decisiones atmosféricas tomadas por un director que entendió que la propia superficie era la campaña.",
        "La atmósfera exige un tipo distinto de brief. No se aprueba como un moodboard. No se especifica como una librería de componentes. Se calibra como la luz en un rodaje — se ajusta en la sala, no en el documento. Por eso la mayoría de las agencias no la entregan: su proceso está construido alrededor de documentos.",
        "Para las marcas que piensan en la siguiente fase de su presencia digital, la pregunta ya no es 'el sitio es responsive, rápido y accesible'. Eso son condiciones mínimas. La pregunta es 'tiene el sitio una atmósfera propia — una que un competidor no pueda replicar copiando el layout'. La atmósfera es la única capa de una web que no está commoditizada en 2026.",
      ],
    },
    tags: ["digital atmosphere", "premium web design", "creative direction"],
  },
  {
    slug: "boutique-hotels-memory-before-booking",
    number: "006",
    date: "2026-03-21",
    category: { en: "Hospitality", es: "Hospitalidad" },
    worldSlug: "hospitality-experience",
    title: {
      en: "How boutique hotels can build memory before the booking.",
      es: "Cómo los hoteles boutique pueden construir memoria antes de la reserva.",
    },
    lead: {
      en: "The most important room a hotel runs is not on the floor plan. It is the room a future guest enters online at two in the morning, alone, with a credit card and a question.",
      es: "La habitación más importante que opera un hotel no está en el plano. Es la habitación a la que un futuro huésped entra online a las dos de la madrugada, solo, con una tarjeta de crédito y una pregunta.",
    },
    body: {
      en: [
        "Boutique hospitality has spent fifteen years investing in the on-site experience. Interiors, materials, food, light, scent, sound. The room a guest sleeps in is now extraordinary in a hundred cities a serious traveller cares about. The room they decide to book in — the website — has been left almost untouched. It is usually a generic template with a calendar widget on top of it.",
        "This is a structural problem, not a design one. Guests do not arrive at the hotel website ready to book. They arrive carrying twelve open tabs and the residual atmosphere of the last great or terrible site they saw. The hotel that books them is the hotel that closes the gap between those open tabs and the bed in under sixty seconds, by replacing the calendar widget with a room.",
        "We call this room the digital atmosphere. It is the version of the hotel that exists before arrival. It loads with the colour temperature the room actually has. It moves at the pace the corridor moves. It does not explain the location because the location is felt through the typography. It does not show stock photography of a smiling couple at breakfast because the absence of that photograph is itself a tone of voice. It assumes the guest is capable.",
        "Hotels that have built this kind of digital atmosphere — and the list is still small — share a small set of operational decisions. The web is owned by the same person who owns the room, not delegated to a third party that will refresh it once a season. The headline is written like the first sentence of a novel, not the first slide of a deck. The booking flow is shorter than the time it takes the guest to look up and ask for a glass of wine. And every visual decision is made under one direction, not by committee.",
        "The economic argument is simple. A booking made from a high-atmosphere site converts at a higher rate, books more nights per stay, generates better reviews, and attracts a different press cycle. The cost of building this layer is recovered inside a single season. The cost of not building it is paid quietly every week, in bookings that went to a competitor with a slightly worse room and a much better digital atmosphere.",
      ],
      es: [
        "La hospitalidad boutique ha pasado quince años invirtiendo en la experiencia in situ. Interiores, materiales, comida, luz, aroma, sonido. La habitación en la que duerme un huésped es ahora extraordinaria en cien ciudades que un viajero serio frecuenta. La habitación en la que el huésped decide reservar — la web — se ha quedado casi intacta. Suele ser una plantilla genérica con un widget de calendario encima.",
        "Es un problema estructural, no de diseño. Los huéspedes no llegan a la web del hotel preparados para reservar. Llegan cargando doce pestañas abiertas y la atmósfera residual del último sitio bueno o terrible que vieron. El hotel que cierra la reserva es el hotel que cierra la distancia entre esas pestañas abiertas y la cama en menos de sesenta segundos, sustituyendo el widget de calendario por una habitación.",
        "Llamamos a esa habitación la atmósfera digital. Es la versión del hotel que existe antes de la llegada. Carga con la temperatura de color que la habitación realmente tiene. Se mueve al ritmo al que se mueve el pasillo. No explica la ubicación porque la ubicación se siente a través de la tipografía. No muestra una foto de stock de una pareja sonriendo en el desayuno porque la ausencia de esa foto es en sí misma un tono de voz. Asume que el huésped es capaz.",
        "Los hoteles que han construido este tipo de atmósfera digital — y la lista todavía es corta — comparten un conjunto reducido de decisiones operativas. La web la lleva la misma persona que lleva la habitación, no se delega a un tercero que la refresca una vez por temporada. El titular se escribe como la primera frase de una novela, no como la primera diapositiva de una presentación. El flujo de reserva es más corto que el tiempo que tarda el huésped en levantar la vista y pedir una copa de vino. Y cada decisión visual la toma una sola dirección, no un comité.",
        "El argumento económico es simple. Una reserva hecha desde un sitio de alta atmósfera convierte a una tasa mayor, reserva más noches por estancia, genera mejores reseñas y atrae un ciclo de prensa distinto. El coste de construir esa capa se recupera dentro de una sola temporada. El coste de no construirla se paga en silencio cada semana, en reservas que se fueron a un competidor con una habitación ligeramente peor y una atmósfera digital mucho mejor.",
      ],
    },
    tags: ["boutique hotel", "hospitality branding", "digital atmosphere"],
  },
  {
    slug: "ai-content-without-direction-damages-premium-brands",
    number: "007",
    date: "2026-03-09",
    category: { en: "Direction", es: "Dirección" },
    title: {
      en: "Why AI content without direction damages premium brands.",
      es: "Por qué el contenido con IA sin dirección daña las marcas premium.",
    },
    lead: {
      en: "AI has made the cost of producing visual content collapse. It has not made the cost of producing memorable visual content collapse. The two are not the same thing, and the premium category is the first to feel the difference.",
      es: "La IA ha hecho colapsar el coste de producir contenido visual. No ha hecho colapsar el coste de producir contenido visual memorable. No son lo mismo, y la categoría premium es la primera en notar la diferencia.",
    },
    body: {
      en: [
        "Three years into the AI image and video cycle, the visual feed of every brand category has roughly doubled in volume and stayed flat in memory. The technology has accelerated production, multiplied output, lowered hourly cost. It has also produced the most forgettable era of brand visuals in twenty years.",
        "Premium brands are uniquely exposed to this. Their entire economic argument rests on being remembered. The luxury restaurant, the boutique hotel, the perfume house, the cultural venue — none of them can defend their price point through pure information. They defend it through atmosphere, restraint and a coherent visual world. AI without direction dilutes all three.",
        "The damage shows up in three places. First, the visual identity drifts: each new piece of AI imagery introduces a slightly different palette, lighting and surface treatment, until the brand stops looking like itself. Second, the cultural register flattens: AI defaults toward the average of its training data, which means it defaults toward the visual codes of mid-market brands. Third, the audience adjusts: customers learn to scan AI output and dismiss it before reading, regardless of the brand attached.",
        "The fix is not to abandon AI. The fix is to direct it. The brands using AI well in 2026 do not treat it as a content factory. They treat it as a production crew run by a director. The director sets the world — palette, atmosphere, copy register, motion language, what the brand will not do. The AI extends that world across formats the brand could not otherwise reach. The director vetoes anything that drifts. The brand stays sharper, not blurrier.",
        "This is what AI-assisted creative direction actually is: not the studio replaced by the model, but the studio extended by the model under a discipline the model alone cannot supply. The cost of production goes down. The cost of direction stays the same. The brands that understand the difference will out-compete the brands that confused the two.",
      ],
      es: [
        "Tres años dentro del ciclo de imagen y video con IA, el feed visual de cada categoría de marca ha doblado su volumen y se ha quedado plano en memoria. La tecnología ha acelerado la producción, multiplicado el output, bajado el coste por hora. También ha producido la era más olvidable de visuales de marca en veinte años.",
        "Las marcas premium están especialmente expuestas. Toda su lógica económica se sostiene sobre ser recordadas. El restaurante de lujo, el hotel boutique, la casa de perfume, el espacio cultural — ninguno puede defender su precio solo con información. Lo defienden con atmósfera, contención y un mundo visual coherente. La IA sin dirección diluye los tres.",
        "El daño aparece en tres lugares. Primero, la identidad visual deriva: cada nueva imagen generada con IA introduce una paleta, una iluminación y un tratamiento de superficie ligeramente distintos, hasta que la marca deja de parecerse a sí misma. Segundo, el registro cultural se aplana: la IA tiende al promedio de sus datos de entrenamiento, que es el promedio de las marcas de gama media. Tercero, la audiencia se adapta: los clientes aprenden a escanear output de IA y descartarlo antes de leer, independientemente de la marca que lo firme.",
        "El arreglo no es abandonar la IA. El arreglo es dirigirla. Las marcas que usan bien la IA en 2026 no la tratan como una fábrica de contenido. La tratan como un equipo de producción dirigido por un director. El director fija el mundo — paleta, atmósfera, registro de redacción, lenguaje de animación, lo que la marca no hará. La IA extiende ese mundo a formatos que la marca no podría alcanzar de otra forma. El director veta cualquier deriva. La marca se mantiene más nítida, no más borrosa.",
        "Esto es lo que en realidad es la dirección creativa asistida por IA: no el estudio reemplazado por el modelo, sino el estudio extendido por el modelo bajo una disciplina que el modelo solo no puede aportar. El coste de producción baja. El coste de dirección se mantiene. Las marcas que entiendan la diferencia van a competir mejor que las que las confunden.",
      ],
    },
    tags: ["creative direction", "AI-assisted", "premium brand"],
  },
  {
    slug: "future-of-nightlife-branding",
    number: "008",
    date: "2026-02-24",
    category: { en: "Nightlife", es: "Vida nocturna" },
    worldSlug: "nightlife-cultural-events",
    title: {
      en: "The future of nightlife branding is operational, not graphic.",
      es: "El futuro del branding nocturno es operativo, no gráfico.",
    },
    lead: {
      en: "The clubs and cultural venues that will define the next decade of nightlife are not the ones with the best logo. They are the ones where every operational decision — light, sound, door, calendar — is also a brand decision, held by the same hand.",
      es: "Los clubs y espacios culturales que definirán la próxima década de la vida nocturna no son los del mejor logo. Son aquellos donde cada decisión operativa — luz, sonido, puerta, calendario — es también una decisión de marca, sostenida por la misma mano.",
    },
    body: {
      en: [
        "For thirty years, nightlife branding has been understood as a graphic exercise. A logo, a poster series, a flyer style, a website. The visual identity sat on the surface of the venue like a printed sticker. The room did its work, the brand did its work, the guest connected them only inside their memory the next morning.",
        "The new wave of nightlife operators — quieter, more disciplined, often built by people who left bigger groups to do this on their own — are running the opposite logic. They begin not with the logo but with the door. What weight does the handle have, who opens it, what does the corridor sound like, what music is playing under the bathroom mirror at four in the morning. The brand is detected from those decisions, not declared on top of them.",
        "We call this atmospheric branding for venues. It is harder to specify in a deck and harder to enforce across a multi-night calendar. It demands that the same person who designs the visual identity is also in the conversation about the lighting console, the door staff training and the resident DJ schedule. Without that integration, the brand is just a poster on top of a building.",
        "The brands doing this best in 2026 share three traits. They run the brand and the operation as one document. They treat darkness, restraint and silence as primary materials. And they refuse to over-explain themselves — the venue's atmospheric branding never tells the guest what kind of night it is, it lets the guest decide.",
        "For owners and cultural operators considering the next phase of their venue, the implication is operational. The graphic system continues to exist. It is no longer the centre. The centre is the room itself, designed by someone who treats the door, the lighting cue and the typography on the wristband as a single sentence being spoken across the night.",
      ],
      es: [
        "Durante treinta años el branding nocturno se ha entendido como un ejercicio gráfico. Un logo, una serie de carteles, un estilo de flyer, una web. La identidad visual quedaba en la superficie del local como una pegatina impresa. La sala hacía su trabajo, la marca hacía el suyo, el huésped los conectaba solo dentro de su memoria a la mañana siguiente.",
        "La nueva ola de operadores nocturnos — más callados, más disciplinados, a menudo construidos por gente que dejó grupos más grandes para hacer esto por su cuenta — funciona con la lógica contraria. No empiezan por el logo sino por la puerta. Qué peso tiene la manilla, quién la abre, a qué suena el pasillo, qué música suena bajo el espejo del baño a las cuatro de la mañana. La marca se detecta desde esas decisiones, no se declara encima de ellas.",
        "Llamamos a esto branding atmosférico para locales. Es más difícil de especificar en una presentación y más difícil de hacer cumplir en un calendario de varias noches. Exige que la misma persona que diseña la identidad visual esté también en la conversación sobre la consola de luz, la formación del personal de puerta y la programación del DJ residente. Sin esa integración, la marca es solo un cartel encima de un edificio.",
        "Las marcas que mejor lo hacen en 2026 comparten tres rasgos. Llevan la marca y la operación como un solo documento. Tratan la oscuridad, la contención y el silencio como materiales primarios. Y se niegan a sobre-explicarse — el branding atmosférico del local nunca le dice al huésped qué tipo de noche es, deja que el huésped lo decida.",
        "Para dueños y operadores culturales que consideran la siguiente fase de su local, la implicación es operativa. El sistema gráfico sigue existiendo. Ya no es el centro. El centro es la propia sala, diseñada por alguien que trata la puerta, la pauta lumínica y la tipografía de la pulsera como una sola frase que se pronuncia a lo largo de la noche.",
      ],
    },
    tags: ["nightlife branding", "venue identity", "cultural events"],
  },
  {
    slug: "brand-worldbuilding-for-culture-led-businesses",
    number: "009",
    date: "2026-02-08",
    category: { en: "Worldbuilding", es: "Worldbuilding" },
    title: {
      en: "Brand worldbuilding for culture-led businesses.",
      es: "Worldbuilding de marca para negocios con voz cultural.",
    },
    lead: {
      en: "The most defensible economic asset a culture-led brand can build in 2026 is not a logo or a campaign. It is a complete world the audience can re-enter on their own, without the brand present.",
      es: "El activo económico más defendible que una marca con voz cultural puede construir en 2026 no es un logo ni una campaña. Es un mundo completo en el que la audiencia pueda volver a entrar por su cuenta, sin la marca presente.",
    },
    body: {
      en: [
        "Worldbuilding is the practice cinematographers, novelists and game directors have used for decades to keep an audience inside a story longer than the story itself runs. A coherent world has a palette, a tone of voice, a set of unwritten rules and a few iconic surfaces — and once an audience knows them, the audience reads any new piece inside that frame, even if the original author had nothing to do with it.",
        "Brands are starting to operate this way. The smartest culture-led businesses are no longer building campaigns; they are building worlds. The campaign becomes a chapter inside the world. The product becomes an artefact from the world. The audience is no longer being marketed to; they are being invited inside.",
        "The economics are very different. Campaigns expire. Worlds compound. A brand world built with discipline in 2026 will keep generating cultural interest in 2030, without further investment, because the audience itself will produce content inside the world's grammar. The brand becomes a setting rather than a sender.",
        "Worldbuilding is harder than branding because it cannot be standardised. The deliverables of a brand book — logo, palette, type — are necessary but not sufficient. The deliverables of a brand world include the rules the brand will not break, the gestures it owns, the sounds it carries, the silences it protects, the references it refuses, the audience behaviours it makes possible. These are written, but lightly, because too much specification kills a world.",
        "For culture-led businesses considering their next phase, the question is no longer 'what does our campaign look like'. The question is 'what world are we building, and is the audience already living inside it without us pushing them'. A brand the audience inhabits is a brand that has stopped paying full price for attention.",
      ],
      es: [
        "Worldbuilding es la práctica que cineastas, novelistas y directores de juegos han usado durante décadas para mantener a una audiencia dentro de una historia más tiempo del que dura la propia historia. Un mundo coherente tiene una paleta, un tono de voz, un conjunto de reglas no escritas y unas pocas superficies icónicas — y una vez que una audiencia las conoce, lee cualquier pieza nueva dentro de ese marco, aunque el autor original no haya tenido nada que ver.",
        "Las marcas están empezando a funcionar así. Los negocios con voz cultural más inteligentes ya no están construyendo campañas; están construyendo mundos. La campaña pasa a ser un capítulo dentro del mundo. El producto pasa a ser un artefacto del mundo. A la audiencia ya no se le hace marketing; se le invita a entrar.",
        "La economía es muy distinta. Las campañas caducan. Los mundos se acumulan. Un mundo de marca construido con disciplina en 2026 seguirá generando interés cultural en 2030, sin más inversión, porque la propia audiencia producirá contenido dentro de la gramática del mundo. La marca se vuelve un escenario en lugar de un emisor.",
        "Worldbuilding es más difícil que branding porque no se puede estandarizar. Los entregables de un brand book — logo, paleta, tipografía — son necesarios pero no suficientes. Los entregables de un mundo de marca incluyen las reglas que la marca no romperá, los gestos que posee, los sonidos que carga, los silencios que protege, las referencias que rechaza, las conductas que hace posibles en su audiencia. Se escriben, pero ligeramente, porque demasiada especificación mata un mundo.",
        "Para negocios con voz cultural que piensan en su siguiente fase, la pregunta ya no es 'cómo se ve nuestra campaña'. La pregunta es 'qué mundo estamos construyendo, y la audiencia ya vive dentro sin que tengamos que empujarla'. Una marca que la audiencia habita es una marca que ha dejado de pagar el precio completo por la atención.",
      ],
    },
    tags: ["worldbuilding", "cultural brand", "brand strategy"],
  },
  {
    slug: "why-premium-restaurants-need-cinematic-websites",
    number: "010",
    date: "2026-01-26",
    category: { en: "Hospitality", es: "Hospitalidad" },
    worldSlug: "hospitality-experience",
    title: {
      en: "Why premium restaurants need cinematic websites.",
      es: "Por qué los restaurantes premium necesitan webs cinematográficas.",
    },
    lead: {
      en: "The dining room is cinema. The plate is cinema. The lighting is cinema. The website is, in almost every case, still a brochure. That gap is the largest unforced operational error in the premium restaurant category.",
      es: "El comedor es cine. El plato es cine. La iluminación es cine. La web es, en casi todos los casos, todavía un folleto. Esa distancia es el mayor error operativo no forzado de la restauración premium.",
    },
    body: {
      en: [
        "A premium restaurant is one of the few cultural objects that already operates as a cinematic experience without anyone naming it that way. The arrival is paced. The lighting is cued. The plates appear like edited shots. The duration of a course is set by a director who understands rhythm. Every chef worth their stars is, whether they acknowledge it or not, a film director who works in flavour.",
        "And then the website. A grid of dish photographs. A menu PDF. A booking widget. The visitor opens a document and is asked to make a decision. The atmosphere of the room is nowhere on the screen. The cinema collapses into a brochure at the exact moment the decision is being made.",
        "Cinematic websites for restaurants do not solve this with bigger photos. They solve it by treating the website as a continuation of the dining experience rather than a separate document about it. The page loads at the speed of the room. The colour temperature matches the candles. The copy is written in the chef's voice, not the marketing manager's. The booking flow is paced like a corridor, not a form. The visitor arrives at the booking moment already inside the restaurant.",
        "The investment to build this layer is recovered inside a single season for any restaurant operating above the mid-market. Guests book higher tiers, choose longer tasting menus, write better reviews, and arrive on the night already calibrated to the room. The website is no longer the moment where the brand collapses. It is the first plate of the meal.",
        "For chefs, restaurateurs and hospitality groups considering their digital surface, the question is no longer 'is our website beautiful'. Beautiful is not enough. The question is 'does our website hold the same atmosphere as our room — and if a guest never made it to the room, would they still remember the website'.",
      ],
      es: [
        "Un restaurante premium es uno de los pocos objetos culturales que ya opera como experiencia cinematográfica sin que nadie lo llame así. La llegada está pautada. La iluminación está marcada. Los platos aparecen como planos editados. La duración de un pase la fija un director que entiende el ritmo. Cada chef que se gana sus estrellas es, lo reconozca o no, un director de cine que trabaja con sabor.",
        "Y luego la web. Una cuadrícula de fotos de plato. Un PDF del menú. Un widget de reserva. El visitante abre un documento y se le pide que tome una decisión. La atmósfera de la sala no está en ningún lugar de la pantalla. El cine colapsa en folleto justo en el momento en que se toma la decisión.",
        "Las webs cinematográficas para restaurantes no resuelven esto con fotos más grandes. Lo resuelven tratando la web como una continuación de la experiencia de comer y no como un documento separado sobre ella. La página carga al ritmo de la sala. La temperatura de color encaja con las velas. La redacción está en la voz del chef, no en la del responsable de marketing. El flujo de reserva está pautado como un pasillo, no como un formulario. El visitante llega al momento de reservar ya dentro del restaurante.",
        "La inversión para construir esa capa se recupera dentro de una sola temporada en cualquier restaurante que opere por encima del mid-market. Los huéspedes reservan tramos más altos, eligen menús degustación más largos, escriben mejores reseñas y llegan a la noche ya calibrados a la sala. La web deja de ser el momento en el que la marca colapsa. Pasa a ser el primer plato de la cena.",
        "Para chefs, restauradores y grupos de hospitalidad que piensan en su superficie digital, la pregunta ya no es 'nuestra web es bonita'. Bonita no es suficiente. La pregunta es 'nuestra web sostiene la misma atmósfera que nuestra sala — y si un huésped nunca llegara a entrar a la sala, ¿seguiría recordando la web?'.",
      ],
    },
    tags: ["cinematic website", "premium restaurant", "hospitality"],
  },
];

export function getRecord(slug: string): LabRecord | undefined {
  return records.find((r) => r.slug === slug);
}
