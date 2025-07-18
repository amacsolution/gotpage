import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reportId = params.id
    const { status } = await req.json()

    if (!status || !["pending", "reviewed", "resolved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update report status
    await query("UPDATE reports SET status = ? WHERE id = ?", [status, reportId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reportId = params.id

    // Get report details to determine what to delete
    const reports = await query("SELECT reported_type, reported_id FROM reports WHERE id = ?", [reportId]) as { reported_type: string, reported_id: string }[]

    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const report = reports[0]

    // Delete the reported item
    if (report.reported_type === "ad") {
      await query("DELETE FROM ads WHERE id = ?", [report.reported_id])
    } else if (report.reported_type === "comment") {
      await query("DELETE FROM comments WHERE id = ?", [report.reported_id])
    } else if (report.reported_type === "user") {
      await query("DELETE FROM users WHERE id = ?", [report.reported_id])
    }

    // Update report status
    await query("UPDATE reports SET status = ? WHERE id = ?", ["resolved", reportId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

