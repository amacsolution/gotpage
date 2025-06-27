import AdsPageClient from "./AdsClientPage"
import type { Metadata } from "next"
import { unstable_cache } from "next/cache"

// Cache the metadata generation for 2 days
const getCachedAdsMetadata = unstable_cache(
  async (searchParams: { [key: string]: string | string[] | undefined }) => {
    const query = (searchParams?.q as string) || ""
    const sortBy = (searchParams?.sortBy as string) || "newest"

    // Build title
    let title = "Darmowe ogłoszenia"
    if (query) {
      title = `"${query}" - Wyniki wyszukiwania ogłoszeń`
    }
    title += " | Kupuj i sprzedawaj online"

    // Build description
    let description = "Największy serwis darmowych ogłoszeń w Polsce. "
    if (query) {
      description += `Znajdź "${query}" wśród tysięcy ofert. `
    }
    description +=
      "Przeglądaj kategorie: motoryzacja, elektronika, nieruchomości, moda i wiele więcej. Dodaj swoje ogłoszenie za darmo!"

    // Build keywords
    const keywords = [
      "darmowe ogłoszenia",
      "ogłoszenia drobne",
      "sprzedam",
      "kupię",
      "oferty",
      "motoryzacja",
      "elektronika",
      "nieruchomości",
      "moda",
      "dom i ogród",
      query,
    ]
      .filter(Boolean)
      .join(", ")

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gotpage.pl"
    let canonicalUrl = `${baseUrl}/ogloszenia`

    const searchParamsObj = new URLSearchParams()
    if (query) searchParamsObj.set("q", query)
    if (sortBy !== "newest") searchParamsObj.set("sortBy", sortBy)

    const queryString = searchParamsObj.toString()
    if (queryString) canonicalUrl += `?${queryString}`

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
            alt: "Darmowe ogłoszenia - kupuj i sprzedawaj online",
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
        "og:image:alt": "Darmowe ogłoszenia - kupuj i sprzedawaj online",
        "twitter:image:alt": "Darmowe ogłoszenia - kupuj i sprzedawaj online",
      },
    }
  },
  ["ads-metadata"],
  {
    revalidate: 172800, // 2 days
    tags: ["metadata", "ads"],
  },
)

export async function generateMetadata(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return getCachedAdsMetadata(searchParams)
}

// Enable static generation with revalidation
export const revalidate = 172800 // 2 days

export default function AdsPage() {
  return <AdsPageClient />
}
