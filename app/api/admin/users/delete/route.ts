import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  try {
    // Sprawdź uprawnienia administratora
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    // Pobierz dane z żądania
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Brak wymaganego parametru userId" }, { status: 400 })
    }

    // Sprawdź, czy użytkownik istnieje
    const userExists = await query("SELECT id FROM users WHERE id = ?", [userId]) as any[]

    if (!userExists.length) {
      return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 })
    }

    // Usuń powiązane dane (możesz dostosować do swojej struktury bazy danych)
    // Usuń powiadomienia
    await query("DELETE FROM notifications WHERE user_id = ?", [userId])

    // Usuń obserwujących
    await query("DELETE FROM user_follows WHERE follower_id = ? OR target_id = ?", [userId, userId])

    // Usuń wiadomości
    await query("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", [userId, userId])

    // Usuń ogłoszenia
    await query("DELETE FROM ads WHERE user_id = ?", [userId])

    // Usuń użytkownika
    await query("DELETE FROM users WHERE id = ?", [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas usuwania użytkownika:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania użytkownika" }, { status: 500 })
  }
}
