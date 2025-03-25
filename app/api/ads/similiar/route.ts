import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get("id")
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "4")

    if (!adId || !category) {
      return NextResponse.json({ error: "Brak wymaganych parametrów: id i category" }, { status: 400 })
    }

    // Pobranie podobnych ogłoszeń
    const ads = await query(
      `SELECT 
        a.id, 
        a.title, 
        a.price, 
        a.currency, 
        a.location, 
        a.images
      FROM ads a
      WHERE a.id != ? AND a.category = ?
      ORDER BY a.promoted DESC, RAND()
      LIMIT ?`,
      [adId, category, limit],
    )

    if (!Array.isArray(ads)) {
      return NextResponse.json([])
    }

    // Formatowanie danych
    const formattedAds = ads.map((ad) => {
      // Bezpieczne parsowanie pola images
      let images = []
      if (ad.images) {
        try {
          // Próba parsowania jako JSON
          images = JSON.parse(ad.images)
        } catch (e) {
          // Jeśli nie jest prawidłowym JSON, traktuj jako pojedynczy string
          images = [ad.images]
        }
      }

      return {
        ...ad,
        images,
        image: images[0] || null,
      }
    })

    return NextResponse.json(formattedAds)
  } catch (error) {
    console.error("Błąd podczas pobierania podobnych ogłoszeń:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania podobnych ogłoszeń" }, { status: 500 })
  }
}

