import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// App icon — generated as PNG so it works as a manifest icon and an
// installable home-screen tile without committing binary assets.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0e0f12 0%, #050506 100%)",
          fontSize: 300,
          fontWeight: 800,
          letterSpacing: -10,
        }}
      >
        <span style={{ color: "#34d399" }}>D</span>
        <span style={{ color: "#fb923c" }}>C</span>
      </div>
    ),
    { ...size },
  );
}
