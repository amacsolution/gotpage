import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"
import type { BusinessData } from "./company/route"
import type { Promotions, UserData } from "../../profile/route"
import { profile } from "console"

const profileDataSchema = z.object({
  name: z.string().min(2, {
    message: "Nazwa musi mieć co najmniej 2 znaki",
  }),
  fullname: z.string().optional(),
  email: z.string().email({
    message: "Wprowadź poprawny adres email",
  }),
  phone: z.string().optional(),
  bio: z
    .string()
    .max(500, {
      message: "Bio nie może przekraczać 500 znaków",
    })
    .optional(),
  location: z.string().optional(),
  adress: z.string().optional(),
  occupation: z.string().optional(),
  interests: z.string().optional(),
  services: z.string().optional(),
  website: z
    .string()
    .url({
      message: "Wprowadź poprawny adres URL",
    })
    .optional()
    .or(z.literal("")),
})

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Pobranie i walidacja danych
    const body = await request.json()
    const result = profileDataSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, fullname, email, phone, bio, location, adress, occupation, interests, services, website } =
      result.data

    // Sprawdzenie, czy email jest już używany przez innego użytkownika
    if (email !== user.email) {
      const existingUsers = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email, params.id])
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json({ error: "Ten adres email jest już używany" }, { status: 409 })
      }
    }

    // Aktualizacja danych użytkownika
    await query(
      `UPDATE users 
       SET name = ?, fullname = ?, email = ?, phone = ?, bio = ?, location = ?, 
           adress = ?, occupation = ?, interests = ?, services = ?, website = ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [
        name,
        fullname || null,
        email,
        phone || null,
        bio || null,
        location || null,
        adress || null,
        occupation || null,
        interests || null,
        services || null,
        website || null,
        params.id,
      ],
    )

    // Zwracamy zaktualizowane dane
    return NextResponse.json({
      name,
      fullname,
      email,
      phone,
      bio,
      location,
      adress,
      occupation,
      interests,
      services,
      website,
    })
  } catch (error) {
    console.error("Błąd podczas aktualizacji profilu:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas aktualizacji profilu",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = (await props.params)
  try {
    const { id: userId } = await params
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }
    // Sprawdzenie, czy użytkownik istnieje w tabeli stats
    const users = (await query(
      `SELECT 
        u.id, 
        u.name, 
        u.fullname,
        u.email, 
        u.phone, 
        u.bio, 
        u.avatar, 
        u.background_img,
        u.type, 
        u.verified, 
        u.created_at as joinedAt, 
        u.location,
        u.adress,
        u.occupation,
        u.interests,
        u.website,
        u.company_size,
        u.categories,
        u.opening_hours,
        u.services,
        u.social_media,
        (SELECT COUNT(*) FROM ads WHERE user_id = u.id) as ads_count,
        (SELECT SUM(views) FROM user_stats WHERE user_id = u.id) as views_count,
        (SELECT COUNT(*) FROM ad_likes WHERE ad_id IN (SELECT id FROM ads WHERE user_id = u.id)) as likes_count,
        (SELECT COUNT(*) FROM user_reviews WHERE user_id = u.id) as reviews_count,
        (SELECT AVG(rating) FROM user_reviews WHERE user_id = u.id) as rating_avg
      FROM users u
      WHERE u.id = ?
      LIMIT 1`,
      [userId],
    )) as UserData[]

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika" }, { status: 404 })
    }

    const userData = users[0]

    // Sprawdzenie czy użytkownik ma aktywną promocję (tylko dla firm)
    let promotionData = null
    if (userData.type === "business") {
      try {
        // Sprawdzamy czy tabela user_promotions istnieje
        const promotions = (await query(
          `SELECT 
            plan, 
            active, 
            end_date as endDate 
          FROM user_promotions 
          WHERE user_id = ? AND active = 1 AND end_date > NOW() 
          ORDER BY end_date DESC 
          LIMIT 1`,
          [userId],
        )) as Promotions[]

        if (Array.isArray(promotions) && promotions.length > 0) {
          promotionData = {
            active: true,
            plan: promotions[0].plan,
            endDate: promotions[0].endDate,
          }
        }
      } catch (error) {
        // Jeśli tabela nie istnieje lub wystąpił inny błąd, ignorujemy go
        console.error("Błąd podczas pobierania danych promocji:", error)
      }
    }

    // Pobieranie danych biznesowych
    const businessData =
      userData.type === "business"
        ? await query("SELECT nip, regon, krs FROM business_details WHERE user_id = ?", [userId])
        : []

    // Pobieranie statystyk obserwujących
    const followers = (await query(`SELECT COUNT(*) as count FROM user_follows WHERE target_id = ?`, [userId])) as {
      count: string
    }[]

    const following = (await query(`SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?`, [userId])) as {
      count: string
    }[]

    // Formatowanie danych
    const formattedUser = {
      id: userData.id,
      name: userData.name,
      fullname: userData.fullname,
      email: userData.email,
      phone: userData.phone || "",
      bio: userData.bio || "",
      avatar: userData.avatar,
      backgroundImage: userData.background_img || "",
      type: userData.type,
      verified: userData.verified === 1,
      joinedAt: userData.joinedAt,
      location: userData.location || "",
      adress: userData.adress || "",
      occupation: userData.occupation || "",
      interests: userData.interests || "",
      website: userData.website || "",
      company_size: userData.company_size || "",
      categories: userData.categories ? JSON.parse(userData.categories) : [],
      stats: {
        ads: userData.ads_count || 0,
        views: userData.views_count || 0,
        likes: userData.likes_count || 0,
        reviews: userData.reviews_count || 0,
        rating: userData.rating_avg || 0,
        followers: Number.parseInt(followers[0]?.count || "0"),
        following: Number.parseInt(following[0]?.count || "0"),
      },
      businessData: Array.isArray(businessData) && businessData.length > 0 ? businessData[0] : null,
      promotion: promotionData,
      opening_hours: userData.opening_hours,
      social: userData.social_media ? JSON.parse(userData.social_media) : null,
      services: userData.services,
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Błąd podczas pobierania danych profilu:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas pobierania danych profilu",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}
