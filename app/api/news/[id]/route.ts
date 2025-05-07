import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const postId = Number.parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID wpisu" }, { status: 400 })
    }

    // Pobranie wpisu
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
      [postId],
    )

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "Wpis nie został znaleziony" }, { status: 404 })
    }

    const post = posts[0]

    // Sprawdzenie, czy zalogowany użytkownik polubił ten wpis
    const user = await auth(request)
    let isLiked = false

    if (user) {
      const likeResult = await query("SELECT * FROM news_likes WHERE user_id = ? AND post_id = ?", [user.id, postId])
      isLiked = Array.isArray(likeResult) && likeResult.length > 0
    }

    // Formatowanie danych
    const formattedPost = {
      id: post.id,
      content: post.content,
      hasLink: post.has_link === 1,
      linkUrl: post.link_url,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      isLiked,
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
    console.error("Błąd podczas pobierania wpisu:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania wpisu" }, { status: 500 })
  }
}

