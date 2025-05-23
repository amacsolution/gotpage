import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { AdData } from "../ads/route"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportedType, reportedId, reason } = await req.json()

    if (!reportedType || !reportedId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate reported type
    if (!["ad", "comment", "user"].includes(reportedType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Check if the reported item exists
    let exists = false
    if (reportedType === "ad") {
      const ad = await query("SELECT id FROM ads WHERE id = ?", [reportedId]) as AdData[]
      exists = ad.length > 0
    } else if (reportedType === "comment") {
      const comment = await query("SELECT id FROM comments WHERE id = ?", [reportedId]) as Comment[]
      exists = comment.length > 0
    } else if (reportedType === "user") {
      const user = await query("SELECT id FROM users WHERE id = ?", [reportedId]) as { id: string }[]
      exists = user.length > 0
    }

    if (!exists) {
      return NextResponse.json({ error: "Reported item does not exist" }, { status: 404 })
    }

    // Insert report
    const result = await query(
      "INSERT INTO reports (reporter_id, reported_type, reported_id, reason) VALUES (?, ?, ?, ?)",
      [session.id, reportedType, reportedId, reason],
    ) as { insertId: string }[]

    return NextResponse.json({ success: true, reportId: result[0].insertId })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status") || "all"
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let sqlquery = `
      SELECT r.*, 
             u1.username as reporter_username,
             u1.email as reporter_email
      FROM reports r
      JOIN users u1 ON r.reporter_id = u1.id
      WHERE 1=1
    `

    const queryParams: any[] = []

    if (status !== "all") {
      sqlquery += " AND r.status = ?"
      queryParams.push(status)
    }

    if (type !== "all") {
      sqlquery += " AND r.reported_type = ?"
      queryParams.push(type)
    }

    sqlquery += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    const reports = await query(sqlquery, queryParams)

    // Get count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM reports WHERE 1=1"
    const countParams: any[] = []

    if (status !== "all") {
      countQuery += " AND status = ?"
      countParams.push(status)
    }

    if (type !== "all") {
      countQuery += " AND reported_type = ?"
      countParams.push(type)
    }

    const countResult = await query(countQuery, countParams) as { total: number }[]
    const total = countResult[0].total

    return NextResponse.json({
      reports,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

