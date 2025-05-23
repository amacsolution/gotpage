import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const lastMessageTimestamp = searchParams.get("after")

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.id
    const conversationId = params.id

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

    // Get messages for this conversation after the specified timestamp
    const messagesQuery = `
      SELECT 
        id,
        sender_id,
        receiver_id,
        content,
        image_url,
        is_read,
        created_at
      FROM messages
      WHERE conversation_id = ? AND created_at > ?
      ORDER BY created_at ASC
    `

    const messagesData = await query(messagesQuery, [conversationId, lastMessageTimestamp || "1970-01-01"]) as any[]

    const messages = messagesData.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      imageUrl: msg.image_url,
      timestamp: msg.created_at,
      isMine: msg.sender_id === userId,
      isRead: msg.is_read,
    }))

    // Get the other user's online status
    const conversation = conversations[0]
    const otherUserId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id

    const users = await query(
      `
      SELECT 
        (
          SELECT MAX(last_activity) FROM user_sessions WHERE user_id = ?
        ) as last_seen
      `,
      [otherUserId],
    ) as any[]

    const lastSeen = users[0]?.last_seen ? new Date(users[0].last_seen) : null
    const now = new Date()
    const isOnline = lastSeen && now.getTime() - lastSeen.getTime() < 5 * 60 * 1000 // 5 minutes

    return NextResponse.json({
      messages,
      userStatus: {
        isOnline,
        lastSeen: formatLastSeen(users[0]?.last_seen),
      },
    })
  } catch (error) {
    console.error("Error fetching new messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function formatLastSeen(timestamp: string | null) {
  if (!timestamp) return "Nigdy"

  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffMinutes < 1) {
    return "Przed chwilą"
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min temu`
  } else if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60)
    return `${hours} ${hours === 1 ? "godzinę" : hours < 5 ? "godziny" : "godzin"} temu`
  } else if (diffMinutes < 48 * 60) {
    return "Wczoraj"
  } else {
    return date.toLocaleDateString()
  }
}
