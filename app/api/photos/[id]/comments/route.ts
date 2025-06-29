import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { UserData } from "@/app/api/profile/route"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const photoId = params.id
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Pobierz komentarze do zdjęcia
    const [comments, totalCount] = await Promise.all([
      query(
        `SELECT 
          c.id, 
          c.user_id as userId, 
          c.content, 
          c.created_at as createdAt,
          u.name as userName,
          u.avatar as userAvatar
        FROM photo_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.photo_id = ?
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?`,
        [photoId, limit, offset],
      ) as Promise<any[]>, // Ensure comments is typed as an array
      query(`SELECT COUNT(*) as count FROM photo_comments WHERE photo_id = ?`, [photoId]) as Promise<{ count: number }[]>,
    ])

    const total = (totalCount[0]?.count ?? 0)
    const hasMore = offset + comments.length < total

    return NextResponse.json({
      comments,
      page,
      limit,
      total,
      hasMore,
    })
  } catch (error) {
    console.error("Error fetching photo comments:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania komentarzy" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const userId = session.id
    const photoId = params.id
    const { content } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Treść komentarza nie może być pusta" }, { status: 400 })
    }

    // Dodaj komentarz
    const result = await query(
      `INSERT INTO photo_comments (photo_id, user_id, content) 
       VALUES (?, ?, ?)`,
      [photoId, userId, content],
    ) as any

    const commentId = result.insertId

    // Pobierz dane użytkownika
    const userData = await query(`SELECT name, avatar FROM users WHERE id = ?`, [userId]) as UserData[]

    const comment = {
      id: commentId,
      userId,
      photoId,
      content,
      createdAt: new Date().toISOString(),
      userName: userData[0]?.name || "",
      userAvatar: userData[0]?.avatar || null,
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error adding photo comment:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania komentarza" }, { status: 500 })
  }
}
