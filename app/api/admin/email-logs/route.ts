import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Hasło administratora z zmiennych środowiskowych
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function GET(request: NextRequest) {
  try {
    // Pobierz parametry z URL
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const offset = (page - 1) * limit

    // Przygotuj zapytanie z wyszukiwaniem
    let query = "SELECT * FROM email_logs"
    let countQuery = "SELECT COUNT(*) as total FROM email_logs"
    let params: any[] = []

    if (search) {
      query += " WHERE email_to LIKE ? OR subject LIKE ? OR template_type LIKE ?"
      countQuery += " WHERE email_to LIKE ? OR subject LIKE ? OR template_type LIKE ?"
      const searchParam = `%${search}%`
      params = [searchParam, searchParam, searchParam]
    }

    // Dodaj sortowanie i paginację
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Pobierz logi
    interface EmailLog {
      email_to: string;
      subject: string;
      template_type: string;
      created_at: string;
    }

    interface CountResult {
      total: number;
    }

    const result = await db.query(query, params) as EmailLog[]

    // Pobierz całkowitą liczbę logów
    const countResult = await db.query(countQuery, search ? [params[0], params[1], params[2]] : [])  as CountResult[]
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      logs: result,
      page,
      limit,
      total,
      totalPages,
    })
  } catch (error) {
    console.error("Błąd podczas pobierania logów emaili:", error)
    return NextResponse.json(
      { success: false, error: "Wystąpił błąd podczas pobierania logów emaili" },
      { status: 500 },
    )
  }
}
