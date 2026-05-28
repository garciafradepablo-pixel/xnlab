"use client";
import Link from "next/link";
import { ts, tsS, serif, R, Label, Dust } from "./atoms";

// "What we transform" / "Lo que convertimos" — the honest proof
// interlude that closes the credibility gap BEFORE real public case
// studies exist, structured as an ORBIT SYSTEM.
//
// TAXONOMY (the fix): each main sector is its own orbit. Hospitality is
// a vertical of its own, with several sub-worlds inside it (immersive
// dining, rooftops, nightlife, boutique hotels, restaurants) — those are
// NOT shown as peers of Clinics or Real Estate; they live under
// Hospitality, clearly labelled "Hospitality sub-worlds".
//
// INTEGRITY CONTRACT (do not weaken):
//   • NOT case studies. Eyebrow + framing + a per-card "Illustrative
//     model" tag say so outright.
//   • No named clients, no logos, no metrics. The commercial effect is
//     a DIRECTION (more desire, more trust, fewer discounts) — never a
//     fabricated number.
//   • Voice: human, sensory, sharp — not generic agency language.
//
// Performance: pure CSS/text, zero images. Hover is transform/opacity on
// a GPU layer. Section background transparent so the global
// AmbientBackdrop flows through — no scroll seam.

type Bi = { en: string; es: string };
// `tint` is an "r,g,b" triplet — each orbit gets a distinct sector mood
// from the world palette, so the cards read as distinct atmospheres.
type Orbit = { sector: Bi; before: Bi; gap: Bi; rebuild: Bi; effect: Bi; tint: string; subWorlds?: Bi[] };

const copy_en = {
  eyebrow: "Transformation models · Illustrative",
  h1a: "What we",
  h1b: "transform.",
  framing:
    "Not case studies — not yet. These are transformation models: how we diagnose a perception gap and rebuild it into desire, trust and commercial value. Each sector is its own orbit. Hospitality is a vertical of its own, with several worlds inside it.",
  tag: "Illustrative model",
  lBefore: "Before",
  lGap: "The gap",
  lRebuild: "We rebuild",
  lEffect: "Effect",
  subLabel: "Hospitality sub-worlds",
  ctaH: "Want us to diagnose your perception gap?",
  cta: "Request a perception audit",
};
const copy_es: typeof copy_en = {
  eyebrow: "Modelos de transformación · Ilustrativo",
  h1a: "Lo que",
  h1b: "convertimos.",
  framing:
    "No son casos falsos. Son modelos de transformación: cómo detectamos una brecha de percepción y la reconstruimos en deseo, confianza y valor comercial. Cada sector es su propia órbita. La hostelería es un vertical en sí mismo, con varios mundos dentro.",
  tag: "Modelo ilustrativo",
  lBefore: "Antes",
  lGap: "La brecha",
  lRebuild: "Reconstruimos",
  lEffect: "Efecto",
  subLabel: "Sub-mundos de hostelería",
  ctaH: "¿Quieres que detectemos tu brecha de percepción?",
  cta: "Solicitar auditoría de percepción",
};

