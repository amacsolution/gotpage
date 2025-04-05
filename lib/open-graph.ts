import fetch from "node-fetch"
import { load } from "cheerio"

export async function fetchOpenGraphData(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 5000, // 5 second timeout
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = load(html)

    // Extract Open Graph metadata
    const ogData = {
      url: url,
      title: $('meta[property="og:title"]').attr("content") || $("title").text() || new URL(url).hostname,
      description:
        $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "",
      image: $('meta[property="og:image"]').attr("content") || $('meta[property="og:image:url"]').attr("content") || "",
      siteName: $('meta[property="og:site_name"]').attr("content") || new URL(url).hostname.replace("www.", ""),
    }

    return ogData
  } catch (error) {
    console.error(`Error fetching Open Graph data for ${url}:`, error)
    // Return basic fallback data
    try {
      const hostname = new URL(url).hostname.replace("www.", "")
      return {
        url: url,
        title: hostname,
        siteName: hostname,
      }
    } catch (e) {
      // If URL parsing fails, return even more basic data
      return {
        url: url,
        title: url,
        siteName: "Website",
      }
    }
  }
}

