import type { Metadata } from "next"
import CompanyCityPageClient from "./CompanyCityClient"
import { unstable_cache } from "next/cache"

// Cache the metadata generation for 2 days
const getCachedCompanyCityMetadata = unstable_cache(
  async (params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined }) => {
    const slug = params?.slug || []
    const query = (searchParams?.q as string) || ""

    // Parse URL parameters
    const city = slug[0] ? decodeURIComponent(slug[0]) : ""

    if (!city) {
      return {
        title: "Firmy według miasta",
        description: "Przeglądaj firmy według lokalizacji w całej Polsce.",
      }
    }

    // Build title
    const title = `Firmy w ${city} | Katalog firm lokalnych`

    // Build description
    let description = `Znajdź najlepsze firmy w ${city}. `
    if (query) {
      description += `Szukaj "${query}" w ${city}. `
    }
    description += `Przeglądaj tysiące lokalnych firm w ${city}. Sprawdź opinie, oceny i kontaktuj się z zaufanymi usługodawcami.`

    // Build keywords
    const keywords = [
      `firmy ${city}`,
      `katalog firm ${city}`,
      `usługodawcy ${city}`,
      `lokalne firmy ${city}`,
      `opinie firm ${city}`,
      `zaufane firmy ${city}`,
      city,
      "firmy",
      "katalog firm",
      "usługodawcy",
    ].join(", ")

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gotpage.pl"
    let canonicalUrl = `${baseUrl}/firmy/miasto/${encodeURIComponent(city)}`

    if (query) {
      canonicalUrl += `?q=${encodeURIComponent(query)}`
    }

    return {
      title,
      description,
      keywords,
      authors: [{ name: "Katalog Firm" }],
      creator: "Katalog Firm",
      publisher: "Katalog Firm",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "website",
        locale: "pl_PL",
        url: canonicalUrl,
        title,
        description,
        siteName: "Katalog Firm",
        images: [
          {
            url: `${baseUrl}/og-image-companies.jpg`,
            width: 1200,
            height: 630,
            alt: `Firmy w ${city}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${baseUrl}/og-image-companies.jpg`],
        creator: "@katalogfirm",
      },
      other: {
        "og:image:alt": `Firmy w ${city}`,
        "twitter:image:alt": `Firmy w ${city}`,
        "geo.region": "PL",
        "geo.placename": city,
      },
    }
  },
  ["company-city-metadata"],
  {
    revalidate: 172800, // 2 days
    tags: ["metadata", "company-city"],
  },
)

export async function generateMetadata(
  props: {
    params: Promise<{ slug?: string[] }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return getCachedCompanyCityMetadata(params, searchParams)
}

// Enable static generation with revalidation
export const revalidate = 172800 // 2 days

export default function CompanyCityPage() {
  return <CompanyCityPageClient />
}
