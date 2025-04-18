import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q")
    const type = searchParams.get("type") || "ads" // 'ads' or 'companies'

    if (!searchQuery || searchQuery.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    let suggestions: Array<{ text: string; category?: string; subcategory?: string; type: string; categories?: string[] }> = []

    if (type === "ads") {
      // Get ad suggestions with categories and subcategories
      const adSuggestions = await query(
        `
        SELECT 
          DISTINCT a.title as text, 
          a.category, 
          a.subcategory
        FROM ads a
        WHERE 
          a.title LIKE ? OR 
          a.description LIKE ?
        LIMIT 10
      `,
        [`%${searchQuery}%`, `%${searchQuery}%`],
      ) as { text: string; category: string; subcategory: string }[]

      if (Array.isArray(adSuggestions)) {
        suggestions = adSuggestions.map((suggestion) => ({
          text: suggestion.text,
          category: suggestion.category,
          subcategory: suggestion.subcategory,
          type: "ad",
        }))
      }

      // Add category suggestions
      const categorySuggestions = await query(
        `
        SELECT DISTINCT category as text
        FROM ads
        WHERE category LIKE ?
        LIMIT 5
      `,
        [`%${searchQuery}%`],
      ) as { text: string }[]

      if (Array.isArray(categorySuggestions)) {
        suggestions = [
          ...suggestions,
          ...categorySuggestions.map((suggestion) => ({
            text: suggestion.text,
            type: "category",
          })),
        ]
      }
    } else if (type === "companies") {
      // Get company suggestions with categories
      const companySuggestions = await query(
        `
        SELECT 
          DISTINCT u.name as text, 
          u.categories
        FROM users u
        WHERE 
          u.type = 'business' AND 
          (u.name LIKE ? OR u.bio LIKE ?)
        LIMIT 10
      `,
        [`%${searchQuery}%`, `%${searchQuery}%`],
      ) as { text: string; categories: string }[]

      if (Array.isArray(companySuggestions)) {
        suggestions = companySuggestions.map((suggestion) => {
          let categories = []
          try {
            if (suggestion.categories) {
              categories = JSON.parse(suggestion.categories)
            }
          } catch (e) {
            console.error("Error parsing categories:", e)
          }

          return {
            text: suggestion.text,
            categories: categories,
            type: "company",
          }
        })
      }

      // Add location suggestions for companies
      const locationSuggestions = await query(
        `
        SELECT DISTINCT location as text
        FROM users
        WHERE type = 'business' AND location LIKE ?
        LIMIT 5
      `,
        [`%${searchQuery}%`],
      ) as { text: string }[]

      if (Array.isArray(locationSuggestions)) {
        suggestions = [
          ...suggestions,
          ...locationSuggestions.map((suggestion) => ({
            text: suggestion.text,
            type: "location",
          })),
        ]
      }
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json({ error: "Failed to fetch search suggestions" }, { status: 500 })
  }
}

