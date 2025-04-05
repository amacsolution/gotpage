import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"

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
        const cookieStore = await cookies()
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User

    // Opcjonalnie: sprawdzenie czy użytkownik nadal istnieje w bazie danych
    const users = await query("SELECT id, name, email, type, verified, avatar FROM users WHERE id = ?", [decoded.id])

    if (!Array.isArray(users) || users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Błąd autentykacji:", error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const [users] = await db.query("SELECT * FROM users WHERE email = ?", [credentials.email])

          if (!users || users.length === 0) {
            return null
          }

          const user = users[0]
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // console.log("Zalogowano pomyślnie:", user)

          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role,
            image: user.avatar 
          }
        } catch (error) {
          // console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.JWT_SECRET,
}

// Funkcja pomocnicza do sprawdzania, czy użytkownik jest administratorem
export async function isAdmin(userId: string) {
  try {
    const [users] = await db.query("SELECT role FROM users WHERE id = ?", [userId])

    if (!users || users.length === 0) {
      return false
    }

    return users[0].role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Funkcja do weryfikacji hasła administratora
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not set in environment variables")
    return false
  }
  return password === adminPassword
}
