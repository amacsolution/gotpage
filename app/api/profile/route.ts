import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export type UserData = {
  slug: string| null
  id: number
  name: string
  fullname?: string
  password?: string
  email: string
  phone: string | null
  bio: string | null
  avatar: string | null
  background_img: string | null
  type: string
  verified: number
  joinedAt: string
  location: string | null
  adress: string | null
  occupation: string | null
  interests: string | null
  website: string | null
  company_size: string | null
  nip: string | null
  regon: string | null
  krs: string | null
  promotion: {
    active: boolean
    plan: string
    endDate: string
  } | null
  stats: {
    ads: number | null
    views: number | null
    likes: number | null
    reviews: number | null
    rating: number | null
    followers: number | null
    following: number | null
  }
  coordinates: string
  categories: string | null
  ads_count: number | null
  views_count: number | null
  likes_count: number | null
  reviews_count: number | null
  rating_avg: number | null
  rating: number | null
  reviewCount: number | null
  social_media: string | null
  opening_hours: string | null
  services: string | null
}

type Promotions = {
  plan: string
  active: number
  endDate: string
}

export async function GET(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Pobranie podstawowych danych użytkownika - optymalizacja zapytania
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
      [user.id],
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
          [user.id],
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
        ? await query("SELECT nip, regon, krs FROM business_details WHERE user_id = ?", [user.id])
        : []

    // Pobieranie statystyk obserwujących
    const followers = (await query(`SELECT COUNT(*) as count FROM user_follows WHERE target_id = ?`, [user.id])) as {
      count: string
    }[]

    const following = (await query(`SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?`, [user.id])) as {
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
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych profilu" }, { status: 500 })
  }
}
