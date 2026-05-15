import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Apple touch icon — 180x180 is what iOS "Add to Home Screen" expects.
// It is also the small square WhatsApp / iMessage tend to pull when
// rendering a shared link's preview tile.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const symbol = await readFile(
    join(process.cwd(), "public/images/hero/05_main_bottom_symbol.png")
  );
  const dataUrl = `data:image/png;base64,${symbol.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 45%, #1a140e 0%, #060606 70%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          width={148}
          height={148}
          alt="XNLAB"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
