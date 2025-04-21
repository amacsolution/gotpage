import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import Stripe from "stripe"
import { query } from "@/lib/db"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil", // Aktualizacja wersji API
})

// Mapa identyfikatorów cen dla różnych typów promocji i planów
const PRICE_IDS = {
  company: {
    business: process.env.STRIPE_COMPANY_PRICE_STANDARD || "" ,
    professional: process.env.STRIPE_COMPANY_PRICE_PREMIUM || "" ,
    enterprise: process.env.STRIPE_COMPANY_PRICE_VIP || "",
  },
  ad: {
    basic: process.env.STRIPE_AD_PRICE_STANDARD || "",
    standard: process.env.STRIPE_AD_PRICE_PREMIUM || "",
    premium: process.env.STRIPE_AD_PRICE_VIP || "",
  },
}

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const user = await auth(request) as { id: number; email: string; stripeCustomerId: string } | null
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan")
    const type = searchParams.get("type") || "company"
    const itemId = searchParams.get("id")

    if(type === "business"){
          // Check if user has a valid subscription
      const userSubscription = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      })

      const userCheck = await query(
        `SELECT active FROM user_promotions WHERE user_id = ?`,
        [user.id]
      ) as { active: number }[]

      if (userSubscription.data.length > 0 || userCheck[0].active == 1 ) {
        return NextResponse.json({ error: "Już masz aktywną subskrypcję" }, { status: 400 })
      }
    }

    if (!plan) {
      return NextResponse.json({ error: "Brak wymaganego parametru: plan" }, { status: 400 })
    }

    //Validate ad id
    if (type === "ad" ) {
      if(!itemId) NextResponse.json({ error: "Brak wymaganego parametru: id" }, { status: 400 })
      const promotionCheck = await query(
        `SELECT promoted FROM ads WHERE user_id = ? AND id = ?`,
        [user.id, itemId]
      ) as { promoted: number }[]

      if (promotionCheck[0].promoted == 1 ) {
        return NextResponse.json({ error: "Ogłoszenie jest już promowane" }, { status: 400 })
      }
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
          productPrice = 80
          productDescription = "Promocja firmy - pakiet Business (subskrypcja miesięczna)"
          break
        case "professional":
          productName = "Professional"
          productPrice = 109
          productDescription = "Promocja firmy - pakiet Professional (subskrypcja miesięczna)"
          break
        case "enterprise":
          productName = "Enterprise"
          productPrice = 149
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
          productDescription = "Promocja ogłoszenia - pakiet Premium (subskrypcja miesięczna)"
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

    const mode = type === "company" ? "subscription" : "payment"


    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: type === "company" ? ["card"] : ["card", "blik", "p24"], // Dodanie płatności BLIK
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
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
