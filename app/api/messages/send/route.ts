import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
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
    ) as {id: number, user1_id: string, user2_id: string}[]

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
    ) as {id : number, content: string, created_at: string}[]

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

    // Get sender info for the response
    const users  = await query(
      `
      SELECT name, profile_image
      FROM users
      WHERE id = ?
    `,
      [userId],
    ) as {name: string, profile_image: string}[]

    const messageResponse = {
      id: message.id,
      content: message.content,
      timestamp: message.created_at,
      isMine: true,
      isRead: false,
      sender: {
        id: userId,
        name: users[0]?.name || "Unknown",
        avatar: users[0]?.profile_image || undefined,
      },
      conversationId,
    }

    return NextResponse.json({ message: messageResponse })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
