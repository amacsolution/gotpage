import { NextResponse } from "next/server"
import { db, query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, error: "Brak tokenu resetowania hasła" }, { status: 400 })
    }

    // Sprawdź, czy istnieje użytkownik z tym tokenem i czy token nie wygasł
    const result = await query("SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()", [token]) as {id: string} []

    if (!result || result.length === 0) {
      return NextResponse.json(
        { valid: false, error: "Token resetowania hasła jest nieprawidłowy lub wygasł" },
        { status: 400 },
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Błąd podczas walidacji tokenu resetowania hasła:", error)
    return NextResponse.json({ valid: false, error: "Wystąpił błąd podczas walidacji tokenu" }, { status: 500 })
  }
}
