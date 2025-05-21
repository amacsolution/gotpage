import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { auth, authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

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

    const conversation = conversations[0]

    // Get the other user's details
    const otherUserId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id

    const  users  = await query(
      `
      SELECT id, name, email, avatar as profile_image, 
      (
        SELECT MAX(last_activity) FROM user_sessions WHERE user_id = users.id
      ) as last_seen
      FROM users
      WHERE id = ?
    `,
      [otherUserId],
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]
    const now = new Date()
    const lastSeen = user.last_seen ? new Date(user.last_seen) : null
    const isOnline = lastSeen && now.getTime() - lastSeen.getTime() < 5 * 60 * 1000 // 5 minutes

    // Get messages for this conversation
    let messagesQuery = `
      SELECT 
        id,
        sender_id,
        receiver_id,
        content,
        image_url,
        is_read,
        created_at
      FROM messages
      WHERE conversation_id = ?
    `

    const queryParams = [conversationId]

    // If lastMessageTimestamp is provided, only get messages after that timestamp
    if (lastMessageTimestamp) {
      messagesQuery += ` AND created_at > ?`
      queryParams.push(lastMessageTimestamp)
    }

    messagesQuery += ` ORDER BY created_at ASC`

    const messagesData  = await query(messagesQuery, queryParams) as any[]

    const messages = messagesData.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      imageUrl: msg.image_url,
      timestamp: msg.created_at,
      isMine: msg.sender_id === userId,
      isRead: msg.is_read,
    }))

    // If we're only fetching new messages, return a different structure
    if (lastMessageTimestamp) {
      return NextResponse.json({
        newMessages: messages,
        userStatus: {
          isOnline,
          lastSeen: formatLastSeen(user.last_seen),
        },
      })
    }

    // Otherwise return the full conversation data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        avatar: user.profile_image || undefined,
        isOnline,
        lastSeen: formatLastSeen(user.last_seen),
      },
      messages,
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function formatLastSeen(timestamp: string | null) {
  if (!timestamp) return "Nigdy"

  // Parse timestamp as UTC and convert to Poland time (Europe/Warsaw)
  const utcDate = new Date(timestamp + "Z")
  // Get Poland time now
  const now = new Date()
  const polandNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }))
  const polandDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }))

  const diffMinutes = Math.floor((polandNow.getTime() - polandDate.getTime()) / (1000 * 60))

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
    return polandDate.toLocaleDateString("pl-PL")
  }
}
