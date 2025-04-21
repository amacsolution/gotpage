import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import crypto from "crypto"
import { uploadImage } from "@/lib/upload"
import { emailConfig } from "@/emails/config"
import { sendAdConfirmationEmail } from "@/lib/email-helpers"

const generateAdKey = (name: string): string => {
  const baseKey = name.replace(/\s+/g, "-").toLowerCase() // Przekształć nazwę na format sługowany
  const uniqueSuffix = crypto.randomBytes(3).toString("hex") // Generuj 6-znakowy sufiks
  return `${baseKey}-${uniqueSuffix}`
}

export async function POST(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Parsowanie danych formularza
    const formData = await request.formData()

    // Pobieranie podstawowych danych ogłoszenia
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const subcategory = (formData.get("subcategory") as string) || null
    const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
    const isPromoted = formData.get("isPromoted") === "true"
    const location = (formData.get("location") as string) || null
    const adres = (formData.get("adres") as string) || null
    const kod = (formData.get("kod") as string) || null
    const adKey = generateAdKey(title) // Generowanie unikalnego klucza ogłoszenia

    // Walidacja podstawowych pól
    if (!title || !content || !category) {
      return NextResponse.json({ error: "Brakuje wymaganych pól" }, { status: 400 })
    }

    // Rozpoczęcie transakcji
    await query("START TRANSACTION")

    try {
      // Przygotowanie zapytania SQL w zależności od kategorii
      let sqlColumns =
        "ad_key, title, description, category, subcategory, price, promoted, location, adress, kod, user_id, created_at, updated_at"
      let sqlPlaceholders = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()"
      const sqlValues: any[] = [
        adKey,
        title,
        content,
        category,
        subcategory,
        price,
        isPromoted ? 1 : 0,
        location,
        adres,
        kod,
        user.id,
      ]

      // Dodatkowe pola w zależności od kategorii
      if (category === "Nieruchomości") {
        // Pola dla nieruchomości
        const squareMeters = formData.get("powierzchnia")
          ? Number.parseFloat(formData.get("powierzchnia") as string)
          : null
        const rooms = formData.get("liczba_pokoi") ? Number.parseInt(formData.get("liczba_pokoi") as string) : null
        const floor = formData.get("pietro") ? Number.parseInt(formData.get("pietro") as string) : null
        const yearBuilt = formData.get("rok_budowy") ? Number.parseInt(formData.get("rok_budowy") as string) : null
        const heatingType = (formData.get("stan") as string) || null
        const hasBalcony = formData.get("umeblowane") === "true" ? 1 : 0

        // Dodanie kolumn i wartości do zapytania
        sqlColumns += ", square_meters, rooms, floor, year_built, heating_type, has_balcony"
        sqlPlaceholders += ", ?, ?, ?, ?, ?, ?"
        sqlValues.push(squareMeters, rooms, floor, yearBuilt, heatingType, hasBalcony)
      } else if (category === "Motoryzacja") {
        // Pola dla motoryzacji
        const make = (formData.get("marka") as string) || null
        const model = (formData.get("model") as string) || null
        const year = formData.get("rok") ? Number.parseInt(formData.get("rok") as string) : null
        const mileage = formData.get("przebieg") ? Number.parseInt(formData.get("przebieg") as string) : null
        const engineSize = formData.get("pojemnosc") ? Number.parseFloat(formData.get("pojemnosc") as string) : null
        const fuelType = (formData.get("paliwo") as string) || null
        const transmission = (formData.get("skrzynia") as string) || null

        // Dodanie kolumn i wartości do zapytania
        sqlColumns += ", make, model, year, mileage, engine_size, fuel_type, transmission"
        sqlPlaceholders += ", ?, ?, ?, ?, ?, ?, ?"
        sqlValues.push(make, model, year, mileage, engineSize, fuelType, transmission)
      } else if (category === "Elektronika") {
        // Pola dla elektroniki
        const brand = (formData.get("marka") as string) || null
        const model = (formData.get("model") as string) || null
        const conditionType = (formData.get("stan") as string) || null
        const warrantyMonths = formData.get("gwarancja") === "true" ? 12 : 0 // Domyślnie 12 miesięcy gwarancji

        // Dodanie kolumn i wartości do zapytania
        sqlColumns += ", brand, model, condition_type, warranty_months"
        sqlPlaceholders += ", ?, ?, ?, ?"
        sqlValues.push(brand, model, conditionType, warrantyMonths)
      } else if (category === "Moda") {
        // Pola dla mody
        const brand = (formData.get("marka") as string) || null
        const size = (formData.get("rozmiar") as string) || null
        const color = (formData.get("kolor") as string) || null
        const material = (formData.get("material") as string) || null
        const conditionType = (formData.get("stan") as string) || null

        // Dodanie kolumn i wartości do zapytania
        sqlColumns += ", brand, condition_type, color"
        sqlPlaceholders += ", ?, ?, ?"
        sqlValues.push(brand, conditionType, color)

        // Zapisanie dodatkowych pól jako JSON w kolumnie parameters
        const additionalParams = { size, material }
        sqlColumns += ", parameters"
        sqlPlaceholders += ", ?"
        sqlValues.push(JSON.stringify(additionalParams))
      } else if (category === "Usługi") {
        // Pola dla usług
        const jobType = formData.get("doswiadczenie") ? (formData.get("doswiadczenie") as string) : null
        const hasTransport = formData.get("dojazd") === "true" ? 1 : 0

        // Dodanie kolumn i wartości do zapytania
        sqlColumns += ", job_type, has_garage" // Używamy has_garage jako flagi dla możliwości dojazdu
        sqlPlaceholders += ", ?, ?"
        sqlValues.push(jobType, hasTransport)

        // Zapisanie dodatkowych pól jako JSON w kolumnie parameters
        const additionalParams = {
          availability: (formData.get("dostepnosc") as string) || null,
        }
        sqlColumns += ", parameters"
        sqlPlaceholders += ", ?"
        sqlValues.push(JSON.stringify(additionalParams))
      } else {
        // Dla innych kategorii, zapisz wszystkie dodatkowe pola jako JSON w kolumnie parameters
        const additionalFields: Record<string, any> = {}

        // Iteracja po wszystkich polach formularza i dodanie tych, które nie są podstawowymi polami
        for (const [key, value] of formData.entries()) {
          if (
            !["title", "content", "category", "subcategory", "price", "isPromoted", "location", "images"].includes(key)
          ) {
            additionalFields[key] = value
          }
        }

        // Dodanie parametrów jako JSON
        if (Object.keys(additionalFields).length > 0) {
          sqlColumns += ", parameters"
          sqlPlaceholders += ", ?"
          sqlValues.push(JSON.stringify(additionalFields))
        }
      }

      // Dodanie ogłoszenia do bazy danych
      const sql = `INSERT INTO ads (${sqlColumns}) VALUES (${sqlPlaceholders})`
      const result = (await query(sql, sqlValues)) as { insertId: number }

      if (!result || !result.insertId) {
        throw new Error("Nie udało się dodać ogłoszenia")
      }

      const adId = result.insertId

      // Obsługa przesłanych zdjęć
      const images = formData.getAll("images") as File[]

      if (images && images.length > 0) {
        for (const image of images) {
          // Przesłanie zdjęcia do lokalnego folderu
          const imageUrl = await uploadImage(image)

          // Zapisanie URL zdjęcia w bazie danych
          await query("INSERT INTO ad_images (ad_id, image_url) VALUES (?, ?)", [adId, imageUrl])
        }
      }

      // Jeśli ogłoszenie jest promowane, dodaj wpis do tabeli promocji
      if (isPromoted) {
        const promotionDays = 7 // Domyślnie 7 dni promocji
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + promotionDays)

        await query(
          `INSERT INTO ad_promotions (
            ad_id, 
            start_date, 
            end_date, 
            created_at
          ) VALUES (?, NOW(), ?, NOW())`,
          [adId, endDate],
        )
      }

      // Dodaj powiadomienie dla użytkownika
      await query(
        `INSERT INTO notifications (
          user_id,
          type,
          title,
          content,
          related_id,
          related_type,
          is_read,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          user.id,
          "ad_created",
          "Ogłoszenie dodane",
          `Twoje ogłoszenie "${title}" zostało pomyślnie dodane.`,
          adId.toString(),
          "ads",
          0,
        ],
      )

      // Pobierz dane użytkownika, aby wysłać email
      const userResult = (await query("SELECT name, email FROM users WHERE id = ?", [user.id])) as {
        name: string
        email: string
      }[]
      const userData = userResult[0]

      // Przygotuj linki do ogłoszenia i promocji
      const adUrl = `${emailConfig.appUrl}/ogloszenia/${adId}`
      const promotionUrl = `${emailConfig.appUrl}/checkout?type=ad&id=${adId}&plan=premium`

      // Wyślij email z potwierdzeniem dodania ogłoszenia
      await sendAdConfirmationEmail({
        email: userData.email,
        userName: userData.name,
        adTitle: title,
        adId: adKey,
        isPromoted,
        promotionUrl: isPromoted ? undefined : promotionUrl,
      })

      // Zatwierdzenie transakcji
      await query("COMMIT")

      // Zwrócenie informacji o dodanym ogłoszeniu
      return NextResponse.json({
        success: true,
        message: "Ogłoszenie zostało dodane pomyślnie",
        adId,
        adKey,
        adUrl,
      })
    } catch (error) {
      // Wycofanie transakcji w przypadku błędu
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Błąd podczas dodawania ogłoszenia:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas dodawania ogłoszenia",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}

export interface AdData {
  id: number
  title: string
  description: string
  price: number
  currency: string
  location: string
  category: string
  subcategory: string | null
  image: string | string[] | null
  createdAt: string
  promoted: number
  likes: number
  views: number
  author_id: number
  author_name: string
  author_avatar: string | null
  author_type: string
  author_verified: number
  author_email: string
  author_phone: string
  author_joined_at : string
  comments_count: number
  comments: {
    id: number
    ad_id: number
    user_id: number
    content: string
    created_at: string
    updated_at: string
  }
  content: string
  ad_key: string
  created_at: string
  updated_at: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parametry paginacji
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Parametry filtrowania
    const category = searchParams.get("category")
    const subcategory = searchParams.get("subcategory")
    const location = searchParams.get("location")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const searchQuery = searchParams.get("q")
    const sortBy = searchParams.get("sortBy") || "newest" // newest, oldest, price_asc, price_desc, popular

    // Budowanie zapytania SQL z wykorzystaniem tabeli ad_images
    let sql = `
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.price, 
        a.currency, 
        a.location, 
        a.category, 
        a.subcategory, 
        (SELECT image_url FROM ad_images WHERE ad_id = a.id ORDER BY id ASC LIMIT 1) as image, 
        a.created_at as createdAt, 
        a.promoted, 
        a.likes,
        a.views,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified,
        (SELECT COUNT(*) FROM ad_comments WHERE ad_id = a.id) as comments_count
      FROM ads a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `

    const params: any[] = []

    // Dodanie warunków filtrowania
    if (category) {
      sql += " AND a.category = ?"
      params.push(category)
    } 

    if (subcategory) {
      sql += " AND a.subcategory = ?"
      params.push(subcategory)
    }

    if (location) {
      sql += " AND a.location LIKE ?"
      params.push(`%${location}%`)
    }

    if (minPrice) {
      sql += " AND a.price >= ?"
      params.push(Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      sql += " AND a.price <= ?"
      params.push(Number.parseFloat(maxPrice))
    }

    if (searchQuery) {
      sql += " AND (a.title LIKE ? OR a.description LIKE ?)"
      params.push(`%${searchQuery}%`, `%${searchQuery}%`)
    }

    // Dodanie sortowania
    sql += " ORDER BY a.promoted DESC, "

    switch (sortBy) {
      case "oldest":
        sql += "a.created_at ASC"
        break
      case "price_asc":
        sql += "a.price ASC"
        break
      case "price_desc":
        sql += "a.price DESC"
        break
      case "popular":
        sql += "a.views DESC, a.likes DESC"
        break
      case "newest":
      default:
        sql += "a.created_at DESC"
        break
    }

    // Dodanie limitu
    sql += " LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Wykonanie zapytania
    const ads = await query(sql, params) as AdData[]

    if (!Array.isArray(ads)) {
      return NextResponse.json({ ads: [], total: 0 })
    }

    // Pobranie całkowitej liczby ogłoszeń spełniających kryteria
    let countSql = `
      SELECT COUNT(*) as count
      FROM ads a
      WHERE 1=1
    `

    const countParams = [...params]
    countParams.pop() // Usunięcie limitu
    countParams.pop() // Usunięcie offsetu

    if (category) {
      countSql += " AND a.category = ?"
    }

    if (subcategory) {
      countSql += " AND a.subcategory = ?"
    }

    if (location) {
      countSql += " AND a.location LIKE ?"
    }

    if (minPrice) {
      countSql += " AND a.price >= ?"
    }

    if (maxPrice) {
      countSql += " AND a.price <= ?"
    }

    if (searchQuery) {
      countSql += " AND (a.title LIKE ? OR a.content LIKE ?)"
    }

    const totalResult = await query(countSql, countParams) as { count: string }[]

    const total = Array.isArray(totalResult) && totalResult[0]?.count ? Number.parseInt(totalResult[0].count) : 0

    // Formatowanie danych
    const formattedAds = ads.map((ad) => {
      return {
        ...ad, // Konwersja pojedynczego zdjęcia na tablicę dla kompatybilności
        author: {
          id: ad.author_id,
          name: ad.author_name,
          avatar: ad.author_avatar,
          type: ad.author_type,
          verified: ad.author_verified === 1,
        },
        comments: ad.comments_count || 0,
      }
    })

    return NextResponse.json({
      ads: formattedAds,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszeń:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania ogłoszeń" }, { status: 500 })
  }
}

