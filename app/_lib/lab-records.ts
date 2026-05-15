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
        "Lo llamamos branding atmosférico. Es más difícil de especificar en una presentación y más difícil de hacer cumplir en un rollout multi-local. Exige diseñadores capaces de salir de la disciplina de identidad visual y entrar en la acústica espacial, la calibración de luz, incluso la compra de materiales. Produce además un tipo de lealtad que el branding hotelero tradicional rara vez consigue: no “me acuerdo del logo” sino “me acuerdo de cómo me sentí durante los tres días siguientes”.",
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
        "Ese modelo se ha invertido. Hoy los artistas más definitorios manejan sistemas visuales coherentes que operan en formatos que no pueden controlar del todo: un teaser sin publicar en la cuenta de otro, un shooting de estadio en un país en el que nunca han estado, un edit de un fan, un meme. Su identidad tiene que sobrevivir a cada uno de esos contextos. La música es una superficie entre muchas.",
        "Esto significa que los artistas necesitan worldbuilding, no branding. El sistema tiene que ser lo bastante profundo para generar outputs que el artista no encargó. Debe definir no solo tipografía y paleta sino vocabulario gestual, textura sonora, registro fotográfico, lo que el artista no va a decir, cómo es su comportamiento en internet, cómo está iluminada su cara cuando aparece en el escenario de otro. Un mundo coherente genera contenido de fans que sigue perteneciendo al artista.",
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
        "No es una tendencia estilística. Es un cambio estructural. El consumidor de lujo ha sido sobre-servido por la perfección y ahora tiene hambre de mood, sugerencia e incompleto — cualidades que pertenecen al cine, no al diseño gráfico. Las marcas que descubren cómo traducir su identidad a gramática de cine — luz, ritmo, sonido, contención — se distancian de las que aún optimizan la imagen de campaña perfecta.",
        "El branding cinematográfico es más difícil que el branding gráfico porque exige duración. Un still funciona a la velocidad del ojo. Una escena funciona a la velocidad de la respiración. Diseñar a la velocidad de la respiración exige decidir qué siente el espectador en el segundo 3, en el segundo 7, en el segundo 12 — y cómo esas decisiones se acumulan en una memoria de la marca.",
        "Los estudios que lo hacen mejor — y es una lista corta — comparten tres rasgos. Dirigen imagen y sonido como una sola decisión, no como dos departamentos. Tratan el silencio como un material. Y protegen a la marca de sobre-explicarse: la marca cinematográfica nunca te dice lo que es; te deja decidir.",
        "Para marcas de lifestyle, perfume, moda y editorial que consideran su próxima década, la implicación es operativa. El equipo que define la marca ya no puede ser solo diseñadores gráficos. Tiene que incluir — o comportarse como — directores, cinematógrafos, diseñadores de sonido y pensadores atmosféricos. El sistema gráfico sigue existiendo. Ya no es el centro.",
      ],
    },
    tags: ["luxury branding", "cinematic identity", "fashion"],
  },
];

export function getRecord(slug: string): LabRecord | undefined {
  return records.find((r) => r.slug === slug);
}
