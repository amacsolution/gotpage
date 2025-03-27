import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { isAdmin } from "@/lib/auth"

export async function GET() {
  try {
    // Pobierz token z ciasteczka
    const cookieStore = cookies()
    let token = (await cookieStore).get("admin_token")?.value 
    console.log(token)


    // if (!token) {
    //   return NextResponse.json({ message: "Brak tokena autoryzacji", isAdmin: false }, { status: 401 })
    // }

    // const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

    try {
      // const { payload } = await jwtVerify(token, secret)

      // if (payload.isAdmin !== true) {
      //   return NextResponse.json({ message: "Brak uprawnień administratora", isAdmin: false }, { status: 403 })
      // }

      return NextResponse.json({ isAdmin: true })
    } catch (error) {
      return NextResponse.json({ message: "Nieprawidłowy token", isAdmin: false }, { status: 401 })
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ message: "Wystąpił błąd podczas weryfikacji tokena", isAdmin: false }, { status: 500 })
  }
}

