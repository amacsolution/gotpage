import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const userId = session.id
    const conversationId = params.id

    // Check if user is part of this conversation
    const conversations = await query(
      `
      SELECT id FROM conversations
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `,
      [conversationId, userId, userId],
    ) as any[]

    if (conversations.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Mark all messages as read
    await query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE 
        conversation_id = ? AND 
        receiver_id = ? AND
        is_read = FALSE
    `,
      [conversationId, userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
