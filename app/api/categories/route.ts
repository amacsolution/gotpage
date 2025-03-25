import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query("SELECT DISTINCT category FROM ads ORDER BY category ASC") as { category: string }[]

    if (!Array.isArray(result)) {
      return NextResponse.json({ categories: [] })
    }

    const categories = result.map((item) => item.category).filter(Boolean)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

