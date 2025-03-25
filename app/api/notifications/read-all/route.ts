import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Oznaczenie wszystkich powiadomień jako przeczytane
    await query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas oznaczania wszystkich powiadomień jako przeczytane:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas oznaczania wszystkich powiadomień jako przeczytane" },
      { status: 500 },
    )
  }
}

