import type { Metadata, Viewport } from "next";

// Standalone PWA surface, independent of the host marketing site. It is
// intentionally not indexed — it is a personal tool.
export const metadata: Metadata = {
  title: "Diet Coach OS",
  description: "Planifica, ejecuta y registra tu dieta de volumen limpio. App local-first, sin backend.",
  applicationName: "Diet Coach OS",
  manifest: "/diet-coach/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Diet Coach",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/diet-coach/icon",
    apple: "/diet-coach/apple-icon",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function DietCoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
