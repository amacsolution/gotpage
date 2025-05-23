import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const userId = session.id
    const { receiverId: otherUserId } = await request.json()

    if (!otherUserId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Check if user exists
    const users = await query(
      `
      SELECT id FROM users WHERE id = ?
    `,
      [otherUserId],
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if conversation already exists
    const existingConversations = await query(
      `
      SELECT id FROM conversations
      WHERE 
        (user1_id = ? AND user2_id = ?) OR
        (user1_id = ? AND user2_id = ?)
    `,
      [userId, otherUserId, otherUserId, userId],
    ) as any[]

    if (existingConversations.length > 0) {
      return NextResponse.json({
        conversationId: existingConversations[0].id,
      })
    }

    // Create new conversation with UUID
    const conversationId = uuidv4()

    await query(
      `
      INSERT INTO conversations (id, user1_id, user2_id)
      VALUES (?, ?, ?)
    `,
      [conversationId, userId, otherUserId],
    )

    return NextResponse.json({
      conversationId,
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
