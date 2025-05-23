import { auth } from "@/lib/auth"
import { mkdir, writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const conversationId = formData.get("conversationId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!conversationId) {
      return NextResponse.json({ error: "No conversation ID provided" }, { status: 400 })
    }

    // Sprawdź, czy użytkownik jest uczestnikiem konwersacji
    const { query } = await import("@/lib/db")
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

    // Sprawdź typ pliku (tylko obrazy)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Sprawdź rozmiar pliku (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Utwórz unikalną nazwę pliku
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Utwórz ścieżkę do zapisu pliku
    const uploadDir = path.join(process.cwd(), "public", "uploads", "messages", conversationId)

    // Upewnij się, że katalog istnieje
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating directory:", error)
    }

    const filePath = path.join(uploadDir, fileName)
    const publicPath = `/uploads/messages/${conversationId}/${fileName}`

    // Zapisz plik
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    // Zwróć URL do pliku
    return NextResponse.json({
      success: true,
      fileUrl: publicPath,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
