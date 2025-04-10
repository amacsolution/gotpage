import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil", // Aktualizacja wersji API
})

// Mapa identyfikatorów cen dla różnych typów promocji i planów
const PRICE_IDS = {
  company: {
    business: process.env.STRIPE_PRICE_STANDARD || "price_1RCPXUQDAXdhlL91yBLVyf5v",
    professional: process.env.STRIPE_PRICE_PREMIUM || "price_1RCPXUQDAXdhlL91ELgMfv2r",
    enterprise: process.env.STRIPE_PRICE_VIP || "price_1RCPXUQDAXdhlL91xMuiEFj4",
  },
  ad: {
    basic: process.env.STRIPE_PRICE_STANDARD || "price_1RCPV4QDAXdhlL916x7e0rHB",
    standard: process.env.STRIPE_PRICE_PREMIUM || "price_1RCPV4QDAXdhlL91AsKlAfFk",
    premium: process.env.STRIPE_PRICE_VIP || "price_1RCPV4QDAXdhlL91KHidmb9d",
  },
}

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan")
    const type = searchParams.get("type") || "company"
    const itemId = searchParams.get("id")

    if (!plan) {
      return NextResponse.json({ error: "Brak wymaganego parametru: plan" }, { status: 400 })
    }

    // Validate promotion type
    if (type !== "company" && type !== "ad") {
      return NextResponse.json({ error: "Nieprawidłowy typ promocji" }, { status: 400 })
    }

    // Get price ID based on plan and type
    const priceId = PRICE_IDS[type as keyof typeof PRICE_IDS]?.[plan as keyof (typeof PRICE_IDS)["company" | "ad"]]

    if (!priceId) {
      return NextResponse.json({ error: "Nieprawidłowy plan lub typ promocji" }, { status: 400 })
    }

    // Get product details based on plan and type
    let productName: string
    let productPrice: number
    let productDescription: string

    if (type === "company") {
      // Company promotion plans (monthly subscriptions)
      switch (plan) {
        case "business":
          productName = "Business"
          productPrice = 99
          productDescription = "Promocja firmy - pakiet Business (subskrypcja miesięczna)"
          break
        case "professional":
          productName = "Professional"
          productPrice = 199
          productDescription = "Promocja firmy - pakiet Professional (subskrypcja miesięczna)"
          break
        case "enterprise":
          productName = "Enterprise"
          productPrice = 399
          productDescription = "Promocja firmy - pakiet Enterprise (subskrypcja miesięczna)"
          break
        default:
          return NextResponse.json({ error: "Nieprawidłowy plan" }, { status: 400 })
      }
    } else {
      // Ad promotion plans
      switch (plan) {
        case "basic":
          productName = "Basic"
          productPrice = 9.99
          productDescription = "Promocja ogłoszenia - pakiet Basic"
          break
        case "standard":
          productName = "Standard"
          productPrice = 19.99
          productDescription = "Promocja ogłoszenia - pakiet Standard"
          break
        case "premium":
          productName = "Premium"
          productPrice = 39.99
          productDescription = "Promocja ogłoszenia - pakiet Premium"
          break
        default:
          return NextResponse.json({ error: "Nieprawidłowy plan" }, { status: 400 })
      }
    }

    // Create metadata for the session
    const metadata: Record<string, string> = {
      userId: user.id.toString(),
      plan,
      type,
    }

    // Add item ID to metadata if provided
    if (itemId) {
      metadata.itemId = itemId
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "blik"], // Dodanie płatności BLIK
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?type=${type}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true&type=${type}`,
      metadata,
      customer_email: user.email,
    })

    // Return checkout URL and product details
    return NextResponse.json({
      url: session.url,
      product: {
        name: productName,
        price: productPrice,
        description: productDescription,
        type,
      },
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas tworzenia sesji płatności" }, { status: 500 })
  }
}
