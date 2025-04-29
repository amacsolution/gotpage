import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { UserData } from "../../profile/route"
import { sendWelcomeEmail } from "@/lib/email-helpers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Walidacja danych wejściowych
    if (!email || !password) {
      return NextResponse.json({ error: "Email i hasło są wymagane" }, { status: 400 })
    }

    // Sprawdzenie czy użytkownik istnieje
    const users = await query("SELECT id, name, email, password, type,verified, verified_email, avatar FROM users WHERE email = ?", [email]) as UserData[]

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 })
    }

    const user = users[0]

    const isVerifiedEmail = user.verified_email === 1

    console.log(isVerifiedEmail)

    if (!isVerifiedEmail) {
      const verificationToken = crypto.randomBytes(32).toString("hex")
      await query(
        `UPDATE users SET verification_token = ? WHERE id = ? `, [verificationToken,user.id]) as any[]
      await sendWelcomeEmail({
        email,
        userName: user.name,
        verificationToken,
      })
      return NextResponse.json({ error: "Potwierdź swój email" }, { status: 401 })
    }

    // Weryfikacja hasła
    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 })
    }

    // Generowanie tokenu JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        verified: user.verified,
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" },
    )

    // Ustawienie ciasteczka z tokenem
    ;(await cookies()).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dni
    })

    // Zwrócenie podstawowych informacji o użytkowniku (bez hasła)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      verified: user.verified,
      authChange: true,
      avatar: user.avatar // Dodanie flagi dla klienta
    })
  } catch (error) {
    console.error("Błąd podczas logowania:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas logowania" }, { status: 500 })
  }
}

