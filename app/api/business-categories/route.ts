import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get all business categories from users table
    const result = await query(`
      SELECT categories 
      FROM users 
      WHERE type = 'business' AND categories IS NOT NULL
    `) as { categories: string }[]

    if (!Array.isArray(result)) {
      return NextResponse.json({ categories: [] })
    }

    // Extract categories from JSON arrays and flatten
    const allCategories: string[] = []

    result.forEach((item) => {
      try {
        if (item.categories) {
          const parsedCategories = JSON.parse(item.categories)
          if (Array.isArray(parsedCategories)) {
            allCategories.push(...parsedCategories)
          }
        }
      } catch (e) {
        console.error("Error parsing categories:", e)
      }
    })

    // Remove duplicates and sort
    const uniqueCategories = [...new Set(allCategories)].sort()

    return NextResponse.json({ categories: uniqueCategories })
  } catch (error) {
    console.error("Error fetching business categories:", error)
    return NextResponse.json({ error: "Failed to fetch business categories" }, { status: 500 })
  }
}

