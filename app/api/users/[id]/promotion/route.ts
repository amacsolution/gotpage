import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik próbuje pobrać dane swojej promocji lub ma uprawnienia administratora
    if (userId !== user.id && user.type !== "admin") {
      return NextResponse.json({ error: "Nie masz uprawnień do pobrania tych danych" }, { status: 403 })
    }

    // Pobranie danych promocji
    try {
      const promotions = await query(
        `SELECT 
          id, 
          plan, 
          active, 
          start_date as startDate, 
          end_date as endDate 
        FROM user_promotions 
        WHERE user_id = ? AND active = 1 
        ORDER BY end_date DESC 
        LIMIT 1`,
        [userId],
      )

      if (!Array.isArray(promotions) || promotions.length === 0) {
        return NextResponse.json({
          active: false,
          plan: null,
          endDate: null,
        })
      }

      const promotion = promotions[0]

      // Formatowanie danych
      return NextResponse.json({
        active: promotion.active === 1,
        plan: promotion.plan,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
      })
    } catch (error) {
      console.error("Błąd podczas pobierania danych promocji:", error)
      // Jeśli tabela nie istnieje, zwracamy domyślne wartości
      return NextResponse.json({
        active: false,
        plan: null,
        endDate: null,
      })
    }
  } catch (error) {
    console.error("Błąd podczas pobierania danych promocji:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych promocji" }, { status: 500 })
  }
}

