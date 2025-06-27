import { unstable_cache } from "next/cache"

// Cache configuration constants
export const CACHE_DURATION = 172800 // 2 days in seconds
export const STALE_WHILE_REVALIDATE = 86400 // 1 day in seconds

// Cache tags for different data types
export const CACHE_TAGS = {
  ADS: "ads",
  METADATA: "metadata",
  SEARCH: "search",
  CITY: "city",
  FEATURED: "featured",
  CATEGORIES: "categories",
} as const

// Utility function to create cached API calls
export function createCachedFetch<T>(fetchFn: () => Promise<T>, cacheKey: string[], tags: string[] = []) {
  return unstable_cache(fetchFn, cacheKey, {
    revalidate: CACHE_DURATION,
    tags: [...tags, "api-cache"],
  })
}

// Cache headers for API responses
export const getCacheHeaders = () => ({
  "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
  "CDN-Cache-Control": `public, s-maxage=${CACHE_DURATION}`,
  "Vercel-CDN-Cache-Control": `public, s-maxage=${CACHE_DURATION}`,
})

// Function to invalidate cache by tags
export async function invalidateCache(tags: string[]) {
  const { revalidateTag } = await import("next/cache")
  tags.forEach((tag) => revalidateTag(tag))
}
