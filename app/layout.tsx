import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { DustStyles } from "./_lib/atoms";
import { ScrollProgress, FilmGrain } from "./_lib/chrome";
import { BackToTop } from "./_lib/back-to-top";
import { Analytics } from "@vercel/analytics/next";
import { getNonce } from "./_lib/csp";
import { AmbientBackdrop } from "./_lib/ambient-backdrop";
import { LoadingSplash } from "./_lib/loading-splash";
import { PageVeil } from "./_lib/page-veil";

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
// TITLE carries the canonical spelling plus the spaced and acronym
// variants people actually type when they remember the name partially
// ("xn lab", "xn studio", "xnl"). Google indexes title text aggressively
// for brand queries, so seating the variants here is the single
// highest-leverage hook for variant ranking.
const TITLE = "XNLAB — Atmosphere Systems for Brands, Customers and Channels.";
// DESCRIPTION value-first. The commercial promise lands inside Google's
// ~155-160 char SERP truncation. Brand-name variants stay indexable but
// move to the tail so they don't eat the first impression.
const DESCRIPTION =
  "Atmosphere systems across the six surfaces a modern brand reaches its customer through — product, owned digital, retail, customer operations, communication, community. By appointment. (XNLAB · XN Lab · XN Studio · XNL.)";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · XNLAB" },
  description: DESCRIPTION,
  applicationName: "Xnlab Studio",
  generator: "Next.js",
  keywords: [
    // Brand name and every variant people actually search for. These
    // sit first because brand queries are the most direct purchase
    // intent we receive, and the studio's name is unusual enough that
    // typing variants are common ("xn lab" with a space, "x n lab",
    // "xn studio", "xnl", and the phonetic mis-hear "x en la app" /
    // "x en lab" / "xen lab").
    "XNLAB",
    "XN Lab",
    "XN-Lab",
    "Xn lab",
    "x n lab",
    "Xnlab",
    "Xnlab Studio",
    "XN Studio",
    "XNL",
    "XN Lab Studio",
    "x en la app",
    "x en lab",
    "xen lab",
    "xnlab atmosphere systems",
    "xnlab brand studio",
    "xn studio Marbella",
    // Core territory — atmosphere systems across brand surfaces
    "atmosphere systems",
    "atmosphere systems for brands",
    "brand atmosphere design",
    "brand atmosphere studio",
    "brand creative direction",
    "brand worldbuilding",
    "brand perception audit",
    "experiential brand identity",
    "cultural presence for brands",
    "brand digital amplification",
    "brand-customer-channel design",
    // Surface verticals — the six XNLAB worlds
    "product atmosphere design",
    "product brand systems",
    "product launch direction",
    "owned digital atmosphere",
    "dashboard and account UX direction",
    "retail and physical brand atmosphere",
    "flagship store atmosphere design",
    "pop-up and event identity",
    "customer operations brand direction",
    "support voice and tone direction",
    "onboarding sequence design",
    "communication atmosphere systems",
    "editorial direction across paid owned earned",
    "community and culture programming",
    "brand worldbuilding across partners and territories",
    // Applied vertical — kept so legacy hospitality searches still land here
    "hospitality atmosphere design (applied)",
    "luxury hospitality creative direction (applied)",
    // Spanish — brand core
    "sistemas de atmósfera",
    "sistemas de atmósfera de marca",
    "dirección creativa de marca",
    "branding premium",
    "atmósfera de producto",
    "diseño de atmósfera para producto",
    "atmósfera digital propia",
    "identidad para retail y físico",
    "operaciones de cliente y voz de servicio",
    "comunicación de marca",
    "programación de comunidad y cultura",
    "brand worldbuilding",
    "auditoría de percepción de marca",
    "estudio de atmósfera",
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
  // Every name variant the brand answers to. Google uses
  // `alternateName` to map mis-typed brand queries (with spaces,
  // dashes, phonetic mis-hears) back to the same entity, so the
  // Knowledge Panel and brand SERP serve XNLAB for "xn lab", "xn
  // studio", "xnl", "xen lab", etc.
  alternateName: [
    "XN Lab",
    "XN-Lab",
    "Xn lab",
    "X N Lab",
    "Xnlab",
    "Xnlab Studio",
    "XN Studio",
    "XNL",
    "XN Lab Studio",
    "x en la app",
    "xen lab",
    "x en lab",
  ],
  url: SITE,
  description: DESCRIPTION,
  email: "studio@xnlab.io",
  foundingDate: "2022-01-01",
  areaServed: "Worldwide",
  serviceArea: { "@type": "Place", name: "Worldwide" },
  slogan: "Atmosphere systems for brands, customers and channels.",
  // Image + logo give Google an entity card without us needing a
  // Knowledge Panel. Logo is required for the "publisher" slot in
  // article / news rich results; the hero chrome image gives the
  // brand image carousel something to use.
  logo: {
    "@type": "ImageObject",
    url: `${SITE}/icon`,
    width: 512,
    height: 512,
  },
  image: `${SITE}/images/01_hero_chrome.jpg`,
  // Premium positioning hint for ProfessionalService listings.
  // Four-symbol scale is the schema convention for "luxury".
  priceRange: "$$$$",
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "studio@xnlab.io",
      contactType: "client enquiries",
      areaServed: "Worldwide",
      availableLanguage: ["English", "Spanish"],
    },
  ],
  knowsAbout: [
    // The territory — atmosphere systems across brand surfaces
    "Atmosphere systems",
    "Atmosphere systems for brands",
    "Brand atmosphere design",
    "Brand creative direction",
    "Brand worldbuilding",
    "Brand perception audit",
    "Experiential brand identity",
    "Cultural presence for brands",
    "Brand digital amplification",
    "Perception engineering",
    "Cultural positioning",
    "Atmosphere deployment",
    "Identity reconstruction",
    "Emotional architecture",
    "Cinematic brand systems",
    // Practice surfaces — the six XNLAB worlds
    "Product brand systems",
    "Owned digital atmosphere",
    "Retail and physical brand atmosphere",
    "Customer operations brand direction",
    "Communication atmosphere systems",
    "Community and culture programming",
    // Generic discipline tags
    "Brand identity systems",
    "Visual identity direction",
    "Editorial design",
    "Motion identity",
    "Web design and development",
    "Next.js web development",
    // Applied verticals — kept for legacy search continuity
    "Hospitality atmosphere systems (applied vertical)",
    "Boutique hotel brand direction (applied)",
    "Restaurant identity systems (applied)",
    "Cultural hospitality (applied)",
    // SEO and growth
    "Technical SEO",
    "Search engine optimization",
    "Structured data and schema markup",
    "Conversion rate optimization",
    "Performance optimization",
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
      name: "Product",
      serviceType: "Product atmosphere systems",
      description:
        "Atmosphere systems for the product itself — app, hardware, software. First-launch direction, loading micro-motion, empty-state voice and cross-surface consistency between product, account and brand.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Product, design and brand leaders at scale" },
      url: `${SITE}/worlds/product`,
    },
    {
      "@type": "Service",
      name: "Owned Digital",
      serviceType: "Owned digital atmosphere systems",
      description:
        "Atmosphere systems for the brand's own surfaces — web, marketing site, account, dashboard. Editorial tempo across owned media. Considered reading, patient return.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Heads of brand, marketing and digital" },
      url: `${SITE}/worlds/owned-digital`,
    },
    {
      "@type": "Service",
      name: "Retail & Physical",
      serviceType: "Retail and physical atmosphere systems",
      description:
        "Flagship and retail atmosphere — threshold, light, material, sound. Pop-up, kiosk, branch and event identity engineered to ship and recompose. Service choreography across the floor.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Heads of retail, store design and experiential marketing" },
      url: `${SITE}/worlds/retail-physical`,
    },
    {
      "@type": "Service",
      name: "Customer Operations",
      serviceType: "Customer operations atmosphere systems",
      description:
        "Atmosphere systems for onboarding, support and post-sale. Templates rewritten in the studio voice, response tempo calibrated, tone of the apology rehearsed.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Heads of customer experience, support and operations" },
      url: `${SITE}/worlds/customer-operations`,
    },
    {
      "@type": "Service",
      name: "Communication",
      serviceType: "Communication atmosphere systems",
      description:
        "Editorial direction across paid, owned and earned. Campaign direction, motion register, voice and tempo. PR atmosphere — the materials a journalist actually wants to open.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "CMOs, heads of marketing and communications" },
      url: `${SITE}/worlds/communication`,
    },
    {
      "@type": "Service",
      name: "Community & Culture",
      serviceType: "Community and culture atmosphere systems",
      description:
        "Cultural programming — partnerships, residencies, publishing, content programs. Community architecture. Brand worldbuilding across territories, languages and partners.",
      provider: { "@type": "Organization", name: "XNLAB", url: SITE },
      areaServed: "Worldwide",
      audience: { "@type": "Audience", audienceType: "Brand directors, programme leads and cultural strategists" },
      url: `${SITE}/worlds/community-culture`,
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CSP nonce per request — minted by proxy.ts, read here and
  // forwarded onto every inline <script> we emit so a strict policy
  // can drop 'unsafe-inline' without breaking JSON-LD.
  const nonce = await getNonce();
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} style={{background:"#060606"}} suppressHydrationWarning>
      <body style={{margin:0,padding:0,background:"#060606",overflowX:"hidden"}} suppressHydrationWarning>
        {/* Disable the browser's automatic scroll restoration before
            ANY other client code runs. The script is the first child
            of <body>, so the parser executes it synchronously during
            initial HTML parse — before React hydrates, before the
            browser would normally restore the prior scroll position
            on reload. Paired with PageVeil's scrollTo(0,0), this
            guarantees every reload lands at the top of the page
            without the visitor seeing the previous scroll position
            flash before the snap. CSP nonce forwarded so a strict
            policy can drop 'unsafe-inline'. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: "if('scrollRestoration' in history)history.scrollRestoration='manual';",
          }}
        />
        {/* PageVeil — global dark mask covering the first paint of
            every fresh page load. Mounted before the rest of the body
            so its SSR'd opacity:1 surface is the first thing the
            browser paints, hiding font swaps, hydration flickers and
            scroll snaps under one composed reveal. Internal Link
            navigation does NOT remount the layout, so the veil stays
            invisible after the first reveal. */}
        <PageVeil />
        {/* JSON-LD blocks carry a per-request CSP nonce. The browser
            strips the nonce attribute value off <script> tags once
            CSP has validated them — by the time React hydrates, the
            DOM reads nonce="" while the server rendered nonce="abc…",
            producing a hydration mismatch warning on every page load.
            suppressHydrationWarning is the documented React fix for
            this exact case: the script content is identical between
            server and client, only the post-CSP nonce attribute
            differs, and React should not try to reconcile it. */}
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
          suppressHydrationWarning
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
          suppressHydrationWarning
        />
        <a href="#main" className="xn-skip">Skip to content</a>
        <DustStyles />
        <AmbientBackdrop />
        <FilmGrain />
        <ScrollProgress />
        <BackToTop />
        <div id="main" style={{ position: "relative", zIndex: 1 }}>{children}</div>
        {/* First-visit splash — particle burst overture. Mounts after
            the page, gated by sessionStorage so it fires once per
            session and never on internal navigation. Returns null on
            prefers-reduced-motion. */}
        <LoadingSplash />
        <Analytics />
      </body>
    </html>
  );
}
