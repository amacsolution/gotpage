import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const userId = session.id
    const photoId = params.id

    // Sprawdź, czy użytkownik już polubił to zdjęcie
    const existingLike = await query(`SELECT * FROM photo_likes WHERE photo_id = ? AND user_id = ?`, [
      photoId,
      userId,
    ]) as any[]

    let liked = false

    if (existingLike.length > 0) {
      // Jeśli już polubił, usuń polubienie
      await query(`DELETE FROM photo_likes WHERE photo_id = ? AND user_id = ?`, [photoId, userId])
      liked = false
    } else {
      // Jeśli nie polubił, dodaj polubienie
      await query(`INSERT INTO photo_likes (photo_id, user_id) VALUES (?, ?)`, [photoId, userId])
      liked = true
    }

    // Pobierz aktualną liczbę polubień
    const likesResult = await query(`SELECT COUNT(*) as count FROM photo_likes WHERE photo_id = ?`, [photoId]) as any[]

    const likesCount = likesResult[0]?.count || 0

    return NextResponse.json({ liked, likesCount })
  } catch (error) {
    console.error("Error liking photo:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas polubiania zdjęcia" }, { status: 500 })
  }
}
