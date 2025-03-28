import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

// Funkcja pomocnicza do wyodrębniania URL z tekstu
function extractUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/|www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/\S*)?/)
  if (match) {
    let url = match[0]
    if (!url.startsWith("http")) {
      url = "https://" + url
    }
    return url
  }
  return null
}

// Pobieranie wpisów aktualności
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const userId = searchParams.get("userId")
    const offset = (page - 1) * limit

    // Budowanie zapytania SQL
    let sql = `
      SELECT 
        p.id, 
        p.content, 
        p.has_link,
        p.link_url,
        p.likes, 
        p.comments,
        p.created_at as createdAt,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified
      FROM news_posts p
      JOIN users u ON p.user_id = u.id
    `

    const params: any[] = []

    // Filtrowanie po użytkowniku, jeśli podano
    if (userId) {
      sql += " WHERE p.user_id = ?"
      params.push(userId)
    }

    // Sortowanie i limit
    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Wykonanie zapytania
    const posts = await query(sql, params)

    if (!Array.isArray(posts)) {
      return NextResponse.json({ posts: [], total: 0 })
    }

    // Pobranie całkowitej liczby wpisów
    let countSql = "SELECT COUNT(*) as count FROM news_posts"
    if (userId) {
      countSql += " WHERE user_id = ?"
    }

    const totalResult = await query(countSql, userId ? [userId] : [])
    const total = Array.isArray(totalResult) && totalResult[0]?.count ? Number.parseInt(totalResult[0].count) : 0

    // Sprawdzenie, czy zalogowany użytkownik polubił wpisy
    const user = await auth(request)
    const userLikes: Record<number, boolean> = {}

    if (user) {
      const postIds = posts.map((post: any) => post.id)
      if (postIds.length > 0) {
        const likesResult = await query(
          `SELECT post_id FROM news_likes WHERE user_id = ? AND post_id IN (${postIds.map(() => "?").join(",")})`,
          [user.id, ...postIds],
        )

        if (Array.isArray(likesResult)) {
          likesResult.forEach((like: any) => {
            userLikes[like.post_id] = true
          })
        }
      }
    }

    // Formatowanie danych
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      content: post.content,
      hasLink: post.has_link === 1,
      linkUrl: post.link_url,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      isLiked: userLikes[post.id] || false,
      author: {
        id: post.author_id,
        name: post.author_name,
        avatar: post.author_avatar,
        type: post.author_type,
        verified: post.author_verified === 1,
      },
    }))

    return NextResponse.json({
      posts: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Błąd podczas pobierania wpisów aktualności:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania wpisów aktualności" }, { status: 500 })
  }
}

// Dodawanie nowego wpisu
export async function POST(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Treść wpisu nie może być pusta" }, { status: 400 })
    }

    // Sprawdzenie, czy wpis zawiera link
    const linkUrl = extractUrl(content)
    const hasLink = !!linkUrl

    // Dodanie wpisu
    const result = await query(
      "INSERT INTO news_posts (user_id, content, has_link, link_url, created_at) VALUES (?, ?, ?, ?, NOW())",
      [user.id, content, hasLink, linkUrl],
    )

    if (!result || !result.insertId) {
      throw new Error("Nie udało się dodać wpisu")
    }

    // Pobranie dodanego wpisu
    const posts = await query(
      `SELECT 
        p.id, 
        p.content, 
        p.has_link,
        p.link_url,
        p.likes, 
        p.comments,
        p.created_at as createdAt,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified
      FROM news_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [result.insertId],
    )

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Nie udało się pobrać dodanego wpisu")
    }

    const post = posts[0]

    // Formatowanie danych
    const formattedPost = {
      id: post.id,
      content: post.content,
      hasLink: post.has_link === 1,
      linkUrl: post.link_url,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      isLiked: false,
      author: {
        id: post.author_id,
        name: post.author_name,
        avatar: post.author_avatar,
        type: post.author_type,
        verified: post.author_verified === 1,
      },
    }

    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error("Błąd podczas dodawania wpisu:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania wpisu" }, { status: 500 })
  }
}

