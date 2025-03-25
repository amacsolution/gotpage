import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    if (!category) {
      return NextResponse.json({ subcategories: [] })
    }

    const result = await query("SELECT DISTINCT subcategory FROM ads WHERE category = ? ORDER BY subcategory ASC", [
      category,
    ]) as { subcategory: string }[]

    if (!Array.isArray(result)) {
      return NextResponse.json({ subcategories: [] })
    }

    const subcategories = result.map((item) => item.subcategory).filter(Boolean)

    return NextResponse.json({ subcategories })
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 })
  }
}

