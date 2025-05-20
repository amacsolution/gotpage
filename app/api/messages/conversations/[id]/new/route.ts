import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversationId = params.id
    const url = new URL(request.url)
    const after = url.searchParams.get("after")

    // Sprawdź, czy użytkownik ma dostęp do konwersacji
    const conversationCheck = await query(
      `
      SELECT * FROM conversations 
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
      `,
      [conversationId, user.id, user.id],
    ) as { id: string, user1_id: string, user2_id: string }[]
 
    if (!conversationCheck.length) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Pobierz nowe wiadomości
    let messagesQuery = `
      SELECT m.id, m.conversation_id as conversationId, m.sender_id as senderId, 
             m.content, m.is_read as isRead, m.created_at as timestamp
      FROM messages m
      WHERE m.conversation_id = ?
    `
    const queryParams = [conversationId]

    // Jeśli podano timestamp, pobierz tylko nowsze wiadomości
    if (after) {
      messagesQuery += ` AND m.created_at > ?`
      queryParams.push(after)
    }

    messagesQuery += ` ORDER BY m.created_at ASC`

    const messages = await query(messagesQuery, queryParams) as any[]

    // Oznacz wiadomości jako "moje" lub "nie moje"
    const messagesWithOwnership = messages.map((message: any) => ({
      ...message,
      isMine: message.senderId === user.id,
    }))

    return NextResponse.json({ messages: messagesWithOwnership })
  } catch (error) {
    console.error("Error fetching new messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
