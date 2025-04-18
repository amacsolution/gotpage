import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { query } from "@/lib/db"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
})

// Webhook secret for verifying events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = (await headers()).get("stripe-signature") || ""

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret || "")
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const { userId, plan, type, itemId } = session.metadata || {}

        if (!userId || !plan || !type) {
          console.error("Missing required metadata in session:", session.metadata)
          return NextResponse.json({ error: "Missing required metadata" }, { status: 400 })
        }

        // Process the payment based on type
        if (type === "company") {
          await processCompanyPromotion(Number.parseInt(userId), plan)
        } else if (type === "ad") {
          await processAdPromotion(Number.parseInt(userId), plan, itemId ? Number.parseInt(itemId) : undefined)
        }

        break
      }
      // Add other event types as needed
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function isPromoted(postId: number) {
  const id = await query("SELECT ad_id FROM ad_promotions WHERE ad_id = ?", [postId])
  if(Array.isArray(id) && id.length > 0) {
    return true
  }
  return false
}

// Process company promotion
async function processCompanyPromotion(userId: number, plan: string) {
  try {
    // Calculate promotion duration based on plan
    let durationDays = 30 // Default

    switch (plan) {
      case "business":
        durationDays = 30
        break
      case "professional":
        durationDays = 30
        break
      case "enterprise":
        durationDays = 30
        break
    }

    // Calculate end date
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    // Check if user already has an active promotion
    const existingPromotions = await query("SELECT id FROM user_promotions WHERE user_id = ? AND active = 1", [userId])

    if (Array.isArray(existingPromotions) && existingPromotions.length > 0) {
      // Update existing promotion
      await query(
        "UPDATE user_promotions SET plan = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE user_id = ? AND active = 1",
        [plan, startDate, endDate, userId],
      )
    } else {
      // Create new promotion
      await query(
        "INSERT INTO user_promotions (user_id, plan, active, start_date, end_date, created_at) VALUES (?, ?, 1, ?, ?, NOW())",
        [userId, plan, startDate, endDate],
      )
    }

      const posts = await query("SELECT id FROM posts WHERE user_id = ?", [userId])


      if (Array.isArray(posts) && posts.length > 0) {
        // Update posts to promoted status
        posts.map(async (post: any, ) => {
          await isPromoted(post.id)
          await query(
            `INSERT INTO ad_promotions (
              ad_id, 
              start_date, 
              end_date, 
              created_at
            ) VALUES (?, NOW(), ?, NOW())`,
            [post.id, endDate],)
        })
        }
        let message
      
    // Update user's verified status if not already verified
    if(Number(await query("SELECT verified FROM users WHERE user_id = ?", [userId])) === 1){
      message = "Twoja firma została zweryfikowana. Możesz korzystać z promocji."
    } else {
      await query("INSERT INTO verification_waiting (user_id, time) VALUES (?, NOW())", [userId]) 
      message =  "Twoja firma oczekuje na weryfikacje. Możesz korzystać z promocji."
    }    
     
    await query("INSERT INTO notifications (user_id, title, type, message, related_type, created_at) VALUES (?, ?, system, ?, system, NOW())", [
      userId, "Weryfikacja", message])

  } catch (error) {
    console.error("Error processing company promotion:", error)
    throw error
  }
}

// Process ad promotion
async function processAdPromotion(userId: number, plan: string, adId?: number) {
  try {
    // Calculate promotion duration based on plan
    let durationDays = 7 // Default

    switch (plan) {
      case "basic":
        durationDays = 7
        break
      case "standard":
        durationDays = 14
        break
      case "premium":
        durationDays = 30
        break
    }

    // Calculate end date
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    if (adId) {
      // Check if ad exists and belongs to user
      const ads = await query("SELECT id FROM ads WHERE id = ? AND user_id = ?", [adId, userId])

      if (!Array.isArray(ads) || ads.length === 0) {
        throw new Error(`Ad ${adId} not found or does not belong to user ${userId}`)
      }

      // Update ad to promoted status
      await query("UPDATE ads SET promoted = 1 WHERE id = ?", [adId])

      // Check if ad already has an active promotion
      const existingPromotions = await query("SELECT id FROM ad_promotions WHERE ad_id = ? AND end_date > NOW()", [
        adId,
      ])

      if (Array.isArray(existingPromotions) && existingPromotions.length > 0) {
        // Update existing promotion
        await query("UPDATE ad_promotions SET start_date = ?, end_date = ? WHERE ad_id = ?", [startDate, endDate, adId])
      } else {
        // Create new promotion
        await query("INSERT INTO ad_promotions (ad_id, start_date, end_date, created_at) VALUES (?, ?, ?, NOW())", [
          adId,
          startDate,
          endDate,
        ])
      }

    } else {
      // If no specific ad ID, store credit for the user to use later
      // This would require additional tables and UI for the user to apply the promotion
      console.error(`Ad promotion credit stored for user ${userId}, plan: ${plan}`)
    }
  } catch (error) {
    console.error("Error processing ad promotion:", error)
    throw error
  }
}
