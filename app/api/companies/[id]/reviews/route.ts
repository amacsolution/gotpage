import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Pobieranie opinii dla użytkownika
    const reviews = await query(
      `SELECT 
        r.id, 
        r.rating, 
        r.content, 
        r.created_at as createdAt,
        u.id as reviewer_id, 
        u.name as reviewer_name, 
        u.avatar as reviewer_avatar
      FROM user_reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    )

    if (!Array.isArray(reviews)) {
      return NextResponse.json({ reviews: [], total: 0 })
    }

    // Pobieranie całkowitej liczby opinii
    const totalResult = await query("SELECT COUNT(*) as count FROM user_reviews WHERE user_id = ?", [userId])

    const total = Array.isArray(totalResult) && totalResult[0]?.count ? Number.parseInt(totalResult[0].count) : 0

    // Formatowanie danych
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      reviewer: {
        id: review.reviewer_id,
        name: review.reviewer_name,
        avatar: review.reviewer_avatar,
      },
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Błąd podczas pobierania opinii:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania opinii" }, { status: 500 })
  }
}

// Endpoint do dodawania nowej opinii
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik nie dodaje opinii dla samego siebie
    if (userId === user.id) {
      return NextResponse.json({ error: "Nie możesz dodać opinii dla samego siebie" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik już dodał opinię dla tego użytkownika
    const existingReview = await query("SELECT id FROM user_reviews WHERE user_id = ? AND reviewer_id = ?", [
      userId,
      user.id,
    ])

    if (Array.isArray(existingReview) && existingReview.length > 0) {
      return NextResponse.json({ error: "Już dodałeś opinię dla tego użytkownika" }, { status: 400 })
    }

    const body = await request.json()
    const { rating, content } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Ocena musi być liczbą od 1 do 5" }, { status: 400 })
    }

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Treść opinii nie może być pusta" }, { status: 400 })
    }

    // Dodanie opinii
    const result = await query(
      "INSERT INTO user_reviews (user_id, reviewer_id, rating, content, created_at) VALUES (?, ?, ?, ?, NOW())",
      [userId, user.id, rating, content],
    )

    if (!result || !result.insertId) {
      throw new Error("Nie udało się dodać opinii")
    }

    // Pobranie dodanej opinii
    const reviews = await query(
      `SELECT 
        r.id, 
        r.rating, 
        r.content, 
        r.created_at as createdAt,
        u.id as reviewer_id, 
        u.name as reviewer_name, 
        u.avatar as reviewer_avatar
      FROM user_reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.id = ?`,
      [result.insertId],
    )

    if (!Array.isArray(reviews) || reviews.length === 0) {
      throw new Error("Nie udało się pobrać dodanej opinii")
    }

    const review = reviews[0]

    // Formatowanie danych
    const formattedReview = {
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      reviewer: {
        id: review.reviewer_id,
        name: review.reviewer_name,
        avatar: review.reviewer_avatar,
      },
    }

    return NextResponse.json(formattedReview)
  } catch (error) {
    console.error("Błąd podczas dodawania opinii:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania opinii" }, { status: 500 })
  }
}

