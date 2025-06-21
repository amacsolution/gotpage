import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { AdData } from "../route"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get("id")
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "4")

    if (!adId || !category) {
      return NextResponse.json({ error: "Brak wymaganych parametrów: id i category" }, { status: 400 })
    }

    // Pobieranie podobnych ogłoszeń
    const ads = await query(
      `SELECT 
        a.id, 
        a.title, 
        a.price, 
        a.currency, 
        a.location
      FROM ads a
      WHERE a.id != ? AND a.category = ?
      ORDER BY a.promoted DESC, RAND()
      LIMIT ?`,
      [adId, category, limit],
    ) as AdData[]

    if (!Array.isArray(ads)) {
      return NextResponse.json([])
    }

    // Pobieranie zdjęć dla każdego ogłoszenia
    const formattedAds = await Promise.all(
      ads.map(async (ad) => {
        // Pobierz pierwsze zdjęcie dla ogłoszenia
        const images = await query("SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY id ASC LIMIT 1", [ad.id]) as { image_url: string }[]

        const imageUrl = Array.isArray(images) && images.length > 0 ? images[0].image_url : null

        return {
          ...ad,
          image: imageUrl,
        }
      }),
    )
    return NextResponse.json(formattedAds)
  } catch (error) {
    console.error("Błąd podczas pobierania podobnych ogłoszeń:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania podobnych ogłoszeń" }, { status: 500 })
  }
}

