import type { Metadata } from "next";
import Hospitality from "./_hospitality";
import { getNonce } from "../_lib/csp";

const SITE = "https://xnlab.io";

export const metadata: Metadata = {
  title: "Hospitality vertical — XNLAB",
  description:
    "Atmosphere systems for modern hospitality. Hotels, restaurants, nightlife, wellness, cultural and immersive venues — directed as one operating system so the room a guest enters and the room they read about online become the same room.",
  alternates: { canonical: "/hospitality" },
  openGraph: {
    title: "Hospitality vertical · XNLAB",
    description:
      "Six rooms of modern hospitality, directed as one studio. Atmosphere systems that turn a venue into a cultural destination.",
    url: `${SITE}/hospitality`,
    type: "article",
  },
};

export default async function Page() {
  // JSON-LD for the hospitality applied vertical. Reuses the brand
  // entity (no second Organization) and registers each of the six
  // rooms as a Service with audienceType — so a hospitality founder
  // searching "boutique hotel atmosphere direction" lands here and
  // Google has a structured service entity to display.
  const nonce = await getNonce();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Hotel & Resort Atmosphere Direction",
        serviceType: "Atmosphere systems for hotels and resorts",
        description:
          "Threshold, lobby, corridor, room and terrace directed as a single sequence of atmospheres. Opening direction and pre-launch atmosphere calibration.",
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: "Boutique hotel and resort founders" },
        url: `${SITE}/hospitality#hotels`,
      },
      {
        "@type": "Service",
        name: "Restaurant & Bar Atmosphere Direction",
        serviceType: "Atmosphere systems for restaurants and cocktail bars",
        description:
          "Light, sound, ceramic, mirror, motion and pace directed so the first sightline does the work before the first dish arrives.",
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: "Restaurant and cocktail bar operators" },
        url: `${SITE}/hospitality#restaurants`,
      },
      {
        "@type": "Service",
        name: "Nightlife Atmosphere Direction",
        serviceType: "Atmosphere systems for nightlife venues",
        description:
          "Door, light cue, motion register and sound floor engineered for the seven-hour arc of a venue that has to hold attention from nine to four.",
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: "Nightclub and late venue operators" },
        url: `${SITE}/hospitality#nightlife`,
      },
      {
        "@type": "Service",
        name: "Wellness Destination Atmosphere",
        serviceType: "Atmosphere systems for spas, retreats and wellness destinations",
        description:
          "Atmosphere as the primary service. Light filtered, sound dampened, sequence designed around what the room takes away from the guest.",
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: "Spa, retreat and wellness destination founders" },
        url: `${SITE}/hospitality#wellness`,
      },
      {
        "@type": "Service",
        name: "Cultural Hospitality Direction",
        serviceType: "Atmosphere systems for museum cafes, gallery dining, library bars",
        description:
          "Hospitality adjacent to the work. Materials, pacing and gestural restraint that serve an institution without competing with it.",
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: "Cultural institutions and adjacent hospitality" },
        url: `${SITE}/hospitality#cultural`,
      },
      {
        "@type": "Service",
        name: "Immersive & Experiential Hospitality",
        serviceType: "Atmosphere systems for pop-ups, residencies and traveling concepts",
        description:
          "Identity engineered with a fixed core and a refractive surface. The concept reads as native in seven cities it has never visited.",
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: "Pop-up, residency and experiential hospitality founders" },
        url: `${SITE}/hospitality#immersive`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Hospitality", item: `${SITE}/hospitality` },
        ],
      },
    ],
  };
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
      <Hospitality />
    </>
  );
}
