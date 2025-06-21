import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Sprawdź uprawnienia administratora
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    // Pobierz dane z żądania
    const { userId, verified } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Brak wymaganego parametru userId" }, { status: 400 })
    }

    // Aktualizuj status weryfikacji użytkownika
    await query(`UPDATE users SET verified = ?, updated_at = NOW() WHERE id = ?`, [verified ? 1 : 0, userId])

    // Jeśli użytkownik został zweryfikowany, wyślij powiadomienie
    if (verified) {
      await query(
        `INSERT INTO notifications (user_id, title, message, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [
          userId,
          "Twoje konto zostało zweryfikowane",
          "Gratulacje! Twoje konto zostało zweryfikowane przez administratora. Teraz możesz korzystać ze wszystkich funkcji platformy.",
        ],
      )
    }

    return NextResponse.json({ success: true, verified })
  } catch (error) {
    console.error("Błąd podczas zmiany statusu weryfikacji:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas zmiany statusu weryfikacji" }, { status: 500 })
  }
}
