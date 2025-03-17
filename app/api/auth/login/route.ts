import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs" // Changed from bcrypt to bcryptjs
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { getUserByEmail } from "@/lib/db"
import { RowDataPacket } from "mysql2"

export async function POST(req: Request) {
try {
  const body = await req.json()
  const { email, password } = body

  // Sprawdzenie, czy wszystkie wymagane pola są wypełnione
  if (!email || !password) {
    return NextResponse.json({ error: "Email i hasło są wymagane" }, { status: 400 })
  }

  // Sprawdzenie, czy użytkownik istnieje
  const users = await getUserByEmail(email)
  const user = Array.isArray(users) && users.length > 0 ? (users[0] as RowDataPacket & { password: string, id: number, email: string, name: string, type: string, verified: boolean }) : null

  if (!user) {
    return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 })
  }

  // Sprawdzenie hasła
  const passwordMatch = await bcryptjs.compare(password, user.password) // Changed from bcrypt to bcryptjs
  if (!passwordMatch) {
    return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 })
  }

  // Tworzenie tokenu JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      verified: user.verified,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" },
  )

  const cookieStore = await cookies()
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  })

  // Zwrócenie danych użytkownika (bez hasła)
  const { password: userPassword, ...userWithoutPassword } = user
  return NextResponse.json({
    message: "Zalogowano pomyślnie",
    user: userWithoutPassword,
  })
} catch (error) {
  console.error("Błąd podczas logowania:", error)
  return NextResponse.json({ error: "Wystąpił błąd podczas logowania" }, { status: 500 })
}
}