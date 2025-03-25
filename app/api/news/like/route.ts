import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const body = await req.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: "Brak ID wpisu" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik już polubił ten wpis
    const existingLikes = await query("SELECT * FROM news_likes WHERE user_id = ? AND post_id = ?", [user.id, postId])

    if (Array.isArray(existingLikes) && existingLikes.length > 0) {
      // Użytkownik już polubił ten wpis, więc usuń polubienie
      await query("DELETE FROM news_likes WHERE user_id = ? AND post_id = ?", [user.id, postId])

      // Aktualizacja licznika polubień
      await query("UPDATE news_posts SET likes = likes - 1 WHERE id = ?", [postId])

      return NextResponse.json({ liked: false, message: "Polubienie usunięte" })
    } else {
      // Użytkownik nie polubił jeszcze tego wpisu, więc dodaj polubienie
      await query("INSERT INTO news_likes (user_id, post_id, created_at) VALUES (?, ?, NOW())", [user.id, postId])

      // Aktualizacja licznika polubień
      await query("UPDATE news_posts SET likes = likes + 1 WHERE id = ?", [postId])

      return NextResponse.json({ liked: true, message: "Wpis polubiony" })
    }
  } catch (error) {
    console.error("Błąd podczas obsługi polubienia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas obsługi polubienia" }, { status: 500 })
  }
}

// Sprawdzenie, czy użytkownik polubił wpis
export async function GET(req: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ liked: false }, { status: 200 })
    }

    const url = new URL(req.url)
    const postId = url.searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Brak ID wpisu" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik już polubił ten wpis
    const existingLikes = await query("SELECT * FROM news_likes WHERE user_id = ? AND post_id = ?", [user.id, postId])

    const liked = Array.isArray(existingLikes) && existingLikes.length > 0

    return NextResponse.json({ liked })
  } catch (error) {
    console.error("Błąd podczas sprawdzania polubienia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas sprawdzania polubienia" }, { status: 500 })
  }
}

