import type { Metadata, ResolvingMetadata } from "next"
import AdDetailsClient from "./ads-detailed"
import { use } from "react"

// Generowanie dynamicznych metadanych dla pojedynczego ogłoszenia
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Próba pobrania danych ogłoszenia
  let ad = null

  const { id } = await params

  const fetchAd = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ads/${id}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      ad = data

    } catch (error) {
      console.error("Błąd podczas pobierania ogłoszenia:", error)
    } 
  }

    fetchAd()

  // Jeśli nie udało się pobrać danych, użyj domyślnych wartości
  if (!ad) {
    ad = {
      title: "Ogłoszenie",
      content: "Szczegóły ogłoszenia",
      category: "Kategoria",
      price: 0,
      currency: "PLN",
      images: ["/placeholder.svg?height=600&width=800"],
    }
  }

  const title = `${ad.title} | Gotpage`
  const description = ad.content
    ? ad.content.length > 160
      ? ad.content.substring(0, 160) + "..."
      : ad.content
    : "Szczegóły ogłoszenia"

  return {
    title: title,
    description: description,
    keywords: `${ad.title}, ${ad.category}, ogłoszenie, gotpage`,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ad.images && ad.images.length > 0 ? ad.images[0] : "/og-image-ad-default.jpg",
          width: 1200,
          height: 630,
          alt: ad.title,
        },
      ],
      type: "article",
    },
  }
}

// Komponent serwerowy, który renderuje komponent kliencki
export default async function AdDetailsPage({ params }: { params: { id: string } }) {

  const { id } = await params
  return <AdDetailsClient id={id} />
}

