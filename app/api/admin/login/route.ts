import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Pobieranie hasła z zmiennych środowiskowych
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Proste sprawdzenie hasła
    if (password === ADMIN_PASSWORD) {

      // Ustawienie prostego tokena w ciasteczku
      ;(await cookies()).set({
        name: "admin_token",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 dzień
        sameSite: "strict",
      })

      // Sprawdź, czy ciasteczko zostało ustawione
      const token = (await cookies()).get("admin_token")

      return NextResponse.json({
        success: true,
        message: "Zalogowano pomyślnie",
      })
    }
    return NextResponse.json({ success: false, message: "Nieprawidłowe hasło" }, { status: 401 })
  } catch (error) {
    console.error("Błąd logowania:", error)
    return NextResponse.json({ success: false, message: "Wystąpił błąd podczas logowania" }, { status: 500 })
  }
}

