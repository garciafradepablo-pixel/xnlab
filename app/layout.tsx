import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { DustStyles } from "./_lib/atoms";
import { ScrollProgress, FilmGrain } from "./_lib/chrome";
import { PageTransition } from "./_lib/page-transition";
import { Cursor } from "./_lib/cursor";
import { BackToTop } from "./_lib/back-to-top";
import { LoadingCurtain } from "./_lib/loading-curtain";
import { Analytics } from "@vercel/analytics/next";

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
const TITLE = "XNLAB — Digital Atmosphere Studio for Premium Brands";
const DESCRIPTION =
  "XNLAB builds cinematic websites, campaign systems and visual worlds for hospitality, nightlife, architecture, wellness, artists and culture-led brands.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · XNLAB" },
  description: DESCRIPTION,
  applicationName: "Xnlab Studio",
  generator: "Next.js",
  keywords: [
    "creative direction studio",
    "brand worldbuilding",
    "visual identity systems",
    "campaign systems",
    "hospitality branding",
    "nightlife visual identity",
    "luxury brand direction",
    "music visual identity",
    "digital atmosphere",
    "AI-assisted creative direction",
    "premium web design",
    "visual content systems",
    "digital atmosphere studio",
    "premium brand websites",
    "cinematic web design agency",
    "boutique hotel website design",
    "architecture studio website design",
    "wellness brand identity",
    "nightlife venue branding",
    "atmosphere design",
    "cultural identity design",
    "XNLAB",
    "Xnlab Studio",
  ],
  authors: [{ name: "Xnlab Studio" }],
  creator: "Xnlab Studio",
  publisher: "Xnlab Studio",
  category: "design",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "es-ES": "/",
      "x-default": "/",
    },
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
  verification: {
    // Set GOOGLE_SITE_VERIFICATION in Vercel env (Search Console → Settings →
    // Ownership verification → HTML tag → copy the content="..." value).
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
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
  alternateName: ["Xnlab Studio", "XNLAB Studio"],
  url: SITE,
  description: DESCRIPTION,
  email: "studio@xnlab.io",
  foundingDate: "2023-01-01",
  areaServed: "Worldwide",
  serviceArea: { "@type": "Place", name: "Worldwide" },
  slogan: "Digital Atmosphere Studio for premium brands.",
  knowsAbout: [
    "Hospitality Experience",
    "Nightlife and Cultural Events",
    "Luxury Lifestyle Brands",
    "Architecture and Spatial Design",
    "Music and Cultural Artists",
    "Cultural Digital Worlds",
    "Luxury brand identity",
    "Creative direction",
    "Worldbuilding",
    "Atmosphere design",
  ],
  // Add real social profiles here when published. Empty until then to avoid 404s in Google's eyes.
  sameAs: [],
};

// WebSite schema with SearchAction — helps Google understand the site
// as a top-level cultural property + enables sitelinks search box in
// the SERP. Also declares the bilingual nature explicitly.
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "XNLAB",
  alternateName: "Xnlab Studio",
  url: SITE,
  description: DESCRIPTION,
  inLanguage: ["en", "es"],
  publisher: {
    "@type": "Organization",
    name: "XNLAB",
    url: SITE,
  },
};

const serviceLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Hospitality Experience",
      serviceType: "Hospitality brand identity and atmosphere design",
      description:
        "Atmospheres, identities and visual systems for boutique hotels, restaurants and hospitality groups. Designed to be remembered, not described.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Hospitality operators, boutique hotel owners" },
    },
    {
      "@type": "Service",
      name: "Nightlife and Cultural Events",
      serviceType: "Nightlife brand identity and venue direction",
      description:
        "Dark, cinematic visual systems for clubs, bars and cultural venues. Identity as a complete sensory programme — light, motion, sound, surface.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Nightclub operators, cultural venue directors" },
    },
    {
      "@type": "Service",
      name: "Luxury Lifestyle Brands",
      serviceType: "Luxury and lifestyle brand identity direction",
      description:
        "Brand worlds for luxury fashion, beauty, wellness and lifestyle houses. Identity as a complete cultural object — surface, motion, copy, atmosphere.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Luxury and lifestyle brand owners" },
    },
    {
      "@type": "Service",
      name: "Architecture and Spatial Design",
      serviceType: "Spatial and architectural identity direction",
      description:
        "Spaces shaped through silence, light and material. Architectural identity as the first layer of brand emotion.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Architects, developers, cultural institutions" },
    },
    {
      "@type": "Service",
      name: "Music and Cultural Artists",
      serviceType: "Visual identity and direction for artists and labels",
      description:
        "Visual worlds for musicians, labels and cultural artists. Cover art, motion, web presence and cinematic launch direction.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Recording artists, labels, cultural producers" },
    },
    {
      "@type": "Service",
      name: "Cultural Digital Worlds",
      serviceType: "Digital identity and worldbuilding",
      description:
        "Symbols, avatars and digital identities with presence. Built to live across physical space, digital surface and cultural memory.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Cultural brands, digital-native projects" },
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
        <a href="#main" className="xn-skip">Skip to content</a>
        <DustStyles />
        <FilmGrain />
        <ScrollProgress />
        <Cursor />
        <BackToTop />
        <LoadingCurtain />
        <div id="main"><PageTransition>{children}</PageTransition></div>
        <Analytics />
      </body>
    </html>
  );
}
