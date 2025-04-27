import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { UserData } from '../profile/route';
import { AdData } from '../ads/route';
import { categories } from '@/lib/ad-categories'; // zakładam że masz kategorie tutaj
import { cities } from '@/lib/cites'; // jeśli masz listę miast (np. ['Warszawa', 'Kraków'])
// Removed unused import
import { businessCategories} from "@/lib/cpmany-categories"

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://gotpage.pl';
};

const staticPages = [
  '/',
  '/ogloszenia',
  '/firmy',
  '/kontakt',
  '/o-serwisie',
  '/pomoc',
  '/bezpieczenstwo',
  '/regulamin',
  '/polityka-prywatnosci',
  '/polityka-cookies',
  '/rodo',
  '/jak-to-dziala',
  '/aktualnosci',
  '/promowanie',
  '/promowanie/ogloszenia',
  '/promowanie/firma',
  '/ogloszenia/dodaj',
  '/ogloszenia/promuj-pakiet',
];

const getSitemapXml = (ads: Array<AdData>, users: Array<UserData>, news: Array<{ id: number }>) => {
  const baseUrl = getBaseUrl();

  const staticUrls = staticPages.map(page => (
    `<url>
      <loc>${baseUrl}${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
  ));

  const adUrls = ads.map((ad) => (
    `<url>
      <loc>${baseUrl}/ogloszenia/${ad.id}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
  ));

  const userUrls = users.map((user) => (
    `<url>
      <loc>${baseUrl}/profil/${user.id}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`
  ));

  const categoryUrls = categories.map((category) => (
    `<url>
      <loc>${baseUrl}/ogloszenia?category=${encodeURIComponent(category.name)}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`
  ));

  const cityUrls = cities.map((city) => (
    `<url>
      <loc>${baseUrl}/ogloszenia?location=${encodeURIComponent(city)}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`
  ));

  const cityCategoryUrls = categories.flatMap((category) =>
    cities.map((city) => (
      `<url>
        <loc>${baseUrl}/ogloszenia?category=${encodeURIComponent(category.name)}&location=${encodeURIComponent(city)}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.4</priority>
      </url>`
    ))
  );

  const firmCategoryUrl = businessCategories.map((business) => (
    `<url>
      <loc>${baseUrl}/firmy?category=${encodeURIComponent(business)}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`
  ));
  

  const businessCityUrls = cities.map((city) => (
    `<url>
      <loc>${baseUrl}/firmy?location=${encodeURIComponent(city)}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`
  ));

  const businessCityCategoryUrls = businessCategories.flatMap((category) =>
    cities.map((city) => (
      `<url>
        <loc>${baseUrl}/firmy?category=${encodeURIComponent(category)}&location=${encodeURIComponent(city)}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.4</priority>
      </url>`
    ))
  );

  const newsUrls = news.map((post) => (
    `<url>
      <loc>${baseUrl}/aktualnosci/post/${post.id}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`
  ));

  const urls = [
    ...staticUrls,
    ...adUrls,
    ...userUrls,
    ...categoryUrls,
    ...cityUrls,
    ...cityCategoryUrls,
    ...firmCategoryUrl,
    ...businessCityCategoryUrls,
    ...businessCityUrls,
    ...newsUrls, // Added newsUrls to the array
  ].join('').replace(/&/g, '&amp;'); // <-- Dodaj tę linijkę!;

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;
};

export async function GET() {
  try {
    const ads = await query(
      `
      SELECT id, title, description, category, subcategory FROM ads
      `
    ) as AdData[];

    const users = await query(
      `
      SELECT id, name FROM users
      `
    ) as UserData[];

    const news = await query(
      `
      SELECT id From news_posts
      `
    ) as {id : number}[]

    const sitemapXml = getSitemapXml(ads, users, news);

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
    return NextResponse.json({ error: 'Failed to fetch data for sitemap' }, { status: 500 });
  }
}
