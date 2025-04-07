import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy ID jest liczbą
    const userId = Number.parseInt(await params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Pobranie danych użytkownika
    const users = await query(
      `SELECT 
        id, 
        name, 
        email, 
        phone, 
        bio, 
        description,
        avatar, 
        type, 
        verified, 
        website,
        created_at as joinedAt, 
        location, 
        categories,
        company_size,
        occupation,
        interests
      FROM users 
      WHERE id = ?`,
      [userId],
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Użytkownik nie został znaleziony" }, { status: 404 })
    }

    const user = users[0]

    // Pobranie statystyk użytkownika
    const adsCountResult = await query("SELECT COUNT(*) as count FROM ads WHERE user_id = ?", [userId])

    const viewsCountResult = await query("SELECT SUM(views) as count FROM ads WHERE user_id = ?", [userId])

    const businessData = user.type === "business" 
                        ? await query("SELECT nip, regon, krs FROM business_details WHERE user_id = ?", [userId]) 
                        : []

    const likesCountResult = await query(
      "SELECT COUNT(*) as count FROM ad_likes WHERE ad_id IN (SELECT id FROM ads WHERE user_id = ?)",
      [userId],
    )

    const reviewsCountResult = await query(
      "SELECT COUNT(*) as count, AVG(rating) as average FROM user_reviews WHERE user_id = ?",
      [userId],
    )

    // Formatowanie danych
    const formattedUser = {
      ...user,
      // Parsowanie kategorii jeśli są przechowywane jako JSON string
      businessData: Array.isArray(businessData) && businessData.length > 0 ? businessData[0] : null,
      categories: user.categories ? JSON.parse(user.categories) : [],
      stats: {
        ads: Array.isArray(adsCountResult) && adsCountResult[0]?.count ? Number.parseInt(adsCountResult[0].count) : 0,
        views:
          Array.isArray(viewsCountResult) && viewsCountResult[0]?.count
            ? Number.parseInt(viewsCountResult[0].count)
            : 0,
        likes:
          Array.isArray(likesCountResult) && likesCountResult[0]?.count
            ? Number.parseInt(likesCountResult[0].count)
            : 0,
        reviews:
          Array.isArray(reviewsCountResult) && reviewsCountResult[0]?.count
            ? Number.parseInt(reviewsCountResult[0].count)
            : 0,
        rating:
          Array.isArray(reviewsCountResult) && reviewsCountResult[0]?.average
            ? Number.parseFloat(reviewsCountResult[0].average)
            : 0,
      },
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych użytkownika" }, { status: 500 })
  }
}


export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Sprawdzenie, czy użytkownik próbuje edytować swój własny profil
    const userId = Number.parseInt(params.id)
    if (isNaN(userId) || userId !== user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do edycji tego profilu" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, bio, location } = body

    // Walidacja danych
    if (!name || !email) {
      return NextResponse.json({ error: "Nazwa i email są wymagane" }, { status: 400 })
    }

    // Sprawdzenie, czy email jest już używany przez innego użytkownika
    if (email !== user.email) {
      const existingUsers = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json({ error: "Ten adres email jest już używany" }, { status: 409 })
      }
    }

    // Aktualizacja danych użytkownika
    await query(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, bio = ?, location = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, email, phone || "", bio || "", location || "", userId],
    )

    // Pobranie zaktualizowanych danych
    const updatedUsers = await query(
      `SELECT 
        id, name, email, phone, bio, avatar, type, verified, created_at as joinedAt, location, categories
       FROM users 
       WHERE id = ?`,
      [userId],
    )

    if (!Array.isArray(updatedUsers) || updatedUsers.length === 0) {
      throw new Error("Nie udało się pobrać zaktualizowanych danych użytkownika")
    }

    const updatedUser = updatedUsers[0]

    // Formatowanie danych
    return NextResponse.json({
      ...updatedUser,
      categories: updatedUser.categories ? JSON.parse(updatedUser.categories) : [],
    })
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych użytkownika:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji danych użytkownika" }, { status: 500 })
  }
}


