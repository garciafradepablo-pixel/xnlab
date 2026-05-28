// The XNLAB universe — six surfaces where a modern brand touches its
// customer, orbiting a Central Core. Each surface has a material, a
// register and a movement personality. This file is canonical. Edit
// here and it propagates through the site.

export type WorldSlug =
  | "product"
  | "owned-digital"
  | "retail-physical"
  | "customer-operations"
  | "communication"
  | "community-culture";

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
  // behaviour: retail vibrates, customer operations is almost still.
  motion: {
    breatheScale: [number, number];
    breatheDuration: number;
    drift: number;
    pulse: "still" | "slow" | "drift" | "vibrate" | "wave" | "refract";
  };
  title: { en: string; es: string };
  // Commercial doorway line — one direct sentence describing the kind of
  // surface this world represents. Used on the /worlds index card, the
  // orb hover label, and the top of /worlds/[slug].
  pitch: { en: string; es: string };
  // Sales-side complement to pitch: what closing the gap on this
  // surface produces. Same atelier voice but framed as outcome — the
  // sentence a CMO can quote upward. Used on the home CircleOfWorlds
  // below-cluster caption so the centred caption (pitch) and the
  // below caption (outcome) carry two different beats of the same
  // moment instead of repeating themselves.
  outcome: { en: string; es: string };
  essence: { en: string; es: string };
  material: { en: string; es: string };
  energy: { en: string; es: string };
  practice: { en: string[]; es: string[] };
  body: { en: string[]; es: string[] };
  discipline?: {
    image: string;
    imagePosition?: string;
    title: { en: string; es: string };
    copy: { en: string; es: string };
  };
  fieldStudy?: {
    en: { label: string; input: string; observation: string; signature: string };
    es: { label: string; input: string; observation: string; signature: string };
  };
};

