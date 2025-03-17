import { NextResponse } from "next/server"
import { getAds, createAd } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")
    const category = url.searchParams.get("category") || ""
    const search = url.searchParams.get("search") || ""
    const minPrice = url.searchParams.get("minPrice") ? Number.parseInt(url.searchParams.get("minPrice") || "0") : null
    const maxPrice = url.searchParams.get("maxPrice") ? Number.parseInt(url.searchParams.get("maxPrice") || "0") : null

    const filters = {
      category: category || undefined,
      search: search || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    }

    const ads = await getAds(limit, offset, filters)

    return NextResponse.json(ads)
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszeń:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania ogłoszeń" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Sprawdzenie autoryzacji
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, category, subcategory, price, promoted } = body

    // Sprawdzenie, czy wszystkie wymagane pola są wypełnione
    if (!title || !content || !category) {
      return NextResponse.json({ error: "Brakujące wymagane pola" }, { status: 400 })
    }

    // Tworzenie ogłoszenia
    const adData = {
      userId: user.id,
      title,
      content,
      category,
      subcategory: subcategory || null,
      price: price || null,
      promoted: promoted || false,
    }

    const result = await createAd(adData)

    return NextResponse.json({ message: "Ogłoszenie zostało dodane pomyślnie", adId: result.insertId }, { status: 201 })
  } catch (error) {
    console.error("Błąd podczas dodawania ogłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania ogłoszenia" }, { status: 500 })
  }
}

