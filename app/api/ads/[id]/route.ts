import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import path from "path"
import { existsSync } from "fs"
import { promises as fs } from "fs"
import { RowDataPacket } from "mysql2"
import { AdData } from "../route"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {

    const { id } = params
    const adId = Number.parseInt(id)

    if (isNaN(adId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID ogłoszenia" }, { status: 400 })
    }

    // Zwiększenie licznika wyświetleń
    await query("UPDATE ads SET views = views + 1 WHERE id = ?", [adId])

    // Pobranie danych ogłoszenia
    const ads = await query(
      `SELECT 
        a.*,
        u.id as author_id, 
        u.name as author_name, 
        u.email as author_email,
        u.phone as author_phone,
        u.avatar as author_avatar, 
        u.type as author_type,  
        u.verified as author_verified,
        u.created_at as author_joined_at
      FROM ads a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [adId],
    ) as AdData[]

    if (!Array.isArray(ads) || ads.length === 0) {
      return NextResponse.json({ error: "Ogłoszenie nie zostało znalezione" }, { status: 404 })
    }

    const ad = ads[0]

    // Pobranie komentarzy do ogłoszenia
    const comments = await query(
      `SELECT 
        c.id, 
        c.content, 
        c.created_at,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar
      FROM ad_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ad_id = ?
      ORDER BY c.created_at DESC`,
      [adId],
    ) as AdData[]

    let images = []
    const imageResults = await query("SELECT image_url FROM `ad_images` where ad_id = ? ORDER BY `ad_images`.`id` ASC", [adId]) as RowDataPacket[];
    images = imageResults.map((row: any) => row.image_url);

    // Sprawdzenie, czy zalogowany użytkownik polubił to ogłoszenie
    const user = await auth(request)
    let isLiked = false

    if (user) {
      const likeResult = await query("SELECT * FROM ad_likes WHERE user_id = ? AND ad_id = ?", [user.id, adId])
      isLiked = Array.isArray(likeResult) && likeResult.length > 0
    }

    // Formatowanie danych
    const formattedAd = {
      ...ad,
      images,
      parameters: ad.parameters ? JSON.parse(ad.parameters) : null,
      author: {
        id: ad.author_id,
        name: ad.author_name,
        email: ad.author_email,
        phone: ad.author_phone,
        avatar: ad.author_avatar,
        type: ad.author_type,
        verified: ad.author_verified === 1,
        joinedAt: ad.author_joined_at,
      },
      comments: Array.isArray(comments)
        ? comments.map((comment) => ({
            id: comment.id,
            content: (comment as any).content,
            created_at: comment.created_at,
            author: {
              id: comment.author_id,
              name: comment.author_name,
              avatar: comment.author_avatar,
            },
            isAuthor: comment.author_id === ad.author_id,
          }))
        : [],
      isLiked,
    }

    return NextResponse.json(formattedAd)
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania ogłoszenia" }, { status: 500 })
  }
}


export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const adId = Number.parseInt(await params.id)

    if (isNaN(adId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID ogłoszenia" }, { status: 400 })
    }

    // Sprawdzenie autoryzacji
    const user = await auth(request)

    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Sprawdzenie, czy użytkownik jest autorem ogłoszenia
    const [adOwner] = (await query("SELECT user_id FROM ads WHERE id = ?", [adId])) as any[]

    if (!adOwner || adOwner.user_id !== user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do edycji tego ogłoszenia" }, { status: 403 })
    }

    // Parsowanie danych formularza
    const formData = await request.formData()

    // Podstawowe dane ogłoszenia
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
    const currency = formData.get("currency") as string
    const category = formData.get("category") as string
    const subcategory = formData.get("subcategory") as string
    const location = formData.get("location") as string

    // Parametry jako JSON
    const parametersJson = formData.get("parameters") as string
    const parameters = parametersJson ? JSON.parse(parametersJson) : []

    // Dodatkowe pola specyficzne dla kategorii
    const additionalFields: Record<string, any> = {}

    // Nieruchomości
    if (category === "Nieruchomości") {
      additionalFields.square_meters = formData.get("square_meters")
        ? Number.parseFloat(formData.get("square_meters") as string)
        : null
      additionalFields.rooms = formData.get("rooms") ? Number.parseInt(formData.get("rooms") as string) : null
      additionalFields.floor = formData.get("floor") ? Number.parseInt(formData.get("floor") as string) : null
      additionalFields.total_floors = formData.get("total_floors")
        ? Number.parseInt(formData.get("total_floors") as string)
        : null
      additionalFields.year_built = formData.get("year_built")
        ? Number.parseInt(formData.get("year_built") as string)
        : null
      additionalFields.heating_type = formData.get("heating_type") as string
      additionalFields.has_balcony = formData.get("has_balcony") === "true"
      additionalFields.has_garage = formData.get("has_garage") === "true"
    }

    // Motoryzacja
    if (category === "Motoryzacja") {
      additionalFields.make = formData.get("make") as string
      additionalFields.model = formData.get("model") as string
      additionalFields.year = formData.get("year") ? Number.parseInt(formData.get("year") as string) : null
      additionalFields.mileage = formData.get("mileage") ? Number.parseInt(formData.get("mileage") as string) : null
      additionalFields.fuel_type = formData.get("fuel_type") as string
      additionalFields.transmission = formData.get("transmission") as string
      additionalFields.engine_size = formData.get("engine_size")
        ? Number.parseInt(formData.get("engine_size") as string)
        : null
      additionalFields.color = formData.get("color") as string
    }

    // Elektronika
    if (category === "Elektronika") {
      additionalFields.brand = formData.get("brand") as string
      additionalFields.condition_type = formData.get("condition_type") as string
      additionalFields.warranty_months = formData.get("warranty_months")
        ? Number.parseInt(formData.get("warranty_months") as string)
        : null
    }

    // Aktualizacja podstawowych danych ogłoszenia
    await query(
      `UPDATE ads SET 
        title = ?, 
        content = ?, 
        price = ?, 
        currency = ?, 
        category = ?, 
        subcategory = ?, 
        location = ?, 
        parameters = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [title, content, price, currency, category, subcategory, location, JSON.stringify(parameters), adId],
    )

    // Aktualizacja dodatkowych pól
    for (const [key, value] of Object.entries(additionalFields)) {
      if (value !== null && value !== undefined && value !== "") {
        // Sprawdzenie, czy kolumna istnieje
        const [columnExists] = (await query(
          "SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'ads' AND column_name = ?",
          [key],
        )) as any[]

        if (columnExists && columnExists.count > 0) {
          await query(`UPDATE ads SET ${key} = ? WHERE id = ?`, [value, adId])
        }
      }
    }

    // Obsługa zdjęć do usunięcia
    const imagesToDeleteJson = formData.get("imagesToDelete") as string
    if (imagesToDeleteJson) {
      const imagesToDelete = JSON.parse(imagesToDeleteJson) as string[]

      for (const imageUrl of imagesToDelete) {
        // Usunięcie z bazy danych
        await query("DELETE FROM ad_images WHERE ad_id = ? AND image_url = ?", [adId, imageUrl])

        // Usunięcie pliku z serwera
        try {
          const uploadDir = path.join(process.cwd(), "public/uploads")
          const filename = imageUrl.split("/").pop()

          if (filename) {
            const filePath = path.join(uploadDir, filename)
            if (existsSync(filePath)) {
              await fs.unlink(filePath)
            }
          }
        } catch (error) {
          console.error("Błąd podczas usuwania pliku:", error)
          // Kontynuujemy mimo błędu
        }
      }
    }

    // Obsługa nowych zdjęć
    const images = formData.getAll("images") as File[]
    const uploadDir = path.join(process.cwd(), "public/uploads")

    // Upewnienie się, że katalog istnieje
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Błąd podczas tworzenia katalogu:", error)
    }

    // Zapisywanie nowych zdjęć
    for (const image of images) {
      try {
        const buffer = Buffer.from(await image.arrayBuffer())
        const filename = `${uuidv4()}-${Date.now()}.webp`
        const filePath = path.join(uploadDir, filename)

        // Przetwarzanie obrazu za pomocą sharp
        await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filePath)

        // Zapisanie URL obrazu w bazie danych
        const imageUrl = `/uploads/${filename}`
        await query("INSERT INTO ad_images (ad_id, image_url) VALUES (?, ?)", [adId, imageUrl])
      } catch (error) {
        console.error("Błąd podczas zapisywania zdjęcia:", error)
        // Kontynuujemy mimo błędu
      }
    }

    return NextResponse.json({ success: true, id: adId })
  } catch (error) {
    console.error("Błąd podczas aktualizacji ogłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji ogłoszenia" }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const adId = Number.parseInt(await params.id)

    if (isNaN(adId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID ogłoszenia" }, { status: 400 })
    }

    const user = await auth(request)

    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Sprawdzenie, czy użytkownik jest autorem ogłoszenia
    const [adOwner] = (await query("SELECT user_id FROM ads WHERE id = ?", [adId])) as any[]

    if (!adOwner || adOwner.user_id !== user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do usunięcia tego ogłoszenia" }, { status: 403 })
    }

    // Pobranie zdjęć ogłoszenia przed usunięciem
    const images = (await query("SELECT image_url FROM ad_images WHERE ad_id = ?", [adId])) as any[]

    // Usunięcie ogłoszenia i powiązanych danych
    await query("DELETE FROM ad_comments WHERE ad_id = ?", [adId])
    await query("DELETE FROM ad_likes WHERE ad_id = ?", [adId])
    await query("DELETE FROM ad_images WHERE ad_id = ?", [adId])
    await query("DELETE FROM ads WHERE id = ?", [adId])

    // Usunięcie plików zdjęć z serwera
    const uploadDir = path.join(process.cwd(), "public")

    for (const image of images) {
      try {
        const imagePath = path.join(uploadDir, image.image_url.replace(/^\//, ""))
        if (existsSync(imagePath)) {
          await fs.unlink(imagePath)
        }
      } catch (error) {
        console.error("Błąd podczas usuwania pliku zdjęcia:", error)
        // Kontynuujemy mimo błędu
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas usuwania ogłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania ogłoszenia" }, { status: 500 })
  }
}

