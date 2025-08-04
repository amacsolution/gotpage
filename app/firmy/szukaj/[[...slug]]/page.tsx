import type { Metadata } from "next"
import CompanySearchPageClient from "./CompanySearchClient"
import { unstable_cache } from "next/cache"

// Cache the metadata generation for 2 days
const getCachedCompanySearchMetadata = unstable_cache(
  async (params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined }) => {
    const slug = params?.slug || []
    const query = (searchParams?.q as string) || ""
    const city = (searchParams?.city as string) || ""

    const decode = (str: string) => decodeURIComponent(str).replace(/--/g, '/')


    // Parse URL parameters
    const category = slug[0] ? decode(slug[0]) : ""

    // Build title
    let title = "Szukaj firm"
    if (category) {
      title = `${category} - Firmy`
    }

    if (city) {
      title += ` w ${city}`
    }

    title += " | Katalog Firm"

    // Build description
    let description = "Znajdź najlepsze firmy"
    if (category) {
      description += ` w kategorii ${category}`
    }
    if (city) {
      description += ` w ${city}`
    }
    description += ". Przeglądaj opinie, sprawdź oceny i kontaktuj się z zaufanymi usługodawcami."

    // Build keywords
    const keywords = [
      "firmy",
      "katalog firm",
      "usługodawcy",
      "opinie firm",
      "oceny firm",
      category,
      city,
      "zaufane firmy",
      "lokalne firmy",
    ]
      .filter(Boolean)
      .join(", ")

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gotpage.pl"
    let canonicalUrl = `${baseUrl}/firmy/szukaj`
    if (category) canonicalUrl += `/${encodeURIComponent(category)}`

    const searchParamsObj = new URLSearchParams()
    if (city) searchParamsObj.set("city", city)
    if (query) searchParamsObj.set("q", query)

    const queryString = searchParamsObj.toString()
    if (queryString) canonicalUrl += `?${queryString}`

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
            alt: title,
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
        "og:image:alt": title,
        "twitter:image:alt": title,
      },
    }
  },
  ["company-search-metadata"],
  {
    revalidate: 172800, // 2 days
    tags: ["metadata", "company-search"],
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
  return getCachedCompanySearchMetadata(params, searchParams)
}

// Enable static generation with revalidation
export const revalidate = 172800 // 2 days

export default function CompanySearchPage() {
  return <CompanySearchPageClient />
}
