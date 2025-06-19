import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { RowDataPacket } from "mysql2"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = (await params).id
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Pobranie ogłoszeń użytkownika
    const ads = await query(
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
        (SELECT image_url FROM ad_images WHERE ad_id = a.id ORDER BY id ASC LIMIT 1) as image,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified,
        (SELECT COUNT(*) FROM ad_comments WHERE ad_id = a.id) as comments_count
      FROM ads a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    )

    if (!Array.isArray(ads)) {
      return NextResponse.json({ ads: [], total: 0 })
    }

    // Pobranie całkowitej liczby ogłoszeń użytkownika
    const totalResult = await query("SELECT COUNT(*) as count FROM ads WHERE user_id = ?", [userId])

    const total = Array.isArray(totalResult) && (totalResult as RowDataPacket[])[0]?.count ? Number.parseInt((totalResult as RowDataPacket[])[0].count) : 0

    // Formatowanie danych
    const formattedAds = ads.map((ad: any) => {
      // Bezpieczne parsowanie pola images
      return {
        ...ad,
        image: ad.image,
        author: {
          id: ad.author_id,
          name: ad.author_name,
          avatar: ad.author_avatar,
          type: ad.author_type,
          verified: ad.author_verified === 1,
        },
        comments: ad.comments_count || 0,
      }
    })

    return NextResponse.json({
      ads: formattedAds,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszeń użytkownika:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania ogłoszeń użytkownika" }, { status: 500 })
  }
}

