import { NextResponse } from "next/server"
import { db, query } from "@/lib/db"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email-helpers"
import { z } from "zod"

// Schemat walidacji
const requestResetSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Walidacja danych
    const result = requestResetSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Nieprawidłowy adres email" }, { status: 400 })
    }

    const { email } = result.data

    // Sprawdź, czy użytkownik istnieje
    const userResult = await query("SELECT id, name FROM users WHERE email = ?", [email]) as { id: string,  name: string }[]

    // Nawet jeśli użytkownik nie istnieje, nie informujemy o tym (ze względów bezpieczeństwa)
    // Zamiast tego, zawsze zwracamy sukces, aby zapobiec atakom polegającym na sprawdzaniu, czy email istnieje
    if (!userResult|| userResult.length === 0) {
      // return NextResponse.json({
      //   message: "Jeśli podany adres email istnieje w naszej bazie, wyślemy na niego link do resetowania hasła.",
      // })

      return NextResponse.json({ error: "Nieprawidłowy adres email" }, { status: 400 })
    }

    const user = userResult[0]

    // Generuj token resetowania hasła
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Ustaw czas wygaśnięcia tokenu (1 godzina)
    const resetTokenExpires = new Date()
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1)

    // Zapisz token w bazie danych
    await query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [
      resetToken,
      resetTokenExpires,
      user.id,
    ])

    // Wyślij email z linkiem do resetowania hasła
    await sendPasswordResetEmail({
      email,
      userName: user.name,
      resetToken,
      expirationTime: "1 godzina",
    })

    return NextResponse.json({
      message: "Jeśli podany adres email istnieje w naszej bazie, wyślemy na niego link do resetowania hasła.",
    })
  } catch (error) {
    console.error("Błąd podczas żądania resetowania hasła:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas przetwarzania żądania" }, { status: 500 })
  }
}
