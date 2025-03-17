import { NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Sprawdzenie autoryzacji
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const body = await req.json()
    const { adId, promotionType } = body

    if (!adId || !promotionType) {
      return NextResponse.json({ error: "Brakujące wymagane pola" }, { status: 400 })
    }

    // Określenie ceny na podstawie typu promocji
    let priceId
    let amount

    switch (promotionType) {
      case "standard":
        priceId = process.env.STRIPE_PRICE_STANDARD as string
        amount = 10
        break
      case "premium":
        priceId = process.env.STRIPE_PRICE_PREMIUM as string
        amount = 20
        break
      case "vip":
        priceId = process.env.STRIPE_PRICE_VIP as string
        amount = 50
        break
      default:
        return NextResponse.json({ error: "Nieprawidłowy typ promocji" }, { status: 400 })
    }

    // Tworzenie sesji płatności
    const { sessionId } = await createCheckoutSession({
      priceId,
      quantity: 1,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/ogloszenia/${adId}/promocja/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/ogloszenia/${adId}/promocja/anulowano`,
      metadata: {
        adId: adId.toString(),
        userId: user.id.toString(),
        promotionType,
        amount: amount.toString(),
      },
    })

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("Błąd podczas tworzenia sesji płatności:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas przetwarzania płatności" }, { status: 500 })
  }
}

