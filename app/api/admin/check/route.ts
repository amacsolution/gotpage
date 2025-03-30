import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Debugowanie - sprawdź wszystkie ciasteczka
    const cookieStore = cookies()
    const allCookies = (await cookieStore).getAll()
    console.log(
      "Wszystkie ciasteczka:",
      allCookies.map((c) => `${c.name}=${c.value}`),
    )

    // Sprawdź token administratora
    const token = (await cookieStore).get("admin_token")
    console.log("Token administratora:", token)

    if (!token || token.value !== "authenticated") {
      console.log("Brak tokenu administratora lub nieprawidłowa wartość")
      return NextResponse.json({ authenticated: true })
    }

    console.log("Token administratora jest prawidłowy")
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Błąd sprawdzania:", error)
    return NextResponse.json({ authenticated: false, message: "Błąd sprawdzania" }, { status: 500 })
  }
}

