import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { UserData } from "../../profile/route"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const companyId = Number.parseInt(params.id)

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID firmy" }, { status: 400 })
    }

    // Pobieranie danych firmy
    const companies = await query(
      `SELECT 
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
        u.categories,
        (SELECT COUNT(*) FROM user_reviews WHERE user_id = u.id) as reviewCount,
        (SELECT AVG(rating) FROM user_reviews WHERE user_id = u.id) as rating
      FROM users u
      WHERE u.id = ? AND u.type = 'business'`,
      [companyId],
    )  as UserData[]

    if (!Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: "Firma nie została znaleziona" }, { status: 404 })
    }

    const company = companies[0]

    // Parsowanie kategorii
    let categories = []
    try {
      if (company.categories) {
        categories = JSON.parse(company.categories)
      }
    } catch (e) {
      console.error("Błąd parsowania kategorii:", e)
    }

    // Formatowanie danych
    const formattedCompany = {
      ...company,
      categories: categories,
      rating: company.rating || 0,
      reviewCount: company.reviewCount || 0,
    }

    return NextResponse.json(formattedCompany)
  } catch (error) {
    console.error("Błąd podczas pobierania danych firmy:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych firmy" }, { status: 500 })
  }
}

