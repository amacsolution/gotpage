import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { UserData } from "../profile/route"
import { RowDataPacket } from "mysql2"


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const searchQuery = searchParams.get("q")
    const sortBy = searchParams.get("sortBy") || "rating"
    const offset = (page - 1) * limit

    // Budowanie zapytania SQL
    let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone,
        u.bio, 
        u.avatar, 
        u.type, 
        u.verified, 
        u.created_at as joinedAt, 
        u.location, 
        u.coordinates,
        u.categories,
        (SELECT COUNT(*) FROM user_reviews WHERE user_id = u.id) as reviewCount,
        (SELECT AVG(rating) FROM user_reviews WHERE user_id = u.id) as rating
      FROM users u
      WHERE u.type = 'business'
    `

    const params: any[] = []

    // Dodanie filtrów
    if (category) {
      sql += " AND JSON_CONTAINS(u.categories, ?)"
      params.push(`"${category}"`)
    }

    if (location) {
      sql += " AND u.location LIKE ?"
      params.push(`%${location}%`)
    }

    if (searchQuery) {
      sql += " AND (u.name LIKE ? OR u.bio LIKE ?)"
      params.push(`%${searchQuery}%`, `%${searchQuery}%`)
    }

    // Dodanie sortowania
    switch (sortBy) {
      case "name_asc":
      sql += " ORDER BY u.name ASC, RAND()"
      break
      case "name_desc":
      sql += " ORDER BY u.name DESC, RAND()"
      break
      case "newest":
      sql += " ORDER BY u.created_at DESC, RAND()"
      break
      case "popular":
      sql += " ORDER BY reviewCount DESC, RAND()"
      break
      case "rating":
      default:
      sql += " ORDER BY RAND()" //rating DESC, reviewCount DESC,
      break
    }

    sql += " LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const companies = await query(sql, params) as UserData[]

    if (!Array.isArray(companies)) {
      return NextResponse.json({ companies: [], total: 0 })
    }

    // Pobranie całkowitej liczby firm spełniających kryteria
    let countSql = `
      SELECT COUNT(*) as count 
      FROM users u
      WHERE u.type = 'business'
    `

    const countParams: any[] = []

    if (category) {
      countSql += " AND JSON_CONTAINS(u.categories, ?)"
      countParams.push(`"${category}"`)
    }

    if (location) {
      countSql += " AND u.location LIKE ?"
      countParams.push(`%${location}%`)
    }

    if (searchQuery) {
      countSql += " AND (u.name LIKE ? OR u.bio LIKE ?)"
      countParams.push(`%${searchQuery}%`, `%${searchQuery}%`) 
    }

    const totalResult = await query(countSql, countParams)
    const total = Array.isArray(totalResult) && (totalResult as RowDataPacket[])[0]?.count ? Number.parseInt((totalResult as RowDataPacket[])[0].count as string) : 0

    // Formatowanie danych
    const formattedCompanies = companies.map((company) => {
      let categories = [];
      let coordinates = null;

      try {
      if (company.categories) {
        categories = JSON.parse(company.categories);
      }
      } catch (e) {
      console.error("Błąd parsowania kategorii:", e);
      }

      try {
      if (company.coordinates) {
        coordinates = JSON.parse(company.coordinates);
      }
      } catch (e) {
      console.error("Błąd parsowania współrzędnych:", e);
      }

      return {
      ...company,
      categories: categories,
      coordinates: coordinates,
      rating: company.rating || 0,
      reviewCount: company.reviewCount || 0,
      };
    });

    return NextResponse.json({
      companies: formattedCompanies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Błąd podczas pobierania firm:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania firm" }, { status: 500 })
  }
}

