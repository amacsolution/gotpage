module.exports = {
  siteUrl: "https://gotpage.pl",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  generateIndexSitemap: true,
  exclude: ['/checkout', '/checkout/success', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/wiadomosci/',
          '/profil/*/edytuj',
          '/ogloszenia/*/edytuj'
        ]
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: [
          '/admin/',
          '/wiadomosci/',
          '/profil/*/edytuj',
          '/ogloszenia/*/edytuj'
        ]
      }
    ]
  },
  additionalPaths: async (config) => {
    const res = await fetch("http://localhost:3000/api/sitemap-json");
    const urls = await res.json();

    return urls.map((item) => ({
      loc: item.loc,
      lastmod: item.lastmod,
    }));
  },
};

