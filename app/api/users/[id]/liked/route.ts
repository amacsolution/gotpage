import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { AdData } from "@/app/api/ads/route"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const currentUser = await auth(request)
    if (!currentUser) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik ma dostęp do tych danych
    // Użytkownik może przeglądać tylko swoje polubione ogłoszenia
    if (currentUser.id.toString() !== userId) {
      return NextResponse.json({ error: "Brak dostępu do tych danych" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Pobieranie polubionych ogłoszeń
    const likedAds = await query(
      `SELECT 
        a.id, 
        a.title,  
        a.description, 
        a.price, 
        a.currency, 
        a.location, 
        a.category, 
        a.subcategory, 
        a.created_at as createdAt, 
        a.promoted, 
        a.likes,
        a.views,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified,
        (SELECT COUNT(*) FROM ad_comments WHERE ad_id = a.id) as comments_count,
        al.created_at as liked_at
      FROM ad_likes al
      JOIN ads a ON al.ad_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE al.user_id = ?
      ORDER BY a.promoted DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    ) as AdData[]

    if (!Array.isArray(likedAds)) {
      return NextResponse.json({ ads: [], total: 0 })
    }

    // Pobieranie całkowitej liczby polubionych ogłoszeń
    const totalResult = await query("SELECT COUNT(*) as count FROM ad_likes WHERE user_id = ?", [userId]) as {count : string}[]

    const total = Array.isArray(totalResult) && totalResult[0]?.count ? Number.parseInt(totalResult[0].count) : 0

    // Pobieranie zdjęć dla każdego ogłoszenia
    const formattedAds = await Promise.all(
      likedAds.map(async (ad) => {
        // Pobierz zdjęcia dla ogłoszenia
        const images = await query("SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY id ASC", [ad.id]) as { image_url: string }[]
        const imageUrls = Array.isArray(images) ? images.map((img) => img.image_url) : []

        // Formatowanie danych
        return {
          id: ad.id,
          title: ad.title,
          content: ad.description,
          price: ad.price,
          currency: ad.currency,
          location: ad.location,
          category: ad.category,
          subcategory: ad.subcategory,
          images: imageUrls,
          createdAt: ad.createdAt,
          promoted: ad.promoted === 1,
          likes: ad.likes,
          views: ad.views,
          likedAt: ad.liked_at,
          author: {
            id: ad.author_id,
            name: ad.author_name,
            avatar: ad.author_avatar,
            type: ad.author_type,
            verified: ad.author_verified === 1,
          },
          comments: ad.comments_count || 0,
        }
      }),
    )

    return NextResponse.json({
      ads: formattedAds,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Błąd podczas pobierania polubionych ogłoszeń:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania polubionych ogłoszeń" }, { status: 500 })
  }
}

