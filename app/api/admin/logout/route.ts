import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Usunięcie ciasteczka z tokenem
    (await cookies()).delete("admin_token")

    return NextResponse.json({
      success: true,
      message: "Wylogowano pomyślnie",
    })
  } catch (error) {
    console.error("Błąd wylogowania:", error)
    return NextResponse.json({ success: false, message: "Wystąpił błąd podczas wylogowania" }, { status: 500 })
  }
}

