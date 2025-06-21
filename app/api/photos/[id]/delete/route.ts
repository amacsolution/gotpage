import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import fs from "fs"
import path from "path"
import { auth } from "@/lib/auth"

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verify authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.id
    const photoId = params.id

    // Check if the photo exists and belongs to the user
    const photoResult = await query("SELECT user_id, image_url FROM user_photos WHERE id = ?", [photoId]) as any[]

    if (!photoResult.length) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    if (photoResult[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Try to delete the physical file if it's stored locally
    try {
      const imageUrl = photoResult[0].image_url
      if (imageUrl && !imageUrl.startsWith("http")) {
        // Extract the file path from the URL
        const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""))

        // Check if file exists before attempting to delete
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    } catch (fileError) {
      console.error("Error deleting photo file:", fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete related likes and comments
    await query("DELETE FROM photo_likes WHERE photo_id = ?", [photoId])
    await query("DELETE FROM photo_comments WHERE photo_id = ?", [photoId])

    // Delete the photo from the database
    await query("DELETE FROM user_photos WHERE id = ?", [photoId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
