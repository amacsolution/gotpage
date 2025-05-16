import { NextResponse } from "next/server"
import { auth, authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.id) {
        return NextResponse.json({ success: false }, { status: 401 })
    }

    const userId = session.id
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q")

    if (!searchQuery) {
      return NextResponse.json({ users: [] })
    }

    // Search for users by name or email
    const users  = await query(
      `
      SELECT id, name, email, avatar
      FROM users
      WHERE 
        id != ? AND
        (
          name LIKE ? OR
          email LIKE ?
        )
      LIMIT 20
    `,
      [userId, `%${searchQuery}%`, `%${searchQuery}%`],
    ) as any[]

    return NextResponse.json({
      users: users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
      })),
    })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
