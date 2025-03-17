import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
  description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
  keywords: "ogłoszenia, sprzedaż, kupno, wynajem, usługi, praca, nieruchomości, motoryzacja",
  authors: [{ name: "Gotpage Team" }],
  creator: "Gotpage",
  publisher: "Gotpage",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gotpage.pl"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
    description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
    url: "https://gotpage.pl",
    siteName: "Gotpage",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
    description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          {children}
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}

