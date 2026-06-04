import { ImageResponse } from "next/og";

// Hunter Network — the link-share card. A bespoke OG image so that when the
// /hunter-network link is sent on WhatsApp / social, the preview reads premium
// and on-brand instead of falling back to the generic XNLAB card. The page is a
// shareable door, so this card is part of the product.
//
// Satori rules (house rule 10): every <div> with more than one child node must
// declare `display: "flex"`. Text + interpolation counts as two children.

export const alt = "Hunter Network — red privada de vendedores evaluados";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "rgba(232,183,131,0.95)";
const AMBER = "rgba(255,138,76,0.95)";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 28% 26%, #2a1c10 0%, #0a0805 46%, #060606 72%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row — wordmark + status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 22, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 600, color: "white" }}>
            HUNTER NETWORK
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: "#7fd0a0" }} />
            <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
              En operación · MMXXVI
            </div>
          </div>
        </div>

        {/* Headline — the edge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", fontSize: 18, fontWeight: 500, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD, marginBottom: 30 }}>
            Red privada de vendedores evaluados
          </div>
          <div style={{ display: "flex", fontSize: 96, lineHeight: 0.98, letterSpacing: "-0.04em", fontWeight: 400, color: "white" }}>
            La mayoría de quien aplica
          </div>
          <div style={{ display: "flex", fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 400, fontStyle: "italic", color: GOLD }}>
            no llega a una campaña.
          </div>
        </div>

        {/* Bottom row — principle + CTA chip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 19, letterSpacing: "0.01em", color: "rgba(255,255,255,0.6)", maxWidth: 720 }}>
            El rendimiento da acceso a mejores campañas — no el pago.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 26px",
              borderRadius: 100,
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1a0d04",
              background: `linear-gradient(100deg, ${AMBER}, ${GOLD})`,
            }}
          >
            Empieza tu evaluación
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
