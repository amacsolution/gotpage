import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db, query } from "@/lib/db"

// Funkcja pomocnicza do sprawdzania uwierzytelnienia administratora
async function isAdmin(request: NextRequest) {
  const adminToken = (await cookies()).get("admin_token")
  return adminToken && adminToken.value === "authenticated"
}

// GET - Pobieranie zgłoszeń z możliwością filtrowania
export async function GET(request: NextRequest) {
  try {
    // Sprawdź, czy użytkownik jest administratorem
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    // Pobierz parametry zapytania
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Buduj zapytanie SQL
    let fquery = `
      SELECT 
        r.id,
        r.reported_type AS type,
        r.reported_id AS targetId,
        r.reason,
        r.status,
        r.created_at AS createdAt,
        u.name AS reportedBy
      FROM 
        reports r
      JOIN 
        users u ON r.reporter_id = u.id
    `

    const queryParams = []
    const conditions = []

    // Dodaj warunki filtrowania
    if (status && status !== "all") {
      conditions.push("r.status = ?")
      queryParams.push(status)
    }

    if (type) {
      conditions.push("r.reported_type = ?")
      queryParams.push(type)
    }

    // Dodaj warunki do zapytania, jeśli istnieją
    if (conditions.length > 0) {
      fquery += " WHERE " + conditions.join(" AND ")
    }

    // Dodaj sortowanie i paginację
    fquery += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?", [limit, offset]  
    queryParams.push(limit, offset)

    // Wykonaj zapytanie
    const [reports] = await query(fquery, queryParams)   as any[]

    type Reports = {
      id: number,
      type: "ad" | "ad_comment" | "news_comment" | "user",
      targetId: number,
      reason: string,
      status: string,
      createdAt: string,
      reportedBy: string,
    }

    type User = {
      id: number,
      username: string,
      email: string,}

    type Ad = {
      id: number,
      title: string,
    }

    type Comment = {
        id: number,
        content: string,
        title: string,
    }


    type Details = {
      reason: string,
    }

    // Pobierz dodatkowe informacje o zgłoszonych elementach
    const enrichedReports = await Promise.all(
      (reports as Reports[]).map(async (report) => {
        let targetTitle = ""

        // Pobierz tytuł zgłoszonego elementu w zależności od typu
        if (report.type === "ad") {
          const ad = await query("SELECT title FROM ads WHERE id = ?", [report.targetId]) as Ad[]
          targetTitle = ad[0].title || `Ogłoszenie #${report.targetId}`

        } 
        else if (report.type === "ad_comment") {
          const comment = await query(
            `SELECT c.content, a.title FROM ad_comments c JOIN ads a ON c.ad_id = a.id WHERE c.id = ?`
            [report.targetId]
          ) as Comment[]
          targetTitle = comment[0] ? `Komentarz do ogłoszenia "${comment[0].title}"` : `Komentarz #${report.targetId}`

        } 
        else if (report.type === "news_comment") {
          const comment = await query(
            `SELECT c.content as news_comment_content, a.content as post_content FROM news_comments c JOIN news_posts a ON c.post_id = a.id WHERE c.id = ?`
            [report.targetId] )  as Comment[]
            targetTitle = comment[0] ? `Komentarz do wpisu "${comment[0].title}"` : `Wpis #${report.targetId}`

        } 
        else if (report.type === "user") {
          const user = await query("SELECT name FROM users WHERE id = ?", [report.targetId]) as User[]
          targetTitle = user[0]?.username || `Użytkownik #${report.targetId}`

        }

        // Pobierz pełną treść zgłoszenia
        const reportDetails = await query("SELECT reason FROM reports WHERE id = ?", [report.id]) as Details[]

        const description = reportDetails[0]?.reason || ""

        return {
          ...report,
          targetTitle,
          description,
        }
      }),
    )

    return NextResponse.json(enrichedReports)
  } catch (error) {
    console.error("Błąd podczas pobierania zgłoszeń:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania zgłoszeń" }, { status: 500 })
  }
}

// PATCH - Aktualizacja statusu zgłoszenia
export async function PATCH(request: NextRequest) {
  try {
    // Sprawdź, czy użytkownik jest administratorem
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    const { id, status } = await request.json()

    // Sprawdź, czy status jest prawidłowy
    const validStatuses = ["pending", "reviewed", "resolved", "rejected"]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Nieprawidłowy status" + status }, { status: 400 }, )
      
    }

    // Aktualizuj status zgłoszenia
    await query("UPDATE reports SET status = ? WHERE id = ?", [status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas aktualizacji zgłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji zgłoszenia" }, { status: 500 })
  }
}

// DELETE - Usuwanie zgłoszenia
export async function DELETE(request: NextRequest) {
  try {
    // Sprawdź, czy użytkownik jest administratorem
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Brak identyfikatora zgłoszenia" }, { status: 400 })
    }

    // Usuń zgłoszenie
    await query("DELETE FROM reports WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas usuwania zgłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania zgłoszenia" }, { status: 500 })
  }
}

