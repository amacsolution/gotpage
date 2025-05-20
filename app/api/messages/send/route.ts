import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz dane JSON zamiast formData
    const { conversationId, content, messageId, imageUrl } = await request.json()

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 })
    }

    // Sprawdź, czy użytkownik jest uczestnikiem konwersacji
    const participantCheck = await query(
      `
      SELECT * FROM conversations 
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
      `,
      [conversationId, session.id, session.id],
    ) as any[]

    if (!participantCheck.length) {
      return NextResponse.json({ error: "You are not a participant in this conversation" }, { status: 403 })
    }

    // Pobierz ID odbiorcy
    const conversation = participantCheck[0]
    const recipientId = conversation.user1_id === session.id ? conversation.user2_id : conversation.user1_id

    // Wstaw wiadomość do bazy danych
    const result = await query(
      `
      INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content, image_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, false, NOW())
      `,
      [messageId, conversationId, session.id, recipientId, content || "", imageUrl || null],
    )

    // Zaktualizuj ostatnią wiadomość w konwersacji
    await query(
      `
      UPDATE conversations 
      SET last_message_id = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [messageId, conversationId],
    )

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        conversationId,
        senderId: session.id,
        recipientId,
        content: content || "",
        imageUrl: imageUrl || null,
        isRead: false,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
