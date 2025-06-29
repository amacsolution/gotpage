import type { MetadataRoute } from "next"
import { finalCategories } from "@/lib/final-categories"
import { query } from "@/lib/db"
import { UserData } from "./api/profile/route";
import { AdData } from "./api/ogloszenia/route";
import { PostProps } from "./api/news/[id]/route";
import slugify from "slugify";

const baseUrl = "https://gotpage.pl"

const allLocations = [
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
  "Toruń",
  "Kielce",
  "Rzeszów",
  "Gliwice",
  "Zabrze",
  "Olsztyn",
  "Bielsko-Biała",
  "Bytom",
  "Zielona Góra",
  "Rybnik",
  "Ruda Śląska",
  "Tychy",
  "Opole",
  "Elbląg",
  "Płock",
  "Wałbrzych",
  "Włocławek",
  "Tarnów",
  "Chorzów",
  "Koszalin",
  "Kalisz",
  "Legnica",
  "Grudziądz",
  "Słupsk",
  "Jaworzno",
  "Jelenia Góra",
  "Nowy Sącz",
  "Jastrzębie-Zdrój",
  "Siedlce",
  "Mysłowice",
  "Zamość",
  "Piotrków Trybunalski",
  "Konin",
  "Inowrocław",
  "Lubin",
  "Ostrowiec Świętokrzyski",
  "Gorzów Wielkopolski",
  "Suwałki",
  "Pabianice",
  "Przemyśl",
  "Łomża",
  "Stalowa Wola"
];

