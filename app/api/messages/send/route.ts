import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { auth, authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const userId = session.id
    const { conversationId, content, messageId } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user is part of this conversation
    const conversations = await query(
      `
      SELECT 
        id, 
        user1_id, 
        user2_id
      FROM conversations
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `,
      [conversationId, userId, userId],
    ) as any[]

    if (conversations.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conversation = conversations[0]

    // Get the receiver ID
    const receiverId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id

    // Use provided messageId or generate a new one
    const msgId = messageId || uuidv4()

    // Insert the message
    await query(
      `
      INSERT INTO messages (
        id,
        conversation_id,
        sender_id,
        receiver_id,
        content
      )
      VALUES (?, ?, ?, ?, ?)
    `,
      [msgId, conversationId, userId, receiverId, content],
    )

    // Get the created message
    const messages = await query(
      `
      SELECT id, content, created_at
      FROM messages
      WHERE id = ?
    `,
      [msgId],
    ) as any[]

    const message = messages[0]

    // Update the conversation's last message
    await query(
      `
      UPDATE conversations
      SET 
        last_message_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [msgId, conversationId],
    )

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.created_at,
        isMine: true,
        isRead: false,
      },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
