import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendWelcomeEmail } from "@/lib/email-helpers"
import { z } from "zod"

// Schemat walidacji
const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  fullname: z.string().optional(),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  type: z.enum(["individual", "business"], {
    errorMap: () => ({ message: "Typ musi być 'individual' lub 'business'" }),
  }),
  bio: z.string().optional(),
  phone: z.string().optional(),
  nip: z.string().optional(),
  location: z.string().optional(),
  adress: z.string().optional(),
  categories: z.array(z.string()).optional(),
  occupation: z.string().optional(),
  interests: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
})

const generateUserKey = (name: string): string => {
  const baseKey = name.replace(/\s+/g, "-").toLowerCase() // Przekształć nazwę na format sługowany
  const uniqueSuffix = crypto.randomBytes(3).toString("hex") // Generuj 6-znakowy sufiks
  return `${baseKey}-${uniqueSuffix}`
}

const getCoordinates = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=${encodeURIComponent(address)}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon }
    } else {
      //console.warn("Nie znaleziono współrzędnych dla adresu:", address)
      return null
    }
  } catch (error) {
    //console.error("Błąd podczas pobierania współrzędnych:", error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Walidacja danych
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const {
      name,
      fullname,
      email,
      password,
      type,
      bio,
      phone,
      nip,
      location,
      adress,
      categories,
      occupation,
      interests,
      companySize,
      website,
    } = result.data

    // Generuj ID użytkownika
    const id = generateUserKey(name)

    // Generuj token weryfikacyjny
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Sprawdzenie czy email jest już zajęty
    const existingUsers = await db.query("SELECT id FROM users WHERE email = ?", [email]) as {id: string}[]

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "Użytkownik z tym adresem email już istnieje" }, { status: 409 })
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Domyślny avatar
    const avatar = `/placeholder-user.jpg?height=100&width=100&query=${encodeURIComponent(name.substring(0, 2).toUpperCase())}`

    let coordinates = null

    if (type === "business" && location && adress) {
      const fullAdress = `${location}, ${adress}`
      coordinates = await getCoordinates(fullAdress)
    }

    // Wstawienie nowego użytkownika do bazy danych
    const generatedBio = type === "individual" ? "Użytkownik platformy." : "Firma korzystająca z platformy Gotpage."

    try {
      await db.query(
        `INSERT INTO users (
          id,
          name, 
          fullname,
          email, 
          phone, 
          password, 
          type, 
          verified, 
          verified_email,
          avatar, 
          created_at, 
          description,
          bio, 
          location, 
          adress,
          coordinates,
          categories,
          occupation,
          interests,
          company_size,
          website,
          verification_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          fullname || null,
          email,
          phone || null,
          hashedPassword,
          type,
          0, // verified
          0, // verified_email
          avatar,
          bio || generatedBio, // description
          generatedBio, // bio ← stała treść
          location || null,
          adress || null,
          coordinates ? JSON.stringify(coordinates) : null,
          JSON.stringify(categories || []),
          occupation || null,
          interests || null,
          companySize || null,
          website || null,
          verificationToken,
        ],
      )

      // Jeśli to firma, dodaj dodatkowe informacje
      if (type === "business" && nip) {
        await db.query("INSERT INTO business_details (user_id, nip, created_at) VALUES (?, ?, NOW())", [id, nip]) as {insertid: number}[]
      }

      // Wyślij email powitalny
      await sendWelcomeEmail({
        email,
        userName: name,
        verificationToken,
      })

      return NextResponse.json({
        id,
        message: "Użytkownik został pomyślnie zarejestrowany. Sprawdź swoją skrzynkę email, aby zweryfikować konto.",
      })
    } catch (dbError) {
      console.error("Błąd bazy danych podczas rejestracji:", dbError)
      return NextResponse.json(
        { error: "Wystąpił błąd podczas zapisywania danych użytkownika", details: String(dbError) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
