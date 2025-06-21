import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Pobieranie liczby nieprzeczytanych powiadomień
    // Używamy is_read zamiast read, ponieważ read jest słowem zarezerwowanym
    const result = await query("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", [
      user.id, 
    ]) as {count : number}[]

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: result[0].count || 0 })
  } catch (error) {
    console.error("Błąd podczas pobierania liczby powiadomień:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania liczby powiadomień" }, { status: 500 })
  }
}

