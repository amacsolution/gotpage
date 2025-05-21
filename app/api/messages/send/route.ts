import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const conversation = participantCheck[0]
    const recipientId = conversation.user1_id === session.id ? conversation.user2_id : conversation.user1_id

    const timestamp = new Date().toISOString()

    // Wstaw wiadomość do bazy danych z UTC czasem
    await query(
      `
      INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content, image_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, false, ?)
      `,
      [messageId, conversationId, session.id, recipientId, content || "", imageUrl || null, timestamp],
    )

    // Zaktualizuj ostatnią wiadomość w konwersacji z UTC czasem
    await query(
      `
      UPDATE conversations 
      SET last_message_id = ?, updated_at = ?
      WHERE id = ?
      `,
      [messageId, timestamp, conversationId],
    )

    const activity = await query(`select * from user_sessions where user_id = ?`, [recipientId]) as { id : number, user_id: string, last_activity: string }[]

    if (activity.length > 0) {
      // Użytkownik jest aktywny, więc aktualizujemy jego ostatnią aktywność
      query(
        `
        UPDATE user_sessions 
        SET last_activity = ?
        WHERE user_id = ?
        `,
        [timestamp, session.id],
      )
    } else {
      query(
      `
      INSERT INTO user_sessions (user_id, last_activity)
      VALUES (?, ?) `
      , [session.id, timestamp]) }


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
        timestamp, // dokładnie ten sam co w bazie
      },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
