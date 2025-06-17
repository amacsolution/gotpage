import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const user = await auth(req)
    const json = await req.json()

    const message = json?.message || "Brak wiadomości"
    const stack = json?.stack || "Brak stack trace"
    const digest = json?.digest || null
    const before = json?.before || null
    const userEmail = JSON.stringify(user) || "anonim"

    await query(
      `INSERT INTO bugs (date, body, user, stack, digest, referrer)
       VALUES (NOW(), ?, ?, ?, ?, ?)`,
      [message, userEmail, stack, digest, before]
    )

    return new Response("Zapisano błąd", { status: 200 })
  } catch (error) {
    console.error("Błąd zapisu błędu do bazy:", error)
    return new Response("Błąd serwera", { status: 500 })
  }
}
