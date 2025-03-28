import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const userType = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "3")

    if (!userId || !userType) {
      return NextResponse.json({ error: "Brak wymaganych parametrów: id i type" }, { status: 400 })
    }

    // Pobranie kategorii użytkownika (jeśli jest firmą)
    let userCategories: string[] = []
    if (userType === "business") {
      const categoriesResult = await query("SELECT categories FROM users WHERE id = ?", [userId])

      if (Array.isArray(categoriesResult) && categoriesResult.length > 0 && categoriesResult[0].categories) {
        try {
          userCategories = JSON.parse(categoriesResult[0].categories)
        } catch (e) {
          console.error("Błąd parsowania kategorii:", e)
        }
      }
    }

    // Budowanie zapytania SQL
    let sql = `
      SELECT 
        id, 
        name, 
        avatar, 
        type, 
        verified, 
        location, 
        categories
      FROM users 
      WHERE id != ? AND type = ?
    `

    const params: any[] = [userId, userType]

    // Dodanie filtrowania po lokalizacji (jeśli dostępne)
    if (userType === "business" && userCategories.length > 0) {
      // Dla firm szukamy podobnych kategorii
      sql += " AND JSON_OVERLAPS(categories, ?)"
      params.push(JSON.stringify(userCategories))
    }

    // Dodanie limitu
    sql += " ORDER BY RAND() LIMIT ?"
    params.push(limit)

    const similarUsers = await query(sql, params)

    if (!Array.isArray(similarUsers)) {
      return NextResponse.json([])
    }

    // Formatowanie danych
    const formattedUsers = similarUsers.map((user) => ({
      ...user,
      categories: user.categories ? JSON.parse(user.categories) : [],
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Błąd podczas pobierania podobnych użytkowników:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania podobnych użytkowników" }, { status: 500 })
  }
}

