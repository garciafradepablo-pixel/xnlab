import { ImageResponse } from "next/og";
import { getProject } from "../data";

export const alt = "Xnlab Studio — Atelier Study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  const number = project?.number ?? "—";
  const discipline = project?.discipline ?? "Atelier Studies";
  const year = project?.year ?? "";
  const title = project?.title ?? "Atelier Studies";
  const excerpt = project?.excerpt.en ?? "Digital Atmosphere Studio for premium brands.";
  const eyebrow = `${number} · ${discipline} · ${year}`;

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
            "radial-gradient(circle at 35% 35%, #1a140e 0%, #060606 70%)",
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
            xnlab.io/studies
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(230,205,165,0.85)",
              marginBottom: 28,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: 100,
              lineHeight: 0.96,
              letterSpacing: "-0.04em",
              fontWeight: 400,
              color: "white",
              maxWidth: 980,
              marginBottom: 28,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              maxWidth: 880,
            }}
          >
            {excerpt}
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
          <div>Xnlab Studio · Atelier Studies</div>
          <div>By appointment only</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
