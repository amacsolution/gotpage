import type { MetadataRoute } from "next"
import { finalCategories } from "@/lib/final-categories"
import { query } from "@/lib/db"
import { UserData } from "../profile/route"
import { AdData } from "../ogloszenia/route"
import { PostProps } from "../news/[id]/route"

const baseUrl = "https://gotpage.pl"

// Cache the sitemap for 1 hour to improve performance
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
let cachedSitemap: MetadataRoute.Sitemap | null = null
let lastCacheTime = 0

// Prioritize major cities to reduce URL bloat
const majorCities = [
  "Warszawa",
  "Kraków",
  "Łódź",
  "Wrocław",
  "Poznań",
  "Gdańsk",
  "Szczecin",
  "Bydgoszcz",
  "Lublin",
  "Białystok",
  "Katowice",
  "Gdynia",
  "Częstochowa",
  "Radom",
  "Sosnowiec",
]

// All cities for less important combinations
// (Removed unused allLocations variable)

// Top business categories (reduce less important ones)
const topBusinessCategories = [
  { name: "Sklep detaliczny" },
  { name: "Sklep internetowy" },
  { name: "Restauracja/Bar/Kawiarnia" },
  { name: "Usługi" },
  { name: "Nieruchomości" },
  { name: "Uroda/Zdrowie/Relaks" },
  { name: "Transport/Logistyka" },
  { name: "Edukacja" },
  { name: "Finanse/Ubezpieczenia" },
  { name: "Reklama/Biznes" },
]

async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  // Check cache first
  const now = Date.now()
  if (cachedSitemap && now - lastCacheTime < CACHE_DURATION) {
    return cachedSitemap
  }

  let allBusinesses: UserData[] = []
  let users: UserData[] = []
  let allPosts: AdData[] = []
  let allNews: PostProps[] = []

  try {
    // Only get recent/active content to reduce URL bloat
    allBusinesses = (await query(
      'SELECT id FROM `users` WHERE type = "business"',
    )) as UserData[]
    users = (await query(`SELECT id FROM users `)) as UserData[]
    allPosts = (await query(
      `SELECT id, ad_key, created_at FROM ads ORDER BY created_at DESC `,
    )) as AdData[]
    allNews = (await query(
      "SELECT id FROM news_posts ORDER BY created_at DESC",
    )) as PostProps[]
  } catch (error) {
    console.error("Database query failed:", error)
    return []
  }

  const posts = allPosts.map((post) => ({
    url: `${baseUrl}/ogloszenia/${post.id}`,
    lastModified: post.created_at,
    changeFrequency: "monthly" as const,
    priority: 0.9, // High priority for actual content
  }))

  const usersArray = users?.map((user) => ({
    url: `${baseUrl}/profil/${user?.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }))

  const businesses = allBusinesses.map((business) => ({
    url: `${baseUrl}/firma/${business.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }))

  const newsUrls = allNews.map((newsItem) => ({
    url: `${baseUrl}/aktualnosci/${newsItem.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const staticUrls = [
    "/",
    "/ogloszenia",
    "/firmy",
    "/kontakt",
    "/o-serwisie",
    "/pomoc",
    "/bezpieczenstwo",
    "/regulamin",
    "/polityka-prywatnosci",
    "/polityka-cookies",
    "/rodo",
    "/jak-to-dziala",
    "/aktualnosci",
    "/promowanie",
    "/promowanie/ogloszenia",
    "/promowanie/firma",
    "/ogloszenia/dodaj",
    "/ogloszenia/promuj-pakiet",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.8, // High priority for main pages
  }))

  // Main categories - high priority
  const categoryUrls = finalCategories.map((category) => ({
    url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }))

  // Subcategories - medium priority
  const subcategoryUrls = finalCategories.flatMap((category) =>
    (category.subcategories ?? []).map((subcategory) => ({
      url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}/${encodeURIComponent(subcategory.name)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  )

  // Final categories - lower priority
  const finalCategoryUrls = finalCategories.flatMap((category : {name : string, subcategories? : {name:string , subsubcategories? : string[]}[]}) =>
    (category.subcategories ?? []).flatMap((subcategory) => {
      if (subcategory.subsubcategories) {
        return subcategory.subsubcategories.map((finalCat) => ({
          url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}/${encodeURIComponent(subcategory.name)}/${encodeURIComponent(finalCat)}`,
          lastModified: new Date().toISOString(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
      }
      return []
    }),
  )

  // Major cities only for main categories
  const majorCityUrls = majorCities.map((city) => ({
    url: `${baseUrl}/ogloszenia/miasto/${encodeURIComponent(city)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Category + major city combinations only
  const cityCategoryUrls = finalCategories.flatMap((category) =>
    majorCities.map((city) => ({
      url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}?location=${encodeURIComponent(city)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  )

  // Business categories - reduced set
  const firmCategoryUrl = topBusinessCategories.map((category) => ({
    url: `${baseUrl}/firmy/szukaj/${encodeURIComponent(category.name)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }))

  // Business cities - major cities only
  const businessCityUrls = majorCities.map((city) => ({
    url: `${baseUrl}/firmy/miasto/${encodeURIComponent(city)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  function escapeUrl(url: string) {
    return url.replace(/&/g, "&amp;")
  }

  const sitemapItems = [
    ...staticUrls,
    ...(usersArray || []),
    ...categoryUrls,
    ...subcategoryUrls,
    ...finalCategoryUrls,
    ...majorCityUrls,
    ...cityCategoryUrls,
    ...firmCategoryUrl,
    ...businessCityUrls,
    ...newsUrls,
    ...posts,
    ...businesses,
  ]
    .filter((item): item is Exclude<typeof item, undefined> => item !== undefined)
    .map((item) => ({
      ...item,
      url: escapeUrl(item.url),
    }))

  // Cache the result
  cachedSitemap = sitemapItems
  lastCacheTime = now

  console.log(`Sitemap generated with ${sitemapItems.length} URLs (cached for 1 hour)`)

  return sitemapItems
}

export async function GET() {
  const sitemap = await Sitemap();
  return Response.json(sitemap);
}
