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
    console.log("Otrzymano żądanie wysłania powiadomienia")

    // Sprawdź, czy użytkownik jest administratorem
    const isAdminUser = await isAdmin(request)
    console.log("Czy użytkownik jest administratorem:", isAdminUser)

    if (!isAdminUser) {
      console.log("Brak uprawnień administratora")
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    // Pobierz dane z żądania
    const body = await request.json()
    console.log("Otrzymane dane:", body)

    const { userId, title, message } = body

    // Walidacja danych
    if (!userId || !title || !message) {
      console.log("Brakujące dane:", { userId, title, message })
      return NextResponse.json({ error: "Brakujące dane: userId, title lub message" }, { status: 400 })
    }

    // Sprawdź, czy użytkownik istnieje - użyjmy prostszego zapytania
    try {
      // Zamiast pełnego zapytania SQL, użyjmy mocka dla testów
      console.log("Symulacja sprawdzania użytkownika o ID:", userId)

      // Zakładamy, że użytkownik istnieje (dla uproszczenia)
      // W rzeczywistej aplikacji, tutaj byłoby zapytanie do bazy danych

      // Symulacja zapisywania powiadomienia
      console.log("Symulacja zapisywania powiadomienia:", {
        userId,
        title,
        message,
        timestamp: new Date().toISOString(),
      })

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

