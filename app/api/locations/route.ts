import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get locations from both ads and users (for companies)
    const adLocations = await query("SELECT DISTINCT location FROM ads WHERE location IS NOT NULL") as { location: string }[]
    const userLocations = await query(
      "SELECT DISTINCT location FROM users WHERE location IS NOT NULL AND type = 'business'",
    ) as { location: string }[]

    if (!Array.isArray(adLocations) || !Array.isArray(userLocations)) {
      return NextResponse.json({ locations: [] })
    }

    // Combine and deduplicate locations
    const allLocations = [
      ...adLocations.map((item) => item.location),
      ...userLocations.map((item) => item.location),
    ].filter(Boolean)

    // Remove duplicates
    const uniqueLocations = [...new Set(allLocations)]

    // Sort alphabetically
    const sortedLocations = uniqueLocations.sort()

    return NextResponse.json({ locations: sortedLocations })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

