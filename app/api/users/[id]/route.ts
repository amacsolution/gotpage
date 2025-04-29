import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"
import type { BusinessData } from "./company/route"
import type { UserData } from "../../profile/route"

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = (await params).id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Fetch user data
    const userData = (await query(
      `SELECT 
        u.id, 
        u.name, 
        u.fullname,
        u.email, 
        u.phone, 
        u.bio, 
        u.avatar, 
        u.background_img as backgroundImage,
        u.type, 
        u.verified, 
        u.created_at as joinedAt, 
        u.location,
        u.adress,
        u.categories,
        u.occupation,
        u.interests,
        u.services,
        u.company_size,
        u.website
      FROM users u 
      WHERE u.id = ?`,
      [userId],
    )) as UserData[]

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userData[0]

    // Parse categories if it's a JSON string
    if (user.categories && typeof user.categories === "string") {
      try {
        user.categories = JSON.parse(user.categories)
      } catch (e) {
        user.categories = ""
      }
    } else {
      user.categories = ""
    }

    // Fetch business data if user is a business
    if (user.type === "business") {
      const businessData = (await query("SELECT nip, regon, krs FROM business_details WHERE user_id = ?", [
        userId,
      ])) as BusinessData[]

      if (businessData && businessData.length > 0) {
        user.businessData = businessData[0]
      }
    }

    // Fetch user stats
    type QueryResult<T> = T[] // Define a generic type for query results

    const adsCount = (await query("SELECT COUNT(*) as count FROM ads WHERE user_id = ?", [userId])) as QueryResult<{
      count: number
    }>
    const viewsCount = (await query("SELECT SUM(views) as count FROM ads WHERE user_id = ?", [userId])) as QueryResult<{
      count: number
    }>
    const likesCount = (await query(
      "SELECT COUNT(*) as count FROM ad_likes WHERE ad_id IN (SELECT id FROM ads WHERE user_id = ?)",
      [userId],
    )) as QueryResult<{ count: number }>
    const reviewsData = (await query("SELECT COUNT(*) as count, AVG(rating) as avg FROM reviews WHERE user_id = ?", [
      userId,
    ])) as QueryResult<{ count: number; avg: number }>
    const followersCount = (await query("SELECT COUNT(*) as count FROM user_follows WHERE target_id = ?", [
      userId,
    ])) as QueryResult<{ count: number }>
    const followingCount = (await query("SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?", [
      userId,
    ])) as QueryResult<{ count: number }>

    user.stats = {
      ads: adsCount[0]?.count || 0,
      views: viewsCount[0]?.count || 0,
      likes: likesCount[0]?.count || 0,
      reviews: reviewsData[0]?.count || 0,
      rating: reviewsData[0]?.avg || 0,
      followers: followersCount[0]?.count || 0,
      following: followingCount[0]?.count || 0,
    }

    // Check if current user is following this user
    const currentUser = await auth(request)
    let isFollowing = false
    if (currentUser) {
      const followData = (await query("SELECT * FROM user_follows WHERE follower_id = ? AND target_id = ?", [
        currentUser.id,
        userId,
      ])) as any[]
      isFollowing = followData && followData.length > 0
    }
    user.isFollowing = isFollowing

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