export const worlds: World[] = [
  {
    slug: "product",
    number: "01",
    image: "/images/worlds/product.png",
    color: {
      name: "Sustained Warmth",
      hex: "#cf8a3a",
      core: "rgba(255,205,140,0.94)",
      mid: "rgba(185,115,55,0.72)",
      deep: "rgba(40,18,8,1)",
      glow: "rgba(207,138,58,0.42)",
    },
    motion: { breatheScale: [1, 1.04], breatheDuration: 7.5, drift: 4, pulse: "slow" },
    title: { en: "Product", es: "Producto" },
    pitch: {
      en: "We direct app, hardware and software as a sequence of atmospheres — first launch, motion, empty states, micro-interactions — until daily use carries the same signature as the campaign.",
      es: "Dirigimos app, hardware y software como una secuencia de atmósferas — primera apertura, animación, estados vacíos, micro-interacciones — hasta que el uso diario lleva la misma firma que la campaña.",
    },
    outcome: {
      en: "When the first eight seconds of the app match the brand, daily use becomes the strongest advertising the company has.",
      es: "Cuando los primeros ocho segundos de la app coinciden con la marca, el uso diario se convierte en la publicidad más fuerte de la empresa.",
    },
    essence: {
      en: "The product is the first sentence the brand speaks, every day.",
      es: "El producto es la primera frase que la marca pronuncia, cada día.",
    },
    material: {
      en: "Translucent crystal that holds the warmth of daily contact.",
      es: "Cristal translúcido que retiene la calidez del contacto diario.",
    },
    energy: {
      en: "Sustained warmth. Daily contact. The atmosphere of use, not of launch.",
      es: "Calidez sostenida. Contacto diario. La atmósfera del uso, no del lanzamiento.",
    },
    practice: {
      en: [
        "Product brand systems — voice, motion, micro-interactions, empty states.",
        "First-launch and onboarding atmosphere across mobile, web and connected hardware.",
        "Cross-surface consistency between product, account and the brand it lives inside.",
      ],
      es: [
        "Sistemas de marca para producto — voz, animación, micro-interacciones, estados vacíos.",
        "Atmósfera de primera apertura y onboarding en móvil, web y hardware conectado.",
        "Consistencia entre producto, cuenta y la marca que los contiene.",
      ],
    },
    body: {
      en: [
        "Product is the surface a customer touches more days a year than any other. For companies operating at scale, the product itself is the brand's most-spoken sentence — uttered every time the app opens, every time a screen loads, every time a settings page is reached.",
        "We direct the product as a sequence of atmospheres. The first launch sets the tone. Loading states carry the brand's tempo. Empty states hold its voice. The product is not styled — it is composed, one micro-interaction at a time, until daily use feels signed by the same hand that signs the campaign.",
      ],
      es: [
        "El producto es la superficie que el cliente toca más días al año que ninguna otra. En empresas que operan a escala, el producto es la frase que la marca pronuncia más veces — cada vez que se abre la app, cada vez que carga una pantalla, cada vez que el cliente entra en ajustes.",
        "Dirigimos el producto como una secuencia de atmósferas. El primer arranque marca el tono. Los estados de carga llevan el ritmo de la marca. Los estados vacíos sostienen su voz. El producto no se estiliza — se compone, una micro-interacción cada vez, hasta que el uso diario lleva la misma firma que la campaña.",
      ],
    },
    discipline: {
      image: "/images/03_emotional_curtains.jpg",
      imagePosition: "center 42%",
      title: { en: "Product", es: "Producto" },
      copy: {
        en: "The most-touched surface, directed like the rest of the brand.",
        es: "La superficie más tocada, dirigida como el resto de la marca.",
      },
    },
    fieldStudy: {
      en: {
        label: "Field study · First launch",
        input: "The eight seconds between an icon tap and the first usable screen.",
        observation:
          "Most products treat that window as load time. We treat it as the brand's opening line — colour, motion and copy calibrated so the customer has already met the brand before the home screen arrives.",
        signature: "The product is the brand long before the marketing is.",
      },
      es: {
        label: "Estudio de campo · Primera apertura",
        input: "Los ocho segundos entre el toque del icono y la primera pantalla utilizable.",
        observation:
          "La mayoría de los productos tratan esa ventana como tiempo de carga. Nosotros la tratamos como la frase de apertura de la marca — color, animación y copy calibrados para que el cliente ya haya conocido la marca antes de llegar a la pantalla principal.",
        signature: "El producto es la marca mucho antes que el marketing.",
      },
    },
  },
  {
    slug: "owned-digital",
    number: "02",
    image: "/images/worlds/owned-digital.png",
    color: {
      name: "Patient Return",
      hex: "#9aa6c8",
      core: "rgba(190,200,225,0.94)",
      mid: "rgba(110,125,160,0.68)",
      deep: "rgba(18,22,32,1)",
      glow: "rgba(160,175,210,0.35)",
    },
    motion: { breatheScale: [1, 1.03], breatheDuration: 8.5, drift: 6, pulse: "wave" },
    title: { en: "Owned Digital", es: "Digital Propio" },
    pitch: {
      en: "We compose web, marketing site, account and dashboard as a single editorial system — one tempo, one restraint, one room read through many doors.",
      es: "Componemos web, sitio editorial, cuenta y dashboard como un solo sistema editorial — un tempo, una contención, una sala que se lee a través de muchas puertas.",
    },
    outcome: {
      en: "The dashboard the customer opens forty times a week becomes the room they remember the brand from.",
      es: "El dashboard que el cliente abre cuarenta veces a la semana se convierte en la sala desde la que recuerda la marca.",
    },
    essence: {
      en: "The screen is the second room of the brand.",
      es: "La pantalla es la segunda sala de la marca.",
    },
    material: {
      en: "Glass that filters considered attention without asking for it.",
      es: "Vidrio que filtra atención considerada sin pedirla.",
    },
    energy: {
      en: "Considered reading. Patient return. Surfaces that hold attention without asking for it.",
      es: "Lectura considerada. Regreso paciente. Superficies que sostienen la atención sin pedirla.",
    },
    practice: {
      en: [
        "Web, marketing site and editorial system direction.",
        "Account, settings and dashboard atmosphere — the rooms the customer keeps coming back to.",
        "Owned-media tempo — publishing rhythm, content architecture, internal editorial voice.",
      ],
      es: [
        "Dirección de web, sitio editorial y sistema de contenidos.",
        "Atmósfera de cuenta, ajustes y dashboard — las salas a las que el cliente vuelve.",
        "Ritmo de medios propios — pauta de publicación, arquitectura de contenido, voz editorial interna.",
      ],
    },
    body: {
      en: [
        "Owned digital is where the brand answers when the customer chooses to look. Not paid impressions, not push notifications — the surfaces the customer arrived at on purpose. They read longer. They return more often. They are the audience that has already opted in to caring.",
        "We direct the owned surfaces as a single editorial system. Web, site, account, dashboard — all carrying the same tempo, the same restraint, the same atmosphere. The customer does not switch contexts when they switch screens. The brand is one room with many doors.",
      ],
      es: [
        "El digital propio es donde la marca responde cuando el cliente decide mirar. No son impactos pagados, no son notificaciones push — son las superficies a las que el cliente llegó queriendo. Lee más tiempo. Vuelve más veces. Es el público que ya ha aceptado prestar atención.",
        "Dirigimos las superficies propias como un único sistema editorial. Web, sitio, cuenta, dashboard — todas llevando el mismo tempo, la misma contención, la misma atmósfera. El cliente no cambia de contexto cuando cambia de pantalla. La marca es una sola sala con muchas puertas.",
      ],
    },
    discipline: {
      image: "/images/03_emotional_curtains.jpg",
      imagePosition: "center 55%",
      title: { en: "Owned Digital", es: "Digital Propio" },
      copy: {
        en: "Surfaces the customer returns to without being asked.",
        es: "Superficies a las que el cliente vuelve sin que nadie se lo pida.",
      },
    },
    fieldStudy: {
      en: {
        label: "Field study · The returning screen",
        input: "The dashboard a customer opens forty times a week.",
        observation:
          "Most brands ship that surface as utility. We design it as the room the customer comes home to — light, rhythm and gesture rehearsed for the daily return, not for the first visit.",
        signature: "The dashboard becomes the part of the brand the customer remembers.",
      },
      es: {
        label: "Estudio de campo · La pantalla a la que se vuelve",
        input: "El dashboard que un cliente abre cuarenta veces por semana.",
        observation:
          "La mayoría de las marcas entregan esa superficie como utilidad. Nosotros la diseñamos como la sala a la que el cliente vuelve a casa — luz, ritmo y gesto ensayados para el regreso diario, no para la primera visita.",
        signature: "El dashboard se convierte en la parte de la marca que el cliente recuerda.",
      },
    },
  },
  {
    slug: "retail-physical",
    number: "03",
    image: "/images/worlds/retail-physical.png",
    color: {
      name: "Body Weight",
      hex: "#a0633e",
      core: "rgba(220,155,110,0.95)",
      mid: "rgba(140,80,55,0.72)",
      deep: "rgba(30,18,12,1)",
      glow: "rgba(180,110,75,0.42)",
    },
    motion: { breatheScale: [1, 1.05], breatheDuration: 3.4, drift: 7, pulse: "vibrate" },
    title: { en: "Retail & Physical", es: "Retail y Físico" },
    pitch: {
      en: "We choreograph stores, branches, pop-ups and events — threshold, light, material, sound, staff register — so the body reads the brand before the eye finishes the sign.",
      es: "Coreografiamos tiendas, sucursales, pop-ups y eventos — umbral, luz, material, sonido, registro del personal — para que el cuerpo lea la marca antes de que el ojo termine de leer el rótulo.",
    },
    outcome: {
      en: "The first three meters inside the door decide what the customer tells a friend the next morning.",
      es: "Los tres primeros metros tras cruzar la puerta deciden lo que el cliente le cuenta a un amigo a la mañana siguiente.",
    },
    essence: {
      en: "The store is the brand with weight on it.",
      es: "La tienda es la marca con su peso encima.",
    },
    material: {
      en: "Liquid glass under pressure. The brand at full body weight.",
      es: "Vidrio líquido bajo presión. La marca con todo su peso encima.",
    },
    energy: {
      en: "Threshold, light, sound, scent, staff register. Architecture doing the brand's work in a body.",
      es: "Umbral, luz, sonido, aroma, registro del personal. Arquitectura haciendo el trabajo de la marca dentro de un cuerpo.",
    },
    practice: {
      en: [
        "Flagship and retail atmosphere — threshold, light, material, sound.",
        "Pop-up, kiosk, branch and event identity systems engineered to ship and recompose.",
        "Service choreography. What the room asks of the person inside it.",
      ],
      es: [
        "Atmósfera de flagship y retail — umbral, luz, material, sonido.",
        "Sistemas de identidad para pop-up, kiosco, sucursal y evento, construidos para enviarse y recomponerse.",
        "Coreografía de servicio — lo que la sala le pide a la persona que está dentro.",
      ],
    },
    body: {
      en: [
        "Retail and physical is where the brand stops being pixels. A store, a branch, a pop-up, an event — each is the brand at full body weight. The customer reads it with skin, ear and foot before they read it with eye.",
        "We direct the physical surface as a sequence the customer's body reads. Threshold, sightline, surface, sound, staff register. Each tuned to a single feeling. The graphic system continues to exist; it is no longer the centre. The room is.",
      ],
      es: [
        "Retail y físico es donde la marca deja de ser píxeles. Una tienda, una sucursal, un pop-up, un evento — cada uno es la marca con su peso completo. El cliente la lee con piel, oído y pie antes que con la vista.",
        "Dirigimos la superficie física como una secuencia que el cuerpo del cliente lee. Umbral, primera línea de vista, superficie, sonido, registro del personal. Cada uno afinado a una sola sensación. El sistema gráfico sigue existiendo; ya no es el centro. El centro es la sala.",
      ],
    },
    discipline: {
      image: "/images/04_sensorium_blue.jpg",
      imagePosition: "center 40%",
      title: { en: "Retail & Physical", es: "Retail y Físico" },
      copy: {
        en: "The brand at full body weight — read by skin, ear and foot.",
        es: "La marca con todo su peso encima — leída por piel, oído y pie.",
      },
    },
    fieldStudy: {
      en: {
        label: "Field study · The threshold",
        input: "The first three meters inside the door.",
        observation:
          "Most retail spends its budget on the back wall and treats the entrance as transit. We model the threshold as the first beat of the experience — warmer light, lower sound, slower pace — so the customer is already inside the brand before they reach the floor.",
        signature: "The body is in the brand before the eye has finished reading the sign.",
      },
      es: {
        label: "Estudio de campo · El umbral",
        input: "Los primeros tres metros dentro de la puerta.",
        observation:
          "La mayoría de retail gasta su presupuesto en la pared del fondo y trata la entrada como tránsito. Modelamos el umbral como el primer compás de la experiencia — luz más cálida, sonido más bajo, paso más lento — para que el cliente esté ya dentro de la marca antes de pisar la tienda.",
        signature: "El cuerpo está dentro de la marca antes de que el ojo termine de leer el rótulo.",
      },
    },
  },
  {
    slug: "customer-operations",
    number: "04",
    image: "/images/worlds/customer-operations.png",
    color: {
      name: "Quiet Continuity",
      hex: "#e8e2d2",
      core: "rgba(245,238,222,0.95)",
      mid: "rgba(196,180,150,0.6)",
      deep: "rgba(40,32,24,1)",
      glow: "rgba(232,226,210,0.3)",
    },
    motion: { breatheScale: [1, 1.018], breatheDuration: 10, drift: 2, pulse: "still" },
    title: { en: "Customer Operations", es: "Operaciones de Cliente" },
    pitch: {
      en: "We rewrite onboarding, support and post-sale in the studio voice — templates, response tempo, escalation rhythm — until the brand answers the same on Sunday at eleven as on Monday at ten.",
      es: "Reescribimos onboarding, soporte y postventa en la voz del estudio — plantillas, tempo de respuesta, ritmo de escalado — hasta que la marca responde igual el domingo a las once que el lunes a las diez.",
    },
    outcome: {
      en: "Customers remember the brand that answered with care at eleven on a Sunday night. And that memory renews the contract.",
      es: "El cliente recuerda a la marca que contestó con cuidado un domingo a las once de la noche. Y esa memoria renueva el contrato.",
    },
    essence: {
      en: "The brand is what it does when the sale is over.",
      es: "La marca es lo que hace cuando la venta ya ha terminado.",
    },
    material: {
      en: "Soft ceramic with the calm of unfiltered morning light.",
      es: "Cerámica suave con la calma de la luz de mañana sin filtrar.",
    },
    energy: {
      en: "Restraint. Continuity. The atmosphere of being answered, not handled.",
      es: "Contención. Continuidad. La atmósfera de ser respondido, no procesado.",
    },
    practice: {
      en: [
        "Onboarding sequences — the first thirty days as a single editorial piece.",
        "Support voice, response templates, escalation rhythm.",
        "Post-sale lifecycle — the rooms a customer enters when something is wrong.",
      ],
      es: [
        "Secuencias de onboarding — los primeros treinta días como una sola pieza editorial.",
        "Voz de soporte, plantillas de respuesta, ritmo de escalado.",
        "Ciclo postventa — las salas en las que entra el cliente cuando algo falla.",
      ],
    },
    body: {
      en: [
        "Customer operations is the surface a marketing department rarely directs and the surface where the brand is most quietly judged. Onboarding, support, account recovery, billing, the email after the incident — every one of these is a room. Every one of them carries an atmosphere the customer remembers.",
        "We direct customer operations as the part of the brand that earns the next contract. Templates rewritten in the studio voice. Tempo of response calibrated. Tone of the apology rehearsed. The brand is not measured by what it says in a campaign — it is measured by what it says at eleven on a Sunday night.",
      ],
      es: [
        "Operaciones de cliente es la superficie que un departamento de marketing rara vez dirige y la superficie donde la marca se juzga en voz más baja. Onboarding, soporte, recuperación de cuenta, facturación, el email después de la incidencia — cada uno de ellos es una sala. Cada uno lleva una atmósfera que el cliente recuerda.",
        "Dirigimos operaciones de cliente como la parte de la marca que se gana el siguiente contrato. Plantillas reescritas en la voz del estudio. Tempo de respuesta calibrado. Tono de la disculpa ensayado. La marca no se mide por lo que dice en una campaña — se mide por lo que dice a las once de un domingo por la noche.",
      ],
    },
    discipline: {
      image: "/images/05_identity_chrome.jpg",
      imagePosition: "center 45%",
      title: { en: "Customer Operations", es: "Operaciones de Cliente" },
      copy: {
        en: "The brand judged where the marketing cannot reach.",
        es: "La marca, juzgada allá donde el marketing no llega.",
      },
    },
    fieldStudy: {
      en: {
        label: "Field study · The reply at eleven",
        input: "The first sentence of a support reply sent after hours.",
        observation:
          "Most companies treat that sentence as a template. We design it as the brand's nighttime voice — slower, fewer words, the same register the customer read on the marketing site that morning.",
        signature: "The customer remembers the company that was kind in the dark.",
      },
      es: {
        label: "Estudio de campo · La respuesta de las once",
        input: "La primera frase de una respuesta de soporte enviada fuera de horario.",
        observation:
          "La mayoría de las empresas tratan esa frase como una plantilla. Nosotros la diseñamos como la voz nocturna de la marca — más lenta, menos palabras, el mismo registro que el cliente leyó en la web por la mañana.",
        signature: "El cliente recuerda a la empresa que fue amable en la oscuridad.",
      },
    },
  },
  {
    slug: "communication",
    number: "05",
    image: "/images/worlds/communication.png",
    color: {
      name: "Earned Authority",
      hex: "#bcb8ad",
      core: "rgba(195,188,172,0.94)",
      mid: "rgba(110,108,100,0.62)",
      deep: "rgba(28,28,26,1)",
      glow: "rgba(168,160,145,0.38)",
    },
    motion: { breatheScale: [1, 1.012], breatheDuration: 14, drift: 1, pulse: "still" },
    title: { en: "Communication", es: "Comunicación" },
    pitch: {
      en: "We direct paid, owned and earned communication as one editorial atmosphere — fewer pieces, slower tempo, every line signed by the same hand.",
      es: "Dirigimos la comunicación pagada, propia y ganada como una sola atmósfera editorial — menos piezas, tempo más lento, cada línea firmada por la misma mano.",
    },
    outcome: {
      en: "Restraint earns the next read instead of demanding it. The brand stops being noise and starts being expected.",
      es: "La contención se gana la siguiente lectura en vez de exigirla. La marca deja de ser ruido y empieza a esperarse.",
    },
    essence: {
      en: "The brand is what it refuses to say.",
      es: "La marca es lo que se niega a decir.",
    },
    material: {
      en: "Polished stone — the material of institutions.",
      es: "Piedra pulida — el material de las instituciones.",
    },
    energy: {
      en: "Authority without volume. Communication that earns the next read.",
      es: "Autoridad sin volumen. Comunicación que se gana la siguiente lectura.",
    },
    practice: {
      en: [
        "Editorial direction across paid, owned and earned channels.",
        "Campaign direction, motion register, voice and tempo.",
        "PR and press atmosphere — the materials a journalist actually wants to open.",
      ],
      es: [
        "Dirección editorial en canales pagados, propios y ganados.",
        "Dirección de campaña, registro de animación, voz y tempo.",
        "Atmósfera de prensa y PR — los materiales que un periodista realmente quiere abrir.",
      ],
    },
    body: {
      en: [
        "Communication is the channel most teams over-spend in and under-direct. Paid, owned, earned — three different rooms with three different acoustics, all carrying the same brand. Most brands shout in all three; most customers stop listening in all three.",
        "We direct communication as the place where the brand chooses what to refuse. Less, slower, signed. Each piece earns the next read. Each surface holds the same atmosphere as the product, the screen and the room. The customer recognises the brand from the tempo before they recognise it from the logo.",
      ],
      es: [
        "Comunicación es el canal en el que la mayoría de los equipos gastan de más y dirigen de menos. Pagado, propio, ganado — tres salas distintas con tres acústicas distintas, todas llevando la misma marca. La mayoría de marcas gritan en las tres; la mayoría de clientes dejan de escuchar en las tres.",
        "Dirigimos la comunicación como el lugar donde la marca elige a qué renunciar. Menos, más lento, firmado. Cada pieza se gana la siguiente lectura. Cada superficie lleva la misma atmósfera que el producto, la pantalla y la sala. El cliente reconoce la marca por el tempo antes que por el logo.",
      ],
    },
    discipline: {
      image: "/images/07_sculptural_white.jpg",
      imagePosition: "center 60%",
      title: { en: "Communication", es: "Comunicación" },
      copy: {
        en: "Authority that earns the next read instead of demanding it.",
        es: "Autoridad que se gana la siguiente lectura en vez de exigirla.",
      },
    },
    fieldStudy: {
      en: {
        label: "Field study · The campaign that did not run",
        input: "A campaign brief that survived three rounds of review.",
        observation:
          "We treat the deletions as the work. What the brand chose not to say is more diagnostic of its position than what it published — the cut lines map the territory the brand has decided to occupy.",
        signature: "The brand is read more in what it left out than in what it sent.",
      },
      es: {
        label: "Estudio de campo · La campaña que no salió",
        input: "Un brief de campaña que sobrevive a tres rondas de revisión.",
        observation:
          "Tratamos las eliminaciones como el trabajo. Lo que la marca decidió no decir es más diagnóstico de su posición que lo que publicó — las líneas cortadas cartografían el territorio que la marca ha decidido ocupar.",
        signature: "A la marca se la lee más en lo que dejó fuera que en lo que envió.",
      },
    },
  },
  {
    slug: "community-culture",
    number: "06",
    image: "/images/worlds/community-culture.png",
    color: {
      name: "Refractive Edge",
      hex: "#7ab0a8",
      core: "rgba(180,225,215,0.92)",
      mid: "rgba(95,160,150,0.6)",
      deep: "rgba(14,28,28,1)",
      glow: "rgba(140,200,190,0.35)",
    },
    motion: { breatheScale: [1, 1.06], breatheDuration: 5, drift: 5, pulse: "refract" },
    title: { en: "Community & Culture", es: "Comunidad y Cultura" },
    pitch: {
      en: "We build a fixed core and a refractive surface — three sentences, two gestures, one acoustic — so the thesis travels intact while expression mutates city by city, partner by partner.",
      es: "Construimos un núcleo fijo y una superficie refractiva — tres frases, dos gestos, una acústica — para que la tesis viaje intacta mientras la expresión muta ciudad a ciudad, socio a socio.",
    },
    outcome: {
      en: "The brand carried into rooms it does not own becomes the brand customers describe as inevitable.",
      es: "La marca llevada a salas que no posee se convierte en la marca que los clientes describen como inevitable.",
    },
    essence: {
      en: "The brand is what the room around it agrees to.",
      es: "La marca es aquello en lo que la sala que la rodea decide estar de acuerdo.",
    },
    material: {
      en: "A crystal that mutates with the room it is placed in.",
      es: "Un cristal que muta con la sala donde se coloca.",
    },
    energy: {
      en: "Refractive. The brand carried by people and rooms it does not own.",
      es: "Refractiva. La marca sostenida por personas y salas que no le pertenecen.",
    },
    practice: {
      en: [
        "Cultural programming — partnerships, residencies, publishing, content programs.",
        "Community architecture — the surfaces an advocate can speak from.",
        "Brand worldbuilding across territories, languages and partners.",
      ],
      es: [
        "Programación cultural — partnerships, residencias, publishing, programas de contenido.",
        "Arquitectura de comunidad — las superficies desde las que un advocate puede hablar.",
        "Brand worldbuilding a través de territorios, idiomas y socios.",
      ],
    },
    body: {
      en: [
        "Community and culture is where the brand stops being a sender and becomes a context. A partnership, a program, a residency, an editorial platform, a community surface — each carries the brand into a room the marketing team does not control. The customer reads it as more credible precisely because it is.",
        "We direct cultural and community systems with a fixed core and a refractive surface. The thesis travels intact. The expression mutates city by city, audience by audience, partner by partner. The brand reads as native everywhere it lands without ever having moved.",
      ],
      es: [
        "Comunidad y cultura es donde la marca deja de ser emisor y se convierte en contexto. Un partnership, un programa, una residencia, una plataforma editorial, una superficie de comunidad — cada una lleva la marca a una sala que el equipo de marketing no controla. El cliente la lee como más creíble precisamente porque lo es.",
        "Dirigimos sistemas culturales y de comunidad con un núcleo fijo y una superficie refractiva. La tesis viaja intacta. La expresión muta ciudad a ciudad, audiencia a audiencia, socio a socio. La marca se lee como nativa en cada sitio en el que aterriza sin haberse movido nunca.",
      ],
    },
    discipline: {
      image: "/images/02_worldbuilding_floating.jpg",
      imagePosition: "center 50%",
      title: { en: "Community & Culture", es: "Comunidad y Cultura" },
      copy: {
        en: "The brand carried by rooms it does not own.",
        es: "La marca sostenida por salas que no le pertenecen.",
      },
    },
    fieldStudy: {
      en: {
        label: "Field study · Core and surface",
        input: "A partnership the brand cannot control once it has begun.",
        observation:
          "We design a fixed centre — three sentences, two gestures, one acoustic. And let everything else refract. What the partner adds is the work; what the brand holds is the centre.",
        signature: "The brand reads as inevitable in rooms it never built.",
      },
      es: {
        label: "Estudio de campo · Núcleo y superficie",
        input: "Un partnership que la marca no puede controlar una vez ha empezado.",
        observation:
          "Diseñamos un centro fijo — tres frases, dos gestos, una acústica. Y dejamos que todo lo demás refracte. Lo que el socio añade es el trabajo; lo que la marca sostiene es el centro.",
        signature: "La marca se lee como inevitable en salas que nunca construyó.",
      },
    },
  },
];

