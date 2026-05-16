import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "./_service-detail";
import { serviceDetails, getServiceDetail } from "../../_lib/service-details";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return serviceDetails.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) return { title: "System not found · XNLAB" };
  const title = `${service.title.en} — XNLAB Digital Atmosphere Studio`;
  const description = service.tagline.en;
  return {
    title,
    description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: `${service.title.en} · XNLAB`,
      description,
      url: `https://xnlab.io/services/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title.en} · XNLAB`,
      description,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) notFound();

  // Service + Breadcrumb JSON-LD. Service helps search engines parse the
  // offer; BreadcrumbList helps Google build the rich-result trail.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title.en,
        serviceType: service.tagline.en,
        description: service.lead.en,
        provider: {
          "@type": "Organization",
          name: "XNLAB",
          url: "https://xnlab.io",
        },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: service.audience.en },
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/LimitedAvailability",
          availabilityStarts: "2026-01-01",
          url: "https://xnlab.io/contact",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://xnlab.io/services/${service.slug}`,
        },
        inLanguage: ["en", "es"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://xnlab.io" },
          { "@type": "ListItem", position: 2, name: "Systems", item: "https://xnlab.io/services" },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title.en,
            item: `https://xnlab.io/services/${service.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailPage service={service} />
    </>
  );
}
