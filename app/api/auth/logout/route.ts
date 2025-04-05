import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Usunięcie ciasteczka z tokenem
    (await cookies()).delete("auth_token")

    return NextResponse.json({ message: "Wylogowano pomyślnie" })
  } catch (error) {
    console.error("Błąd podczas wylogowywania:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas wylogowywania" }, { status: 500 })
  }
}

