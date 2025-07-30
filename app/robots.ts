import { MetadataRoute } from "next"
import { SiteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/wiadomosci/", "/profil/*/edytuj", "/ogloszenia/*/edytuj"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
        disallow: ["/admin/", "/wiadomosci/", "/profil/*/edytuj", "/ogloszenia/*/edytuj"]
      },
    ],
    sitemap: `${SiteConfig.url}/sitemap.xml`,
  }
}