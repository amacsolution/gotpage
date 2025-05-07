import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

// Dodaj funkcję do wykrywania linków (na początku pliku, po importach)
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

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const postId = Number.parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID wpisu" }, { status: 400 })
    }

    // Pobranie komentarzy do wpisu
    const comments = await query(
      `SELECT 
  c.id, 
  c.content, 
  c.has_link,
  c.link_url,
  c.created_at,
  u.id as author_id, 
  u.name as author_name, 
  u.avatar as author_avatar
FROM news_comments c
JOIN users u ON c.user_id = u.id
WHERE c.post_id = ?
ORDER BY c.created_at DESC`,
      [postId],
    )

    if (!Array.isArray(comments)) {
      return NextResponse.json([])
    }

    // Formatowanie danych
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      hasLink: comment.has_link === 1,
      linkUrl: comment.link_url,
      createdAt: comment.created_at,
      author: {
        id: comment.author_id,
        name: comment.author_name,
        avatar: comment.author_avatar,
      },
    }))

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error("Błąd podczas pobierania komentarzy:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania komentarzy" }, { status: 500 })
  }
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const postId = Number.parseInt(await params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID wpisu" }, { status: 400 })
    }

    // Sprawdzenie, czy wpis istnieje
    const postExists = await query("SELECT id FROM news_posts WHERE id = ?", [postId])
    if (!Array.isArray(postExists) || postExists.length === 0) {
      return NextResponse.json({ error: "Wpis nie istnieje" }, { status: 404 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Treść komentarza nie może być pusta" }, { status: 400 })
    }

    // Sprawdzenie, czy komentarz zawiera link
    const linkUrl = extractUrl(content)
    const hasLink = !!linkUrl

    // Dodanie komentarza
    const result = await query(
      "INSERT INTO news_comments (post_id, user_id, content, has_link, link_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [postId, user.id, content, hasLink, linkUrl],
    )

    if (!result || !result.insertId) {
      throw new Error("Nie udało się dodać komentarza")
    }

    // Aktualizacja licznika komentarzy
    await query("UPDATE news_posts SET comments = comments + 1 WHERE id = ?", [postId])

    // Pobranie dodanego komentarza
    const comments = await query(
      `SELECT 
        c.id, 
        c.content, 
        c.created_at,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar
      FROM news_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.insertId],
    )

    if (!Array.isArray(comments) || comments.length === 0) {
      throw new Error("Nie udało się pobrać dodanego komentarza")
    }

    const comment = comments[0]

    // Formatowanie danych
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      author: {
        id: comment.author_id,
        name: comment.author_name,
        avatar: comment.author_avatar,
      },
    }

    return NextResponse.json(formattedComment)
  } catch (error) {
    console.error("Błąd podczas dodawania komentarza:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania komentarza" }, { status: 500 })
  }
}

