import { query } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email-helpers"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

// Schemat walidacji
const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  fullName: z.string().optional(),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  type: z.enum(["individual", "business"], {
    errorMap: () => ({ message: "Typ musi być 'individual' lub 'business'" }),
  }),
  bio: z.string().optional(),
  phone: z.string().optional(),
  nip: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  categories: z.array(z.string()).optional(),
  occupation: z.string().optional(),
  interests: z.string().optional(),
  relationshipStatus: z.string().optional(),
  education: z.string().optional(),
  companySize: z.string().optional(),
  foundingYear: z.string().optional(),
  website: z.string().optional(),
  openingHours: z.string().optional(),
  services: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
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


    console.log(body)
    // Walidacja danych
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      console.error("Validation errors:", result.error.flatten().fieldErrors) // Log validation errors for debugging
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const {
      name,
      fullName,
      email,
      password,
      type,
      bio,
      phone,
      nip,
      location,
      address,
      categories,
      occupation,
      interests,
      relationshipStatus,
      education,
      companySize,
      foundingYear,
      website,
      openingHours,
      services,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      linkedinUrl,
    } = result.data

    // Generuj ID użytkownika
    const id = generateUserKey(name)

    // Generuj token weryfikacyjny
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Sprawdzenie czy email jest już zajęty
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "Użytkownik z tym adresem email już istnieje" }, { status: 409 })
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Domyślny avatar
    const avatar = `/placeholder-user.jpg?height=100&width=100&text=${encodeURIComponent(name.substring(0, 2).toUpperCase())}`

    let coordinates = null

    if (type === "business" && location && address) {
      const fullAddress = `${location}, ${address}`
      coordinates = await getCoordinates(fullAddress)
    }

    // Przygotowanie danych społecznościowych
    const socialMedia = {
      facebook: facebookUrl || "",
      instagram: instagramUrl || "",
      tiktok: tiktokUrl || "",
      linkedin: linkedinUrl || "",
    }

    // Wstawienie nowego użytkownika do bazy danych
    const generatedBio = type === "individual" ? "Użytkownik platformy." : "Firma korzystająca z platformy."

    try {
      const result = await query(
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
          relationship_status,
          education,
          company_size,
          founding_year,
          website,
          opening_hours,
          services,
          social_media,
          verification_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          fullName || null,
          email,
          phone || null,
          hashedPassword,
          type,
          0, // verified
          0, // verified_email
          avatar,
          bio || generatedBio, // description
          bio || generatedBio, // bio
          location || null,
          address || null,
          coordinates ? JSON.stringify(coordinates) : null,
          JSON.stringify(categories || []),
          occupation || null,
          interests || null,
          relationshipStatus || null,
          education || null,
          companySize || null,
          foundingYear || null,
          website || null,
          openingHours || null,
          services || null,
          JSON.stringify(socialMedia),
          verificationToken,
        ],
      )

      console.log("Użytkownik zarejestrowany:", result)
      console.log("token weryfikacyjny:", verificationToken)

      await query('UPDATE users SET verification_token = ? WHERE id = ?', [verificationToken, id])

      // Jeśli to firma, dodaj dodatkowe informacje
      if (type === "business" && nip) {
        await query("INSERT INTO business_details (user_id, nip, created_at) VALUES (?, ?, NOW())", [id, nip])
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
