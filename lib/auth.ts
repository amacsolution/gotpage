import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getUserById } from "@/lib/db"

export async function auth(req?: Request) {
  try {
    // Pobieranie tokenu z ciasteczek lub nagłówka Authorization
    let token

    if (req) {
      // Dla API Routes
      const authHeader = req.headers.get("Authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      // Dla Server Components
      const cookieStore = cookies()
      token = cookieStore.get("auth_token")?.value
    }

    if (!token) {
      return null
    }

    // Weryfikacja tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any

    // Pobieranie użytkownika z bazy danych
    const users = await getUserById(decoded.id)
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null

    if (!user) {
      return null
    }

    // Zwrócenie danych użytkownika (bez hasła)
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Błąd autoryzacji:", error)
    return null
  }
}

export async function getServerSession() {
  try {
    return await auth()
  } catch (error) {
    console.error("Błąd podczas pobierania sesji:", error)
    return null
  }
}

