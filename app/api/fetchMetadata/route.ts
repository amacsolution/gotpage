import { type NextRequest, NextResponse } from "next/server"
import ogs from "open-graph-scraper"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Brak URL" }, { status: 400 })
  }

  try {
    const options = {
      url,
      timeout: 10000, // 10 sekund timeout
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      onlyGetOpenGraphInfo: false, // Pobierz również inne metadane, jeśli OG nie jest dostępne
    }

    const { result, error } = await ogs(options)

    if (error) {
      console.error("OGS error:", error)
      return NextResponse.json({
        error: "Nie udało się pobrać metadanych",
        requestUrl: url,
        success: false,
      })
    }
    result.requestUrl = url
    result.success = true
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({
      error: "Nie udało się pobrać metadanych",
      requestUrl: url,
      success: false,
    })
  }
}

