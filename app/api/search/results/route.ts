import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Upewnij się, że eksportujesz funkcję GET jako domyślną funkcję obsługi żądań GET
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q")
    const type = searchParams.get("type") || "all"


    if (!searchQuery || searchQuery.length < 2) {
      return NextResponse.json({
        ads: [],
        users: [],
        companies: [],
        news: [],
      })
    }

    // Definiujemy interfejsy dla typów wyników
    interface Ad {
      id: number
      title: string
      description: string
      price: string
      category: string
      subcategory: string
      location: string
      user_name: string
      user_avatar: string
      likes_count: number
      [key: string]: any
    }

    interface User {
      id: string
      name: string
      avatar: string
      bio: string
      location: string
      type: string
      [key: string]: any
    }

    interface Company extends User {
      categories: string
    }

    interface NewsPost {
      id: number
      content: string
      image: string
      created_at: string
      user_id: string
      author_name: string
      [key: string]: any
    }

    interface Results {
      ads: Ad[]
      users: User[]
      companies: Company[]
      news: NewsPost[]
    }

    const results: Results = {
      ads: [],
      users: [],
      companies: [],
      news: [],
    }

    // Fetch ads
    if (type === "all" || type === "ads") {
      try {
        const adResults = await query(
          `
          SELECT 
            a.*,
            u.name as user_name,
            u.avatar as user_avatar,
            (SELECT COUNT(*) FROM ad_likes WHERE ad_id = a.id) as likes_count
          FROM ads a
          JOIN users u ON a.user_id = u.id
          WHERE 
            a.title LIKE ? OR 
            a.category LIKE ? OR 
            a.subcategory LIKE ? OR 
            a.location LIKE ? OR
            a.description LIKE ?
          ORDER BY a.created_at DESC
          LIMIT ${type === "all" ? 3 : 10}
        `,
          [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`],
        )


        if (Array.isArray(adResults)) {
          results.ads = adResults as Ad[]
        }
      } catch (error) {
        console.error("Error fetching ads:", error)
      }
    }

    // Fetch users
    if (type === "all" || type === "users") {
      try {
        const userResults = await query(
          `
          SELECT 
            id, 
            name, 
            avatar,
            bio,
            location,
            type
          FROM users
          WHERE 
            type = 'individual' AND
            (name LIKE ? OR bio LIKE ? OR location LIKE ?)
          ORDER BY name
          LIMIT ${type === "all" ? 3 : 10}
        `,
          [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`],
        )

        if (Array.isArray(userResults)) {
          results.users = userResults as User[]
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    // Fetch companies
    if (type === "all" || type === "companies") {
      try {
        const companyResults = await query(
          `
          SELECT 
            id, 
            name, 
            avatar,
            bio,
            location,
            categories,
            type
          FROM users
          WHERE 
            type = 'business' AND
            (name LIKE ? OR bio LIKE ? OR categories LIKE ? OR location LIKE ?)
          ORDER BY name
          LIMIT ${type === "all" ? 3 : 10}
        `,
          [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`],
        )

        if (Array.isArray(companyResults)) {
          results.companies = companyResults as Company[]
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
      }
    }

    // Fetch news
    if (type === "all" || type === "news") {
      try {
        const newsResults = await query(
          `
          SELECT 
            id, 
            content,
            image_url as image,
            created_at,
            user_id,
            (SELECT name FROM users WHERE id = news_posts.user_id) as author_name
          FROM news_posts
          WHERE 
            content LIKE ?
          ORDER BY created_at DESC
          LIMIT ${type === "all" ? 3 : 10}
        `,
          [`%${searchQuery}%`],
        )

        if (Array.isArray(newsResults)) {
          results.news = newsResults as NewsPost[]
        }
      } catch (error) {
        console.error("Error fetching news:", error)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in search results:", error)
    return NextResponse.json(
      {
        error: "Failed to perform search",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
