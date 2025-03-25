import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // Usunięcie powiadomienia
    await query("DELETE FROM notifications WHERE id = ?", [notificationId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas usuwania powiadomienia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania powiadomienia" }, { status: 500 })
  }
}

