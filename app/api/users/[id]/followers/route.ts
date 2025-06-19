import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = (await params).id
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get followers
    const followersQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.avatar, 
        u.verified, 
        u.location, 
        u.type,
        u.categories,
        ${user ? "EXISTS(SELECT 1 FROM user_follows WHERE follower_id = ? AND target_id = u.id) as is_following" : "FALSE as is_following"}
      FROM users u
      JOIN user_follows uf ON u.id = uf.follower_id
      WHERE uf.target_id = ?
      GROUP BY u.id
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `

    const followersParams = user ? [user.id, userId, limit, offset] : [userId, limit, offset]

    const followers = await query(followersQuery, followersParams) as {
      id: number
      name: string
      avatar: string
      verified: boolean
      location: string
      type: string
      categories: string
      is_following: boolean
    }[]

    // Get total count for pagination
    const countResult = await query("SELECT COUNT(*) as total FROM user_follows WHERE target_id = ?", [userId]) as { total: number }[]

    const total = countResult[0].total || 0
    const hasMore = offset + limit < total

    // Process the results
    const users = followers.map((user) => ({
      ...user,
      categories: user.categories ? JSON.parse(user.categories) : [],
      isFollowing: Boolean(user.is_following),
    }))

    return NextResponse.json({
      users,
      total,
      hasMore,
    })
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania obserwujących" }, { status: 500 })
  }
}
