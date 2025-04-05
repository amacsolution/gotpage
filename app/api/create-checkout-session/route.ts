import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
})

export async function POST() {
  try {
    // Utwórz sesję Checkout z metodami płatności karta i Przelewy24
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "p24"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: "Twój Produkt",
              description: "Opis produktu",
            },
            unit_amount: 9900, // 99.00 PLN
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      currency: "pln",
      locale: "pl",
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/checkout`,
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
    })
  } catch (error) {
    console.error("Błąd podczas tworzenia sesji płatności:", error)
    return NextResponse.json({ error: "Nie udało się utworzyć sesji płatności" }, { status: 500 })
  }
}

