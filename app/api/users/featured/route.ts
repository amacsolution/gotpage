import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { UserData } from "../../profile/route"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.id

    // Fetch featured users (users with most ads or highest ratings)
    let featuredUsersQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.fullname,
        u.email, 
        u.phone, 
        u.description as bio, 
        u.avatar, 
        u.background_img as backgroundImage,
        u.type, 
        u.verified, 
        u.created_at as joinedAt, 
        u.location,
        u.adress,
        u.categories,
        u.occupation,
        u.interests,
        u.company_size,
        u.website,
        (SELECT COUNT(*) FROM ads WHERE user_id = u.id AND active = 1) as adCount,
        (SELECT AVG(rating) FROM reviews WHERE user_id = u.id) as rating,
        (SELECT COUNT(*) FROM user_follows WHERE target_id = u.id) as followerCount
      FROM users u 
    `
    let featuredUsers

    if (userId) {
      featuredUsersQuery += `
        WHERE u.id != ? AND u.avatar != '/placeholder-profile.svg?height=100&width=100' AND type = "individual" AND u.verified_email = 1
        ORDER BY RAND() DESC
        LIMIT 8
      ` //NOTE: adCount DESC, rating ,
      featuredUsers = await query(featuredUsersQuery, [userId]) as UserData[]
    } else {
      featuredUsersQuery += `
        WHERE u.avatar != '/placeholder-profile.svg?height=100&width=100' AND u.type = "individual" AND u.verified_email = 1
        ORDER BY RAND() DESC 
        LIMIT 8
      ` //NOTE: adCount DESC, rating ,
      featuredUsers = await query(featuredUsersQuery) as UserData[]
    }


    // If user is logged in, check which users they are following
    if (userId) {
      const followingQuery = `
        SELECT target_id 
        FROM user_follows 
        WHERE follower_id = ?
      `
      const followingData = await query(followingQuery, [userId]) as any[]
      const followingIds = followingData.map((row: any) => row.followed_id)

      // Add isFollowing flag to each user
      featuredUsers.forEach((user: any) => {
        user.isFollowing = followingIds.includes(user.id)
      })
    } else {
      // If not logged in, no users are being followed
      featuredUsers.forEach((user: any) => {
        user.isFollowing = false
      })
    }

    return NextResponse.json(featuredUsers)
  } catch (error) {
    console.error("Error fetching featured users:", error)
    return NextResponse.json({ error: "Failed to fetch featured users" }, { status: 500 })
  }
}
