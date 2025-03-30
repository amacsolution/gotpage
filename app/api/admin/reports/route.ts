import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db" // Zakładam, że masz już skonfigurowane połączenie z bazą danych

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
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Buduj zapytanie SQL
    let query = `
      SELECT 
        r.id,
        r.reported_type AS type,
        r.reported_id AS targetId,
        r.reason,
        r.status,
        r.created_at AS createdAt,
        u.username AS reportedBy
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
      query += " WHERE " + conditions.join(" AND ")
    }

    // Dodaj sortowanie i paginację
    query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    // Wykonaj zapytanie
    const reports = await db.query(query, queryParams)

    // Pobierz dodatkowe informacje o zgłoszonych elementach
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let targetTitle = ""

        // Pobierz tytuł zgłoszonego elementu w zależności od typu
        if (report.type === "ad") {
          const ad = await db.query("SELECT title FROM ads WHERE id = ?", [report.targetId])
          targetTitle = ad[0]?.title || `Ogłoszenie #${report.targetId}`
        } else if (report.type === "comment") {
          const comment = await db.query(
            "SELECT c.content, a.title FROM comments c JOIN ads a ON c.ad_id = a.id WHERE c.id = ?",
            [report.targetId],
          )
          targetTitle = comment[0] ? `Komentarz do ogłoszenia "${comment[0].title}"` : `Komentarz #${report.targetId}`
        } else if (report.type === "user") {
          const user = await db.query("SELECT username FROM users WHERE id = ?", [report.targetId])
          targetTitle = user[0]?.username || `Użytkownik #${report.targetId}`
        }

        // Pobierz pełną treść zgłoszenia
        const reportDetails = await db.query("SELECT reason FROM reports WHERE id = ?", [report.id])

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
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 })
    }

    // Aktualizuj status zgłoszenia
    await db.query("UPDATE reports SET status = ? WHERE id = ?", [status, id])

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
    await db.query("DELETE FROM reports WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas usuwania zgłoszenia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania zgłoszenia" }, { status: 500 })
  }
}

