import { type NextRequest, NextResponse } from "next/server"
import { db, query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Pobierz parametry z URL
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")

    const offset = (page - 1) * limit

    // Sprawdź, czy tabela email_logs istnieje

    // Przygotuj zapytanie z wyszukiwaniem
    let fquery = "SELECT * FROM email_logs"
    let countQuery = "SELECT COUNT(*) as total FROM email_logs"
    let params: any[] = []

    if (search) {
      fquery += " WHERE email_to LIKE ? OR subject LIKE ? OR template_type LIKE ?"
      countQuery += " WHERE email_to LIKE ? OR subject LIKE ? OR template_type LIKE ?"
      const searchParam = `%${search}%`
      params = [searchParam, searchParam, searchParam]
    }

    // Dodaj sortowanie i paginację
    fquery += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    const queryParams = [...params, limit, offset]

    // Pobierz logi
    const result = await query(fquery, queryParams) as any[]
    // Pobierz całkowitą liczbę logów
    const countResult = await query(countQuery, search ? [params[0], params[1], params[2]] : []) as { rows?: { total: number }[] } 
    const total = countResult.rows && countResult.rows.length > 0 ? countResult.rows[0].total : 0
    const totalPages = Math.ceil(total / limit) || 1

    return NextResponse.json({
      logs: result[0],
      page,
      limit,
      total,
      totalPages,
    })
  } catch (error) {
    console.error("Błąd podczas pobierania logów emaili:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Wystąpił błąd podczas pobierania logów emaili",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
