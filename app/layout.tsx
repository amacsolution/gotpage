import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"
import { UserProvider } from "@/lib/user-context"
import { initUploadsFolder } from "@/lib/init-upload"
import Head from "next/head"

// Dodaj wywołanie funkcji przed deklaracją komponentu RootLayout
// Inicjalizacja folderu na zdjęcia
initUploadsFolder()
  .then(() => console.log("Folder na zdjęcia zainicjalizowany"))
  .catch((error) => console.error("Błąd inicjalizacji folderu na zdjęcia:", error))

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
  description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
  keywords: "ogłoszenia, sprzedaż, kupno, wynajem, usługi, praca, nieruchomości, motoryzacja",
  authors: [{ name: "Antoni Maciejowski" }],
  creator: "Antoni Maciejowski",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <UserProvider>{children}</UserProvider>
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}

