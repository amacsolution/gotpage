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

    const postId = Number.parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator wpisu" }, { status: 400 })
    }

    const body = await request.json()
    const { optionIndex } = body

    if (optionIndex === undefined || isNaN(optionIndex)) {
      return NextResponse.json({ error: "Nieprawidłowy indeks opcji" }, { status: 400 })
    }

    // Sprawdzenie, czy wpis istnieje i jest typu poll
    const posts = await query("SELECT id, poll_data FROM news_posts WHERE id = ? AND type = 'poll'", [postId])

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "Wpis nie istnieje lub nie jest ankietą" }, { status: 404 })
    }

    const post = posts[0]
    if (!post.poll_data) {
      return NextResponse.json({ error: "Brak danych ankiety" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik już głosował
    const votes = await query("SELECT * FROM news_poll_votes WHERE post_id = ? AND user_id = ?", [postId, user.id])

    if (Array.isArray(votes) && votes.length > 0) {
      return NextResponse.json({ error: "Już oddałeś głos w tej ankiecie" }, { status: 400 })
    }

    // Parsowanie danych ankiety
    const pollData = JSON.parse(post.poll_data)

    // Sprawdzenie, czy indeks opcji jest prawidłowy
    if (optionIndex < 0 || optionIndex >= pollData.options.length) {
      return NextResponse.json({ error: "Nieprawidłowy indeks opcji" }, { status: 400 })
    }

    // Aktualizacja głosów
    pollData.votes[optionIndex] = (pollData.votes[optionIndex] || 0) + 1
    pollData.totalVotes = (pollData.totalVotes || 0) + 1

    // Zapisanie zaktualizowanych danych ankiety
    await query("UPDATE news_posts SET poll_data = ? WHERE id = ?", [JSON.stringify(pollData), postId])

    // Zapisanie głosu użytkownika
    await query("INSERT INTO news_poll_votes (post_id, user_id, option_index, created_at) VALUES (?, ?, ?, NOW())", [
      postId,
      user.id,
      optionIndex,
    ])

    return NextResponse.json({
      success: true,
      pollData: {
        ...pollData,
        userVote: optionIndex,
      },
    })
  } catch (error) {
    console.error("Błąd podczas głosowania:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas głosowania" }, { status: 500 })
  }
}

