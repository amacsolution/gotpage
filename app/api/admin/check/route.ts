import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Debugowanie - sprawdź wszystkie ciasteczka
    const cookieStore = await cookies()

    // Sprawdź token administratora
    const token = (await cookieStore).get("admin_token")

    if (!token || token.value !== "authenticated") {
      return NextResponse.json({ authenticated: true })
    }
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Błąd sprawdzania:", error)
    return NextResponse.json({ authenticated: false, message: "Błąd sprawdzania" }, { status: 500 })
  }
}

