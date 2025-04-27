module.exports = {
    siteUrl: getBaseUrl(),
    generateRobotsTxt: true,
    sitemapSize: 5000,
    generateIndexSitemap: false,
    exclude: ['/checkout', '/checkout/success', '/admin/*'],
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/' },
        { userAgent: '*', disallow: ['/checkout', '/checkout/success', '/admin'] },
      ],
    },
    additionalPaths: async (config) => {
      // Teraz korzystamy z dynamicznego endpointu do generowania sitemap
      const response = await fetch(`https://gotpage.pl/api/sitemap`);
      const sitemap = await response.text();
  
      // Zwracamy sitemapę w formacie XML
      return sitemap;
    },
  };
  