export function getWorld(slug: string): World | undefined {
  return worlds.find((w) => w.slug === slug);
}

// Universe mythology — the shared language across all Cores. The studio
// itself, not the surfaces.
export const mythology = {
  centralCore: {
    en: {
      name: "The Central Core",
      essence: "The origin. The laboratory. The intelligence.",
      body: [
        "At the centre of the universe rests a sphere of dark crimson obsidian. Its surface is liquid. Its weight is silent. Inside the sphere, suspended in the energy that holds the Core together, a metallic X is forged. Not painted on the orb. Not placed over it. Forged within it, the way meaning is forged within a sentence.",
        "The Central Core is the studio. It watches every surface a brand touches a customer through, records what each one teaches, and feeds the laboratory where the next ones take shape.",
      ],
    },
    es: {
      name: "El Núcleo Central",
      essence: "El origen. El laboratorio. La inteligencia.",
      body: [
        "En el centro del universo descansa una esfera de obsidiana carmesí. Su superficie es líquida. Su peso es silencio. Dentro de la esfera, suspendida en la energía que mantiene al Núcleo unido, hay una X metálica forjada. No pintada sobre la esfera. No puesta encima. Forjada en su interior, como el sentido se forja dentro de una frase.",
        "El Núcleo Central es el estudio. Observa cada superficie por la que una marca toca a un cliente, registra lo que cada una enseña y alimenta el laboratorio donde toman forma las siguientes.",
      ],
    },
  },
  orun: {
    name: "ORUN",
    role: { en: "Observer of surfaces", es: "Observador de superficies" },
    body: {
      en: [
        "ORUN watches from inside the Central Core. It does not intervene. It records. Every project the studio accepts is first passed through ORUN's silence, where the air thickens, the noise stops, and the surface is heard for what it actually is.",
        "When ORUN is present, the surface becomes more accurate to itself. What was decoration falls away. What was real remains, with nothing in front of it.",
      ],
      es: [
        "ORUN observa desde dentro del Núcleo Central. No interviene. Registra. Cada proyecto que el estudio acepta atraviesa primero el silencio de ORUN, donde el aire se vuelve denso, el ruido se detiene y la superficie se oye por lo que realmente es.",
        "Cuando ORUN está presente, la superficie se vuelve más fiel a sí misma. Lo que era decoración cae. Lo que era verdadero permanece, sin nada delante.",
      ],
    },
  },
  xio: {
    name: "XIO",
    role: { en: "Reactive creature of the anomalies", es: "Criatura reactiva de las anomalías" },
    body: {
      en: [
        "When a surface is pushed past its rhythm, its Core fractures. Shards drift out, carrying the colour, the sound and the breath of that surface. XIO finds them, and absorbs them.",
        "Every shard transforms XIO. New forms, new gestures, new charges enter its body. XIO is how the studio remembers what each surface has taught it. Not as a record. As a creature that keeps changing.",
      ],
      es: [
        "Cuando una superficie se empuja más allá de su ritmo, su Núcleo se fractura. Los fragmentos se desprenden y derivan, cargando el color, el sonido y la respiración de esa superficie. XIO los encuentra y los absorbe.",
        "Cada fragmento la transforma. Nuevas formas, nuevos gestos, nuevas cargas entran en su cuerpo. XIO es la manera en que el estudio recuerda lo que cada superficie le ha enseñado. No como registro. Como criatura que sigue cambiando.",
      ],
    },
  },
  anomalies: {
    en: {
      title: "Anomalies",
      body: [
        "Surfaces are not stable. When a Core is pushed beyond its rhythm, fractures appear in its skin. Light leaks through the seams. Shards form and drift outward, each one carrying a fragment of signal.",
        "We do not treat these moments as failure. The shards are the material the universe is built from. Every evolution of our practice has begun with a fracture we refused to repair.",
      ],
    },
    es: {
      title: "Anomalías",
      body: [
        "Las superficies no son estables. Cuando un Núcleo se empuja más allá de su ritmo, aparecen fracturas en su piel. La luz se escapa por las costuras. Los fragmentos se desprenden y derivan, cargados de señal.",
        "No tratamos esos momentos como errores. Los fragmentos son el material con el que se construye el universo. Cada evolución de nuestro trabajo ha empezado en una fractura que no quisimos reparar.",
      ],
    },
  },
};
