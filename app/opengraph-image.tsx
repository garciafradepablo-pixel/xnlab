import { ImageResponse } from "next/og";

export const alt = "Xnlab Studio — Creative systems for modern culture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background:
            "radial-gradient(circle at 50% 38%, #1a140e 0%, #060606 65%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            xnlab.io
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(230,205,165,0.85)",
              marginBottom: 32,
            }}
          >
            Worldbuilding Studio
          </div>
          <div
            style={{
              fontSize: 112,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              fontWeight: 400,
              color: "white",
              maxWidth: 980,
            }}
          >
            Creative systems for modern culture.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <div>Atmospheres · Identities · Visual Systems</div>
          <div>By appointment only</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
