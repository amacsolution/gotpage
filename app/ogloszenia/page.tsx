import type { Metadata } from "next"
import AdsPageClient from "./AdsClientPage"

// Dodajemy metadane dla SEO
export const metadata: Metadata = {
  title: "Przeglądaj ogłoszenia | Gotpage",
  description:
    "Przeglądaj najnowsze ogłoszenia w różnych kategoriach. Filtruj według ceny, lokalizacji i innych parametrów.",
  keywords: "ogłoszenia, przeglądanie ogłoszeń, filtrowanie, kategorie, gotpage",
  openGraph: {
    title: "Przeglądaj ogłoszenia | Gotpage",
    description:
      "Przeglądaj najnowsze ogłoszenia w różnych kategoriach. Filtruj według ceny, lokalizacji i innych parametrów.",
    images: [
      {
        url: "/og-image-ads.jpg",
        width: 1200,
        height: 630,
        alt: "Przeglądaj ogłoszenia na Gotpage",
      },
    ],
    type: "website",
  },
}

export default function AdsPage() {
  return <AdsPageClient />
}

