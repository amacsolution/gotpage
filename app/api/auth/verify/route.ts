import { NextResponse } from "next/server"
import { db, query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Brak tokenu weryfikacyjnego" }, { status: 400 })
    }

    // Sprawdź, czy istnieje użytkownik z tym tokenem
    const [result] = await query("SELECT id,email,type FROM users WHERE verification_token = ?", [token]) as { id : string, email: string, type: string }[]

    if (!result || Number(result.id) === 0) {
      return NextResponse.json({ error: "Nieprawidłowy token weryfikacyjny" }, { status: 400 })
    }

      const emailS = await query(`SELECT email FROM emails_subscription WHERE email = ?`, [result.email]) as any[]

      if(emailS[0] === result.email && result.type === "business"){
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30) //trzy miesiące
        await query(
          "INSERT INTO user_promotions (user_id, plan, active, start_date, end_date, created_at) VALUES (?, ?, 1, NOW(), ?, NOW())",
          [result.id, "business", endDate],
        )
      }

    // Aktualizuj status weryfikacji użytkownika
    await query(
      "UPDATE users SET verified_email = 1, verification_token = NULL, updated_at = NOW() WHERE verification_token = ?",
      [token],
    )

    // Przekieruj użytkownika na stronę sukcesu
    return NextResponse.redirect(new URL("/verify-success", request.url))
  } catch (error) {
    console.error("Błąd podczas weryfikacji konta:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas weryfikacji konta",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
