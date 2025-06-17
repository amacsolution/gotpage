import { type NextRequest, NextResponse } from "next/server"
import { db, query } from "@/lib/db"
import { auth, authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = await context;
  try {
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const { action } = await request.json()
    const targetUserId = (await params).id

    // Prevent following yourself
    if (String(user.id) === targetUserId) {
      return NextResponse.json({ error: "Nie możesz obserwować samego siebie" }, { status: 400 })
    }

    // Check if target user exists
    const userExists = await query("SELECT id FROM users WHERE id = ?", [targetUserId]) as { id: string }[]

    if (userExists.length === 0) {
      return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 })
    }

    if (action === "follow") {
      // Check if already following
      const alreadyFollowing = await query("SELECT * FROM user_follows WHERE follower_id = ? AND target_id = ?", [
        user.id,
        targetUserId,
      ])  as { follower_id: string; target_id: string }[]

      if (alreadyFollowing.length > 0) {
        return NextResponse.json({ message: "Już obserwujesz tego użytkownika" }, { status: 200 })
      }

      // Add follow relationship
      const result = await db.query("INSERT INTO user_follows (follower_id, target_id, created_at) VALUES (?, ?, NOW())", [
        user.id,
        targetUserId,
      ]) as { affectedRows: number }[]

      if (result[0].affectedRows > 0) {
      } else {
        console.error("Nie udało się dodać obserwacji")
        return NextResponse.json({ error: "Nie udało się dodać obserwacji" }, { status: 500 })
      }

      // Update follower and following counts
      await query("UPDATE user_stats SET followers = followers + 1 WHERE user_id = ?", [targetUserId])
      await query("UPDATE user_stats SET following = following + 1 WHERE user_id = ?", [user.id])

      // Create notification for the target user
      await query(
        `INSERT INTO notifications 
        (user_id, type, title, content, related_id, related_type, is_read, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          targetUserId,
          "follow",
          "Nowy obserwujący",
          `Użytkownik ${user.name} zaczął Cię obserwować`,
          user.id,
          "user",
          0,
        ],
      )

      return NextResponse.json({ message: "Obserwujesz użytkownika" }, { status: 200 })
    } else if (action === "unfollow") {
      // Remove follow relationship
      await db.query("DELETE FROM user_follows WHERE follower_id = ? AND target_id = ?", [
        user.id,
        targetUserId,
      ])

      // Update follower and following counts
      await query("UPDATE user_stats SET followers = GREATEST(followers - 1, 0) WHERE user_id = ?", [targetUserId])
      await query("UPDATE user_stats SET following = GREATEST(following - 1, 0) WHERE user_id = ?", [user.id])

      return NextResponse.json({ message: "Przestałeś obserwować użytkownika" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Nieprawidłowa akcja" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in follow API:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji obserwacji" }, { status: 500 })
  }
}
