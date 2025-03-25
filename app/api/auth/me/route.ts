import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Pobranie danych użytkownika z tokenu
    const user = await auth(request)

    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych użytkownika" }, { status: 500 })
  }
}

