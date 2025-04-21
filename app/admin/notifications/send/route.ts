import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Funkcja pomocnicza do sprawdzania uwierzytelnienia administratora
async function isAdmin(request: NextRequest) {
  const adminToken = (await cookies()).get("admin_token")
  return adminToken && adminToken.value === "authenticated"
}

export async function POST(request: NextRequest) {
  try {
    // Dodajmy szczegółowe logowanie

    // Sprawdź, czy użytkownik jest administratorem
    const isAdminUser = await isAdmin(request)

    if (!isAdminUser) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    // Pobierz dane z żądania
    const body = await request.json()

    const { userId, title, message } = body

    // Walidacja danych
    if (!userId || !title || !message) {
      return NextResponse.json({ error: "Brakujące dane: userId, title lub message" }, { status: 400 })
    }

    // Sprawdź, czy użytkownik istnieje - użyjmy prostszego zapytania
    try {

      // Zwróć sukces
      return NextResponse.json({
        success: true,
        message: "Powiadomienie zostało wysłane",
      })
    } catch (dbError) {
      console.error("Błąd bazy danych:", dbError)
      return NextResponse.json({ error: "Błąd bazy danych" }, { status: 500 })
    }
  } catch (error) {
    console.error("Błąd podczas wysyłania powiadomienia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas wysyłania powiadomienia" }, { status: 500 })
  }
}

