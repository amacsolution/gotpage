import type { Metadata } from "next"
import SearchPageClient from "./SearchClientPage"
import { unstable_cache } from "next/cache"

// Cache the metadata generation for 2 days
const getCachedMetadata = unstable_cache(
  async (params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined }) => {
    const slug = params?.slug || []
    const query = (searchParams?.q as string) || ""
    const city = (searchParams?.city as string) || ""
    const min = (searchParams?.min as string) || ""
    const max = (searchParams?.max as string) || ""

     const decode = (str: string) => decodeURIComponent(str).replace(/--/g, '/')
    // Parse URL parameters
    const category = slug[0] ? decode(slug[0]) : ""
    const subcategory = slug[1] ? decode(slug[1]) : ""
    const finalcategory = slug[2] ? decode(slug[2]) : ""

    // Build title
    let title = "Szukaj ogłoszeń"
    if (category) {
      title = category
      if (subcategory) {
        title += ` - ${subcategory}`
        if (finalcategory) {
          title += ` - ${finalcategory}`
        }
      }
    }

    if (city) {
      title += ` w ${city}`
    }

    title += " | Ogłoszenia"

    // Build description
    let description = "Znajdź najlepsze ogłoszenia"
    if (category) {
      description += ` w kategorii ${category}`
      if (subcategory) {
        description += ` - ${subcategory}`
      }
    }
    if (city) {
      description += ` w ${city}`
    }
    if (min || max) {
      description += ` w cenie od ${min || "0"} do ${max || "∞"} zł`
    }
    description += ". Przeglądaj tysiące ofert od prywatnych sprzedawców i firm."

    // Build keywords
    const keywords = [
      "ogłoszenia",
      "sprzedam",
      "kupię",
      "oferty",
      category,
      subcategory,
      finalcategory,
      city,
      "darmowe ogłoszenia",
      "ogłoszenia drobne",
    ]
      .filter(Boolean)
      .join(", ")

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gotpage.pl"
    let canonicalUrl = `${baseUrl}/ogloszenia/szukaj`
    if (category) canonicalUrl += `/${encodeURIComponent(category)}`
    if (subcategory) canonicalUrl += `/${encodeURIComponent(subcategory)}`
    if (finalcategory) canonicalUrl += `/${encodeURIComponent(finalcategory)}`

    const searchParamsObj = new URLSearchParams()
    if (city) searchParamsObj.set("city", city)
    if (min) searchParamsObj.set("min", min)
    if (max) searchParamsObj.set("max", max)
    if (query) searchParamsObj.set("q", query)

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
          "max-image-preview": "large" as "large",
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
            alt: title,
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
        "og:image:alt": title,
        "twitter:image:alt": title,
      },
    }
  },
  ["search-metadata"],
  {
    revalidate: 172800, // 2 days
    tags: ["metadata", "search"],
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
  return getCachedMetadata(params, searchParams)
}

// Enable static generation with revalidation
export const revalidate = 172800 // 2 days

export default function SearchPage() {
  return <SearchPageClient />
}
