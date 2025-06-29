import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Schemat walidacji
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token jest wymagany"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Walidacja danych
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { token, password } = result.data

    // Sprawdź, czy token jest ważny i nie wygasł
    const userResult = await query("SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()", [
      token,
    ]) as { id: string }[]

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: "Token resetowania hasła jest nieprawidłowy lub wygasł" }, { status: 400 })
    }

    const userId = userResult[0].id

    // Hashowanie nowego hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Aktualizuj hasło i wyczyść token resetowania
    await query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId],
    )

    return NextResponse.json({
      message: "Hasło zostało pomyślnie zresetowane",
    })
  } catch (error) {
    console.error("Błąd podczas resetowania hasła:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas resetowania hasła" }, { status: 500 })
  }
}
