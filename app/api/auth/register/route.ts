import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const generateUserKey = (name: string): string => {
  const baseKey = name.replace(/\s+/g, '-').toLowerCase(); // Przekształć nazwę na format sługowany
  const uniqueSuffix = crypto.randomBytes(3).toString('hex'); // Generuj 6-znakowy sufiks
  return `${baseKey}-${uniqueSuffix}`;
};

const getCoordinates = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=${encodeURIComponent(address)}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.length > 0) {
      return { lat: (data[0].lat), lng: (data[0].lon) }
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
// Przykład użycia funkcji generateUserKey

  try {
    const body = await request.json()
    const {
      id = generateUserKey(body.name),
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
    const avatar = `/placeholder-user.jpg?height=100&width=100&text=${encodeURIComponent(name.substring(0, 2).toUpperCase())}`

    let coordinates = null

    if (type === "business" ) {
      const fullAdress = `${location}, ${adress}`
      coordinates = await getCoordinates(fullAdress)
    } else {
      coordinates = ""
    }
    console.log("Współrzędne:", coordinates)
    console.log("data", { 
      id,
      name,
      fullname: fullname || name,
      email,
      phone: phone || "",
      hashedPassword,
      type,
      verified: 0, // verified = false
      avatar,
      bio: bio || "",
      description: (type === "individual" ? "Użytkownik platformy." : "Firma korzystająca z platformy Gotpage."),
      location: location || "",
      adress: adress || "",
      coordinates: coordinates ? JSON.stringify(coordinates) : '',
      categories: JSON.stringify(categories || []),
      occupation: occupation || null,
      interests: interests || null,
      companySize: companySize || null,
      website: website || null 
    })

    // Wstawienie nowego użytkownika do bazy danych
    const generatedBio = type === "individual" 
    ? "Użytkownik platformy." 
    : "Firma korzystająca z platformy Gotpage.";
  
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
      website
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      fullname || null,
      email || null,
      phone || null,
      hashedPassword || null,
      type || null,
      0, // verified
      avatar || null,
      bio,       // description ← bio
      generatedBio,       // bio ← stała treść
      location || null,
      adress || null,
      coordinates ? JSON.stringify(coordinates) : null,
      JSON.stringify(categories || []),
      occupation || null,
      interests || null,
      companySize || null,
      website || null,
    ],
  ) as { insertId: number; affectedRows: number };
  
    console.log("Wstawiony użytkownik:", result)

    if (!result || result.affectedRows !== 1) {
      throw new Error("Nie udało się utworzyć użytkownika")
    }

    // Jeśli to firma, dodaj dodatkowe informacje
    if (type === "business" && nip) {
      await query("INSERT INTO business_details (user_id, nip, created_at) VALUES (?, ?, NOW())", [
        id,
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

