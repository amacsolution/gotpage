import type { Metadata } from "next"
import CompaniesClientPage from "./CompaniesClientPage"

// Dodajemy metadane dla SEO
export const metadata: Metadata = {
  title: "Katalog firm | Gotpage",
  description: "Przeglądaj katalog firm i usługodawców. Znajdź zaufanych partnerów biznesowych w Twojej okolicy.",
  keywords: "firmy, katalog firm, usługodawcy, biznes, gotpage",
  openGraph: {
    title: "Katalog firm | Gotpage",
    description: "Przeglądaj katalog firm i usługodawców. Znajdź zaufanych partnerów biznesowych w Twojej okolicy.",
    images: [
      {
        url: "/og-image-companies.jpg",
        width: 1200,
        height: 630,
        alt: "Katalog firm na Gotpage",
      },
    ],
    type: "website",
  },
}

export default function CompaniesPage() {
  return <CompaniesClientPage />
}

