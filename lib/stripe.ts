import { loadStripe } from "@stripe/stripe-js"
import Stripe from "stripe"

// Inicjalizacja Stripe na kliencie
export const getStripe = async () => {
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  const stripePromise = loadStripe(stripePublicKey)
  return stripePromise
}

// Inicjalizacja Stripe na serwerze
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
})

// Funkcja do tworzenia sesji płatności
export const createCheckoutSession = async (options: {
  priceId: string
  quantity: number
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) => {
  const { priceId, quantity, successUrl, cancelUrl, metadata } = options

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error("Błąd podczas tworzenia sesji płatności:", error)
    throw error
  }
}

