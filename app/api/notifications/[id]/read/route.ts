import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const notificationId = Number.parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID powiadomienia" }, { status: 400 })
    }

    // Sprawdzenie, czy powiadomienie należy do użytkownika
    const notificationCheck = await query("SELECT id FROM notifications WHERE id = ? AND user_id = ?", [
      notificationId,
      user.id,
    ])

    if (!Array.isArray(notificationCheck) || notificationCheck.length === 0) {
      return NextResponse.json({ error: "Powiadomienie nie istnieje lub nie masz do niego dostępu" }, { status: 404 })
    }

    // Oznaczenie powiadomienia jako przeczytane
    await query("UPDATE notifications SET is_read = 1 WHERE id = ?", [notificationId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas oznaczania powiadomienia jako przeczytane:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas oznaczania powiadomienia jako przeczytane" },
      { status: 500 },
    )
  }
}

