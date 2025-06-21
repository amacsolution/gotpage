import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const body = await req.json()
    const { adId } = body

    if (!adId) {
      return NextResponse.json({ error: "Brak ID ogłoszenia" }, { status: 400 })
    }

    // Check if user already liked this ad
    const existingLikes = await query("SELECT * FROM ad_likes WHERE user_id = ? AND ad_id = ?", [user.id, adId])

    if (Array.isArray(existingLikes) && existingLikes.length > 0) {
      // User already liked this ad, so remove the like
      await query("DELETE FROM ad_likes WHERE user_id = ? AND ad_id = ?", [user.id, adId])

      // Update the like count in the ads table
      await query("UPDATE ads SET likes = likes - 1 WHERE id = ?", [adId])

      return NextResponse.json({ liked: false, message: "Polubienie usunięte" })
    } else {
      // User hasn't liked this ad yet, so add a like
      await query("INSERT INTO ad_likes (user_id, ad_id, created_at) VALUES (?, ?, NOW())", [user.id, adId])

      // Update the like count in the ads table
      await query("UPDATE ads SET likes = likes + 1 WHERE id = ?", [adId])

      return NextResponse.json({ liked: true, message: "Ogłoszenie polubione" })
    }
  } catch (error) {
    console.error("Błąd podczas obsługi polubienia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas obsługi polubienia" }, { status: 500 })
  }
}

// Check if user has liked an ad
export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ liked: false }, { status: 200 })
    }

    const url = new URL(req.url)
    const adId = url.searchParams.get("adId")

    if (!adId) {
      return NextResponse.json({ error: "Brak ID ogłoszenia" }, { status: 400 })
    }

    // Check if user already liked this ad
    const existingLikes = await query("SELECT * FROM ad_likes WHERE user_id = ? AND ad_id = ?", [user.id, adId])

    const liked = Array.isArray(existingLikes) && existingLikes.length > 0

    return NextResponse.json({ liked })
  } catch (error) {
    console.error("Błąd podczas sprawdzania polubienia:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas sprawdzania polubienia" }, { status: 500 })
  }
}

