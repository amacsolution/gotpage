import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aktualności | Gotpage",
  description:
    "Najnowsze aktualności, wpisy i dyskusje społeczności Gotpage. Dziel się swoimi przemyśleniami i odkrywaj ciekawe treści.",
  keywords: "aktualności, wpisy, społeczność, dyskusje, linki, gotpage",
  openGraph: {
    title: "Aktualności | Gotpage",
    description:
      "Najnowsze aktualności, wpisy i dyskusje społeczności Gotpage. Dziel się swoimi przemyśleniami i odkrywaj ciekawe treści.",
    type: "website",
    locale: "pl_PL",
    siteName: "Gotpage",
  },
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

