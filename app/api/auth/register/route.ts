import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, getUserByEmail } from "@/lib/db"
import { validateNIP } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, type, bio, phone, nip } = body

    // Sprawdzenie, czy wszystkie wymagane pola są wypełnione
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Brakujące wymagane pola" }, { status: 400 })
    }

    // Sprawdzenie, czy email jest już zajęty
    const existingUser = await getUserByEmail(email)
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ error: "Email jest już zajęty" }, { status: 400 })
    }

    // Sprawdzenie NIP dla firm
    if (type === "business") {
      if (!nip) {
        return NextResponse.json({ error: "NIP jest wymagany dla firm" }, { status: 400 })
      }

      if (!validateNIP(nip)) {
        return NextResponse.json({ error: "Nieprawidłowy format NIP" }, { status: 400 })
      }

      if (!phone) {
        return NextResponse.json({ error: "Numer telefonu jest wymagany dla firm" }, { status: 400 })
      }
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Tworzenie użytkownika
    const userData = {
      name,
      email,
      password: hashedPassword,
      type: type || "individual",
      bio: bio || null,
      phone: phone || null,
      nip: type === "business" ? nip : null,
    }

    const result = await createUser(userData)

    return NextResponse.json({ message: "Użytkownik został zarejestrowany pomyślnie" }, { status: 201 })
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas rejestracji" }, { status: 500 })
  }
}

