import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Sprawdź uprawnienia administratora
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    // Pobierz parametry wyszukiwania z URL
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get("search") || ""

    // Przygotuj zapytanie SQL z opcjonalnym wyszukiwaniem
    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        created_at as joinedAt, 
        verified,
        (SELECT COUNT(*) FROM ads WHERE user_id = users.id) as adCount,
        (SELECT COUNT(*) FROM messages WHERE sender_id = users.id OR receiver_id = users.id) as messageCount
      FROM users
    `

    const queryParams = []

    // Dodaj warunek wyszukiwania, jeśli podano
    if (searchQuery) {
      sql += ` WHERE name LIKE ? OR email LIKE ? OR id = ?`
      queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`, searchQuery)
    }

    // Dodaj sortowanie i limit
    sql += ` ORDER BY created_at DESC`

    // Wykonaj zapytanie
    const users = await query(sql, queryParams)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Błąd podczas pobierania użytkowników:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania użytkowników" }, { status: 500 })
  }
}
