import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { DustStyles } from "./_lib/atoms";
import { ScrollProgress, FilmGrain } from "./_lib/chrome";
import { Cursor } from "./_lib/cursor";
import { BackToTop } from "./_lib/back-to-top";
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
const TITLE = "XNLAB — Creative Direction & AI Studio · Brand Worlds, Web Design, SEO";
const DESCRIPTION =
  "XNLAB is a creative direction and AI studio for premium brands. Brand worlds, cinematic websites, campaign systems, AI content, process automation, branding upgrade, SEO and conversion. Hospitality, nightlife, luxury, architecture, music and culture-led companies. By appointment.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · XNLAB" },
  description: DESCRIPTION,
  applicationName: "Xnlab Studio",
  generator: "Next.js",
  keywords: [
    // English — core commercial terms
    "creative direction studio",
    "creative direction agency",
    "AI agency",
    "AI content agency",
    "AI content studio",
    "AI creative direction",
    "AI brand direction",
    "process automation agency",
    "AI-assisted creative direction",
    "AI workflow automation for brands",
    "brand identity agency",
    "branding agency premium",
    "branding upgrade",
    "rebranding agency",
    "web design agency",
    "premium web design",
    "luxury web design",
    "cinematic web design agency",
    "boutique web design studio",
    "SEO agency",
    "technical SEO services",
    "conversion optimisation studio",
    "SEO for premium brands",
    "campaign systems",
    "brand worldbuilding",
    "visual identity systems",
    "art direction studio",
    "digital atmosphere studio",
    "premium brand websites",
    "Next.js web design studio",
    // Sectors / audiences
    "hospitality branding",
    "boutique hotel website design",
    "restaurant brand identity",
    "nightlife visual identity",
    "nightlife venue branding",
    "luxury brand direction",
    "luxury lifestyle branding",
    "fashion brand identity studio",
    "perfume brand direction",
    "architecture studio website design",
    "architecture brand identity",
    "wellness brand identity",
    "music artist visual identity",
    "album visual direction",
    "tour visual direction",
    "cultural brand direction",
    "digital-native brand identity",
    // Spanish — core commercial terms
    "agencia de dirección creativa",
    "estudio de dirección creativa",
    "dirección creativa para marcas premium",
    "agencia de IA",
    "agencia de contenido IA",
    "empresas de contenido IA",
    "automatización de procesos",
    "automatización con IA",
    "estudio creativo con IA",
    "dirección creativa con IA",
    "branding premium",
    "agencia de branding",
    "mejora de branding",
    "rebranding premium",
    "agencia de diseño web",
    "diseño web premium",
    "diseño web cinematográfico",
    "diseño web de lujo",
    "agencia SEO",
    "SEO premium",
    "consultoría SEO",
    "optimización de conversión",
    "sistemas de campaña",
    "worldbuilding de marca",
    "identidad visual premium",
    "atmósfera digital",
    "estudio de atmósfera digital",
    // Sectores
    "branding para hostelería",
    "diseño web para hoteles",
    "identidad para restaurantes",
    "branding para vida nocturna",
    "identidad de marca de lujo",
    "branding para moda",
    "dirección visual de perfumes",
    "branding para arquitectura",
    "identidad visual para artistas",
    "dirección de álbum",
    "branding cultural",
    // Brand
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
  // Declared as both Organization and ProfessionalService so Google
  // attaches the entity to local-business carousels while still
  // ranking it as a brand. The `additionalType` flags the AI specialty.
  "@type": ["Organization", "ProfessionalService"],
  additionalType: ["https://schema.org/CreativeWork", "https://schema.org/SoftwareApplication"],
  name: "XNLAB",
  legalName: "Xnlab Studio",
  alternateName: ["Xnlab Studio", "XNLAB Studio", "Xnlab"],
  url: SITE,
  description: DESCRIPTION,
  email: "studio@xnlab.io",
  foundingDate: "2023-01-01",
  areaServed: "Worldwide",
  serviceArea: { "@type": "Place", name: "Worldwide" },
  slogan: "Creative direction and AI studio for premium brands.",
  knowsAbout: [
    // Core practice
    "Creative direction",
    "Art direction",
    "Worldbuilding",
    "Atmosphere design",
    "Brand identity systems",
    "Visual identity direction",
    "Campaign direction",
    "Cinematic web design",
    "Premium web design",
    "Web design and development",
    "Next.js web development",
    "User experience design",
    "Motion design",
    "Editorial design",
    // AI capabilities
    "AI creative direction",
    "AI-assisted brand direction",
    "AI content production",
    "AI image generation for brands",
    "AI workflow automation",
    "Process automation",
    "Generative aesthetics",
    "AI-native visual identity",
    // SEO and growth
    "Technical SEO",
    "Search engine optimization",
    "Structured data and schema markup",
    "Conversion rate optimization",
    "Performance optimization",
    "Web analytics direction",
    // Sectors
    "Hospitality brand direction",
    "Boutique hotel branding",
    "Restaurant identity systems",
    "Nightlife and cultural events branding",
    "Nightclub visual identity",
    "Luxury lifestyle brand direction",
    "Fashion brand identity",
    "Perfume and beauty direction",
    "Architecture and spatial design",
    "Architectural brand systems",
    "Wellness brand direction",
    "Music and cultural artists",
    "Artist visual identity",
    "Album direction",
    "Cultural and digital worlds",
    "Digital-native brand identity",
    "AI-native cultural brands",
  ],
  knowsLanguage: ["en", "es"],
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
    // Cross-cutting capability services. These match the search
    // intents around AI agency, creative direction agency, SEO agency,
    // web design agency, automation. Same studio, different doorway.
    {
      "@type": "Service",
      name: "Creative Direction",
      serviceType: "Creative direction agency for premium brands",
      description:
        "Creative direction for brands that already convert and need the next level. Atmosphere, palette, motion language, copy register and campaign direction, produced as one decision instead of a folder of options. Agencia de dirección creativa para marcas premium.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Founders, marketing directors, brand owners" },
      url: `${SITE}/services`,
    },
    {
      "@type": "Service",
      name: "AI Creative Direction and AI Content",
      serviceType: "AI agency for brand content and visual direction",
      description:
        "AI-native visual direction and AI content production for premium brands. Image generation, motion, asset extension and generative aesthetics governed by human creative direction. Agencia de IA y contenido IA. AI studio for brand image, motion and editorial output.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Brand teams, founders, cultural producers" },
      url: `${SITE}/services/visual-engine`,
    },
    {
      "@type": "Service",
      name: "Process Automation for Brand Operations",
      serviceType: "AI workflow and process automation studio",
      description:
        "AI workflow automation for content production, campaign assembly and brand operations. Automatización de procesos con IA para marcas. Reduces manual production load without diluting the creative direction above it.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Operations leads, marketing directors" },
      url: `${SITE}/services/visual-engine`,
    },
    {
      "@type": "Service",
      name: "Branding Upgrade and Rebranding",
      serviceType: "Brand identity upgrade for established premium brands",
      description:
        "Targeted brand upgrade for companies that already operate at a high level and want their image to match. Identity, typography, motion language, copy, surfaces and atmospheric direction. Mejora de branding y rebranding premium.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Established premium brands seeking the next layer" },
      url: `${SITE}/services/perception-upgrade-sprint`,
    },
    {
      "@type": "Service",
      name: "Premium Web Design and Development",
      serviceType: "Cinematic web design and Next.js development studio",
      description:
        "Cinematic, single-page and multi-page websites for premium brands. Direction, motion language, copy, structured data and Next.js build. Agencia de diseño web premium para marcas que ya operan a alto nivel.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Hospitality, luxury, architecture, music, cultural brands" },
      url: `${SITE}/services/digital-atmosphere`,
    },
    {
      "@type": "Service",
      name: "Technical SEO and Conversion Optimisation",
      serviceType: "SEO agency for premium brands and cultural companies",
      description:
        "Technical SEO, structured data, analytics, conversion clarity and accessibility tuning. Agencia SEO premium para marcas y compañías culturales que ya tienen sitio y quieren rendir como tal.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Brands with existing websites that need to perform" },
      url: `${SITE}/services/seo-conversion-layer`,
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
        <div id="main">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
