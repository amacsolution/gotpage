import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Brakuje wymaganych pól" }, { status: 400 })
    }

    // Insert into database
    const result = await query(
      `
        INSERT INTO contact_messages (name, email, phone, subject, message, created_at, status)
        VALUES (?, ?, ?, ?, ?, NOW(), 'new')
      `,
      [name, email, phone || null, subject, message]
    ) as {insertId: number}

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas przetwarzania formularza" }, { status: 500 })
  }
}

async function isAdmin(request: NextRequest) {
  const adminToken = (await cookies()).get("admin_token")
  return adminToken && adminToken.value === "authenticated"
}

export async function GET(req: NextRequest) {

  
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }


    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const status = searchParams.get("status") || "all"

    let statusFilter = ""
    if (status !== "all") {
      statusFilter = "WHERE status = ?"
    }

    // Get total count
    const countResult = await query(
        `
        SELECT COUNT(*) as total FROM contact_messages
        ${status !== "all" ? statusFilter : ""}
        `,
        status !== "all" ? [status] : []
    ) as {total: number}[]

    const total = countResult[0].total

    // Get messages
    const messages = await query(
      `
        SELECT id, name, email, phone, subject, message, created_at, status
        FROM contact_messages
        ${status !== "all" ? statusFilter : ""}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      status !== "all" ? [status, limit, offset] : [limit, offset]
    )

    return NextResponse.json({
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania wiadomości" }, { status: 500 })
  }
}

