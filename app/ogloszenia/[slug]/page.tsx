import type { Metadata, ResolvingMetadata } from "next"
import AdDetailsClient from "./ads-detailed"
import slugify from "slugify";

export const dynamic = "force-dynamic";

// Generowanie dynamicznych metadanych dla pojedynczego ogłoszenia
export async function generateMetadata(props: { params: Promise<{ slug: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  let ad = null
  const { slug } = params
  const id = slug.split("-")[0]

  try {
    const response = await fetch(`https://gotpage.pl/api/ogloszenia/${id}`)
    const data = await response.json()

    if (!data.error) {
      ad = data
    }
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszenia:", error)
  }

  if (!ad) {
    ad = {
      title: "Ogłoszenie",
      category: "Kategoria",
      price: 0,
      currency: "PLN",
      images: ["/placeholder.svg?height=600&width=800"],
    }
  }

  const title = `${ad.title} | Gotpage`


  const slugy = `${ad.id}-${slugify(ad.title, { lower: true, strict: true })}`
  const data = {
    title,
    description: `Zobacz szczegóły ogłoszenia ${ad.title} na Gotpage i poznaj inne interesujące ogłoszenia`,
    keywords: `${ad.title}, ${ad.category}, ogłoszenie, gotpage ${ad.subcategory ? `,${ad.subcategory}` : ""}${ad.finalcategory ? `,${ad.finalcategory}` : ""}`,
    openGraph: {
      url: `https://gotpage.pl/ogloszenia/${slugy}`,
      title,
      description: `Zobacz szczegóły ogłoszenia ${ad.title} na Gotpage`,
      images: [
        {
          url: ad.images?.[0] || "/logo.png",
          width: 1200,
          height: 630,
          alt: ad.title,
        },
      ],
      type: "article",
    },
  }
  return data
}

// Komponent serwerowy, który renderuje komponent kliencki
export default async function AdDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const id = slug.split("-")[0]
  return <AdDetailsClient id={id} />
}

