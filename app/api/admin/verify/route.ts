import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Pobieranie hasła z zmiennych środowiskowych
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = (await cookieStore).get("admin_token")

    if (!token || token.value !== "authenticated") {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: { role: "admin" },
    })
  } catch (error) {
    console.error("Błąd weryfikacji:", error)
    return NextResponse.json({ authenticated: false, message: "Błąd weryfikacji" }, { status: 500 })
  }
}

// Dodaj obsługę metody POST, która jest używana w formularzu logowania
// Dodaj tę funkcję do pliku:

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Sprawdzenie czy hasło jest poprawne
    if (password === ADMIN_PASSWORD) {
      // Ustawienie prostego tokena w ciasteczku
      (await cookies()).set({
        name: "admin_token",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 dzień
        sameSite: "strict",
      })

      return NextResponse.json({
        authenticated: true,
        isAdmin: true,
        success: true,
        message: "Zalogowano pomyślnie",
      })
    }

    return NextResponse.json({ authenticated: false, success: false, message: "Nieprawidłowe hasło" }, { status: 401 })
  } catch (error) {
    console.error("Błąd logowania:", error)
    return NextResponse.json(
      { authenticated: false, success: false, message: "Wystąpił błąd podczas logowania" },
      { status: 500 },
    )
  }
}

