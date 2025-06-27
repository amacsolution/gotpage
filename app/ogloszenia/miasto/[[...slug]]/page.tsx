import type { Metadata } from "next"
import CityPageClient from "./CityPageClient"
import { unstable_cache } from "next/cache"

// Cache the metadata generation for 2 days
const getCachedCityMetadata = unstable_cache(
  async (params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined }) => {
    const slug = params?.slug || []
    const query = (searchParams?.q as string) || ""

    // Parse URL parameters
    const city = slug[0] ? decodeURIComponent(slug[0]) : ""

    if (!city) {
      return {
        title: "Ogłoszenia według miasta",
        description: "Przeglądaj ogłoszenia według lokalizacji w całej Polsce.",
      }
    }

    // Build title
    const title = `Ogłoszenia w ${city} | Darmowe ogłoszenia lokalne`

    // Build description
    let description = `Znajdź najlepsze ogłoszenia w ${city}. `
    if (query) {
      description += `Szukaj "${query}" w ${city}. `
    }
    description += `Przeglądaj tysiące lokalnych ofert od mieszkańców ${city}. Kupuj i sprzedawaj w swojej okolicy.`

    // Build keywords
    const keywords = [
      `ogłoszenia ${city}`,
      `sprzedam ${city}`,
      `kupię ${city}`,
      `oferty ${city}`,
      `darmowe ogłoszenia ${city}`,
      `ogłoszenia drobne ${city}`,
      `lokalny rynek ${city}`,
      city,
      "ogłoszenia",
      "sprzedam",
      "kupię",
    ].join(", ")

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gotpage.pl"
    let canonicalUrl = `${baseUrl}/ogloszenia/miasto/${encodeURIComponent(city)}`

    if (query) {
      canonicalUrl += `?q=${encodeURIComponent(query)}`
    }

    return {
      title,
      description,
      keywords,
      authors: [{ name: "Ogłoszenia" }],
      creator: "Ogłoszenia",
      publisher: "Ogłoszenia",
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
        siteName: "Ogłoszenia",
        images: [
          {
            url: `${baseUrl}/logo.png`,
            width: 1200,
            height: 630,
            alt: `Ogłoszenia w ${city}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${baseUrl}/logo.png`],
        creator: "@ogloszenia",
      },
      other: {
        "og:image:alt": `Ogłoszenia w ${city}`,
        "twitter:image:alt": `Ogłoszenia w ${city}`,
        "geo.region": "PL",
        "geo.placename": city,
      },
    }
  },
  ["city-metadata"],
  {
    revalidate: 172800, // 2 days
    tags: ["metadata", "city"],
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
  return getCachedCityMetadata(params, searchParams)
}

// Enable static generation with revalidation
export const revalidate = 172800 // 2 days

export default function CityPage() {
  return <CityPageClient />
}
