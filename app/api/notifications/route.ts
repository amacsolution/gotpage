import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Pobieranie powiadomień użytkownika
    const notifications = await query(
      `SELECT 
        id, 
        title, 
        content, 
        type, 
        related_id as relatedId, 
        related_type as relatedType, 
        is_read as isRead, 
        created_at as createdAt
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50`,
      [user.id],
    )

    if (!Array.isArray(notifications)) {
      return NextResponse.json([])
    }

    // Formatowanie danych
    const formattedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: notification.isRead === 1,
    }))

    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error("Błąd podczas pobierania powiadomień:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania powiadomień" }, { status: 500 })
  }
}

