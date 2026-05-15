import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { DustStyles } from "./_lib/atoms";
import { ScrollProgress, FilmGrain } from "./_lib/chrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
});

const SITE = "https://xnlab.io";
const TITLE = "XNLAB — Creative systems for modern culture";
const DESCRIPTION =
  "Worldbuilding studio for modern luxury. We design atmospheres, identities and visual systems for hospitality, nightlife, architecture and cultural identity. By appointment only.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · XNLAB" },
  description: DESCRIPTION,
  applicationName: "Xnlab Studio",
  generator: "Next.js",
  keywords: [
    "creative direction",
    "worldbuilding",
    "hospitality design",
    "nightlife design",
    "emotional architecture",
    "brand identity",
    "luxury",
    "atmosphere",
    "XNLAB",
    "Xnlab Studio",
  ],
  authors: [{ name: "Xnlab Studio" }],
  creator: "Xnlab Studio",
  publisher: "Xnlab Studio",
  category: "design",
  alternates: {
    canonical: "/",
    languages: { en: "/", es: "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "Xnlab Studio",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    locale: "en_US",
    alternateLocale: ["es_ES"],
    images: [
      {
        url: "/images/01_hero_chrome.jpg",
        width: 1200,
        height: 896,
        alt: "Xnlab Studio — cinematic worldbuilding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/01_hero_chrome.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
  // Icons are generated dynamically via app/icon.tsx + app/apple-icon.tsx
};

export const viewport: Viewport = {
  themeColor: "#060606",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "XNLAB",
  legalName: "Xnlab Studio",
  alternateName: "Xnlab Studio",
  url: SITE,
  description: DESCRIPTION,
  email: "studio@xnlab.io",
  knowsAbout: [
    "Hospitality Systems",
    "Nightlife Atmospheres",
    "Emotional Architecture",
    "Living Identities",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} style={{background:"#060606"}}>
      <body style={{margin:0,padding:0,background:"#060606",overflowX:"hidden"}}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <DustStyles />
        <FilmGrain />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
