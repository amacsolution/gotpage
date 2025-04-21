import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const { id } = await params

    // Sprawdzenie, czy użytkownik ma uprawnienia do edycji
    // if (user.id !== Number.parseInt(id)) {
    //   return NextResponse.json({ error: "Brak uprawnień do edycji tych danych" }, { status: 403 })
    // }

    // Pobranie danych
    const body = await request.json()
    const { backgroundImage } = body

    // Aktualizacja tła użytkownika w bazie danych
    await db.query("UPDATE users SET background_img = ? WHERE id = ?", [backgroundImage || null, params.id])

    // Zwracamy zaktualizowane dane
    return NextResponse.json({
      success: true,
      backgroundImage,
    })
  } catch (error) {
    console.error("Błąd podczas aktualizacji tła użytkownika:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas aktualizacji tła użytkownika",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}
