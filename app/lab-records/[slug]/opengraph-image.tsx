import { ImageResponse } from "next/og";
import { getRecord } from "../../_lib/lab-records";

export const alt = "Xnlab Studio — Lab Record";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = getRecord(slug);
  const number = record?.number ?? "—";
  const category = record?.category.en ?? "Lab Records";
  const date = record?.date ?? "";
  const year = date ? date.slice(0, 4) : "";
  const title = record?.title.en ?? "Lab Records";
  const leadRaw = record?.lead.en ?? "Field notes from the studio.";
  const lead = leadRaw.length > 220 ? leadRaw.slice(0, 217).trimEnd() + "…" : leadRaw;
  const eyebrow = `${number} · ${category} · ${year}`;

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
            xnlab.io/lab-records
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
              fontSize: 76,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              fontWeight: 400,
              color: "white",
              maxWidth: 1020,
              marginBottom: 28,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              maxWidth: 940,
            }}
          >
            {lead}
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
          <div>Xnlab Studio · Lab Records</div>
          <div>By appointment only</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
