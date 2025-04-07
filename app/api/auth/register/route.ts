import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      type,
      bio,
      phone,
      nip,
      location,
      categories,
      occupation,
      interests,
      companySize,
      website,
    } = body

    // Walidacja danych wejściowych
    if (!name || !email || !password || !type) {
      return NextResponse.json({ error: "Wszystkie wymagane pola muszą być wypełnione" }, { status: 400 })
    }

    // Sprawdzenie czy email jest już zajęty
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "Użytkownik z tym adresem email już istnieje" }, { status: 409 })
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Domyślny avatar
    const avatar = `/placeholder.svg?height=100&width=100&text=${encodeURIComponent(name.substring(0, 2).toUpperCase())}`

    // Wstawienie nowego użytkownika do bazy danych
    const result = await query(
      `INSERT INTO users (
        name, 
        email, 
        phone, 
        password, 
        type, 
        verified, 
        avatar, 
        created_at, 
        bio, 
        location, 
        categories,
        occupation,
        interests,
        company_size,
        website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone || "",
        hashedPassword,
        type,
        0, // verified = false
        avatar,
        bio || (type === "individual" ? "Zwykły użytkownik platformy." : "Firma korzystająca z platformy."),
        location || "",
        JSON.stringify(categories || []),
        occupation || null,
        interests || null,
        companySize || null,
        website || null,
      ],
    )

    if (!result || !result.insertId) {
      throw new Error("Nie udało się utworzyć użytkownika")
    }

    // Jeśli to firma, dodaj dodatkowe informacje
    if (type === "business" && nip) {
      await query("INSERT INTO business_details (user_id, nip, created_at) VALUES (?, ?, NOW())", [
        result.insertId,
        nip,
      ])
    }

    return NextResponse.json({
      id: result.insertId,
      message: "Użytkownik został pomyślnie zarejestrowany",
    })
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas rejestracji" }, { status: 500 })
  }
}

