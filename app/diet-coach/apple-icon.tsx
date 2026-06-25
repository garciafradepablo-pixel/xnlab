import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — Safari "Add to Home Screen" uses this.
export default function AppleIcon() {
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
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        <span style={{ color: "#34d399" }}>D</span>
        <span style={{ color: "#fb923c" }}>C</span>
      </div>
    ),
    { ...size },
  );
}
