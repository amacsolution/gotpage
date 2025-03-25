import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"

export interface User {
  id: number
  name: string
  email: string
  type: string
  verified: boolean
}

export async function auth(request?: Request): Promise<User | null> {
  try {
    // Pobranie tokenu z ciasteczka
    let token: string | undefined

    if (request) {
      // Jeśli mamy request, pobierz token z nagłówka Authorization
      const authHeader = request.headers.get("Authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      } else {
        // Jeśli nie ma tokenu w nagłówku, spróbuj pobrać z ciasteczek
        const cookieStore =await cookies()
        token = cookieStore.get("auth_token")?.value
      }
    } else {
      // Jeśli nie mamy requestu, pobierz token z ciasteczek
      const cookieStore = await cookies()
      token = cookieStore.get("auth_token")?.value
    }

    if (!token) {
      return null
    }

    // Weryfikacja tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as User

    // Opcjonalnie: sprawdzenie czy użytkownik nadal istnieje w bazie danych
    const users = await query("SELECT id, name, email, type, verified FROM users WHERE id = ?", [decoded.id])

    if (!Array.isArray(users) || users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Błąd autentykacji:", error)
    return null
  }
}

