import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD not set in environment variables")
      return NextResponse.json({ message: "Błąd konfiguracji serwera" }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ message: "Nieprawidłowe hasło" }, { status: 401 })
    }

    // Generowanie tokena JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const token = await new SignJWT({ isAdmin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    // Ustawienie tokena w ciasteczku
    const cookieStore = cookies();
    (await cookieStore).set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 godziny
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Wystąpił błąd podczas logowania" }, { status: 500 })
  }
}

