import type { Metadata } from "next";
import HunterNetworkPage from "./_hunter-network";
import HNInstall from "./_pwa";

// Hunter Network — the public face of the evaluated-seller network. Like
// /network, this is a campaign/door surface shared by direct link, not an SEO
// entry point, so it stays out of the index and out of sitemap.ts. The internal
// operator console (the application that runs the network) is a separate
// surface that lives in Connect, the internal app — not here.
//
// It is also an installable PWA in its own right: its own manifest + icons +
// apple-web-app meta make it "add to home screen"-able as the "Hunter" app,
// without disturbing the site-wide XNLAB manifest.
export const metadata: Metadata = {
  title: "Hunter Network — XNLAB",
  description:
    "A private, performance-based network of evaluated remote Spanish-speaking sellers. Access is earned through a Commercial Access Evaluation — campaign access is bought by performance, never by payment. By request.",
  alternates: { canonical: "/hunter-network" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Hunter Network — red privada de vendedores evaluados",
    description:
      "El rendimiento da acceso a mejores campañas — no el pago. Accede a la Evaluación de Acceso Comercial.",
    url: "https://xnlab.io/hunter-network",
    siteName: "Hunter Network",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hunter Network — red privada de vendedores evaluados",
    description: "El rendimiento da acceso a mejores campañas — no el pago.",
  },
  manifest: "/hn.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Hunter",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: [{ url: "/hn-apple-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function Page() {
  return (
    <>
      <HunterNetworkPage />
      <HNInstall />
    </>
  );
}
