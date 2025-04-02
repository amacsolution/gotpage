import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const includeComments = searchParams.get("includeComments") === "true"

    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Query posts with pagination
    const posts = await db.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pollOptions: true,
        votes: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
        likes: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
        ...(includeComments && {
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        }),
      },
    })

    // Get total count for pagination
    const totalPosts = await db.post.count()
    const totalPages = Math.ceil(totalPosts / limit)

    // Format posts for response
    const formattedPosts = posts.map((post) => {
      const userVote = post.votes && post.votes.length > 0 ? post.votes[0].pollOptionId : null
      const isLiked = post.likes && post.likes.length > 0

      // Calculate total votes if it's a poll
      let pollTotalVotes = 0
      if (post.isPoll && post.pollOptions) {
        pollTotalVotes = post.pollOptions.reduce((sum, option) => sum + option.votes, 0)
      }

      // Format comments if included
      const commentsList =
        includeComments && post.comments
          ? post.comments.map((comment) => ({
              id: comment.id,
              authorId: comment.author.id,
              authorName: comment.author.name,
              authorAvatar: comment.author.image,
              content: comment.content,
              createdAt: comment.createdAt,
            }))
          : []

      return {
        id: post.id,
        author: {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.image,
        },
        content: post.content,
        isPoll: post.isPoll,
        pollQuestion: post.pollQuestion,
        pollOptions: post.isPoll
          ? post.pollOptions.map((option) => ({
              id: option.id,
              text: option.text,
              votes: option.votes,
            }))
          : [],
        pollTotalVotes,
        userVotedOption: userVote,
        image: post.image,
        pollImage: post.pollImage,
        createdAt: post.createdAt,
        likes: post.likeCount,
        comments: post.commentCount,
        commentsList,
        isLiked,
      }
    })

    return NextResponse.json({
      posts: formattedPosts,
      page,
      limit,
      totalPages,
      totalPosts,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    const { content, type = "text", imageUrl, pollOptions } = body

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

    if (type === "poll" && Array.isArray(pollOptions) && pollOptions.length >= 2) {
      sql += "?, "
    }

    sql += "NOW())"

    // Dodanie wpisu
    const result = await query(sql, params)

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
        p.type,
        p.image_url as imageUrl,
        p.poll_data as pollData,
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
      type: post.type || "text",
      imageUrl: post.imageUrl,
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

