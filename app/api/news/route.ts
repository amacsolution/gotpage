import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { NewsPostProps } from "@/components/news-post"

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
    const followedOnly = searchParams.get("followedOnly") === "true"
    const offset = (page - 1) * limit

    // Sprawdzenie, czy użytkownik jest zalogowany
    const currentUser = await auth()
    const currentUserId = currentUser?.id

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
        p.type,
        p.image_url as imageUrl,
        p.image_urls as imageUrls,
        p.poll_data as pollData,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified
    `

    // Jeśli użytkownik jest zalogowany, dodajemy informację o obserwowaniu
    if (currentUserId) {
      sql += `,
        CASE 
          WHEN f.follower_id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_followed
      `
    }

    sql += `
      FROM news_posts p
      JOIN users u ON p.user_id = u.id
    `

    // Dodajemy LEFT JOIN dla obserwowanych użytkowników
    if (currentUserId) {
      sql += `
        LEFT JOIN user_follows f ON p.user_id = f.target_id AND f.follower_id = ?
      `
    }

    const params: any[] = []

    // Dodajemy parametr dla LEFT JOIN jeśli użytkownik jest zalogowany
    if (currentUserId) {
      params.push(currentUserId)
    }

    // Filtrowanie po użytkowniku, jeśli podano
    if (userId) {
      sql += " WHERE p.user_id = ?"
      params.push(userId)
    }
    // Filtrowanie tylko obserwowanych użytkowników
    else if (followedOnly && currentUserId) {
      sql += " WHERE f.follower_id = ?"
      params.push(currentUserId)
    }

    // Sortowanie - najpierw posty od obserwowanych użytkowników, potem najnowsze
    if (currentUserId && !userId && !followedOnly) {
      sql += " ORDER BY is_followed DESC, p.created_at DESC"
    } else {
      sql += " ORDER BY p.created_at DESC"
    }

    // Limit i offset
    sql += " LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Wykonanie zapytania
    const posts = await query(sql, params)

    if (!Array.isArray(posts)) {
      return NextResponse.json({ posts: [], total: 0 })
    }

    // Pobranie całkowitej liczby wpisów
    let countSql = "SELECT COUNT(*) as count FROM news_posts p"
    const countParams: any[] = []

    if (userId) {
      countSql += " WHERE p.user_id = ?"
      countParams.push(userId)
    } else if (followedOnly && currentUserId) {
      countSql += " JOIN user_follows f ON p.user_id = f.target_id WHERE f.follower_id = ?"
      countParams.push(currentUserId)
    }

    const totalResult = await query(countSql, countParams) as { count: string }[]
    const total =
      Array.isArray(totalResult) && totalResult[0]?.count ? Number.parseInt(totalResult[0].count) : 0

    // Sprawdzenie, czy zalogowany użytkownik polubił wpisy
    const userLikes: Record<number, boolean> = {}

    if (currentUserId) {
      const postIds = posts.map((post: any) => post.id)
      if (postIds.length > 0) {
        const likesResult = await query(
          `SELECT post_id FROM news_likes WHERE user_id = ? AND post_id IN (${postIds.map(() => "?").join(",")})`,
          [currentUserId, ...postIds],
        ) as { post_id: number }[]

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
      isFollowed: post.is_followed === 1,
      type: post.type || "text",
      imageUrl: post.imageUrl,
      imageUrls: post.imageUrls ? JSON.parse(post.imageUrls) : null,
      pollData: post.pollData ? JSON.parse(post.pollData) : null,
      author: {
        id: post.author_id,
        name: post.author_name,
        avatar: post.author_avatar,
        type: post.author_type,
        verified: post.author_verified === 1,
      },
    })) as NewsPostProps["post"][]

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
    const { content, type = "text", imageUrl, imageUrls, pollOptions } = body

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Treść wpisu nie może być pusta" }, { status: 400 })
    }

    // Sprawdzenie, czy wpis zawiera link
    const linkUrl = extractUrl(content)
    const hasLink = !!linkUrl

    // Przygotowanie danych do zapisu
    const params: any[] = [user.id, content, hasLink, linkUrl]
    let sql = "INSERT INTO news_posts (user_id, content, has_link, link_url"

    // Dodanie typu wpisu
    sql += ", type"
    params.push(type)

    // Dodanie URL obrazka, jeśli istnieje (dla typu image lub poll)
    if ((type === "image" || type === "poll") && imageUrl) {
      sql += ", image_url"
      params.push(imageUrl)
    }

    // Dodanie tablicy URL-i obrazków, jeśli istnieje (dla typu image)
    if (type === "image" && Array.isArray(imageUrls) && imageUrls.length > 0) {
      sql += ", image_urls"
      params.push(JSON.stringify(imageUrls))
    }

    // Dodanie danych ankiety, jeśli istnieją
    if (type === "poll" && Array.isArray(pollOptions) && pollOptions.length >= 2) {
      sql += ", poll_data"
      params.push(
        JSON.stringify({
          options: pollOptions,
          votes: pollOptions.map(() => 0),
          totalVotes: 0,
        }),
      )
    }

    sql += ", created_at) VALUES (?, ?, ?, ?, ?, "

    // Dodanie placeholderów dla opcjonalnych pól
    if ((type === "image" || type === "poll") && imageUrl) {
      sql += "?, "
    }

    if (type === "image" && Array.isArray(imageUrls) && imageUrls.length > 0) {
      sql += "?, "
    }

    if (type === "poll" && Array.isArray(pollOptions) && pollOptions.length >= 2) {
      sql += "?, "
    }

    sql += "NOW())"

    // Dodanie wpisu
    const result = await query(sql, params) as {insertId: number}
    const insertId = result.insertId

    if (!insertId) {
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
        p.type,
        p.image_url as imageUrl,
        p.image_urls as imageUrls,
        p.poll_data as pollData,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar, 
        u.type as author_type, 
        u.verified as author_verified
      FROM news_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [insertId],
    ) as any[]

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
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
      type: post.type || "text",
      imageUrl: post.imageUrl,
      imageUrls: post.imageUrls ? JSON.parse(post.imageUrls) : null,
      pollData: post.pollData ? JSON.parse(post.pollData) : null,
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

// Usuwanie wpisu
export async function DELETE(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Brak ID wpisu do usunięcia" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik jest autorem wpisu
    const post = await query("SELECT user_id FROM news_posts WHERE id = ?", [postId]) as { user_id: string }[]
    if (!Array.isArray(post) || post.length === 0) {
      return NextResponse.json({ error: "Wpis nie istnieje" }, { status: 404 })
    }

    if (post[0].user_id !== user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do usunięcia tego wpisu" }, { status: 403 })
    }

    // Usunięcie wpisu
    const result = await query("DELETE FROM news_posts WHERE id = ?", [postId]) as { affectedRows: number }
    if (!result || result.affectedRows === 0) {
      throw new Error("Nie udało się usunąć wpisu")
    }

    return NextResponse.json({ message: "Wpis został usunięty" })
  } catch (error) {
    console.error("Błąd podczas usuwania wpisu:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania wpisu" }, { status: 500 })
  }
}
