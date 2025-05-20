import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    // Fetch photos from database
    const photos = (await query(
      `SELECT 
        p.id, 
        p.user_id as userId, 
        p.image_url as imageUrl, 
        p.caption, 
        p.created_at as createdAt,
        COALESCE(l.like_count, 0) as likes,
        COALESCE(c.comment_count, 0) as comments
      FROM user_photos p
      LEFT JOIN (
        SELECT photo_id, COUNT(*) as like_count 
        FROM photo_likes 
        GROUP BY photo_id
      ) l ON p.id = l.photo_id
      LEFT JOIN (
        SELECT photo_id, COUNT(*) as comment_count 
        FROM photo_comments 
        GROUP BY photo_id
      ) c ON p.id = c.photo_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [params.id, limit, offset],
    )) as any[]

    // Check if there are more photos
    const totalCount = (await query(`SELECT COUNT(*) as count FROM user_photos WHERE user_id = ?`, [
      params.id,
    ])) as any[]

    const total = totalCount[0]?.count || 0
    const hasMore = total > page * limit

    // If user is authenticated, check which photos they've liked
    let userLikes: string[] = []
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      const token = authHeader.split(" ")[1]
      if (token) {
        try {
          // Get user ID from token and fetch their likes
          // This is a placeholder - implement according to your auth system
          const userId = "user-id-from-token"
          const likes = (await query(`SELECT photo_id FROM photo_likes WHERE user_id = ?`, [userId])) as any[]
          userLikes = likes.map((like) => like.photo_id)
        } catch (error) {
          console.error("Error fetching user likes:", error)
        }
      }
    }

    // Add isLiked property to photos
    const photosWithLikes = photos.map((photo) => ({
      ...photo,
      isLiked: userLikes.includes(photo.id),
    }))

    return NextResponse.json({
      photos: photosWithLikes,
      hasMore,
      total,
    })
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}
