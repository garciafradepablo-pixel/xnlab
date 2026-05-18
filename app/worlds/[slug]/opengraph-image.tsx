import { ImageResponse } from "next/og";
import { worlds, getWorld } from "../../_lib/worlds";

// One OG card per world slug. Same 1200×630 frame as the root OG, but
// the radial gradient + accent colour are drawn from the world's own
// palette so each share card feels signed by that sphere instead of a
// generic studio cover. Renders at the edge on demand and is cached
// by Vercel's image pipeline.

export const alt = "XNLAB — World";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return worlds.map((w) => ({ slug: w.slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWorld(slug);
  if (!w) {
    // Fall back to the root OG composition if a slug is unknown.
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#060606", color: "white", fontFamily: "sans-serif", fontSize: 48 }}>
          XNLAB
        </div>
      ),
      { ...size },
    );
  }

  const c = w.color;
  // Deep colour with a touched-up alpha for the outer fade. Strip the
  // closing ",1)" if present so the gradient blends into the page
  // background gracefully.
  const deepEdge = c.deep.replace(",1)", ",0.45)");

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
          background: `radial-gradient(circle at 50% 38%, ${c.mid} 0%, ${deepEdge} 45%, #060606 78%)`,
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Soft halo behind the heading area, in the world's accent
            colour. Pure CSS, no SVG, since OG runtime is restricted. */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background: c.glow,
            filter: "blur(60px)",
            opacity: 0.55,
            display: "flex",
          }}
        />

        {/* Top — brand + URL */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              fontWeight: 500,
              color: "white",
            }}
          >
            XNLAB
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            xnlab.io/worlds/{w.slug}
          </div>
        </div>

        {/* Centre — world number + title + pitch */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            position: "relative",
            maxWidth: 980,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: c.hex,
              marginBottom: 24,
            }}
          >
            World {w.number} · {c.name}
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 0.96,
              letterSpacing: "-0.045em",
              fontWeight: 400,
              color: "white",
              maxWidth: 1040,
              marginBottom: 24,
            }}
          >
            {w.title.en}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.32,
              fontWeight: 300,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 920,
            }}
          >
            {w.pitch.en}
          </div>
        </div>

        {/* Bottom — discipline + appointment cue */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex" }}>Creative direction · {w.title.en}</div>
          <div style={{ display: "flex" }}>By appointment only</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
