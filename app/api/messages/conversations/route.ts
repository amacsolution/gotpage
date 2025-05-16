import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { auth, authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.id

    // Get all conversations for the user
    const  conversationsData  = await query(
      `
      SELECT 
        c.id,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        c.updated_at,
        m.content as last_message,
        m.created_at as last_message_time,
        (
          SELECT COUNT(*) FROM messages 
          WHERE 
            (conversation_id = c.id AND receiver_id = ? AND is_read = FALSE)
        ) as unread_count
      FROM conversations c
      LEFT JOIN messages m ON m.id = c.last_message_id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.updated_at DESC
    `,
      [userId, userId, userId, userId],
    ) as any[]

    // Get user details for each conversation
    const conversations = await Promise.all(
      conversationsData.map(async (conv: any) => {
        const users = await query(
          `
          SELECT id, name, email, avatar
          FROM users
          WHERE id = ?
        `,
          [conv.other_user_id],
        ) as any[]

        const user = users[0]

        return {
          id: conv.id,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar || undefined,
          },
          lastMessage: conv.last_message || "Rozpocznij konwersację",
          timestamp: formatTimestamp(conv.last_message_time),
          unread: conv.unread_count,
        }
      }),
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) return ""

  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (diffDays === 1) {
    return "Wczoraj"
  } else if (diffDays < 7) {
    const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"]
    return days[date.getDay()]
  } else {
    return date.toLocaleDateString()
  }
}
