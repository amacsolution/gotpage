import { type NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { tags, secret } = await request.json()

    // Verify secret to prevent unauthorized cache invalidation
    if (secret !== process.env.CACHE_INVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Revalidate specified tags
    if (Array.isArray(tags)) {
      tags.forEach((tag: string) => revalidateTag(tag))
    }

    return NextResponse.json({
      message: "Cache invalidated successfully",
      tags,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cache invalidation error:", error)
    return NextResponse.json({ error: "Failed to invalidate cache" }, { status: 500 })
  }
}
