import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const user = await auth(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, content } = await req.json()

    if (!postId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if post exists
    const postResult = await query("SELECT id FROM news_posts WHERE id = ?", [postId]) as {id: number}[]

    if (!postResult || postResult.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Create comment
    const result = await query(
      "INSERT INTO news_comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [postId, user.id, content],
    ) as {insertId: number}

    if (!result || !result.insertId) {
      throw new Error("Failed to create comment")
    }

    // Update post comment count
    await query("UPDATE news_posts SET comments = comments + 1 WHERE id = ?", [postId])

    // Get the created comment with author info
    const commentResult = await query(
      `SELECT 
        c.id,
        c.content,
        c.created_at as createdAt,
        u.id as authorId,
        u.name as authorName,
        u.avatar as authorAvatar
      FROM news_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.insertId],
    ) as any[]

    if (!commentResult || commentResult.length === 0) {
      throw new Error("Failed to retrieve created comment")
    }

    const comment = commentResult[0]

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.authorId,
        name: comment.authorName,
        avatar: comment.authorAvatar,
      },
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

