import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

async function isAdmin(request: NextRequest) {
  const adminToken = (await cookies()).get("admin_token")
  return adminToken && adminToken.value === "authenticated"
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    const id = await params.id
    const body = await req.json()
    const { status } = body

    if (!status || !["new", "in_progress", "completed", "archived"].includes(status)) {
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 })
    }

    await query(
      `
        UPDATE contact_messages
        SET status = ?
        WHERE id = ?
      `,
      [status, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contact message:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas aktualizacji wiadomości" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) { 
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 })
    }

    if(!params.id) {
      return NextResponse.json({ error: "Brak id" }, { status: 400 })
    }

    const id = Number.parseInt(await params.id)

    console.log("Deleting contact message with ID:", id)

    await query("DELETE FROM contact_messages WHERE id = ?" , [id])
    console.log("Contact message deleted successfully")

      return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania wiadomości" }, { status: 500 })
  }
}
