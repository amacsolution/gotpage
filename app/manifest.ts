import type { MetadataRoute } from "next"
import { SiteConfig } from "@/config/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SiteConfig.name,
    short_name: SiteConfig.name,
    description: SiteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0284c7",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
