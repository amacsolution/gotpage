// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// Funkcja pomocnicza do sprawdzania uwierzytelnienia administratora
async function isAdmin(request: NextRequest) {
  const adminToken = (await cookies()).get("admin_token")
  return adminToken && adminToken.value === "authenticated"
}

export async function GET(request: NextRequest) {
  try {
    // Sprawdź, czy użytkownik jest administratorem
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 401 }
      )
    }

    // Pobierz użytkowników z bazy danych
    const users = await db.query(`
      SELECT 
        id, 
        username as name, 
        email, 
        created_at as joinedAt, 
        is_verified as verified
      FROM users
      ORDER BY created_at DESC
    `)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Błąd podczas pobierania użytkowników:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania użytkowników" },
      { status: 500 }
    )
  }
}