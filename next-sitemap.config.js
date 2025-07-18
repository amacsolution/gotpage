module.exports = {
  siteUrl: "https://gotpage.pl",
  generateRobotsTxt: false,
  sitemapSize: 5000,
  generateIndexSitemap: true,
  exclude: ['/checkout', '/checkout/success', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/checkout', '/checkout/success', '/admin'] },
    ],
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

