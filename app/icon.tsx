import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Modern PNG favicon — replaces the default Next.js boilerplate.
// 512x512 is the largest size shared by most crawlers and is what
// Slack/Telegram/Discord pick when honouring <link rel="icon" sizes="...">.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
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
          width={420}
          height={420}
          alt="XNLAB"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
