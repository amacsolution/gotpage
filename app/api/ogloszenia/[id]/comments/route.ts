import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const adId = Number.parseInt(params.id)
    if (isNaN(adId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID ogłoszenia" }, { status: 400 })
    }

    // Sprawdzenie, czy ogłoszenie istnieje
    const adExists = await query("SELECT id FROM ads WHERE id = ?", [adId])

    if (!Array.isArray(adExists) || adExists.length === 0) {
      return NextResponse.json({ error: "Ogłoszenie nie istnieje" }, { status: 404 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Treść komentarza nie może być pusta" }, { status: 400 })
    }

    // Dodanie komentarza
    const result = await query(
      "INSERT INTO ad_comments (ad_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [adId, user.id, content],
    ) as {insertId: number}

    if (!result || !result.insertId) {
      throw new Error("Nie udało się dodać komentarza")
    }

    // Pobranie dodanego komentarza
    const comments = await query(
      `SELECT 
        c.id, 
        c.content, 
        c.created_at,
        u.id as author_id, 
        u.name as author_name, 
        u.avatar as author_avatar
      FROM ad_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.insertId],
    ) as {id: number, content: string, created_at: string, author_id: string, author_name: string, author_avatar: string}[]

    if (!Array.isArray(comments) || comments.length === 0) {
      throw new Error("Nie udało się pobrać dodanego komentarza")
    }

    const comment = comments[0]

    // Pobranie informacji o autorze ogłoszenia
    const adAuthor = await query("SELECT user_id FROM ads WHERE id = ?", [adId]) as {user_id: string}[]

    const isAuthor = Array.isArray(adAuthor) && adAuthor.length > 0 && adAuthor[0].user_id === user.id

    // Formatowanie danych
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: comment.author_id,
        name: comment.author_name,
        avatar: comment.author_avatar,
      },
      isAuthor,
    }

    return NextResponse.json(formattedComment)
  } catch (error) {
    console.error("Błąd podczas dodawania komentarza:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania komentarza" }, { status: 500 })
  }
}