const businessCategories = [
  { id: "Sklep detaliczny", name: "Sklep detaliczny", icon: "🛒", color: "bg-green-100 text-green-800" },
  { id: "Sklep internetowy", name: "Sklep internetowy", icon: "🛍️", color: "bg-blue-100 text-blue-800" },
  { id: "Supermarket", name: "Supermarket", icon: "🏬", color: "bg-red-100 text-red-800" },
  { id: "Hurtownia", name: "Hurtownia", icon: "📦", color: "bg-yellow-100 text-yellow-800" },
  { id: "Usługi", name: "Usługi", icon: "🧰", color: "bg-gray-100 text-gray-800" },
  { id: "Rozrywka", name: "Rozrywka", icon: "🎭", color: "bg-purple-100 text-purple-800" },
  { id: "Transport/Logistyka", name: "Transport/Logistyka", icon: "🚚", color: "bg-orange-100 text-orange-800" },
  { id: "Klub nocny", name: "Klub nocny", icon: "🎉", color: "bg-pink-100 text-pink-800" },
  { id: "Sanatorium", name: "Sanatorium", icon: "🏥", color: "bg-teal-100 text-teal-800" },
  { id: "Piekarnia", name: "Piekarnia", icon: "🥖", color: "bg-amber-100 text-amber-800" },
  { id: "Centrum zdrowia", name: "Centrum zdrowia", icon: "🩺", color: "bg-emerald-100 text-emerald-800" },
  { id: "Kino/Teatr", name: "Kino/Teatr", icon: "🎬", color: "bg-indigo-100 text-indigo-800" },
  { id: "Miasto", name: "Miasto", icon: "🏙️", color: "bg-lime-100 text-lime-800" },
  { id: "Strona/Portal", name: "Strona/Portal", icon: "🌐", color: "bg-sky-100 text-sky-800" },
  { id: "Obiekt/Placówka", name: "Obiekt/Placówka", icon: "🏢", color: "bg-slate-100 text-slate-800" },
  { id: "Restauracja/Bar/Kawiarnia", name: "Restauracja/Bar/Kawiarnia", icon: "🍽️", color: "bg-rose-100 text-rose-800" },
  { id: "Blog", name: "Blog", icon: "✍️", color: "bg-cyan-100 text-cyan-800" },
  { id: "Gry", name: "Gry", icon: "🎮", color: "bg-orange-100 text-orange-800" },
  { id: "Turystyka/Rekreacja", name: "Turystyka/Rekreacja", icon: "🏖️", color: "bg-green-100 text-green-800" },
  { id: "Edukacja", name: "Edukacja", icon: "📚", color: "bg-indigo-100 text-indigo-800" },
  { id: "Galeria", name: "Galeria", icon: "🖼️", color: "bg-purple-100 text-purple-800" },
  { id: "Finanse/Ubezpieczenia", name: "Finanse/Ubezpieczenia", icon: "💼", color: "bg-lime-100 text-lime-800" },
  { id: "Bank", name: "Bank", icon: "🏦", color: "bg-blue-100 text-blue-800" },
  { id: "Uroda/Zdrowie/Relaks", name: "Uroda/Zdrowie/Relaks", icon: "💆", color: "bg-pink-100 text-pink-800" },
  { id: "Nieruchomości", name: "Nieruchomości", icon: "🏠", color: "bg-yellow-100 text-yellow-800" },
  { id: "Reklama/Biznes", name: "Reklama/Biznes", icon: "📢", color: "bg-amber-100 text-amber-800" },
  { id: "Druk/Publikacje", name: "Druk/Publikacje", icon: "📰", color: "bg-slate-100 text-slate-800" },
  { id: "Salon samochodowy/Targ", name: "Salon samochodowy/Targ", icon: "🚗", color: "bg-red-100 text-red-800" },
  { id: "Noclegi", name: "Noclegi", icon: "🛏️", color: "bg-rose-100 text-rose-800" },
  { id: "Kasyno", name: "Kasyno", icon: "🎰", color: "bg-purple-100 text-purple-800" },
  { id: "Fundacja", name: "Fundacja", icon: "🤝", color: "bg-emerald-100 text-emerald-800" },
  { id: "Telekomunikacja/Internet", name: "Telekomunikacja/Internet", icon: "📡", color: "bg-cyan-100 text-cyan-800" },
  { id: "Fan Klub", name: "Fan Klub", icon: "⭐", color: "bg-yellow-100 text-yellow-800" },
  { id: "Organizacja", name: "Organizacja", icon: "🏛️", color: "bg-indigo-100 text-indigo-800" },
  { id: "Instytucja/Urząd", name: "Instytucja/Urząd", icon: "🏢", color: "bg-gray-100 text-gray-800" },
  { id: "Znana osoba", name: "Znana osoba", icon: "🌟", color: "bg-pink-100 text-pink-800" },
];

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  const allBusinesses = (await query('SELECT id FROM `users` WHERE type = "business"')) as UserData[]
  const users = (await query(`SELECT id FROM users`)) as UserData[]
  const allPosts = (await query(`SELECT id, title,  created_at FROM ads`)) as AdData[]
  const allNews = (await query("SELECT id FROM news_posts")) as PostProps[]

  const posts = allPosts.map(post => ({
    url: `${baseUrl}/ogloszenia/${post.id}-${slugify(post.title, { lower: true, strict: true })}`,
    lastModified: post.created_at,
    changeFrequency: "monthly" as const,
    priority: 1,
  }))

  const usersArray = users?.map((user) => ({
    url: `${baseUrl}/profil/${user?.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }))

  const userUrls = usersArray;

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
    priority: 1,
  }))

  const staticUrls = [
    '/', '/ogloszenia', '/firmy', '/kontakt', '/o-serwisie', '/pomoc', '/bezpieczenstwo', '/regulamin', '/polityka-prywatnosci', '/polityka-cookies', '/rodo', '/jak-to-dziala', '/aktualnosci', '/promowanie', '/promowanie/ogloszenia', '/promowanie/firma', '/ogloszenia/dodaj', '/ogloszenia/promuj-pakiet'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }))

  const firmCategoryUrl = businessCategories.map((category: { name: string }) => ({
    url: `${baseUrl}/firmy/szukaj/${encodeURIComponent(category.name)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }))

  const businessCityCategoryUrls = businessCategories.flatMap((category: { name: string }) =>
    allLocations.map((city: string) => ({
      url: `${baseUrl}/firmy/szukaj/${encodeURIComponent(category.name)}?location=${encodeURIComponent(city)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 1,
    })),
  )

  const businessCityUrls = allLocations.map((city: string) => ({
    url: `${baseUrl}/firmy/miasto/${encodeURIComponent(city)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }))

  const cityUrls = allLocations.map((city: string) => ({
    url: `${baseUrl}/ogloszenia/miasto/${encodeURIComponent(city)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }))

  // Generate URLs for main categories
  const categoryUrls = finalCategories.map(
    (category: { name: string, subcategory?: { name: string, finalcategory?: string } }) => ({
      url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 1,
    })
  )

  // Generate URLs for subcategories
  const subcategoryUrls = finalCategories.flatMap((category) =>
    (category.subcategories ?? []).map(
      (subcategory) => ({
        url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}/${encodeURIComponent(subcategory.name)}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 1,
      })
    ),
  )

  // Generate URLs for subsubcategories (final categories)
  const finalCategoryUrls = finalCategories.flatMap((category: { name: string, subcategories?: { name: string, subsubcategories?: string[] }[] }) =>
    (category.subcategories ?? []).flatMap((subcategory) => {
      if (subcategory.subsubcategories) {
        return subcategory.subsubcategories.map(
          (finalCat) => ({
            url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}/${encodeURIComponent(subcategory.name)}/${encodeURIComponent(finalCat)}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly" as const,
            priority: 1,
          })
        )
      }
      return []
    }),
  )

  const cityCategoryUrls = finalCategories.flatMap((category: { name: string, subcategories?: { name: string, subsubcategories?: string[] }[] }) =>
    allLocations.map(
      (city) => ({
        url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}?location=${encodeURIComponent(city)}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 1,
      })
    ),
  )

  // Add city + subcategory combinations
  const citySubcategoryUrls = finalCategories.flatMap((category: { name: string, subcategories?: { name: string, subsubcategories?: string[] }[] }) =>
    (category.subcategories ?? []).flatMap((subcategory) =>
      allLocations.map(
        (city) => ({
          url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}/${encodeURIComponent(subcategory.name)}?location=${encodeURIComponent(city)}`,
          lastModified: new Date().toISOString(),
          changeFrequency: "weekly" as const,
          priority: 1,
        })
      ),
    ),
  )

  // Add city + final category combinations
  const cityFinalCategoryUrls = finalCategories.flatMap((category: { name: string, subcategories?: { name: string, subsubcategories?: string[] }[] }) =>
    (category.subcategories ?? []).flatMap((subcategory) => {
      if (subcategory.subsubcategories) {
        return subcategory.subsubcategories.flatMap((finalCat) =>
          allLocations.map(
            (city) => ({
              url: `${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(category.name)}/${encodeURIComponent(subcategory.name)}/${encodeURIComponent(finalCat)}?location=${encodeURIComponent(city)}`,
              lastModified: new Date().toISOString(),
              changeFrequency: "weekly" as const,
              priority: 1,
            })
          ),
        )
      }
      return []
    }),
  )

  // Escape ampersands in URLs for valid XML
  function escapeUrl(url: string) {
    return url.replace(/&/g, '&amp;');
  }

  const sitemapItems = [
    ...staticUrls,
    ...(userUrls || []),
    ...categoryUrls,
    ...subcategoryUrls,
    ...finalCategoryUrls,
    ...cityUrls,
    ...cityCategoryUrls,
    ...citySubcategoryUrls,
    ...cityFinalCategoryUrls,
    ...firmCategoryUrl,
    ...businessCityCategoryUrls,
    ...businessCityUrls,
    ...newsUrls,
    ...posts,
    ...businesses,
  ]
    .filter((item): item is Exclude<typeof item, undefined> => item !== undefined)
    .map((item) => ({
      ...item,
      url: escapeUrl(item.url),
    }));


  return sitemapItems;
}
