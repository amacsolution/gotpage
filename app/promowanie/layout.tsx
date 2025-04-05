import type React from "react"
import type { Metadata } from "next"
import "./counter-effect.css"

export const metadata: Metadata = {
  title: "Promocja | Gotpage",
  description:
    "Promuj swoje ogłoszenia i firmę na platformie Gotpage. Zwiększ widoczność i przyciągnij więcej klientów.",
  keywords: "promocja, promowanie, ogłoszenia, firmy, widoczność, marketing",
  openGraph: {
    title: "Promocja | Gotpage",
    description:
      "Promuj swoje ogłoszenia i firmę na platformie Gotpage. Zwiększ widoczność i przyciągnij więcej klientów.",
    type: "website",
    locale: "pl_PL",
    siteName: "Gotpage",
  },
}

export default function PromotionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

