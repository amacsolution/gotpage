import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { auth, authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST() {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const userId = session.id

    // Check if session exists
    const sessions= await query(
      `
      SELECT id FROM user_sessions
      WHERE user_id = ?
      LIMIT 1
    `,
      [userId],
    ) as any

    if (sessions.length > 0) {
      // Update existing session
      await query(
        `
        UPDATE user_sessions
        SET last_activity = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [sessions[0].id],
      )
    } else {
      // Create new session
      const sessionId = uuidv4()
      await query(
        `
        INSERT INTO user_sessions (id, user_id)
        VALUES (?, ?)
      `,
        [sessionId, userId],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
