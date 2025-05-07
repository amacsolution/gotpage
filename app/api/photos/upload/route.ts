import { type NextRequest, NextResponse } from "next/server"
import { db, query } from "@/lib/db"
import { auth } from "@/lib/auth"
import { uploadImage } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await auth()
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get("photo") as File
    const caption = formData.get("caption") as string
    const userId = formData.get("userId") as string

    // Verify that the user is uploading to their own profile
    if (authResult.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!photo) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 })
    }

    // Upload the photo
    const uploadResult = await uploadImage(photo, "photos")
    if (!uploadResult) {
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
    }

    // Save to database
    const result = await query(
      `INSERT INTO user_photos (user_id, image_url, caption) 
       VALUES (?, ?, ?) 
       RETURNING id, user_id as "userId", image_url as "imageUrl", caption, created_at as "createdAt"`,
      [userId, uploadResult, caption || null],
    ) as any[]

    // Add default values for likes and comments
    const newPhoto = {
      ...result[0],
      likes: 0,
      comments: 0,
      isLiked: false,
    }

    return NextResponse.json(newPhoto, { status: 201 })
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
