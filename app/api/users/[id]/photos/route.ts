import { type NextRequest, NextResponse } from "next/server"
import { db, query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { count } from "console"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    // Pobierz zdjęcia użytkownika
    const [photosResult, totalCountResult] = await Promise.all([
      query(
        `SELECT 
          p.id, 
          p.user_id as userId, 
          p.image_url as imageUrl, 
          p.caption, 
          p.created_at as createdAt,
          (SELECT COUNT(*) FROM photo_likes WHERE photo_id = p.id) as likes,
          (SELECT COUNT(*) FROM photo_comments WHERE photo_id = p.id) as comments,
          EXISTS(SELECT 1 FROM photo_likes WHERE photo_id = p.id AND user_id = ?) as isLiked
        FROM user_photos p
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`,
        [(await auth())?.id || null, userId, limit, offset],
      ),
      query(`SELECT COUNT(*) as count FROM user_photos WHERE user_id = ?`, [userId]), 
    ])

    const photos = Array.isArray(photosResult) ? photosResult : []
    const totalCount = totalCountResult || 0

    const total = totalCount || 0
    const hasMore = offset + photos.length < total

    return NextResponse.json({
      photos,
      page,
      limit,
      total,
      hasMore,
    })
  } catch (error) {
    console.error("Error fetching user photos:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania zdjęć" }, { status: 500 })
  }
}
