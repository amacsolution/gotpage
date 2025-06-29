import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { finalCategories } from "@/lib/final-categories";
import slugify from "slugify";

const baseUrl = "https://gotpage.pl";

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

export async function GET() {
  const allBusinesses = await query('SELECT id FROM `users` WHERE type = "business"') as { id: string }[];
  const users = await query('SELECT id FROM users WHERE type = "individual"') as { id: string }[];
  const allPosts = await query(`SELECT id, title, created_at FROM ads`) as { id: number, title: string, created_at: string }[];
  const allNews = await query("SELECT id FROM news_posts") as { id: number }[];

  const now = new Date().toISOString();

  function url(loc: string, lastmod = now, changefreq = "weekly", priority = "1.0") {
    return `<url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  }

  function escapeXml(str: string) {
    return str.replace(/&/g, '&amp;');
  }

  const urls: string[] = [];

  // Statyczne
  const staticRoutes = [
    "/", "/ogloszenia", "/firmy", "/kontakt", "/o-serwisie", "/pomoc", "/bezpieczenstwo", "/regulamin",
    "/polityka-prywatnosci", "/polityka-cookies", "/rodo", "/jak-to-dziala", "/aktualnosci",
    "/promowanie", "/promowanie/ogloszenia", "/promowanie/firma", "/ogloszenia/dodaj", "/ogloszenia/promuj-pakiet"
  ];
  urls.push(...staticRoutes.map(r => url(`${baseUrl}${r}`, now, "yearly", "0.7")));

  // Użytkownicy
  urls.push(...users.map((u: any) => url(`${baseUrl}/profil/${u.id}`, now, "yearly", "0.7")));

  // Firmy
  urls.push(...allBusinesses.map((b: any) => url(`${baseUrl}/firma/${b.id}`, now, "yearly", "0.7")));

  // Ogłoszenia
  urls.push(...allPosts.map((p: any) =>
    url(`${baseUrl}/ogloszenia/${p.id}-${slugify(p.title, { lower: true, strict: true })}`, p.created_at)));

  // Aktualności
  urls.push(...allNews.map((n: any) =>
    url(`${baseUrl}/aktualnosci/${n.id}`, now)));

  // Kategorie i miasto
  finalCategories.forEach((cat: { name: string, subcategories?: { name: string, subsubcategories?: string[] }[] }) => {
    urls.push(url(`${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(cat.name)}`));
    allLocations.forEach(city => {
      urls.push(url(`${baseUrl}/ogloszenia/miasto/${encodeURIComponent(city)}`));
      urls.push(url(`${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(cat.name)}?location=${encodeURIComponent(city)}`));

      cat.subcategories?.forEach(sub => {
        urls.push(url(`${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(cat.name)}/${encodeURIComponent(sub.name)}`));
        urls.push(url(`${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(cat.name)}/${encodeURIComponent(sub.name)}?location=${encodeURIComponent(city)}`));

        sub.subsubcategories?.forEach(finalCat => {
          urls.push(url(`${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(cat.name)}/${encodeURIComponent(sub.name)}/${encodeURIComponent(finalCat)}`));
          urls.push(url(`${baseUrl}/ogloszenia/szukaj/${encodeURIComponent(cat.name)}/${encodeURIComponent(sub.name)}/${encodeURIComponent(finalCat)}?location=${encodeURIComponent(city)}`));
        });
      });
    });
  });

  // Kategorie firm
  businessCategories.forEach(cat => {
    urls.push(url(`${baseUrl}/firmy/szukaj/${encodeURIComponent(cat.name)}`));
    allLocations.forEach(city => {
      urls.push(url(`${baseUrl}/firmy/szukaj/${encodeURIComponent(cat.name)}?location=${encodeURIComponent(city)}`));
    });
  });

  // Firmy wg miasta
  urls.push(...allLocations.map(city => url(`${baseUrl}/firmy/miasto/${encodeURIComponent(city)}`)));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
