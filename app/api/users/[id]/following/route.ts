import { type NextRequest, NextResponse } from "next/server"
import { db, query } from "@/lib/db"
import { auth} from "@/lib/auth"
import { json } from "stream/consumers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }    
    const userId = id
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get following users
    const followingQuery = `
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
      JOIN user_follows uf ON u.id = uf.target_id
      WHERE uf.follower_id = ?
      GROUP BY u.id
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `

    const followingParams = user ? [user.id, userId, limit, offset] : [userId, limit, offset]

    const following = await query(followingQuery, followingParams) as {
      id: number
      name: string
      avatar: string
      verified: boolean
      location: string
      type: string
      categories: string
      is_following: boolean
    }[]

    console.log("following:", following)
    console.log("userId:", userId)

    // Get total count for pagination
    const countResult = await query("SELECT COUNT(*) as total FROM user_follows WHERE follower_id = ?", [userId]) as {total : number}[]

    const total = countResult[0].total || 0
    const hasMore = offset + limit < total

    console.log("total:", total)

    // Process the results
    const users = following.map((user) => ({
      ...user,
      categories: user.categories ? JSON.parse(user.categories) : [], 
      isFollowing: Boolean(user.is_following),
    }))

    console.log("users:", users)

    return NextResponse.json({
      users,
      total,
      hasMore,
    })
  } catch (error) {
    console.error("Error fetching following users:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania obserwowanych użytkowników" }, { status: 500 })
  }
}