const ORBITS: Orbit[] = [
  {
    sector: { en: "Hospitality", es: "Hostelería" },
    tint: "207,138,58",
    before: { en: "The room is alive. The website is a reservation form with photos.", es: "La sala está viva. La web es un formulario de reserva con fotos." },
    gap: { en: "Everything that makes the place worth the trip dies on the screen.", es: "Todo lo que hace que el sitio valga el viaje se muere en la pantalla." },
    rebuild: { en: "A cinematic atmosphere system — the threshold, the light, the sound — carried into a site that books and a feed that makes people want to be there.", es: "Un sistema de atmósfera cinematográfica — el umbral, la luz, el sonido — llevado a una web que reserva y a un feed que da ganas de estar ahí." },
    effect: { en: "More bookings made on feeling, a venue that travels by word of mouth.", es: "Más reservas hechas por sensación, un local que viaja de boca en boca." },
    subWorlds: [
      { en: "Immersive dining", es: "Cocina inmersiva" },
      { en: "Rooftops", es: "Rooftops" },
      { en: "Nightlife venues", es: "Locales de noche" },
      { en: "Boutique hotels", es: "Hoteles boutique" },
      { en: "Restaurants & bars", es: "Restaurantes y bares" },
    ],
  },
  {
    sector: { en: "Clinics · Aesthetic Medicine", es: "Clínicas · Medicina estética" },
    tint: "122,176,168",
    before: { en: "The hands are expert. The brand feels like a waiting room.", es: "Las manos son expertas. La marca se siente como una sala de espera." },
    gap: { en: "Patients trust the result, not the first impression online.", es: "El paciente confía en el resultado, no en la primera impresión online." },
    rebuild: { en: "A calm-authority system — softness, certainty, a journey that reassures before the first call.", es: "Un sistema de autoridad serena — suavidad, certeza, un recorrido que tranquiliza antes de la primera llamada." },
    effect: { en: "More enquiries from people who already trust you.", es: "Más consultas de gente que ya confía en ti." },
  },
  {
    sector: { en: "Real Estate", es: "Inmobiliaria" },
    tint: "198,168,120",
    before: { en: "The asset is worth millions. The listing looks like a portal.", es: "El activo vale millones. El anuncio parece un portal." },
    gap: { en: "Nothing online signals the bracket the property actually sits in.", es: "Nada online señala el rango en el que está de verdad la propiedad." },
    rebuild: { en: "A presence that reads the price before the viewing — staging, narrative, the calm of a serious house.", es: "Una presencia que se lee el precio antes de la visita — puesta en escena, narrativa, la calma de una casa seria." },
    effect: { en: "Sellers choose you; buyers arrive already convinced of the level.", es: "Los vendedores te eligen; los compradores llegan ya convencidos del nivel." },
  },
  {
    sector: { en: "Culture · Music · Events", es: "Cultura · Música · Eventos" },
    tint: "140,126,214",
    before: { en: "The work moves people in the room. Online it scrolls past.", es: "El trabajo emociona en directo. Online pasa de largo." },
    gap: { en: "The cultural weight never makes it into the feed.", es: "El peso cultural no llega al feed." },
    rebuild: { en: "A world, not a poster — identity, motion, an editorial rhythm that builds a following between events.", es: "Un mundo, no un cartel — identidad, movimiento, un ritmo editorial que construye seguimiento entre eventos." },
    effect: { en: "A name people follow, not just a date they attend.", es: "Un nombre que la gente sigue, no solo una fecha a la que va." },
  },
  {
    sector: { en: "Retail · Luxury Commerce", es: "Retail · Comercio de lujo" },
    tint: "184,116,72",
    before: { en: "The product is beautiful. The store online is a grid of thumbnails.", es: "El producto es precioso. La tienda online es una cuadrícula de miniaturas." },
    gap: { en: "The object loses its aura the moment it becomes a catalogue.", es: "El objeto pierde su aura en cuanto se vuelve catálogo." },
    rebuild: { en: "An atmosphere around the object — light, material, restraint — so the screen carries the same desire as the shelf.", es: "Una atmósfera alrededor del objeto — luz, material, contención — para que la pantalla cargue el mismo deseo que el estante." },
    effect: { en: "Higher perceived value, fewer discounts to make the sale.", es: "Más valor percibido, menos descuentos para cerrar la venta." },
  },
  {
    sector: { en: "Wellness", es: "Wellness" },
    tint: "130,172,150",
    before: { en: "The space is a refuge. The site is loud and busy.", es: "El espacio es un refugio. La web es ruidosa y recargada." },
    gap: { en: "The calm you sell is nowhere on the page.", es: "La calma que vendes no está en ninguna parte de la página." },
    rebuild: { en: "A quiet system — space, breath, slowness — that lets the visitor feel the relief before they book.", es: "Un sistema en silencio — espacio, respiración, lentitud — que deja sentir el alivio antes de reservar." },
    effect: { en: "Bookings from people who already exhaled.", es: "Reservas de gente que ya ha soltado el aire." },
  },
  {
    sector: { en: "Gaming · Interactive Worlds", es: "Gaming · Mundos interactivos" },
    tint: "96,168,214",
    before: { en: "The world is rich. The site explains it like a brochure.", es: "El mundo es rico. La web lo explica como un folleto." },
    gap: { en: "The experience is interactive; the presence is flat.", es: "La experiencia es interactiva; la presencia es plana." },
    rebuild: { en: "A presence built like the product — motion, depth, a threshold that behaves like an entrance, not a page.", es: "Una presencia construida como el producto — movimiento, profundidad, un umbral que se comporta como una entrada, no como una página." },
    effect: { en: "Players arrive already inside the world.", es: "Los jugadores llegan ya dentro del mundo." },
  },
  {
    sector: { en: "Social · Creator Brands", es: "Social · Marcas de creador" },
    tint: "196,120,150",
    before: { en: "The audience is real. The brand around it is improvised.", es: "La audiencia es real. La marca a su alrededor está improvisada." },
    gap: { en: "Reach without a world — attention that never compounds into equity.", es: "Alcance sin mundo — atención que nunca se convierte en valor." },
    rebuild: { en: "A coherent brand world across every surface a creator owns — so the audience becomes a name, not a number.", es: "Un mundo de marca coherente en cada superficie que un creador controla — para que la audiencia se vuelva un nombre, no un número." },
    effect: { en: "Followers that turn into a brand with its own gravity.", es: "Seguidores que se convierten en una marca con gravedad propia." },
  },
];

