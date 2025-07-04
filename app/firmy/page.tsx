import CompaniesPageClient from "./CompaniesClientPage"
import type { Metadata } from "next"
import { unstable_cache } from "next/cache"

// Cache the metadata generation for 2 days
const getCachedCompaniesMetadata = unstable_cache(
  async (searchParams: { [key: string]: string | string[] | undefined }) => {
    const query = (searchParams?.q as string) || ""
    const sortBy = (searchParams?.sortBy as string) || "rating"

    // Build title
    let title = "Katalog Firm - Znajdź zaufane firmy i usługodawców"
    if (query) {
      title = `"${query}" - Wyniki wyszukiwania firm`
    }
    title += " | Firmy"

    // Build description
    let description = "Największy katalog firm w Polsce. "
    if (query) {
      description += `Znajdź "${query}" wśród tysięcy zaufanych firm. `
    }
    description +=
      "Przeglądaj kategorie: sklepy, usługi, restauracje, finanse i wiele więcej. Sprawdź opinie i oceny klientów!"

    // Build keywords
    const keywords = [
      "katalog firm",
      "firmy",
      "usługodawcy",
      "sklepy",
      "restauracje",
      "usługi",
      "opinie firm",
      "oceny firm",
      "zaufane firmy",
      query,
    ]
      .filter(Boolean)
      .join(", ")

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gotpage.pl"
    let canonicalUrl = `${baseUrl}/firmy`

    const searchParamsObj = new URLSearchParams()
    if (query) searchParamsObj.set("q", query)
    if (sortBy !== "rating") searchParamsObj.set("sortBy", sortBy)

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
            alt: "Katalog Firm - znajdź zaufane firmy",
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
        "og:image:alt": "Katalog Firm - znajdź zaufane firmy",
        "twitter:image:alt": "Katalog Firm - znajdź zaufane firmy",
      },
    }
  },
  ["companies-metadata"],
  {
    revalidate: 172800, // 2 days
    tags: ["metadata", "companies"],
  },
)

export async function generateMetadata(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return getCachedCompaniesMetadata(searchParams)
}

// Enable static generation with revalidation
export const revalidate = 172800 // 2 days

export default function CompaniesPage() {
  return <CompaniesPageClient />
}
