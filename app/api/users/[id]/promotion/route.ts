import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

interface Promotion {
  id: number
  plan: string
  active: number
  startDate: string
  endDate: string
  
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik próbuje pobrać dane swojej promocji lub ma uprawnienia administratora
    if (userId !== user.id.toString() && user.type !== "admin") {
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
      ) as Promotion[]

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