export function Transform({ lang }: { lang: "en" | "es" }) {
  const t = lang === "en" ? copy_en : copy_es;
  return (
    <section style={{ padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 78% 56% at 50% 6%, rgba(216,147,42,0.045) 0%, rgba(180,110,40,0.012) 38%, transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <Dust count={5} opacity={0.04} />
      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <R style={{ textAlign: "center", marginBottom: "clamp(32px,4vw,56px)" }}>
          <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.eyebrow}</Label>
          <h2
            style={{
              fontSize: "clamp(1.9rem,3.8vw,3.8rem)",
              fontWeight: 400,
              lineHeight: 0.96,
              letterSpacing: "-0.05em",
              textShadow: tsS,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {t.h1a}
            <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>{t.h1b}</span>
          </h2>
          <p
            style={{
              marginTop: "clamp(16px,2vw,24px)",
              fontSize: "clamp(0.92rem,1.16vw,1.05rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              maxWidth: 720,
              marginLeft: "auto",
              marginRight: "auto",
              textShadow: ts,
              textWrap: "balance",
            }}
          >
            {t.framing}
          </p>
        </R>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: "clamp(16px,2vw,26px)",
          }}
        >
          {ORBITS.map((o, i) => (
            <R key={o.sector.en} delay={0.05 * i}>
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  padding: "clamp(24px,2.6vw,36px)",
                  borderRadius: 18,
                  border: `1px solid rgba(${o.tint},0.18)`,
                  background: `radial-gradient(ellipse 100% 56% at 50% 0%, rgba(${o.tint},0.08) 0%, transparent 58%), linear-gradient(180deg, rgba(22,18,16,0.55) 0%, rgba(10,8,9,0.5) 100%)`,
                  transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), border-color 0.55s, box-shadow 0.55s, background 0.55s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = `rgba(${o.tint},0.5)`;
                  e.currentTarget.style.boxShadow = `0 24px 60px -28px rgba(0,0,0,0.8), 0 0 66px -28px rgba(${o.tint},0.5)`;
                  e.currentTarget.style.background = `radial-gradient(ellipse 100% 56% at 50% 0%, rgba(${o.tint},0.15) 0%, transparent 60%), linear-gradient(180deg, rgba(30,24,20,0.6) 0%, rgba(12,9,10,0.55) 100%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = `rgba(${o.tint},0.18)`;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = `radial-gradient(ellipse 100% 56% at 50% 0%, rgba(${o.tint},0.08) 0%, transparent 58%), linear-gradient(180deg, rgba(22,18,16,0.55) 0%, rgba(10,8,9,0.5) 100%)`;
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 18,
                    fontSize: 8.5,
                    fontWeight: 500,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.32)",
                  }}
                >
                  {t.tag}
                </span>
                <h3
                  style={{
                    margin: "0 clamp(70px,8vw,90px) clamp(18px,2vw,24px) 0",
                    fontSize: "clamp(1.05rem,1.4vw,1.32rem)",
                    fontWeight: 400,
                    lineHeight: 1.18,
                    letterSpacing: "-0.018em",
                    color: "white",
                  }}
                >
                  {o.sector[lang]}
                </h3>
                <Field label={t.lBefore} muted>{o.before[lang]}</Field>
                <Field label={t.lGap}>{o.gap[lang]}</Field>
                <Field label={t.lRebuild} strong>{o.rebuild[lang]}</Field>
                <Field label={t.lEffect} amber tint={o.tint}>{o.effect[lang]}</Field>

                {o.subWorlds && (
                  <div
                    style={{
                      marginTop: "clamp(16px,2vw,22px)",
                      paddingTop: "clamp(14px,1.6vw,18px)",
                      borderTop: `1px solid rgba(${o.tint},0.16)`,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: `rgba(${o.tint},0.7)`,
                        marginBottom: 10,
                      }}
                    >
                      {t.subLabel}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 8px" }}>
                      {o.subWorlds.map((s) => (
                        <span
                          key={s.en}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "5px 11px",
                            borderRadius: 999,
                            border: `1px solid rgba(${o.tint},0.22)`,
                            fontSize: "clamp(10px,0.85vw,11px)",
                            letterSpacing: "0.04em",
                            color: "rgba(255,255,255,0.62)",
                            fontWeight: 300,
                          }}
                        >
                          {s[lang]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </R>
          ))}
        </div>

        <R delay={0.3}>
          <div style={{ marginTop: "clamp(40px,5vw,68px)", textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 clamp(20px,2.4vw,28px)",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.2rem,2vw,1.7rem)",
                lineHeight: 1.3,
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "-0.01em",
                textShadow: ts,
                maxWidth: 620,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {t.ctaH}
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "15px 32px",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "white",
                textDecoration: "none",
                border: "1px solid rgba(232,183,131,0.45)",
                background: "rgba(232,183,131,0.06)",
                borderRadius: 999,
                transition: "background 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                e.currentTarget.style.transform = "translateY(-1px) scale(1.015)";
                e.currentTarget.style.boxShadow = "0 14px 40px -16px rgba(232,183,131,0.55), 0 0 0 1px rgba(232,183,131,0.18) inset";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.06)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                e.currentTarget.style.transform = "translateY(-1px) scale(1.015)";
                e.currentTarget.style.boxShadow = "0 14px 40px -16px rgba(232,183,131,0.55), 0 0 0 1px rgba(232,183,131,0.18) inset";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.06)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {t.cta} <span aria-hidden style={{ fontSize: 14 }}>→</span>
            </Link>
          </div>
        </R>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  muted,
  strong,
  amber,
  tint,
}: {
  label: string;
  children: React.ReactNode;
  muted?: boolean;
  strong?: boolean;
  amber?: boolean;
  tint?: string;
}) {
  return (
    <div style={{ marginBottom: "clamp(11px,1.3vw,15px)" }}>
      <span
        style={{
          display: "block",
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: amber ? `rgba(${tint ?? "232,183,131"},0.78)` : "rgba(255,255,255,0.32)",
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: "clamp(0.9rem,1.05vw,1rem)",
          lineHeight: 1.55,
          fontWeight: 300,
          letterSpacing: "-0.003em",
          color: amber
            ? `rgba(${tint ?? "232,183,131"},0.95)`
            : muted
            ? "rgba(255,255,255,0.48)"
            : strong
            ? "rgba(255,255,255,0.86)"
            : "rgba(255,255,255,0.66)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
